"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  isPinModalOpen: boolean;
  openPinModal: () => void;
  closePinModal: () => void;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(Boolean(data.isAdmin));
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdmin(true);
        setIsPinModalOpen(false);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Incorrect PIN" };
      }
    } catch {
      return { success: false, error: "Network error occurred" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsAdmin(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoading,
        isPinModalOpen,
        openPinModal: () => setIsPinModalOpen(true),
        closePinModal: () => setIsPinModalOpen(false),
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
