import * as couponRepo from "../repositories/couponRepository.js";

// Checkout intentionally does not apply coupons yet (out of scope for this
// release) — this service only backs the admin CRUD screen.
export const listCoupons = () => couponRepo.listCoupons();
export const createCoupon = (payload) => couponRepo.createCoupon(payload);
export const updateCoupon = (id, updates) => couponRepo.updateCoupon(id, updates);
