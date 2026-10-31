import { apiGet, apiPost } from "./apiClient.js";

export async function getReviewsByProduct(productId) {
  return apiGet(`/products/${productId}/reviews`);
}

export async function getReviewsByVendor(vendorId) {
  return apiGet(`/suppliers/${vendorId}/reviews`);
}

/**
 * Only a buyer who purchased the product (or, for a vendor-level review,
 * purchased anything from that vendor) may post one — enforced
 * server-side, not just hidden in the UI.
 */
export async function addReview({ productId, vendorId, rating, comment }) {
  if (productId) return apiPost(`/buyer/products/${productId}/reviews`, { rating, comment });
  return apiPost(`/buyer/suppliers/${vendorId}/reviews`, { rating, comment });
}
