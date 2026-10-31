import { query, pool } from "../config/db.js";
import { newId } from "../utils/id.js";

function mapVendor(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    name: row.name,
    businessName: row.business_name,
    ownerName: row.owner_name,
    email: row.email,
    phone: row.phone,
    // mysql2 auto-deserializes JSON columns into JS values already.
    categories: row.categories || [],
    location: row.location,
    gstNumber: row.gst_number,
    businessType: row.business_type,
    status: row.status,
    rejectionReason: row.rejection_reason,
    verified: Boolean(row.verified),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    yearsExperience: row.years_experience,
    joinedDate: row.joined_date,
    image: row.image,
    about: row.about,
    commissionRate: Number(row.commission_rate),
    createdAt: row.created_at,
    address: {
      line1: row.address_line1,
      city: row.address_city,
      state: row.address_state,
      pincode: row.address_pincode,
    },
    bank: {
      accountName: row.bank_account_name,
      accountNumber: row.bank_account_number,
      ifsc: row.bank_ifsc,
      upi: row.bank_upi,
    },
  };
}

export function toPublicVendor(vendor) {
  if (!vendor) return null;
  return {
    id: vendor.id,
    slug: vendor.slug,
    name: vendor.name,
    businessName: vendor.businessName,
    businessType: vendor.businessType,
    categories: vendor.categories || [],
    location: vendor.location,
    verified: Boolean(vendor.verified),
    rating: Number(vendor.rating) || 0,
    reviewCount: vendor.reviewCount || 0,
    yearsExperience: vendor.yearsExperience,
    joinedDate: vendor.joinedDate,
    image: vendor.image,
    about: vendor.about,
    gstNumber: vendor.gstNumber ? (vendor.gstNumber.length >= 10 ? `${vendor.gstNumber.slice(0, 7)}****${vendor.gstNumber.slice(-3)}` : "Verified") : null,
    address: {
      line1: vendor.address?.line1,
      city: vendor.address?.city,
      state: vendor.address?.state,
      pincode: vendor.address?.pincode,
    },
    // Sensitive fields STRICTLY EXCLUDED:
    // bank (accountName, accountNumber, ifsc, upi),
    // documents, commissionRate, rejectionReason, userId
  };
}

export async function getVendorByUserId(userId) {
  const rows = await query("SELECT * FROM vendors WHERE user_id = :userId LIMIT 1", { userId });
  return mapVendor(rows[0]);
}

export async function getVendorById(id) {
  const rows = await query("SELECT * FROM vendors WHERE id = :id LIMIT 1", { id });
  const vendor = mapVendor(rows[0]);
  if (vendor) vendor.documents = await getVendorDocuments(id);
  return vendor;
}

export async function getVendorBySlug(slug) {
  const rows = await query("SELECT * FROM vendors WHERE slug = :slug LIMIT 1", { slug });
  return mapVendor(rows[0]);
}

export async function listVendors({ category, location, status, verified, minRating, search, page = 1, pageSize = 20 } = {}) {
  const clauses = [];
  const params = {};
  if (status) {
    clauses.push("status = :status");
    params.status = status;
  }
  if (location) {
    clauses.push("location = :location");
    params.location = location;
  }
  if (verified != null) {
    clauses.push("verified = :verified");
    params.verified = verified ? 1 : 0;
  }
  if (minRating != null) {
    clauses.push("rating >= :minRating");
    params.minRating = minRating;
  }
  if (search) {
    clauses.push("name LIKE :search");
    params.search = `%${search}%`;
  }
  if (category) {
    clauses.push("JSON_CONTAINS(categories, JSON_QUOTE(:category))");
    params.category = category;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = Math.min(Number(pageSize) || 20, 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

  const rows = await query(`SELECT * FROM vendors ${where} ORDER BY joined_date DESC LIMIT :limit OFFSET :offset`, { ...params, limit, offset });
  const [{ total }] = await query(`SELECT COUNT(*) as total FROM vendors ${where}`, params);
  return { items: rows.map(mapVendor), total, page: Number(page) || 1, pageSize: limit };
}

export async function createVendor(payload, connection = pool) {
  const id = newId();
  await connection.query(
    `INSERT INTO vendors (
      id, user_id, slug, name, business_name, owner_name, email, phone, categories, location,
      address_line1, address_city, address_state, address_pincode, gst_number, business_type,
      status, joined_date, image, about, bank_account_name, bank_account_number, bank_ifsc, bank_upi, commission_rate
    ) VALUES (
      :id, :userId, :slug, :name, :businessName, :ownerName, :email, :phone, :categories, :location,
      :addressLine1, :addressCity, :addressState, :addressPincode, :gstNumber, :businessType,
      'Pending', CURDATE(), :image, :about, :bankAccountName, :bankAccountNumber, :bankIfsc, :bankUpi, :commissionRate
    )`,
    {
      id,
      userId: payload.userId,
      slug: payload.slug,
      name: payload.businessName,
      businessName: payload.businessName,
      ownerName: payload.ownerName,
      email: payload.email.toLowerCase(),
      phone: payload.phone || null,
      categories: JSON.stringify(payload.categories || []),
      location: payload.location || null,
      addressLine1: payload.address?.line1 || null,
      addressCity: payload.address?.city || null,
      addressState: payload.address?.state || null,
      addressPincode: payload.address?.pincode || null,
      gstNumber: payload.gstNumber || null,
      businessType: payload.businessType || null,
      image: payload.image || null,
      about: payload.about || null,
      bankAccountName: payload.bank?.accountName || null,
      bankAccountNumber: payload.bank?.accountNumber || null,
      bankIfsc: payload.bank?.ifsc || null,
      bankUpi: payload.bank?.upi || null,
      commissionRate: payload.commissionRate ?? 0.08,
    }
  );
  for (const docName of payload.documents || []) {
    await connection.query("INSERT INTO vendor_documents (id, vendor_id, name, status) VALUES (:id, :vendorId, :name, 'Submitted')", {
      id: newId(),
      vendorId: id,
      name: docName,
    });
  }
  return id;
}

export async function setVendorStatus(id, status, reason) {
  await query(
    "UPDATE vendors SET status = :status, verified = :verified, rejection_reason = :reason WHERE id = :id",
    { id, status, verified: status === "Approved" ? 1 : 0, reason: status === "Rejected" ? reason || null : null }
  );
  return getVendorById(id);
}

/** Field names come in camelCase from the API layer; mapped to snake_case columns, plus a few structured fields (categories, address) handled separately. */
export async function updateVendor(id, updates) {
  const camelToColumn = {
    name: "name",
    businessName: "business_name",
    phone: "phone",
    location: "location",
    about: "about",
    image: "image",
    businessType: "business_type",
    gstNumber: "gst_number",
    yearsExperience: "years_experience",
  };
  const sets = [];
  const params = { id };
  for (const [key, column] of Object.entries(camelToColumn)) {
    if (updates[key] === undefined) continue;
    sets.push(`${column} = :${column}`);
    params[column] = updates[key];
  }
  if (updates.categories !== undefined) {
    sets.push("categories = :categories");
    params.categories = JSON.stringify(updates.categories);
  }
  if (updates.address) {
    if (updates.address.line1 !== undefined) {
      sets.push("address_line1 = :addressLine1");
      params.addressLine1 = updates.address.line1;
    }
    if (updates.address.city !== undefined) {
      sets.push("address_city = :addressCity");
      params.addressCity = updates.address.city;
    }
    if (updates.address.state !== undefined) {
      sets.push("address_state = :addressState");
      params.addressState = updates.address.state;
    }
    if (updates.address.pincode !== undefined) {
      sets.push("address_pincode = :addressPincode");
      params.addressPincode = updates.address.pincode;
    }
  }
  if (updates.bank) {
    if (updates.bank.accountName !== undefined) {
      sets.push("bank_account_name = :bankAccountName");
      params.bankAccountName = updates.bank.accountName;
    }
    if (updates.bank.accountNumber !== undefined) {
      sets.push("bank_account_number = :bankAccountNumber");
      params.bankAccountNumber = updates.bank.accountNumber;
    }
    if (updates.bank.ifsc !== undefined) {
      sets.push("bank_ifsc = :bankIfsc");
      params.bankIfsc = updates.bank.ifsc;
    }
    if (updates.bank.upi !== undefined) {
      sets.push("bank_upi = :bankUpi");
      params.bankUpi = updates.bank.upi;
    }
  }
  if (!sets.length) return getVendorById(id);
  await query(`UPDATE vendors SET ${sets.join(", ")} WHERE id = :id`, params);
  return getVendorById(id);
}

export async function getVendorDocuments(vendorId) {
  return query("SELECT name, status FROM vendor_documents WHERE vendor_id = :vendorId", { vendorId });
}
