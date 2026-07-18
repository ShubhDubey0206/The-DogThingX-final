"use client";
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

function getTimeLeft(targetDate: string) {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    seconds: Math.floor((total / 1000) % 60),
    minutes: Math.floor((total / 1000 / 60) % 60),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
  };
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft(targetDate);
      setTimeLeft(t);
      if (t.total <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return <span className="text-red-500 font-semibold text-sm">Offer Expired</span>;
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-end gap-2" data-testid="countdown-timer">
      {[
        { value: pad(timeLeft.days), label: "DD" },
        { value: pad(timeLeft.hours), label: "HH" },
        { value: pad(timeLeft.minutes), label: "MM" },
        { value: pad(timeLeft.seconds), label: "SS" },
      ].map((unit, i) => (
        <div key={unit.label} className="flex items-end gap-1">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold leading-none">{unit.value}</div>
            <div className="text-xs mt-0.5 opacity-70">{unit.label}</div>
          </div>
          {i < 3 && <span className="font-mono text-xl font-bold pb-3">:</span>}
        </div>
      ))}
    </div>
  );
}
