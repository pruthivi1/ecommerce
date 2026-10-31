import { NavLink } from "react-router-dom";
import { X, Store } from "lucide-react";

export default function Sidebar({ title, navItems, open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-brand-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-800 text-white" aria-hidden="true">
              <Store className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <span className="flex flex-col leading-tight">
              MARKETBRIDGE
              <span className="text-[11px] font-medium text-text-secondary">{title}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-text-secondary hover:text-text lg:hidden"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-text-secondary hover:bg-slate-50 hover:text-text"
                    }`
                  }
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
