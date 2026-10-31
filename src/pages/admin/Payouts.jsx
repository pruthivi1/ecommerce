import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Select from "../../components/common/Select.jsx";
import Button from "../../components/common/Button.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getPayouts, updatePayoutStatus } from "../../services/payoutService.js";
import { getVendorById } from "../../data/vendors.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { PAYOUT_STATUS } from "../../utils/constants.js";

export default function AdminPayouts() {
  const [status, setStatus] = useState("");
  const { data: payouts, loading, setData } = useAsync(() => getPayouts(), []);
  const { show } = useToast();

  const filtered = (payouts ?? []).filter((p) => !status || p.status === status);

  const updateStatus = async (id, nextStatus) => {
    await updatePayoutStatus(id, nextStatus);
    setData(await getPayouts());
    show(`Payout ${id} marked as ${nextStatus}.`, { type: "success" });
  };

  const columns = [
    { key: "id", header: "Payout" },
    { key: "vendor", header: "Vendor", render: (p) => getVendorById(p.vendorId)?.name || "—" },
    { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount) },
    { key: "requestedDate", header: "Requested Date", render: (p) => formatDate(p.requestedDate) },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "actions",
      header: "",
      render: (p) =>
        p.status === PAYOUT_STATUS.PENDING ? (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={() => updateStatus(p.id, PAYOUT_STATUS.PROCESSING)}>Process</Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, PAYOUT_STATUS.REJECTED)}>Reject</Button>
          </div>
        ) : p.status === PAYOUT_STATUS.PROCESSING ? (
          <Button size="sm" onClick={() => updateStatus(p.id, PAYOUT_STATUS.COMPLETED)}>Mark Completed</Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payouts" description="Vendor payout requests. Prototype only — no funds move." />
      <Select value={status} onChange={(e) => setStatus(e.target.value)} options={Object.values(PAYOUT_STATUS)} placeholder="All statuses" containerClassName="max-w-xs" />
      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="No payout requests" />
    </div>
  );
}
