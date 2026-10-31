import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Select from "../../components/common/Select.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getVendorOrders } from "../../services/orderService.js";
import { demoUsers } from "../../data/users.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

const STATUS_OPTIONS = ["Pending", "Accepted", "Processing", "Ready to Ship", "Shipped", "Delivered", "Cancelled", "Return Requested"];

export default function VendorOrders() {
  const { user } = useAuth();
  const vendorId = user?.vendorId || "v1";
  const [status, setStatus] = useState("");
  const { data: vendorOrders, loading } = useAsync(() => getVendorOrders(vendorId), [vendorId]);

  const filtered = (vendorOrders ?? []).filter((vo) => !status || vo.status === status);

  const columns = [
    { key: "orderId", header: "Order", render: (vo) => <Link to={`/vendor/orders/${vo.orderId}`} className="font-medium text-brand-700 hover:underline">{vo.orderId}</Link> },
    { key: "buyer", header: "Buyer", render: () => demoUsers.buyer.businessName },
    { key: "product", header: "Product", render: (vo) => vo.items.map((i) => i.name).join(", ") },
    { key: "quantity", header: "Quantity", render: (vo) => vo.items.reduce((sum, i) => sum + i.qty, 0) },
    { key: "amount", header: "Amount", render: (vo) => formatCurrency(vo.subtotal) },
    { key: "date", header: "Date", render: (vo) => formatDate(vo.placedAt) },
    { key: "status", header: "Status", render: (vo) => <StatusBadge status={vo.status} /> },
    {
      key: "actions",
      header: "",
      render: (vo) => (
        <Link to={`/vendor/orders/${vo.orderId}`} aria-label="View order" className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100">
          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="Manage and fulfil buyer orders." />
      <Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} placeholder="All statuses" containerClassName="max-w-xs" />
      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="No orders yet" />
    </div>
  );
}
