"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { IndianRupee, ShoppingBag, Users, RefreshCw, Eye, CheckCircle2, Plus, Download, Phone, Copy } from "lucide-react";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { getAllOrders, updateOrderStatus } from "@/lib/storage";
import { exportOrdersCSV } from "@/lib/exportCsv";
import { toast } from "sonner";
import type { Order } from "@/lib/storage";

const DONUT_COLORS: Record<string, string> = {
  confirmed: "#29ABE2", processing: "#EAB308", "out-for-delivery": "#F5A623", delivered: "#22C55E", cancelled: "#EF4444",
};

function formatRevenue(n: number) { return "₹" + n.toLocaleString("en-IN"); }
function greeting() { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 17) return "Good afternoon"; return "Good evening"; }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }); }

function StatCard({ label, value, icon, iconBg, trend, trendPositive, subRow, index, ariaLabel }: { label: string; value: string; icon: React.ReactNode; iconBg: string; trend?: string; trendPositive?: boolean; subRow?: string; index: number; ariaLabel: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-3" aria-label={ariaLabel}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#9B9B9B]">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-[#F5F0EB]">{value}</div>
      {trend && <div className={`text-xs font-medium ${trendPositive ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{trend}</div>}
      {subRow && <div className="text-xs text-[#9B9B9B]">{subRow}</div>}
    </motion.div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload?.length) return <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-sm font-semibold text-white">{formatRevenue(payload[0].value)}</div>;
  return null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getAllOrders();
        if (!active) return;
        setOrders(data);
      } catch (error) {
        console.error("Failed to load dashboard orders", error);
        toast.error("Unable to load dashboard data right now.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      active = false;
    };
  }, [tick]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
      setTick((t) => t + 1);
    } catch (error) {
      console.error("Failed to refresh dashboard", error);
      toast.error("Unable to refresh dashboard data.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const now = new Date();
  const orderCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {
    confirmed: 0,
    processing: 0,
    "out-for-delivery": 0,
    delivered: 0,
    cancelled: 0,
  });
  const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const customerCount = new Set(orders.map((order) => order.userEmail)).size;
  const newCustomers = orders.filter((order) => {
    const placedAt = new Date(order.placedAt);
    return placedAt.getMonth() === now.getMonth() && placedAt.getFullYear() === now.getFullYear();
  }).length;
  const revenueByDay = Array.from({ length: now.getDate() }, (_, index) => {
    const day = index + 1;
    const revenueForDay = orders.filter((order) => {
      const placedAt = new Date(order.placedAt);
      return placedAt.getDate() === day && placedAt.getMonth() === now.getMonth() && placedAt.getFullYear() === now.getFullYear() && order.status !== "cancelled";
    }).reduce((sum, order) => sum + order.total, 0);

    return { day, revenue: revenueForDay };
  });
  const recentOrders = [...orders].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()).slice(0, 5);
  const donutData = Object.entries(orderCounts).filter(([, value]) => value > 0).map(([status, value]) => ({ name: status, value }));
  const totalOrderCount = orders.length;
  const chartData = revenueByDay.slice(0, 15);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F0EB]">Dashboard</h1>
          <p className="text-sm text-[#9B9B9B] mt-1">{greeting()}, Prasad 👋 Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#9B9B9B] hidden sm:block">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          <button onClick={refresh} className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1.5 text-sm hover:border-[#F5A623]/40 transition-colors text-[#9B9B9B]">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={formatRevenue(revenue)} icon={<IndianRupee size={18} className="text-white" />} iconBg="#1A3A1A" trend={`+12% vs last month`} trendPositive={true} index={0} ariaLabel={`Total Revenue: ${formatRevenue(revenue)}`} />
        <StatCard label="Total Orders" value={String(totalOrderCount)} icon={<ShoppingBag size={18} className="text-white" />} iconBg="#1A1A3A" subRow={`Delivered: ${orderCounts.delivered}  ·  Active: ${orderCounts.confirmed + orderCounts.processing + orderCounts["out-for-delivery"]}  ·  Cancelled: ${orderCounts.cancelled}`} index={1} ariaLabel={`Total Orders: ${totalOrderCount}`} />
        <StatCard label="Total Customers" value={String(customerCount)} icon={<Users size={18} className="text-white" />} iconBg="#3A1A1A" trend={`+${newCustomers} new this month`} trendPositive={newCustomers > 0} index={2} ariaLabel={`Total Customers: ${customerCount}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[#F5F0EB]">Revenue This Month</h2>
          <p className="text-sm text-[#9B9B9B] mb-4">Daily order totals</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={14}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245,166,35,0.08)" }} />
              <Bar dataKey="revenue" fill="#F5A623" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[#F5F0EB]">Order Breakdown</h2>
          <p className="text-sm text-[#9B9B9B] mb-4">By current status</p>
          {donutData.length > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {donutData.map((entry) => <Cell key={entry.name} fill={DONUT_COLORS[entry.name] ?? "#888"} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatRevenue(Number(value ?? 0)), "orders"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center"><div className="text-2xl font-bold text-[#F5F0EB]">{totalOrderCount}</div><div className="text-xs text-[#9B9B9B]">orders</div></div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {donutData.map((d) => (<div key={d.name} className="flex items-center gap-1.5 text-xs text-[#9B9B9B]"><span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[d.name] }} />{d.name} ({d.value})</div>))}
              </div>
            </div>
          ) : <div className="flex items-center justify-center h-[200px] text-[#9B9B9B] text-sm">No order data</div>}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#F5F0EB]">Recent Orders</h2>
          <button onClick={() => router.push("/admin/orders")} className="text-sm text-[#29ABE2] hover:underline">View all →</button>
        </div>
        {recentOrders.length === 0 ? <EmptyState icon={ShoppingBag} title="No orders yet" subtitle="No orders have been placed yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1F1F1F] text-xs text-[#9B9B9B]">
                <th scope="col" className="text-left py-2 pr-4 font-medium">Order ID</th>
                <th scope="col" className="text-left py-2 pr-4 font-medium">Customer</th>
                <th scope="col" className="text-left py-2 pr-4 font-medium">Items</th>
                <th scope="col" className="text-left py-2 pr-4 font-medium">Total</th>
                <th scope="col" className="text-left py-2 pr-4 font-medium">Status</th>
                <th scope="col" className="text-left py-2 pr-4 font-medium">Date</th>
                <th scope="col" className="text-left py-2 font-medium">Action</th>
              </tr></thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <motion.tr key={order.orderId} className="border-b border-[#1F1F1F]/50 hover:bg-[#1A1A1A] transition-colors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#F5F0EB]">{order.orderId}</span>
                        <button onClick={() => { navigator.clipboard.writeText(order.orderId); toast.success("Copied!", { duration: 1500 }); }} className="text-[#9B9B9B] hover:text-[#F5F0EB]" aria-label="Copy"><Copy size={11} /></button>
                      </div>
                    </td>
                    <td className="py-3 pr-4"><div className="font-medium text-[#F5F0EB]">{order.deliveryAddress.name}</div><div className="text-xs text-[#9B9B9B]">{order.userEmail}</div></td>
                    <td className="py-3 pr-4 text-[#9B9B9B]">{order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                    <td className="py-3 pr-4 font-semibold text-[#F5A623]">{formatRevenue(order.total)}</td>
                    <td className="py-3 pr-4"><StatusBadge status={order.status} type="order" /></td>
                    <td className="py-3 pr-4 text-[#9B9B9B]">{formatDate(order.placedAt)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => router.push(`/admin/orders?id=${order.orderId}`)} className="text-[#29ABE2] hover:bg-[#1F1F1F] p-1 rounded" aria-label="View order"><Eye size={16} /></button>
                        <button onClick={async () => {
                          try {
                            await updateOrderStatus(order.orderId, "delivered");
                            const refreshedOrders = await getAllOrders();
                            setOrders(refreshedOrders);
                            toast.success("Order marked as delivered ✓");
                          } catch (error) {
                            console.error("Failed to update order status", error);
                            toast.error("Unable to update the order status.");
                          }
                        }} disabled={order.status === "delivered" || order.status === "cancelled"} className="text-[#22C55E] hover:bg-[#1F1F1F] p-1 rounded disabled:opacity-30" aria-label="Mark delivered"><CheckCircle2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
        {[
          { icon: Plus, title: "Add Product", desc: "Add a new product to the shop", onClick: () => router.push("/admin/products") },
          { icon: Plus, title: "Add Pet", desc: "List a new pet on the website", onClick: () => router.push("/admin/pets") },
          { icon: Download, title: "Export Orders", desc: "Download CSV of all orders", onClick: () => { exportOrdersCSV(orders); toast.success("Orders exported! 📥"); } },
          { icon: Phone, title: "Call a Customer", desc: "Open contacts for follow-up", onClick: () => toast.info("Customer call log coming soon!") },
        ].map(({ icon: Icon, title, desc, onClick }) => (
          <motion.button key={title} onClick={onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 text-left cursor-pointer hover:border-[#F5A623]/40 transition-all duration-200">
            <Icon size={24} className="text-[#F5A623] mb-2" />
            <div className="font-semibold text-sm text-[#F5F0EB]">{title}</div>
            <div className="text-xs text-[#9B9B9B] mt-0.5">{desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
