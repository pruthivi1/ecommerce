import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

function mapQuote(row) {
  if (!row) return null;
  return {
    id: row.id,
    buyerId: row.buyer_id,
    productId: row.product_id,
    vendorId: row.vendor_id,
    quantity: row.quantity,
    targetPrice: row.target_price != null ? Number(row.target_price) : null,
    deliveryLocation: row.delivery_location,
    message: row.message,
    status: row.status,
    vendorResponse:
      row.response_price != null || row.response_message != null
        ? { price: row.response_price != null ? Number(row.response_price) : null, message: row.response_message, at: row.responded_at }
        : null,
    createdAt: row.created_at,
  };
}

export async function listQuotes({ buyerId, vendorId, status } = {}) {
  const clauses = [];
  const params = {};
  if (buyerId) {
    clauses.push("buyer_id = :buyerId");
    params.buyerId = buyerId;
  }
  if (vendorId) {
    clauses.push("vendor_id = :vendorId");
    params.vendorId = vendorId;
  }
  if (status) {
    clauses.push("status = :status");
    params.status = status;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await query(`SELECT * FROM quotes ${where} ORDER BY created_at DESC`, params);
  return rows.map(mapQuote);
}

export async function getQuoteById(id) {
  const rows = await query("SELECT * FROM quotes WHERE id = :id LIMIT 1", { id });
  return mapQuote(rows[0]);
}

export async function createQuote(payload) {
  const id = newId();
  await query(
    `INSERT INTO quotes (id, buyer_id, product_id, vendor_id, quantity, target_price, delivery_location, message, status)
     VALUES (:id, :buyerId, :productId, :vendorId, :quantity, :targetPrice, :deliveryLocation, :message, 'Pending')`,
    {
      id,
      buyerId: payload.buyerId,
      productId: payload.productId,
      vendorId: payload.vendorId,
      quantity: payload.quantity,
      targetPrice: payload.targetPrice ?? null,
      deliveryLocation: payload.deliveryLocation || null,
      message: payload.message || null,
    }
  );
  return getQuoteById(id);
}

export async function respondToQuote(id, { status, price, message }) {
  await query(
    "UPDATE quotes SET status = :status, response_price = :price, response_message = :message, responded_at = UTC_TIMESTAMP() WHERE id = :id",
    { id, status, price: price ?? null, message: message || null }
  );
  return getQuoteById(id);
}

export async function acceptQuote(id) {
  await query("UPDATE quotes SET status = 'Accepted' WHERE id = :id", { id });
  return getQuoteById(id);
}
