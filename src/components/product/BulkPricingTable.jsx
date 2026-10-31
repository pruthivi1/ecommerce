import { formatCurrency } from "../../utils/format.js";

export default function BulkPricingTable({ tiers, unit, activeQty, className = "" }) {
  if (!tiers?.length) return null;

  return (
    <table className={`w-full overflow-hidden rounded-md border border-border text-sm ${className}`}>
      <thead>
        <tr className="bg-bg text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
          <th className="px-3.5 py-2.5">Quantity ({unit})</th>
          <th className="px-3.5 py-2.5 text-right">Price / {unit}</th>
        </tr>
      </thead>
      <tbody>
        {tiers.map((tier) => {
          const isActive = activeQty != null && activeQty >= tier.minQty && (tier.maxQty == null || activeQty <= tier.maxQty);
          return (
            <tr
              key={tier.minQty}
              className={`border-t border-border ${isActive ? "bg-brand-50" : ""}`}
            >
              <td className="px-3.5 py-2.5 text-text">
                {tier.maxQty ? `${tier.minQty}–${tier.maxQty}` : `${tier.minQty}+`}
              </td>
              <td className={`px-3.5 py-2.5 text-right font-medium ${isActive ? "text-brand-700" : "text-text"}`}>
                {formatCurrency(tier.price)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
