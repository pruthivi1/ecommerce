import { query } from "../config/db.js";
import { newId } from "../utils/id.js";

export async function listNotifications(userId) {
  return query("SELECT * FROM notifications WHERE user_id = :userId ORDER BY created_at DESC LIMIT 100", { userId });
}

export async function createNotification(userId, { title, body }) {
  const id = newId();
  await query("INSERT INTO notifications (id, user_id, title, body) VALUES (:id, :userId, :title, :body)", { id, userId, title, body: body || null });
  return id;
}

export async function createNotificationForUsers(userIds, { title, body }) {
  for (const userId of userIds) {
    await createNotification(userId, { title, body });
  }
}

export async function markAsRead(userId, id) {
  await query("UPDATE notifications SET read_flag = 1 WHERE user_id = :userId AND id = :id", { userId, id });
  return listNotifications(userId);
}

export async function markAllAsRead(userId) {
  await query("UPDATE notifications SET read_flag = 1 WHERE user_id = :userId", { userId });
  return listNotifications(userId);
}
