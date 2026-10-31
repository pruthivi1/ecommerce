import { AppError } from "../utils/AppError.js";
import { getVendorByUserId } from "../repositories/vendorRepository.js";

/** Restricts a route to one or more roles. Always used after requireAuth. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`This action requires one of these roles: ${roles.join(", ")}.`));
    }
    next();
  };
}

/**
 * Enforces that the vendor account (already loaded onto req.vendor by
 * requireOwnVendor) is approved and not suspended — for routes that
 * sell/manage products. An unapproved or suspended vendor must not be able
 * to act as a live seller even though their login still works (so they can
 * see their own status).
 */
export function requireApprovedVendor(req, _res, next) {
  if (!req.vendor) return next(AppError.unauthorized());
  if (req.vendor.status !== "Approved") {
    return next(AppError.forbidden(`Your vendor account is "${req.vendor.status}" and cannot perform this action.`, "VENDOR_NOT_APPROVED"));
  }
  next();
}

export async function requireOwnVendor(req, _res, next) {
  try {
    if (req.user.role !== "vendor") throw AppError.forbidden("This action is only available to vendor accounts.");
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) throw AppError.forbidden("No vendor store is linked to this account.");
    req.vendor = vendor;
    next();
  } catch (err) {
    next(err);
  }
}
