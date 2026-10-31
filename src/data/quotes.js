export const quotes = [
  {
    id: "QT-5001",
    buyerId: "buyer-1",
    productId: "p1",
    vendorId: "v1",
    quantity: 200,
    targetPrice: 680,
    deliveryLocation: "Bengaluru, Karnataka",
    message: "Looking for a recurring monthly supply of 200 pieces. Please share your best rate.",
    status: "Counter Offer",
    vendorResponse: {
      price: 700,
      message: "We can offer ₹700/piece for a 6-month recurring commitment with monthly dispatch.",
      at: "2026-09-14T12:00:00+05:30",
    },
    createdAt: "2026-09-12T09:00:00+05:30",
  },
  {
    id: "QT-5002",
    buyerId: "buyer-1",
    productId: "p3",
    vendorId: "v3",
    quantity: 1000,
    targetPrice: 500,
    deliveryLocation: "Bengaluru, Karnataka",
    message: "Need 1000 units for a retail launch. Can you match this target price?",
    status: "Pending",
    vendorResponse: null,
    createdAt: "2026-09-20T15:30:00+05:30",
  },
  {
    id: "QT-5003",
    buyerId: "buyer-1",
    productId: "p4",
    vendorId: "v4",
    quantity: 500,
    targetPrice: 230,
    deliveryLocation: "Hyderabad, Telangana",
    message: "Requesting quote for a bulk order across the next quarter.",
    status: "Accepted",
    vendorResponse: {
      price: 235,
      message: "Accepted at ₹235/meter. We will confirm dispatch schedule shortly.",
      at: "2026-08-30T10:00:00+05:30",
    },
    createdAt: "2026-08-28T11:00:00+05:30",
  },
  {
    id: "QT-5004",
    buyerId: "buyer-1",
    productId: "p9",
    vendorId: "v8",
    quantity: 2000,
    targetPrice: 100,
    deliveryLocation: "Mumbai, Maharashtra",
    message: "Target price is aggressive - open to negotiation on packaging.",
    status: "Rejected",
    vendorResponse: {
      price: null,
      message: "Unable to match this price point at current raw material costs.",
      at: "2026-09-05T09:45:00+05:30",
    },
    createdAt: "2026-09-01T08:00:00+05:30",
  },
];

export function getQuotesByBuyer(buyerId) {
  return quotes.filter((q) => q.buyerId === buyerId);
}

export function getQuotesByVendor(vendorId) {
  return quotes.filter((q) => q.vendorId === vendorId);
}

export function getQuoteById(id) {
  return quotes.find((q) => q.id === id);
}
