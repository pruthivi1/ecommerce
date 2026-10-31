import PageHeader from "../../components/dashboard/PageHeader.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import { Wallet, Clock } from "lucide-react";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { getVendorEarnings } from "../../services/vendorService.js";
import { getPayouts, requestPayout } from "../../services/payoutService.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function VendorPayouts() {
  const { user } = useAuth();
  const { show } = useToast();
  const vendorId = user?.vendorId || "v1";
  const { data: earnings, setData: setEarnings } = useAsync(() => getVendorEarnings(), []);
  const { data: payouts, loading, setData } = useAsync(() => getPayouts({ vendorId }), [vendorId]);

  const pendingPayout = (payouts ?? []).filter((p) => p.status === "Pending" || p.status === "Processing").reduce((sum, p) => sum + Number(p.amount), 0);

  const handleRequest = async () => {
    await requestPayout({ vendorId, amount: earnings?.availableBalance || 0 });
    setData(await getPayouts({ vendorId }));
    setEarnings(await getVendorEarnings());
    show("Payout requested. The admin team will review it shortly.", { type: "success" });
  };

  const columns = [
    { key: "id", header: "Payout" },
    { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount) },
    { key: "requestedDate", header: "Requested Date", render: (p) => formatDate(p.requestedDate) },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payouts"
        description="Prototype only — no funds are actually transferred."
        actions={
          <Button size="sm" onClick={handleRequest} disabled={!earnings?.availableBalance}>
            Request Payout
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <StatCard label="Pending Payout" value={formatCurrency(pendingPayout)} icon={Clock} />
        <StatCard label="Available Balance" value={formatCurrency(earnings?.availableBalance || 0)} icon={Wallet} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text">Payout History</h2>
        <DataTable columns={columns} data={payouts ?? []} loading={loading} emptyTitle="No payouts yet" />
      </div>
    </div>
  );
}
