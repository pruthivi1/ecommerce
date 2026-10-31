import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { authRateLimit } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validate.js";
import { registerBuyerSchema, registerVendorSchema, loginSchema, demoLoginSchema } from "../validators/authValidators.js";

const router = Router();

router.post("/register", authRateLimit, validateBody(registerBuyerSchema), authController.register);
router.post("/register/vendor", authRateLimit, validateBody(registerVendorSchema), authController.registerVendor);
router.post("/login", authRateLimit, validateBody(loginSchema), authController.login);
router.post("/demo-login", authRateLimit, validateBody(demoLoginSchema), authController.demoLogin);
router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);

export default router;
