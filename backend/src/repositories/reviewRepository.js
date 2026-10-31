import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function listReviewsByProduct(productId) {
  return query("SELECT * FROM reviews WHERE product_id = :productId ORDER BY created_at DESC", { productId });
}

export async function listReviewsByVendor(vendorId) {
  return query("SELECT * FROM reviews WHERE vendor_id = :vendorId ORDER BY created_at DESC", { vendorId });
}

export async function hasReviewedProduct(userId, productId) {
  const rows = await query("SELECT id FROM reviews WHERE user_id = :userId AND product_id = :productId LIMIT 1", { userId, productId });
  return Boolean(rows[0]);
}

/** A buyer may only review a product they have an order item for — enforced by the service layer via this check. */
export async function hasPurchasedProduct(buyerId, productId) {
  const rows = await query(
    `SELECT oi.id FROM order_items oi
     JOIN vendor_orders vo ON vo.id = oi.vendor_order_id
     JOIN orders o ON o.id = vo.order_id
     WHERE o.buyer_id = :buyerId AND oi.product_id = :productId LIMIT 1`,
    { buyerId, productId }
  );
  return Boolean(rows[0]);
}

export async function hasPurchasedFromVendor(buyerId, vendorId) {
  const rows = await query(
    `SELECT vo.id FROM vendor_orders vo
     JOIN orders o ON o.id = vo.order_id
     WHERE o.buyer_id = :buyerId AND vo.vendor_id = :vendorId LIMIT 1`,
    { buyerId, vendorId }
  );
  return Boolean(rows[0]);
}

export async function hasReviewedVendor(userId, vendorId) {
  const rows = await query("SELECT id FROM reviews WHERE user_id = :userId AND vendor_id = :vendorId AND product_id IS NULL LIMIT 1", { userId, vendorId });
  return Boolean(rows[0]);
}

export async function createReview({ productId, vendorId, userId, author, rating, comment }) {
  const id = newId();
  await query(
    "INSERT INTO reviews (id, product_id, vendor_id, user_id, author, rating, comment) VALUES (:id, :productId, :vendorId, :userId, :author, :rating, :comment)",
    { id, productId: productId || null, vendorId: vendorId || null, userId, author, rating, comment: comment || null }
  );
  const rows = await query("SELECT * FROM reviews WHERE id = :id", { id });
  return rows[0];
}
