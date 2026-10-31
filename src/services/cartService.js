import { apiGet, apiPost, apiPatch, apiDelete } from "./apiClient.js";

export async function getCart() {
  return apiGet("/buyer/cart");
}

export async function addItem(productId, qty) {
  return apiPost("/buyer/cart/items", { productId, qty });
}

export async function updateItemQty(productId, qty) {
  return apiPatch(`/buyer/cart/items/${productId}`, { qty });
}

export async function removeItem(productId) {
  return apiDelete(`/buyer/cart/items/${productId}`);
}

export async function clearCart() {
  return apiDelete("/buyer/cart");
}
