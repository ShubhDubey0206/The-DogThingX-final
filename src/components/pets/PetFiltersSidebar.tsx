"use client";
import { X, SlidersHorizontal } from "lucide-react";

interface PetFilters {
  species: string;
  gender: string;
  ageGroup: string;
  status: string;
  size: string;
  sortBy: string;
}

interface PetFiltersSidebarProps {
  filters: PetFilters;
  onChange: (filters: PetFilters) => void;
  onClose?: () => void;
}

const SPECIES = [
  { value: "all", label: "All" },
  { value: "dog", label: "Dog 🐕" },
  { value: "cat", label: "Cat 🐈" },
  { value: "bird", label: "Bird 🦜" },
  { value: "fish", label: "Fish 🐠" },
  { value: "small-pet", label: "Small Pet 🐹" },
];
const GENDERS = [{ value: "all", label: "Any" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }];
const AGE_GROUPS = [
  { value: "all", label: "Any" }, { value: "baby", label: "Baby" }, { value: "young", label: "Young" },
  { value: "adult", label: "Adult" }, { value: "senior", label: "Senior" },
];
const STATUSES = [{ value: "all", label: "All" }, { value: "available", label: "Available" }, { value: "reserved", label: "Reserved" }];
const SIZES = [{ value: "all", label: "Any" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" }, { value: "fee-asc", label: "Fee: Low to High" },
  { value: "fee-desc", label: "Fee: High to Low" }, { value: "rating", label: "Best Rated" }, { value: "newest", label: "Newest" },
];
const DEFAULT: PetFilters = { species: "all", gender: "all", ageGroup: "all", status: "all", size: "all", sortBy: "featured" };

function FilterPills({ options, selected, onSelect, color }: { options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void; color?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onSelect(opt.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            selected === opt.value
              ? color === "blue" ? "bg-[#29ABE2] text-white" : "bg-[#F5A623] text-[#111111]"
              : "border border-border text-muted-foreground hover:border-[#F5A623] hover:text-[#F5A623]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function PetFiltersSidebar({ filters, onChange, onClose }: PetFiltersSidebarProps) {
  const update = (partial: Partial<PetFilters>) => onChange({ ...filters, ...partial });
  const activeCount = Object.entries(filters).filter(([k, v]) => v !== DEFAULT[k as keyof PetFilters]).length;
  const resetAll = () => onChange({ ...DEFAULT });

  return (
    <aside className="w-full space-y-6" data-testid="pet-filters-sidebar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#F5A623]" />
          <h3 className="font-bold text-sm">
            Filters {activeCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#F5A623] text-[#111111] text-xs rounded-full">{activeCount}</span>}
          </h3>
        </div>
        <div className="flex gap-2">
          {activeCount > 0 && <button onClick={resetAll} data-testid="button-reset-pet-filters" className="text-xs text-[#F5A623] hover:underline">Reset all</button>}
          {onClose && <button onClick={onClose} aria-label="Close filters" className="text-muted-foreground hover:text-foreground"><X size={16} /></button>}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Sort by</h4>
        <select value={filters.sortBy} onChange={(e) => update({ sortBy: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Species</h4><FilterPills options={SPECIES} selected={filters.species} onSelect={(v) => update({ species: v })} /></div>
      <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Status</h4><FilterPills options={STATUSES} selected={filters.status} onSelect={(v) => update({ status: v })} color="blue" /></div>
      <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Gender</h4><FilterPills options={GENDERS} selected={filters.gender} onSelect={(v) => update({ gender: v })} /></div>
      <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Age Group</h4><FilterPills options={AGE_GROUPS} selected={filters.ageGroup} onSelect={(v) => update({ ageGroup: v })} /></div>
      <div><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Size</h4><FilterPills options={SIZES} selected={filters.size} onSelect={(v) => update({ size: v })} /></div>
    </aside>
  );
}
