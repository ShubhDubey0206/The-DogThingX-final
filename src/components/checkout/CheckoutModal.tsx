"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, LogIn, Eye, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { saveOrder, generateOrderId, Order, getSiteConfig } from "@/lib/storage";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "auth-gate" | "details" | "confirm";

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentUser, signIn } = useAuth();
  const router = useRouter();
  const siteConfig = getSiteConfig();
  const [step, setStep] = useState<Step>("auth-gate");

  const [isGuest, setIsGuest] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: currentUser?.email || "", street: "", city: "", pincode: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedOrderId, setSavedOrderId] = useState<string>("");
  const savedRef = useRef(false);

  const tax = Math.round(cartTotal * 0.18);
  const total = cartTotal + tax;

  useEffect(() => {
    if (open) {
      savedRef.current = false;
      setSavedOrderId("");
      if (currentUser) {
        setForm((f) => ({ ...f, email: currentUser.email ?? "" }));
        setStep("details");
      } else {
        setStep("auth-gate");
      }
    }
  }, [open]);

  useEffect(() => {
    if (step === "confirm" && !savedRef.current && cartItems.length > 0) {
      savedRef.current = true;
      (async () => {
        try {
          const orderId = await generateOrderId();
          const newOrder: Order = {
            orderId,
            userEmail: currentUser?.email ?? (form.email || "guest@dtx.local"),
            placedAt: new Date().toISOString(),
            items: cartItems.map((i) => ({
              productId: i.product.id,
              name: i.product.name,
              category: i.product.category,
              image: i.product.image,
              price: i.product.price,
              quantity: i.quantity,
            })),
            subtotal: cartTotal,
            gst: tax,
            total,
            deliveryAddress: { name: form.name, phone: form.phone, street: form.street, city: form.city, pincode: form.pincode },
            paymentMethod: "cod",
            status: "confirmed",
            statusHistory: [{ status: "confirmed", timestamp: new Date().toISOString(), note: "Order received" }],
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            notes: form.notes,
          };
          await saveOrder(newOrder);
          setSavedOrderId(orderId);
        } catch {
          toast.error("Failed to save order. Please try again.");
        }
      })();
    }
  }, [step]);

  const handleSignIn = () => {
    if (!email) { toast.error("Please enter your email"); return; }
    signIn(email, password);
    toast.success("Welcome back! 🐾");
    setForm((f) => ({ ...f, email }));
    setStep("details");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Required";
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Valid Indian phone required";
    if (!form.email) e.email = "Required";
    if (!form.street) e.street = "Required";
    if (!form.city) e.city = "Required";
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = () => {
    if (validate()) {
      setStep("confirm");
      toast.success("Order placed! 🎉", { duration: 5000 });
    }
  };

  const handleClose = () => {
    if (step === "confirm") clearCart();
    onClose();
    setTimeout(() => {
      setStep("auth-gate");
      setShowSignIn(false);
      setEmail("");
      setPassword("");
      savedRef.current = false;
      setSavedOrderId("");
    }, 300);
  };

  const handleConfirmClose = () => { clearCart(); handleClose(); };
  const handleViewOrders = () => { clearCart(); handleClose(); router.push("/orders"); };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <span className="sr-only"><DialogTitle>Checkout</DialogTitle></span>
        {step === "auth-gate" && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-1">Almost there! 🐾</h2>
            <p className="text-muted-foreground text-sm mb-6">Sign in for order tracking, or continue as guest</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-border rounded-xl p-5 flex flex-col gap-3">
                <User size={28} className="text-[#29ABE2]" />
                <h3 className="font-semibold">Continue as guest</h3>
                <p className="text-sm text-muted-foreground">No account needed. Just fill your details.</p>
                <button
                  onClick={() => { setIsGuest(true); setStep("details"); }}
                  data-testid="button-guest-checkout"
                  className="mt-auto border-2 border-[#F5A623] text-[#F5A623] rounded-full py-2 text-sm font-bold hover:bg-[#F5A623] hover:text-[#111111] transition-all"
                >
                  Continue as guest
                </button>
              </div>
              <div className="border border-border rounded-xl p-5 flex flex-col gap-3">
                <LogIn size={28} className="text-[#F5A623]" />
                <h3 className="font-semibold">Sign in / Register</h3>
                <p className="text-sm text-muted-foreground">Track orders, save wishlist, faster checkout.</p>
                {!showSignIn ? (
                  <button
                    onClick={() => setShowSignIn(true)}
                    data-testid="button-sign-in-checkout"
                    className="mt-auto bg-[#F5A623] text-[#111111] rounded-full py-2 text-sm font-bold hover:bg-[#d4891a] transition-all"
                  >
                    Sign in with email
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                    <button onClick={handleSignIn} className="w-full bg-[#F5A623] text-[#111111] rounded-full py-2 text-sm font-bold hover:bg-[#d4891a]">Sign in</button>
                    <button onClick={() => setShowSignIn(false)} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">← Back to options</button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            {currentUser ? (
              <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-3 py-1 text-xs font-semibold mb-4">
                Signed in as {currentUser.email}
              </div>
            ) : (
              <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full px-3 py-1 text-xs font-semibold mb-4">
                Continuing as guest
              </div>
            )}
            <div className="bg-card border border-card-border rounded-xl p-4 mb-6 space-y-2">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                  <span className="font-medium">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{cartTotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between font-bold text-[#F5A623]"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "name", label: "Full Name", placeholder: "Prasad Belhekar", type: "text" },
                { key: "phone", label: "Phone Number", placeholder: "9960878712", type: "tel" },
                { key: "email", label: "Email", placeholder: "you@email.com", type: "email" },
                { key: "street", label: "Street Address", placeholder: "123, Main Road", type: "text" },
                { key: "city", label: "City", placeholder: "Pune", type: "text" },
                { key: "pincode", label: "Pincode", placeholder: "412106", type: "text" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium block mb-1">{field.label} *</label>
                  <input
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    data-testid={`input-${field.key}`}
                    className={`w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623] ${errors[field.key] ? "border-red-500" : "border-border"}`}
                  />
                  {errors[field.key] && <p className="text-red-500 text-xs mt-0.5">{errors[field.key]}</p>}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium block mb-1">Order Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Any special instructions..."
                  rows={2}
                  data-testid="input-notes"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none"
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Payment Method</p>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" defaultChecked className="text-[#F5A623]" />
                  <span className="text-sm">Cash on Delivery</span>
                  <span className="text-xs text-muted-foreground">(₹0 extra)</span>
                </label>
                <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <input type="radio" disabled />
                  <span className="text-sm">Online Payment</span>
                  <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">Coming soon</span>
                </label>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              data-testid="button-place-order"
              className="w-full mt-6 bg-[#F5A623] text-[#111111] rounded-full py-3 font-bold hover:bg-[#d4891a] active:scale-95 transition-all"
            >
              Place Order
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex justify-center mb-4"
            >
              <CheckCircle size={72} className="text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Order placed! 🎉</h2>
            {savedOrderId && (
              <p className="text-sm text-muted-foreground mb-1">
                Order ID: <span className="font-semibold text-foreground">{savedOrderId}</span>
              </p>
            )}
            <p className="text-muted-foreground mb-6">
              Prasad will call you at <strong>{form.phone || "your number"}</strong> to confirm delivery.
            </p>
            <div className="bg-card border border-card-border rounded-xl p-4 mb-6 text-left space-y-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span className="font-medium text-[#F5A623]">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-[#F5A623] border-t border-border pt-2 mt-2">
                <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${siteConfig.whatsapp || "919960878712"}?text=Hi!%20I%20just%20placed%20order%20${savedOrderId}%20on%20The%20Dog%20Thingx.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white rounded-full py-3 font-bold text-sm hover:bg-[#20bd59] transition-all text-center"
              >

                Share on WhatsApp
              </a>
              <button
                onClick={handleConfirmClose}
                data-testid="button-continue-shopping"
                className="flex-1 border border-border rounded-full py-3 font-bold text-sm hover:bg-card transition-all"
              >
                Continue shopping
              </button>
            </div>
            {currentUser && (
              <button
                onClick={handleViewOrders}
                data-testid="button-view-orders"
                className="mt-4 text-[#29ABE2] text-sm hover:underline"
              >
                View order status →
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
