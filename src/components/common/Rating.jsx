import { Star } from "lucide-react";

export default function Rating({ value, className = "", showValue = true }) {
  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`Rated ${value} out of 5`}
    >
      <Star className="h-3.5 w-3.5 fill-warning-500 text-warning-500" aria-hidden="true" />
      {showValue && <span className="text-sm font-medium text-text">{value}</span>}
    </div>
  );
}
