"use client";
import { Star, CheckCircle, XCircle, Phone, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Pet } from "@/lib/pets";

interface PetDetailModalProps {
  pet: Pet | null;
  onClose: () => void;
  onEnquire: () => void;
}

const SPECIES_EMOJI: Record<string, string> = { dog: "🐕", cat: "🐈", bird: "🦜", fish: "🐠", "small-pet": "🐹" };

export function PetDetailModal({ pet, onClose, onEnquire }: PetDetailModalProps) {
  if (!pet) return null;
  const waMsg = encodeURIComponent(`Hi! I'm interested in adopting ${pet.name} (${pet.breed}) from The Dog Thingx. Could you share more details?`);

  return (
    <Dialog open={!!pet} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <span className="sr-only"><DialogTitle>{pet.name} – Pet Details</DialogTitle></span>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative">
            <img src={pet.image} alt={pet.name} className={`w-full h-72 sm:h-full object-cover ${pet.status !== "available" ? "opacity-60 grayscale" : ""}`} />
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {pet.isNew && <span className="bg-[#F5A623] text-[#111111] text-xs font-bold px-2 py-0.5 rounded-full">New</span>}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pet.status === "available" ? "bg-green-500 text-white" : pet.status === "reserved" ? "bg-yellow-500 text-[#111111]" : "bg-gray-500 text-white"}`}>
                {pet.status === "available" ? "Available" : pet.status === "reserved" ? "Reserved" : "Adopted"}
              </span>
            </div>
            <div className="absolute top-3 right-3 text-2xl">{SPECIES_EMOJI[pet.species] || "🐾"}</div>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <span className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#F5A623]/20 text-[#F5A623] text-xs font-semibold capitalize">
              {pet.species === "small-pet" ? "Small Pet" : pet.species}
            </span>
            <h2 className="text-xl font-bold">{pet.name}</h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (<Star key={i} size={14} fill={i <= Math.round(pet.rating) ? "#F5C518" : "none"} stroke={i <= Math.round(pet.rating) ? "#F5C518" : "currentColor"} className="text-muted-foreground" />))}
              <span className="text-xs text-muted-foreground ml-1">{pet.rating} ({pet.reviewCount} reviews)</span>
            </div>
            <p className="text-sm text-muted-foreground">{pet.description}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {[
                { label: "Breed", value: pet.breed },
                { label: "Age", value: pet.age },
                { label: "Gender", value: pet.gender },
                { label: "Size", value: pet.size === "n/a" ? "N/A" : pet.size },
                ...(pet.weight ? [{ label: "Weight", value: pet.weight }] : []),
                { label: "Colour", value: pet.color },
              ].map((row) => (
                <div key={row.label}>
                  <span className="text-muted-foreground text-xs">{row.label}</span>
                  <p className="font-medium capitalize">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1 text-xs ${pet.vaccinated ? "text-green-500" : "text-red-500"}`}>
                {pet.vaccinated ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {pet.vaccinated ? "Vaccinated" : "Not vaccinated"}
              </span>
              {pet.neutered !== undefined && (
                <span className={`flex items-center gap-1 text-xs ${pet.neutered ? "text-green-500" : "text-muted-foreground"}`}>
                  {pet.neutered ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {pet.neutered ? "Neutered" : "Not neutered"}
                </span>
              )}
            </div>
            {pet.traits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pet.traits.map((t) => (<span key={t} className="px-2.5 py-1 rounded-full border border-border text-xs font-medium">{t}</span>))}
              </div>
            )}
            <div className="text-2xl font-bold text-[#F5A623]">
              {pet.adoptionFee === 0 ? "Free Adoption" : `₹${pet.adoptionFee.toLocaleString("en-IN")}`}
              {pet.adoptionFee > 0 && <span className="text-sm font-normal text-muted-foreground ml-1">adoption fee</span>}
            </div>
            {pet.status === "available" ? (
              <div className="flex flex-col gap-2 mt-auto">
                <button onClick={onEnquire} data-testid={`button-modal-enquire-${pet.id}`} className="w-full bg-[#F5A623] text-[#111111] rounded-full py-2.5 font-bold text-sm hover:bg-[#d4891a] active:scale-95 transition-all">
                  Enquire Now
                </button>
                <div className="flex gap-2">
                  <a href={`https://wa.me/919960878712?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full py-2 text-sm font-bold hover:bg-[#20bd59] transition-all">
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                  <a href="tel:9960878712" className="flex-1 flex items-center justify-center gap-2 border border-border rounded-full py-2 text-sm font-bold hover:bg-card transition-all">
                    <Phone size={14} /> Call
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-auto bg-muted rounded-xl p-3 text-center text-sm text-muted-foreground">
                This pet is currently {pet.status}. Check back later or browse other pets!
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
