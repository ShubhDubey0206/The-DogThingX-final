"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, CreditCard, ShieldCheck, PhoneCall, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import { getOrderById, Order, getSiteConfig } from "@/lib/storage";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ORDER_STEPS = [
  { status: "confirmed", label: "Order Placed", desc: "We received your order" },
  { status: "processing", label: "Processing", desc: "Preparing your items" },
  { status: "out-for-delivery", label: "Out for Delivery", desc: "Partner is on the way" },
  { status: "delivered", label: "Delivered", desc: "Successfully delivered" },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.orderId as string;
  const orderId = rawId ? decodeURIComponent(rawId) : "";
  const { currentUser, isLoggedIn } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const siteConfig = getSiteConfig();

  // Auth guard — redirect unauthenticated users to home
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn || !orderId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const found = await getOrderById(orderId);
        // Ownership check: only show if the order belongs to this user
        const isAdmin = currentUser?.user_metadata?.role === "admin";
        if (found && !isAdmin && found.userEmail !== currentUser?.email) {
          setOrder(null); // Don't expose other users' orders
        } else {
          setOrder(found);
        }
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, isLoggedIn, currentUser]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <Package size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          We could not find order <span className="font-semibold text-foreground">{orderId}</span>. It may have been moved or removed.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 bg-[#F5A623] text-[#111111] font-bold rounded-full px-6 py-2.5 text-sm hover:bg-[#d4891a] transition-all"
        >
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === order.status);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => router.push("/orders")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#F5A623] transition-colors mb-2"
        >
          <ArrowLeft size={16} /> Back to My Orders
        </button>

        {/* Order Header Card */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">Order #{order.orderId}</h1>
                <StatusBadge status={order.status} type="order" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Placed on {formatDate(order.placedAt)}</p>
            </div>
            <a
              href={`https://wa.me/${siteConfig.whatsapp || "919960878712"}?text=Hi!%20I%20have%20a%20query%20regarding%20my%20order%20${order.orderId}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-full px-4 py-2 text-xs font-bold hover:bg-[#20bd59] transition-all"
            >
              <PhoneCall size={14} /> Contact Prasad on WhatsApp
            </a>
          </div>

          {/* Timeline Progress */}
          {order.status !== "cancelled" && (
            <div className="py-4">
              <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                Order Tracking Status
              </h2>
              <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-[#F5A623] -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${(activeStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                />

                {ORDER_STEPS.map((stepItem, idx) => {
                  const isDone = idx <= activeStep;
                  const isCurrent = idx === activeStep;

                  return (
                    <div key={stepItem.status} className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? "bg-[#F5A623] text-[#111111] ring-4 ring-[#F5A623]/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-semibold mt-2 hidden sm:block ${
                          isCurrent ? "text-[#F5A623]" : isDone ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {stepItem.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Purchased Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#F5A623]" /> Purchased Items ({order.items.length})
              </h2>
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <div key={item.productId} className="py-3.5 flex items-center gap-4 first:pt-0 last:pb-0">
                    <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&q=80";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">Category: {item.category}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">
                        ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-bold text-sm text-[#F5A623] shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Address & Cost Summary */}
          <div className="space-y-4">
            {/* Delivery Address */}
            <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <MapPin size={16} className="text-[#F5A623]" /> Delivery Address
              </h2>
              <div className="text-xs space-y-1 text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground text-sm">{order.deliveryAddress.name}</p>
                <p>📞 {order.deliveryAddress.phone}</p>
                <p>{order.deliveryAddress.street}</p>
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.pincode}
                </p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <CreditCard size={16} className="text-[#F5A623]" /> Payment Summary
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-semibold capitalize flex items-center gap-1">
                    {order.paymentMethod === "online" ? (
                      <>
                        Online (Razorpay) <ShieldCheck size={14} className="text-emerald-500" />
                      </>
                    ) : (
                      "Cash on Delivery"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span
                    className={`font-bold capitalize ${
                      order.paymentStatus === "paid" || order.paymentMethod === "online" || order.status === "delivered"
                        ? "text-emerald-500"
                        : "text-amber-500"
                    }`}
                  >
                    {order.paymentStatus === "paid" || order.paymentMethod === "online" || order.status === "delivered"
                      ? "Paid"
                      : "Pending (Collect at Doorstep)"}
                  </span>
                </div>
                <div className="border-t border-border pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-emerald-500 font-semibold">FREE (Local ≤ 4km)</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#F5A623] pt-1 border-t border-border">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
