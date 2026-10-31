import { ChevronDown } from "lucide-react";

let uid = 0;

export default function Select({
  label,
  error,
  hint,
  required,
  id,
  options = [],
  placeholder = "Select an option",
  className = "",
  containerClassName = "",
  ...rest
}) {
  const selectId = id || `select-${(uid += 1)}`;
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text">
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-md border bg-white px-3.5 py-2.5 pr-9 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-100 ${
            error ? "border-error-500 focus:border-error-500" : "border-border focus:border-brand-500"
          } ${className}`}
          aria-invalid={!!error}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => {
            const value = typeof opt === "string" ? opt : opt.value;
            const label2 = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {label2}
              </option>
            );
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-xs font-medium text-error-600">{error}</p>}
      {!error && hint && <p className="text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}
