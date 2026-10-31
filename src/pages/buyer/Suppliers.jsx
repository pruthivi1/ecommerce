import { useState } from "react";
import PageHeader from "../../components/dashboard/PageHeader.jsx";
import SupplierCard from "../../components/supplier/SupplierCard.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getVendors } from "../../services/vendorService.js";

export default function BuyerSuppliers() {
  const [search, setSearch] = useState("");
  const { data: vendors, loading } = useAsync(() => getVendors({ publicOnly: true }), []);

  const filtered = (vendors ?? []).filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Suppliers" description="Suppliers you can source from on the marketplace." />

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search suppliers..."
        className="max-w-sm rounded-md border border-border bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />

      {loading && <LoadingState count={4} />}
      {!loading && filtered.length === 0 && <EmptyState title="No suppliers found" />}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vendor) => (
            <SupplierCard key={vendor.id} supplier={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
