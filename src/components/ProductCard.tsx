"use client";
import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  showQuickView?: boolean;
}

function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem("dtx_wishlist") || "[]"); } catch { return []; }
}

export function ProductCard({ product, onQuickView, showQuickView }: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  const [wishlisted, setWishlisted] = useState(() => getWishlist().includes(product.id));
  const inCart = cartItems.some((i) => i.product.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
    toast.success("Added to cart!");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const list = getWishlist();
    if (wishlisted) {
      const updated = list.filter((id) => id !== product.id);
      localStorage.setItem("dtx_wishlist", JSON.stringify(updated));
      setWishlisted(false);
      toast("Removed from wishlist");
    } else {
      localStorage.setItem("dtx_wishlist", JSON.stringify([...list, product.id]));
      setWishlisted(true);
      toast.success("Saved to wishlist ❤️");
    }
  };

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      data-testid={`card-product-${product.id}`}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0 },
      }}
      className="rounded-2xl bg-card border border-card-border overflow-hidden cursor-pointer group hover:border-[#F5A623]/40 transition-colors flex flex-col"
      onClick={() => onQuickView?.(product)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${!product.inStock ? "opacity-60 grayscale" : ""}`}
        />
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          data-testid={`button-wishlist-${product.id}`}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
        >
          <Heart size={16} className={wishlisted ? "fill-[#F5A623] text-[#F5A623]" : "text-white"} />
        </button>
        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-[#F5A623] text-[#111111] text-xs font-bold px-2 py-0.5 rounded-full">New</span>
          )}
          {discountPct && (
            <span className="bg-[#F5A623] text-[#111111] text-xs font-bold px-2 py-0.5 rounded-full">
              {discountPct}% off
            </span>
          )}
        </div>
        {/* Quick View */}
        {showQuickView && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/70 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              Quick View
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="inline-flex self-start items-center px-3 py-1 rounded-full bg-[#F5A623] text-[#111111] text-xs font-semibold capitalize">
          {product.category}
        </span>
        <h3 className="text-lg font-bold truncate">{product.name}</h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={13}
              fill={i <= Math.round(product.rating) ? "#F5C518" : "none"}
              stroke={i <= Math.round(product.rating) ? "#F5C518" : "currentColor"}
              className="text-muted-foreground"
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {product.rating} ({product.reviewCount})
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#F5A623]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            data-testid={`button-add-to-cart-${product.id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold min-w-[100px] text-center transition-all active:scale-95 ${
              !product.inStock
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : inCart
                ? "bg-green-500 text-white"
                : "bg-[#F5A623] text-[#111111] hover:bg-[#d4891a]"
            }`}
          >
            {!product.inStock ? "Out of stock" : inCart ? "In Cart ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
