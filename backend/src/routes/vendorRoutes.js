import { Router } from "express";
import * as vendorController from "../controllers/vendorController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireOwnVendor, requireApprovedVendor } from "../middleware/authorize.js";
import { validateBody } from "../middleware/validate.js";
import { createProductSchema, updateProductSchema, updateStockSchema } from "../validators/productValidators.js";
import { vendorOrderStatusSchema, quoteRespondSchema, payoutRequestSchema, vendorProfileUpdateSchema } from "../validators/commonValidators.js";
import { z } from "zod";

const router = Router();

router.use(requireAuth, requireOwnVendor);

// Visible regardless of approval status so a pending/rejected/suspended
// vendor can still see their own account state.
router.get("/me", vendorController.getMe);
router.patch("/me", validateBody(vendorProfileUpdateSchema), vendorController.updateMe);
router.get("/products", vendorController.listProducts);
router.get("/products/:id", vendorController.getProduct);
router.get("/orders", vendorController.listOrders);
router.get("/orders/:orderId", vendorController.getOrder);
router.get("/quotes", vendorController.listQuotes);
router.get("/earnings", vendorController.getEarnings);
router.get("/payouts", vendorController.listPayouts);
router.get("/reviews", vendorController.getReviews);
router.get("/notifications", vendorController.listNotifications);
router.patch("/notifications/:id/read", vendorController.markNotificationRead);
router.patch("/notifications/read-all", vendorController.markAllNotificationsRead);

// Selling actions require an Approved, non-suspended vendor account.
router.use(requireApprovedVendor);
router.post("/products", validateBody(createProductSchema), vendorController.createProduct);
router.patch("/products/:id", validateBody(updateProductSchema), vendorController.updateProduct);
router.patch("/products/:id/stock", validateBody(updateStockSchema), vendorController.updateStock);
router.patch("/products/:id/status", validateBody(z.object({ status: z.enum(["Active", "Inactive"]) })), vendorController.toggleProductStatus);
router.patch("/orders/:orderId/vendor-orders/:vendorOrderId/status", validateBody(vendorOrderStatusSchema), vendorController.updateOrderStatus);
router.patch("/quotes/:id/respond", validateBody(quoteRespondSchema), vendorController.respondToQuote);
router.post("/payouts", validateBody(payoutRequestSchema), vendorController.requestPayout);

export default router;
