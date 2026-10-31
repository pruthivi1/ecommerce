import { Check } from "lucide-react";

export default function Stepper({ steps, current, className = "" }) {
  return (
    <ol className={`flex flex-wrap items-center gap-y-3 ${className}`}>
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <li key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  done ? "border-brand-700 bg-brand-700 text-white" : active ? "border-brand-700 text-brand-700" : "border-border text-text-secondary"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : stepNum}
              </span>
              <span className={`hidden text-xs font-medium sm:inline ${active || done ? "text-text" : "text-text-secondary"}`}>{label}</span>
            </div>
            {index < steps.length - 1 && <span className="mx-2 h-px w-4 bg-border sm:w-8" />}
          </li>
        );
      })}
    </ol>
  );
}
