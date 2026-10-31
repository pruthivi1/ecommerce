import { apiGet, apiPost, apiPatch, getCurrentRole } from "./apiClient.js";
import * as paymentService from "./paymentService.js";
import { VENDOR_ORDER_STATUS_FLOW } from "../utils/constants.js";

export async function getOrders(filters = {}) {
  const isAdmin = getCurrentRole() === "admin";
  return apiGet(isAdmin ? "/admin/orders" : "/buyer/orders", filters);
}

export async function getOrderById(id) {
  const role = getCurrentRole();
  if (role === "admin") return apiGet(`/admin/orders/${id}`);
  if (role === "vendor") return apiGet(`/vendor/orders/${id}`);
  return apiGet(`/buyer/orders/${id}`);
}

export async function getVendorOrders(_vendorId, filters = {}) {
  return apiGet("/vendor/orders", filters);
}

export async function requestCancellation(orderId, vendorOrderId, reason) {
  return apiPost(`/buyer/orders/${orderId}/vendor-orders/${vendorOrderId}/cancel`, { reason });
}

export async function requestReturn(orderId, vendorOrderId, reason) {
  return apiPost(`/buyer/orders/${orderId}/vendor-orders/${vendorOrderId}/return`, { reason });
}

export async function updateVendorOrderStatus(orderId, vendorOrderId, status) {
  return apiPatch(`/vendor/orders/${orderId}/vendor-orders/${vendorOrderId}/status`, { status });
}

export function nextValidStatuses(currentStatus) {
  const currentIndex = VENDOR_ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === VENDOR_ORDER_STATUS_FLOW.length - 1) return [];
  return [VENDOR_ORDER_STATUS_FLOW[currentIndex + 1]];
}

/**
 * Full checkout: collects a verified Razorpay payment for the buyer's
 * current server-side cart, then places the order. The server recomputes
 * totals and re-validates the cart from scratch on both calls — nothing
 * about pricing or availability is trusted from a client-held cart
 * snapshot, and a stale cart can never become a real order.
 */
export async function createOrder({ addressId, paymentMethod }) {
  const payment = await paymentService.collectPayment();
  return apiPost("/buyer/orders", { addressId, paymentMethod, ...payment });
}
