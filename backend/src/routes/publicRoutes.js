import { Router } from "express";
import * as publicController from "../controllers/publicController.js";
import { validateQuery } from "../middleware/validate.js";
import { productQuerySchema } from "../validators/productValidators.js";

const router = Router();

router.get("/categories", publicController.listCategories);
router.get("/categories/:slug", publicController.getCategory);

router.get("/products", validateQuery(productQuerySchema), publicController.listProducts);
router.get("/products/:id", publicController.getProduct);
router.get("/products/slug/:slug", publicController.getProductBySlug);
router.get("/products/:id/related", publicController.getRelatedProducts);
router.get("/products/:id/reviews", publicController.getProductReviews);

router.get("/suppliers", publicController.listSuppliers);
router.get("/suppliers/:id", publicController.getSupplier);
router.get("/suppliers/:id/reviews", publicController.getSupplierReviews);

export default router;
