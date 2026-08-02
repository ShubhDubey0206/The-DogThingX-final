"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function AdminModePanel() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminLoggedIn } = useAdminAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (process.env.NEXT_PUBLIC_SHOW_ADMIN_PANEL !== 'true') return null;
  if (!mounted) return null;


  // Do not show the floating switcher panel when already inside admin section
  if (pathname?.startsWith("/admin")) return null;

  const handleClick = () => {
    if (isAdminLoggedIn) {
      router.push("/admin");
    } else {
      router.push("/admin/login");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`flex items-center gap-2 h-11 px-5 rounded-full shadow-lg border backdrop-blur-md transition-all font-bold text-xs tracking-wide ${
          isAdminLoggedIn
            ? "bg-[#F5A623] hover:bg-[#d4891a] text-[#111111] border-transparent shadow-[#F5A623]/25"
            : "bg-background/90 hover:bg-card border-border text-foreground shadow-black/20"
        }`}
        aria-label={isAdminLoggedIn ? "Go to Admin Dashboard" : "Admin Login"}
      >
        {isAdminLoggedIn ? (
          <>
            <Shield size={15} />
            <span>Admin Dashboard</span>
          </>
        ) : (
          <>
            <Lock size={14} className="text-muted-foreground" />
            <span>Admin Login</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
