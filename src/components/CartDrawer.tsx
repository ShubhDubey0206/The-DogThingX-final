"use client";
import { useState } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";

export function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQty, cartTotal, cartCount } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    if (cartCount === 0) {
      toast("Add some items first! 🐾");
      return;
    }
    setIsCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-label="Shopping cart"
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-background border-l border-border z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-[#F5A623]" />
                  <h2 className="font-bold text-lg">Your Cart ({cartCount})</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close cart"
                  data-testid="button-close-cart"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-card transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                    <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
                      <ellipse cx="16" cy="21" rx="7" ry="6" fill="#F5A623" opacity="0.3" />
                      <ellipse cx="9" cy="13" rx="2.5" ry="3.5" fill="#F5A623" opacity="0.3" />
                      <ellipse cx="23" cy="13" rx="2.5" ry="3.5" fill="#F5A623" opacity="0.3" />
                      <ellipse cx="13" cy="10" rx="2" ry="3" fill="#F5A623" opacity="0.3" />
                      <ellipse cx="19" cy="10" rx="2" ry="3" fill="#F5A623" opacity="0.3" />
                    </svg>
                    <div>
                      <p className="font-semibold">Your cart is empty</p>
                      <p className="text-sm text-muted-foreground mt-1">Add some products to get started</p>
                    </div>
                    <Link
                      href="/shop"
                      onClick={() => setIsCartOpen(false)}
                      className="bg-[#F5A623] text-[#111111] rounded-full px-6 py-2 text-sm font-bold hover:bg-[#d4891a] transition-all"
                      data-testid="link-browse-shop-empty-cart"
                    >
                      Browse Shop
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-3 items-start" data-testid={`cart-item-${item.product.id}`}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.product.name}</p>
                        <p className="text-[#F5A623] font-bold text-sm">₹{item.product.price.toLocaleString("en-IN")}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            data-testid={`button-decrease-qty-${item.product.id}`}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            data-testid={`button-increase-qty-${item.product.id}`}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-card transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label="Remove item"
                        data-testid={`button-remove-${item.product.id}`}
                        className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-border px-5 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Subtotal</span>
                    <span className="text-xl font-bold text-[#F5A623]">₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    data-testid="button-proceed-checkout"
                    className="w-full bg-[#F5A623] text-[#111111] rounded-full py-3 font-bold hover:bg-[#d4891a] active:scale-95 transition-all"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    data-testid="button-continue-shopping-cart"
                    className="w-full border border-border rounded-full py-2.5 text-sm font-medium hover:bg-card transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
