import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { ROLES } from "../../utils/constants.js";

const ROLE_HOME = {
  [ROLES.BUYER]: "/buyer/dashboard",
  [ROLES.VENDOR]: "/vendor/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
};

/**
 * Enforces that only `role` may view the wrapped route.
 * - Not signed in at all -> /login (with a redirect back once they pick a role).
 * - Signed in as a DIFFERENT role -> bounced to that role's own dashboard,
 *   never to /login (they're already authenticated, just wrong section).
 */
export default function ProtectedRoute({ role, children }) {
  const { role: currentRole, initializing } = useAuth();
  const location = useLocation();

  // A token in localStorage is being verified against the server (GET
  // /auth/me) — hold off on redirecting until that resolves, otherwise a
  // signed-in user briefly bounces to /login on every page refresh.
  if (initializing) return null;

  if (currentRole === role) {
    return children;
  }

  if (currentRole === ROLES.GUEST) {
    return <Navigate to={`/login?role=${role}&redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Navigate to={ROLE_HOME[currentRole] || "/"} replace />;
}
