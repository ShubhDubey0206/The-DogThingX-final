"use client";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export function EmptyState({ icon: Icon, title, subtitle, buttonLabel, onButtonClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
        <Icon size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{subtitle}</p>
      {buttonLabel && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="bg-[#F5A623] text-[#111111] rounded-full px-6 py-2.5 text-sm font-bold hover:bg-[#d4891a] active:scale-95 transition-all"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
