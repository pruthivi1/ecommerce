import * as payoutRepo from "../repositories/payoutRepository.js";
import { AppError } from "../utils/AppError.js";
import { notifyAdmins, notifyVendor } from "./notificationService.js";
import { withTransaction } from "../config/db.js";

const VALID_TRANSITIONS = { Pending: ["Processing", "Rejected"], Processing: ["Completed", "Rejected"] };

export async function listPayouts(filters) {
  return payoutRepo.listPayouts(filters);
}

/**
 * A vendor may request a payout up to their current available balance —
 * computed here from completed sales minus commission minus prior
 * pending/processing/completed payouts, not a client-supplied figure.
 * Protected against race conditions using a transactional row lock.
 */
export async function requestPayout(vendor, amount) {
  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0 || !Number.isFinite(numAmount)) {
    throw AppError.badRequest("Invalid payout amount.", "INVALID_AMOUNT");
  }

  const payout = await withTransaction(async (connection) => {
    // Row-level lock on vendor to prevent concurrent balance draining
    await connection.query("SELECT id FROM vendors WHERE id = :vendorId FOR UPDATE", { vendorId: vendor.id });

    const [rows] = await connection.query(
      `SELECT
         COALESCE((SELECT SUM(net_amount) FROM commission_ledger WHERE vendor_id = :vendorId), 0)
         - COALESCE((SELECT SUM(amount) FROM payouts WHERE vendor_id = :vendorId AND status IN ('Pending','Processing','Completed')), 0)
         AS available`,
      { vendorId: vendor.id }
    );
    const available = Number(rows[0]?.available ?? 0);
    if (numAmount > available) {
      throw AppError.badRequest(`Requested amount exceeds your available balance of ₹${available.toLocaleString("en-IN")}.`, "INSUFFICIENT_BALANCE");
    }
    return payoutRepo.createPayout({ vendorId: vendor.id, amount: numAmount }, connection);
  });

  await notifyAdmins({ title: "Payout requested", body: `Vendor requested a payout of ₹${numAmount.toLocaleString("en-IN")}.` });
  return payout;
}

export async function updatePayoutStatus(id, status) {
  const payout = await payoutRepo.getPayoutById(id);
  if (!payout) throw AppError.notFound("Payout not found.");
  const allowedNext = VALID_TRANSITIONS[payout.status] || [];
  if (!allowedNext.includes(status)) {
    throw AppError.badRequest(`Cannot move payout from "${payout.status}" to "${status}".`, "INVALID_STATUS_TRANSITION");
  }
  const updated = await payoutRepo.updatePayoutStatus(id, status);
  await notifyVendor(payout.vendor_id, { title: `Payout ${status.toLowerCase()}`, body: `Payout ${payout.payout_number} of ₹${Number(payout.amount).toLocaleString("en-IN")} is now ${status.toLowerCase()}.` });
  return updated;
}
