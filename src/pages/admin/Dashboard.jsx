import { Link } from "react-router-dom";
import { Wallet, ShoppingBag, Store, Users, ArrowRight } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import ChartCard from "../../components/dashboard/ChartCard.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Badge from "../../components/common/Badge.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import {
  getDashboardStats,
  getRecentOrders,
  getRecentVendorApplications,
  getTopProducts,
  getTopVendors,
  getReports,
} from "../../services/adminService.js";
import { demoUsers } from "../../data/users.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function AdminDashboard() {
  const { data: stats } = useAsync(() => getDashboardStats(), []);
  const { data: recentOrders, loading: ordersLoading } = useAsync(() => getRecentOrders(5), []);
  const { data: recentApplications } = useAsync(() => getRecentVendorApplications(5), []);
  const { data: topProducts } = useAsync(() => getTopProducts(5), []);
  const { data: topVendors } = useAsync(() => getTopVendors(5), []);
  const { data: reports } = useAsync(() => getReports(), []);

  const orderColumns = [
    { key: "id", header: "Order", render: (o) => <Link to={`/admin/orders/${o.id}`} className="font-medium text-brand-700 hover:underline">{o.id}</Link> },
    { key: "buyer", header: "Buyer", render: () => demoUsers.buyer.businessName },
    { key: "vendors", header: "Vendors", render: (o) => o.vendorCount },
    { key: "amount", header: "Amount", render: (o) => formatCurrency(o.total) },
    { key: "date", header: "Date", render: (o) => formatDate(o.placedAt) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Admin Dashboard" description="Marketplace overview and pending actions." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon={Wallet} />
        <StatCard label="Orders" value={stats?.totalOrders ?? "—"} icon={ShoppingBag} />
        <StatCard label="Approved Vendors" value={stats?.approvedVendors ?? "—"} icon={Store} />
        <StatCard label="Buyers" value={stats?.totalBuyers ?? "—"} icon={Users} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link to="/admin/vendors?status=Pending" className="rounded-lg border border-border bg-white p-4 hover:border-brand-300">
          <p className="text-xs text-text-secondary">Pending Vendor Approvals</p>
          <p className="mt-1 text-xl font-semibold text-text">{stats?.pendingVendorApprovals ?? "—"}</p>
        </Link>
        <Link to="/admin/products?status=Pending Approval" className="rounded-lg border border-border bg-white p-4 hover:border-brand-300">
          <p className="text-xs text-text-secondary">Pending Product Approvals</p>
          <p className="mt-1 text-xl font-semibold text-text">{stats?.pendingProductApprovals ?? "—"}</p>
        </Link>
        <Link to="/admin/refunds" className="rounded-lg border border-border bg-white p-4 hover:border-brand-300">
          <p className="text-xs text-text-secondary">Refund Requests</p>
          <p className="mt-1 text-xl font-semibold text-text">{stats?.pendingRefunds ?? "—"}</p>
        </Link>
        <Link to="/admin/payouts" className="rounded-lg border border-border bg-white p-4 hover:border-brand-300">
          <p className="text-xs text-text-secondary">Payout Requests</p>
          <p className="mt-1 text-xl font-semibold text-text">{stats?.pendingPayoutRequests ?? "—"}</p>
        </Link>
      </div>

      {reports && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Revenue by Category" data={reports.revenueByCategory.map((r) => ({ label: r.category, value: r.revenue }))} />
          <ChartCard title="Sales by Vendor" data={reports.salesByVendor.map((r) => ({ label: r.vendor, value: r.sales }))} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Recent Orders</h2>
          <Link to="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <DataTable columns={orderColumns} data={recentOrders ?? []} loading={ordersLoading} emptyTitle="No orders yet" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text">Recent Vendor Applications</h2>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4">
            {(recentApplications ?? []).map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0 last:pb-0">
                <span className="text-text">{v.name}</span>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text">Top Products</h2>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4">
            {(topProducts ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0 last:pb-0">
                <span className="text-text">{p.name}</span>
                <Badge tone="brand">{p.rating}★</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text">Top Vendors</h2>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4">
            {(topVendors ?? []).map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0 last:pb-0">
                <span className="text-text">{v.name}</span>
                <span className="font-medium text-text">{formatCurrency(v.totalSales)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
