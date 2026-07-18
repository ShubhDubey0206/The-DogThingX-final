"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Order, OrderStatus, getOrders } from "@/lib/storage";
import { OrderCard } from "@/components/orders/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Footer } from "@/components/Footer";

const STATUS_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Out for Delivery", value: "out-for-delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function OrdersPage() {

  const router = useRouter();
  const { currentUser, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/"); return; }
    if (!currentUser?.email) return;
    const email = currentUser.email;
    setLoading(true);
    getOrders(email)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [currentUser, isLoggedIn]);


  const filtered = activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);
  const countFor = (tab: OrderStatus | "all") => tab === "all" ? orders.length : orders.filter((o) => o.status === tab).length;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <nav aria-label="Breadcrumb" className="mb-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-[#F5A623] transition-colors">Home</Link>
            <span className="mx-2">›</span>
            <span>My Orders</span>
          </p>
        </nav>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-3xl font-extrabold">My Orders</h1>
          <p className="text-muted-foreground mt-1">Track your orders and view history</p>
        </motion.div>
        <div role="tablist" aria-label="Order status filter" className="flex flex-wrap gap-2 mb-8">
          {STATUS_TABS.map((tab) => {
            const count = countFor(tab.value);
            return (
              <button key={tab.value} role="tab" aria-selected={activeTab === tab.value} onClick={() => setActiveTab(tab.value)} data-testid={`tab-orders-${tab.value}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeTab === tab.value ? "bg-[#F5A623] text-[#111111]" : "bg-card border border-border text-muted-foreground hover:border-[#F5A623] hover:text-[#F5A623]"}`}
              >
                {tab.label}
                {count > 0 && <span className={`ml-1.5 text-xs font-semibold ${activeTab === tab.value ? "text-[#111111]" : "text-muted-foreground"}`}>({count})</span>}
              </button>
            );
          })}
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders yet" subtitle={activeTab === "all" ? "Start shopping and your orders will appear here." : `No orders with status "${activeTab.replace(/-/g, " ")}".`} buttonLabel={activeTab === "all" ? "Browse Shop →" : "View all orders"} onButtonClick={() => activeTab === "all" ? router.push("/shop") : setActiveTab("all")} />
        ) : (
          <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="space-y-4">
            {filtered.map((order, i) => <OrderCard key={order.orderId} order={order} isLast={i === filtered.length - 1} />)}
          </motion.div>
        )}
      </main>
      <Footer />
    </>
  );
}
