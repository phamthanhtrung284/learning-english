"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@share/services/api";
import type { User } from "@share/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readProfile(): Partial<User> {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Run once on mount — read localStorage first for instant render,
  // then sync with server to get latest isAdmin/isPremium
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    const stored = readProfile();
    if (stored.id) {
      setUser(stored as User);
    }
    api.get("/auth/me")
      .then(({ data }) => {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setAuth = useCallback((token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch {
      /* offline */
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setAuth, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
