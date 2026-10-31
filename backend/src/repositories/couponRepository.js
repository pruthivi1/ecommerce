import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function listCoupons() {
  return query("SELECT * FROM coupons ORDER BY created_at DESC");
}

export async function createCoupon({ code, description, discountType, discountValue, startsAt, expiresAt }) {
  const id = newId();
  await query(
    `INSERT INTO coupons (id, code, description, discount_type, discount_value, status, starts_at, expires_at)
     VALUES (:id, :code, :description, :discountType, :discountValue, 'Active', :startsAt, :expiresAt)`,
    { id, code: code.toUpperCase(), description: description || null, discountType, discountValue, startsAt: startsAt || null, expiresAt: expiresAt || null }
  );
  const rows = await query("SELECT * FROM coupons WHERE id = :id", { id });
  return rows[0];
}

export async function updateCoupon(id, updates) {
  const sets = [];
  const params = { id };
  for (const [key, column] of Object.entries({ description: "description", status: "status", discountValue: "discount_value", expiresAt: "expires_at" })) {
    if (updates[key] === undefined) continue;
    sets.push(`${column} = :${key}`);
    params[key] = updates[key];
  }
  if (sets.length) await query(`UPDATE coupons SET ${sets.join(", ")} WHERE id = :id`, params);
  const rows = await query("SELECT * FROM coupons WHERE id = :id", { id });
  return rows[0];
}
