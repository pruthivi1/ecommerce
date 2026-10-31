import { apiGet, apiPatch, getCurrentRole } from "./apiClient.js";

export async function getVendors(filters = {}) {
  const isAdmin = getCurrentRole() === "admin";
  const result = await apiGet(isAdmin ? "/admin/vendors" : "/suppliers", filters);
  return result;
}

export async function getVendorById(id) {
  const isAdmin = getCurrentRole() === "admin";
  return apiGet(isAdmin ? `/admin/vendors/${id}` : `/suppliers/${id}`);
}

export async function setVendorStatus(id, status, reason) {
  if (status === "Approved") return apiPatch(`/admin/vendors/${id}/approve`);
  if (status === "Rejected") return apiPatch(`/admin/vendors/${id}/reject`, { reason });
  if (status === "Suspended") return apiPatch(`/admin/vendors/${id}/suspend`, { reason });
  throw new Error(`Unsupported vendor status: ${status}`);
}

export async function requestVendorChanges(id, message) {
  return apiPatch(`/admin/vendors/${id}/request-changes`, { message });
}

/** Vendor updating their own store profile (post-registration application form, or Store Settings). */
export async function updateVendorProfile(updates) {
  return apiPatch("/vendor/me", updates);
}

export async function updateVendor(id, updates) {
  return updateVendorProfile(updates);
}

export async function getVendorEarnings() {
  return apiGet("/vendor/earnings");
}
