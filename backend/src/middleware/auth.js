import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserById } from "../repositories/userRepository.js";

/**
 * Populates req.user from a verified JWT. The token only carries the user id
 * — role, vendorId, status etc. are always re-read from the database on
 * every request so a suspended vendor or a role change takes effect
 * immediately, instead of persisting for the lifetime of an old token.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw AppError.unauthorized("Sign in to continue.");

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw AppError.unauthorized("Your session has expired. Please sign in again.", "TOKEN_INVALID");
  }

  const user = await findUserById(decoded.sub);
  if (!user || !user.is_active) {
    throw AppError.unauthorized("Your session is no longer valid. Please sign in again.", "TOKEN_INVALID");
  }

  req.user = user;
  next();
});

/** Attaches req.user if a valid token is present, but never rejects the request. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.sub);
    if (user && user.is_active) req.user = user;
  } catch {
    // Invalid/expired token on an optional route — proceed as anonymous.
  }
  next();
});
