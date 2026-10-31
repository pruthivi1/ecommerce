export const reviews = [
  {
    id: "r1",
    productId: "p1",
    vendorId: "v1",
    author: "ABC Textiles Pvt. Ltd.",
    rating: 5,
    comment: "Excellent weave quality and consistent colour across the whole batch. Will reorder.",
    date: "2026-08-14",
  },
  {
    id: "r2",
    productId: "p1",
    vendorId: "v1",
    author: "Meenal Retail Stores",
    rating: 4,
    comment: "Good quality for the price. Delivery took a bit longer than expected.",
    date: "2026-07-30",
  },
  {
    id: "r3",
    productId: "p3",
    vendorId: "v3",
    author: "Digital Bazaar Traders",
    rating: 4,
    comment: "Battery life is as advertised. Packaging could be sturdier for bulk shipments.",
    date: "2026-08-02",
  },
  {
    id: "r4",
    productId: "p4",
    vendorId: "v4",
    author: "Heritage Home Furnishings",
    rating: 5,
    comment: "Authentic handloom quality with the official mark. Great for our premium line.",
    date: "2026-06-21",
  },
  {
    id: "r5",
    vendorId: "v2",
    author: "Metro Garments Retail",
    rating: 5,
    comment: "Reliable vendor, always ships on schedule. Highly recommended for bulk shirt orders.",
    date: "2026-08-28",
  },
];

export function getReviewsByProduct(productId) {
  return reviews.filter((r) => r.productId === productId);
}

export function getReviewsByVendor(vendorId) {
  return reviews.filter((r) => r.vendorId === vendorId);
}
