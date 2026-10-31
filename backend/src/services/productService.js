import * as productRepo from "../repositories/productRepository.js";
import { getVendorById } from "../repositories/vendorRepository.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slugify.js";
import { newId } from "../utils/id.js";
import { notifyAdmins, notifyVendor } from "./notificationService.js";

export async function listPublicProducts(filters) {
  return productRepo.listProducts({ ...filters, publicOnly: true, inStockOnly: filters.availability === "in-stock" });
}

export async function listVendorProducts(vendorId, filters = {}) {
  return productRepo.listProducts({ ...filters, vendorId });
}

export async function listAllProductsForAdmin(filters = {}) {
  return productRepo.listProducts(filters);
}

/**
 * The gate a PUBLIC product page or add-to-cart/quote action must pass
 * through: distinguishes "doesn't exist" from "exists but isn't currently
 * purchasable" so a suspended vendor's product (or a pending/rejected one)
 * can never be bought by guessing/bookmarking its direct URL, even though
 * an admin/vendor screen can still look it up via getProductForManagement.
 */
export async function getPublicProduct(id) {
  const product = await productRepo.getProductById(id);
  if (!product) return { found: false, available: false, product: null, reason: null };
  if (product.status !== "Active") {
    return { found: true, available: false, product, reason: "This product is not currently active." };
  }
  if (!product.vendor || product.vendor.status !== "Approved") {
    return { found: true, available: false, product, reason: "This supplier is not currently available." };
  }
  return { found: true, available: true, product, reason: null };
}

export async function getProductForManagement(id) {
  const product = await productRepo.getProductById(id);
  if (!product) throw AppError.notFound("Product not found.");
  return product;
}

export async function getProductBySlug(slug) {
  const product = await productRepo.getProductBySlug(slug);
  if (!product) throw AppError.notFound("Product not found.");
  return product;
}

export async function getRelatedProducts(product, limit) {
  return productRepo.getRelatedProducts(product, limit);
}

export async function createProduct(vendor, payload) {
  const id = await productRepo.createProduct({
    ...payload,
    vendorId: vendor.id,
    slug: `${slugify(payload.name)}-${newId().slice(0, 6)}`,
  });
  await notifyAdmins({ title: "Product submitted for approval", body: `${payload.name} was submitted and is awaiting review.` });
  return productRepo.getProductById(id);
}

export async function updateProduct(vendorId, productId, updates) {
  const existing = await productRepo.getProductById(productId);
  if (!existing) throw AppError.notFound("Product not found.");
  if (existing.vendorId !== vendorId) throw AppError.forbidden("You can only modify your own products.");
  return productRepo.updateProduct(productId, updates);
}

export async function setProductStatus(id, status, reason) {
  const product = await productRepo.setProductStatus(id, status, reason);
  if (!product) throw AppError.notFound("Product not found.");
  await notifyVendor(product.vendorId, {
    title: `Product ${status === "Active" ? "approved" : "rejected"}`,
    body: status === "Rejected" && reason ? `${product.name} was rejected: ${reason}` : `${product.name} is now live on the marketplace.`,
  });
  return product;
}

/**
 * A vendor pausing/resuming sale of their OWN already-approved product —
 * distinct from the admin approval workflow. Only Active<->Inactive is
 * allowed here; a vendor can never self-approve out of Pending Approval or
 * self-clear a Rejected status.
 */
export async function toggleOwnProductStatus(vendorId, productId, status) {
  if (status !== "Active" && status !== "Inactive") {
    throw AppError.badRequest("Vendors can only set a product to Active or Inactive.", "INVALID_STATUS");
  }
  const existing = await productRepo.getProductById(productId);
  if (!existing) throw AppError.notFound("Product not found.");
  if (existing.vendorId !== vendorId) throw AppError.forbidden("You can only modify your own products.");
  if (existing.status !== "Active" && existing.status !== "Inactive") {
    throw AppError.badRequest(`This product is "${existing.status}" and cannot be toggled directly.`, "INVALID_TRANSITION");
  }
  return productRepo.setProductStatus(productId, status);
}

export async function requestProductChanges(id, message) {
  const product = await productRepo.getProductById(id);
  if (!product) throw AppError.notFound("Product not found.");
  await notifyVendor(product.vendorId, {
    title: "Changes requested on your product",
    body: message ? `${product.name}: ${message}` : `The marketplace team requested changes to ${product.name}.`,
  });
  return product;
}

export async function updateStock(vendorId, productId, stock) {
  const existing = await productRepo.getProductById(productId);
  if (!existing) throw AppError.notFound("Product not found.");
  if (existing.vendorId !== vendorId) throw AppError.forbidden("You can only modify your own products.");
  return productRepo.updateStock(productId, stock);
}
