"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { adminLogin, isAdminLoggedIn } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) {
      router.replace("/admin");
    }
  }, [isAdminLoggedIn, router]);

  if (isAdminLoggedIn) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await adminLogin(email, password);

    if (!error) {
      toast.success("Welcome back, Prasad! 🐾");
      router.push("/admin");
    } else {
      setError(error);
      setPassword("");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none" className="mx-auto mb-4">
            <circle cx="16" cy="16" r="16" fill="#F5A623" opacity="0.12" />
            <ellipse cx="10" cy="10" rx="3" ry="4" fill="#F5A623" />
            <ellipse cx="22" cy="10" rx="3" ry="4" fill="#F5A623" />
            <ellipse cx="6" cy="18" rx="2.5" ry="3.5" fill="#F5A623" />
            <ellipse cx="26" cy="18" rx="2.5" ry="3.5" fill="#F5A623" />
            <path d="M16 14c-5 0-8 3-7 7s4 5 7 5 6-1 7-5-2-7-7-7z" fill="#F5A623" />
          </svg>
          <h1 className="text-2xl font-bold text-[#F5F0EB]">Admin Access</h1>
          <p className="text-[#9B9B9B] text-sm mt-1">The Dog Thingx · Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#9B9B9B] block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                data-testid="input-admin-email"
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#9B9B9B] block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  data-testid="input-admin-password"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] transition-colors pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] hover:text-[#F5F0EB]">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password}
            data-testid="button-admin-login"
            className="w-full bg-[#F5A623] text-[#111111] rounded-xl py-3 font-bold text-sm hover:bg-[#d4891a] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
          <p className="text-center text-xs text-[#9B9B9B]">
            Not an admin?{" "}
            <button type="button" onClick={() => router.push("/")} className="text-[#F5A623] hover:underline">
              Back to website
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
