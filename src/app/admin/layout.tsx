"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isAdminLoggedIn && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [isAdminLoggedIn, isLoginPage]);

  // Login page renders standalone (no sidebar)
  if (isLoginPage) return <>{children}</>;

  // Other admin pages need auth
  if (!isAdminLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-[#F5F0EB] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
