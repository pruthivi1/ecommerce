import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Select from "../../components/common/Select.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getOrders } from "../../services/orderService.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

const STATUS_OPTIONS = ["Pending", "Accepted", "Processing", "Ready to Ship", "Shipped", "Delivered", "Cancelled", "Return Requested"];

export default function BuyerOrders() {
  const { user } = useAuth();
  const buyerId = user?.id || "buyer-1";
  const [status, setStatus] = useState("");

  const { data: orders, loading } = useAsync(() => getOrders({ buyerId }), [buyerId]);

  const filtered = (orders ?? []).filter((o) => !status || o.vendorOrders.some((vo) => vo.status === status));

  const columns = [
    { key: "id", header: "Order", render: (o) => <Link to={`/buyer/orders/${o.id}`} className="font-medium text-brand-700 hover:underline">{o.id}</Link> },
    { key: "date", header: "Date", render: (o) => formatDate(o.placedAt) },
    { key: "vendors", header: "Vendors", render: (o) => o.vendorOrders.length },
    { key: "items", header: "Items", render: (o) => o.vendorOrders.reduce((sum, vo) => sum + vo.items.reduce((s, i) => s + i.qty, 0), 0) },
    { key: "total", header: "Amount", render: (o) => formatCurrency(o.total) },
    {
      key: "status",
      header: "Status",
      render: (o) =>
        o.vendorOrders.length === 1 ? (
          <StatusBadge status={o.vendorOrders[0].status} />
        ) : (
          <span className="flex flex-wrap gap-1">
            {o.vendorOrders.map((vo) => (
              <StatusBadge key={vo.id} status={vo.status} />
            ))}
          </span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Orders" description="Track and manage your wholesale orders." />

      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={STATUS_OPTIONS}
        placeholder="All statuses"
        containerClassName="max-w-xs"
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="You haven't placed any orders yet."
        emptyDescription="Browse the marketplace to place your first order."
      />
    </div>
  );
}
