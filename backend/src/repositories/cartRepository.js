import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function getOrCreateCart(userId) {
  const rows = await query("SELECT * FROM carts WHERE user_id = :userId LIMIT 1", { userId });
  if (rows[0]) return rows[0];
  const id = newId();
  await query("INSERT INTO carts (id, user_id) VALUES (:id, :userId)", { id, userId });
  return { id, user_id: userId };
}

/** Raw cart rows only — the service layer resolves live product/vendor state via productRepository, the single source of truth for pricing and availability. */
export async function getCartItems(cartId) {
  return query("SELECT * FROM cart_items WHERE cart_id = :cartId", { cartId });
}

export async function upsertCartItem(cartId, { productId, vendorId, qty, negotiatedPrice, quoteId }) {
  const existing = await query("SELECT * FROM cart_items WHERE cart_id = :cartId AND product_id = :productId LIMIT 1", { cartId, productId });
  if (existing[0]) {
    await query("UPDATE cart_items SET qty = qty + :qty WHERE id = :id", { id: existing[0].id, qty });
    return existing[0].id;
  }
  const id = newId();
  await query(
    `INSERT INTO cart_items (id, cart_id, product_id, vendor_id, qty, negotiated_price, quote_id)
     VALUES (:id, :cartId, :productId, :vendorId, :qty, :negotiatedPrice, :quoteId)`,
    { id, cartId, productId, vendorId, qty, negotiatedPrice: negotiatedPrice ?? null, quoteId: quoteId ?? null }
  );
  return id;
}

export async function updateCartItemQty(cartId, productId, qty) {
  if (qty <= 0) {
    await query("DELETE FROM cart_items WHERE cart_id = :cartId AND product_id = :productId", { cartId, productId });
    return;
  }
  await query("UPDATE cart_items SET qty = :qty WHERE cart_id = :cartId AND product_id = :productId", { cartId, productId, qty });
}

export async function removeCartItem(cartId, productId) {
  await query("DELETE FROM cart_items WHERE cart_id = :cartId AND product_id = :productId", { cartId, productId });
}

export async function clearCart(cartId) {
  await query("DELETE FROM cart_items WHERE cart_id = :cartId", { cartId });
}
