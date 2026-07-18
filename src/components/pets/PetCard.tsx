"use client";
import { Star, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Pet } from "@/lib/pets";

interface PetCardProps {
  pet: Pet;
  onClick: (pet: Pet) => void;
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  bird: "🦜",
  fish: "🐠",
  "small-pet": "🐹",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-green-500 text-white" },
  reserved: { label: "Reserved", className: "bg-yellow-500 text-[#111111]" },
  adopted: { label: "Adopted", className: "bg-gray-500 text-white" },
};

export function PetCard({ pet, onClick }: PetCardProps) {
  const statusInfo = STATUS_LABELS[pet.status];
  return (
    <motion.div
      data-testid={`card-pet-${pet.id}`}
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
      onClick={() => onClick(pet)}
      className="rounded-2xl bg-card border border-card-border overflow-hidden cursor-pointer group hover:border-[#F5A623]/40 transition-colors flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pet.image}
          alt={pet.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${pet.status !== "available" ? "opacity-60 grayscale" : ""}`}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {pet.isNew && <span className="bg-[#F5A623] text-[#111111] text-xs font-bold px-2 py-0.5 rounded-full">New</span>}
          <span className={`${statusInfo.className} text-xs font-bold px-2 py-0.5 rounded-full`}>{statusInfo.label}</span>
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-base">
          {SPECIES_EMOJI[pet.species] || "🐾"}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#F5A623] text-[#111111] text-xs font-semibold capitalize">
          {pet.species === "small-pet" ? "Small Pet" : pet.species}
        </span>
        <h3 className="text-lg font-bold">{pet.name}</h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={13}
              fill={i <= Math.round(pet.rating) ? "#F5C518" : "none"}
              stroke={i <= Math.round(pet.rating) ? "#F5C518" : "currentColor"}
              className="text-muted-foreground"
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({pet.reviewCount})</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{pet.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{pet.breed}</span>
          <span>·</span><span>{pet.age}</span>
          <span>·</span><span className="capitalize">{pet.gender}</span>
          {pet.size !== "n/a" && <><span>·</span><span className="capitalize">{pet.size}</span></>}
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 text-xs ${pet.vaccinated ? "text-green-500" : "text-muted-foreground"}`}>
            {pet.vaccinated ? <CheckCircle size={12} /> : <XCircle size={12} />} Vaccinated
          </span>
          {pet.neutered !== undefined && (
            <span className={`flex items-center gap-1 text-xs ${pet.neutered ? "text-green-500" : "text-muted-foreground"}`}>
              {pet.neutered ? <CheckCircle size={12} /> : <XCircle size={12} />} Neutered
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-xl font-bold text-[#F5A623]">
              {pet.adoptionFee === 0 ? "Free" : `₹${pet.adoptionFee.toLocaleString("en-IN")}`}
            </span>
            <span className="text-xs text-muted-foreground ml-1">adoption fee</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(pet); }}
            disabled={pet.status !== "available"}
            data-testid={`button-enquire-${pet.id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold min-w-[90px] text-center transition-all active:scale-95 ${
              pet.status !== "available"
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-[#F5A623] text-[#111111] hover:bg-[#d4891a]"
            }`}
          >
            {pet.status === "available" ? "Enquire" : pet.status === "reserved" ? "Reserved" : "Adopted"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
