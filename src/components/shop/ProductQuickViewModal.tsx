"use client";
import { Star, Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem("dtx_wishlist") || "[]"); } catch { return []; }
}

export function ProductQuickViewModal({ product, onClose }: ProductQuickViewModalProps) {
  const { addToCart, cartItems } = useCart();
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(() => product ? getWishlist().includes(product.id) : false);

  if (!product) return null;

  const inCart = cartItems.some((i) => i.product.id === product.id);
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!product.inStock) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`Added ${qty}× ${product.name} to cart!`);
    onClose();
  };

  const handleWishlist = () => {
    const list = getWishlist();
    if (wishlisted) {
      localStorage.setItem("dtx_wishlist", JSON.stringify(list.filter((id) => id !== product.id)));
      setWishlisted(false);
      toast("Removed from wishlist");
    } else {
      localStorage.setItem("dtx_wishlist", JSON.stringify([...list, product.id]));
      setWishlisted(true);
      toast.success("Saved to wishlist ❤️");
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <span className="sr-only"><DialogTitle>{product.name} – Quick View</DialogTitle></span>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="relative bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-80 sm:h-full object-cover ${!product.inStock ? "opacity-60 grayscale" : ""}`}
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.isNew && <span className="bg-[#F5A623] text-[#111111] text-xs font-bold px-2 py-0.5 rounded-full">New</span>}
              {discountPct && <span className="bg-[#F5A623] text-[#111111] text-xs font-bold px-2 py-0.5 rounded-full">{discountPct}% off</span>}
              {!product.inStock && <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Out of Stock</span>}
            </div>
          </div>
          {/* Details */}
          <div className="p-6 flex flex-col gap-3">
            <span className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#F5A623]/20 text-[#F5A623] text-xs font-semibold capitalize">
              {product.category}
            </span>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} fill={i <= Math.round(product.rating) ? "#F5C518" : "none"} stroke={i <= Math.round(product.rating) ? "#F5C518" : "currentColor"} className="text-muted-foreground" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{product.rating} ({product.reviewCount} reviews)</span>
            </div>
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-[#F5A623]">₹{product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through pb-0.5">₹{product.originalPrice.toLocaleString("en-IN")}</span>
              )}
            </div>
            {product.inStock && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Qty:</span>
                <div className="flex items-center border border-border rounded-full overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1 hover:bg-card text-sm transition-colors">−</button>
                  <span className="px-4 py-1 text-sm font-medium">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="px-3 py-1 hover:bg-card text-sm transition-colors">+</button>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                data-testid={`button-qv-add-${product.id}`}
                className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-all active:scale-95 ${
                  !product.inStock ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-[#F5A623] text-[#111111] hover:bg-[#d4891a]"
                }`}
              >
                {!product.inStock ? "Out of Stock" : inCart ? "Add More" : "Add to Cart"}
              </button>
              <button
                onClick={handleWishlist}
                aria-label="Toggle wishlist"
                data-testid={`button-qv-wishlist-${product.id}`}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors"
              >
                <Heart size={16} className={wishlisted ? "fill-[#F5A623] text-[#F5A623]" : ""} />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
