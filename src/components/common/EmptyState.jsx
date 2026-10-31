import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-white px-6 py-14 text-center ${className}`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-text-secondary">
        <Icon className="h-5.5 w-5.5" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
