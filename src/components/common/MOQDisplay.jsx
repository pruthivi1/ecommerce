import { Layers } from "lucide-react";

export default function MOQDisplay({ moq, moqUnit, className = "" }) {
  return (
    <p className={`inline-flex items-center gap-1.5 text-sm text-text-secondary ${className}`}>
      <Layers className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
      MOQ: <span className="font-medium text-text">{moq.toLocaleString("en-IN")}</span> {moqUnit}
    </p>
  );
}
