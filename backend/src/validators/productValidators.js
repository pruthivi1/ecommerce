import { z } from "zod";

export const productQuerySchema = z.object({
  category: z.string().optional(),
  vendorId: z.string().optional(),
  location: z.string().optional(),
  search: z.string().max(150).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minMoq: z.coerce.number().int().nonnegative().optional(),
  maxMoq: z.coerce.number().int().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  availability: z.enum(["in-stock"]).optional(),
  sort: z.enum(["price-asc", "price-desc", "rating-desc", "newest"]).optional(),
  page: z.coerce.number().int().positive().max(1000).optional(),
  pageSize: z.coerce.number().int().positive().max(60).optional(),
});

const pricingTierSchema = z.object({
  minQty: z.coerce.number().int().positive(),
  maxQty: z.coerce.number().int().positive().nullable().optional(),
  price: z.coerce.number().positive(),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  category: z.string().min(1),
  subcategory: z.string().max(120).optional(),
  sku: z.string().max(60).optional(),
  price: z.coerce.number().positive(),
  unit: z.string().max(30).default("piece"),
  moq: z.coerce.number().int().positive(),
  moqUnit: z.string().max(30).default("pieces"),
  stock: z.coerce.number().int().nonnegative(),
  location: z.string().max(100).optional(),
  specifications: z.record(z.string()).optional(),
  shippingInfo: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  bulkPricing: z.array(pricingTierSchema).max(10).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productStatusSchema = z.object({
  status: z.enum(["Active", "Rejected"]),
  reason: z.string().max(1000).optional(),
});

export const updateStockSchema = z.object({
  stock: z.coerce.number().int().nonnegative(),
});
