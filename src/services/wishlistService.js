import { apiGet, apiPost, apiDelete } from "./apiClient.js";

export async function getWishlist() {
  return apiGet("/buyer/wishlist");
}

export async function addToWishlist(productId) {
  return apiPost("/buyer/wishlist/items", { productId });
}

export async function removeFromWishlist(productId) {
  return apiDelete(`/buyer/wishlist/items/${productId}`);
}
