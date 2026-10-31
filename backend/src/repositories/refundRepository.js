import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function listRefunds({ vendorId, buyerId, status } = {}) {
  const clauses = [];
  const params = {};
  if (vendorId) {
    clauses.push("vendor_id = :vendorId");
    params.vendorId = vendorId;
  }
  if (buyerId) {
    clauses.push("buyer_id = :buyerId");
    params.buyerId = buyerId;
  }
  if (status) {
    clauses.push("status = :status");
    params.status = status;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return query(`SELECT * FROM refunds ${where} ORDER BY requested_at DESC`, params);
}

export async function getRefundById(id) {
  const rows = await query("SELECT * FROM refunds WHERE id = :id LIMIT 1", { id });
  return rows[0] || null;
}

export async function getRefundByVendorOrderId(vendorOrderId) {
  const rows = await query("SELECT * FROM refunds WHERE vendor_order_id = :vendorOrderId LIMIT 1", { vendorOrderId });
  return rows[0] || null;
}

export async function createRefund({ orderId, vendorOrderId, buyerId, vendorId, amount, reason }) {
  const existing = await getRefundByVendorOrderId(vendorOrderId);
  if (existing) return existing;

  const id = newId();
  await query(
    `INSERT INTO refunds (id, order_id, vendor_order_id, buyer_id, vendor_id, amount, reason, status)
     VALUES (:id, :orderId, :vendorOrderId, :buyerId, :vendorId, :amount, :reason, 'Pending')`,
    { id, orderId, vendorOrderId, buyerId, vendorId, amount, reason: reason || null }
  );
  return getRefundById(id);
}

export async function setRefundStatus(id, status, razorpayRefundId = null) {
  await query(
    "UPDATE refunds SET status = :status, razorpay_refund_id = COALESCE(:razorpayRefundId, razorpay_refund_id), decided_at = UTC_TIMESTAMP() WHERE id = :id",
    { id, status, razorpayRefundId }
  );
  return getRefundById(id);
}
