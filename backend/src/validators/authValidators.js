import { z } from "zod";

export const registerBuyerSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(6).max(20).optional(),
  businessName: z.string().max(200).optional(),
  gstNumber: z.string().max(20).optional(),
  businessType: z.string().max(50).optional(),
});

export const registerVendorSchema = z.object({
  ownerName: z.string().min(2).max(150),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(6).max(20).optional(),
  businessName: z.string().min(2).max(200),
  gstNumber: z.string().max(20).optional(),
  businessType: z.string().max(50).optional(),
  categories: z.array(z.string()).default([]),
  location: z.string().max(100).optional(),
  address: z
    .object({ line1: z.string().max(200), city: z.string().max(100), state: z.string().max(100), pincode: z.string().max(15) })
    .optional(),
  documents: z.array(z.string()).default([]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const demoLoginSchema = z.object({
  role: z.enum(["buyer", "vendor", "admin"]),
});
