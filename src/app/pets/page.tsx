"use client";
import { useState, useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { PETS, Pet } from "@/lib/pets";
import { getAllAdminPets, getDeletedPetIds } from "@/lib/storage";
import { PetCard } from "@/components/pets/PetCard";
import { PetDetailModal } from "@/components/pets/PetDetailModal";
import { EnquireGate } from "@/components/pets/EnquireGate";
import { PetFiltersSidebar } from "@/components/pets/PetFiltersSidebar";
import { Footer } from "@/components/Footer";

interface PetFilters {
  species: string; gender: string; ageGroup: string; status: string; size: string; sortBy: string;
}

const DEFAULT_FILTERS: PetFilters = { species: "all", gender: "all", ageGroup: "all", status: "all", size: "all", sortBy: "featured" };
const SPECIES_TABS = [
  { value: "all", label: "All", emoji: "🐾" },
  { value: "dog", label: "Dogs", emoji: "🐕" },
  { value: "cat", label: "Cats", emoji: "🐈" },
  { value: "bird", label: "Birds", emoji: "🦜" },
  { value: "fish", label: "Fish", emoji: "🐠" },
  { value: "small-pet", label: "Small Pets", emoji: "🐹" },
];

export default function PetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PetFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailPet, setDetailPet] = useState<Pet | null>(null);
  const [enquirePet, setEnquirePet] = useState<Pet | null>(null);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const PAGE_SIZE = 12;

  useEffect(() => {
    Promise.all([getDeletedPetIds(), getAllAdminPets()])
      .then(([deletedIds, adminPets]) => {
        const combined = [...PETS, ...adminPets].reduce((acc, p) => { acc.set(p.id, p); return acc; }, new Map<string, Pet>());
        setAllPets(Array.from(combined.values()).filter((p) => !deletedIds.includes(p.id) && p.status !== "adopted"));
      })
      .catch(() => setAllPets(PETS.filter((p) => p.status !== "adopted")));
  }, []);


  const filtered = useMemo(() => {
    let result = allPets;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || p.species.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filters.species !== "all") result = result.filter((p) => p.species === filters.species);
    if (filters.gender !== "all") result = result.filter((p) => p.gender === filters.gender);
    if (filters.ageGroup !== "all") result = result.filter((p) => p.ageGroup === filters.ageGroup);
    if (filters.status !== "all") result = result.filter((p) => p.status === filters.status);
    if (filters.size !== "all") result = result.filter((p) => p.size === filters.size);
    switch (filters.sortBy) {
      case "fee-asc": return [...result].sort((a, b) => a.adoptionFee - b.adoptionFee);
      case "fee-desc": return [...result].sort((a, b) => b.adoptionFee - a.adoptionFee);
      case "rating": return [...result].sort((a, b) => b.rating - a.rating);
      case "newest": return [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default: return [...result].sort((a, b) => {
        if (a.status === "available" && b.status !== "available") return -1;
        if (b.status === "available" && a.status !== "available") return 1;
        return b.rating - a.rating;
      });
    }
  }, [searchQuery, filters, allPets]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const handleCardClick = (pet: Pet) => setDetailPet(pet);
  const handleEnquire = () => { setEnquirePet(detailPet); setDetailPet(null); setEnquireOpen(true); };
  const handleFilterChange = (f: PetFilters) => { setFilters(f); setPage(1); };

  return (
    <>
      <PetDetailModal pet={detailPet} onClose={() => setDetailPet(null)} onEnquire={handleEnquire} />
      <EnquireGate pet={enquirePet} open={enquireOpen} onClose={() => { setEnquireOpen(false); setEnquirePet(null); }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold">Adopt a Pet</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} pet{filtered.length !== 1 ? "s" : ""} available — find your perfect companion</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-[#F5A623]">
          <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80" alt="Adopt a pet" className="w-full h-48 object-cover opacity-40" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <h2 className="text-2xl font-extrabold text-white mb-1">Give a pet a loving home 🏡</h2>
            <p className="text-white/90 text-sm max-w-md">All our pets are health-checked and ready for adoption. Contact Prasad for home visits.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {SPECIES_TABS.map((tab) => (
            <button key={tab.value} onClick={() => handleFilterChange({ ...filters, species: tab.value })} data-testid={`tab-species-${tab.value}`}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${filters.species === tab.value ? "bg-[#F5A623] text-[#111111]" : "border border-border text-muted-foreground hover:border-[#F5A623] hover:text-[#F5A623]"}`}
            >
              <span>{tab.emoji}</span>{tab.label}
            </button>
          ))}
        </div>
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search pets by name, breed or species..." data-testid="input-search-pets" className="w-full border border-border rounded-full px-5 py-3 pl-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
          {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear"><X size={14} /></button>}
        </div>
        <button onClick={() => setFiltersOpen(true)} data-testid="button-open-pet-filters" className="lg:hidden mb-4 flex items-center gap-2 border border-border rounded-full px-4 py-2 text-sm font-medium hover:bg-card transition-all">
          Filters
          {Object.entries(filters).filter(([k, v]) => v !== DEFAULT_FILTERS[k as keyof PetFilters]).length > 0 && <span className="px-1.5 py-0.5 bg-[#F5A623] text-[#111111] text-xs rounded-full">{Object.entries(filters).filter(([k, v]) => v !== DEFAULT_FILTERS[k as keyof PetFilters]).length}</span>}
        </button>
        {filtersOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            <div className="w-80 bg-background border-l border-border p-6 overflow-y-auto">
              <PetFiltersSidebar filters={filters} onChange={handleFilterChange} onClose={() => setFiltersOpen(false)} />
            </div>
          </div>
        )}
        <div className="flex gap-8">
          <div className="hidden lg:block w-60 shrink-0 sticky top-20 self-start">
            <PetFiltersSidebar filters={filters} onChange={handleFilterChange} />
          </div>
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🐾</div>
                <p className="font-semibold text-lg">No pets match your search</p>
                <p className="text-muted-foreground text-sm mt-1 mb-4">Try adjusting your filters or search terms</p>
                <button onClick={() => { setFilters(DEFAULT_FILTERS); setSearchQuery(""); }} className="bg-[#F5A623] text-[#111111] rounded-full px-6 py-2 text-sm font-bold hover:bg-[#d4891a] transition-all">Reset filters</button>
              </div>
            ) : (
              <>
                <motion.div key={JSON.stringify(filters) + searchQuery} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginated.map((pet) => <PetCard key={pet.id} pet={pet} onClick={handleCardClick} />)}
                </motion.div>
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button onClick={() => setPage((p) => p + 1)} data-testid="button-load-more-pets" className="bg-[#F5A623] text-[#111111] rounded-full px-8 py-3 font-bold text-sm hover:bg-[#d4891a] active:scale-95 transition-all">
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
