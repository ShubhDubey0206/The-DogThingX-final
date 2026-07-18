"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

const TABS = ["All", "Dog", "Cat", "Fish", "Bird", "Accessories", "Food"] as const;
type Tab = typeof TABS[number];

export function ProductsSection() {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = PRODUCTS.filter((p) => {
    if (activeTab === "All") return p.isFeatured;
    return p.category === activeTab.toLowerCase() && p.isFeatured;
  }).slice(0, 9);

  const displayProducts = filtered.length > 0
    ? filtered
    : PRODUCTS.filter((p) => activeTab === "All" ? true : p.category === activeTab.toLowerCase()).slice(0, 9);

  return (
    <section id="products" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.15 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-bold">Our Star Products 🐾</h2>
          <Link href="/shop" className="text-[#29ABE2] text-sm hover:underline" data-testid="link-view-all-products">
            View all products →
          </Link>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`button-tab-${tab.toLowerCase()}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#F5A623] text-[#111111]"
                  : "border border-border text-muted-foreground hover:border-[#F5A623] hover:text-[#F5A623]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {displayProducts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No featured products in this category yet.</p>
            <Link href="/shop" className="text-[#29ABE2] hover:underline text-sm mt-2 inline-block">
              Browse all products →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
