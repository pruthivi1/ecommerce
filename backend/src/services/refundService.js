import * as refundRepo from "../repositories/refundRepository.js";
import * as paymentRepo from "../repositories/paymentRepository.js";
import * as paymentService from "./paymentService.js";
import { getOrderById } from "../repositories/orderRepository.js";
import { AppError } from "../utils/AppError.js";
import { notifyAdmins, notifyBuyer } from "./notificationService.js";

export async function listRefunds(filters) {
  return refundRepo.listRefunds(filters);
}

/**
 * A refund request originates from a buyer's return request on a specific
 * vendor order — the amount is derived from that vendor order's own
 * subtotal, never accepted as a client-supplied number.
 */
export async function createRefundFromReturn(buyerId, orderId, vendorOrderId, reason) {
  const order = await getOrderById(orderId);
  if (!order || order.buyerId !== buyerId) throw AppError.notFound("Order not found.");
  const vo = order.vendorOrders.find((v) => v.id === vendorOrderId);
  if (!vo) throw AppError.notFound("Order not found.");

  const refund = await refundRepo.createRefund({ orderId, vendorOrderId, buyerId, vendorId: vo.vendorId, amount: vo.subtotal, reason });
  await notifyAdmins({ title: "Refund requested", body: `A refund of ₹${vo.subtotal.toLocaleString("en-IN")} was requested for order ${order.orderNumber}.` });
  return refund;
}

/** Same idea as createRefundFromReturn, for a cancelled (already-paid) order. */
export async function createRefundFromCancellation(buyerId, orderId, vendorOrderId, reason) {
  const order = await getOrderById(orderId);
  if (!order || order.buyerId !== buyerId) throw AppError.notFound("Order not found.");
  const vo = order.vendorOrders.find((v) => v.id === vendorOrderId);
  if (!vo) throw AppError.notFound("Order not found.");

  const refund = await refundRepo.createRefund({ orderId, vendorOrderId, buyerId, vendorId: vo.vendorId, amount: vo.subtotal, reason });
  await notifyAdmins({ title: "Refund requested", body: `A refund of ₹${vo.subtotal.toLocaleString("en-IN")} was requested for cancelled order ${order.orderNumber}.` });
  return refund;
}

export async function decideRefund(id, status) {
  const refund = await refundRepo.getRefundById(id);
  if (!refund) throw AppError.notFound("Refund not found.");
  if (refund.status !== "Pending") throw AppError.badRequest(`This refund is already ${refund.status.toLowerCase()}.`, "REFUND_LOCKED");

  let razorpayRefundId = null;
  if (status === "Approved") {
    const payment = await paymentRepo.getPaymentByOrderId(refund.order_id);
    if (payment && payment.razorpay_payment_id) {
      try {
        const rpRefund = await paymentService.refundViaRazorpay(payment.razorpay_payment_id, {
          amountRupees: Number(refund.amount),
          notes: { refundId: refund.id, orderId: refund.order_id },
        });
        razorpayRefundId = rpRefund?.id || null;
      } catch (err) {
        throw AppError.badRequest(`Payment gateway refund failed: ${err.message}`, "REFUND_GATEWAY_FAILED");
      }
    }
  }

  const updated = await refundRepo.setRefundStatus(id, status, razorpayRefundId);
  const order = await getOrderById(refund.order_id);
  await notifyBuyer(refund.buyer_id, {
    title: `Refund ${status.toLowerCase()}`,
    body: `Your refund request for order ${order?.orderNumber ?? refund.order_id} was ${status.toLowerCase()}.${razorpayRefundId ? ` (Gateway Ref: ${razorpayRefundId})` : ""}`,
  });
  return updated;
}
