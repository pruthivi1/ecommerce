let uid = 0;

export default function Textarea({ label, error, hint, required, id, className = "", containerClassName = "", rows = 4, ...rest }) {
  const textareaId = id || `textarea-${(uid += 1)}`;
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-text">
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-100 ${
          error ? "border-error-500 focus:border-error-500" : "border-border focus:border-brand-500"
        } ${className}`}
        aria-invalid={!!error}
        {...rest}
      />
      {error && <p className="text-xs font-medium text-error-600">{error}</p>}
      {!error && hint && <p className="text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}
