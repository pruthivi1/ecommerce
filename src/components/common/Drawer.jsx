import { useEffect } from "react";
import { X } from "lucide-react";

export default function Drawer({ open, onClose, title, children, side = "right" }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideClass = side === "right" ? "right-0" : "left-0";

  return (
    <div className="fixed inset-0 z-[100]">
      <button type="button" aria-label="Close panel" className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute top-0 ${sideClass} flex h-full w-full max-w-sm flex-col bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100 hover:text-text"
          >
            <X className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
