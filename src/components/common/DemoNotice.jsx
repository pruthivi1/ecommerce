import { Info } from "lucide-react";
import { DEMO_NOTICE } from "../../utils/constants.js";

export default function DemoNotice({ message = DEMO_NOTICE, className = "" }) {
  return (
    <div className={`flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-xs text-brand-800 ${className}`}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
