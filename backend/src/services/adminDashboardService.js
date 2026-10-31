import { query } from "../config/db.js";

export async function getDashboardStats() {
  const [[{ totalRevenue }], [{ totalOrders }], [{ approvedVendors }], [{ totalBuyers }], [{ pendingVendorApprovals }], [{ pendingProductApprovals }], [{ pendingRefunds }], [{ pendingPayoutRequests }]] =
    await Promise.all([
      query("SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders"),
      query("SELECT COUNT(*) AS totalOrders FROM orders"),
      query("SELECT COUNT(*) AS approvedVendors FROM vendors WHERE status = 'Approved'"),
      query("SELECT COUNT(*) AS totalBuyers FROM users WHERE role = 'buyer'"),
      query("SELECT COUNT(*) AS pendingVendorApprovals FROM vendors WHERE status = 'Pending'"),
      query("SELECT COUNT(*) AS pendingProductApprovals FROM products WHERE status = 'Pending Approval'"),
      query("SELECT COUNT(*) AS pendingRefunds FROM refunds WHERE status = 'Pending'"),
      query("SELECT COUNT(*) AS pendingPayoutRequests FROM payouts WHERE status = 'Pending'"),
    ]);

  return {
    totalRevenue: Number(totalRevenue),
    totalOrders,
    approvedVendors,
    totalBuyers,
    pendingVendorApprovals,
    pendingProductApprovals,
    pendingRefunds,
    pendingPayoutRequests,
  };
}

export async function getRecentOrders(limit = 5) {
  const rows = await query(
    `SELECT o.id, o.order_number, o.buyer_id, o.total, o.placed_at, COUNT(vo.id) AS vendor_count
     FROM orders o LEFT JOIN vendor_orders vo ON vo.order_id = o.id
     GROUP BY o.id ORDER BY o.placed_at DESC LIMIT :limit`,
    { limit }
  );
  return rows.map((r) => ({ id: r.id, orderNumber: r.order_number, buyerId: r.buyer_id, total: Number(r.total), placedAt: r.placed_at, vendorCount: r.vendor_count }));
}

export async function getRecentVendorApplications(limit = 5) {
  const rows = await query("SELECT id, name, business_name, status, joined_date FROM vendors ORDER BY joined_date DESC LIMIT :limit", { limit });
  return rows.map((r) => ({ id: r.id, name: r.name, businessName: r.business_name, status: r.status, joinedDate: r.joined_date }));
}

export async function getTopProducts(limit = 5) {
  return query(
    "SELECT id, name, rating, review_count FROM products WHERE status = 'Active' ORDER BY (rating * review_count) DESC LIMIT :limit",
    { limit }
  );
}

export async function getTopVendors(limit = 5) {
  return query(
    `SELECT v.id, v.name, COALESCE(SUM(vo.subtotal), 0) AS totalSales
     FROM vendors v LEFT JOIN vendor_orders vo ON vo.vendor_id = v.id
     WHERE v.status = 'Approved'
     GROUP BY v.id ORDER BY totalSales DESC LIMIT :limit`,
    { limit }
  );
}

export async function getPayments() {
  return query(
    `SELECT p.id, p.order_id, o.buyer_id, p.amount, p.method, p.status, p.created_at
     FROM payments p JOIN orders o ON o.id = p.order_id
     ORDER BY p.created_at DESC`
  );
}

export async function getReports() {
  const revenueByCategory = await query(
    `SELECT p.category_id AS category, SUM(oi.qty * oi.unit_price) AS revenue
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     GROUP BY p.category_id`
  );
  const salesByVendor = await query(
    `SELECT v.name AS vendor, COALESCE(SUM(vo.subtotal), 0) AS sales
     FROM vendors v LEFT JOIN vendor_orders vo ON vo.vendor_id = v.id
     GROUP BY v.id`
  );
  const [{ totalRevenue }] = await query("SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders");
  const [{ totalOrders }] = await query("SELECT COUNT(*) AS totalOrders FROM orders");
  const topProducts = await getTopProducts(5);

  return {
    totalRevenue: Number(totalRevenue),
    totalOrders,
    revenueByCategory: revenueByCategory.map((r) => ({ category: r.category, revenue: Number(r.revenue) })),
    salesByVendor: salesByVendor.map((r) => ({ vendor: r.vendor, sales: Number(r.sales) })),
    topProducts,
  };
}

export async function getBuyers() {
  return query("SELECT id, name, business_name, email, phone, gst_number, business_type, created_at FROM users WHERE role = 'buyer' ORDER BY created_at DESC");
}
