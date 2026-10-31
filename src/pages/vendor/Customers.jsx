import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getVendorOrders } from "../../services/orderService.js";
import { demoUsers } from "../../data/users.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function VendorCustomers() {
  const { user } = useAuth();
  const vendorId = user?.vendorId || "v1";
  const { data: vendorOrders, loading } = useAsync(() => getVendorOrders(vendorId), [vendorId]);

  const customersByBuyer = new Map();
  for (const vo of vendorOrders ?? []) {
    const existing = customersByBuyer.get(vo.buyerId) || { buyerId: vo.buyerId, orders: 0, total: 0, lastOrder: vo.placedAt };
    existing.orders += 1;
    existing.total += vo.subtotal;
    if (new Date(vo.placedAt) > new Date(existing.lastOrder)) existing.lastOrder = vo.placedAt;
    customersByBuyer.set(vo.buyerId, existing);
  }
  const customers = Array.from(customersByBuyer.values());

  const columns = [
    { key: "buyer", header: "Buyer", render: () => demoUsers.buyer.businessName },
    { key: "orders", header: "Orders", render: (c) => c.orders },
    { key: "total", header: "Total Spent", render: (c) => formatCurrency(c.total) },
    { key: "lastOrder", header: "Last Order", render: (c) => formatDate(c.lastOrder) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" description="Buyers who have purchased from your store." />
      <DataTable columns={columns} data={customers} keyField="buyerId" loading={loading} emptyTitle="No customers yet" />
    </div>
  );
}
