import * as reviewRepo from "../repositories/reviewRepository.js";
import { getProductById, updateProduct } from "../repositories/productRepository.js";
import { AppError } from "../utils/AppError.js";

export const listReviewsByProduct = (productId) => reviewRepo.listReviewsByProduct(productId);
export const listReviewsByVendor = (vendorId) => reviewRepo.listReviewsByVendor(vendorId);

/**
 * Only a buyer who has an order line item for this exact product may review
 * it, and only once — enforced here server-side rather than trusted from
 * the client.
 */
export async function addProductReview(user, productId, { rating, comment }) {
  const product = await getProductById(productId);
  if (!product) throw AppError.notFound("Product not found.");

  const alreadyReviewed = await reviewRepo.hasReviewedProduct(user.id, productId);
  if (alreadyReviewed) throw AppError.conflict("You have already reviewed this product.", "ALREADY_REVIEWED");

  const purchased = await reviewRepo.hasPurchasedProduct(user.id, productId);
  if (!purchased) throw AppError.forbidden("Only buyers who purchased this product can review it.", "NOT_PURCHASED");

  const review = await reviewRepo.createReview({ productId, vendorId: product.vendorId, userId: user.id, author: user.name, rating, comment });

  const newCount = product.reviewCount + 1;
  const newRating = (product.rating * product.reviewCount + rating) / newCount;
  await updateProduct(productId, { rating: Math.round(newRating * 10) / 10, reviewCount: newCount });

  return review;
}

/** Vendor-level (not product-specific) review — only a buyer who has purchased from this vendor at least once may leave one. */
export async function addVendorReview(user, vendorId, { rating, comment }) {
  const alreadyReviewed = await reviewRepo.hasReviewedVendor(user.id, vendorId);
  if (alreadyReviewed) throw AppError.conflict("You have already reviewed this supplier.", "ALREADY_REVIEWED");

  const purchased = await reviewRepo.hasPurchasedFromVendor(user.id, vendorId);
  if (!purchased) throw AppError.forbidden("Only buyers who purchased from this supplier can review it.", "NOT_PURCHASED");

  return reviewRepo.createReview({ productId: null, vendorId, userId: user.id, author: user.name, rating, comment });
}
