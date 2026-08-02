"use client";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { getSiteConfig } from "@/lib/storage";

export default function RefundPolicyPage() {
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
            <RefreshCw size={14} /> Returns & Refunds
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Refund & Cancellation Policy</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <RefreshCw size={18} className="text-[#F5A623]" /> 1. 7-Day Replacement Policy
            </h2>
            <p>
              At <strong>The Dog Thingx</strong>, customer and pet satisfaction is our top priority. We offer a <strong>7-day replacement policy</strong> for pet supplies, food bags, and accessories if:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The item delivered is damaged, defective, or expired.</li>
              <li>The item delivered does not match your order specification (wrong size/flavor).</li>
              <li>The product seal remains intact and unused.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock size={18} className="text-[#F5A623]" /> 2. Order Cancellation
            </h2>
            <p>
              You can cancel your order before it has been dispatched from our Talegaon store. Once dispatched for local delivery or handed over to the courier partner, cancellations cannot be processed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#F5A623]" /> 3. Refund Timeline & Process
            </h2>
            <p>
              Once your returned item is received and inspected at our store, approved refunds will be credited back to your original payment method (via Razorpay for online payments or UPI/Cash for COD orders) within <strong>5 to 7 business days</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#F5A623]" /> 4. How to Request a Return / Refund
            </h2>
            <p>To initiate a return or replacement, contact Prasad directly with your order ID:</p>
            <div className="bg-card border border-card-border rounded-xl p-4 text-xs text-foreground space-y-1">
              <p><strong>The Dog Thingx Pet Shop</strong></p>
              <p>📍 Talegaon Dabhade, Pune, Maharashtra, India</p>
              <p>📞 WhatsApp / Phone: {siteConfig.phone || "9960878712"}</p>
              <p>✉️ Email: {siteConfig.email || "thedogthingx@gmail.com"}</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
