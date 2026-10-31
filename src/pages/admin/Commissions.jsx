import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getCommissions, getCommissionRate, setCommissionRate } from "../../services/adminService.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function AdminCommissions() {
  const { data: commissions, loading } = useAsync(() => getCommissions(), []);
  const { data: rate, setData: setRate } = useAsync(() => getCommissionRate(), []);
  const [draftRate, setDraftRate] = useState("");
  const { show } = useToast();

  const columns = [
    { key: "orderId", header: "Order" },
    { key: "vendorName", header: "Vendor" },
    { key: "gross", header: "Gross Amount", render: (c) => formatCurrency(c.gross) },
    { key: "commission", header: "Commission", render: (c) => formatCurrency(c.commission) },
    { key: "net", header: "Vendor Amount", render: (c) => formatCurrency(c.net) },
    { key: "date", header: "Date", render: (c) => formatDate(c.date) },
  ];

  const handleSaveRate = async () => {
    const value = Number(draftRate) / 100;
    if (!value || value <= 0 || value > 1) {
      show("Enter a commission rate between 1 and 100.", { type: "error" });
      return;
    }
    const updated = await setCommissionRate(value);
    setRate(updated);
    setDraftRate("");
    show("Default commission rate updated for future orders.", { type: "success" });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Commissions" description="Platform commission earned across vendor sales." />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-white p-4">
        <div>
          <p className="text-xs text-text-secondary">Current default rate</p>
          <p className="text-lg font-semibold text-text">{rate != null ? `${Math.round(rate * 100)}%` : "—"}</p>
        </div>
        <Input label="New default rate (%)" type="number" min={1} max={100} value={draftRate} onChange={(e) => setDraftRate(e.target.value)} containerClassName="w-40" />
        <Button size="sm" onClick={handleSaveRate}>Update Rate</Button>
      </div>

      <DataTable columns={columns} data={commissions ?? []} loading={loading} emptyTitle="No commission records" />
    </div>
  );
}
