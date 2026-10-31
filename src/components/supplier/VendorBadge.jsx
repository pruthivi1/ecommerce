import { BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function VendorBadge({ vendor, className = "", linkTo }) {
  if (!vendor) return null;
  const content = (
    <span className={`inline-flex items-center gap-1.5 text-sm text-text ${className}`}>
      {vendor.name}
      {vendor.verified && <BadgeCheck className="h-3.5 w-3.5 text-success-600" strokeWidth={2} aria-hidden="true" />}
    </span>
  );
  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:text-brand-700">
        {content}
      </Link>
    );
  }
  return content;
}
