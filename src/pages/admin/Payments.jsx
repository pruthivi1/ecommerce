import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { demoUsers } from "../../data/users.js";
import { useAsync } from "../../hooks/useAsync.js";
import { getPayments } from "../../services/adminService.js";
import { formatCurrency, formatDateTime } from "../../utils/format.js";

export default function AdminPayments() {
  const { data: payments, loading } = useAsync(() => getPayments(), []);

  const columns = [
    { key: "id", header: "Payment ID" },
    { key: "orderId", header: "Order" },
    { key: "buyer", header: "Buyer", render: () => demoUsers.buyer.businessName },
    { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount) },
    { key: "method", header: "Method" },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { key: "date", header: "Date", render: (p) => formatDateTime(p.date) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description="All payment transactions on the marketplace." />
      <DataTable columns={columns} data={payments ?? []} loading={loading} emptyTitle="No payments yet" />
    </div>
  );
}
