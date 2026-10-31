import { apiGet, apiPost, apiPatch, getCurrentRole } from "./apiClient.js";

export async function getQuotes(filters = {}) {
  const isVendor = getCurrentRole() === "vendor";
  return apiGet(isVendor ? "/vendor/quotes" : "/buyer/quotes", { status: filters.status });
}

export async function createQuote(payload) {
  return apiPost("/buyer/quotes", {
    productId: payload.productId,
    quantity: payload.quantity,
    targetPrice: payload.targetPrice,
    deliveryLocation: payload.deliveryLocation,
    message: payload.message,
  });
}

/** Vendor responding to a quote addressed to their own store. */
export async function respondToQuote(id, response) {
  return apiPatch(`/vendor/quotes/${id}/respond`, response);
}

/** Buyer accepting a live counter-offer — the backend also adds the item to the buyer's cart at the negotiated price in the same transaction. */
export async function acceptQuote(id) {
  return apiPatch(`/buyer/quotes/${id}/accept`);
}
