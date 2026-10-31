import { apiGet, apiPatch, getCurrentRole } from "./apiClient.js";

function basePath() {
  const role = getCurrentRole();
  return role === "vendor" ? "/vendor/notifications" : "/buyer/notifications";
}

function mapNotification(row) {
  return { id: row.id, title: row.title, body: row.body, read: Boolean(row.read_flag), at: row.created_at };
}

// `role` kept as a parameter for call-site compatibility — the endpoint is
// actually resolved from the current session's own role (getCurrentRole),
// never trusted from this argument.
export async function getNotifications(_role) {
  const rows = await apiGet(basePath());
  return rows.map(mapNotification);
}

export async function markAsRead(_role, id) {
  const rows = await apiPatch(`${basePath()}/${id}/read`);
  return rows.map(mapNotification);
}

export async function markAllAsRead(_role) {
  const rows = await apiPatch(`${basePath()}/read-all`);
  return rows.map(mapNotification);
}
