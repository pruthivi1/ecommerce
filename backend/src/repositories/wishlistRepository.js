import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function getOrCreateWishlist(userId) {
  const rows = await query("SELECT * FROM wishlists WHERE user_id = :userId LIMIT 1", { userId });
  if (rows[0]) return rows[0];
  const id = newId();
  await query("INSERT INTO wishlists (id, user_id) VALUES (:id, :userId)", { id, userId });
  return { id, user_id: userId };
}

export async function getWishlistItems(wishlistId) {
  return query(
    `SELECT wi.product_id, wi.created_at AS added_at, p.name, p.price, p.unit, p.moq, p.moq_unit, p.vendor_id,
            (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image
     FROM wishlist_items wi
     JOIN products p ON p.id = wi.product_id
     WHERE wi.wishlist_id = :wishlistId`,
    { wishlistId }
  );
}

export async function addWishlistItem(wishlistId, productId) {
  const existing = await query("SELECT id FROM wishlist_items WHERE wishlist_id = :wishlistId AND product_id = :productId", { wishlistId, productId });
  if (existing[0]) return;
  await query("INSERT INTO wishlist_items (id, wishlist_id, product_id) VALUES (:id, :wishlistId, :productId)", { id: newId(), wishlistId, productId });
}

export async function removeWishlistItem(wishlistId, productId) {
  await query("DELETE FROM wishlist_items WHERE wishlist_id = :wishlistId AND product_id = :productId", { wishlistId, productId });
}
