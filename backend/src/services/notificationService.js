import { query } from "../config/db.js";
import { createNotification, createNotificationForUsers, listNotifications, markAsRead as markAsReadRepo, markAllAsRead as markAllAsReadRepo } from "../repositories/notificationRepository.js";

async function getAdminUserIds() {
  const rows = await query("SELECT id FROM users WHERE role = 'admin' AND is_active = 1");
  return rows.map((r) => r.id);
}

async function getVendorUserId(vendorId) {
  const rows = await query("SELECT user_id FROM vendors WHERE id = :vendorId LIMIT 1", { vendorId });
  return rows[0]?.user_id || null;
}

/**
 * Notifies every admin. Used for events an admin queue needs to act on
 * (new vendor application, new refund/payout request, product submitted).
 */
export async function notifyAdmins({ title, body }) {
  const adminIds = await getAdminUserIds();
  await createNotificationForUsers(adminIds, { title, body });
}

/** Notifies a specific buyer (their user id doubles as the buyer id in this schema). */
export async function notifyBuyer(buyerId, { title, body }) {
  await createNotification(buyerId, { title, body });
}

/** Notifies the user account that owns a given vendor store. */
export async function notifyVendor(vendorId, { title, body }) {
  const userId = await getVendorUserId(vendorId);
  if (userId) await createNotification(userId, { title, body });
}

export async function getNotificationsForUser(userId) {
  return listNotifications(userId);
}

export async function markNotificationRead(userId, id) {
  return markAsReadRepo(userId, id);
}

export async function markAllNotificationsRead(userId) {
  return markAllAsReadRepo(userId);
}
