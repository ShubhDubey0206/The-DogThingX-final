import type { Order, AdoptionRequest, OrderStatus, AdoptionStatus } from "./storage";

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function getAllOrdersRaw(): Order[] {
  return readJson<Order>("dtx_orders");
}

export function getAllAdoptionRequestsRaw(): AdoptionRequest[] {
  return readJson<AdoptionRequest>("dtx_adoptions");
}

export function getTotalRevenue(): number {
  return getAllOrdersRaw()
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
}

export function getOrderCountByStatus(): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    confirmed: 0,
    processing: 0,
    "out-for-delivery": 0,
    delivered: 0,
    cancelled: 0,
  };
  getAllOrdersRaw().forEach((o) => {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  });
  return counts;
}

export function getAdoptionCountByStatus(): Record<AdoptionStatus, number> {
  const counts: Record<AdoptionStatus, number> = {
    pending: 0,
    "under-review": 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  };
  getAllAdoptionRequestsRaw().forEach((r) => {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  });
  return counts;
}

export function getUniqueCustomerCount(): number {
  const emails = new Set<string>();
  getAllOrdersRaw().forEach((o) => emails.add(o.userEmail));
  getAllAdoptionRequestsRaw().forEach((r) => emails.add(r.userEmail));
  return emails.size;
}

export function getRevenueByDay(month: number, year: number): { day: number; revenue: number }[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: { day: number; revenue: number }[] = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    revenue: 0,
  }));
  getAllOrdersRaw()
    .filter((o) => o.status !== "cancelled")
    .forEach((o) => {
      const d = new Date(o.placedAt);
      if (d.getMonth() + 1 === month && d.getFullYear() === year) {
        result[d.getDate() - 1].revenue += o.total;
      }
    });
  return result;
}

export function getRecentOrders(limit: number): Order[] {
  return getAllOrdersRaw()
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, limit);
}

export function getRecentAdoptionRequests(limit: number): AdoptionRequest[] {
  return getAllAdoptionRequestsRaw()
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, limit);
}

export function getNewCustomersThisMonth(): number {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const emailFirstSeen = new Map<string, Date>();

  [...getAllOrdersRaw()].forEach((o) => {
    const d = new Date(o.placedAt);
    const prev = emailFirstSeen.get(o.userEmail);
    if (!prev || d < prev) emailFirstSeen.set(o.userEmail, d);
  });
  [...getAllAdoptionRequestsRaw()].forEach((r) => {
    const d = new Date(r.submittedAt);
    const prev = emailFirstSeen.get(r.userEmail);
    if (!prev || d < prev) emailFirstSeen.set(r.userEmail, d);
  });

  let count = 0;
  emailFirstSeen.forEach((d) => {
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) count++;
  });
  return count;
}
