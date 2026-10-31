import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as vendorService from "../services/vendorService.js";
import * as productService from "../services/productService.js";
import * as orderService from "../services/orderService.js";
import * as quoteService from "../services/quoteService.js";
import * as payoutService from "../services/payoutService.js";
import * as reviewService from "../services/reviewService.js";
import * as notificationService from "../services/notificationService.js";
import * as imageUploadService from "../services/imageUploadService.js";
import { query } from "../config/db.js";

export const getMe = asyncHandler(async (req, res) => sendSuccess(res, req.vendor));
export const updateMe = asyncHandler(async (req, res) => sendSuccess(res, await vendorService.updateOwnVendor(req.vendor.id, req.body)));

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listVendorProducts(req.vendor.id, req.query);
  sendSuccess(res, result.items, { meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
});
export const getProduct = asyncHandler(async (req, res) => sendSuccess(res, await productService.getProductForManagement(req.params.id, req.vendor.id)));
export const createProduct = asyncHandler(async (req, res) => sendSuccess(res, await productService.createProduct(req.vendor, req.body), { status: 201, message: "Product submitted for approval." }));
export const updateProduct = asyncHandler(async (req, res) => sendSuccess(res, await productService.updateProduct(req.vendor.id, req.params.id, req.body)));
export const updateStock = asyncHandler(async (req, res) => sendSuccess(res, await productService.updateStock(req.vendor.id, req.params.id, req.body.stock)));
export const toggleProductStatus = asyncHandler(async (req, res) => sendSuccess(res, await productService.toggleOwnProductStatus(req.vendor.id, req.params.id, req.body.status)));

export const listOrders = asyncHandler(async (req, res) => sendSuccess(res, await orderService.listVendorOrders(req.vendor.id, req.query.status)));
export const getOrder = asyncHandler(async (req, res) => sendSuccess(res, await orderService.getOrderForVendor(req.vendor.id, req.params.orderId)));
export const updateOrderStatus = asyncHandler(async (req, res) => {
  sendSuccess(res, await orderService.updateVendorOrderStatus(req.vendor, req.params.orderId, req.params.vendorOrderId, req.body.status));
});

export const listQuotes = asyncHandler(async (req, res) => sendSuccess(res, await quoteService.listQuotesForVendor(req.vendor.id, req.query.status)));
export const respondToQuote = asyncHandler(async (req, res) => sendSuccess(res, await quoteService.respondToQuote(req.params.id, req.vendor.id, req.body)));

export const getEarnings = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT COALESCE(SUM(gross),0) AS gross, COALESCE(SUM(commission_amount),0) AS commission, COALESCE(SUM(net_amount),0) AS net
     FROM commission_ledger WHERE vendor_id = :vendorId`,
    { vendorId: req.vendor.id }
  );
  const [{ available }] = await query(
    `SELECT COALESCE((SELECT SUM(net_amount) FROM commission_ledger WHERE vendor_id = :vendorId), 0)
       - COALESCE((SELECT SUM(amount) FROM payouts WHERE vendor_id = :vendorId AND status IN ('Pending','Processing','Completed')), 0) AS available`,
    { vendorId: req.vendor.id }
  );
  sendSuccess(res, { ...rows[0], gross: Number(rows[0].gross), commission: Number(rows[0].commission), net: Number(rows[0].net), availableBalance: Number(available) });
});

export const listPayouts = asyncHandler(async (req, res) => sendSuccess(res, await payoutService.listPayouts({ vendorId: req.vendor.id, status: req.query.status })));
export const requestPayout = asyncHandler(async (req, res) => sendSuccess(res, await payoutService.requestPayout(req.vendor, req.body.amount), { status: 201 }));

export const getReviews = asyncHandler(async (req, res) => sendSuccess(res, await reviewService.listReviewsByVendor(req.vendor.id)));

export const listNotifications = asyncHandler(async (req, res) => sendSuccess(res, await notificationService.getNotificationsForUser(req.user.id)));
export const markNotificationRead = asyncHandler(async (req, res) => sendSuccess(res, await notificationService.markNotificationRead(req.user.id, req.params.id)));
export const markAllNotificationsRead = asyncHandler(async (req, res) => sendSuccess(res, await notificationService.markAllNotificationsRead(req.user.id)));
export const uploadImage = asyncHandler(async (req, res) => sendSuccess(res, await imageUploadService.uploadImagePayload(req.body), { status: 201 }));
