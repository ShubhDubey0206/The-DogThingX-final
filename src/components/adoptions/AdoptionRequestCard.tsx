"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdoptionRequest, AdoptionStatus, cancelAdoptionRequest } from "@/lib/storage";
import { StatusBadge } from "@/components/orders/StatusBadge";

interface AdoptionRequestCardProps {
  request: AdoptionRequest;
  onCancelled: (requestId: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

const STATUS_NOTES: Record<string, string> = {
  pending: "Your enquiry has been received. We'll review and contact you shortly.",
  "under-review": "Prasad is reviewing your request. Expect a call within 24 hours.",
  approved: "Great news! Your adoption has been approved. Prasad will contact you to finalize.",
  rejected: "Unfortunately this pet is no longer available. Browse other pets.",
  completed: "Adoption complete! 🎉 Thank you for giving this pet a loving home.",
};
const HISTORY_DOT: Record<string, string> = {
  pending: "bg-yellow-500",
  "under-review": "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  completed: "bg-purple-500",
};

export function AdoptionRequestCard({ request, onCancelled }: AdoptionRequestCardProps) {
  const router = useRouter();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleCancel = () => {
    cancelAdoptionRequest(request.requestId);
    toast("Request cancelled.", { duration: 2000 });
    onCancelled(request.requestId);
    setConfirming(false);
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-card border border-card-border rounded-2xl p-5 space-y-4"
      data-testid={`card-adoption-${request.requestId}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-muted-foreground block">Request</span>
          <span className="font-semibold text-sm">{request.requestId}</span>
        </div>
        <StatusBadge status={request.status} type="adoption" />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted">
          <img src={request.petImage} alt={`${request.petName}, ${request.petBreed}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1552053831-71594a27632d?w=160&q=60"; }} />
          {(request.status === "rejected" || request.status === "completed") && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-bold px-1 text-center">{request.status === "completed" ? "Adopted" : "N/A"}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-lg font-bold truncate">{request.petName}</p>
          <p className="text-muted-foreground text-xs capitalize">{request.petSpecies} · {request.petBreed}</p>
          <p className={`font-semibold text-sm ${request.adoptionFee === 0 ? "text-green-600" : "text-[#F5A623]"}`}>
            {request.adoptionFee === 0 ? "Free" : `₹${request.adoptionFee.toLocaleString("en-IN")}`}
          </p>
          <p className="text-muted-foreground text-xs">Submitted: {formatDate(request.submittedAt)}</p>
        </div>
      </div>
      <p className="text-muted-foreground text-xs italic">{STATUS_NOTES[request.status]}</p>
      <div>
        <button onClick={() => setHistoryOpen(!historyOpen)} className="text-[#29ABE2] text-sm hover:underline">
          {historyOpen ? "Hide history ▲" : "View history ▼"}
        </button>
        <AnimatePresence>
          {historyOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden mt-3">
              <div className="space-y-2 pl-2 border-l-2 border-border">
                {request.statusHistory.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${HISTORY_DOT[entry.status] || "bg-muted"}`} />
                    <div>
                      <span className="text-xs font-semibold capitalize">{entry.status.replace(/-/g, " ")}</span>
                      <span className="text-muted-foreground text-xs ml-2">{formatDate(entry.timestamp)} {formatTime(entry.timestamp)}</span>
                      {entry.note && <p className="text-muted-foreground text-xs italic">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => router.push("/pets")} className="text-[#29ABE2] text-sm hover:underline">View Pet →</button>
        <div className="flex flex-col items-end gap-2">
          {(request.status === "pending" || request.status === "under-review") && (
            <>
              {!confirming ? (
                <button onClick={() => setConfirming(true)} data-testid={`button-cancel-${request.requestId}`} className="border border-red-400 text-red-500 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95">Cancel Request</button>
              ) : (
                <AnimatePresence>
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col items-end gap-1.5">
                    <p className="text-xs text-muted-foreground">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirming(false)} className="text-xs px-3 py-1.5 border border-border rounded-full hover:bg-card transition-all">Keep</button>
                      <button onClick={handleCancel} data-testid={`button-confirm-cancel-${request.requestId}`} className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all">Yes, cancel</button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
          {request.status === "approved" && (
            <a href="tel:9960878712" data-testid={`button-contact-${request.requestId}`} className="bg-green-500 text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-green-600 transition-all">Contact Prasad</a>
          )}
          {request.status === "rejected" && (
            <button onClick={() => router.push("/pets")} data-testid={`button-browse-pets-${request.requestId}`} className="border border-[#F5A623] text-[#F5A623] rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-[#F5A623] hover:text-[#111111] transition-all active:scale-95">Browse other pets →</button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
