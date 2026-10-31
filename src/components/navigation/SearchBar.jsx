import { Search } from "lucide-react";

export default function SearchBar({ className = "" }) {
  return (
    <form
      role="search"
      className={`group flex w-full items-center gap-2 rounded-md border border-border bg-white px-3.5 py-2.5 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 ${className}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <Search className="h-4.5 w-4.5 shrink-0 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
      <label htmlFor="marketplace-search" className="sr-only">
        Search products, suppliers or categories
      </label>
      <input
        id="marketplace-search"
        type="search"
        placeholder="Search products, suppliers or categories..."
        className="w-full bg-transparent text-sm text-text placeholder:text-text-secondary focus:outline-none"
      />
    </form>
  );
}
