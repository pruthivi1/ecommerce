import fs from "fs";
import path from "path";
import { products, getProductById, getProductBySlug } from "./src/data/products.js";
import { categories, getCategoryBySlug } from "./src/data/categories.js";
import { vendors } from "./src/data/vendors.js";
import { handleMockFallback } from "./src/services/mockAdapter.js";

// Mock localStorage for node environment
global.window = {
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  },
  location: { origin: "http://localhost:5173" }
};
global.btoa = (str) => Buffer.from(str, "binary").toString("base64");
global.atob = (str) => Buffer.from(str, "base64").toString("binary");

const results = [];

function assert(description, condition, details = "") {
  if (condition) {
    results.push({ test: description, status: "PASS", details });
    console.log(`[PASS] ${description}`);
  } else {
    results.push({ test: description, status: "FAIL", details });
    console.error(`[FAIL] ${description} - ${details}`);
  }
}

async function runTests() {
  console.log("=== STARTING END-TO-END MANUAL VERIFICATION SUITE ===\n");

  // SUITE 1: DATA INTEGRITY & ASSET VERIFICATION
  console.log("\n--- Suite 1: Product Data & Image Assets ---");
  
  // 1.1 Saree verification
  const cottonSaree = getProductById("p1");
  assert("P1 Saree exists and has correct category", cottonSaree && cottonSaree.category === "Sarees");
  assert("P1 Saree has saree image", cottonSaree && cottonSaree.images.some(img => img.includes("saree")));
  
  const silkSaree = getProductById("p11");
  assert("P11 Silk Saree exists", silkSaree && silkSaree.category === "Sarees");
  assert("P11 Silk Saree has silk saree image", silkSaree && silkSaree.images.some(img => img.includes("saree-silk")));

  // 1.2 Power bank verification
  const pb20k = getProductById("p13");
  assert("P13 20000mAh Power Bank exists in Electronics", pb20k && pb20k.category === "Electronics");
  assert("P13 Power Bank has power bank image", pb20k && pb20k.images.some(img => img.includes("power-bank")));
  
  const pbWireless = getProductById("p14");
  assert("P14 Wireless Power Bank exists in Electronics", pbWireless && pbWireless.category === "Electronics");
  assert("P14 Wireless Power Bank has wireless power bank image", pbWireless && pbWireless.images.some(img => img.includes("power-bank-wireless")));

  // 1.3 Local image file existence check on disk
  const localImages = [
    cottonSaree.images[0],
    silkSaree.images[0],
    pb20k.images[0],
    pbWireless.images[0]
  ];
  for (const imgUrl of localImages) {
    if (imgUrl.startsWith("/")) {
      const diskPath = path.join(process.cwd(), "public", imgUrl);
      const exists = fs.existsSync(diskPath);
      assert(`Local image exists on disk: ${imgUrl}`, exists, diskPath);
      if (exists) {
        const stats = fs.statSync(diskPath);
        assert(`Image ${imgUrl} has valid file size (>10KB)`, stats.size > 10240, `${stats.size} bytes`);
      }
    }
  }

  // SUITE 2: BROWSING, SEARCH & FILTERING (MOCK ADAPTER)
  console.log("\n--- Suite 2: Browsing, Search & Filtering ---");
  
  // 2.1 Category list
  const catList = await handleMockFallback("/categories");
  assert("Categories endpoint returns active categories", Array.isArray(catList) && catList.length >= 7);
  
  // 2.2 Saree category filter
  const sareeProducts = await handleMockFallback("/products", { query: { category: "Sarees" } });
  assert("Category filter 'Sarees' returns only saree items", sareeProducts.length >= 2 && sareeProducts.every(p => p.category === "Sarees"));

  // 2.3 Electronics category filter
  const elecProducts = await handleMockFallback("/products", { query: { category: "Electronics" } });
  assert("Category filter 'Electronics' includes power banks", elecProducts.some(p => p.name.includes("Power Bank")));

  // 2.4 Search query for 'power bank'
  const searchPB = await handleMockFallback("/products", { query: { search: "power bank" } });
  assert("Search 'power bank' returns power bank products", searchPB.length >= 2 && searchPB.every(p => p.name.toLowerCase().includes("power bank")));

  // 2.5 Search query for 'saree'
  const searchSaree = await handleMockFallback("/products", { query: { search: "saree" } });
  assert("Search 'saree' returns saree products", searchSaree.length >= 2 && searchSaree.every(p => p.name.toLowerCase().includes("saree")));

  // 2.6 Price sorting
  const sortedAsc = await handleMockFallback("/products", { query: { sort: "price-asc" } });
  const isAsc = sortedAsc.every((p, i) => i === 0 || p.price >= sortedAsc[i - 1].price);
  assert("Sort by price-asc returns items in ascending price order", isAsc);

  // 2.7 Single product lookup
  const singlePB = await handleMockFallback("/products/p13");
  assert("Product lookup /products/p13 returns found=true and product details", singlePB.found === true && singlePB.product.name.includes("20000mAh"));
  assert("Product lookup includes vendor details", singlePB.product.vendor && singlePB.product.vendor.name === "TechSource India");

  // SUITE 3: BUYER WORKFLOWS (CART, PRICING TIERS, CHECKOUT)
  console.log("\n--- Suite 3: Buyer Workflows ---");

  // 3.1 Initial cart check
  const initCart = await handleMockFallback("/buyer/cart");
  assert("Buyer cart loads with items", Array.isArray(initCart.items));

  // 3.2 Add 20000mAh Power Bank to cart
  const cartAfterAdd = await handleMockFallback("/buyer/cart/items", { method: "POST", body: { productId: "p13", qty: 20 } });
  const pbCartItem = cartAfterAdd.items.find(i => i.productId === "p13");
  assert("Power bank added to cart successfully", !!pbCartItem);
  assert("Bulk tier applied for MOQ 20 on Power Bank (₹1150/unit)", pbCartItem && pbCartItem.unitPrice === 1150);

  // 3.3 Add Cotton Saree to cart
  const cartWithSaree = await handleMockFallback("/buyer/cart/items", { method: "POST", body: { productId: "p1", qty: 50 } });
  const sareeCartItem = cartWithSaree.items.find(i => i.productId === "p1");
  assert("Saree added to cart with tier quantity 50", !!sareeCartItem);
  assert("Bulk tier applied for qty 50 on Cotton Saree (₹710/unit)", sareeCartItem && sareeCartItem.unitPrice === 710);

  // 3.4 Verify GST & Totals
  assert("GST calculated at 18%", cartWithSaree.gst === Math.round(cartWithSaree.subtotal * 0.18));
  assert("Shipping fee is applied (₹300)", cartWithSaree.shipping === 300);
  assert("Cart total equals subtotal + shipping + gst", cartWithSaree.total === cartWithSaree.subtotal + cartWithSaree.shipping + cartWithSaree.gst);

  // 3.5 Place Order
  const orderPayload = {
    paymentMethod: "UPI",
    addressId: "addr-1",
    total: cartWithSaree.total,
    items: cartWithSaree.items
  };
  const placedOrder = await handleMockFallback("/buyer/orders", { method: "POST", body: orderPayload });
  assert("Order placement returns valid order id starting with ORD-", placedOrder && placedOrder.id.startsWith("ORD-"));
  assert("Order status is set to Processing with timeline", placedOrder.vendorOrders[0].status === "Processing" && placedOrder.vendorOrders[0].timeline.length === 4);

  // 3.6 Verify Cart is cleared after order
  const cartAfterOrder = await handleMockFallback("/buyer/cart");
  assert("Cart is cleared after successful order placement", cartAfterOrder.items.length === 0);

  // 3.7 Request a Quote
  const quotePayload = {
    productId: "p13",
    productName: "20000mAh 65W Fast Charging Power Bank",
    vendorId: "v3",
    quantity: 500,
    targetPrice: 900,
    deliveryLocation: "Mumbai, Maharashtra",
    message: "Requirement for 500 units monthly wholesale supply."
  };
  const newQuote = await handleMockFallback("/buyer/quotes", { method: "POST", body: quotePayload });
  assert("Quote submission returns valid quote id starting with QT-", newQuote && newQuote.id.startsWith("QT-"));
  assert("Quote quantity and target price match input", newQuote.quantity === 500 && newQuote.targetPrice === 900);

  // SUITE 4: ROLE SWITCHING & AUTH
  console.log("\n--- Suite 4: Role Switching & Auth ---");

  // 4.1 Demo login as Buyer
  const buyerSession = await handleMockFallback("/auth/demo-login", { method: "POST", body: { role: "buyer" } });
  assert("Buyer demo login succeeds with JWT and user Anita Rao", buyerSession.user.role === "buyer" && buyerSession.user.name === "Anita Rao");

  // 4.2 Demo login as Vendor
  const vendorSession = await handleMockFallback("/auth/demo-login", { method: "POST", body: { role: "vendor" } });
  assert("Vendor demo login succeeds with vendorId v1", vendorSession.user.role === "vendor" && vendorSession.user.vendorId === "v1");

  // 4.3 Demo login as Admin
  const adminSession = await handleMockFallback("/auth/demo-login", { method: "POST", body: { role: "admin" } });
  assert("Admin demo login succeeds with role admin", adminSession.user.role === "admin" && adminSession.user.name === "Priya Sundaram");

  // SUITE 5: VENDOR & ADMIN DASHBOARDS
  console.log("\n--- Suite 5: Vendor & Admin Portals ---");

  // 5.1 Vendor products list
  const vendorProducts = await handleMockFallback("/vendor/products");
  assert("Vendor products list returns products for Sri Lakshmi Handlooms (v1)", vendorProducts.every(p => p.vendorId === "v1"));

  // 5.2 Vendor earnings
  const vendorEarnings = await handleMockFallback("/vendor/earnings");
  assert("Vendor earnings endpoint returns financial metrics", vendorEarnings.totalSales > 0 && vendorEarnings.availableBalance > 0);

  // 5.3 Admin dashboard
  const adminStats = await handleMockFallback("/admin/dashboard");
  assert("Admin dashboard metrics return totalVendors, totalOrders, totalProducts", adminStats.totalVendors >= 10 && adminStats.totalProducts >= 14);

  console.log("\n=== TEST EXECUTION COMPLETE ===");
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  console.log(`Summary: Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  // Write results JSON for artifact documentation
  fs.writeFileSync(
    path.join(process.cwd(), "test_results.json"),
    JSON.stringify({ total: results.length, passed, failed, results }, null, 2)
  );

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
