import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Select from "../../components/common/Select.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../hooks/useToast.js";
import { getProducts, setProductStatus, requestProductChanges } from "../../services/productService.js";
import { formatCurrency } from "../../utils/format.js";
import { PRODUCT_STATUS } from "../../utils/constants.js";

export default function AdminProducts() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const { data: products, loading, setData } = useAsync(() => getProducts(), []);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [changesTarget, setChangesTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [changesMessage, setChangesMessage] = useState("");
  const { show } = useToast();

  const filtered = (products ?? []).filter((p) => !status || p.status === status);

  const refresh = async () => setData(await getProducts());

  const approve = async (product) => {
    await setProductStatus(product.id, PRODUCT_STATUS.ACTIVE);
    await refresh();
    show(`${product.name} approved.`, { type: "success" });
  };

  const reject = async () => {
    await setProductStatus(rejectTarget.id, PRODUCT_STATUS.REJECTED, reason);
    await refresh();
    show(`${rejectTarget.name} rejected.`, { type: "success" });
    setRejectTarget(null);
    setReason("");
  };

  const sendChangesRequest = async () => {
    await requestProductChanges(changesTarget.id, changesMessage);
    show(`Change request sent for ${changesTarget.name}.`, { type: "success" });
    setChangesTarget(null);
    setChangesMessage("");
  };

  const columns = [
    { key: "name", header: "Product" },
    { key: "vendor", header: "Vendor", render: (p) => p.vendor?.name || "—" },
    { key: "category", header: "Category" },
    { key: "price", header: "Price", render: (p) => formatCurrency(p.price) },
    { key: "moq", header: "MOQ", render: (p) => `${p.moq} ${p.moqUnit}` },
    { key: "stock", header: "Stock" },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          {p.status === PRODUCT_STATUS.PENDING_APPROVAL && (
            <>
              <Button size="sm" onClick={() => approve(p)}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => setRejectTarget(p)}>Reject</Button>
              <Button size="sm" variant="ghost" onClick={() => setChangesTarget(p)}>Request Changes</Button>
            </>
          )}
          <a href={`/products/${p.id}`} target="_blank" rel="noreferrer" aria-label="View product" className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100">
            <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Products" description="Review and manage marketplace products." />
      <Select value={status} onChange={(e) => setStatus(e.target.value)} options={Object.values(PRODUCT_STATUS)} placeholder="All statuses" containerClassName="max-w-xs" />
      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="No products found" />

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject Product"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={reject} disabled={!reason.trim()} className="bg-error-600 hover:bg-error-700 border-error-600">
              Confirm Rejection
            </Button>
          </>
        }
      >
        <Textarea label="Rejection Reason" required value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>

      <Modal
        open={!!changesTarget}
        onClose={() => setChangesTarget(null)}
        title="Request Changes"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setChangesTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={sendChangesRequest} disabled={!changesMessage.trim()}>Send Request</Button>
          </>
        }
      >
        <Textarea
          label="What needs to change?"
          required
          placeholder="e.g. Please add clearer product images..."
          value={changesMessage}
          onChange={(e) => setChangesMessage(e.target.value)}
        />
      </Modal>
    </div>
  );
}
