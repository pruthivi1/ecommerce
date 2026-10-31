import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getOrders } from "../../services/orderService.js";
import { getVendorById } from "../../data/vendors.js";
import { demoUsers } from "../../data/users.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function AdminOrders() {
  const { data: orders, loading } = useAsync(() => getOrders(), []);

  const columns = [
    { key: "id", header: "Order ID", render: (o) => <Link to={`/admin/orders/${o.id}`} className="font-medium text-brand-700 hover:underline">{o.id}</Link> },
    { key: "buyer", header: "Buyer", render: () => demoUsers.buyer.businessName },
    { key: "vendors", header: "Vendors", render: (o) => o.vendorOrders.map((vo) => getVendorById(vo.vendorId)?.name).join(", ") },
    { key: "amount", header: "Amount", render: (o) => formatCurrency(o.total) },
    { key: "payment", header: "Payment", render: (o) => <StatusBadge status={o.paymentStatus} /> },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <span className="flex flex-wrap gap-1">
          {o.vendorOrders.map((vo) => (
            <StatusBadge key={vo.id} status={vo.status} />
          ))}
        </span>
      ),
    },
    { key: "date", header: "Date", render: (o) => formatDate(o.placedAt) },
    {
      key: "actions",
      header: "",
      render: (o) => (
        <Link to={`/admin/orders/${o.id}`} aria-label="View order" className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100">
          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="All marketplace orders across vendors." />
      <DataTable columns={columns} data={orders ?? []} loading={loading} emptyTitle="No orders yet" />
    </div>
  );
}
