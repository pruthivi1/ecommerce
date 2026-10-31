import { Link } from "react-router-dom";
import { Package, Clock, FileText, Wallet, ArrowRight } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import SupplierCard from "../../components/supplier/SupplierCard.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getOrders } from "../../services/orderService.js";
import { getQuotes } from "../../services/quoteService.js";
import { getVendors } from "../../services/vendorService.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const buyerId = user?.id || "buyer-1";

  const { data: orders, loading: ordersLoading } = useAsync(() => getOrders({ buyerId }), [buyerId]);
  const { data: quotes } = useAsync(() => getQuotes({ buyerId }), [buyerId]);
  const { data: vendors } = useAsync(() => getVendors({ publicOnly: true }), []);

  const activeOrders = (orders ?? []).filter((o) =>
    o.vendorOrders.some((vo) => !["Delivered", "Cancelled", "Return Requested"].includes(vo.status))
  ).length;
  const pendingQuotes = (quotes ?? []).filter((q) => q.status === "Pending" || q.status === "Counter Offer").length;
  const totalPurchases = (orders ?? []).reduce((sum, o) => sum + o.total, 0);

  const columns = [
    { key: "id", header: "Order", render: (o) => <Link to={`/buyer/orders/${o.id}`} className="font-medium text-brand-700 hover:underline">{o.id}</Link> },
    { key: "product", header: "Product", render: (o) => o.vendorOrders[0]?.items[0]?.name + (o.vendorOrders.length > 1 || o.vendorOrders[0]?.items.length > 1 ? " + more" : "") },
    { key: "vendor", header: "Vendor", render: (o) => vendors?.find((v) => v.id === o.vendorOrders[0]?.vendorId)?.name || "—" },
    { key: "total", header: "Amount", render: (o) => formatCurrency(o.total) },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.vendorOrders[0]?.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Good morning, ${user?.businessName || "there"}`}
        description="Here's what's happening with your account today."
        actions={
          <Button as={Link} to="/products" size="sm">
            Explore Products
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Orders" value={orders?.length ?? "—"} icon={Package} />
        <StatCard label="Active Orders" value={activeOrders} icon={Clock} />
        <StatCard label="Pending Quotes" value={pendingQuotes} icon={FileText} />
        <StatCard label="Total Purchases" value={formatCurrency(totalPurchases)} icon={Wallet} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Recent Orders</h2>
          <Link to="/buyer/orders" className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
        <DataTable columns={columns} data={(orders ?? []).slice(0, 5)} loading={ordersLoading} emptyTitle="No orders yet" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text">Pending Quote Requests</h2>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4">
            {(quotes ?? []).filter((q) => q.status === "Pending" || q.status === "Counter Offer").length === 0 && (
              <p className="text-sm text-text-secondary">No pending quote requests.</p>
            )}
            {(quotes ?? [])
              .filter((q) => q.status === "Pending" || q.status === "Counter Offer")
              .map((q) => (
                <div key={q.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-text">{q.id}</p>
                    <p className="text-xs text-text-secondary">Qty {q.quantity} · Requested {formatDate(q.createdAt)}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-text">Recommended Suppliers</h2>
          {!vendors ? (
            <LoadingState count={2} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {vendors.slice(0, 2).map((v) => (
                <SupplierCard key={v.id} supplier={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
