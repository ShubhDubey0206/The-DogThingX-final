"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignInModal({ open, onClose }: SignInModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { toast.error("Fill in all fields"); return; }
    setLoading(true);
    if (isRegister) {
      const { error } = await signUp(email, password, name);
      if (error) { toast.error(error); setLoading(false); return; }
      toast.success("Account created! Check your email to confirm.");
    } else {
      const { error } = await signIn(email, password);
      if (error) { toast.error("Invalid email or password"); setLoading(false); return; }
      toast.success("Welcome back! 🐾");
    }
    setLoading(false);
    onClose();
  };

  const handleForgot = async () => {
    if (!email) { toast.error("Enter your email address first"); return; }
    const { error } = await resetPassword(email);
    if (error) toast.error(error);
    else toast.success("Password reset link sent to your email!");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <ellipse cx="16" cy="21" rx="7" ry="6" fill="#F5A623" />
              <ellipse cx="9" cy="13" rx="2.5" ry="3.5" fill="#F5A623" />
              <ellipse cx="23" cy="13" rx="2.5" ry="3.5" fill="#F5A623" />
              <ellipse cx="13" cy="10" rx="2" ry="3" fill="#F5A623" />
              <ellipse cx="19" cy="10" rx="2" ry="3" fill="#F5A623" />
            </svg>
          </div>
          <DialogTitle className="text-center text-xl">Welcome back 🐾</DialogTitle>
          <p className="text-center text-sm text-muted-foreground">Sign in to your Dog Thingx account</p>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="text-sm font-medium block mb-1">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  data-testid="input-name"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-sm font-medium block mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              data-testid="input-email"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                data-testid="input-password"
                className="w-full border border-border rounded-lg px-3 py-2 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              onClick={handleForgot}
              className="text-xs text-[#29ABE2] hover:underline mt-1 block text-right w-full"
            >
              Forgot password?
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded"
              data-testid="checkbox-remember"
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            data-testid="button-sign-in"
            className="w-full bg-[#F5A623] text-[#111111] rounded-full py-2.5 font-bold text-sm hover:bg-[#d4891a] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-sm text-center text-muted-foreground hover:text-foreground"
          >
            {isRegister ? "Already have an account? Sign in →" : "Don't have an account? Register →"}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Are you an admin?{" "}
            <button
              type="button"
              onClick={() => { onClose(); router.push("/admin/login"); }}
              className="text-[#F5A623] hover:underline font-medium"
              data-testid="link-admin-signin"
            >
              Admin Panel →
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
