import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Token strategy: short-lived-ish signed JWT (default 7d, configurable via
 * JWT_EXPIRES_IN) carrying only { sub: userId, role, vendorId? }. The
 * frontend sends it as `Authorization: Bearer <token>`.
 *
 * XSS note: a bearer token held in browser storage (even sessionStorage) is
 * readable by any script that runs on the page, so a successful XSS attack
 * can steal it. The alternative — an HttpOnly, Secure, SameSite=Lax/Strict
 * cookie — is not readable by JS but needs CSRF protection (a double-submit
 * token or SameSite=Strict) instead. This implementation uses the bearer
 * token approach to match the existing frontend's localStorage-based auth
 * context with minimal restructuring; if this app later handles higher-risk
 * data, migrating to HttpOnly cookies + CSRF tokens is the safer option and
 * should be revisited with the team.
 */
export function signToken(payload) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}
