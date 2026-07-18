"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, AlertTriangle, Plus, Minus, Archive, RefreshCw, CheckCircle2, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PRODUCTS, Product } from "@/lib/products";
import { getAdminProducts, getDeletedProductIds, getStockQty, setStockQty, getStockLastUpdated } from "@/lib/storage";

function formatDate(iso: string | null) {
  if (!iso) return "Never updated";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface InventoryItem extends Product {
  quantity: number;
  lastUpdated: string | null;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    async function loadInventory() {
      try {
        const deletedIds = getDeletedProductIds();
        const adminProds = await getAdminProducts();
        const combined = [...PRODUCTS, ...adminProds].reduce((acc, p) => {
          acc.set(p.id, p);
          return acc;
        }, new Map<string, Product>());

        const list = Array.from(combined.values())
          .filter((p) => !deletedIds.includes(p.id))
          .map((p) => ({
            ...p,
            quantity: getStockQty(p.id),
            lastUpdated: getStockLastUpdated(p.id),
          }));

        setItems(list);
      } catch {
        setItems(PRODUCTS.map(p => ({ ...p, quantity: 10, lastUpdated: null })));
      }
    }
    loadInventory();
  }, [tick]);


  const handleUpdateQty = (productId: string, newQty: number) => {
    if (newQty < 0) return;
    setStockQty(productId, newQty);
    setTick((t) => t + 1);
  };

  const handleInputChange = (productId: string, val: string) => {
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setStockQty(productId, parsed);
      setTick((t) => t + 1);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (stockFilter === "out") return matchesSearch && item.quantity === 0;
      if (stockFilter === "low") return matchesSearch && item.quantity > 0 && item.quantity <= 5;
      if (stockFilter === "normal") return matchesSearch && item.quantity > 5;
      return matchesSearch;
    });
  }, [items, searchTerm, stockFilter]);

  // Summaries
  const summary = useMemo(() => {
    let outOfStock = 0;
    let lowStock = 0;
    items.forEach((item) => {
      if (item.quantity === 0) outOfStock++;
      else if (item.quantity <= 5) lowStock++;
    });
    return { total: items.length, outOfStock, lowStock };
  }, [items]);

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-[#F5F0EB]">Inventory Control</h1>
        <p className="text-sm text-[#9B9B9B] mt-1">Manage stock counts, check alerts, and update product quantities.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9B9B9B] uppercase tracking-wider font-semibold">
            <span>Total Catalog Items</span>
            <Archive size={16} className="text-[#F5A623]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F0EB]">{summary.total}</div>
          <p className="text-xs text-[#9B9B9B]">Products listed in store</p>
        </div>

        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9B9B9B] uppercase tracking-wider font-semibold">
            <span>Low Stock Warnings</span>
            <AlertTriangle size={16} className="text-[#EAB308]" />
          </div>
          <div className="text-2xl font-bold text-[#EAB308]">{summary.lowStock}</div>
          <p className="text-xs text-[#9B9B9B]">Quantity is 5 units or less</p>
        </div>

        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9B9B9B] uppercase tracking-wider font-semibold">
            <span>Out of Stock</span>
            <TrendingDown size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-500">{summary.outOfStock}</div>
          <p className="text-xs text-[#9B9B9B]">Quantity is exactly 0 units</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            type="text"
            placeholder="Search by Product Name, Category or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#1F1F1F] rounded-2xl text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111] border border-[#1F1F1F] rounded-2xl px-3 py-1.5">
            <Archive size={14} className="text-[#9B9B9B]" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-transparent text-sm text-[#F5F0EB] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111]">All Products</option>
              <option value="normal" className="bg-[#111]">Adequate Stock (&gt; 5)</option>
              <option value="low" className="bg-[#111]">Low Stock (1–5)</option>
              <option value="out" className="bg-[#111]">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Grid Table */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">📦</div>
            <h3 className="font-semibold text-lg text-[#F5F0EB]">No items found</h3>
            <p className="text-sm text-[#9B9B9B] mt-1 font-medium">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-xs text-[#9B9B9B] text-left">
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Product ID & Info</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Category</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Alert Status</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider text-center">Manage Stock Count</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Last Stock Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]/40">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1A1A1A]/40 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl border border-border/10 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&q=80";
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[#F5F0EB] text-sm truncate max-w-xs">{item.name}</h4>
                          <span className="text-[10px] bg-[#1F1F1F] text-[#9B9B9B] px-1.5 py-0.5 rounded font-mono mt-1 inline-block">{item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 capitalize text-[#9B9B9B]">{item.category}</td>
                    <td className="py-4 pr-4">
                      {item.quantity === 0 ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 w-fit">
                          <AlertTriangle size={10} /> Out of Stock
                        </span>
                      ) : item.quantity <= 5 ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20 flex items-center gap-1 w-fit">
                          <AlertTriangle size={10} /> Low Stock
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={10} /> Adequate
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                          disabled={item.quantity === 0}
                          className="w-8 h-8 rounded-lg bg-[#1C1C1C] hover:bg-card border border-[#252525] flex items-center justify-center hover:text-white transition-colors disabled:opacity-20"
                          aria-label="Decrement"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(e) => handleInputChange(item.id, e.target.value)}
                          className="w-16 bg-[#0E0E0E] border border-[#252525] rounded-lg px-2 py-1 text-center font-bold text-[#F5F0EB] text-sm focus:outline-none focus:border-[#F5A623] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-[#1C1C1C] hover:bg-card border border-[#252525] flex items-center justify-center hover:text-white transition-colors"
                          aria-label="Increment"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-[#9B9B9B] text-xs">
                      {formatDate(item.lastUpdated)}
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
