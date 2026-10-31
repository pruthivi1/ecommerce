import { apiGet, apiPost, apiPatch } from "./apiClient.js";

export async function getCategories() {
  return apiGet("/categories");
}

export async function getCategoryBySlug(slug) {
  return apiGet(`/categories/${slug}`);
}

export async function createCategory(payload) {
  return apiPost("/admin/categories", payload);
}

export async function updateCategory(id, updates) {
  return apiPatch(`/admin/categories/${id}`, updates);
}

export async function setCategoryStatus(id, status) {
  return apiPatch(`/admin/categories/${id}`, { status });
}
