import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function recordCommission(connection, { vendorOrderId, vendorId, gross, commissionRate }) {
  const commissionAmount = Math.round(gross * commissionRate);
  const netAmount = gross - commissionAmount;
  await connection.query(
    `INSERT INTO commission_ledger (id, vendor_order_id, vendor_id, gross, commission_rate, commission_amount, net_amount)
     VALUES (:id, :vendorOrderId, :vendorId, :gross, :commissionRate, :commissionAmount, :netAmount)`,
    { id: newId(), vendorOrderId, vendorId, gross, commissionRate, commissionAmount, netAmount }
  );
  return { commissionAmount, netAmount };
}

export async function listCommissions({ vendorId } = {}) {
  const where = vendorId ? "WHERE cl.vendor_id = :vendorId" : "";
  return query(
    `SELECT cl.*, vo.vendor_order_number, vo.order_id, v.name AS vendor_name
     FROM commission_ledger cl
     JOIN vendor_orders vo ON vo.id = cl.vendor_order_id
     JOIN vendors v ON v.id = cl.vendor_id
     ${where}
     ORDER BY cl.created_at DESC`,
    { vendorId }
  );
}
