"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  isPinModalOpen: boolean;
  openPinModal: () => void;
  closePinModal: () => void;
  login: (pin?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const isAdmin = status === "authenticated" && Boolean(session?.user);
  const isLoading = status === "loading";
  const user = (session?.user as UserProfile) || null;

  const openPinModal = () => {
    router.push("/login");
  };

  const closePinModal = () => {
    setIsPinModalOpen(false);
  };

  const login = async (): Promise<{ success: boolean; error?: string }> => {
    router.push("/login");
    return { success: true };
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const checkAuth = async () => {
    // Handled reactively by NextAuth useSession()
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoading,
        user,
        isPinModalOpen,
        openPinModal,
        closePinModal,
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
