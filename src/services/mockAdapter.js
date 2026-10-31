import { categories, getCategoryBySlug } from "../data/categories.js";
import { products, getProductById, getProductBySlug } from "../data/products.js";
import { vendors } from "../data/vendors.js";
import { orders } from "../data/orders.js";
import { quotes } from "../data/quotes.js";
import { reviews } from "../data/reviews.js";
import { demoUsers } from "../data/users.js";
import { ApiError } from "./apiClient.js";

// In-memory or localStorage persistent state for mock fallback
const STORAGE_KEYS = {
  CART: "mb_mock_cart",
  ORDERS: "mb_mock_orders",
  QUOTES: "mb_mock_quotes",
  WISHLIST: "mb_mock_wishlist",
  CURRENT_USER: "mb_mock_current_user",
};

function getStorage(key, fallback = []) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function createMockToken(user) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      vendorId: user.vendorId || (user.role === "vendor" ? "v1" : undefined),
    })
  );
  return `${header}.${payload}.mockSignature`;
}

function computeProductEffectivePrice(product, qty) {
  if (!product.bulkPricing || product.bulkPricing.length === 0) return product.price;
  const match = product.bulkPricing
    .slice()
    .reverse()
    .find((tier) => qty >= tier.minQty && (tier.maxQty === null || tier.maxQty === undefined || qty <= tier.maxQty));
  return match ? match.price : product.price;
}

export async function handleMockFallback(path, { method = "GET", body, query = {} } = {}) {
  // Artificial slight delay for realistic feel
  await new Promise((r) => setTimeout(r, 60));

  // Strip query string if present in path
  const [cleanPath] = path.split("?");

  // 1. Auth routes
  if (cleanPath === "/auth/demo-login" && method === "POST") {
    const role = body?.role || "buyer";
    const user = demoUsers[role];
    if (!user) throw new ApiError("Role not found", { status: 404 });
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return { token: createMockToken(user), user };
  }

  if (cleanPath === "/auth/me" && method === "GET") {
    const user = getStorage(STORAGE_KEYS.CURRENT_USER, demoUsers.buyer);
    return user;
  }

  if (cleanPath === "/auth/login" && method === "POST") {
    const email = body?.email || "";
    let user = Object.values(demoUsers).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) user = { ...demoUsers.buyer, email };
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return { token: createMockToken(user), user };
  }

  if (cleanPath === "/auth/logout") {
    setStorage(STORAGE_KEYS.CURRENT_USER, null);
    return null;
  }

  if (cleanPath.startsWith("/auth/register")) {
    const user = {
      id: `user-${Date.now()}`,
      role: cleanPath.includes("vendor") ? "vendor" : "buyer",
      name: body?.name || body?.ownerName || "New User",
      email: body?.email || "user@example.com",
      phone: body?.phone || "9999999999",
      businessName: body?.businessName,
      vendorId: cleanPath.includes("vendor") ? "v1" : undefined,
    };
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return { token: createMockToken(user), user };
  }

  // 2. Categories
  if (cleanPath === "/categories") {
    return categories.filter((c) => c.status === "Active");
  }

  if (cleanPath.startsWith("/categories/")) {
    const slug = cleanPath.replace("/categories/", "");
    const cat = getCategoryBySlug(slug);
    if (!cat) throw new ApiError("Category not found", { status: 404 });
    return cat;
  }

  // 3. Products
  if (cleanPath === "/products" || cleanPath === "/admin/products" || cleanPath === "/vendor/products") {
    let list = [...products];

    // Status filtering
    if (cleanPath === "/products") {
      list = list.filter((p) => p.status === "Active");
    } else if (cleanPath === "/vendor/products") {
      const user = getStorage(STORAGE_KEYS.CURRENT_USER, demoUsers.vendor);
      const vId = user.vendorId || "v1";
      list = list.filter((p) => p.vendorId === vId);
    }

    if (query.category) {
      list = list.filter((p) => p.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.subcategory) {
      list = list.filter((p) => p.subcategory?.toLowerCase() === query.subcategory.toLowerCase());
    }
    if (query.vendorId) {
      list = list.filter((p) => p.vendorId === query.vendorId);
    }
    if (query.status && cleanPath !== "/products") {
      list = list.filter((p) => p.status === query.status);
    }
    if (query.location) {
      list = list.filter((p) => p.location?.toLowerCase() === query.location.toLowerCase());
    }
    if (query.q || query.search) {
      const q = (query.q || query.search).toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q)
      );
    }
    if (query.minPrice) {
      list = list.filter((p) => p.price >= Number(query.minPrice));
    }
    if (query.maxPrice) {
      list = list.filter((p) => p.price <= Number(query.maxPrice));
    }

    // Sorting
    if (query.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (query.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (query.sort === "rating-desc") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (query.sort === "newest") list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return list;
  }

  // Related products
  if (cleanPath.startsWith("/products/") && cleanPath.endsWith("/related")) {
    const id = cleanPath.split("/")[2];
    const p = getProductById(id);
    if (!p) return [];
    return products.filter((item) => item.id !== id && (item.category === p.category || item.vendorId === p.vendorId)).slice(0, 4);
  }

  // Product reviews
  if (cleanPath.startsWith("/products/") && cleanPath.endsWith("/reviews")) {
    const id = cleanPath.split("/")[2];
    return reviews.filter((r) => r.productId === id);
  }

  // Single Product
  if (cleanPath.startsWith("/products/")) {
    const idOrSlug = cleanPath.replace("/products/", "");
    const p = getProductById(idOrSlug) || getProductBySlug(idOrSlug);
    if (!p) return { found: false, available: false, product: null, reason: "Product not found" };
    const vendor = vendors.find((v) => v.id === p.vendorId) || null;
    const isAvail = p.status === "Active" && vendor?.status === "Approved";
    return {
      found: true,
      available: isAvail,
      product: { ...p, vendor },
      reason: isAvail ? null : "Product is currently unavailable",
    };
  }

  // 4. Suppliers / Vendors
  if (cleanPath === "/suppliers" || cleanPath === "/admin/vendors") {
    let list = [...vendors];
    if (cleanPath === "/suppliers") list = list.filter((v) => v.status === "Approved");
    if (query.category) {
      list = list.filter((v) => v.categories?.some((c) => c.toLowerCase() === query.category.toLowerCase()));
    }
    if (query.location) {
      list = list.filter((v) => v.location?.toLowerCase() === query.location.toLowerCase());
    }
    if (query.search || query.q) {
      const q = (query.search || query.q).toLowerCase();
      list = list.filter((v) => v.name.toLowerCase().includes(q) || v.businessName?.toLowerCase().includes(q));
    }
    return list;
  }

  if (cleanPath.startsWith("/suppliers/")) {
    const id = cleanPath.replace("/suppliers/", "");
    const v = vendors.find((item) => item.id === id || item.slug === id);
    if (!v) throw new ApiError("Supplier not found", { status: 404 });
    const vendorProducts = products.filter((p) => p.vendorId === v.id && p.status === "Active");
    return { ...v, products: vendorProducts };
  }

  // 5. Buyer Cart
  if (cleanPath === "/buyer/cart") {
    if (method === "DELETE") {
      setStorage(STORAGE_KEYS.CART, []);
      return { items: [], subtotal: 0, shipping: 0, gst: 0, total: 0 };
    }

    const rawItems = getStorage(STORAGE_KEYS.CART, [
      { productId: "p1", qty: 25 },
      { productId: "p13", qty: 20 },
    ]);

    const items = rawItems
      .map((item) => {
        const prod = getProductById(item.productId);
        if (!prod) return null;
        const vendor = vendors.find((v) => v.id === prod.vendorId);
        const unitPrice = computeProductEffectivePrice(prod, item.qty);
        const lineTotal = unitPrice * item.qty;
        return {
          productId: prod.id,
          qty: item.qty,
          unitPrice,
          lineTotal,
          product: {
            ...prod,
            vendorName: vendor?.name || "Verified Supplier",
          },
        };
      })
      .filter(Boolean);

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = items.length > 0 ? 300 : 0;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + gst;

    return { items, subtotal, shipping, gst, total };
  }

  if (cleanPath === "/buyer/cart/items" && method === "POST") {
    const { productId, qty } = body || {};
    const rawItems = getStorage(STORAGE_KEYS.CART, []);
    const existing = rawItems.find((i) => i.productId === productId);
    if (existing) {
      existing.qty += Number(qty) || 1;
    } else {
      rawItems.push({ productId, qty: Number(qty) || 1 });
    }
    setStorage(STORAGE_KEYS.CART, rawItems);
    return handleMockFallback("/buyer/cart");
  }

  if (cleanPath.startsWith("/buyer/cart/items/") && method === "PATCH") {
    const pid = cleanPath.replace("/buyer/cart/items/", "");
    const { qty } = body || {};
    let rawItems = getStorage(STORAGE_KEYS.CART, []);
    const match = rawItems.find((i) => i.productId === pid);
    if (match) {
      if (qty <= 0) rawItems = rawItems.filter((i) => i.productId !== pid);
      else match.qty = qty;
    }
    setStorage(STORAGE_KEYS.CART, rawItems);
    return handleMockFallback("/buyer/cart");
  }

  if (cleanPath.startsWith("/buyer/cart/items/") && method === "DELETE") {
    const pid = cleanPath.replace("/buyer/cart/items/", "");
    let rawItems = getStorage(STORAGE_KEYS.CART, []);
    rawItems = rawItems.filter((i) => i.productId !== pid);
    setStorage(STORAGE_KEYS.CART, rawItems);
    return handleMockFallback("/buyer/cart");
  }

  // 6. Buyer Addresses
  if (cleanPath === "/buyer/addresses") {
    return demoUsers.buyer.addresses || [];
  }

  // 7. Orders
  if (cleanPath === "/buyer/orders" || cleanPath === "/vendor/orders" || cleanPath === "/admin/orders") {
    if (method === "POST" && cleanPath === "/buyer/orders") {
      const storedOrders = getStorage(STORAGE_KEYS.ORDERS, orders);
      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-5)}`,
        buyerId: "buyer-1",
        placedAt: new Date().toISOString(),
        paymentStatus: "Successful",
        paymentMethod: body?.paymentMethod || "UPI",
        addressId: body?.addressId || "addr-1",
        vendorOrders: [
          {
            id: `ORD-${Date.now().toString().slice(-5)}-A`,
            vendorId: "v1",
            status: "Processing",
            items: body?.items || [{ productId: "p1", name: "Premium Cotton Saree", qty: 25, price: 750 }],
            subtotal: body?.total || 18750,
            timeline: [
              { step: "Order Placed", date: new Date().toISOString(), done: true },
              { step: "Processing", date: new Date().toISOString(), done: true },
              { step: "Shipped", date: null, done: false },
              { step: "Delivered", date: null, done: false },
            ],
          },
        ],
      };
      storedOrders.unshift(newOrder);
      setStorage(STORAGE_KEYS.ORDERS, storedOrders);
      setStorage(STORAGE_KEYS.CART, []); // Clear cart after order
      return newOrder;
    }

    const allOrders = getStorage(STORAGE_KEYS.ORDERS, orders);
    if (cleanPath === "/vendor/orders") {
      const user = getStorage(STORAGE_KEYS.CURRENT_USER, demoUsers.vendor);
      const vId = user.vendorId || "v1";
      return allOrders.filter((o) => o.vendorOrders?.some((vo) => vo.vendorId === vId));
    }
    return allOrders;
  }

  if (cleanPath.startsWith("/buyer/orders/") || cleanPath.startsWith("/vendor/orders/")) {
    const id = cleanPath.split("/")[3];
    const allOrders = getStorage(STORAGE_KEYS.ORDERS, orders);
    const match = allOrders.find((o) => o.id === id);
    if (!match) throw new ApiError("Order not found", { status: 404 });
    return match;
  }

  // 8. Quotes
  if (cleanPath === "/buyer/quotes" || cleanPath === "/vendor/quotes") {
    if (method === "POST" && cleanPath === "/buyer/quotes") {
      const storedQuotes = getStorage(STORAGE_KEYS.QUOTES, quotes);
      const newQuote = {
        id: `QT-${Date.now().toString().slice(-4)}`,
        buyerId: "buyer-1",
        productId: body?.productId,
        productName: body?.productName || "Product",
        vendorId: body?.vendorId || "v1",
        quantity: body?.quantity || 100,
        targetPrice: body?.targetPrice || 500,
        deliveryLocation: body?.deliveryLocation || "Bengaluru",
        message: body?.message || "",
        status: "Pending",
        createdAt: new Date().toISOString(),
      };
      storedQuotes.unshift(newQuote);
      setStorage(STORAGE_KEYS.QUOTES, storedQuotes);
      return newQuote;
    }
    return getStorage(STORAGE_KEYS.QUOTES, quotes);
  }

  // 9. Vendor dashboard & earnings
  if (cleanPath === "/vendor/earnings") {
    return {
      availableBalance: 41200,
      pendingPayout: 68200,
      totalSales: 248500,
      totalOrders: 184,
    };
  }

  if (cleanPath === "/vendor/me") {
    const user = getStorage(STORAGE_KEYS.CURRENT_USER, demoUsers.vendor);
    const v = vendors.find((item) => item.id === (user.vendorId || "v1")) || vendors[0];
    return v;
  }

  // 10. Buyer Wishlist
  if (cleanPath === "/buyer/wishlist") {
    const wishlistIds = getStorage(STORAGE_KEYS.WISHLIST, ["p1", "p13"]);
    return products.filter((p) => wishlistIds.includes(p.id));
  }

  if (cleanPath.startsWith("/buyer/wishlist/")) {
    const pid = cleanPath.replace("/buyer/wishlist/", "");
    let wishlistIds = getStorage(STORAGE_KEYS.WISHLIST, ["p1", "p13"]);
    if (wishlistIds.includes(pid)) wishlistIds = wishlistIds.filter((id) => id !== pid);
    else wishlistIds.push(pid);
    setStorage(STORAGE_KEYS.WISHLIST, wishlistIds);
    return { success: true };
  }

  // 11. Admin dashboard
  if (cleanPath === "/admin/dashboard") {
    return {
      totalVendors: vendors.length,
      pendingVendors: vendors.filter((v) => v.status === "Pending").length,
      totalOrders: orders.length,
      totalProducts: products.length,
      revenuePaise: 42500000,
    };
  }

  // Fallback for unknown
  return null;
}
