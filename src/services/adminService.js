import { apiGet, apiPost, apiPatch } from "./apiClient.js";

export const getDashboardStats = () => apiGet("/admin/dashboard");
export const getRecentOrders = (limit) => apiGet("/admin/dashboard/recent-orders", { limit });
export const getRecentVendorApplications = (limit) => apiGet("/admin/dashboard/recent-vendor-applications", { limit });
export const getTopProducts = (limit) => apiGet("/admin/dashboard/top-products", { limit });
export const getTopVendors = (limit) => apiGet("/admin/dashboard/top-vendors", { limit });
export const getReports = () => apiGet("/admin/reports");
export async function getPayments() {
  const rows = await apiGet("/admin/payments");
  return rows.map((p) => ({ id: p.id, orderId: p.order_id, buyerId: p.buyer_id, amount: Number(p.amount), method: p.method, status: p.status, date: p.created_at }));
}
export const getBuyers = () => apiGet("/admin/buyers");

export async function getCommissions() {
  const rows = await apiGet("/admin/commissions");
  return rows.map((r) => ({
    id: r.id,
    orderId: r.order_id,
    vendorOrderId: r.vendor_order_id,
    vendorId: r.vendor_id,
    vendorName: r.vendor_name,
    gross: Number(r.gross),
    commission: Number(r.commission_amount),
    net: Number(r.net_amount),
    date: r.created_at,
  }));
}
export async function getCommissionRate() {
  const result = await apiGet("/admin/commission-rate");
  return result.rate;
}
export async function setCommissionRate(rate) {
  const result = await apiPatch("/admin/commission-rate", { rate });
  return result.rate;
}

export const getCoupons = () => apiGet("/admin/coupons");
export const createCoupon = (payload) => apiPost("/admin/coupons", payload);
export const updateCoupon = (id, updates) => apiPatch(`/admin/coupons/${id}`, updates);

export async function getRefunds() {
  const rows = await apiGet("/admin/refunds");
  return rows.map((r) => ({
    id: r.id,
    orderId: r.order_id,
    vendorOrderId: r.vendor_order_id,
    buyerId: r.buyer_id,
    vendorId: r.vendor_id,
    amount: Number(r.amount),
    reason: r.reason,
    status: r.status,
    requestedAt: r.requested_at,
    decidedAt: r.decided_at,
  }));
}
export async function setRefundStatus(id, status) {
  if (status === "Approved") return apiPatch(`/admin/refunds/${id}/approve`);
  if (status === "Rejected") return apiPatch(`/admin/refunds/${id}/reject`);
  throw new Error(`Unsupported refund status: ${status}`);
}

// Refunds are now raised automatically by the backend when a buyer cancels
// or returns a paid order (see orderService.requestCancellation /
// requestReturn) — there is no longer a separate manual "create refund"
// action from the admin side.
export async function createRefundRequest() {
  throw new Error("Refunds are created automatically when a buyer cancels or returns an order.");
}
