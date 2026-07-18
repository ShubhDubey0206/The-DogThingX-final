"use client";
import { OrderStatus, AdoptionStatus } from "@/lib/storage";

type StatusBadgeProps =
  | { status: OrderStatus; type: "order" }
  | { status: AdoptionStatus; type: "adoption" };

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "out-for-delivery": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ADOPTION_STATUS_STYLES: Record<AdoptionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "under-review": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const styles =
    type === "order"
      ? ORDER_STATUS_STYLES[status as OrderStatus]
      : ADOPTION_STATUS_STYLES[status as AdoptionStatus];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${styles}`}>
      {status.replace(/-/g, " ")}
    </span>
  );
}
