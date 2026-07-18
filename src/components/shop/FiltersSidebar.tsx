"use client";
import { X, SlidersHorizontal } from "lucide-react";

interface Filters {
  category: string;
  petType: string;
  priceRange: [number, number];
  inStock: boolean;
  sortBy: string;
}

interface FiltersSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose?: () => void;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "fish", label: "Fish" },
  { value: "bird", label: "Bird" },
  { value: "accessories", label: "Accessories" },
  { value: "food", label: "Food" },
];

const PET_TYPES = [
  { value: "all", label: "All" },
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "fish", label: "Fish" },
  { value: "bird", label: "Bird" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
  { value: "newest", label: "Newest" },
];

const MAX_PRICE = 12000;

export function FiltersSidebar({ filters, onChange, onClose }: FiltersSidebarProps) {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const activeCount = [
    filters.category !== "all",
    filters.petType !== "all",
    filters.inStock,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== MAX_PRICE,
    filters.sortBy !== "featured",
  ].filter(Boolean).length;

  const resetAll = () =>
    onChange({ category: "all", petType: "all", priceRange: [0, MAX_PRICE], inStock: false, sortBy: "featured" });

  return (
    <aside className="w-full space-y-6" data-testid="filters-sidebar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#F5A623]" />
          <h3 className="font-bold text-sm">
            Filters {activeCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#F5A623] text-[#111111] text-xs rounded-full">{activeCount}</span>}
          </h3>
        </div>
        <div className="flex gap-2">
          {activeCount > 0 && (
            <button onClick={resetAll} data-testid="button-reset-filters" className="text-xs text-[#F5A623] hover:underline">
              Reset all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} aria-label="Close filters" className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Sort by</h4>
        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
          data-testid="select-sort"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Category</h4>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => update({ category: cat.value })}
              data-testid={`filter-category-${cat.value}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                filters.category === cat.value
                  ? "bg-[#F5A623] text-[#111111]"
                  : "border border-border text-muted-foreground hover:border-[#F5A623] hover:text-[#F5A623]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pet Type */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Pet Type</h4>
        <div className="flex flex-wrap gap-1.5">
          {PET_TYPES.map((pt) => (
            <button
              key={pt.value}
              onClick={() => update({ petType: pt.value })}
              data-testid={`filter-pettype-${pt.value}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                filters.petType === pt.value
                  ? "bg-[#29ABE2] text-white"
                  : "border border-border text-muted-foreground hover:border-[#29ABE2] hover:text-[#29ABE2]"
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range — simple dual input */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Price Range: ₹{filters.priceRange[0].toLocaleString("en-IN")} – ₹{filters.priceRange[1].toLocaleString("en-IN")}
        </h4>
        <div className="flex gap-2">
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={100}
            value={filters.priceRange[0]}
            onChange={(e) => update({ priceRange: [Number(e.target.value), filters.priceRange[1]] })}
            className="w-full accent-[#F5A623]"
          />
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={100}
            value={filters.priceRange[1]}
            onChange={(e) => update({ priceRange: [filters.priceRange[0], Number(e.target.value)] })}
            className="w-full accent-[#F5A623]"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₹0</span>
          <span>₹{MAX_PRICE.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="in-stock"
          checked={filters.inStock}
          onChange={(e) => update({ inStock: e.target.checked })}
          data-testid="checkbox-in-stock"
          className="rounded"
        />
        <label htmlFor="in-stock" className="text-sm font-medium cursor-pointer">In Stock Only</label>
      </div>
    </aside>
  );
}
