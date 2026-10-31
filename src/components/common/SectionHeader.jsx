export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  action,
  className = "",
}) {
  const isCenter = align === "center";
  const alignClass = isCenter ? "text-center items-center" : "text-left items-start";

  return (
    <div
      className={`flex flex-col gap-3 ${
        isCenter ? "items-center" : "sm:flex-row sm:items-end sm:justify-between"
      } ${className}`}
    >
      <div className={`flex max-w-2xl flex-col gap-2 ${alignClass} ${isCenter ? "mx-auto" : ""}`}>
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{title}</h2>
        {subtitle && <p className="text-sm text-text-secondary sm:text-base">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
