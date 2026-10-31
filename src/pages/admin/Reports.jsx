import PageHeader from "../../components/dashboard/PageHeader.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import ChartCard from "../../components/dashboard/ChartCard.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import { Wallet, ShoppingBag } from "lucide-react";
import { useAsync } from "../../hooks/useAsync.js";
import { getReports } from "../../services/adminService.js";
import { formatCurrency } from "../../utils/format.js";

export default function AdminReports() {
  const { data: reports, loading } = useAsync(() => getReports(), []);

  const columns = [
    { key: "name", header: "Product" },
    { key: "category", header: "Category" },
    { key: "rating", header: "Rating", render: (p) => `${p.rating}★ (${p.reviewCount})` },
    { key: "price", header: "Price", render: (p) => formatCurrency(p.price) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Marketplace performance at a glance." />

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Total Revenue" value={formatCurrency(reports?.totalRevenue || 0)} icon={Wallet} />
        <StatCard label="Total Orders" value={reports?.totalOrders ?? "—"} icon={ShoppingBag} />
      </div>

      {reports && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Revenue by Category" data={reports.revenueByCategory.map((r) => ({ label: r.category, value: r.revenue }))} />
          <ChartCard title="Sales by Vendor" data={reports.salesByVendor.map((r) => ({ label: r.vendor, value: r.sales }))} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text">Top Products</h2>
        <DataTable columns={columns} data={reports?.topProducts ?? []} loading={loading} emptyTitle="No product data" />
      </div>
    </div>
  );
}
