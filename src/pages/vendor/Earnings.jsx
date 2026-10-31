import PageHeader from "../../components/dashboard/PageHeader.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { Wallet, Percent, PiggyBank, Banknote } from "lucide-react";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getVendorById, getVendorEarnings } from "../../services/vendorService.js";
import { getVendorOrders } from "../../services/orderService.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function VendorEarnings() {
  const { user } = useAuth();
  const vendorId = user?.vendorId || "v1";
  const { data: vendor } = useAsync(() => getVendorById(vendorId), [vendorId]);
  const { data: earnings } = useAsync(() => getVendorEarnings(), []);
  const { data: vendorOrders, loading } = useAsync(() => getVendorOrders(vendorId), [vendorId]);

  const rate = Number(vendor?.commissionRate ?? 0.08);
  const transactions = (vendorOrders ?? []).map((vo) => {
    const commission = Math.round(vo.subtotal * rate);
    return {
      id: vo.id,
      orderId: vo.orderId,
      gross: vo.subtotal,
      commission,
      net: vo.subtotal - commission,
      date: vo.placedAt,
      status: vo.status,
    };
  });

  const totalGross = transactions.reduce((sum, t) => sum + t.gross, 0);
  const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);
  const netEarnings = totalGross - totalCommission;

  const columns = [
    { key: "orderId", header: "Order" },
    { key: "gross", header: "Gross", render: (t) => formatCurrency(t.gross) },
    { key: "commission", header: "Commission", render: (t) => formatCurrency(t.commission) },
    { key: "net", header: "Net", render: (t) => formatCurrency(t.net) },
    { key: "date", header: "Date", render: (t) => formatDate(t.date) },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Earnings" description={`Platform commission rate: ${Math.round(rate * 100)}%`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Sales" value={formatCurrency(totalGross)} icon={Wallet} />
        <StatCard label="Platform Commission" value={formatCurrency(totalCommission)} icon={Percent} />
        <StatCard label="Net Earnings" value={formatCurrency(netEarnings)} icon={PiggyBank} />
        <StatCard label="Available Balance" value={formatCurrency(earnings?.availableBalance || 0)} icon={Banknote} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text">Transactions</h2>
        <DataTable columns={columns} data={transactions} loading={loading} emptyTitle="No transactions yet" />
      </div>
    </div>
  );
}
