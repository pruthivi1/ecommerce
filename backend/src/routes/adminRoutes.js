import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";
import { validateBody } from "../middleware/validate.js";
import {
  couponCreateSchema,
  couponUpdateSchema,
  commissionRateSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
} from "../validators/commonValidators.js";
import { z } from "zod";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", adminController.getDashboard);
router.get("/dashboard/recent-orders", adminController.getRecentOrders);
router.get("/dashboard/recent-vendor-applications", adminController.getRecentVendorApplications);
router.get("/dashboard/top-products", adminController.getTopProducts);
router.get("/dashboard/top-vendors", adminController.getTopVendors);
router.get("/reports", adminController.getReports);
router.get("/payments", adminController.getPayments);
router.get("/buyers", adminController.getBuyers);

router.get("/vendors", adminController.listVendors);
router.get("/vendors/:id", adminController.getVendor);
router.patch("/vendors/:id/approve", adminController.approveVendor);
router.patch("/vendors/:id/reject", validateBody(z.object({ reason: z.string().max(1000).optional() })), adminController.rejectVendor);
router.patch("/vendors/:id/suspend", validateBody(z.object({ reason: z.string().max(1000).optional() })), adminController.suspendVendor);
router.patch("/vendors/:id/request-changes", validateBody(z.object({ message: z.string().max(1000).optional() })), adminController.requestVendorChanges);

router.get("/products", adminController.listProducts);
router.patch("/products/:id/approve", adminController.approveProduct);
router.patch("/products/:id/reject", validateBody(z.object({ reason: z.string().max(1000).optional() })), adminController.rejectProduct);
router.patch("/products/:id/request-changes", validateBody(z.object({ message: z.string().max(1000).optional() })), adminController.requestProductChanges);

router.get("/categories", adminController.listCategories);
router.post("/categories", validateBody(categoryCreateSchema), adminController.createCategory);
router.patch("/categories/:id", validateBody(categoryUpdateSchema), adminController.updateCategory);

router.get("/orders", adminController.listOrders);
router.get("/orders/:id", adminController.getOrder);

router.get("/refunds", adminController.listRefunds);
router.patch("/refunds/:id/approve", adminController.approveRefund);
router.patch("/refunds/:id/reject", adminController.rejectRefund);

router.get("/payouts", adminController.listPayouts);
router.patch("/payouts/:id/status", validateBody(z.object({ status: z.enum(["Processing", "Completed", "Rejected"]) })), adminController.updatePayoutStatus);

router.get("/commissions", adminController.getCommissions);
router.get("/commission-rate", adminController.getCommissionRate);
router.patch("/commission-rate", validateBody(commissionRateSchema), adminController.setCommissionRate);

router.get("/coupons", adminController.listCoupons);
router.post("/coupons", validateBody(couponCreateSchema), adminController.createCoupon);
router.patch("/coupons/:id", validateBody(couponUpdateSchema), adminController.updateCoupon);

router.get("/settings", adminController.getSettings);
router.patch("/settings", adminController.updateSettings);

export default router;
