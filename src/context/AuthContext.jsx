import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService.js";
import { getToken, setToken as persistToken } from "../services/apiClient.js";
import { ROLES } from "../utils/constants.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [role, setRole] = useState(ROLES.GUEST);
  const [initializing, setInitializing] = useState(true);

  // On first load, a token in localStorage is only trusted after the server
  // confirms it's still valid (GET /auth/me) — a stale/expired token never
  // silently grants access.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getToken();
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const me = await authService.me();
        if (!cancelled) {
          setUserState(me);
          setRole(me.role);
        }
      } catch {
        if (!cancelled) persistToken(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithSession = useCallback(({ token, user: sessionUser }) => {
    persistToken(token);
    setUserState(sessionUser);
    setRole(sessionUser.role);
  }, []);

  /** Development-only demo role switch — calls the backend's demo-login endpoint, which refuses to run in production. */
  const switchRole = useCallback(
    async (nextRole) => {
      if (nextRole === ROLES.GUEST) {
        persistToken(null);
        setUserState(null);
        setRole(ROLES.GUEST);
        return;
      }
      const session = await authService.demoLogin(nextRole);
      loginWithSession(session);
    },
    [loginWithSession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout is a client-side token discard regardless of network state.
    }
    persistToken(null);
    setUserState(null);
    setRole(ROLES.GUEST);
  }, []);

  const value = useMemo(
    () => ({ role, user, isAuthenticated: role !== ROLES.GUEST, initializing, switchRole, loginWithSession, logout, setUser: setUserState }),
    [role, user, initializing, switchRole, loginWithSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
