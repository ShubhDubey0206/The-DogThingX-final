"use client";
import Link from "next/link";
import { CountdownTimer } from "@/components/CountdownTimer";

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

const RAIL_OFFERS = [
  { label: "Dog Food 20% off", date: addDays(3), category: "food" },
  { label: "Free delivery on ₹1500+", date: addDays(7), category: "accessories" },
  { label: "Aquarium kits 15% off", date: addDays(5), category: "accessories" },
];

export function OffersRail() {
  return (
    <div className="mb-8 space-y-3">
      {RAIL_OFFERS.map((offer) => (
        <div
          key={offer.label}
          className="flex items-center justify-between gap-4 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl px-4 py-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-semibold text-[#F5A623]">{offer.label}</span>
            <span className="hidden sm:block text-muted-foreground">|</span>
            <CountdownTimer targetDate={offer.date} />
          </div>
          <Link
            href={`/shop?category=${offer.category}`}
            className="shrink-0 bg-[#F5A623] text-[#111111] rounded-full px-3 py-1 text-xs font-bold hover:bg-[#d4891a] transition-all active:scale-95"
          >
            Shop
          </Link>
        </div>
      ))}
    </div>
  );
}
