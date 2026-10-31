import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  FileText,
  Users,
  Wallet,
  Banknote,
  Star,
  Settings,
  Bell,
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { getNotifications } from "../services/notificationService.js";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/vendor/dashboard", icon: LayoutDashboard, end: true },
  { label: "Products", to: "/vendor/products", icon: Package },
  { label: "Inventory", to: "/vendor/inventory", icon: Boxes },
  { label: "Orders", to: "/vendor/orders", icon: ShoppingBag },
  { label: "Quote Requests", to: "/vendor/quotes", icon: FileText },
  { label: "Customers", to: "/vendor/customers", icon: Users },
  { label: "Earnings", to: "/vendor/earnings", icon: Wallet },
  { label: "Payouts", to: "/vendor/payouts", icon: Banknote },
  { label: "Reviews", to: "/vendor/reviews", icon: Star },
  { label: "Store Settings", to: "/vendor/settings", icon: Settings },
  { label: "Notifications", to: "/vendor/notifications", icon: Bell },
];

export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications } = useAsync(() => getNotifications("vendor"), []);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar title="Vendor Portal" navItems={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          notificationsPath="/vendor/notifications"
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
