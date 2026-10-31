export const refunds = [
  {
    id: "RF-3001",
    orderId: "ORD-10198",
    vendorOrderId: "ORD-10198-A",
    buyerId: "buyer-1",
    vendorId: "v6",
    amount: 13516,
    reason: "Order cancelled before processing began.",
    status: "Approved",
    requestedAt: "2026-08-03T10:00:00+05:30",
  },
  {
    id: "RF-3002",
    orderId: "ORD-10221",
    vendorOrderId: "ORD-10221-A",
    buyerId: "buyer-1",
    vendorId: "v4",
    amount: 6200,
    reason: "2 rolls of fabric arrived with a colour mismatch.",
    status: "Pending",
    requestedAt: "2026-09-05T09:00:00+05:30",
  },
];

export function getRefundsByBuyer(buyerId) {
  return refunds.filter((r) => r.buyerId === buyerId);
}
