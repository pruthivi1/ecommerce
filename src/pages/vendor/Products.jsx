import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, PowerOff, Power } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Select from "../../components/common/Select.jsx";
import ImageWithFallback from "../../components/common/ImageWithFallback.jsx";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { getProductsByVendor, setProductStatus } from "../../services/productService.js";
import { formatCurrency } from "../../utils/format.js";
import { PRODUCT_STATUS } from "../../utils/constants.js";

export default function VendorProducts() {
  const { user } = useAuth();
  const { show } = useToast();
  const vendorId = user?.vendorId || "v1";
  const [statusFilter, setStatusFilter] = useState("");
  const [toggleTarget, setToggleTarget] = useState(null);

  const { data: products, loading, setData } = useAsync(() => getProductsByVendor(vendorId), [vendorId]);

  const filtered = (products ?? []).filter((p) => !statusFilter || p.status === statusFilter);

  const confirmToggle = async () => {
    const nextStatus = toggleTarget.status === PRODUCT_STATUS.INACTIVE ? PRODUCT_STATUS.ACTIVE : PRODUCT_STATUS.INACTIVE;
    await setProductStatus(toggleTarget.id, nextStatus);
    const updated = await getProductsByVendor(vendorId);
    setData(updated);
    show(`${toggleTarget.name} ${nextStatus === PRODUCT_STATUS.INACTIVE ? "deactivated" : "activated"}.`, { type: "success" });
    setToggleTarget(null);
  };

  const columns = [
    {
      key: "image",
      header: "",
      render: (p) => (
        <div className="h-11 w-11 overflow-hidden rounded-md border border-border bg-slate-100">
          <ImageWithFallback src={p.images?.[0]} alt={p.name} className="h-full w-full object-cover" />
        </div>
      ),
    },
    {
      key: "name",
      header: "Product",
      render: (p) => (
        <Link to={`/vendor/products/${p.id}/edit`} className="font-medium text-text hover:text-brand-700">
          {p.name}
        </Link>
      ),
    },
    { key: "sku", header: "SKU" },
    { key: "price", header: "Price", render: (p) => formatCurrency(p.price) },
    { key: "moq", header: "MOQ", render: (p) => `${p.moq} ${p.moqUnit}` },
    { key: "stock", header: "Stock", render: (p) => p.stock },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={p.status} />
          {p.status === PRODUCT_STATUS.REJECTED && p.rejectionReason && (
            <span className="max-w-[16rem] text-xs text-error-600">{p.rejectionReason}</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center gap-1">
          <Link to={`/products/${p.id}`} aria-label="View product" className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100">
            <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link to={`/vendor/products/${p.id}/edit`} aria-label="Edit product" className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100">
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setToggleTarget(p)}
            aria-label={p.status === PRODUCT_STATUS.INACTIVE ? "Activate product" : "Deactivate product"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100"
          >
            {p.status === PRODUCT_STATUS.INACTIVE ? (
              <Power className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <PowerOff className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog."
        actions={
          <Button as={Link} to="/vendor/products/new" size="sm">
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Add Product
          </Button>
        }
      />

      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        options={Object.values(PRODUCT_STATUS)}
        placeholder="All statuses"
        containerClassName="max-w-xs"
      />

      <DataTable columns={columns} data={filtered} loading={loading} emptyTitle="No products yet" emptyDescription="Add your first product to start selling." />

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={confirmToggle}
        title={toggleTarget?.status === PRODUCT_STATUS.INACTIVE ? "Activate Product" : "Deactivate Product"}
        description={`Are you sure you want to ${toggleTarget?.status === PRODUCT_STATUS.INACTIVE ? "activate" : "deactivate"} "${toggleTarget?.name}"?`}
      />
    </div>
  );
}
