"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "green" | "blue" | "orange" | "red";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  color = "primary",
  showLabel = true,
  label,
  animated = true,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: "h-1",
    md: "h-2.5",
    lg: "h-4"
  };

  const colors = {
    primary: "bg-primary",
    green: "bg-emerald-500",
    blue: "bg-blue-500",
    orange: "bg-amber-500",
    red: "bg-rose-500",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center px-0.5">
          {label && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-[10px] font-bold text-primary ml-auto">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-muted/40 rounded-full overflow-hidden p-0.5 border border-border/5", sizes[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all ease-out",
            colors[color],
            animated && "duration-700"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
