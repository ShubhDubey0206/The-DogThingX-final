import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { CartProvider } from "@/context/CartContext";
import { NavBar } from "@/components/NavBar";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "The Dog Thingx Pet Shop — Pune's Favourite Pet Store",
  description:
    "The Dog Thingx is Pune's favourite pet shop. Shop premium pet food, accessories, grooming products and adopt dogs, cats, birds & fish. Talegaon Dabhade, Pune.",
  keywords: ["pet shop pune", "dog food pune", "cat accessories", "pet adoption pune", "the dog thingx"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="dtx_theme">
          <AuthProvider>
            <AdminAuthProvider>
              <CartProvider>
                <NavBar />
                <CartDrawer />
                <Toaster position="bottom-right" richColors />
                <main className="pt-16">{children}</main>
              </CartProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

