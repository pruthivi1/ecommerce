import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as vendorService from "../services/vendorService.js";
import * as productService from "../services/productService.js";
import * as categoryService from "../services/categoryService.js";
import * as orderService from "../services/orderService.js";
import * as refundService from "../services/refundService.js";
import * as payoutService from "../services/payoutService.js";
import * as couponService from "../services/couponService.js";
import * as dashboardService from "../services/adminDashboardService.js";
import { listCommissions } from "../repositories/commissionRepository.js";
import { setSetting, getNumberSetting } from "../repositories/settingsRepository.js";
import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

// Dashboard / reports
export const getDashboard = asyncHandler(async (_req, res) => sendSuccess(res, await dashboardService.getDashboardStats()));
export const getRecentOrders = asyncHandler(async (req, res) => sendSuccess(res, await dashboardService.getRecentOrders(Number(req.query.limit) || 5)));
export const getRecentVendorApplications = asyncHandler(async (req, res) => sendSuccess(res, await dashboardService.getRecentVendorApplications(Number(req.query.limit) || 5)));
export const getTopProducts = asyncHandler(async (req, res) => sendSuccess(res, await dashboardService.getTopProducts(Number(req.query.limit) || 5)));
export const getTopVendors = asyncHandler(async (req, res) => sendSuccess(res, await dashboardService.getTopVendors(Number(req.query.limit) || 5)));
export const getReports = asyncHandler(async (_req, res) => sendSuccess(res, await dashboardService.getReports()));
export const getPayments = asyncHandler(async (_req, res) => sendSuccess(res, await dashboardService.getPayments()));
export const getBuyers = asyncHandler(async (_req, res) => sendSuccess(res, await dashboardService.getBuyers()));

// Vendors
export const listVendors = asyncHandler(async (req, res) => {
  const result = await vendorService.listVendors(req.query);
  sendSuccess(res, result.items, { meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
});
export const getVendor = asyncHandler(async (req, res) => sendSuccess(res, await vendorService.getVendorById(req.params.id)));
export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.approveVendor(req.params.id);
  await recordAudit(req.user.id, "vendor.approve", "vendor", req.params.id);
  sendSuccess(res, vendor);
});
export const rejectVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.rejectVendor(req.params.id, req.body.reason);
  await recordAudit(req.user.id, "vendor.reject", "vendor", req.params.id, { reason: req.body.reason });
  sendSuccess(res, vendor);
});
export const suspendVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.suspendVendor(req.params.id, req.body.reason);
  await recordAudit(req.user.id, "vendor.suspend", "vendor", req.params.id, { reason: req.body.reason });
  sendSuccess(res, vendor);
});
export const requestVendorChanges = asyncHandler(async (req, res) => {
  sendSuccess(res, await vendorService.requestVendorChanges(req.params.id, req.body.message));
});

// Products
export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listAllProductsForAdmin(req.query);
  sendSuccess(res, result.items, { meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
});
export const approveProduct = asyncHandler(async (req, res) => {
  const product = await productService.setProductStatus(req.params.id, "Active");
  await recordAudit(req.user.id, "product.approve", "product", req.params.id);
  sendSuccess(res, product);
});
export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await productService.setProductStatus(req.params.id, "Rejected", req.body.reason);
  await recordAudit(req.user.id, "product.reject", "product", req.params.id, { reason: req.body.reason });
  sendSuccess(res, product);
});
export const requestProductChanges = asyncHandler(async (req, res) => {
  sendSuccess(res, await productService.requestProductChanges(req.params.id, req.body.message));
});

// Categories
export const listCategories = asyncHandler(async (_req, res) => sendSuccess(res, await categoryService.listCategories({})));
export const createCategory = asyncHandler(async (req, res) => sendSuccess(res, await categoryService.createCategory(req.body), { status: 201 }));
export const updateCategory = asyncHandler(async (req, res) => sendSuccess(res, await categoryService.updateCategory(req.params.id, req.body)));

// Orders
export const listOrders = asyncHandler(async (req, res) => sendSuccess(res, await orderService.listAllOrders(req.query.status)));
export const getOrder = asyncHandler(async (req, res) => sendSuccess(res, await orderService.getOrderForAdmin(req.params.id)));

// Refunds
export const listRefunds = asyncHandler(async (req, res) => sendSuccess(res, await refundService.listRefunds(req.query)));
export const approveRefund = asyncHandler(async (req, res) => {
  const refund = await refundService.decideRefund(req.params.id, "Approved");
  await recordAudit(req.user.id, "refund.approve", "refund", req.params.id);
  sendSuccess(res, refund);
});
export const rejectRefund = asyncHandler(async (req, res) => {
  const refund = await refundService.decideRefund(req.params.id, "Rejected");
  await recordAudit(req.user.id, "refund.reject", "refund", req.params.id);
  sendSuccess(res, refund);
});

// Payouts
export const listPayouts = asyncHandler(async (req, res) => sendSuccess(res, await payoutService.listPayouts(req.query)));
export const updatePayoutStatus = asyncHandler(async (req, res) => {
  const payout = await payoutService.updatePayoutStatus(req.params.id, req.body.status);
  await recordAudit(req.user.id, "payout.status", "payout", req.params.id, { status: req.body.status });
  sendSuccess(res, payout);
});

// Commissions
export const getCommissions = asyncHandler(async (req, res) => sendSuccess(res, await listCommissions(req.query)));
export const getCommissionRate = asyncHandler(async (_req, res) => sendSuccess(res, { rate: await getNumberSetting("commission_rate") }));
export const setCommissionRate = asyncHandler(async (req, res) => sendSuccess(res, { rate: Number(await setSetting("commission_rate", req.body.rate)) }));

// Coupons
export const listCoupons = asyncHandler(async (_req, res) => sendSuccess(res, await couponService.listCoupons()));
export const createCoupon = asyncHandler(async (req, res) => sendSuccess(res, await couponService.createCoupon(req.body), { status: 201 }));
export const updateCoupon = asyncHandler(async (req, res) => sendSuccess(res, await couponService.updateCoupon(req.params.id, req.body)));

// Settings
export const getSettings = asyncHandler(async (_req, res) => {
  sendSuccess(res, {
    commissionRate: await getNumberSetting("commission_rate"),
    gstRate: await getNumberSetting("gst_rate"),
    shippingFeePerVendor: await getNumberSetting("shipping_fee_per_vendor"),
  });
});
export const updateSettings = asyncHandler(async (req, res) => {
  const results = {};
  if (req.body.commissionRate != null) results.commissionRate = Number(await setSetting("commission_rate", req.body.commissionRate));
  if (req.body.gstRate != null) results.gstRate = Number(await setSetting("gst_rate", req.body.gstRate));
  if (req.body.shippingFeePerVendor != null) results.shippingFeePerVendor = Number(await setSetting("shipping_fee_per_vendor", req.body.shippingFeePerVendor));
  sendSuccess(res, results);
});

// Audit log write helper used elsewhere is intentionally minimal for this build.
export const recordAudit = async (actorUserId, action, entityType, entityId, details) => {
  await query("INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, details) VALUES (:id, :actorUserId, :action, :entityType, :entityId, :details)", {
    id: newId(),
    actorUserId,
    action,
    entityType,
    entityId: entityId || null,
    details: JSON.stringify(details || {}),
  });
};
