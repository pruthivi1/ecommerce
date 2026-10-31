import { BadgeCheck } from "lucide-react";

const TONES = {
  neutral: "bg-slate-100 text-text-secondary",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  error: "bg-error-50 text-error-600",
};

export function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ className = "", label = "Verified Supplier" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium text-success-600 ${className}`}
    >
      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
}

export default Badge;
