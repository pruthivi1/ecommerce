import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items = [], className = "" }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />}
            {item.to && !isLast ? (
              <Link to={item.to} className="text-text-secondary hover:text-brand-700">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-text" : "text-text-secondary"} aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
