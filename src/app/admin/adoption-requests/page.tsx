"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAllAdoptionRequests,
  updateAdoptionStatus,
  type AdoptionRequest,
  type AdoptionStatus,
} from "@/lib/storage";

export default function AdminAdoptionRequestsPage() {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRequests = async () => {
      try {
        setLoading(true);
        const data = await getAllAdoptionRequests();
        if (!active) return;
        setRequests(data);
      } catch (error) {
        console.error("Failed to load adoption requests", error);
        if (active) {
          toast.error("Unable to load adoption requests from Supabase.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRequests();
    return () => {
      active = false;
    };
  }, []);

  const handleStatusUpdate = async (requestId: string, status: AdoptionStatus) => {
    try {
      await updateAdoptionStatus(requestId, status);
      setRequests((prev) =>
        prev.map((request) =>
          request.requestId === requestId
            ? {
                ...request,
                status,
                statusHistory: [
                  ...request.statusHistory,
                  {
                    status,
                    timestamp: new Date().toISOString(),
                    note: status === "approved" ? "Approved by admin" : "Rejected by admin",
                  },
                ],
              }
            : request
        )
      );
      toast.success(`Request marked as ${status}.`);
    } catch (error) {
      console.error("Failed to update adoption request", error);
      toast.error("Unable to update the adoption request.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5A623] mb-3" />
        <p className="text-sm text-[#9B9B9B]">Fetching adoption requests from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F0EB]">Adoption Requests</h1>
        <p className="text-sm text-[#9B9B9B] mt-1">Review applicant requests and update their status.</p>
      </div>

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-16 text-sm text-[#9B9B9B]">No adoption requests found.</div>
        ) : (
          requests.map((request) => (
            <div key={request.requestId} className="rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[#F5F0EB]">{request.petName}</p>
                  <p className="text-sm text-[#9B9B9B]">Applicant: {request.userEmail}</p>
                  <p className="text-xs text-[#9B9B9B] mt-1">Submitted: {new Date(request.submittedAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusUpdate(request.requestId, "approved")}
                    className="rounded-lg bg-emerald-600/20 px-3 py-2 text-sm font-semibold text-emerald-400"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(request.requestId, "rejected")}
                    className="rounded-lg bg-red-600/20 px-3 py-2 text-sm font-semibold text-red-400"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
