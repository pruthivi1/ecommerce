import { query, pool } from "../config/db.js";
import { newId } from "../utils/id.js";

const BASE_SELECT = `
  SELECT p.*, v.name AS vendor_name, v.location AS vendor_location, v.verified AS vendor_verified,
         v.status AS vendor_status, v.rating AS vendor_rating, v.slug AS vendor_slug
  FROM products p
  JOIN vendors v ON v.id = p.vendor_id
`;

function mapProductRow(row, { images = [], pricingTiers = [] } = {}) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category_id,
    subcategory: row.subcategory,
    vendorId: row.vendor_id,
    sku: row.sku,
    price: Number(row.price),
    unit: row.unit,
    moq: row.moq,
    moqUnit: row.moq_unit,
    stock: row.stock,
    status: row.status,
    rejectionReason: row.rejection_reason,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    location: row.location,
    // mysql2 auto-deserializes JSON columns into JS values already.
    specifications: row.specifications || {},
    shippingInfo: row.shipping_info,
    createdAt: row.created_at,
    images: images.map((i) => i.url),
    bulkPricing: pricingTiers.map((t) => ({ minQty: t.min_qty, maxQty: t.max_qty, price: Number(t.price) })),
    vendor: row.vendor_name
      ? {
          id: row.vendor_id,
          name: row.vendor_name,
          location: row.vendor_location,
          verified: Boolean(row.vendor_verified),
          status: row.vendor_status,
          rating: Number(row.vendor_rating),
          slug: row.vendor_slug,
        }
      : null,
  };
}

async function attachChildren(rows) {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map((_, i) => `:id${i}`).join(",");
  const idParams = Object.fromEntries(ids.map((id, i) => [`id${i}`, id]));
  const [images, tiers] = await Promise.all([
    query(`SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`, idParams),
    query(`SELECT * FROM product_pricing_tiers WHERE product_id IN (${placeholders}) ORDER BY min_qty ASC`, idParams),
  ]);
  const imagesByProduct = {};
  for (const img of images) (imagesByProduct[img.product_id] ??= []).push(img);
  const tiersByProduct = {};
  for (const t of tiers) (tiersByProduct[t.product_id] ??= []).push(t);
  return rows.map((row) => mapProductRow(row, { images: imagesByProduct[row.id] || [], pricingTiers: tiersByProduct[row.id] || [] }));
}

export async function getProductById(id) {
  const rows = await query(`${BASE_SELECT} WHERE p.id = :id LIMIT 1`, { id });
  const [product] = await attachChildren(rows);
  return product || null;
}

export async function getProductBySlug(slug) {
  const rows = await query(`${BASE_SELECT} WHERE p.slug = :slug LIMIT 1`, { slug });
  const [product] = await attachChildren(rows);
  return product || null;
}

/**
 * Server-side filtered, paginated product search — the frontend never
 * receives the full catalogue to filter client-side. `publicOnly` enforces
 * that only Active products from Approved vendors are visible.
 */
export async function listProducts(filters = {}) {
  const clauses = [];
  const params = {};

  if (filters.publicOnly) {
    clauses.push("p.status = 'Active'");
    clauses.push("v.status = 'Approved'");
  } else if (filters.status) {
    clauses.push("p.status = :status");
    params.status = filters.status;
  }
  if (filters.vendorId) {
    clauses.push("p.vendor_id = :vendorId");
    params.vendorId = filters.vendorId;
  }
  if (filters.category) {
    clauses.push("p.category_id = :category");
    params.category = filters.category;
  }
  if (filters.location) {
    clauses.push("p.location = :location");
    params.location = filters.location;
  }
  if (filters.minPrice != null) {
    clauses.push("p.price >= :minPrice");
    params.minPrice = filters.minPrice;
  }
  if (filters.maxPrice != null) {
    clauses.push("p.price <= :maxPrice");
    params.maxPrice = filters.maxPrice;
  }
  if (filters.minMoq != null) {
    clauses.push("p.moq >= :minMoq");
    params.minMoq = filters.minMoq;
  }
  if (filters.maxMoq != null) {
    clauses.push("p.moq <= :maxMoq");
    params.maxMoq = filters.maxMoq;
  }
  if (filters.minRating != null) {
    clauses.push("p.rating >= :minRating");
    params.minRating = filters.minRating;
  }
  if (filters.inStockOnly) {
    clauses.push("p.stock > 0");
  }
  if (filters.search) {
    clauses.push("MATCH(p.name) AGAINST(:search IN NATURAL LANGUAGE MODE)");
    params.search = filters.search;
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  let orderBy = "p.created_at DESC";
  switch (filters.sort) {
    case "price-asc":
      orderBy = "p.price ASC";
      break;
    case "price-desc":
      orderBy = "p.price DESC";
      break;
    case "rating-desc":
      orderBy = "p.rating DESC";
      break;
    case "newest":
      orderBy = "p.created_at DESC";
      break;
    default:
      break;
  }

  const pageSize = Math.min(Number(filters.pageSize) || 20, 60);
  const page = Math.max(Number(filters.page) || 1, 1);
  const offset = (page - 1) * pageSize;

  const rows = await query(`${BASE_SELECT} ${where} ORDER BY ${orderBy} LIMIT :limit OFFSET :offset`, { ...params, limit: pageSize, offset });
  const [{ total }] = await query(`SELECT COUNT(*) as total FROM products p JOIN vendors v ON v.id = p.vendor_id ${where}`, params);

  const items = await attachChildren(rows);
  return { items, total, page, pageSize };
}

export async function getRelatedProducts(product, limit = 4) {
  const rows = await query(
    `${BASE_SELECT} WHERE p.category_id = :category AND p.id != :id AND p.status = 'Active' AND v.status = 'Approved' LIMIT :limit`,
    { category: product.category, id: product.id, limit }
  );
  return attachChildren(rows);
}

export async function createProduct(payload, connection = pool) {
  const id = newId();
  await connection.query(
    `INSERT INTO products (
      id, slug, name, description, category_id, subcategory, vendor_id, sku, price, unit, moq, moq_unit,
      stock, status, location, specifications, shipping_info
    ) VALUES (
      :id, :slug, :name, :description, :category, :subcategory, :vendorId, :sku, :price, :unit, :moq, :moqUnit,
      :stock, 'Pending Approval', :location, :specifications, :shippingInfo
    )`,
    {
      id,
      slug: payload.slug,
      name: payload.name,
      description: payload.description || null,
      category: payload.category,
      subcategory: payload.subcategory || null,
      vendorId: payload.vendorId,
      sku: payload.sku || null,
      price: payload.price,
      unit: payload.unit || "piece",
      moq: payload.moq || 1,
      moqUnit: payload.moqUnit || "pieces",
      stock: payload.stock ?? 0,
      location: payload.location || null,
      specifications: JSON.stringify(payload.specifications || {}),
      shippingInfo: payload.shippingInfo || null,
    }
  );
  for (const [index, url] of (payload.images || []).entries()) {
    await connection.query("INSERT INTO product_images (id, product_id, url, sort_order) VALUES (:id, :productId, :url, :sortOrder)", {
      id: newId(),
      productId: id,
      url,
      sortOrder: index,
    });
  }
  for (const tier of payload.bulkPricing || []) {
    await connection.query(
      "INSERT INTO product_pricing_tiers (id, product_id, min_qty, max_qty, price) VALUES (:id, :productId, :minQty, :maxQty, :price)",
      { id: newId(), productId: id, minQty: tier.minQty, maxQty: tier.maxQty ?? null, price: tier.price }
    );
  }
  return id;
}

export async function updateProduct(id, updates) {
  const fieldMap = {
    name: "name",
    description: "description",
    category: "category_id",
    subcategory: "subcategory",
    sku: "sku",
    price: "price",
    unit: "unit",
    moq: "moq",
    moqUnit: "moq_unit",
    location: "location",
    shippingInfo: "shipping_info",
    rating: "rating",
    reviewCount: "review_count",
  };
  const sets = [];
  const params = { id };
  for (const [key, column] of Object.entries(fieldMap)) {
    if (updates[key] === undefined) continue;
    sets.push(`${column} = :${key}`);
    params[key] = updates[key];
  }
  if (updates.specifications !== undefined) {
    sets.push("specifications = :specifications");
    params.specifications = JSON.stringify(updates.specifications);
  }
  if (sets.length) {
    await query(`UPDATE products SET ${sets.join(", ")} WHERE id = :id`, params);
  }
  return getProductById(id);
}

export async function setProductStatus(id, status, reason) {
  await query("UPDATE products SET status = :status, rejection_reason = :reason WHERE id = :id", {
    id,
    status,
    reason: status === "Rejected" ? reason || null : null,
  });
  return getProductById(id);
}

/**
 * Atomically decrements stock only if enough is available (WHERE stock >=
 * qty), so two concurrent checkouts can never both succeed against the same
 * unit of inventory — the second one's UPDATE affects 0 rows and the caller
 * must treat that as "insufficient stock" rather than retrying blindly.
 */
export async function decrementStockIfAvailable(id, qty, connection) {
  const [result] = await connection.query(
    `UPDATE products SET stock = stock - :qty,
       status = CASE WHEN stock - :qty <= 0 AND status = 'Active' THEN 'Out of Stock' ELSE status END
     WHERE id = :id AND stock >= :qty`,
    { id, qty }
  );
  return result.affectedRows > 0;
}

export async function updateStock(id, stock) {
  const status = stock <= 0 ? "Out of Stock" : null;
  if (status) {
    await query(
      "UPDATE products SET stock = :stock, status = IF(status = 'Active', 'Out of Stock', status) WHERE id = :id",
      { id, stock }
    );
  } else {
    await query(
      "UPDATE products SET stock = :stock, status = IF(status = 'Out of Stock', 'Active', status) WHERE id = :id",
      { id, stock }
    );
  }
  return getProductById(id);
}
