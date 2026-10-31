import * as cartRepo from "../repositories/cartRepository.js";
import { getProductById } from "../repositories/productRepository.js";
import { AppError } from "../utils/AppError.js";
import { getNumberSetting } from "../repositories/settingsRepository.js";

function priceForQty(bulkPricing, basePrice, qty) {
  if (!bulkPricing?.length) return basePrice;
  const tier = [...bulkPricing].reverse().find((t) => qty >= t.minQty && (t.maxQty == null || qty <= t.maxQty));
  return tier ? tier.price : basePrice;
}

/**
 * Re-resolves every cart line against the CURRENT product/vendor rows. A
 * negotiated (quote-accepted) price is a manual buyer/vendor agreement and
 * intentionally never gets recomputed from the catalog — only its
 * availability (vendor approved, product active, stock) is re-checked.
 */
async function resolveLiveItems(rawItems) {
  const resolved = [];
  for (const item of rawItems) {
    const product = await getProductById(item.product_id);
    const vendorApproved = product?.vendor?.status === "Approved";
    const productActive = product?.status === "Active";
    const inStock = product ? product.stock > 0 : true;

    let unavailableReason = null;
    if (!product) unavailableReason = "This product is no longer available.";
    else if (!vendorApproved) unavailableReason = "This supplier is currently unavailable.";
    else if (!productActive) unavailableReason = "This product is no longer active.";
    else if (!inStock) unavailableReason = "This product is out of stock.";

    const negotiated = item.negotiated_price != null;
    const effectivePrice = negotiated ? Number(item.negotiated_price) : product ? priceForQty(product.bulkPricing, product.price, item.qty) : 0;

    resolved.push({
      productId: item.product_id,
      vendorId: item.vendor_id,
      qty: item.qty,
      negotiated,
      quoteId: item.quote_id,
      name: product?.name ?? "Unknown product",
      image: product?.images?.[0] ?? null,
      sku: product?.sku ?? null,
      unit: product?.unit ?? "piece",
      moq: product?.moq ?? 1,
      moqUnit: product?.moqUnit ?? "pieces",
      price: effectivePrice,
      liveStock: product?.stock ?? null,
      unavailable: Boolean(unavailableReason),
      unavailableReason,
      vendor: product?.vendor ?? null,
    });
  }
  return resolved;
}

function groupByVendor(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.vendorId)) groups.set(item.vendorId, []);
    groups.get(item.vendorId).push(item);
  }
  return Array.from(groups.entries()).map(([vendorId, groupItems]) => {
    const vendor = groupItems[0]?.vendor;
    const vendorUnavailable = !vendor || vendor.status !== "Approved";
    const itemIssue = groupItems.find((i) => i.unavailable);
    return {
      vendorId,
      vendor,
      items: groupItems,
      subtotal: groupItems.reduce((sum, item) => sum + item.qty * item.price, 0),
      unavailable: vendorUnavailable || Boolean(itemIssue),
      unavailableReason: vendorUnavailable ? "Seller unavailable — one or more items from this supplier are no longer available." : itemIssue?.unavailableReason || null,
    };
  });
}

async function calculateTotals(items, vendorCount) {
  const gstRate = await getNumberSetting("gst_rate");
  const shippingPerVendor = await getNumberSetting("shipping_fee_per_vendor");
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const shipping = items.length ? shippingPerVendor * Math.max(vendorCount, 1) : 0;
  const gst = Math.round(subtotal * gstRate);
  const total = subtotal + shipping + gst;
  return { subtotal, shipping, gst, total };
}

function validateForCheckout(resolvedItems) {
  const issues = [];
  if (!resolvedItems.length) {
    issues.push("Your cart is empty.");
    return issues;
  }
  for (const item of resolvedItems) {
    if (item.unavailable) {
      issues.push(`${item.name}: ${item.unavailableReason}`);
      continue;
    }
    if (!(item.qty > 0)) issues.push(`${item.name}: quantity must be greater than zero.`);
    else if (item.qty < item.moq) issues.push(`${item.name}: quantity is below the minimum order of ${item.moq} ${item.moqUnit}.`);
    else if (item.liveStock != null && item.qty > item.liveStock) issues.push(`${item.name}: only ${item.liveStock} ${item.moqUnit} left in stock.`);
  }
  return issues;
}

export async function getCartView(userId) {
  const cart = await cartRepo.getOrCreateCart(userId);
  const rawItems = await cartRepo.getCartItems(cart.id);
  const items = await resolveLiveItems(rawItems);
  const vendorGroups = groupByVendor(items);
  const totals = await calculateTotals(items, vendorGroups.length);
  const checkoutIssues = validateForCheckout(items);
  return { cartId: cart.id, items, vendorGroups, totals, checkoutIssues, itemCount: rawItems.reduce((sum, i) => sum + i.qty, 0) };
}

export async function addItem(userId, { productId, qty }) {
  const product = await getProductById(productId);
  if (!product) throw AppError.notFound("Product not found.");
  const cart = await cartRepo.getOrCreateCart(userId);
  await cartRepo.upsertCartItem(cart.id, { productId, vendorId: product.vendorId, qty });
  return getCartView(userId);
}

/**
 * Adds a cart line at a manually negotiated price (from an accepted quote).
 * Storing negotiatedPrice on the row is what makes resolveLiveItems skip
 * catalog-price recomputation for this line — the bug this guards against
 * is a later catalog price change silently overwriting an agreed price.
 */
export async function addNegotiatedItem(userId, { productId, qty, price, quoteId }) {
  const product = await getProductById(productId);
  if (!product) throw AppError.notFound("Product not found.");
  const cart = await cartRepo.getOrCreateCart(userId);
  await cartRepo.upsertCartItem(cart.id, { productId, vendorId: product.vendorId, qty, negotiatedPrice: price, quoteId });
  return getCartView(userId);
}

export async function updateItemQty(userId, productId, qty) {
  const cart = await cartRepo.getOrCreateCart(userId);
  await cartRepo.updateCartItemQty(cart.id, productId, qty);
  return getCartView(userId);
}

export async function removeItem(userId, productId) {
  const cart = await cartRepo.getOrCreateCart(userId);
  await cartRepo.removeCartItem(cart.id, productId);
  return getCartView(userId);
}

export async function clearCart(userId) {
  const cart = await cartRepo.getOrCreateCart(userId);
  await cartRepo.clearCart(cart.id);
  return getCartView(userId);
}
