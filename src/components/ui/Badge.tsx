"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-primary/10 text-primary",
        variant === "outline" && "border border-border",
        variant === "destructive" && "bg-destructive/10 text-destructive",
        className
      )}
    >
      {children}
    </span>
  );
}
