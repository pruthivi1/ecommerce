import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToast } from "../../hooks/useToast.js";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const TONE_CLASSES = {
  success: "border-success-500/30 text-success-600",
  error: "border-error-500/30 text-error-600",
  info: "border-brand-500/30 text-brand-700",
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2.5 rounded-md border bg-white px-4 py-3 shadow-lg ${TONE_CLASSES[toast.type] || TONE_CLASSES.info}`}
          >
            <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <p className="flex-1 text-sm text-text">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-text-secondary hover:text-text"
            >
              <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
