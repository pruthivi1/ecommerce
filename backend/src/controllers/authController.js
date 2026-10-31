import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { toPublicUser } from "../repositories/userRepository.js";
import * as authService from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerBuyer(req.body);
  sendSuccess(res, result, { message: "Account created.", status: 201 });
});

export const registerVendor = asyncHandler(async (req, res) => {
  const result = await authService.registerVendor(req.body);
  sendSuccess(res, result, { message: "Vendor application submitted. It is now pending review.", status: 201 });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, { message: "Signed in." });
});

export const demoLogin = asyncHandler(async (req, res) => {
  const result = await authService.demoLogin(req.body.role);
  sendSuccess(res, result, { message: "Signed in (demo)." });
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, toPublicUser(req.user));
});

export const logout = asyncHandler(async (_req, res) => {
  // Stateless JWTs: "logout" is client-side (discard the token). Documented
  // here rather than implemented as a server-side blocklist, which this
  // scale of app doesn't need; revisit with a token blocklist/short TTL +
  // refresh tokens if session revocation becomes a requirement.
  sendSuccess(res, null, { message: "Signed out." });
});
