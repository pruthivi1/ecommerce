import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as addressService from "../services/addressService.js";
import * as cartService from "../services/cartService.js";
import * as wishlistService from "../services/wishlistService.js";
import * as quoteService from "../services/quoteService.js";
import * as orderService from "../services/orderService.js";
import * as refundService from "../services/refundService.js";
import * as reviewService from "../services/reviewService.js";
import * as notificationService from "../services/notificationService.js";

// Addresses
export const listAddresses = asyncHandler(async (req, res) => sendSuccess(res, await addressService.listAddresses(req.user.id)));
export const createAddress = asyncHandler(async (req, res) => sendSuccess(res, await addressService.createAddress(req.user.id, req.body), { status: 201 }));
export const updateAddress = asyncHandler(async (req, res) => sendSuccess(res, await addressService.updateAddress(req.user.id, req.params.id, req.body)));
export const setDefaultAddress = asyncHandler(async (req, res) => sendSuccess(res, await addressService.setDefaultAddress(req.user.id, req.params.id)));
export const removeAddress = asyncHandler(async (req, res) => sendSuccess(res, await addressService.removeAddress(req.user.id, req.params.id)));

// Cart
export const getCart = asyncHandler(async (req, res) => sendSuccess(res, await cartService.getCartView(req.user.id)));
export const addCartItem = asyncHandler(async (req, res) => sendSuccess(res, await cartService.addItem(req.user.id, req.body), { status: 201 }));
export const updateCartItem = asyncHandler(async (req, res) => sendSuccess(res, await cartService.updateItemQty(req.user.id, req.params.id, req.body.qty)));
export const removeCartItem = asyncHandler(async (req, res) => sendSuccess(res, await cartService.removeItem(req.user.id, req.params.id)));
export const clearCart = asyncHandler(async (req, res) => sendSuccess(res, await cartService.clearCart(req.user.id)));

// Wishlist
export const getWishlist = asyncHandler(async (req, res) => sendSuccess(res, await wishlistService.getWishlist(req.user.id)));
export const addWishlistItem = asyncHandler(async (req, res) => sendSuccess(res, await wishlistService.addItem(req.user.id, req.body.productId), { status: 201 }));
export const removeWishlistItem = asyncHandler(async (req, res) => sendSuccess(res, await wishlistService.removeItem(req.user.id, req.params.productId)));

// Quotes
export const listQuotes = asyncHandler(async (req, res) => sendSuccess(res, await quoteService.listQuotesForBuyer(req.user.id, req.query.status)));
export const createQuote = asyncHandler(async (req, res) => sendSuccess(res, await quoteService.createQuote(req.user.id, req.body), { status: 201 }));
export const acceptQuote = asyncHandler(async (req, res) => sendSuccess(res, await quoteService.acceptQuote(req.user.id, req.params.id)));

// Orders
export const listOrders = asyncHandler(async (req, res) => sendSuccess(res, await orderService.listOrdersForBuyer(req.user.id, req.query.status)));
export const getOrder = asyncHandler(async (req, res) => sendSuccess(res, await orderService.getOrderForBuyer(req.user.id, req.params.id)));
export const checkout = asyncHandler(async (req, res) => {
  const order = await orderService.checkout(req.user, req.body);
  sendSuccess(res, order, { message: "Order placed.", status: 201 });
});
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.requestCancellation(req.user.id, req.params.id, req.params.vendorOrderId, req.body.reason);
  await refundService.createRefundFromCancellation(req.user.id, req.params.id, req.params.vendorOrderId, `Order cancelled by buyer: ${req.body.reason}`);
  sendSuccess(res, order);
});
export const returnOrder = asyncHandler(async (req, res) => {
  const order = await orderService.requestReturn(req.user.id, req.params.id, req.params.vendorOrderId, req.body.reason);
  await refundService.createRefundFromReturn(req.user.id, req.params.id, req.params.vendorOrderId, `Return requested by buyer: ${req.body.reason}`);
  sendSuccess(res, order);
});

// Reviews
export const addProductReview = asyncHandler(async (req, res) => {
  sendSuccess(res, await reviewService.addProductReview(req.user, req.params.id, req.body), { status: 201 });
});
export const addVendorReview = asyncHandler(async (req, res) => {
  sendSuccess(res, await reviewService.addVendorReview(req.user, req.params.id, req.body), { status: 201 });
});

// Notifications
export const listNotifications = asyncHandler(async (req, res) => sendSuccess(res, await notificationService.getNotificationsForUser(req.user.id)));
export const markNotificationRead = asyncHandler(async (req, res) => sendSuccess(res, await notificationService.markNotificationRead(req.user.id, req.params.id)));
export const markAllNotificationsRead = asyncHandler(async (req, res) => sendSuccess(res, await notificationService.markAllNotificationsRead(req.user.id)));
