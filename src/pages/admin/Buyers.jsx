import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getBuyers } from "../../services/adminService.js";
import { getOrders } from "../../services/orderService.js";
import { formatDate } from "../../utils/format.js";

export default function AdminBuyers() {
  const { data: buyers, loading } = useAsync(() => getBuyers(), []);
  const { data: orders } = useAsync(() => getOrders(), []);

  const columns = [
    { key: "businessName", header: "Business" },
    { key: "name", header: "Contact" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "orders", header: "Orders", render: (b) => (orders ?? []).filter((o) => o.buyerId === b.id).length },
    { key: "joinedDate", header: "Joined", render: (b) => formatDate(b.joinedDate) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Buyers" description="Business buyers registered on the marketplace." />
      <DataTable columns={columns} data={buyers ?? []} loading={loading} emptyTitle="No buyers yet" />
    </div>
  );
}
