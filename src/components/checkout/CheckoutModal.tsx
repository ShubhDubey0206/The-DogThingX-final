"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, LogIn, Eye, EyeOff, CheckCircle, CreditCard, ShieldCheck, UserPlus, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { saveOrder, generateOrderId, Order, getSiteConfig, getUserProfile, saveUserProfile } from "@/lib/storage";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "auth-gate" | "details" | "confirm";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentUser, signIn, signUp } = useAuth();
  const router = useRouter();
  const siteConfig = getSiteConfig();
  const [step, setStep] = useState<Step>("auth-gate");

  // Auth form states inside modal
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online");
  const [isProcessingRzp, setIsProcessingRzp] = useState(false);
  const [isRzpActive, setIsRzpActive] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: currentUser?.email || "",
    street: "",
    city: "",
    pincode: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedOrderId, setSavedOrderId] = useState<string>("");
  const savedRef = useRef(false);

  // Snapshot of cart before clearCart() is called, so confirm screen stays populated
  const [snapshotItems, setSnapshotItems] = useState(cartItems);
  const [snapshotTotal, setSnapshotTotal] = useState(cartTotal);

  const tax = 0;
  const total = cartTotal;

  useEffect(() => {
    if (open) {
      savedRef.current = false;
      setSavedOrderId("");
      if (currentUser?.email) {
        setStep("details");
        (async () => {
          const profile = await getUserProfile(currentUser.email!);
          if (profile) {
            setForm((f) => ({
              ...f,
              email: profile.email || currentUser.email || "",
              name: profile.fullName || currentUser.user_metadata?.full_name || f.name,
              phone: profile.phone || f.phone,
              street: profile.street || f.street,
              city: profile.city || f.city,
              pincode: profile.pincode || f.pincode,
            }));
          } else {
            setForm((f) => ({
              ...f,
              email: currentUser.email ?? "",
              name: currentUser.user_metadata?.full_name || f.name,
            }));
          }
        })();
      } else {
        setStep("auth-gate");
      }
    }
  }, [open, currentUser]);

  // Handle COD Order Save
  useEffect(() => {
    if (step === "confirm" && paymentMethod === "cod" && !savedRef.current && cartItems.length > 0) {
      savedRef.current = true;
      (async () => {
        try {
          const orderId = await generateOrderId();
          const newOrder: Order = {
            orderId,
            userEmail: currentUser?.email || form.email,
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
            deliveryAddress: {
              name: form.name,
              phone: form.phone,
              street: form.street,
              city: form.city,
              pincode: form.pincode,
            },
            paymentMethod: "cod",
            paymentStatus: "pending",
            status: "confirmed",
            statusHistory: [{ status: "confirmed", timestamp: new Date().toISOString(), note: "Order received (COD)" }],
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            notes: form.notes,
          };
          await saveOrder(newOrder);
          saveUserProfile({
            email: currentUser?.email || form.email,
            fullName: form.name,
            phone: form.phone,
            street: form.street,
            city: form.city,
            pincode: form.pincode,
          });
          setSavedOrderId(orderId);
        } catch {
          toast.error("Failed to save order. Please try again.");
        }
      })();
    }
  }, [step, paymentMethod]);

  const handleAuthSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setAuthLoading(true);
    if (isRegister) {
      if (!name) {
        toast.error("Please enter your name");
        setAuthLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error);
        setAuthLoading(false);
        return;
      }
      toast.success("Account created! 🐾");
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error || "Invalid email or password");
        setAuthLoading(false);
        return;
      }
      toast.success("Welcome back! 🐾");
    }
    setAuthLoading(false);
    setForm((f) => ({ ...f, email, name: name || f.name }));
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

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    // 1. Cash On Delivery
    if (paymentMethod === "cod") {
      setSnapshotItems([...cartItems]);
      setSnapshotTotal(cartTotal);
      setStep("confirm");
      toast.success("Order placed! 🎉", { duration: 5000 });
      return;
    }

    // 2. Online Payment via Razorpay
    try {
      setIsProcessingRzp(true);

      // Create order server-side
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create Razorpay order");
      }

      // Load Razorpay JS SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Razorpay Checkout SDK failed to load. Check your network.");
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "The Dog Thingx",
        description: `Order Checkout (${cartItems.length} items)`,
        order_id: data.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#F5A623",
        },
        handler: async (response: any) => {
          try {
            toast.loading("Verifying payment...", { id: "rzp-verify" });

            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail: currentUser?.email || form.email,
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
                deliveryAddress: {
                  name: form.name,
                  phone: form.phone,
                  street: form.street,
                  city: form.city,
                  pincode: form.pincode,
                },
                notes: form.notes,
              }),
            });

            const verifyData = await verifyRes.json();
            toast.dismiss("rzp-verify");

            if (verifyData.success) {
              savedRef.current = true;
              setSavedOrderId(verifyData.orderId);
              setSnapshotItems([...cartItems]);
              setSnapshotTotal(cartTotal);
              saveUserProfile({
                email: currentUser?.email || form.email,
                fullName: form.name,
                phone: form.phone,
                street: form.street,
                city: form.city,
                pincode: form.pincode,
              });
              setStep("confirm");
              toast.success("Payment verified & Order placed successfully! 🎉");
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (err: any) {
            toast.dismiss("rzp-verify");
            toast.error(err.message || "Error verifying payment signature");
          } finally {
            setIsProcessingRzp(false);
            setIsRzpActive(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingRzp(false);
            setIsRzpActive(false);
            toast.info("Payment window closed");
          },
        },
      };

      setIsRzpActive(true);
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setIsProcessingRzp(false);
      setIsRzpActive(false);
      toast.error(err.message || "Failed to launch Razorpay payment");
    }
  };

  const handleClose = () => {
    if (step === "confirm") clearCart();
    onClose();
    setTimeout(() => {
      setStep("auth-gate");
      setEmail("");
      setPassword("");
      setName("");
      setIsRegister(false);
      savedRef.current = false;
      setSavedOrderId("");
      setIsRzpActive(false);
    }, 300);
  };

  const handleConfirmClose = () => {
    clearCart();
    handleClose();
  };
  const handleViewOrders = () => {
    clearCart();
    handleClose();
    router.push("/orders");
  };

  return (
    <Dialog open={open && !isRzpActive} onOpenChange={(v) => !v && !isRzpActive && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <span className="sr-only">
          <DialogTitle>Checkout</DialogTitle>
        </span>
        {step === "auth-gate" && (
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Sign in to Checkout 🐾</h2>
              <p className="text-muted-foreground text-sm">
                {isRegister
                  ? "Create an account to track your orders and checkout faster"
                  : "Sign in to your Dog Thingx account to continue"}
              </p>
            </div>

            <div className="space-y-3 border border-border rounded-2xl p-5 bg-card">
              {isRegister && (
                <div>
                  <label className="text-sm font-medium block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Prasad Belhekar"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleAuthSubmit}
                disabled={authLoading}
                className="w-full bg-[#F5A623] text-[#111111] font-bold rounded-xl py-3 text-sm hover:bg-[#d4891a] active:scale-95 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isRegister ? (
                  "Create Account & Continue →"
                ) : (
                  "Sign In & Continue →"
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-muted-foreground hover:text-[#F5A623] transition-colors"
                >
                  {isRegister
                    ? "Already have an account? Sign in →"
                    : "Don't have an account? Create one →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-3 py-1 text-xs font-semibold mb-4">
              Signed in as {currentUser?.email || form.email}
            </div>

            {/* Delivery Notice Banner */}
            <div className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl p-3.5 mb-4 space-y-2.5 text-xs text-foreground">
              <div className="flex items-center gap-2.5">
                <Truck size={18} className="text-[#F5A623] shrink-0" />
                <div>
                  <span className="font-bold text-[#F5A623]">Local Free Delivery: </span>
                  <span>Free delivery within {siteConfig.freeDeliveryRadiusKm || 4}km of our shop in Talegaon Dabhade, Pune!</span>
                </div>
              </div>
              <div className="bg-background/90 border border-border/60 rounded-lg p-2.5 flex items-center justify-between gap-3">
                <div className="text-[11px] text-muted-foreground leading-snug">
                  📍 <strong className="text-foreground">Beyond {siteConfig.freeDeliveryRadiusKm || 4}km radius?</strong> Please contact the shop owner to check delivery availability and charges before placing your order.
                </div>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp || "919960878712"}?text=Hi%20Prasad!%20My%20location%20is%20beyond%204km.%20Please%20let%20me%20know%20delivery%20availability.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd59] text-white font-bold px-3 py-1.5 rounded-lg text-[11px] shrink-0 transition-colors inline-flex items-center gap-1 shadow-sm"
                >
                  Contact Owner →
                </a>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-4 mb-6 space-y-2">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-semibold text-emerald-500">FREE (Local ≤ 4km)</span>
                </div>
                <div className="flex justify-between font-bold text-[#F5A623] text-base pt-1 border-t border-border/50">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
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
                    className={`w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623] ${
                      errors[field.key] ? "border-red-500" : "border-border"
                    }`}
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

            {/* Payment Method Selector */}
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <CreditCard size={16} className="text-[#F5A623]" /> Choose Payment Method
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentMethod("online")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "online"
                      ? "border-[#F5A623] bg-[#F5A623]/10 text-foreground font-semibold"
                      : "border-border hover:border-[#F5A623]/50 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="accent-[#F5A623]"
                  />
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      Online Payment <ShieldCheck size={14} className="text-emerald-500" />
                    </div>
                    <div className="text-xs opacity-75">UPI, Cards, NetBanking (Razorpay)</div>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#F5A623] bg-[#F5A623]/10 text-foreground font-semibold"
                      : "border-border hover:border-[#F5A623]/50 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-[#F5A623]"
                  />
                  <div>
                    <div className="text-sm font-bold">Cash on Delivery</div>
                    <div className="text-xs opacity-75">Pay cash at doorstep</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessingRzp}
              data-testid="button-place-order"
              className="w-full mt-6 bg-[#F5A623] text-[#111111] rounded-full py-3.5 font-bold hover:bg-[#d4891a] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessingRzp ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing Razorpay Checkout...</span>
                </>
              ) : paymentMethod === "online" ? (
                `Pay ₹${total.toLocaleString("en-IN")} via Razorpay →`
              ) : (
                `Place Order (COD ₹${total.toLocaleString("en-IN")})`
              )}
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
            <div className="bg-card border border-card-border rounded-xl p-4 text-left text-sm mb-6 space-y-2">
              {snapshotItems.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-[#F5A623]">
                    ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-[#F5A623] border-t border-border pt-2 mt-2">
                <span>Total</span>
                <span>₹{snapshotTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${
                  siteConfig.whatsapp || "919960878712"
                }?text=Hi!%20I%20just%20placed%20order%20${savedOrderId}%20on%20The%20Dog%20Thingx.`}
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
            <button
              onClick={handleViewOrders}
              data-testid="button-view-orders"
              className="mt-4 text-[#29ABE2] text-sm hover:underline block mx-auto"
            >
              View order status →
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
