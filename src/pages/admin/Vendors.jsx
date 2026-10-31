import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Select from "../../components/common/Select.jsx";
import Button from "../../components/common/Button.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getVendors, setVendorStatus } from "../../services/vendorService.js";
import { formatDate } from "../../utils/format.js";
import { VENDOR_STATUS } from "../../utils/constants.js";

export default function AdminVendors() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const { data: vendors, loading, setData } = useAsync(() => getVendors(), []);
  const { show } = useToast();

  const filtered = (vendors ?? []).filter((v) => !status || v.status === status);

  const quickUpdate = async (vendor, nextStatus) => {
    const reason = nextStatus === VENDOR_STATUS.REJECTED ? "Application rejected by admin from the vendor list." : undefined;
    await setVendorStatus(vendor.id, nextStatus, reason);
    setData(await getVendors());
    show(`${vendor.name} ${nextStatus.toLowerCase()}.`, { type: "success" });
  };

  const columns = [
    { key: "name", header: "Vendor", render: (v) => <Link to={`/admin/vendors/${v.id}`} className="font-medium text-brand-700 hover:underline">{v.name}</Link> },
    { key: "business", header: "Business", render: (v) => v.businessName },
    { key: "location", header: "Location" },
    { key: "products", header: "Products", render: (v) => v.productsCount },
    { key: "orders", header: "Orders", render: (v) => v.totalOrders },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
    { key: "joined", header: "Joined", render: (v) => formatDate(v.joinedDate) },
    {
      key: "actions",
      header: "",
      render: (v) => (
        <div className="flex items-center gap-1">
          {v.status === VENDOR_STATUS.PENDING && (
            <>
              <Button size="sm" onClick={() => quickUpdate(v, VENDOR_STATUS.APPROVED)}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => quickUpdate(v, VENDOR_STATUS.REJECTED)}>Reject</Button>
            </>
          )}
          {v.status === VENDOR_STATUS.APPROVED && (
            <Button size="sm" variant="outline" onClick={() => quickUpdate(v, VENDOR_STATUS.SUSPENDED)}>Suspend</Button>
          )}
          {v.status === VENDOR_STATUS.SUSPENDED && (
            <Button size="sm" onClick={() => quickUpdate(v, VENDOR_STATUS.APPROVED)}>Reinstate</Button>
          )}
          <Link to={`/admin/vendors/${v.id}`} aria-label="View vendor" className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100">
            <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Vendors" description="Review and manage marketplace vendors." />
      <Select value={status} onChange={(e) => setStatus(e.target.value)} options={Object.values(VENDOR_STATUS)} placeholder="All statuses" containerClassName="max-w-xs" />
      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="No vendors found" />
    </div>
  );
}
