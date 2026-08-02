"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, Heart, Package, LogOut, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { SignInModal } from "@/components/auth/SignInModal";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const { currentUser, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobileOpen(false); setAvatarOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname?.startsWith(href) ?? false;
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href === "/#about") return scrollToSection("testimonials");
    if (href === "/#contact") return scrollToSection("footer");
  };

  const handleShopNow = () => {
    if (pathname === "/") scrollToSection("products");
    else router.push("/shop");
  };

  // Extract the user's name securely from Supabase user metadata or email fallback
  const userName = currentUser?.user_metadata?.full_name
    || currentUser?.email?.split("@")[0]
    || "User";
  const initials = userName.charAt(0).toUpperCase();

  return (
    <>
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-200 ${
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-background"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
            <img
              src="/logo.jpeg"
              alt="The Dog Thingx logo"
              className="h-15 w-auto object-contain"
            />
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              link.href.startsWith("/#") ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-[#F5A623] transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-[#F5A623] border-b-2 border-[#F5A623]"
                      : "text-muted-foreground hover:text-[#F5A623]"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
              data-testid="button-open-cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-card transition-colors"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#F5A623] text-[#111111] text-xs font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <DarkModeToggle />

            {/* Auth */}
            {currentUser ? (
              <div ref={avatarRef} className="relative">
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  aria-label="User menu"
                  data-testid="button-user-menu"
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F5A623] text-[#111111] font-bold text-sm flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="hidden lg:block text-sm font-medium max-w-[80px] truncate">
                    {userName}
                  </span>
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 w-56 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#F5A623] text-[#111111] font-bold text-sm flex items-center justify-center shrink-0">{initials}</div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{userName}</p>
                            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                          </div>
                        </div>
                      </div>
                      {currentUser?.user_metadata?.role === "admin" ? (
                        <>
                          <button
                            onClick={() => { setAvatarOpen(false); router.push("/admin"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#F5A623] hover:bg-[#F5A623]/10 transition-colors text-left"
                          >
                            <Shield size={15} />
                            Admin Dashboard
                          </button>
                          <button
                            onClick={() => { setAvatarOpen(false); router.push("/admin/orders"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card transition-colors text-left"
                          >
                            <Package size={15} className="text-muted-foreground" />
                            Manage Customer Orders
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setAvatarOpen(false); toast("Coming soon!"); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card transition-colors text-left"
                          >
                            <Heart size={15} className="text-muted-foreground" />
                            My Wishlist
                          </button>
                          <button
                            onClick={() => { setAvatarOpen(false); router.push("/orders"); }}
                            data-testid="link-my-orders"
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card transition-colors text-left ${pathname?.startsWith("/orders") ? "text-[#F5A623] bg-card" : ""}`}
                          >
                            <Package size={15} className={pathname?.startsWith("/orders") ? "text-[#F5A623]" : "text-muted-foreground"} />
                            My Orders
                            {pathname?.startsWith("/orders") && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F5A623]" />}
                          </button>
                        </>
                      )}

                      <div className="border-t border-border">
                        <button
                          onClick={() => { signOut(); setAvatarOpen(false); toast("Signed out. See you soon! 🐾"); }}
                          data-testid="button-sign-out"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card transition-colors text-red-500 text-left"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setSignInOpen(true)}
                data-testid="button-sign-in-nav"
                className="hidden sm:flex text-sm font-medium px-3 py-1.5 border border-border rounded-full hover:bg-card transition-colors"
              >
                Sign in
              </button>
            )}

            {/* Shop Now */}
            <button
              onClick={handleShopNow}
              data-testid="button-shop-now"
              className="hidden sm:flex bg-[#F5A623] text-[#111111] rounded-full px-5 py-2 text-sm font-bold hover:bg-[#d4891a] active:scale-95 transition-all"
            >
              Shop Now
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              data-testid="button-hamburger"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-card transition-colors"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-background border-b border-border px-4 py-4 space-y-1"
            >
              {NAV_LINKS.map((link) => (
                link.href.startsWith("/#") ? (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-[#F5A623] transition-colors rounded-lg hover:bg-card"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.href) ? "text-[#F5A623] bg-[#F5A623]/10" : "text-muted-foreground hover:bg-card"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <div className="flex gap-2 pt-2">
                {!currentUser && (
                  <button
                    onClick={() => { setMobileOpen(false); setSignInOpen(true); }}
                    className="flex-1 border border-border rounded-full py-2 text-sm font-medium hover:bg-card transition-all"
                  >
                    Sign in
                  </button>
                )}
                <Link
                  href="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 bg-[#F5A623] text-[#111111] rounded-full py-2 text-sm font-bold text-center hover:bg-[#d4891a] transition-all"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}