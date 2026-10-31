import * as vendorRepo from "../repositories/vendorRepository.js";
import { AppError } from "../utils/AppError.js";
import { notifyVendor } from "./notificationService.js";

export async function listVendors(filters) {
  return vendorRepo.listVendors(filters);
}

export async function getVendorById(id) {
  const vendor = await vendorRepo.getVendorById(id);
  if (!vendor) throw AppError.notFound("Supplier not found.");
  return vendor;
}

export async function getVendorBySlug(slug) {
  const vendor = await vendorRepo.getVendorBySlug(slug);
  if (!vendor) throw AppError.notFound("Supplier not found.");
  return vendor;
}

export async function getOwnVendor(userId) {
  const vendor = await vendorRepo.getVendorByUserId(userId);
  if (!vendor) throw AppError.notFound("No vendor store is linked to this account.");
  return vendor;
}

export async function updateOwnVendor(vendorId, updates) {
  return vendorRepo.updateVendor(vendorId, updates);
}

export async function approveVendor(id) {
  const vendor = await vendorRepo.setVendorStatus(id, "Approved");
  if (!vendor) throw AppError.notFound("Vendor not found.");
  await notifyVendor(id, { title: "Application approved", body: "Your vendor account is now approved." });
  return vendor;
}

export async function rejectVendor(id, reason) {
  const vendor = await vendorRepo.setVendorStatus(id, "Rejected", reason);
  if (!vendor) throw AppError.notFound("Vendor not found.");
  await notifyVendor(id, { title: "Application rejected", body: reason ? `Your application was rejected: ${reason}` : "Your application was rejected." });
  return vendor;
}

export async function requestVendorChanges(id, message) {
  const vendor = await vendorRepo.getVendorById(id);
  if (!vendor) throw AppError.notFound("Vendor not found.");
  await notifyVendor(id, { title: "Changes requested on your application", body: message || "The marketplace team asked for updates to your application. Check your email for details." });
  return vendor;
}

export async function suspendVendor(id, reason) {
  const vendor = await vendorRepo.setVendorStatus(id, "Suspended", reason);
  if (!vendor) throw AppError.notFound("Vendor not found.");
  await notifyVendor(id, { title: "Account suspended", body: reason ? `Your vendor account was suspended: ${reason}` : "Your vendor account has been suspended." });
  return vendor;
}
