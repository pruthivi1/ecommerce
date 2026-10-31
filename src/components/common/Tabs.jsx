export default function Tabs({ tabs, value, onChange, className = "" }) {
  return (
    <div className={`flex gap-1 overflow-x-auto border-b border-border no-scrollbar ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
