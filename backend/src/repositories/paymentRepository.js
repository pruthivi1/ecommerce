import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function createPayment(connection, { orderId, razorpayOrderId, amount, idempotencyKey }) {
  const id = newId();
  await connection.query(
    `INSERT INTO payments (id, order_id, razorpay_order_id, amount, status, idempotency_key)
     VALUES (:id, :orderId, :razorpayOrderId, :amount, 'Created', :idempotencyKey)`,
    { id, orderId, razorpayOrderId, amount, idempotencyKey: idempotencyKey || null }
  );
  return id;
}

export async function getPaymentByIdempotencyKey(key) {
  const rows = await query("SELECT * FROM payments WHERE idempotency_key = :key LIMIT 1", { key });
  return rows[0] || null;
}

export async function getPaymentByOrderId(orderId) {
  const rows = await query("SELECT * FROM payments WHERE order_id = :orderId LIMIT 1", { orderId });
  return rows[0] || null;
}

export async function getPaymentByRazorpayOrderId(razorpayOrderId) {
  const rows = await query("SELECT * FROM payments WHERE razorpay_order_id = :razorpayOrderId LIMIT 1", { razorpayOrderId });
  return rows[0] || null;
}

export async function markPaymentVerified(id, { razorpayPaymentId, method }) {
  await query(
    "UPDATE payments SET razorpay_payment_id = :razorpayPaymentId, method = :method, status = 'Successful' WHERE id = :id",
    { id, razorpayPaymentId, method: method || null }
  );
}

export async function markPaymentFailed(id) {
  await query("UPDATE payments SET status = 'Failed' WHERE id = :id", { id });
}

export async function recordPaymentEvent({ paymentId, eventType, razorpayEventId, payload }) {
  await query(
    "INSERT INTO payment_events (id, payment_id, event_type, razorpay_event_id, payload) VALUES (:id, :paymentId, :eventType, :razorpayEventId, :payload)",
    { id: newId(), paymentId: paymentId || null, eventType, razorpayEventId: razorpayEventId || null, payload: JSON.stringify(payload || {}) }
  );
}

export async function hasProcessedEvent(razorpayEventId) {
  if (!razorpayEventId) return false;
  const rows = await query("SELECT id FROM payment_events WHERE razorpay_event_id = :id LIMIT 1", { id: razorpayEventId });
  return Boolean(rows[0]);
}
