import { useNavigate } from "react-router-dom";
import { ChevronDown, UserCircle } from "lucide-react";
import Dropdown, { DropdownItem } from "../common/Dropdown.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";

const ROLE_META = {
  [ROLES.BUYER]: { label: "Buyer Demo", home: "/buyer/dashboard" },
  [ROLES.VENDOR]: { label: "Vendor Demo", home: "/vendor/dashboard" },
  [ROLES.ADMIN]: { label: "Admin Demo", home: "/admin/dashboard" },
};

export default function RoleSwitcher({ className = "" }) {
  const { role, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (nextRole) => {
    await switchRole(nextRole);
    navigate(ROLE_META[nextRole].home);
  };

  return (
    <Dropdown
      className={className}
      trigger={({ open }) => (
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-text hover:bg-slate-50"
        >
          <UserCircle className="h-4 w-4 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
          {ROLE_META[role]?.label || "Switch Demo Role"}
          <ChevronDown className={`h-3.5 w-3.5 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}
    >
      <div className="px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
        Prototype demo — switch role
      </div>
      {Object.entries(ROLE_META).map(([key, meta]) => (
        <DropdownItem key={key} onClick={() => handleSwitch(key)}>
          {meta.label}
          {role === key && <span className="ml-auto text-xs text-brand-700">Active</span>}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
