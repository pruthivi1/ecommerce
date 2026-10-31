import { apiGet, apiPost, apiPatch, getCurrentRole } from "./apiClient.js";

function mapPayout(r) {
  return {
    id: r.id,
    payoutNumber: r.payout_number,
    vendorId: r.vendor_id,
    amount: Number(r.amount),
    status: r.status,
    requestedDate: r.requested_date,
    processedAt: r.processed_at,
  };
}

export async function getPayouts(filters = {}) {
  const isAdmin = getCurrentRole() === "admin";
  const rows = await apiGet(isAdmin ? "/admin/payouts" : "/vendor/payouts", filters);
  return rows.map(mapPayout);
}

export async function requestPayout({ amount }) {
  return apiPost("/vendor/payouts", { amount });
}

export async function updatePayoutStatus(id, status) {
  return apiPatch(`/admin/payouts/${id}/status`, { status });
}
