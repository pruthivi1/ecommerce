import { query } from "../config/db.js";
import { newId, prefixedCode } from "../utils/id.js";

export async function listPayouts({ vendorId, status } = {}) {
  const clauses = [];
  const params = {};
  if (vendorId) {
    clauses.push("vendor_id = :vendorId");
    params.vendorId = vendorId;
  }
  if (status) {
    clauses.push("status = :status");
    params.status = status;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return query(`SELECT * FROM payouts ${where} ORDER BY requested_date DESC, created_at DESC`, params);
}

export async function getPayoutById(id) {
  const rows = await query("SELECT * FROM payouts WHERE id = :id LIMIT 1", { id });
  return rows[0] || null;
}

export async function createPayout({ vendorId, amount }) {
  const id = newId();
  const payoutNumber = prefixedCode("PO");
  await query(
    "INSERT INTO payouts (id, payout_number, vendor_id, amount, status, requested_date) VALUES (:id, :payoutNumber, :vendorId, :amount, 'Pending', CURDATE())",
    { id, payoutNumber, vendorId, amount }
  );
  return getPayoutById(id);
}

export async function updatePayoutStatus(id, status) {
  await query("UPDATE payouts SET status = :status, processed_at = IF(:status IN ('Completed','Rejected'), UTC_TIMESTAMP(), processed_at) WHERE id = :id", {
    id,
    status,
  });
  return getPayoutById(id);
}
