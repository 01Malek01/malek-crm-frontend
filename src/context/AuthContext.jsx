import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, meRequest, logoutRequest } from '../services/auth.service';
import { ROLES } from '../config/constants';

const AuthContext = createContext(null);

// Only non-sensitive profile fields are ever kept in memory. The session token
// lives in an httpOnly cookie and is never readable by JavaScript.
const toSessionUser = (user) =>
  user ? { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Drop any token/user left in localStorage by older builds (now cookie-based).
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');

    let active = true;
    meRequest()
      .then((me) => {
        if (active) setUser(toSessionUser(me));
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const me = await loginRequest(credentials);
    const sessionUser = toSessionUser(me);
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      isAdmin: user?.role === ROLES.ADMIN,
      isManager: user?.role === ROLES.ADMIN || user?.role === ROLES.SALES_MANAGER,
      hasRole: (role) => user?.role === role,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
