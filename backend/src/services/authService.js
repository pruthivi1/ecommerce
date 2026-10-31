import { withTransaction } from "../config/db.js";
import { findUserByEmail, createUser, toPublicUser } from "../repositories/userRepository.js";
import { createVendor } from "../repositories/vendorRepository.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { slugify } from "../utils/slugify.js";
import { AppError } from "../utils/AppError.js";
import { notifyAdmins } from "./notificationService.js";
import { env } from "../config/env.js";

function issueSession(user) {
  const token = signToken({ sub: user.id, role: user.role });
  return { token, user: toPublicUser(user) };
}

export async function registerBuyer(payload) {
  const existing = await findUserByEmail(payload.email);
  if (existing) throw AppError.conflict("An account with this email already exists.", "EMAIL_IN_USE");

  const passwordHash = await hashPassword(payload.password);
  const user = await createUser({
    role: "buyer",
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    passwordHash,
    businessName: payload.businessName,
    gstNumber: payload.gstNumber,
    businessType: payload.businessType,
  });
  return issueSession(user);
}

/**
 * Public vendor registration always lands the application in PENDING status
 * — there is no path from this endpoint to an approved, selling vendor
 * account. Only an admin approval action (see vendorService.approveVendor)
 * can move it to Approved.
 */
export async function registerVendor(payload) {
  const existing = await findUserByEmail(payload.email);
  if (existing) throw AppError.conflict("An account with this email already exists.", "EMAIL_IN_USE");

  const passwordHash = await hashPassword(payload.password);

  const result = await withTransaction(async (connection) => {
    const [insertResult] = await connection.query(
      `INSERT INTO users (id, role, name, email, phone, password_hash)
       VALUES (UUID(), 'vendor', :name, :email, :phone, :passwordHash)`,
      { name: payload.ownerName, email: payload.email.toLowerCase(), phone: payload.phone || null, passwordHash }
    );
    const [[userRow]] = await connection.query("SELECT * FROM users WHERE email = :email LIMIT 1", { email: payload.email.toLowerCase() });

    const vendorId = await createVendor(
      {
        userId: userRow.id,
        slug: `${slugify(payload.businessName)}-${userRow.id.slice(0, 6)}`,
        businessName: payload.businessName,
        ownerName: payload.ownerName,
        email: payload.email,
        phone: payload.phone,
        categories: payload.categories,
        location: payload.location,
        address: payload.address,
        gstNumber: payload.gstNumber,
        businessType: payload.businessType,
        documents: payload.documents,
      },
      connection
    );
    return { userRow, vendorId };
  });

  await notifyAdmins({ title: "New vendor application", body: `${payload.businessName} submitted an application for review.` });

  return issueSession(result.userRow);
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) throw AppError.unauthorized("Invalid email or password.", "INVALID_CREDENTIALS");
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw AppError.unauthorized("Invalid email or password.", "INVALID_CREDENTIALS");
  if (!user.is_active) throw AppError.forbidden("This account has been deactivated.", "ACCOUNT_DISABLED");
  return issueSession(user);
}

/**
 * Development-only convenience login matching the frontend's original demo
 * role switcher. Gated by ALLOW_DEMO_LOGIN (env.js refuses to even boot with
 * this enabled when NODE_ENV=production), so it can never become a
 * production authentication bypass.
 */
export async function demoLogin(role) {
  if (!env.allowDemoLogin) throw AppError.forbidden("Demo login is disabled in this environment.", "DEMO_LOGIN_DISABLED");
  const email = { buyer: "demo-buyer@marketbridge.example", vendor: "demo-vendor@marketbridge.example", admin: "demo-admin@marketbridge.example" }[role];
  const user = await findUserByEmail(email);
  if (!user) throw AppError.notFound("Demo account not seeded. Run the backend seed script.", "DEMO_ACCOUNT_MISSING");
  return issueSession(user);
}
