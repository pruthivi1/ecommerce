import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search as SearchIcon, X } from "lucide-react";
import Container from "../../components/common/Container.jsx";
import Breadcrumb from "../../components/common/Breadcrumb.jsx";
import Select from "../../components/common/Select.jsx";
import Checkbox from "../../components/common/Checkbox.jsx";
import Button from "../../components/common/Button.jsx";
import Drawer from "../../components/common/Drawer.jsx";
import ProductCard from "../../components/product/ProductCard.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getProducts } from "../../services/productService.js";
import { getCategories } from "../../services/categoryService.js";
import { LOCATIONS, MOQ_RANGES } from "../../utils/constants.js";

const PAGE_SIZE = 8;
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

function FilterPanel({ filters, setFilters, categories }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">Category</h3>
        <div className="flex flex-col gap-2">
          {(categories ?? []).filter((c) => c.id !== "more").map((cat) => (
            <Checkbox
              key={cat.id}
              label={cat.name}
              checked={filters.category === cat.name}
              onChange={() => setFilters((f) => ({ ...f, category: f.category === cat.name ? "" : cat.name }))}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">Price Range (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <span className="text-text-secondary">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">MOQ</h3>
        <div className="flex flex-col gap-2">
          {MOQ_RANGES.map((range) => (
            <Checkbox
              key={range.id}
              label={range.label}
              checked={filters.moqRange === range.id}
              onChange={() => setFilters((f) => ({ ...f, moqRange: f.moqRange === range.id ? "" : range.id }))}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">Supplier Location</h3>
        <div className="flex flex-col gap-2">
          {LOCATIONS.map((loc) => (
            <Checkbox
              key={loc}
              label={loc}
              checked={filters.location === loc}
              onChange={() => setFilters((f) => ({ ...f, location: f.location === loc ? "" : loc }))}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">Rating</h3>
        <div className="flex flex-col gap-2">
          {[4, 3].map((r) => (
            <Checkbox
              key={r}
              label={`${r}★ & above`}
              checked={filters.minRating === r}
              onChange={() => setFilters((f) => ({ ...f, minRating: f.minRating === r ? null : r }))}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-text">Availability</h3>
        <Checkbox
          label="In stock only"
          checked={filters.inStockOnly}
          onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))}
        />
      </div>
    </div>
  );
}

export default function ProductListing() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: "",
    maxPrice: "",
    moqRange: "",
    location: "",
    minRating: null,
    inStockOnly: false,
  });

  const { data: categories } = useAsync(() => getCategories(), []);
  const { data: products, loading, error, setData } = useAsync(
    () => getProducts({ publicOnly: true }),
    []
  );

  const filtered = useMemo(() => {
    if (!products) return [];
    let results = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q) || p.vendor?.name.toLowerCase().includes(q));
    }
    if (filters.category) results = results.filter((p) => p.category === filters.category);
    if (filters.minPrice) results = results.filter((p) => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) results = results.filter((p) => p.price <= Number(filters.maxPrice));
    if (filters.moqRange) {
      const range = MOQ_RANGES.find((r) => r.id === filters.moqRange);
      if (range) results = results.filter((p) => p.moq >= range.min && p.moq <= range.max);
    }
    if (filters.location) results = results.filter((p) => p.location === filters.location);
    if (filters.minRating) results = results.filter((p) => p.rating >= filters.minRating);
    if (filters.inStockOnly) results = results.filter((p) => p.stock > 0);

    switch (sort) {
      case "price-asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return results;
  }, [products, search, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setFilters({ category: "", minPrice: "", maxPrice: "", moqRange: "", location: "", minRating: null, inStockOnly: false });
    setSearch("");
    setPage(1);
  };

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.moqRange ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0);

  return (
    <Container className="flex flex-col gap-6 py-8">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Products" }]} />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Wholesale Products</h1>
        <p className="text-sm text-text-secondary">
          Browse verified wholesale products with transparent MOQ and bulk pricing.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products or suppliers..."
            className="w-full rounded-md border border-border bg-white py-2.5 pl-10 pr-3.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={SORT_OPTIONS}
          placeholder="Sort by"
          containerClassName="sm:w-56"
        />
        <Button variant="outline" className="lg:hidden" onClick={() => setMobileFiltersOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4 rounded-lg border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Filters</h2>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-xs font-medium text-brand-700 hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} categories={categories} />
          </div>
        </aside>

        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-secondary">
            Showing <span className="font-medium text-text">{pageItems.length}</span> of{" "}
            <span className="font-medium text-text">{filtered.length}</span> products
          </p>

          {loading && <LoadingState count={8} />}
          {error && <ErrorState message={error} onRetry={() => setData(null)} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search term."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          )}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} className="pt-4" />
            </>
          )}
        </div>
      </div>

      <Drawer open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filters" side="left">
        <div className="flex flex-col gap-4">
          {activeFilterCount > 0 && (
            <button type="button" onClick={clearFilters} className="flex items-center gap-1 self-start text-xs font-medium text-brand-700">
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              Clear all filters
            </button>
          )}
          <FilterPanel filters={filters} setFilters={setFilters} categories={categories} />
        </div>
      </Drawer>
    </Container>
  );
}
