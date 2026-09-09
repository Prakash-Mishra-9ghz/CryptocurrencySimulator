import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * Central authentication state. This is real state-management logic —
 * not mock data. It has nothing to fake yet because no login call has
 * happened; that's wired up in Step 2 (authService -> POST /api/auth/login).
 *
 * On invalid/expired auth, call logout() to clear state and let
 * ProtectedRoute redirect to /login (spec Section 14).
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // If any API call comes back 401 (invalid/expired token), clear auth
  // state. ProtectedRoute will then redirect to /login on next render.
  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
