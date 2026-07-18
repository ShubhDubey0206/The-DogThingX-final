"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AdoptionRequest, AdoptionStatus, getAdoptionRequests } from "@/lib/storage";
import { AdoptionRequestCard } from "@/components/adoptions/AdoptionRequestCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Footer } from "@/components/Footer";

const STATUS_TABS: { label: string; value: AdoptionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Under Review", value: "under-review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Completed", value: "completed" },
];

export default function AdoptionsPage() {
  const router = useRouter();
  const { currentUser, isLoggedIn } = useAuth();
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [activeTab, setActiveTab] = useState<AdoptionStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/"); return; }
    if (!currentUser?.email) return;
    const email = currentUser.email;
    setLoading(true);
    getAdoptionRequests(email)
      .then((data) => setRequests(data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [currentUser, isLoggedIn]);

  const filtered = activeTab === "all" ? requests : requests.filter((r) => r.status === activeTab);
  const countFor = (tab: AdoptionStatus | "all") => tab === "all" ? requests.length : requests.filter((r) => r.status === tab).length;

  const handleCancelled = (requestId: string) => {
    setRequests((prev) => prev.map((r) =>
      r.requestId === requestId
        ? { ...r, status: "rejected" as AdoptionStatus, statusHistory: [...r.statusHistory, { status: "rejected" as AdoptionStatus, timestamp: new Date().toISOString(), note: "Cancelled by user" }] }
        : r
    ));
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <nav aria-label="Breadcrumb" className="mb-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-[#F5A623] transition-colors">Home</Link>
            <span className="mx-2">›</span>
            <span>My Adoption Requests</span>
          </p>
        </nav>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-3xl font-extrabold">My Adoption Requests</h1>
          <p className="text-muted-foreground mt-1">Track the status of your pet adoption enquiries</p>
        </motion.div>
        <div role="tablist" aria-label="Adoption status filter" className="flex flex-wrap gap-2 mb-8">
          {STATUS_TABS.map((tab) => {
            const count = countFor(tab.value);
            return (
              <button key={tab.value} role="tab" aria-selected={activeTab === tab.value} onClick={() => setActiveTab(tab.value)} data-testid={`tab-adoptions-${tab.value}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeTab === tab.value ? "bg-[#F5A623] text-[#111111]" : "bg-card border border-border text-muted-foreground hover:border-[#F5A623] hover:text-[#F5A623]"}`}
              >
                {tab.label}
                {count > 0 && <span className={`ml-1.5 text-xs font-semibold ${activeTab === tab.value ? "text-[#111111]" : "text-muted-foreground"}`}>({count})</span>}
              </button>
            );
          })}
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={PawPrint} title="No adoption requests yet" subtitle={activeTab === "all" ? "Find your perfect companion on our pets page." : `No requests with status "${activeTab.replace(/-/g, " ")}".`} buttonLabel={activeTab === "all" ? "Browse Pets →" : "View all requests"} onButtonClick={() => activeTab === "all" ? router.push("/pets") : setActiveTab("all")} />
        ) : (
          <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="space-y-4">
            {filtered.map((req) => <AdoptionRequestCard key={req.requestId} request={req} onCancelled={handleCancelled} />)}
          </motion.div>
        )}
      </main>
      <Footer />
    </>
  );
}
