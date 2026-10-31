import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Select from "../../components/common/Select.jsx";
import Checkbox from "../../components/common/Checkbox.jsx";
import SupplierCard from "../../components/supplier/SupplierCard.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getVendors } from "../../services/vendorService.js";
import { getCategories } from "../../services/categoryService.js";
import { LOCATIONS } from "../../utils/constants.js";

export default function SupplierListing() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState("");

  const { data: vendors, loading } = useAsync(() => getVendors({ publicOnly: true }), []);
  const { data: categories } = useAsync(() => getCategories(), []);

  const filtered = useMemo(() => {
    if (!vendors) return [];
    let results = [...vendors];
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((v) => v.name.toLowerCase().includes(q));
    }
    if (category) results = results.filter((v) => v.categories.includes(category));
    if (location) results = results.filter((v) => v.location === location);
    if (verifiedOnly) results = results.filter((v) => v.verified);
    if (minRating) results = results.filter((v) => v.rating >= Number(minRating));
    return results;
  }, [vendors, search, category, location, verifiedOnly, minRating]);

  return (
    <Container className="flex flex-col gap-6 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Suppliers" }]} />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Verified Suppliers</h1>
        <p className="text-sm text-text-secondary">Connect with businesses supplying products across India.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers..."
            className="w-full rounded-md border border-border bg-white py-2.5 pl-10 pr-3.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={(categories ?? []).filter((c) => c.id !== "more").map((c) => c.name)}
          placeholder="All categories"
          containerClassName="sm:w-52"
        />
        <Select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          options={LOCATIONS}
          placeholder="All locations"
          containerClassName="sm:w-52"
        />
        <Select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          options={[{ value: "4", label: "4★ & above" }, { value: "3", label: "3★ & above" }]}
          placeholder="Any rating"
          containerClassName="sm:w-44"
        />
        <Checkbox label="Verified only" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="pb-2.5" />
      </div>

      {loading && <LoadingState count={4} />}
      {!loading && filtered.length === 0 && (
        <EmptyState title="No suppliers found" description="Try adjusting your search or filters." />
      )}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vendor) => (
            <SupplierCard key={vendor.id} supplier={vendor} />
          ))}
        </div>
      )}
    </Container>
  );
}
