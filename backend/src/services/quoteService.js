import * as quoteRepo from "../repositories/quoteRepository.js";
import { getProductById } from "../repositories/productRepository.js";
import { getVendorByUserId } from "../repositories/vendorRepository.js";
import { AppError } from "../utils/AppError.js";
import { notifyVendor, notifyBuyer } from "./notificationService.js";
import * as cartService from "./cartService.js";

export async function listQuotesForBuyer(buyerId, status) {
  return quoteRepo.listQuotes({ buyerId, status });
}

export async function listQuotesForVendor(vendorId, status) {
  return quoteRepo.listQuotes({ vendorId, status });
}

export async function createQuote(buyerId, payload) {
  const product = await getProductById(payload.productId);
  if (!product) throw AppError.notFound("Product not found.");
  if (product.status !== "Active" || product.vendor?.status !== "Approved") {
    throw AppError.badRequest("This product is not currently available for a quote request.", "PRODUCT_UNAVAILABLE");
  }
  const quote = await quoteRepo.createQuote({ buyerId, productId: product.id, vendorId: product.vendorId, ...payload });
  await notifyVendor(product.vendorId, {
    title: "New quote request",
    body: `Buyer requested a quote for ${quote.quantity} unit(s) at ${quote.deliveryLocation || "an unspecified location"}.`,
  });
  return quote;
}

/**
 * Vendor responding to a quote. The vendor id is derived from the
 * authenticated vendor's own store (req.vendor, set by requireOwnVendor) —
 * never trusted from the request body — so a vendor account can only ever
 * act on requests addressed to their own store.
 */
export async function respondToQuote(quoteId, actingVendorId, { status, price, message }) {
  const existing = await quoteRepo.getQuoteById(quoteId);
  if (!existing) throw AppError.notFound("Quote not found.");
  if (existing.vendorId !== actingVendorId) throw AppError.forbidden("This quote does not belong to your store.");
  if (existing.status === "Accepted" || existing.status === "Rejected") {
    throw AppError.badRequest(`This quote is already ${existing.status.toLowerCase()} and can no longer be modified.`, "QUOTE_LOCKED");
  }
  if (status === "Counter Offer" && price == null) {
    throw AppError.badRequest("A counter-offer must include a price.", "PRICE_REQUIRED");
  }
  const quote = await quoteRepo.respondToQuote(quoteId, { status, price, message });
  await notifyBuyer(quote.buyerId, {
    title: status === "Counter Offer" ? "Quote counter-offer received" : `Quote ${status.toLowerCase()}`,
    body: `Quote ${quoteId} was updated by the supplier.`,
  });
  return quote;
}

/**
 * Buyer accepting a live counter-offer. Only a "Counter Offer" quote can be
 * accepted (a still-Pending one hasn't been responded to; an
 * Accepted/Rejected one is a dead end). Re-validates the product/vendor are
 * still eligible, then atomically records acceptance AND adds the item to
 * the buyer's cart at the negotiated price — the same price is never
 * recomputed from the live catalog (see cartService.addNegotiatedItem).
 */
export async function acceptQuote(buyerId, quoteId) {
  const existing = await quoteRepo.getQuoteById(quoteId);
  if (!existing) throw AppError.notFound("Quote not found.");
  if (existing.buyerId !== buyerId) throw AppError.forbidden("This quote does not belong to you.");
  if (existing.status !== "Counter Offer") {
    throw AppError.badRequest(`This quote is "${existing.status}" and cannot be accepted.`, "QUOTE_NOT_ACCEPTABLE");
  }
  const product = await getProductById(existing.productId);
  if (!product || product.status !== "Active" || product.vendor?.status !== "Approved") {
    throw AppError.badRequest("This product is no longer active and can't be purchased.", "PRODUCT_UNAVAILABLE");
  }

  const quote = await quoteRepo.acceptQuote(quoteId);
  const negotiatedPrice = quote.vendorResponse?.price ?? product.price;
  await cartService.addNegotiatedItem(buyerId, { productId: product.id, qty: quote.quantity, price: negotiatedPrice, quoteId: quote.id });
  return quote;
}

export async function getVendorIdForUser(userId) {
  const vendor = await getVendorByUserId(userId);
  return vendor?.id ?? null;
}
