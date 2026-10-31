import { Bell, Check } from "lucide-react";
import PageHeader from "./PageHeader.jsx";
import Button from "../common/Button.jsx";
import EmptyState from "../common/EmptyState.jsx";
import LoadingState from "../common/LoadingState.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { getNotifications, markAsRead, markAllAsRead } from "../../services/notificationService.js";
import { formatDateTime } from "../../utils/format.js";

export default function NotificationsPage({ role }) {
  const { data: notifications, loading, setData } = useAsync(() => getNotifications(role), [role]);

  const handleMarkRead = async (id) => {
    const updated = await markAsRead(role, id);
    setData(updated);
  };

  const handleMarkAll = async () => {
    const updated = await markAllAsRead(role);
    setData(updated);
  };

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
        actions={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll}>
              Mark all as read
            </Button>
          )
        }
      />

      {loading && <LoadingState count={3} />}
      {!loading && (notifications ?? []).length === 0 && <EmptyState icon={Bell} title="No notifications" />}
      {!loading && (notifications ?? []).length > 0 && (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-white">
          {notifications.map((n) => (
            <div key={n.id} className={`flex items-start justify-between gap-3 px-5 py-4 ${!n.read ? "bg-brand-50/40" : ""}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-brand-700" : "bg-transparent"}`} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-text">{n.title}</p>
                  <p className="text-sm text-text-secondary">{n.body}</p>
                  <p className="mt-1 text-xs text-text-secondary">{formatDateTime(n.at)}</p>
                </div>
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(n.id)}
                  aria-label="Mark as read"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-slate-100"
                >
                  <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
