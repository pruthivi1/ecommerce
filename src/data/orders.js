import { ORDER_TIMELINE_STEPS } from "../utils/constants.js";

function buildTimeline(currentStep, startDate) {
  const start = new Date(startDate);
  const currentIndex = ORDER_TIMELINE_STEPS.indexOf(currentStep);
  return ORDER_TIMELINE_STEPS.map((step, index) => {
    if (index > currentIndex) return { step, date: null, done: false };
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return { step, date: date.toISOString(), done: true };
  });
}

export const orders = [
  {
    id: "ORD-10234",
    buyerId: "buyer-1",
    placedAt: "2026-09-18T10:30:00+05:30",
    paymentStatus: "Successful",
    paymentMethod: "UPI",
    addressId: "addr-1",
    vendorOrders: [
      {
        id: "ORD-10234-A",
        vendorId: "v1",
        status: "Processing",
        items: [{ productId: "p1", name: "Premium Cotton Saree", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=60", qty: 46, price: 750 }],
        subtotal: 34500,
        timeline: buildTimeline("Processing", "2026-09-18T10:30:00+05:30"),
      },
    ],
    subtotal: 34500,
    shipping: 500,
    gst: 6210,
    total: 41210,
  },
  {
    id: "ORD-10235",
    buyerId: "buyer-1",
    placedAt: "2026-09-12T14:05:00+05:30",
    paymentStatus: "Successful",
    paymentMethod: "Card",
    addressId: "addr-1",
    vendorOrders: [
      {
        id: "ORD-10235-A",
        vendorId: "v2",
        status: "Shipped",
        items: [{ productId: "p2", name: "Men's Casual Cotton Shirt", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=200&q=60", qty: 50, price: 420 }],
        subtotal: 21000,
        timeline: buildTimeline("Shipped", "2026-09-12T14:05:00+05:30"),
      },
    ],
    subtotal: 21000,
    shipping: 400,
    gst: 3780,
    total: 25180,
  },
  {
    id: "ORD-10236",
    buyerId: "buyer-1",
    placedAt: "2026-09-08T09:15:00+05:30",
    paymentStatus: "Successful",
    paymentMethod: "Net Banking",
    addressId: "addr-2",
    vendorOrders: [
      {
        id: "ORD-10236-A",
        vendorId: "v3",
        status: "Processing",
        items: [{ productId: "p3", name: "Bluetooth Wireless Earbuds", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=200&q=60", qty: 200, price: 590 }],
        subtotal: 118000,
        timeline: buildTimeline("Processing", "2026-09-08T09:15:00+05:30"),
      },
      {
        id: "ORD-10236-B",
        vendorId: "v5",
        status: "Shipped",
        items: [{ productId: "p5", name: "LED Smart Bulb", image: "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=200&q=60", qty: 500, price: 162 }],
        subtotal: 81000,
        timeline: buildTimeline("Shipped", "2026-09-08T09:15:00+05:30"),
      },
    ],
    subtotal: 199000,
    shipping: 900,
    gst: 35820,
    total: 235720,
  },
  {
    id: "ORD-10221",
    buyerId: "buyer-1",
    placedAt: "2026-08-20T11:00:00+05:30",
    paymentStatus: "Successful",
    paymentMethod: "UPI",
    addressId: "addr-1",
    vendorOrders: [
      {
        id: "ORD-10221-A",
        vendorId: "v4",
        status: "Delivered",
        items: [{ productId: "p4", name: "Handwoven Cotton Fabric", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kavindapadi_Handloom_Clothes.jpg/200px-Kavindapadi_Handloom_Clothes.jpg", qty: 300, price: 260 }],
        subtotal: 78000,
        timeline: buildTimeline("Delivered", "2026-08-20T11:00:00+05:30"),
      },
    ],
    subtotal: 78000,
    shipping: 600,
    gst: 14040,
    total: 92640,
  },
  {
    id: "ORD-10198",
    buyerId: "buyer-1",
    placedAt: "2026-08-02T16:45:00+05:30",
    paymentStatus: "Refunded",
    paymentMethod: "Card",
    addressId: "addr-1",
    vendorOrders: [
      {
        id: "ORD-10198-A",
        vendorId: "v6",
        status: "Cancelled",
        items: [{ productId: "p6", name: "Linen Blend Shirt", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=60", qty: 20, price: 560 }],
        subtotal: 11200,
        timeline: buildTimeline("Order Placed", "2026-08-02T16:45:00+05:30"),
        cancelledReason: "Buyer requested cancellation before processing began.",
      },
    ],
    subtotal: 11200,
    shipping: 300,
    gst: 2016,
    total: 13516,
  },
  {
    id: "ORD-10241",
    buyerId: "buyer-1",
    placedAt: "2026-09-23T08:20:00+05:30",
    paymentStatus: "Successful",
    paymentMethod: "UPI",
    addressId: "addr-1",
    vendorOrders: [
      {
        id: "ORD-10241-A",
        vendorId: "v8",
        status: "Pending",
        items: [{ productId: "p9", name: "Herbal Hair Oil (500ml)", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=60", qty: 100, price: 145 }],
        subtotal: 14500,
        timeline: buildTimeline("Order Placed", "2026-09-23T08:20:00+05:30"),
      },
      {
        id: "ORD-10241-B",
        vendorId: "v1",
        status: "Accepted",
        items: [{ productId: "p11", name: "Silk Blend Designer Saree", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=60", qty: 10, price: 1650 }],
        subtotal: 16500,
        timeline: buildTimeline("Order Placed", "2026-09-23T08:20:00+05:30"),
      },
    ],
    subtotal: 31000,
    shipping: 500,
    gst: 5580,
    total: 37080,
  },
];

export function getOrderById(id) {
  return orders.find((o) => o.id === id);
}

export function getOrdersByBuyer(buyerId) {
  return orders.filter((o) => o.buyerId === buyerId);
}

export function getVendorOrders(vendorId) {
  const results = [];
  for (const order of orders) {
    for (const vo of order.vendorOrders) {
      if (vo.vendorId === vendorId) {
        results.push({ ...vo, orderId: order.id, placedAt: order.placedAt, buyerId: order.buyerId });
      }
    }
  }
  return results;
}
