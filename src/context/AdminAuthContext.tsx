"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AdminAuthContextValue {
  isAdminLoggedIn: boolean;
  adminUser: User | null;
  adminLogin: (email: string, password: string) => Promise<{ error: string | null }>;
  adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user?.user_metadata?.role === "admin") setAdminUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setAdminUser(user?.user_metadata?.role === "admin" ? user : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const adminLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user?.user_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      return { error: "You do not have admin access." };
    }
    return { error: null };
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn: !!adminUser, adminUser, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}