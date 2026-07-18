"use client";
import { useState, useEffect, useMemo } from "react";
import { Users, Search, ShoppingBag, DollarSign, Calendar, Mail, Phone, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { getAllOrders } from "@/lib/storage";

function formatPrice(n: number) { return "₹" + n.toLocaleString("en-IN"); }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

interface Customer {
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  isRegistered: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      // 1. Load orders
      let orders: import("@/lib/storage").Order[] = [];
      try { orders = await getAllOrders(); } catch { orders = []; }

      // 2. Load registered users (still from Supabase Auth — using localStorage as fallback)
      let registeredUsers: { email: string; name: string }[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("dtx_users");
          registeredUsers = raw ? JSON.parse(raw) : [];
        } catch {
          registeredUsers = [];
        }
      }

      const customerMap = new Map<string, Customer>();

      // Process orders first
      orders.forEach((o) => {
        const email = o.userEmail.toLowerCase();
        const existing = customerMap.get(email);
        const isCancelled = o.status === "cancelled";
        const spend = isCancelled ? 0 : o.total;

        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += spend;
          if (!existing.lastOrderDate || new Date(o.placedAt) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = o.placedAt;
            existing.name = o.deliveryAddress.name || existing.name;
            existing.phone = o.deliveryAddress.phone || existing.phone;
          }
        } else {
          customerMap.set(email, {
            email: o.userEmail,
            name: o.deliveryAddress.name || o.userEmail.split("@")[0],
            phone: o.deliveryAddress.phone || "",
            totalOrders: 1,
            totalSpent: spend,
            lastOrderDate: o.placedAt,
            isRegistered: false,
          });
        }
      });

      // Add registered users who haven't ordered yet, and mark registered status
      registeredUsers.forEach((u) => {
        const email = u.email.toLowerCase();
        const existing = customerMap.get(email);
        if (existing) {
          existing.isRegistered = true;
          if (!existing.name) existing.name = u.name;
        } else {
          customerMap.set(email, {
            email: u.email,
            name: u.name,
            phone: "",
            totalOrders: 0,
            totalSpent: 0,
            isRegistered: true,
          });
        }
      });

      setCustomers(Array.from(customerMap.values()));
    }
    loadCustomers();
  }, []);


  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const search = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.includes(search)
      );
    });
  }, [customers, searchTerm]);

  // Summaries
  const totalSpend = useMemo(() => customers.reduce((sum, c) => sum + c.totalSpent, 0), [customers]);
  const loyalCustomersCount = useMemo(() => customers.filter((c) => c.totalSpent > 8000).length, [customers]);
  const activeCustomersCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return customers.filter((c) => c.lastOrderDate && new Date(c.lastOrderDate) >= thirtyDaysAgo).length;
  }, [customers]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-[#F5F0EB]">Customers Directory</h1>
        <p className="text-sm text-[#9B9B9B] mt-1">Track store customer purchase metrics and account statuses.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9B9B9B] uppercase tracking-wider font-semibold">
            <span>Total Customers</span>
            <Users size={16} className="text-[#F5A623]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F0EB]">{customers.length}</div>
          <p className="text-xs text-[#9B9B9B]">{customers.filter(c => c.isRegistered).length} registered accounts</p>
        </div>

        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9B9B9B] uppercase tracking-wider font-semibold">
            <span>Total Spend Pool</span>
            <DollarSign size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-[#F5F0EB]">{formatPrice(totalSpend)}</div>
          <p className="text-xs text-[#9B9B9B]">Average spend: {customers.length > 0 ? formatPrice(Math.round(totalSpend / customers.length)) : "₹0"}</p>
        </div>

        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9B9B9B] uppercase tracking-wider font-semibold">
            <span>Loyal Customers</span>
            <ShoppingBag size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-[#F5F0EB]">{loyalCustomersCount}</div>
          <p className="text-xs text-[#9B9B9B]">Spent more than ₹8,000</p>
        </div>

        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9B9B9B] uppercase tracking-wider font-semibold">
            <span>Active Customers</span>
            <Calendar size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[#F5F0EB]">{activeCustomersCount}</div>
          <p className="text-xs text-[#9B9B9B]">Placed an order in the last 30 days</p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
        <input
          type="text"
          placeholder="Search by Customer Name, Email, Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#1F1F1F] rounded-2xl text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-semibold text-lg text-[#F5F0EB]">No customers found</h3>
            <p className="text-sm text-[#9B9B9B] mt-1 font-medium">Try broadening your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-xs text-[#9B9B9B] text-left">
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Customer Name</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Email Address</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Phone Number</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Total Orders</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Total Spend</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Last Order Date</th>
                  <th scope="col" className="py-3 text-right font-semibold uppercase tracking-wider">Account type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]/40">
                {filteredCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-[#1A1A1A]/40 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-[#F5F0EB] text-sm">{c.name}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-1.5 text-[#9B9B9B]">
                        <Mail size={12} />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[#9B9B9B]">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not provided</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 font-semibold text-white">
                      {c.totalOrders} order{c.totalOrders !== 1 ? "s" : ""}
                    </td>
                    <td className="py-4 pr-4 font-bold text-[#F5A623]">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="py-4 pr-4 text-[#9B9B9B] text-xs">
                      {c.lastOrderDate ? formatDate(c.lastOrderDate) : <span className="text-xs text-muted-foreground italic">Never ordered</span>}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        c.isRegistered
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-[#9B9B9B]/10 text-[#9B9B9B] border-[#9B9B9B]/20"
                      }`}>
                        {c.isRegistered ? "Registered" : "Guest"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
