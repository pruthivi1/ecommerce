import { MapPin, Package, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import ImageWithFallback from "../common/ImageWithFallback.jsx";
import { VerifiedBadge } from "../common/Badge.jsx";
import Button from "../common/Button.jsx";

export default function SupplierCard({ supplier }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={supplier.image}
          alt={`${supplier.name} facility`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-text sm:text-lg">{supplier.name}</h3>
          <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            {supplier.location}
          </span>
        </div>

        <VerifiedBadge />

        <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <Package className="h-4 w-4 text-brand-600" strokeWidth={1.75} aria-hidden="true" />
            <dt className="sr-only">Products listed</dt>
            <dd className="text-sm font-semibold text-text">{supplier.productsCount}+</dd>
            <span className="text-[11px] text-text-secondary">Products</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Star className="h-4 w-4 fill-warning-500 text-warning-500" aria-hidden="true" />
            <dt className="sr-only">Rating</dt>
            <dd className="text-sm font-semibold text-text">{supplier.rating}</dd>
            <span className="text-[11px] text-text-secondary">Rating</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Clock className="h-4 w-4 text-brand-600" strokeWidth={1.75} aria-hidden="true" />
            <dt className="sr-only">Years of experience</dt>
            <dd className="text-sm font-semibold text-text">{supplier.yearsExperience}</dd>
            <span className="text-[11px] text-text-secondary">Years</span>
          </div>
        </dl>

        <Button as={Link} to={`/suppliers/${supplier.id}`} variant="secondary" className="mt-1 w-full">
          View Supplier
        </Button>
      </div>
    </div>
  );
}
