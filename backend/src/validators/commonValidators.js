import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().max(100).optional(),
  line1: z.string().min(2).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().min(4).max(15),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().int().positive(),
});

export const cartItemUpdateSchema = z.object({
  qty: z.coerce.number().int().nonnegative(),
});

export const wishlistItemSchema = z.object({
  productId: z.string().min(1),
});

export const quoteCreateSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  targetPrice: z.coerce.number().positive().optional(),
  deliveryLocation: z.string().max(150).optional(),
  message: z.string().max(2000).optional(),
});

export const quoteRespondSchema = z.object({
  status: z.enum(["Counter Offer", "Accepted", "Rejected"]),
  price: z.coerce.number().positive().optional(),
  message: z.string().max(2000).optional(),
});

export const orderCreateSchema = z.object({
  addressId: z.string().min(1),
  paymentMethod: z.string().min(1),
  razorpayPaymentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  idempotencyKey: z.string().min(8).max(100),
});

export const cancelReturnSchema = z.object({
  reason: z.string().min(3).max(1000),
});

export const vendorOrderStatusSchema = z.object({
  status: z.enum(["Accepted", "Processing", "Ready to Ship", "Shipped", "Delivered"]),
});

export const reviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const payoutRequestSchema = z.object({
  amount: z.coerce.number().positive(),
});

export const payoutStatusSchema = z.object({
  status: z.enum(["Processing", "Completed", "Rejected"]),
});

export const refundStatusSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
});

export const couponCreateSchema = z.object({
  code: z.string().min(2).max(40),
  description: z.string().max(255).optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const couponUpdateSchema = z.object({
  description: z.string().max(255).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  discountValue: z.coerce.number().positive().optional(),
  expiresAt: z.string().optional(),
});

export const commissionRateSchema = z.object({
  rate: z.coerce.number().min(0).max(1),
});

export const vendorProfileUpdateSchema = z.object({
  name: z.string().max(150).optional(),
  businessName: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  about: z.string().max(2000).optional(),
  image: z.string().url().optional(),
  businessType: z.string().max(50).optional(),
  gstNumber: z.string().max(20).optional(),
  yearsExperience: z.coerce.number().int().nonnegative().optional(),
  categories: z.array(z.string()).optional(),
  address: z.object({ line1: z.string().optional(), city: z.string().optional(), state: z.string().optional(), pincode: z.string().optional() }).optional(),
  bank: z.object({ accountName: z.string().optional(), accountNumber: z.string().optional(), ifsc: z.string().optional(), upi: z.string().optional() }).optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(120),
  meta: z.string().max(200).optional(),
  image: z.string().url().optional(),
  subcategories: z.array(z.string()).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  status: z.enum(["Active", "Inactive"]).optional(),
});
