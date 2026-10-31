import * as wishlistRepo from "../repositories/wishlistRepository.js";

export async function getWishlist(userId) {
  const wishlist = await wishlistRepo.getOrCreateWishlist(userId);
  const items = await wishlistRepo.getWishlistItems(wishlist.id);
  return items.map((i) => ({
    productId: i.product_id,
    vendorId: i.vendor_id,
    name: i.name,
    price: Number(i.price),
    unit: i.unit,
    moq: i.moq,
    moqUnit: i.moq_unit,
    image: i.image,
    addedAt: i.added_at,
  }));
}

export async function addItem(userId, productId) {
  const wishlist = await wishlistRepo.getOrCreateWishlist(userId);
  await wishlistRepo.addWishlistItem(wishlist.id, productId);
  return getWishlist(userId);
}

export async function removeItem(userId, productId) {
  const wishlist = await wishlistRepo.getOrCreateWishlist(userId);
  await wishlistRepo.removeWishlistItem(wishlist.id, productId);
  return getWishlist(userId);
}
