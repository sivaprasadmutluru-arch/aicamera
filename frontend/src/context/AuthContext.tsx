import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi, type LoginRequest } from "../api/auth";
import { getToken, setToken, setUnauthorizedHandler } from "../api/client";
import type { Role } from "../types";

interface CurrentUser {
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_KEY = "vab_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as CurrentUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (payload: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(payload);
      setToken(response.token);
      const currentUser: CurrentUser = {
        userId: response.userId,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      setUser(currentUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && getToken()),
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
