import { apiGet, apiPost, apiPatch, apiDelete } from "./apiClient.js";

export async function getAddresses() {
  return apiGet("/buyer/addresses");
}

export async function addAddress(payload) {
  return apiPost("/buyer/addresses", payload);
}

export async function setDefaultAddress(id) {
  return apiPatch(`/buyer/addresses/${id}/default`);
}

export async function removeAddress(id) {
  return apiDelete(`/buyer/addresses/${id}`);
}
