import { Router } from "express";
import * as paymentController from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";
import { validateBody } from "../middleware/validate.js";
import { z } from "zod";

const router = Router();

router.get("/status", paymentController.paymentsStatus);
router.post(
  "/razorpay/order",
  requireAuth,
  requireRole("buyer"),
  validateBody(z.object({ idempotencyKey: z.string().min(8).max(100) })),
  paymentController.createRazorpayOrder
);

export default router;
