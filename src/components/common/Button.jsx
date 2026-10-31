const VARIANTS = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 border border-transparent",
  secondary:
    "bg-white text-brand-700 border border-brand-700 hover:bg-brand-50 active:bg-brand-100",
  ghost:
    "bg-transparent text-text border border-transparent hover:bg-slate-100 active:bg-slate-200",
  outline:
    "bg-transparent text-text border border-border hover:border-brand-300 hover:bg-brand-50",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
