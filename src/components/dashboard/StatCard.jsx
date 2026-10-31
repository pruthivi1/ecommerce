import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ label, value, icon: Icon, trend, className = "" }) {
  return (
    <div className={`flex flex-col gap-3 rounded-lg border border-border bg-white p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tracking-tight text-text">{value}</span>
        {trend != null && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              trend >= 0 ? "text-success-600" : "text-error-600"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
