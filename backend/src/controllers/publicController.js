import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";
import * as categoryService from "../services/categoryService.js";
import * as productService from "../services/productService.js";
import * as vendorService from "../services/vendorService.js";
import { toPublicVendor } from "../repositories/vendorRepository.js";
import * as reviewService from "../services/reviewService.js";

export const listCategories = asyncHandler(async (_req, res) => {
  sendSuccess(res, await categoryService.listCategories({ publicOnly: true }));
});

export const getCategory = asyncHandler(async (req, res) => {
  sendSuccess(res, await categoryService.getCategoryBySlug(req.params.slug));
});

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listPublicProducts(req.query);
  sendSuccess(res, result.items, { meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
});

export const getProduct = asyncHandler(async (req, res) => {
  const result = await productService.getPublicProduct(req.params.id);
  sendSuccess(res, result);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  if (product.status !== "Active" || product.vendor?.status !== "Approved") {
    throw AppError.notFound("Product not found.");
  }
  sendSuccess(res, product);
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { product } = await productService.getPublicProduct(req.params.id);
  if (!product) return sendSuccess(res, []);
  sendSuccess(res, await productService.getRelatedProducts(product, Number(req.query.limit) || 4));
});

export const getProductReviews = asyncHandler(async (req, res) => {
  sendSuccess(res, await reviewService.listReviewsByProduct(req.params.id));
});

export const listSuppliers = asyncHandler(async (req, res) => {
  const result = await vendorService.listVendors({ ...req.query, publicOnly: true, status: "Approved" });
  sendSuccess(res, result.items.map(toPublicVendor), { meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
});

export const getSupplier = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorById(req.params.id);
  if (vendor.status !== "Approved") throw AppError.notFound("Supplier not found.");
  sendSuccess(res, toPublicVendor(vendor));
});

export const getSupplierReviews = asyncHandler(async (req, res) => {
  sendSuccess(res, await reviewService.listReviewsByVendor(req.params.id));
});
