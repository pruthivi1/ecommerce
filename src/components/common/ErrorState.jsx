import { AlertTriangle } from "lucide-react";
import Button from "./Button.jsx";

export default function ErrorState({ message = "Something went wrong. Please try again.", onRetry, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-3 rounded-lg border border-error-500/20 bg-error-50 px-6 py-14 text-center ${className}`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-error-600">
        <AlertTriangle className="h-5.5 w-5.5" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <p className="max-w-sm text-sm font-medium text-error-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
