import { withTransaction } from "../config/db.js";
import * as orderRepo from "../repositories/orderRepository.js";
import * as cartRepo from "../repositories/cartRepository.js";
import * as cartService from "./cartService.js";
import * as paymentRepo from "../repositories/paymentRepository.js";
import * as paymentService from "./paymentService.js";
import { decrementStockIfAvailable } from "../repositories/productRepository.js";
import { getVendorById } from "../repositories/vendorRepository.js";
import { recordCommission } from "../repositories/commissionRepository.js";
import { getNumberSetting } from "../repositories/settingsRepository.js";
import { assertOwnedAddress } from "./addressService.js";
import { AppError } from "../utils/AppError.js";
import { notifyVendor, notifyBuyer } from "./notificationService.js";

const CANCELLABLE_STATUSES = ["Pending", "Accepted"];
const RETURNABLE_STATUSES = ["Delivered"];

export async function listOrdersForBuyer(buyerId, status) {
  return orderRepo.listOrders({ buyerId, status });
}

export async function listAllOrders(status) {
  return orderRepo.listOrders({ status });
}

export async function getOrderForBuyer(buyerId, orderId) {
  const order = await orderRepo.getOrderById(orderId);
  if (!order || order.buyerId !== buyerId) throw AppError.notFound("Order not found.");
  return order;
}

export async function getOrderForAdmin(orderId) {
  const order = await orderRepo.getOrderById(orderId);
  if (!order) throw AppError.notFound("Order not found.");
  return order;
}

/**
 * A vendor may look up a master order only if one of its vendor-orders
 * belongs to them, and even then only sees their OWN line items — another
 * vendor's items/prices within the same multi-vendor cart are never
 * included in the response.
 */
export async function getOrderForVendor(vendorId, orderId) {
  const order = await orderRepo.getOrderById(orderId);
  if (!order) throw AppError.notFound("Order not found.");
  const ownVendorOrders = order.vendorOrders.filter((vo) => vo.vendorId === vendorId);
  if (!ownVendorOrders.length) throw AppError.notFound("Order not found.");
  return { ...order, vendorOrders: ownVendorOrders };
}

export async function listVendorOrders(vendorId, status) {
  return orderRepo.listVendorOrders(vendorId, { status });
}

/**
 * The checkout entry point. Re-validates every business rule against LIVE
 * data (never trusts the cart snapshot the client displayed) and recomputes
 * the total server-side — the client-supplied total, if any, is ignored.
 * Idempotency: a retry with the same idempotencyKey returns the SAME order
 * instead of creating a duplicate purchase.
 */
export async function checkout(buyer, { addressId, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature, idempotencyKey }) {
  const existingPayment = await paymentRepo.getPaymentByIdempotencyKey(idempotencyKey);
  if (existingPayment) {
    return orderRepo.getOrderById(existingPayment.order_id);
  }

  await assertOwnedAddress(buyer.id, addressId);

  const cartView = await cartService.getCartView(buyer.id);
  if (cartView.checkoutIssues.length) {
    throw AppError.badRequest("Your cart has issues that must be resolved before checkout.", "CART_INVALID", cartView.checkoutIssues);
  }

  if (paymentService.isPaymentsConfigured()) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw AppError.badRequest("Payment verification details are missing.", "PAYMENT_UNVERIFIED");
    }
    const valid = paymentService.verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    if (!valid) throw AppError.badRequest("Payment could not be verified.", "PAYMENT_SIGNATURE_INVALID");
  } else {
    throw AppError.badRequest(
      "Payments are not configured in this environment, so an order cannot be placed. Set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to enable checkout.",
      "PAYMENTS_NOT_CONFIGURED"
    );
  }

  const gstRate = await getNumberSetting("gst_rate");
  const shippingFeePerVendor = await getNumberSetting("shipping_fee_per_vendor");

  const vendorGroups = cartView.vendorGroups.map((g) => ({
    vendorId: g.vendorId,
    items: g.items.map((i) => ({ productId: i.productId, name: i.name, image: i.image, sku: i.sku, qty: i.qty, price: i.price, negotiated: i.negotiated, quoteId: i.quoteId })),
  }));

  const { orderId } = await withTransaction(async (connection) => {
    // Final concurrency-safe stock check: re-decrement atomically inside the
    // transaction so two buyers racing for the last units can't both succeed.
    for (const group of vendorGroups) {
      for (const item of group.items) {
        const ok = await decrementStockIfAvailable(item.productId, item.qty, connection);
        if (!ok) throw AppError.conflict(`${item.name}: not enough stock is available. Please update your cart and try again.`, "OUT_OF_STOCK");
      }
    }

    const result = await orderRepo.insertOrder(connection, {
      buyerId: buyer.id,
      addressId,
      paymentMethod,
      paymentStatus: "Successful",
      vendorGroups,
      shippingFeePerVendor,
      gstRate,
    });

    await paymentRepo.createPayment(connection, {
      orderId: result.orderId,
      razorpayOrderId: razorpayOrderId || null,
      amount: 0, // set below once the order total is known
      idempotencyKey,
    });

    return result;
  });

  // Payment amount + commission ledger recorded after the order total is known.
  const order = await orderRepo.getOrderById(orderId);
  await withTransaction(async (connection) => {
    await connection.query("UPDATE payments SET amount = :amount, razorpay_payment_id = :paymentId, method = :method, status = 'Successful' WHERE order_id = :orderId", {
      amount: order.total,
      paymentId: razorpayPaymentId,
      method: paymentMethod,
      orderId,
    });
    for (const vo of order.vendorOrders) {
      const vendor = await getVendorById(vo.vendorId);
      await recordCommission(connection, { vendorOrderId: vo.id, vendorId: vo.vendorId, gross: vo.subtotal, commissionRate: vendor?.commission_rate ?? 0.08 });
    }
  });

  const cart = await cartRepo.getOrCreateCart(buyer.id);
  await cartRepo.clearCart(cart.id);

  for (const vo of order.vendorOrders) {
    await notifyVendor(vo.vendorId, { title: "New order received", body: `Order ${vo.vendorOrderNumber} placed for ${vo.items.length} item(s).` });
  }

  return order;
}

export async function updateVendorOrderStatus(vendor, orderId, vendorOrderId, status) {
  const vo = await orderRepo.getVendorOrderRaw(vendorOrderId);
  if (!vo || vo.order_id !== orderId) throw AppError.notFound("Order not found.");
  if (vo.vendor_id !== vendor.id) throw AppError.forbidden("You can only manage your own orders.");

  const result = await orderRepo.updateVendorOrderStatus(vendorOrderId, status);
  if (result.error === "not_found") throw AppError.notFound("Order not found.");
  if (result.error === "invalid_transition") {
    throw AppError.badRequest(`Cannot move order from "${result.from}" to "${result.to}".`, "INVALID_STATUS_TRANSITION");
  }
  const order = await orderRepo.getOrderById(orderId);
  await notifyBuyer(order.buyerId, { title: `Order ${status.toLowerCase()}`, body: `${result.vendorOrder.vendor_order_number || vendorOrderId} is now ${status}.` });
  return getOrderForAdmin(orderId);
}

export async function requestCancellation(buyerId, orderId, vendorOrderId, reason) {
  const order = await orderRepo.getOrderById(orderId);
  if (!order || order.buyerId !== buyerId) throw AppError.notFound("Order not found.");
  const vo = order.vendorOrders.find((v) => v.id === vendorOrderId);
  if (!vo) throw AppError.notFound("Order not found.");
  if (!CANCELLABLE_STATUSES.includes(vo.status)) {
    throw AppError.badRequest(`This order can no longer be cancelled — it is already "${vo.status}".`, "NOT_CANCELLABLE");
  }
  await orderRepo.setCancelled(vendorOrderId, reason);
  await notifyVendor(vo.vendorId, { title: "Order cancelled by buyer", body: `${vo.vendorOrderNumber}: ${reason}` });
  return getOrderForBuyer(buyerId, orderId);
}

export async function requestReturn(buyerId, orderId, vendorOrderId, reason) {
  const order = await orderRepo.getOrderById(orderId);
  if (!order || order.buyerId !== buyerId) throw AppError.notFound("Order not found.");
  const vo = order.vendorOrders.find((v) => v.id === vendorOrderId);
  if (!vo) throw AppError.notFound("Order not found.");
  if (!RETURNABLE_STATUSES.includes(vo.status)) {
    throw AppError.badRequest(`Returns can only be requested on delivered orders — this one is "${vo.status}".`, "NOT_RETURNABLE");
  }
  await orderRepo.setReturnRequested(vendorOrderId, reason);
  await notifyVendor(vo.vendorId, { title: "Return requested by buyer", body: `${vo.vendorOrderNumber}: ${reason}` });
  return getOrderForBuyer(buyerId, orderId);
}

export function nextValidStatuses(status) {
  return orderRepo.nextValidStatuses(status);
}
