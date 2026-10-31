import { formatCurrency } from "../../utils/format.js";

export default function ChartCard({ title, description, data, valueFormatter = formatCurrency, className = "" }) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={`flex flex-col gap-4 rounded-lg border border-border bg-white p-5 shadow-card ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {description && <p className="text-xs text-text-secondary">{description}</p>}
      </div>
      <div className="flex flex-col gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-text-secondary" title={item.label}>
              {item.label}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-700"
                style={{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }}
              />
            </div>
            <span className="w-20 shrink-0 text-right text-xs font-medium text-text">
              {valueFormatter(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
