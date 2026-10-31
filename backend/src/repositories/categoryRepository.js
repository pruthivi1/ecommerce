import { query } from "../config/db.js";
import { newId } from "../utils/id.js";
import { slugify } from "../utils/slugify.js";

// mysql2 auto-deserializes JSON columns into JS values already — no JSON.parse needed here.
function mapCategory(row) {
  if (!row) return null;
  return { ...row, subcategories: row.subcategories || [] };
}

export async function listCategories({ statusFilter } = {}) {
  const where = statusFilter ? "WHERE status = :statusFilter" : "";
  const rows = await query(`SELECT * FROM categories ${where} ORDER BY name ASC`, { statusFilter });
  return rows.map(mapCategory);
}

export async function getCategoryBySlug(slug) {
  const rows = await query("SELECT * FROM categories WHERE slug = :slug LIMIT 1", { slug });
  return mapCategory(rows[0]);
}

export async function getCategoryById(id) {
  const rows = await query("SELECT * FROM categories WHERE id = :id LIMIT 1", { id });
  return mapCategory(rows[0]);
}

export async function createCategory({ name, meta, image, subcategories }) {
  const id = newId();
  const slug = slugify(name);
  await query(
    "INSERT INTO categories (id, slug, name, meta, image, subcategories, status) VALUES (:id, :slug, :name, :meta, :image, :subcategories, 'Active')",
    { id, slug, name, meta: meta || null, image: image || null, subcategories: JSON.stringify(subcategories || []) }
  );
  return getCategoryById(id);
}

export async function updateCategory(id, updates) {
  const sets = [];
  const params = { id };
  if (updates.name != null) {
    sets.push("name = :name");
    params.name = updates.name;
  }
  if (updates.meta != null) {
    sets.push("meta = :meta");
    params.meta = updates.meta;
  }
  if (updates.image != null) {
    sets.push("image = :image");
    params.image = updates.image;
  }
  if (updates.subcategories != null) {
    sets.push("subcategories = :subcategories");
    params.subcategories = JSON.stringify(updates.subcategories);
  }
  if (updates.status != null) {
    sets.push("status = :status");
    params.status = updates.status;
  }
  if (!sets.length) return getCategoryById(id);
  await query(`UPDATE categories SET ${sets.join(", ")} WHERE id = :id`, params);
  return getCategoryById(id);
}
