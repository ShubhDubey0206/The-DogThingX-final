"use client";
import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Search, X, Check, Filter, Image as ImageIcon, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PRODUCTS, Product } from "@/lib/products";
import { saveAdminProduct, deleteAdminProduct, getAdminProducts } from "@/lib/storage";
import { supabase } from "@/lib/supabase"; // Import your configured Supabase client
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

function formatPrice(n: number) { return "₹" + n.toLocaleString("en-IN"); }

const CATEGORIES = ["food", "accessories", "dog", "cat", "fish", "bird"];
const PET_TYPES = ["dog", "cat", "fish", "bird", "all"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Product["category"]>("food");
  const [petType, setPetType] = useState<Product["petType"]>("all");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // File Upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);

  // Load products asynchronously from Supabase
  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const adminProds = await getAdminProducts();

        if (!active) return;

        if (adminProds && adminProds.length > 0) {
          setProducts(adminProds);
        } else {
          setProducts(PRODUCTS);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (active) {
          setProducts(PRODUCTS);
          toast.error("Unable to fetch products from Supabase.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [tick]);

  const resetForm = () => {
    setName("");
    setCategory("food");
    setPetType("all");
    setPrice("");
    setOriginalPrice("");
    setDescription("");
    setImage("");
    setInStock(true);
    setIsNew(false);
    setIsFeatured(false);
    setEditingProduct(null);
    
    // Clear asset states
    setImageFile(null);
    setImagePreview("");
    setUploadMode("upload");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setPetType(product.petType);
    setPrice(String(product.price));
    setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
    setDescription(product.description);
    setImage(product.image);
    setInStock(product.inStock);
    setIsNew(!!product.isNew);
    setIsFeatured(!!product.isFeatured);
    
    // Configure editing defaults
    setImageFile(null);
    setImagePreview(product.image);
    setUploadMode("url"); // Default to showing URL field for edit reference
    setIsModalOpen(true);
  };

  // Direct Supabase storage interaction logic
  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : undefined;
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      setIsUploading(true);
      let finalImageUrl = image;

      // Handle raw file streams over standard strings if selected
      if (uploadMode === "upload" && imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const productData: Product = {
        id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
        name,
        category,
        petType,
        price: priceNum,
        originalPrice: originalPriceNum,
        description,
        image: finalImageUrl || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80",
        inStock,
        isNew,
        isFeatured,
        rating: editingProduct ? editingProduct.rating : 5,
        reviewCount: editingProduct ? editingProduct.reviewCount : 1,
      };

      // Await database insertion/upsert
      await saveAdminProduct(productData);
      
      setTick((t) => t + 1);
      setIsModalOpen(false);
      resetForm();
      toast.success(editingProduct ? "Product updated successfully!" : "Product added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to handle product save operations.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteAdminProduct(itemToDelete);
      setTick((t) => t + 1);
      toast.success("Item deleted successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete the item from the database.");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F0EB]">Products</h1>
          <p className="text-sm text-[#9B9B9B] mt-1">Manage, list, edit or delete items in the store catalogs.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#d4891a] text-[#111111] font-bold rounded-full px-5 py-2.5 text-sm transition-all"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            type="text"
            placeholder="Search by Product Name, Description or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111] border border-[#1F1F1F] rounded-2xl text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111] border border-[#1F1F1F] rounded-2xl px-3 py-1.5">
            <Filter size={15} className="text-[#9B9B9B]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-sm text-[#F5F0EB] focus:outline-none cursor-pointer capitalize"
            >
              <option value="all" className="bg-[#111]">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623] mb-3" />
            <p className="text-sm text-[#9B9B9B]">Fetching products from Supabase...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">📦</div>
            <h3 className="font-semibold text-lg text-[#F5F0EB]">No products found</h3>
            <p className="text-sm text-[#9B9B9B] mt-1">Try adjusting your filters or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F1F1F] text-xs text-[#9B9B9B] text-left">
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Product Info</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Category</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Pet Type</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Price</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Stock Status</th>
                  <th scope="col" className="py-3 pr-4 font-semibold uppercase tracking-wider">Attributes</th>
                  <th scope="col" className="py-3 text-right font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]/40">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1A1A1A]/40 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl border border-border/10 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&q=80";
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-[#F5F0EB] text-sm truncate max-w-xs">{p.name}</h4>
                          <span className="text-[10px] bg-[#1F1F1F] text-[#9B9B9B] px-1.5 py-0.5 rounded font-mono mt-1 inline-block">{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 capitalize text-[#9B9B9B]">{p.category}</td>
                    <td className="py-4 pr-4 capitalize text-[#9B9B9B]">{p.petType}</td>
                    <td className="py-4 pr-4">
                      <div className="font-bold text-[#F5A623]">{formatPrice(p.price)}</div>
                      {p.originalPrice && (
                        <div className="text-xs text-[#EF4444] line-through mt-0.5">{formatPrice(p.originalPrice)}</div>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        p.inStock
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.isFeatured && <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-semibold">Featured</span>}
                        {p.isNew && <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-semibold">New</span>}
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                          <Star size={8} fill="currentColor" /> {p.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 text-[#29ABE2] hover:bg-[#29ABE2]/10 rounded-xl transition-all"
                          aria-label="Edit Product"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(p.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          aria-label="Delete Product"
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
          <DialogTitle>Delete product?</DialogTitle>
          <DialogDescription className="text-[#9B9B9B]">
            This action cannot be undone. The selected product will be removed from the catalog.
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

      {/* CRUD Add/Edit Modal */}
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
                <h2 className="font-bold text-lg text-[#F5F0EB]">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-[#1C1C1C] rounded-xl text-[#9B9B9B] hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Canin Medium Puppy Food"
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Product["category"])}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] cursor-pointer capitalize"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Pet Type *</label>
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value as Product["petType"])}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-3 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] cursor-pointer capitalize"
                    >
                      {PET_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-[#111]">{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1500"
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Original Price (₹ - Optional)</label>
                    <input
                      type="number"
                      min={1}
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="1800"
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] transition-colors"
                    />
                  </div>
                </div>

                {/* File Upload Selector & Input Field Block */}
                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1.5">Product Image *</label>
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
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Product Description *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product details, benefits, ingredients or usage instructions..."
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl p-3 text-sm text-[#F5F0EB] placeholder-[#9B9B9B] focus:outline-none focus:border-[#F5A623] h-24 resize-none transition-colors"
                  />
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F5F0EB]">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="rounded accent-[#F5A623] w-4 h-4 border-[#1F1F1F] bg-[#0E0E0E]"
                    />
                    In Stock
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F5F0EB]">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="rounded accent-[#F5A623] w-4 h-4 border-[#1F1F1F] bg-[#0E0E0E]"
                    />
                    Mark as New
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[#F5F0EB]">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded accent-[#F5A623] w-4 h-4 border-[#1F1F1F] bg-[#0E0E0E]"
                    />
                    Feature on Home
                  </label>
                </div>

                <div className="pt-4 border-t border-[#1F1F1F] flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => setIsModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#1C1C1C] hover:bg-card border border-[#2A2A2A] text-foreground transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="py-2.5 px-6 rounded-xl text-xs font-bold bg-[#F5A623] hover:bg-[#d4891a] text-[#111111] transition-all flex items-center gap-2 disabled:opacity-75"
                  >
                    {isUploading ? "Uploading..." : editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}