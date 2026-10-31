import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import * as paymentService from "../services/paymentService.js";
import * as paymentRepo from "../repositories/paymentRepository.js";
import * as cartService from "../services/cartService.js";
import { env } from "../config/env.js";

/**
 * Creates a Razorpay order sized to the buyer's CURRENT cart total (server
 * recomputed, never client-supplied) so the checkout widget always charges
 * the right amount even if the client's displayed total is stale.
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const cartView = await cartService.getCartView(req.user.id);
  if (cartView.checkoutIssues.length) {
    throw AppError.badRequest("Your cart has issues that must be resolved before checkout.", "CART_INVALID", cartView.checkoutIssues);
  }
  const idempotencyKey = req.body.idempotencyKey;
  if (!idempotencyKey) throw AppError.badRequest("An idempotency key is required.", "IDEMPOTENCY_KEY_REQUIRED");

  const result = await paymentService.createRazorpayOrder({
    orderIdForReceipt: idempotencyKey,
    amountRupees: cartView.totals.total,
    idempotencyKey,
  });
  sendSuccess(res, { ...result, keyId: env.razorpay.keyId, amount: cartView.totals.total, currency: "INR" });
});

export const paymentsStatus = asyncHandler(async (_req, res) => {
  sendSuccess(res, { configured: paymentService.isPaymentsConfigured() });
});

/**
 * Razorpay webhook — mounted with express.raw() in app.js so req.body here
 * is the exact raw bytes Razorpay signed. Verifies the signature before
 * touching the payload, and is idempotent against duplicate/out-of-order
 * deliveries via the event id uniqueness check.
 */
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const valid = paymentService.verifyWebhookSignature(req.body, signature);
  if (!valid) return sendError(res, { status: 400, message: "Invalid webhook signature.", code: "INVALID_SIGNATURE" });

  const payload = JSON.parse(req.body.toString("utf8"));
  const eventId = req.headers["x-razorpay-event-id"] || payload.id;

  const alreadyProcessed = await paymentRepo.hasProcessedEvent(eventId);
  if (alreadyProcessed) return sendSuccess(res, null, { message: "Already processed." });

  const razorpayOrderId = payload.payload?.payment?.entity?.order_id;
  const payment = razorpayOrderId ? await paymentRepo.getPaymentByRazorpayOrderId(razorpayOrderId) : null;

  await paymentRepo.recordPaymentEvent({ paymentId: payment?.id, eventType: payload.event, razorpayEventId: eventId, payload });

  if (payment && payload.event === "payment.failed") {
    await paymentRepo.markPaymentFailed(payment.id);
  }

  sendSuccess(res, null, { message: "Webhook processed." });
});
