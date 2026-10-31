import * as payoutRepo from "../repositories/payoutRepository.js";
import { AppError } from "../utils/AppError.js";
import { notifyAdmins, notifyVendor } from "./notificationService.js";
import { query } from "../config/db.js";

const VALID_TRANSITIONS = { Pending: ["Processing", "Rejected"], Processing: ["Completed", "Rejected"] };

export async function listPayouts(filters) {
  return payoutRepo.listPayouts(filters);
}

/**
 * A vendor may request a payout up to their current available balance —
 * computed here from completed sales minus commission minus prior
 * pending/processing/completed payouts, not a client-supplied figure.
 */
export async function requestPayout(vendor, amount) {
  const [{ available }] = await query(
    `SELECT
       COALESCE((SELECT SUM(net_amount) FROM commission_ledger WHERE vendor_id = :vendorId), 0)
       - COALESCE((SELECT SUM(amount) FROM payouts WHERE vendor_id = :vendorId AND status IN ('Pending','Processing','Completed')), 0)
       AS available`,
    { vendorId: vendor.id }
  );
  if (amount > Number(available)) {
    throw AppError.badRequest(`Requested amount exceeds your available balance of ₹${Number(available).toLocaleString("en-IN")}.`, "INSUFFICIENT_BALANCE");
  }
  const payout = await payoutRepo.createPayout({ vendorId: vendor.id, amount });
  await notifyAdmins({ title: "Payout requested", body: `A vendor requested a payout of ₹${amount.toLocaleString("en-IN")}.` });
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
