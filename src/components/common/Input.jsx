let uid = 0;

export default function Input({ label, error, hint, required, id, className = "", containerClassName = "", ...rest }) {
  const inputId = id || `input-${(uid += 1)}`;
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-100 ${
          error ? "border-error-500 focus:border-error-500" : "border-border focus:border-brand-500"
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs font-medium text-error-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-text-secondary">
          {hint}
        </p>
      )}
    </div>
  );
}
