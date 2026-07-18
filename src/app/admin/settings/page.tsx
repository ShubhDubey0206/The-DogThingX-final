"use client";
import { useState, useEffect } from "react";
import { Settings, Save, Shield, Key, Eye, EyeOff, Layout, Globe, Phone, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getSiteConfig, saveSiteConfig } from "@/lib/storage";
import type { SiteConfig } from "@/lib/storage";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  // Security States
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPins, setShowPins] = useState(false);

  useEffect(() => {
    const data = getSiteConfig();
    setConfig(data);
  }, []);

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    saveSiteConfig(config);
    toast.success("Store configurations updated successfully!");
  };

  const handleToggleChange = (key: keyof SiteConfig) => {
    if (!config) return;
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    saveSiteConfig(updated);
    toast.success(`${key.replace(/([A-Z])/g, " $1")} setting updated`);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = typeof window !== "undefined" ? (localStorage.getItem("dtx_admin_pin") || "2024") : "2024";

    if (currentPin !== storedPin) {
      toast.error("Current PIN is incorrect.");
      return;
    }

    if (newPin.length < 4 || newPin.length > 8) {
      toast.error("New PIN must be between 4 and 8 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      toast.error("New PIN confirmation does not match.");
      return;
    }

    localStorage.setItem("dtx_admin_pin", newPin);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    toast.success("Admin access PIN updated successfully!");
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-[#F5F0EB]">Store Settings</h1>
        <p className="text-sm text-[#9B9B9B] mt-1">Configure global store info, switch feature modes, and manage security PINs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left column: Quick Toggle Settings */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9B9B9B] flex items-center gap-2">
              <Layout size={14} className="text-[#F5A623]" /> Feature Toggles
            </h2>
            <div className="divide-y divide-[#1F1F1F]/60 space-y-3">
              <div className="flex items-center justify-between pt-3">
                <div>
                  <div className="text-xs font-semibold text-white">Maintenance Mode</div>
                  <div className="text-[10px] text-[#9B9B9B] mt-0.5">Offline client catalog</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.maintenanceMode}
                  onChange={() => handleToggleChange("maintenanceMode")}
                  className="rounded accent-[#F5A623] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <div className="text-xs font-semibold text-white">Enable Wishlist</div>
                  <div className="text-[10px] text-[#9B9B9B] mt-0.5">Let users save favorites</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableWishlist}
                  onChange={() => handleToggleChange("enableWishlist")}
                  className="rounded accent-[#F5A623] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <div className="text-xs font-semibold text-white">Enable Product Reviews</div>
                  <div className="text-[10px] text-[#9B9B9B] mt-0.5">Display customer feedback</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableReviews}
                  onChange={() => handleToggleChange("enableReviews")}
                  className="rounded accent-[#F5A623] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <div className="text-xs font-semibold text-white">Enable Promotional Offers</div>
                  <div className="text-[10px] text-[#9B9B9B] mt-0.5">Show offers rail on shop</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableOffers}
                  onChange={() => handleToggleChange("enableOffers")}
                  className="rounded accent-[#F5A623] w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: General Settings & PIN Security */}
        <div className="md:col-span-2 space-y-6">
          {/* General Metadata form */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9B9B9B] flex items-center gap-2 mb-6 border-b border-[#1F1F1F] pb-3">
              <Globe size={14} className="text-[#F5A623]" /> General Store Settings
            </h2>
            <form onSubmit={handleSaveStoreSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Store Name</label>
                  <input
                    type="text"
                    required
                    value={config.storeName}
                    onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2 text-xs text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Store Tagline</label>
                  <input
                    type="text"
                    required
                    value={config.tagline}
                    onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2 text-xs text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2 text-xs text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2 text-xs text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Store Address</label>
                <textarea
                  required
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl p-3 text-xs text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] h-16 resize-none transition-colors"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-bold bg-[#F5A623] hover:bg-[#d4891a] text-[#111111] transition-all"
                >
                  <Save size={13} /> Save Store Details
                </button>
              </div>
            </form>
          </div>

          {/* Security PIN form */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9B9B9B] flex items-center gap-2 mb-6 border-b border-[#1F1F1F] pb-3">
              <Shield size={14} className="text-red-500" /> Admin Security PIN
            </h2>
            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Current PIN</label>
                  <div className="relative">
                    <input
                      type={showPins ? "text" : "password"}
                      required
                      maxLength={8}
                      placeholder="••••"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2 text-xs text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] pr-8 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPins(!showPins)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      aria-label="Toggle password view"
                    >
                      {showPins ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">New PIN</label>
                  <input
                    type={showPins ? "text" : "password"}
                    required
                    maxLength={8}
                    placeholder="Min 4 digits"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2 text-xs text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9B9B9B] block mb-1">Confirm New PIN</label>
                  <input
                    type={showPins ? "text" : "password"}
                    required
                    maxLength={8}
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl px-4 py-2 text-xs text-[#F5F0EB] focus:outline-none focus:border-[#F5A623] transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/30 transition-all animate-pulse"
                >
                  <Key size={13} /> Update Security PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
