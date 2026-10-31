import { query } from "../config/db.js";
import { env } from "../config/env.js";

const DEFAULTS = {
  commission_rate: String(env.business.commissionRate),
  gst_rate: String(env.business.gstRate),
  shipping_fee_per_vendor: String(env.business.shippingFeePerVendor),
};

export async function getSetting(key) {
  const rows = await query("SELECT setting_value FROM platform_settings WHERE setting_key = :key LIMIT 1", { key });
  return rows[0] ? rows[0].setting_value : DEFAULTS[key];
}

export async function getNumberSetting(key) {
  const value = await getSetting(key);
  return value != null ? Number(value) : null;
}

export async function setSetting(key, value) {
  await query(
    "INSERT INTO platform_settings (setting_key, setting_value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE setting_value = :value",
    { key, value: String(value) }
  );
  return getSetting(key);
}
