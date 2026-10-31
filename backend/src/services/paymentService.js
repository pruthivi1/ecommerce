import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import * as paymentRepo from "../repositories/paymentRepository.js";

let razorpayClient = null;
function getClient() {
  if (!env.razorpay.configured) return null;
  if (!razorpayClient) razorpayClient = new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret });
  return razorpayClient;
}

export function isPaymentsConfigured() {
  return env.razorpay.configured;
}

/**
 * Creates a Razorpay order for the given amount (rupees) and records a
 * local `payments` row keyed to the buyer's idempotency key, so a client
 * retry after a network blip returns the SAME Razorpay order instead of
 * charging twice.
 */
export async function createRazorpayOrder({ buyerId, orderIdForReceipt, amountRupees, idempotencyKey }) {
  const client = getClient();
  if (!client) {
    throw AppError.badRequest(
      "Payments are not configured in this environment. Set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to enable checkout.",
      "PAYMENTS_NOT_CONFIGURED"
    );
  }

  const existing = idempotencyKey ? await paymentRepo.getPaymentByIdempotencyKey(idempotencyKey) : null;
  if (existing && existing.razorpay_order_id) {
    return { razorpay_order_id: existing.razorpay_order_id, amount: Number(existing.amount) };
  }

  const rpOrder = await client.orders.create({
    amount: Math.round(amountRupees * 100), // Razorpay amounts are in paise
    currency: "INR",
    receipt: orderIdForReceipt,
  });

  // Persist pending payment intent associated with the authenticated buyer
  if (idempotencyKey) {
    await paymentRepo.createInitialPaymentIntent({
      buyerId,
      razorpayOrderId: rpOrder.id,
      amount: amountRupees,
      idempotencyKey,
    });
  }

  return { razorpay_order_id: rpOrder.id, amount: amountRupees };
}

export async function fetchPaymentFromRazorpay(razorpayPaymentId) {
  const client = getClient();
  if (!client) return null;
  try {
    return await client.payments.fetch(razorpayPaymentId);
  } catch (err) {
    throw AppError.badRequest("Could not verify payment with gateway: " + (err.error?.description || err.message), "PAYMENT_GATEWAY_ERROR");
  }
}

export async function refundViaRazorpay(razorpayPaymentId, { amountRupees, notes = {} }) {
  const client = getClient();
  if (!client) {
    // If Razorpay is not configured (e.g. test environment), simulate safe audit record
    return { id: `rfnd_sim_${Date.now()}`, status: "processed", amount: Math.round(amountRupees * 100) };
  }
  return client.payments.refund(razorpayPaymentId, {
    amount: Math.round(amountRupees * 100),
    notes,
  });
}

/**
 * Verifies a Razorpay checkout callback's signature server-side using
 * HMAC-SHA256 over `${razorpayOrderId}|${razorpayPaymentId}` with the key
 * secret, per Razorpay's documented verification scheme. A frontend
 * "payment successful" screen is NEVER trusted on its own — only a
 * signature that verifies against our own secret proves the payment is
 * real.
 */
export function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!env.razorpay.configured) return false;
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpaySignature || ""));
  } catch {
    return false;
  }
}

/**
 * Verifies a Razorpay webhook's signature over the RAW request body, as
 * required by Razorpay (a re-serialized/parsed body will not match).
 * app.js mounts the webhook route with an express.raw() body parser so
 * req.body here is a Buffer.
 */
export function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!env.razorpay.webhookSecret) return false;
  const expected = crypto.createHmac("sha256", env.razorpay.webhookSecret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader || ""));
  } catch {
    return false;
  }
}
