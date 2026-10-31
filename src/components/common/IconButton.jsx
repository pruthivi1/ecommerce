export default function IconButton({ icon: Icon, label, className = "", badge, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-text-secondary transition-colors duration-150 hover:bg-slate-100 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${className}`}
      {...rest}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      {badge != null && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold text-white"
          aria-hidden="true"
        >
          {badge}
        </span>
      )}
    </button>
  );
}
