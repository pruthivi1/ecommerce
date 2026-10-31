import { Link } from "react-router-dom";
import { Wallet, ShoppingBag, Package, Banknote, ArrowRight, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import ChartCard from "../../components/dashboard/ChartCard.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getVendorById } from "../../services/vendorService.js";
import { getVendorOrders } from "../../services/orderService.js";
import { getQuotes } from "../../services/quoteService.js";
import { getProductsByVendor } from "../../services/productService.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function VendorDashboard() {
  const { user } = useAuth();
  const vendorId = user?.vendorId || "v1";

  const { data: vendor } = useAsync(() => getVendorById(vendorId), [vendorId]);
  const { data: vendorOrders, loading: ordersLoading } = useAsync(() => getVendorOrders(vendorId), [vendorId]);
  const { data: products } = useAsync(() => getProductsByVendor(vendorId), [vendorId]);
  const { data: quotes } = useAsync(() => getQuotes({ vendorId }), [vendorId]);

  const lowStock = (products ?? []).filter((p) => p.stock > 0 && p.stock < 100);
  const pendingQuotes = (quotes ?? []).filter((q) => q.status === "Pending");

  const salesByStatus = (vendorOrders ?? []).reduce((acc, vo) => {
    acc[vo.status] = (acc[vo.status] || 0) + vo.subtotal;
    return acc;
  }, {});

  const columns = [
    { key: "orderId", header: "Order", render: (vo) => <Link to={`/vendor/orders/${vo.orderId}`} className="font-medium text-brand-700 hover:underline">{vo.orderId}</Link> },
    { key: "items", header: "Items", render: (vo) => vo.items.map((i) => i.name).join(", ") },
    { key: "amount", header: "Amount", render: (vo) => formatCurrency(vo.subtotal) },
    { key: "date", header: "Date", render: (vo) => formatDate(vo.placedAt) },
    { key: "status", header: "Status", render: (vo) => <StatusBadge status={vo.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Welcome back, ${vendor?.name || "Vendor"}`} description="Here's how your store is performing." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Sales" value={formatCurrency(vendor?.totalSales || 0)} icon={Wallet} />
        <StatCard label="Orders" value={vendor?.totalOrders || 0} icon={ShoppingBag} />
        <StatCard label="Products" value={products?.length ?? 0} icon={Package} />
        <StatCard label="Pending Payout" value={formatCurrency(vendor?.pendingPayout || 0)} icon={Banknote} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Sales by Order Status"
          description="Value of current orders grouped by fulfilment status."
          data={Object.entries(salesByStatus).map(([label, value]) => ({ label, value }))}
        />

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-text">Low Stock Products</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-text-secondary">All products are well stocked.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning-600" strokeWidth={1.75} aria-hidden="true" />
                    {p.name}
                  </span>
                  <span className="font-medium text-warning-600">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/vendor/inventory" className="mt-1 flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            Manage inventory <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Recent Orders</h2>
          <Link to="/vendor/orders" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <DataTable columns={columns} data={(vendorOrders ?? []).slice(0, 5)} loading={ordersLoading} emptyTitle="No orders yet" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Pending Quote Requests</h2>
          <Link to="/vendor/quotes" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          {pendingQuotes.length === 0 ? (
            <p className="text-sm text-text-secondary">No pending quote requests.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pendingQuotes.map((q) => (
                <li key={q.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0 last:pb-0">
                  <span className="text-text">{q.id} — Qty {q.quantity}</span>
                  <StatusBadge status={q.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
