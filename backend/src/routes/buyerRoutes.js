import { Router } from "express";
import * as buyerController from "../controllers/buyerController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorize.js";
import { validateBody } from "../middleware/validate.js";
import {
  addressSchema,
  cartItemSchema,
  cartItemUpdateSchema,
  wishlistItemSchema,
  quoteCreateSchema,
  orderCreateSchema,
  cancelReturnSchema,
  reviewCreateSchema,
} from "../validators/commonValidators.js";

const router = Router();

router.use(requireAuth, requireRole("buyer"));

router.get("/addresses", buyerController.listAddresses);
router.post("/addresses", validateBody(addressSchema), buyerController.createAddress);
router.patch("/addresses/:id", validateBody(addressSchema.partial()), buyerController.updateAddress);
router.patch("/addresses/:id/default", buyerController.setDefaultAddress);
router.delete("/addresses/:id", buyerController.removeAddress);

router.get("/cart", buyerController.getCart);
router.post("/cart/items", validateBody(cartItemSchema), buyerController.addCartItem);
router.patch("/cart/items/:id", validateBody(cartItemUpdateSchema), buyerController.updateCartItem);
router.delete("/cart/items/:id", buyerController.removeCartItem);
router.delete("/cart", buyerController.clearCart);

router.get("/wishlist", buyerController.getWishlist);
router.post("/wishlist/items", validateBody(wishlistItemSchema), buyerController.addWishlistItem);
router.delete("/wishlist/items/:productId", buyerController.removeWishlistItem);

router.get("/quotes", buyerController.listQuotes);
router.post("/quotes", validateBody(quoteCreateSchema), buyerController.createQuote);
router.patch("/quotes/:id/accept", buyerController.acceptQuote);

router.get("/orders", buyerController.listOrders);
router.get("/orders/:id", buyerController.getOrder);
router.post("/orders", validateBody(orderCreateSchema), buyerController.checkout);
router.post("/orders/:id/vendor-orders/:vendorOrderId/cancel", validateBody(cancelReturnSchema), buyerController.cancelOrder);
router.post("/orders/:id/vendor-orders/:vendorOrderId/return", validateBody(cancelReturnSchema), buyerController.returnOrder);

router.post("/products/:id/reviews", validateBody(reviewCreateSchema), buyerController.addProductReview);
router.post("/suppliers/:id/reviews", validateBody(reviewCreateSchema), buyerController.addVendorReview);

router.get("/notifications", buyerController.listNotifications);
router.patch("/notifications/:id/read", buyerController.markNotificationRead);
router.patch("/notifications/read-all", buyerController.markAllNotificationsRead);

export default router;
