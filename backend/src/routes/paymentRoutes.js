import { Router } from "express";
import * as paymentController from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";

const router = Router();

router.get("/status", paymentController.paymentsStatus);
router.post("/razorpay/order", requireAuth, requireRole("buyer"), paymentController.createRazorpayOrder);

export default router;
