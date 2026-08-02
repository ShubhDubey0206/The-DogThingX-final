"use client";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, ShoppingBag, Truck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { getSiteConfig } from "@/lib/storage";

export default function TermsPage() {
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
            <FileText size={14} /> Store Terms
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Terms & Conditions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#F5A623]" /> 1. Overview & Agreement
            </h2>
            <p>
              Welcome to <strong>The Dog Thingx</strong>. By accessing our website or purchasing products from our store
              in Talegaon Dabhade, Pune, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#F5A623]" /> 2. Products & Pricing
            </h2>
            <p>
              All prices listed on our website (in INR ₹) are <strong>all-inclusive final prices</strong>. We reserve the right
              to update product availability or prices as needed. Product images are for illustrative purposes and actual product
              packaging may vary slightly based on manufacturer updates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Truck size={18} className="text-[#F5A623]" /> 3. Local Delivery Policy
            </h2>
            <p>
              We offer <strong>Free Delivery within a 4km radius</strong> of our physical store in Talegaon Dabhade, Pune.
              Orders placed beyond 4km may be dispatched via partner courier services with standard delivery timelines of 2–5 business days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText size={18} className="text-[#F5A623]" /> 4. Contact Information
            </h2>
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
