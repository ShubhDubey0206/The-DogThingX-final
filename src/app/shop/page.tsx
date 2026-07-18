"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { FiltersSidebar } from "@/components/shop/FiltersSidebar";
import { ProductQuickViewModal } from "@/components/shop/ProductQuickViewModal";
import { OffersRail } from "@/components/shop/OffersRail";
import { Footer } from "@/components/Footer";

interface Filters {
  category: string;
  petType: string;
  priceRange: [number, number];
  inStock: boolean;
  sortBy: string;
}

const MAX_PRICE = 12000;
const DEFAULT_FILTERS: Filters = {
  category: "all",
  petType: "all",
  priceRange: [0, MAX_PRICE],
  inStock: false,
  sortBy: "featured",
};

function ShopContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    category: searchParams.get("category") || "all",
  }));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setFilters((f) => ({ ...f, category: cat }));
  }, [searchParams]);

  const mergedProducts = useMemo(() => {
    try {
      const deletedRaw = localStorage.getItem("dtx_deleted_products");
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      const adminRaw = localStorage.getItem("dtx_admin_products");
      const adminProds: Product[] = adminRaw ? JSON.parse(adminRaw) : [];
      const combined = [...PRODUCTS, ...adminProds].reduce((acc, p) => { acc.set(p.id, p); return acc; }, new Map<string, Product>());
      return Array.from(combined.values()).filter(p => !deletedIds.includes(p.id));
    } catch {
      return PRODUCTS;
    }
  }, []);

  const filtered = useMemo(() => {
    let result = mergedProducts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (filters.category !== "all") result = result.filter((p) => p.category === filters.category);
    if (filters.petType !== "all") result = result.filter((p) => p.petType === filters.petType || p.petType === "all");
    if (filters.inStock) result = result.filter((p) => p.inStock);
    result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    switch (filters.sortBy) {
      case "price-asc": return [...result].sort((a, b) => a.price - b.price);
      case "price-desc": return [...result].sort((a, b) => b.price - a.price);
      case "rating": return [...result].sort((a, b) => b.rating - a.rating);
      case "newest": return [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default: return [...result].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  }, [searchQuery, filters, mergedProducts]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;
  const activeFilterCount = [
    filters.category !== "all", filters.petType !== "all", filters.inStock,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== MAX_PRICE, filters.sortBy !== "featured",
  ].filter(Boolean).length;

  return (
    <>
      <ProductQuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold">Shop</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <OffersRail />
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search products..."
            data-testid="input-search-products"
            className="w-full border border-border rounded-full px-5 py-3 pl-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-shadow"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setFiltersOpen(true)}
          data-testid="button-open-filters"
          className="lg:hidden mb-4 flex items-center gap-2 border border-border rounded-full px-4 py-2 text-sm font-medium hover:bg-card transition-all"
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && <span className="px-1.5 py-0.5 bg-[#F5A623] text-[#111111] text-xs rounded-full">{activeFilterCount}</span>}
        </button>
        {filtersOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            <div className="w-80 bg-background border-l border-border p-6 overflow-y-auto">
              <FiltersSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} onClose={() => setFiltersOpen(false)} />
            </div>
          </div>
        )}
        <div className="flex gap-8">
          <div className="hidden lg:block w-60 shrink-0 sticky top-20 self-start">
            <FiltersSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
          </div>
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🐾</div>
                <p className="font-semibold text-lg">No products match your filters</p>
                <p className="text-muted-foreground text-sm mt-1 mb-4">Try adjusting your search or filters</p>
                <button onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(""); }} className="bg-[#F5A623] text-[#111111] rounded-full px-6 py-2 text-sm font-bold hover:bg-[#d4891a] transition-all">
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  key={`${filters.category}-${filters.sortBy}-${filters.petType}-${searchQuery}`}
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {paginated.map((product) => (
                    <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} showQuickView />
                  ))}
                </motion.div>
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button onClick={() => setPage((p) => p + 1)} data-testid="button-load-more" className="bg-[#F5A623] text-[#111111] rounded-full px-8 py-3 font-bold text-sm hover:bg-[#d4891a] active:scale-95 transition-all">
                      Load more ({filtered.length - paginated.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96 text-muted-foreground">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
