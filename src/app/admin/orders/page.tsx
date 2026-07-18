"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Eye, Copy, ArrowLeft, CheckCircle2, User, Phone, MapPin, Calendar, CreditCard, ShoppingBag, Edit, Plus, FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import { getAllOrders, updateOrderStatus, getOrderAdminNote, saveOrderAdminNote } from "@/lib/storage";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Order, OrderStatus } from "@/lib/storage";

function formatPrice(n: number) { return "₹" + n.toLocaleString("en-IN"); }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

const DONUT_COLORS: Record<string, string> = {
  confirmed: "#29ABE2", processing: "#EAB308", "out-for-delivery": "#F5A623", delivered: "#22C55E", cancelled: "#EF4444",
};

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        const all = await getAllOrders();
        if (!active) return;

        setOrders(all);

        const id = searchParams.get("id");
        if (id) {
          const match = all.find((o) => o.orderId === id);
          if (match) {
            const note = await getOrderAdminNote(match.orderId);
            if (!active) return;
            setSelectedOrder(match);
            setAdminNote(note);
          }
        }
      } catch (error) {
        console.error("Failed to load orders", error);
        toast.error("Unable to load orders right now.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [searchParams, tick]);

  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder(order);
    setStatusNote("");

    try {
      const note = await getOrderAdminNote(order.orderId);
      setAdminNote(note);
    } catch (error) {
      console.error("Failed to load admin note", error);
      toast.error("Unable to load the admin note.");
    }

    router.replace(`/admin/orders?id=${order.orderId}`);
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
    router.replace("/admin/orders");
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatus(selectedOrder.orderId, status, statusNote || undefined);
      setStatusNote("");
      const refreshed = await getAllOrders();
      setOrders(refreshed);

      const updated = refreshed.find((o) => o.orderId === selectedOrder.orderId);
      if (updated) {
        setSelectedOrder(updated);
      }

      setTick((t) => t + 1);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error("Failed to update order status", error);
      toast.error("Unable to update the order status.");
    }
  };

  const handleSaveAdminNote = async () => {
    if (!selectedOrder) return;

    try {
      await saveOrderAdminNote(selectedOrder.orderId, adminNote);
      toast.success("Admin note saved");
    } catch (error) {
      console.error("Failed to save admin note", error);
      toast.error("Unable to save the admin note.");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.deliveryAddress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.deliveryAddress.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-[#F5F0EB]">Orders Management</h1>
        <p className="text-sm text-[#9B9B9B] mt-1">Monitor, fulfill and manage store customer purchases.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#1F1F1F] rounded-2xl text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111] border border-[#1F1F1F] rounded-2xl px-3 py-1.5">
            <Filter size={15} className="text-[#9B9B9B]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm text-[#F5F0EB] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111]">All Statuses</option>
              <option value="confirmed" className="bg-[#111]">Confirmed</option>
              <option value="processing" className="bg-[#111]">Processing</option>
              <option value="out-for-delivery" className="bg-[#111]">Out for Delivery</option>
              <option value="delivered" className="bg-[#111]">Delivered</option>
              <option value="cancelled" className="bg-[#111]">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Orders Table */}
        <div className={`bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 ${selectedOrder ? "xl:col-span-2" : "xl:col-span-3"}`}>
          {filteredOrders.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No orders found" subtitle="Try adjusting your search query or status filter." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1F1F1F] text-xs text-[#9B9B9B]">
                    <th scope="col" className="text-left py-3 pr-4 font-semibold uppercase tracking-wider">Order</th>
                    <th scope="col" className="text-left py-3 pr-4 font-semibold uppercase tracking-wider">Customer</th>
                    <th scope="col" className="text-left py-3 pr-4 font-semibold uppercase tracking-wider">Items</th>
                    <th scope="col" className="text-left py-3 pr-4 font-semibold uppercase tracking-wider">Total</th>
                    <th scope="col" className="text-left py-3 pr-4 font-semibold uppercase tracking-wider">Status</th>
                    <th scope="col" className="text-left py-3 pr-4 font-semibold uppercase tracking-wider">Placed Date</th>
                    <th scope="col" className="text-right py-3 font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]/40">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className={`hover:bg-[#1A1A1A]/40 transition-colors group cursor-pointer ${
                        selectedOrder?.orderId === order.orderId ? "bg-[#1C1C1C]" : ""
                      }`}
                      onClick={() => handleSelectOrder(order)}
                    >
                      <td className="py-4 pr-4">
                        <span className="font-bold text-[#F5F0EB] text-sm">{order.orderId}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-[#F5F0EB]">{order.deliveryAddress.name}</div>
                        <div className="text-xs text-[#9B9B9B] mt-0.5">{order.userEmail}</div>
                      </td>
                      <td className="py-4 pr-4 text-[#9B9B9B]">
                        {order.items.reduce((acc, it) => acc + it.quantity, 0)} items
                      </td>
                      <td className="py-4 pr-4 font-bold text-[#F5A623]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={order.status} type="order" />
                      </td>
                      <td className="py-4 pr-4 text-[#9B9B9B] text-xs">
                        {formatDate(order.placedAt).split("at")[0]}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOrder(order);
                          }}
                          className="p-2 text-[#29ABE2] hover:bg-[#29ABE2]/10 rounded-xl transition-all"
                          aria-label="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Order Detail Sidebar Panel */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-6 space-y-6 xl:col-span-1"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-[#F5F0EB] text-lg">{selectedOrder.orderId}</h2>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.orderId);
                        toast.success("Order ID copied to clipboard!");
                      }}
                      className="p-1 hover:bg-[#1C1C1C] rounded text-[#9B9B9B] hover:text-white"
                      aria-label="Copy Order ID"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-[#9B9B9B] mt-0.5">{formatDate(selectedOrder.placedAt)}</p>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 bg-[#1C1C1C] hover:bg-card border border-[#2A2A2A] rounded-xl text-[#9B9B9B] hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Status Section */}
              <div className="space-y-3 bg-[#0F0F0F] border border-[#1F1F1F] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider">Status</span>
                  <StatusBadge status={selectedOrder.status} type="order" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {(["confirmed", "processing", "out-for-delivery", "delivered", "cancelled"] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      disabled={selectedOrder.status === st}
                      className={`text-left text-xs py-2 px-3 rounded-lg border font-semibold capitalize transition-all ${
                        selectedOrder.status === st
                          ? "bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]"
                          : "bg-[#161616] border-[#252525] hover:border-[#333] hover:bg-[#1c1c1c] text-[#9B9B9B]"
                      }`}
                    >
                      {st.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5 pt-2 border-t border-[#222]">
                  <label className="text-xs text-[#9B9B9B]">Status History Note (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched via BlueDart AWB#..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-[#161616] border border-[#252525] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9B9B]">Items List</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-[#0C0C0C] border border-[#1C1C1C] rounded-xl p-3 items-center">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-border/10 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#F5F0EB] truncate">{item.name}</h4>
                        <p className="text-[11px] text-[#9B9B9B] mt-0.5 capitalize">{item.category} · {formatPrice(item.price)} × {item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-white shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#1F1F1F] pt-3 text-xs space-y-1">
                  <div className="flex justify-between text-[#9B9B9B]"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between text-[#9B9B9B]"><span>GST (18%)</span><span>{formatPrice(selectedOrder.gst)}</span></div>
                  <div className="flex justify-between font-bold text-[#F5F0EB] text-sm pt-1 border-t border-[#222]"><span>Grand Total</span><span className="text-[#F5A623]">{formatPrice(selectedOrder.total)}</span></div>
                </div>
              </div>

              {/* Customer Info Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9B9B]">Shipping & Customer</h3>
                <div className="bg-[#0C0C0C] border border-[#1C1C1C] rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-[#9B9B9B]" />
                    <span className="font-semibold text-white">{selectedOrder.deliveryAddress.name}</span>
                    <span className="text-[10px] text-[#9B9B9B] truncate">({selectedOrder.userEmail})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#9B9B9B]" />
                    <span className="text-[#F5F0EB]">{selectedOrder.deliveryAddress.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-[#1A1A1A]">
                    <MapPin size={13} className="text-[#9B9B9B] mt-0.5 shrink-0" />
                    <span className="text-[#9B9B9B] leading-relaxed">
                      {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#1A1A1A] text-[11px] text-[#9B9B9B]">
                    <CreditCard size={12} />
                    <span>Payment: <strong className="text-white uppercase">{selectedOrder.paymentMethod}</strong></span>
                  </div>
                </div>
              </div>

              {/* Admin Note Section */}
              <div className="space-y-2 pt-2 border-t border-[#1F1F1F]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9B9B]">Internal Admin Notes</h3>
                <textarea
                  placeholder="Type any private admin notes here (e.g., customer called, packaging instructions)..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl p-3 text-xs text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] h-20 resize-none transition-colors"
                />
                <button
                  onClick={handleSaveAdminNote}
                  className="w-full py-2 bg-[#F5A623]/10 hover:bg-[#F5A623]/25 text-[#F5A623] border border-[#F5A623]/30 rounded-xl text-xs font-bold transition-all"
                >
                  Save Note
                </button>
              </div>

              {/* Status History Logs */}
              <div className="space-y-3 pt-2 border-t border-[#1F1F1F]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9B9B9B]">Status History</h3>
                <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#222]">
                  {selectedOrder.statusHistory.map((hist, index) => (
                    <div key={index} className="flex items-start gap-3 relative pl-6 text-xs">
                      <div className="absolute left-[3px] top-[3px] w-[10px] h-[10px] rounded-full border border-black" style={{ backgroundColor: DONUT_COLORS[hist.status] || "#999" }} />
                      <div className="min-w-0">
                        <div className="font-semibold text-white capitalize">{hist.status.replace(/-/g, " ")}</div>
                        <div className="text-[10px] text-[#9B9B9B] mt-0.5">{formatDate(hist.timestamp)}</div>
                        {hist.note && <div className="text-[11px] text-[#9B9B9B] italic mt-1 bg-[#1A1A1A] px-2 py-1 rounded border border-[#222]">{hist.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 bg-[#111111] border border-[#1F1F1F] rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#9B9B9B] text-sm">Loading orders...</p>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
