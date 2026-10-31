import { apiGet, apiPost, apiPatch, getCurrentRole } from "./apiClient.js";

/**
 * Generic product listing, used by both public browsing pages (only see
 * Active products from Approved vendors — enforced server-side) and the
 * admin catalog screen (sees every status). Dispatches by the current
 * session's role since both call sites share this one function name.
 */
export async function getProducts(filters = {}) {
  const isAdmin = getCurrentRole() === "admin";
  return apiGet(isAdmin ? "/admin/products" : "/products", filters);
}

/** The gate a public product page must pass through — {found, available, product, reason}. */
export async function getPublicProductById(id) {
  return apiGet(`/products/${id}`);
}

/** Vendor/admin management lookup — sees the product regardless of its status. */
export async function getProductById(id) {
  const role = getCurrentRole();
  if (role === "vendor") return apiGet(`/vendor/products/${id}`);
  const result = await apiGet(`/products/${id}`);
  return result.product;
}

export async function getRelatedProducts(product, limit = 4) {
  return apiGet(`/products/${product.id}/related`, { limit });
}

export async function getProductsByVendor(vendorId) {
  const role = getCurrentRole();
  if (role === "vendor") return apiGet("/vendor/products");
  return apiGet("/products", { vendorId });
}

export async function createProduct(payload) {
  return apiPost("/vendor/products", payload);
}

export async function updateProduct(id, updates) {
  return apiPatch(`/vendor/products/${id}`, updates);
}

/** Admin approve/reject (Active/Rejected) OR a vendor pausing/resuming their own already-approved product (Active/Inactive). */
export async function setProductStatus(id, status, reason) {
  const role = getCurrentRole();
  if (role === "admin") {
    if (status === "Active") return apiPatch(`/admin/products/${id}/approve`);
    if (status === "Rejected") return apiPatch(`/admin/products/${id}/reject`, { reason });
    throw new Error(`Unsupported admin product status: ${status}`);
  }
  return apiPatch(`/vendor/products/${id}/status`, { status });
}

export async function requestProductChanges(id, message) {
  return apiPatch(`/admin/products/${id}/request-changes`, { message });
}

export async function updateStock(id, stock) {
  return apiPatch(`/vendor/products/${id}/stock`, { stock });
}
