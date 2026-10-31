import { query, pool } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function findUserByEmail(email) {
  const rows = await query("SELECT * FROM users WHERE email = :email LIMIT 1", { email: email.toLowerCase() });
  return rows[0] || null;
}

export async function findUserById(id) {
  const rows = await query("SELECT * FROM users WHERE id = :id LIMIT 1", { id });
  return rows[0] || null;
}

export async function createUser({ role, name, email, phone, passwordHash, businessName, gstNumber, businessType }, connection = pool) {
  const id = newId();
  await connection.query(
    `INSERT INTO users (id, role, name, email, phone, password_hash, business_name, gst_number, business_type)
     VALUES (:id, :role, :name, :email, :phone, :passwordHash, :businessName, :gstNumber, :businessType)`,
    { id, role, name, email: email.toLowerCase(), phone: phone || null, passwordHash, businessName: businessName || null, gstNumber: gstNumber || null, businessType: businessType || null }
  );
  return findUserById(id);
}

export function toPublicUser(user) {
  if (!user) return null;
  const { password_hash: _hash, ...rest } = user;
  return rest;
}
