"use client";
import Link from "next/link";
import { ArrowLeft, Truck, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { getSiteConfig } from "@/lib/storage";

export default function ShippingPolicyPage() {
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
            <Truck size={14} /> Shipping & Delivery
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Shipping & Delivery Policy</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Truck size={18} className="text-[#F5A623]" /> 1. Free Local Delivery (Within {siteConfig.freeDeliveryRadiusKm || 4}km Radius)
            </h2>
            <p>
              At <strong>The Dog Thingx</strong>, we provide <strong>Free Local Delivery</strong> for all pet supplies, food, and accessories within a <strong>4km radius</strong> of our physical store located in Talegaon Dabhade, Pune.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Local orders are delivered on the same day or within 24 hours of order placement.</li>
              <li>Our delivery partner will call you prior to arrival to confirm your presence at the doorstep.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock size={18} className="text-[#F5A623]" /> 2. Standard Shipping & Timelines
            </h2>
            <p>
              For orders placed beyond our 4km local radius (across Pune & Maharashtra), items are carefully packaged and dispatched via reliable courier partners.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dispatch Time</strong>: Within 24 hours of order confirmation.</li>
              <li><strong>Delivery Timeline</strong>: Standard delivery takes <strong>2 to 5 business days</strong> depending on your location.</li>
              <li><strong>Order Tracking</strong>: Once dispatched, you can view your real-time tracking status in your account under <Link href="/orders" className="text-[#F5A623] hover:underline">My Orders</Link>.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin size={18} className="text-[#F5A623]" /> 3. Store Pickup Option
            </h2>
            <p>
              Customers in Talegaon Dabhade, Pune can also choose to pick up their orders directly from our store with zero waiting time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#F5A623]" /> 4. Delivery Inquiries & Contact
            </h2>
            <p>If you have any questions or urgent delivery requests, feel free to reach out to Prasad:</p>
            <div className="bg-card border border-card-border rounded-xl p-4 text-xs text-foreground space-y-1">
              <p><strong>The Dog Thingx Pet Shop</strong></p>
              <p>📍 Talegaon Dabhade, Pune, Maharashtra, India</p>
              <p>📞 Phone / WhatsApp: {siteConfig.phone || "9960878712"}</p>
              <p>✉️ Email: {siteConfig.email || "thedogthingx@gmail.com"}</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
