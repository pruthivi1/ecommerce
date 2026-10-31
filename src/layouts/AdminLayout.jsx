import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  CreditCard,
  RefreshCcw,
  Wallet,
  Percent,
  Ticket,
  BarChart3,
  Settings,
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, end: true },
  { label: "Vendors", to: "/admin/vendors", icon: Store },
  { label: "Buyers", to: "/admin/buyers", icon: Users },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: FolderTree },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Refunds", to: "/admin/refunds", icon: RefreshCcw },
  { label: "Commissions", to: "/admin/commissions", icon: Percent },
  { label: "Payouts", to: "/admin/payouts", icon: Wallet },
  { label: "Coupons", to: "/admin/coupons", icon: Ticket },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar title="Admin Console" navItems={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
