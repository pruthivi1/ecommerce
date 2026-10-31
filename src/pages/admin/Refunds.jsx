import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import { demoUsers } from "../../data/users.js";
import { getVendorById } from "../../data/vendors.js";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getRefunds, setRefundStatus } from "../../services/adminService.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function AdminRefunds() {
  const { data: refunds, loading, setData } = useAsync(() => getRefunds(), []);
  const { show } = useToast();

  const updateStatus = async (id, status) => {
    await setRefundStatus(id, status);
    setData(await getRefunds());
    show(`Refund ${status.toLowerCase()}.`, { type: "success" });
  };

  const columns = [
    { key: "orderId", header: "Order" },
    { key: "buyer", header: "Buyer", render: () => demoUsers.buyer.businessName },
    { key: "vendor", header: "Vendor", render: (r) => getVendorById(r.vendorId)?.name || "—" },
    { key: "amount", header: "Amount", render: (r) => formatCurrency(r.amount) },
    { key: "reason", header: "Reason" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "date", header: "Requested", render: (r) => formatDate(r.requestedAt) },
    {
      key: "actions",
      header: "",
      render: (r) =>
        r.status === "Pending" ? (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => updateStatus(r.id, "Approved")}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "Rejected")}>Reject</Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Refunds" description="Review and manage buyer refund requests." />
      <DataTable columns={columns} data={refunds ?? []} loading={loading} emptyTitle="No refund requests" />
    </div>
  );
}
