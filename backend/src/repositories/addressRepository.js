import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function listAddresses(userId) {
  return query("SELECT * FROM addresses WHERE user_id = :userId ORDER BY is_default DESC, created_at ASC", { userId });
}

export async function getAddress(userId, id) {
  const rows = await query("SELECT * FROM addresses WHERE user_id = :userId AND id = :id LIMIT 1", { userId, id });
  return rows[0] || null;
}

export async function createAddress(userId, payload) {
  const id = newId();
  const existing = await listAddresses(userId);
  const isDefault = existing.length === 0 || Boolean(payload.isDefault);
  if (isDefault) {
    await query("UPDATE addresses SET is_default = 0 WHERE user_id = :userId", { userId });
  }
  await query(
    `INSERT INTO addresses (id, user_id, label, line1, line2, city, state, pincode, phone, is_default)
     VALUES (:id, :userId, :label, :line1, :line2, :city, :state, :pincode, :phone, :isDefault)`,
    { id, userId, label: payload.label || null, line1: payload.line1, line2: payload.line2 || null, city: payload.city, state: payload.state, pincode: payload.pincode, phone: payload.phone || null, isDefault: isDefault ? 1 : 0 }
  );
  return getAddress(userId, id);
}

export async function updateAddress(userId, id, updates) {
  const sets = [];
  const params = { userId, id };
  for (const key of ["label", "line1", "line2", "city", "state", "pincode", "phone"]) {
    if (updates[key] === undefined) continue;
    sets.push(`${key} = :${key}`);
    params[key] = updates[key];
  }
  if (sets.length) {
    await query(`UPDATE addresses SET ${sets.join(", ")} WHERE user_id = :userId AND id = :id`, params);
  }
  return getAddress(userId, id);
}

export async function setDefaultAddress(userId, id) {
  await query("UPDATE addresses SET is_default = 0 WHERE user_id = :userId", { userId });
  await query("UPDATE addresses SET is_default = 1 WHERE user_id = :userId AND id = :id", { userId, id });
  return listAddresses(userId);
}

export async function removeAddress(userId, id) {
  const address = await getAddress(userId, id);
  await query("DELETE FROM addresses WHERE user_id = :userId AND id = :id", { userId, id });
  if (address?.is_default) {
    const remaining = await listAddresses(userId);
    if (remaining.length && !remaining.some((a) => a.is_default)) {
      await query("UPDATE addresses SET is_default = 1 WHERE id = :id", { id: remaining[0].id });
    }
  }
  return listAddresses(userId);
}
