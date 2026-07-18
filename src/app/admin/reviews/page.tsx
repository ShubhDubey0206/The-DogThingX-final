"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteReview, getAllReviews, updateReviewStatus, type Review, type ReviewStatus } from "@/lib/storage";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await getAllReviews();
        if (!active) return;
        setReviews(data);
      } catch (error) {
        console.error("Failed to load reviews", error);
        if (active) {
          toast.error("Unable to load client reviews from Supabase.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReviews();
    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (reviewId: string, status: ReviewStatus) => {
    try {
      await updateReviewStatus(reviewId, status);
      setReviews((prev) => prev.map((review) => (review.reviewId === reviewId ? { ...review, status } : review)));
      toast.success("Review status updated.");
    } catch (error) {
      console.error("Failed to update review status", error);
      toast.error("Unable to update the review status.");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.reviewId !== reviewId));
      toast.success("Review deleted.");
    } catch (error) {
      console.error("Failed to delete review", error);
      toast.error("Unable to delete the review.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F0EB]">Reviews</h1>
        <p className="text-sm text-[#9B9B9B] mt-1">Review user feedback and moderate new submissions.</p>
      </div>

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-sm text-[#9B9B9B]">No reviews found.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.reviewId} className="rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[#F5F0EB]">{review.itemName}</p>
                  <p className="text-sm text-[#9B9B9B]">{review.text}</p>
                  <p className="text-xs text-[#9B9B9B] mt-1">By {review.userEmail}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(review.reviewId, "approved")}
                    className="rounded-lg bg-emerald-600/20 px-3 py-2 text-sm font-semibold text-emerald-400"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(review.reviewId, "rejected")}
                    className="rounded-lg bg-red-600/20 px-3 py-2 text-sm font-semibold text-red-400"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.reviewId)}
                    className="rounded-lg bg-[#1F1F1F] px-3 py-2 text-sm font-semibold text-[#F5F0EB]"
                  >
                    Delete
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
