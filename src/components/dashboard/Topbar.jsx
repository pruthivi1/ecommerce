import { Link } from "react-router-dom";
import { Menu, Bell, LogOut, ExternalLink } from "lucide-react";
import Dropdown, { DropdownItem } from "../common/Dropdown.jsx";
import RoleSwitcher from "./RoleSwitcher.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export default function Topbar({ onMenuClick, notificationsPath, unreadCount = 0 }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
        <Link
          to="/"
          className="hidden items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-brand-700 sm:flex"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          View Marketplace
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <RoleSwitcher />
        </div>

        {notificationsPath && (
          <Link
            to={notificationsPath}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100"
          >
            <Bell className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        )}

        <Dropdown
          trigger={() => (
            <button
              type="button"
              className="flex items-center gap-2 rounded-md border border-border bg-white px-2.5 py-1.5 text-sm font-medium text-text hover:bg-slate-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
                {(user?.name || "U").slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[8rem] truncate sm:inline">{user?.name || "Guest"}</span>
            </button>
          )}
        >
          <div className="px-3.5 py-2 text-xs text-text-secondary">
            Signed in as <span className="font-medium text-text">{user?.email}</span>
          </div>
          <DropdownItem onClick={logout}>
            <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Log out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
