import { useState } from "react";
import { AlertTriangle, Check, Pencil } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import DataTable from "../../components/dashboard/DataTable.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useToast } from "../../hooks/useToast.js";
import { getProductsByVendor, updateStock } from "../../services/productService.js";
import { PRODUCT_STATUS } from "../../utils/constants.js";

export default function VendorInventory() {
  const { user } = useAuth();
  const { show } = useToast();
  const vendorId = user?.vendorId || "v1";
  const { data: products, loading, setData } = useAsync(() => getProductsByVendor(vendorId), [vendorId]);
  const [editingId, setEditingId] = useState(null);
  const [draftValue, setDraftValue] = useState("");

  const startEdit = (product) => {
    setEditingId(product.id);
    setDraftValue(String(product.stock));
  };

  const saveEdit = async (product) => {
    const stock = Math.max(0, Number(draftValue) || 0);
    await updateStock(product.id, stock);
    const updated = await getProductsByVendor(vendorId);
    setData(updated);
    setEditingId(null);
    show(`Stock updated for ${product.name}.`, { type: "success" });
  };

  const columns = [
    { key: "name", header: "Product" },
    { key: "sku", header: "SKU" },
    { key: "stock", header: "Current Stock", render: (p) => (editingId === p.id ? (
      <input
        type="number"
        min={0}
        value={draftValue}
        onChange={(e) => setDraftValue(e.target.value)}
        className="w-20 rounded-md border border-border px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
        autoFocus
      />
    ) : p.stock) },
    { key: "reserved", header: "Reserved", render: () => 0 },
    { key: "available", header: "Available", render: (p) => p.stock },
    {
      key: "lowStock",
      header: "Low Stock",
      render: (p) =>
        p.stock > 0 && p.stock < (p.lowStockThreshold || 100) ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-600">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" /> Low
          </span>
        ) : (
          <span className="text-xs text-text-secondary">—</span>
        ),
    },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.stock === 0 ? PRODUCT_STATUS.OUT_OF_STOCK : p.status} /> },
    {
      key: "actions",
      header: "",
      render: (p) =>
        editingId === p.id ? (
          <button type="button" onClick={() => saveEdit(p)} aria-label="Save stock" className="flex h-8 w-8 items-center justify-center rounded-md text-success-600 hover:bg-success-50">
            <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" onClick={() => startEdit(p)} aria-label="Edit stock" className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100">
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventory" description="Manage stock levels across your products." />
      <DataTable columns={columns} data={products ?? []} loading={loading} emptyTitle="No products to manage" />
    </div>
  );
}
