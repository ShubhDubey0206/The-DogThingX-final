"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Settings, ExternalLink, ArrowLeftRight, Menu, X, Archive,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getAllReviews, getStockQty } from "@/lib/storage";
import { toast } from "sonner";

async function computeBadges() {
  if (typeof window === "undefined") return { hasLowStock: false, pendingReviews: false };
  try {
    const reviews = await getAllReviews();
    return {
      hasLowStock: false,
      pendingReviews: reviews.filter((r) => r.status === "pending").length > 0,
    };
  } catch {
    return { hasLowStock: false, pendingReviews: false };
  }
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, adminLogout } = useAdminAuth();
  const [badges, setBadges] = useState({ hasLowStock: false, pendingReviews: false });

  useEffect(() => {
    computeBadges().then(setBadges).catch(() => {});
  }, []);

  function handleNav(path: string, comingSoon?: boolean) {
    if (comingSoon) { toast.info("Coming soon!"); return; }
    router.push(path);
    onClose?.();
  }

  function handleSwitchToUser() {
    adminLogout();
    router.push("/");
    toast.success("Switched to User mode 🐾");
    onClose?.();
  }

  function isActive(path: string) {
    return pathname === path || (path !== "/admin" && (pathname?.startsWith(path) ?? false));
  }

  const navItemCls = (path: string) =>
    `relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive(path) ? "bg-[#1F1F1F] text-[#F5A623]" : "text-[#9B9B9B] hover:bg-[#161616] hover:text-[#F5F0EB]"
    }`;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: Users, label: "Customers", path: "/admin/customers" },
    { icon: Archive, label: "Inventory", path: "/admin/inventory", dot: badges.hasLowStock ? "yellow" : null },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] border-r border-[#1F1F1F]">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#F5A623" opacity="0.12" />
            <ellipse cx="10" cy="10" rx="3" ry="4" fill="#F5A623" />
            <ellipse cx="22" cy="10" rx="3" ry="4" fill="#F5A623" />
            <ellipse cx="6" cy="18" rx="2.5" ry="3.5" fill="#F5A623" />
            <ellipse cx="26" cy="18" rx="2.5" ry="3.5" fill="#F5A623" />
            <path d="M16 14c-5 0-8 3-7 7s4 5 7 5 6-1 7-5-2-7-7-7z" fill="#F5A623" />
            <path d="M14 20 Q16 22 18 20" stroke="#0F0F0F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
          <span className="font-bold text-base text-[#F5F0EB]">Dog Thingx</span>
          <span className="text-[10px] bg-[#F5A623] text-[#111] px-1.5 py-0.5 rounded-full font-semibold">Admin</span>
        </div>
        <div className="text-xs text-[#9B9B9B] mt-0.5">{adminUser?.user_metadata?.full_name || adminUser?.email} · Superadmin</div>
      </div>
      <div className="border-b border-[#1F1F1F] mx-4 mb-3" />
      <nav role="navigation" aria-label="Admin navigation" className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path, dot, comingSoon }) => {
          const active = isActive(path);
          return (
            <button key={path} onClick={() => handleNav(path, comingSoon)} className={navItemCls(path)}>
              {active && <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#F5A623] rounded-r-full" />}
              <span className="relative">
                <Icon size={18} />
                {dot && !active && <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${dot === "orange" ? "bg-[#F5A623]" : "bg-[#EAB308]"}`} />}
              </span>
              {label}
              {comingSoon && <span className="ml-auto text-[10px] text-[#9B9B9B] bg-[#1A1A1A] px-1.5 py-0.5 rounded-full">Soon</span>}
            </button>
          );
        })}
        <div className="border-b border-[#1F1F1F] my-3" />
        <button onClick={() => { router.push("/"); onClose?.(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#9B9B9B] hover:bg-[#161616] hover:text-[#F5F0EB] transition-all duration-150">
          <ExternalLink size={18} /> View Website
        </button>
      </nav>
      <div className="px-4 pb-6 pt-4 border-t border-[#1F1F1F] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center text-[#111] font-bold text-sm flex-shrink-0">P</div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-[#F5F0EB] truncate">{adminUser?.user_metadata?.full_name || adminUser?.email?.split("@")[0]}</div>
            <div className="text-xs text-[#9B9B9B] truncate">{adminUser?.email}</div>
          </div>
        </div>
        <button onClick={handleSwitchToUser} className="w-full flex items-center justify-center gap-2 py-2 rounded-full text-sm text-[#9B9B9B] bg-[#1A1A1A] border border-[#2A2A2A] hover:text-[#F5F0EB] hover:border-[#F5A623]/40 transition-all">
          <ArrowLeftRight size={14} /> Switch to User Mode
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div className="hidden md:flex w-64 flex-shrink-0 h-screen sticky top-0"><SidebarContent /></div>
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#0F0F0F] border-b border-[#1F1F1F] h-14 flex items-center justify-between px-4">
          <span className="font-bold text-sm text-[#F5F0EB]">Dog Thingx Admin</span>
          <button onClick={() => setMobileOpen(true)} className="text-[#9B9B9B] hover:text-[#F5F0EB]"><Menu size={22} /></button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
              <motion.div className="fixed left-0 top-0 bottom-0 z-50 w-72" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.25, ease: "easeOut" }}>
                <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-[#9B9B9B] hover:text-[#F5F0EB] z-10"><X size={20} /></button>
                <SidebarContent onClose={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
