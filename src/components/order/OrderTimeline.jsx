import { Check } from "lucide-react";
import { formatDate } from "../../utils/format.js";

export default function OrderTimeline({ timeline }) {
  return (
    <ol className="flex flex-col gap-0">
      {timeline.map((step, index) => (
        <li key={step.step} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                step.done ? "border-success-500 bg-success-500 text-white" : "border-border text-text-secondary"
              }`}
            >
              {step.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            {index < timeline.length - 1 && (
              <span className={`w-0.5 flex-1 ${step.done ? "bg-success-500" : "bg-border"}`} style={{ minHeight: "1.5rem" }} />
            )}
          </div>
          <div className="pb-5">
            <p className={`text-sm font-medium ${step.done ? "text-text" : "text-text-secondary"}`}>{step.step}</p>
            {step.date && <p className="text-xs text-text-secondary">{formatDate(step.date, { hour: "numeric", minute: "2-digit" })}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
