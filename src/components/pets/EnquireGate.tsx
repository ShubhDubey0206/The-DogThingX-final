"use client";
import { useState } from "react";
import { CheckCircle, MessageCircle, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pet } from "@/lib/pets";
import { useAuth } from "@/context/AuthContext";
import { saveAdoptionRequest, generateRequestId, AdoptionRequest, getSiteConfig } from "@/lib/storage";

interface EnquireGateProps {
  pet: Pet | null;
  open: boolean;
  onClose: () => void;
}

type Step = "auth" | "form" | "done";

export function EnquireGate({ pet, open, onClose }: EnquireGateProps) {
  const { currentUser, signIn, isLoggedIn } = useAuth();
  const router = useRouter();
  const siteConfig = getSiteConfig();
  const [step, setStep] = useState<Step>("auth");
  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState(currentUser?.email || "");

  const [name, setName] = useState(currentUser?.user_metadata?.full_name || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!pet) return null;

  const handleAuth = async () => {
    if (!email) { toast.error("Email required"); return; }
    const { error } = await signIn(email, "");
    if (error) { toast.error("Couldn't sign in — please check your credentials"); return; }
    setStep("form");
  };

  const handleGuestContinue = () => {
    if (!name || !email) { toast.error("Name and email required"); return; }
    setStep("form");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) e.phone = "Valid 10-digit Indian phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const userEmail = currentUser?.email ?? (email || `${phone}@guest.dtx`);
    try {
      const requestId = await generateRequestId();
      const newRequest: AdoptionRequest = {
        requestId,
        userEmail,
        petId: pet.id,
        petName: pet.name,
        petSpecies: pet.species,
        petBreed: pet.breed,
        petImage: pet.image,
        adoptionFee: pet.adoptionFee,
        submittedAt: new Date().toISOString(),
        status: "pending",
        statusHistory: [{ status: "pending", timestamp: new Date().toISOString(), note: "Enquiry received" }],
        enquiryMessage: message,
        contactPhone: phone,
      };
      await saveAdoptionRequest(newRequest);
      toast.success("Enquiry sent! Prasad will contact you soon 🐾", { duration: 5000 });
      setStep("done");
    } catch {
      toast.error("Failed to submit enquiry. Please try again.");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep("auth"); setPhone(""); setMessage(""); setErrors({}); }, 300);
  };

  const waMsg = encodeURIComponent(`Hi! I'm interested in ${pet.name} (${pet.breed}). My name is ${name || currentUser?.user_metadata?.full_name || currentUser?.email}, phone: ${phone}. ${message}`);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <AnimatePresence mode="wait">
          {step === "auth" && (
            <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Enquire about {pet.name} 🐾</h2>
                <p className="text-sm text-muted-foreground mt-1">Please provide your contact details so Prasad can reach you.</p>
              </div>
              {currentUser ? (
                <div>
                  <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg p-3 text-sm mb-4">
                    <CheckCircle size={16} /> Signed in as {currentUser.email}
                  </div>
                  <button onClick={() => setStep("form")} className="w-full bg-[#F5A623] text-[#111111] rounded-full py-2.5 font-bold text-sm hover:bg-[#d4891a] active:scale-95 transition-all" data-testid="button-continue-enquiry">
                    Continue →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => setIsSignIn(false)} className={`flex-1 py-2 rounded-full border font-medium transition-all ${!isSignIn ? "bg-[#F5A623] text-[#111111] border-[#F5A623]" : "border-border text-muted-foreground"}`}>New user</button>
                    <button onClick={() => setIsSignIn(true)} className={`flex-1 py-2 rounded-full border font-medium transition-all ${isSignIn ? "bg-[#F5A623] text-[#111111] border-[#F5A623]" : "border-border text-muted-foreground"}`}>Returning</button>
                  </div>
                  {!isSignIn && (
                    <div>
                      <label className="text-sm font-medium block mb-1">Your name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]" data-testid="input-enquire-name" />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium block mb-1">Email address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]" data-testid="input-enquire-email" />
                  </div>
                  <button onClick={isSignIn ? handleAuth : handleGuestContinue} className="w-full bg-[#F5A623] text-[#111111] rounded-full py-2.5 font-bold text-sm hover:bg-[#d4891a] active:scale-95 transition-all" data-testid="button-enquire-continue">
                    Continue →
                  </button>
                </div>
              )}
            </motion.div>
          )}
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Your enquiry</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell us a bit more so we can help you faster.</p>
              </div>
              <div className="flex items-center gap-3 bg-card border border-card-border rounded-xl p-3">
                <img src={pet.image} alt={pet.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold text-sm">{pet.name}</p>
                  <p className="text-xs text-muted-foreground">{pet.breed} · {pet.adoptionFee === 0 ? "Free" : `₹${pet.adoptionFee.toLocaleString("en-IN")}`} adoption fee</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Phone number *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9960878712" data-testid="input-enquire-phone"
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623] ${errors.phone ? "border-red-500" : "border-border"}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Message (optional)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell Prasad a bit about yourself and your home environment..." rows={3} data-testid="input-enquire-message" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmit} data-testid="button-submit-enquiry" className="flex-1 bg-[#F5A623] text-[#111111] rounded-full py-2.5 font-bold text-sm hover:bg-[#d4891a] active:scale-95 transition-all">Send Enquiry</button>
                <a href={`https://wa.me/${siteConfig.whatsapp || "919960878712"}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full py-2 text-sm font-bold hover:bg-[#20bd59] transition-all">
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            </motion.div>
          )}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="flex justify-center">
                <CheckCircle size={72} className="text-green-500" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold mb-1">Enquiry sent! 🎉</h2>
                <p className="text-sm text-muted-foreground">Prasad will contact you soon at {phone}.<br />You can also reach him directly:</p>
              </div>
              <div className="flex gap-2">
                <a href={`https://wa.me/${siteConfig.whatsapp || "919960878712"}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full py-2 text-sm font-bold hover:bg-[#20bd59] transition-all">
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <a href={`tel:${siteConfig.phone || "9960878712"}`} className="flex-1 flex items-center justify-center gap-2 border border-border rounded-full py-2 text-sm font-bold hover:bg-card transition-all">
                  <Phone size={14} /> {siteConfig.phone || "9960878712"}
                </a>
              </div>

              {isLoggedIn && (
                <button onClick={() => { handleClose(); router.push("/adoptions"); }} data-testid="button-view-adoptions" className="text-[#29ABE2] text-sm hover:underline">
                  View your request →
                </button>
              )}
              <button onClick={handleClose} data-testid="button-close-enquiry-done" className="w-full border border-border rounded-full py-2 text-sm font-medium hover:bg-card transition-all">Close</button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
