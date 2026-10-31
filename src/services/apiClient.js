/**
 * Real REST client for the MarketBridge backend (Node/Express/MySQL — see
 * /backend). Every service module in this folder now calls the backend
 * through the functions here instead of touching a local mock store.
 *
 * Token storage: the JWT issued by /api/auth/* is kept in localStorage so it
 * survives a page refresh, matching how this app already persisted demo
 * role state. See backend/src/utils/jwt.js for the XSS/CSRF tradeoff this
 * implies — acceptable for this app's risk profile, worth revisiting if the
 * data handled here becomes more sensitive.
 */

import { handleMockFallback } from "./mockAdapter.js";

const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:4000/api";
const TOKEN_KEY = "mb_auth_token";

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable — the session just won't survive a refresh.
  }
}

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, query, auth = true } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, value);
    }
  }

  const headers = { "Content-Type": "application/json" };
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // If real backend is unreachable, gracefully fall back to local mock adapter
    try {
      return await handleMockFallback(path, { method, body, query, auth });
    } catch (mockErr) {
      if (mockErr instanceof ApiError) throw mockErr;
      throw new ApiError("Could not reach the server. Check your connection and try again.", { status: 0, code: "NETWORK_ERROR" });
    }
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // No JSON body (e.g. 204) — fine.
  }

  if (!response.ok || payload?.success === false) {
    if (response.status === 401) setToken(null);
    throw new ApiError(payload?.message || `Request failed with status ${response.status}.`, {
      status: response.status,
      code: payload?.code || "UNKNOWN_ERROR",
      details: payload?.details,
    });
  }

  return payload?.data;
}

/**
 * Best-effort read of the `role` claim from the current JWT, used only to
 * pick which role-scoped endpoint a shared service function (e.g.
 * orderService.getOrders, used by both buyer and admin pages) should call.
 * This is never used for authorization — the backend independently enforces
 * every route's role regardless of what this returns.
 */
export function getCurrentRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role || null;
  } catch {
    return null;
  }
}

export const apiGet = (path, query) => request(path, { method: "GET", query });
export const apiPost = (path, body) => request(path, { method: "POST", body });
export const apiPatch = (path, body) => request(path, { method: "PATCH", body });
export const apiDelete = (path) => request(path, { method: "DELETE" });
