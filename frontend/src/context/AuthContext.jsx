import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, clearCsrfTokenMemory } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await apiRequest("/auth/me");
      setUser(data.user);
      return data.user;
    } catch (_error) {
      setUser(null);
      clearCsrfTokenMemory();
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const register = async (payload) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: payload,
    });
    setUser(data.user);
    return data.user;
  };

  const login = async (payload) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: payload,
    });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    clearCsrfTokenMemory();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      refreshUser,
      register,
      login,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

