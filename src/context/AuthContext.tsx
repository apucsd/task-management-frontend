"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { clearAuthSession, getAuthToken } from "@/lib/auth";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  status?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  fetchProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/users/profile");
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(res.data.data));
        }
      }
    } catch (err: any) {
      console.error("Failed to load user profile:", getApiErrorMessage(err));
      if (err?.response?.status === 401) {
        clearAuthSession();
        setUser(null);
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const logout = () => {
    clearAuthSession();
    setUser(null);
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
