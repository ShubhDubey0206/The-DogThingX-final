"use client";
import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Search, X, Check, Filter, Heart, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PETS, Pet } from "@/lib/pets";
import { saveAdminPet, deleteAdminPet, getDeletedPetIds, getAllAdminPets } from "@/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase"; // Import configured Supabase client

function formatPrice(n: number) { return n === 0 ? "Free" : "₹" + n.toLocaleString("en-IN"); }

const SPECIES = ["dog", "cat", "bird", "fish", "small-pet"];
const AGE_GROUPS = ["baby", "young", "adult", "senior"];
const SIZES = ["small", "medium", "large", "n/a"];
const STATUSES = ["available", "reserved", "adopted"];

export default function AdminPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Pet["species"]>("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [ageGroup, setAgeGroup] = useState<Pet["ageGroup"]>("young");
  const [gender, setGender] = useState<Pet["gender"]>("male");
  const [size, setSize] = useState<Pet["size"]>("medium");
  const [weight, setWeight] = useState("");
  const [color, setColor] = useState("");
  const [vaccinated, setVaccinated] = useState(true);
  const [neutered, setNeutered] = useState(false);
  const [status, setStatus] = useState<Pet["status"]>("available");
  const [adoptionFee, setAdoptionFee] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [traitsString, setTraitsString] = useState("");

  // File Upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPets = async () => {
      try {
        setLoading(true);
        const deletedIds = await getDeletedPetIds();
        const adminPets = await getAllAdminPets();
        if (!active) return;

        const combined = [...PETS, ...adminPets].reduce((acc, p) => {
          acc.set(p.id, p);
          return acc;
        }, new Map<string, Pet>());

        const list = Array.from(combined.values()).filter((p) => !deletedIds.includes(p.id));
        setPets(list);
      } catch (error) {
        console.error("Failed to load pets", error);
        toast.error("Unable to load pets right now.");
        if (active) setPets(PETS);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPets();
    return () => {
      active = false;
    };
  }, [tick]);

  const resetForm = () => {
    setName("");
    setSpecies("dog");
    setBreed("");
    setAge("");
    setAgeGroup("young");
    setGender("male");
    setSize("medium");
    setWeight("");
    setColor("");
    setVaccinated(true);
    setNeutered(false);
    setStatus("available");
    setAdoptionFee("");
    setDescription("");
    setImage("");
    setTraitsString("");
    setEditingPet(null);

    // Clear asset states
    setImageFile(null);
    setImagePreview("");
    setUploadMode("upload");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pet: Pet) => {
    setEditingPet(pet);
    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed);
    setAge(pet.age);
    setAgeGroup(pet.ageGroup);
    setGender(pet.gender);
    setSize(pet.size);
    setWeight(pet.weight || "");
    setColor(pet.color);
    setVaccinated(pet.vaccinated);
    setNeutered(!!pet.neutered);
    setStatus(pet.status);
    setAdoptionFee(String(pet.adoptionFee));
    setDescription(pet.description);
    setImage(pet.image);
    setTraitsString(pet.traits.join(", "));

    // Configure editing defaults
    setImageFile(null);
    setImagePreview(pet.image);
    setUploadMode("url"); // Default to showing URL field for edit reference
    setIsModalOpen(true);
  };

  // Direct Supabase storage interaction logic
  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !breed || !age || !color || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const feeNum = adoptionFee ? parseFloat(adoptionFee) : 0;
    if (isNaN(feeNum) || feeNum < 0) {
      toast.error("Please enter a valid adoption fee.");
      return;
    }

    const traits = traitsString
      ? traitsString.split(",").map((t) => t.trim()).filter(Boolean)
      : ["Friendly", "Playful"];

    try {
      setIsUploading(true);
      let finalImageUrl = image;

      // Handle raw file streams over standard strings if selected
      if (uploadMode === "upload" && imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const petData: Pet = {
        id: editingPet ? editingPet.id : `pet_${Date.now()}`,
        name,
        species,
        breed,
        age,
        ageGroup,
        gender,
        size,
        weight: weight || undefined,
        color,
        vaccinated,
        neutered,
        status,
        adoptionFee: feeNum,
        description,
        image: finalImageUrl || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80",
        traits,
        rating: editingPet ? editingPet.rating : 5,
        reviewCount: editingPet ? editingPet.reviewCount : 1,
      };

      await saveAdminPet(petData);
      setTick((t) => t + 1);
      setIsModalOpen(false);
      resetForm();
      toast.success(editingPet ? "Pet updated successfully!" : "Pet listed successfully!");
    } catch (error: any) {
      console.error("Failed to save pet", error);
      toast.error(error.message || "Unable to save the pet profile.");
    } finally {
      setIsUploading(false);
    }
  };


  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteAdminPet(itemToDelete);
      setTick((t) => t + 1);
      toast.success("Item deleted successfully.");
    } catch (error) {
      console.error("Failed to delete pet", error);
      toast.error("Failed to delete the item from the database.");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredPets = useMemo(() => {
    return pets.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecies = speciesFilter === "all" || p.species === speciesFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [pets, searchTerm, speciesFilter, statusFilter]);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F0EB]">Pets</h1>
          <p className="text-sm text-[#9B9B9B] mt-1">Manage listed pets, modify bios, or list new dogs/cats for adoption.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#d4891a] text-[#111111] font-bold rounded-full px-5 py-2.5 text-sm transition-all"
        >
          <Plus size={16} /> List New Pet
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            type="text"
            placeholder="Search by Pet Name, Breed, Bio or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#1F1F1F] rounded-2xl text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111] border border-[#1F1F1F] rounded-2xl px-3 py-1.5">
            <Filter size={14} className="text-[#9B9B9B]" />
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="bg-transparent text-sm text-[#F5F0EB] focus:outline-none cursor-pointer capitalize"
            >
              <option value="all" className="bg-[#111]">All Species</option>
              {SPECIES.map((sp) => (
                <option key={sp} value={sp} className="bg-[#111]">{sp.replace("-", " ")}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-[#1F1F1F] rounded-2xl px-3 py-1.5">
            <Filter size={14} className="text-[#9B9B9B]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm text-[#F5F0EB] focus:outline-none cursor-pointer capitalize"
            >
              <option value="all" className="bg-[#111]">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st} className="bg-[#111]">{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pets Table */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
        {filteredPets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">🐾</div>
            <h3 className="font-semibold text-lg text-[#F5F0EB]">No pets found</h3>
            <p className="text-sm text-[#9B9B9B] mt-1 font-medium">Try adjusting your filters or list a new pet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-xs text-[#9B9B9B] text-left">
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Pet Profile</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Species / Breed</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Gender & Age</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Adoption Fee</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Status</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Health Details</th>
                  <th scope="col" className="py-3 text-right font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]/40">
                {filteredPets.map((pet) => (
                  <tr key={pet.id} className="hover:bg-[#1A1A1A]/40 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-12 h-12 object-cover rounded-xl border border-border/10 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&q=80";
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[#F5F0EB] text-sm truncate max-w-xs">{pet.name}</h4>
                          <span className="text-[10px] bg-[#1F1F1F] text-[#9B9B9B] px-1.5 py-0.5 rounded font-mono mt-1 inline-block">{pet.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[#9B9B9B]">
                      <div className="text-white font-medium capitalize">{pet.species.replace("-", " ")}</div>
                      <div className="text-xs text-[#9B9B9B] mt-0.5">{pet.breed}</div>
                    </td>
                    <td className="py-4 pr-4 text-[#9B9B9B]">
                      <div className="capitalize text-white font-medium">{pet.gender}</div>
                      <div className="text-xs text-[#9B9B9B] mt-0.5">{pet.age} ({pet.ageGroup})</div>
                    </td>
                    <td className="py-4 pr-4 font-bold text-[#F5A623]">
                      {formatPrice(pet.adoptionFee)}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        pet.status === "available"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : pet.status === "reserved"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-[#9B9B9B]/10 text-[#9B9B9B] border-[#9B9B9B]/20"
                      }`}>
                        {pet.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {pet.vaccinated && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-semibold">Vaccinated</span>}
                        {pet.neutered && <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-semibold">Neutered</span>}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(pet)}
                          className="p-2 text-[#29ABE2] hover:bg-[#29ABE2]/10 rounded-xl transition-all"
                          aria-label="Edit Pet"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(pet.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          aria-label="Delete Pet"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setItemToDelete(null);
      }}>
        <DialogContent className="bg-[#111111] border-[#1F1F1F] text-[#F5F0EB] sm:max-w-md">
          <DialogTitle>Delete pet?</DialogTitle>
          <DialogDescription className="text-[#9B9B9B]">
            This action cannot be undone. The selected pet profile will be removed from the admin listing.
          </DialogDescription>
          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setItemToDelete(null);
              }}
              className="rounded-xl border border-[#1F1F1F] px-4 py-2 text-sm text-[#F5F0EB] hover:bg-[#1A1A1A]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-[#1F1F1F] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#1F1F1F] p-5">
                <h2 className="font-bold text-lg text-[#F5F0EB]">{editingPet ? "Edit Pet Profile" : "List New Pet for Adoption"}</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-[#1C1C1C] rounded-xl text-[#9B9B9B] hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSavePet} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Pet Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bruno"
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Breed *</label>
                    <input
                      type="text"
                      required
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      placeholder="e.g. Labrador Retriever"
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Species *</label>
                    <select
                      value={species}
                      onChange={(e) => setSpecies(e.target.value as Pet["species"])}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] cursor-pointer capitalize"
                    >
                      {SPECIES.map((sp) => (
                        <option key={sp} value={sp} className="bg-[#111]">{sp.replace("-", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Pet["gender"])}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] cursor-pointer capitalize"
                    >
                      <option value="male" className="bg-[#111]">Male</option>
                      <option value="female" className="bg-[#111]">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Status *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Pet["status"])}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] cursor-pointer capitalize"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st} className="bg-[#111]">{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Age *</label>
                    <input
                      type="text"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 2 years"
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Age Group *</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAdminPetAgeGroup(e.target.value as Pet["ageGroup"])}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] cursor-pointer capitalize"
                    >
                      {AGE_GROUPS.map((g) => (
                        <option key={g} value={g} className="bg-[#111]">{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Size *</label>
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value as Pet["size"])}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] cursor-pointer capitalize"
                    >
                      {SIZES.map((sz) => (
                        <option key={sz} value={sz} className="bg-[#111]">{sz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Weight</label>
                    <input
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 28kg or 4.5kg"
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Color *</label>
                    <input
                      type="text"
                      required
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. Golden"
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Adoption Fee (₹)</label>
                    <input
                      type="number"
                      value={adoptionFee}
                      onChange={(e) => setAdoptionFee(e.target.value)}
                      placeholder="5000"
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  </div>
                </div>

                {/* File Upload Selector & Input Field Block */}
                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1.5">Pet Image *</label>
                  <div className="flex gap-4 mb-3 text-xs">
                    <button 
                      type="button" 
                      onClick={() => setUploadMode("upload")}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all ${
                        uploadMode === "upload" 
                          ? "text-[#F5A623] border-[#F5A623]/30 bg-[#F5A623]/5 font-bold" 
                          : "text-[#9B9B9B] border-transparent hover:text-white"
                      }`}
                    >
                      📁 Upload File
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setUploadMode("url")}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all ${
                        uploadMode === "url" 
                          ? "text-[#F5A623] border-[#F5A623]/30 bg-[#F5A623]/5 font-bold" 
                          : "text-[#9B9B9B] border-transparent hover:text-white"
                      }`}
                    >
                      🔗 Paste URL
                    </button>
                  </div>

                  {uploadMode === "upload" ? (
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { 
                          setImageFile(file); 
                          setImagePreview(URL.createObjectURL(file)); 
                        }
                      }}
                      className="w-full text-sm text-[#9B9B9B] bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-3 py-2 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:bg-[#F5A623] file:text-[#111] file:font-bold file:border-0 cursor-pointer hover:file:bg-[#d4891a]"
                    />
                  ) : (
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/..." 
                      value={image}
                      onChange={e => {
                        setImage(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  )}

                  {imagePreview && (
                    <div className="mt-3 flex items-center gap-3 bg-[#0E0E0E] p-2 rounded-xl border border-[#1C1C1C] w-fit">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded-lg border border-[#2A2A2A]" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&q=80";
                        }}
                      />
                      <span className="text-[10px] text-[#9B9B9B] pr-2">Image Preview</span>
                    </div>
                  )}
                </div>


                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Traits (comma-separated)</label>
                  <input
                    type="text"
                    value={traitsString}
                    onChange={(e) => setTraitsString(e.target.value)}
                    placeholder="e.g. Friendly, Playful, House-trained, Vaccinated"
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Pet Bio / Description *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the pet's temperament, health condition, and behavior..."
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl p-3 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] h-24 resize-none transition-colors"
                  />
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F5F0EB]">
                    <input
                      type="checkbox"
                      checked={vaccinated}
                      onChange={(e) => setVaccinated(e.target.checked)}
                      className="rounded accent-[#F5A623] w-4 h-4 border-[#1F1F1F] bg-[#0E0E0E]"
                    />
                    Vaccinated
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F5F0EB]">
                    <input
                      type="checkbox"
                      checked={neutered}
                      onChange={(e) => setNeutered(e.target.checked)}
                      className="rounded accent-[#F5A623] w-4 h-4 border-[#1F1F1F] bg-[#0E0E0E]"
                    />
                    Neutered/Spayed
                  </label>
                </div>

                <div className="pt-4 border-t border-[#1F1F1F] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#1C1C1C] hover:bg-card border border-[#2A2A2A] text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl text-xs font-bold bg-[#F5A623] hover:bg-[#d4891a] text-[#111111] transition-all"
                  >
                    {editingPet ? "Save Changes" : "List Pet"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  // Small inline helper to bypass ageGroup types dynamically
  function setAdminPetAgeGroup(val: string) {
    setAgeGroup(val as Pet["ageGroup"]);
  }
}
