import * as categoryRepo from "../repositories/categoryRepository.js";
import { AppError } from "../utils/AppError.js";

export async function listCategories({ publicOnly } = {}) {
  return categoryRepo.listCategories({ statusFilter: publicOnly ? "Active" : undefined });
}

export async function getCategoryBySlug(slug) {
  const category = await categoryRepo.getCategoryBySlug(slug);
  if (!category) throw AppError.notFound("Category not found.");
  return category;
}

export async function createCategory(payload) {
  return categoryRepo.createCategory(payload);
}

export async function updateCategory(id, updates) {
  const category = await categoryRepo.updateCategory(id, updates);
  if (!category) throw AppError.notFound("Category not found.");
  return category;
}
