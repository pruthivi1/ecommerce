import { apiGet, apiPost } from "./apiClient.js";

export async function login({ email, password }) {
  return apiPost("/auth/login", { email, password });
}

export async function me() {
  return apiGet("/auth/me");
}

export async function logout() {
  return apiPost("/auth/logout");
}

/**
 * Development-only convenience login matching the old demo role switcher.
 * The backend refuses this endpoint outright when running in production
 * (see backend ALLOW_DEMO_LOGIN / env.js), so it can never become a
 * production auth bypass no matter what the frontend sends.
 */
export async function demoLogin(role) {
  return apiPost("/auth/demo-login", { role });
}

export async function mockRegisterBuyer(payload) {
  return apiPost("/auth/register", payload);
}

// The registration form only collects login details; the full business
// profile is completed afterward on the vendor application page
// (vendorService.updateVendorProfile -> PATCH /vendor/me). businessName is
// required to create the vendor row, so it's seeded from the owner's name
// and overwritten as soon as the application form is submitted.
export async function mockRegisterVendorAccount(payload) {
  return apiPost("/auth/register/vendor", {
    ownerName: payload.name,
    businessName: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
  });
}

// The backend intentionally does not implement password-reset email
// delivery (no email/SMS provider is configured for this build — see the
// final report's "remaining limitations"). This keeps the form's UX intact
// without claiming a reset email was actually sent.
export async function mockRequestPasswordReset(email) {
  if (!email) throw new Error("Enter the email associated with your account.");
  return { sent: true };
}
