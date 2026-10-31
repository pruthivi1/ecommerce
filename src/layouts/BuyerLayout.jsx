import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  Heart,
  Users,
  MapPin,
  Building2,
  Bell,
  Settings,
} from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { getNotifications } from "../services/notificationService.js";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/buyer/dashboard", icon: LayoutDashboard, end: true },
  { label: "Orders", to: "/buyer/orders", icon: Package },
  { label: "Quotes", to: "/buyer/quotes", icon: FileText },
  { label: "Wishlist", to: "/buyer/wishlist", icon: Heart },
  { label: "Suppliers", to: "/buyer/suppliers", icon: Users },
  { label: "Addresses", to: "/buyer/addresses", icon: MapPin },
  { label: "Business Profile", to: "/buyer/business-profile", icon: Building2 },
  { label: "Notifications", to: "/buyer/notifications", icon: Bell },
  { label: "Settings", to: "/buyer/settings", icon: Settings },
];

export default function BuyerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications } = useAsync(() => getNotifications("buyer"), []);
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar title="Buyer Portal" navItems={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          notificationsPath="/buyer/notifications"
          unreadCount={unreadCount}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
