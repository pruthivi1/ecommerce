let uid = 0;

export default function Checkbox({ label, id, className = "", ...rest }) {
  const checkboxId = id || `checkbox-${(uid += 1)}`;
  return (
    <label htmlFor={checkboxId} className={`inline-flex cursor-pointer items-center gap-2 text-sm text-text ${className}`}>
      <input
        id={checkboxId}
        type="checkbox"
        className="h-4 w-4 rounded border-border text-brand-700 focus:ring-2 focus:ring-brand-100"
        {...rest}
      />
      {label}
    </label>
  );
}
