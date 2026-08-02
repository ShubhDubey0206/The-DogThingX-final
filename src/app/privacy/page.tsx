"use client";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from "lucide-react";
import { Footer } from "@/components/Footer";
import { getSiteConfig } from "@/lib/storage";

export default function PrivacyPolicyPage() {
  const siteConfig = getSiteConfig();

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#F5A623] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 bg-[#F5A623]/10 text-[#F5A623] rounded-full px-3 py-1 text-xs font-semibold mb-3">
            <ShieldCheck size={14} /> Official Policy
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lock size={18} className="text-[#F5A623]" /> 1. Information We Collect
            </h2>
            <p>
              At <strong>The Dog Thingx</strong>, we respect your privacy. When you visit our website, place an order,
              or register for an account, we collect personal information required to fulfill your orders and provide pet services:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact details: Full Name, Phone Number, Email Address.</li>
              <li>Delivery details: Street Address, City, Pincode in Pune / Maharashtra.</li>
              <li>Account credentials: Encrypted password managed via Supabase Auth.</li>
              <li>Order history: Items purchased, order statuses, and transaction details.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Eye size={18} className="text-[#F5A623]" /> 2. How We Use Your Information
            </h2>
            <p>We use the collected information strictly for legitimate business purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Processing and delivering your orders within our 4km local radius and beyond.</li>
              <li>Sending order status updates via SMS, Phone Call, or WhatsApp.</li>
              <li>Providing customer support and pet dietary recommendations.</li>
              <li>Verifying payment transactions securely via Razorpay.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#F5A623]" /> 3. Payment Security & Third-Party Sharing
            </h2>
            <p>
              We do <strong>NOT</strong> store or handle raw credit card numbers or UPI PINs on our servers. All online payment
              transactions are processed through <strong>Razorpay Payment Gateway</strong> using bank-grade 256-bit SSL encryption.
            </p>
            <p>
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText size={18} className="text-[#F5A623]" /> 4. Contact Us About Your Privacy
            </h2>
            <p>If you have any questions regarding this Privacy Policy or wish to delete your account data, please contact us:</p>
            <div className="bg-card border border-card-border rounded-xl p-4 text-xs text-foreground space-y-1">
              <p><strong>The Dog Thingx Pet Shop</strong></p>
              <p>📍 Talegaon Dabhade, Pune, Maharashtra, India</p>
              <p>📞 Phone: {siteConfig.phone || "9960878712"}</p>
              <p>✉️ Email: {siteConfig.email || "thedogthingx@gmail.com"}</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
