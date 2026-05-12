"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  isLoading = false,
  className,
  children,
  leftIcon,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-[0.98]",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
        variant === "outline" && "border border-border bg-transparent hover:bg-muted/50",
        variant === "ghost" && "hover:bg-muted/50",
        size === "default" && "h-11 px-6 py-2",
        size === "sm" && "h-9 px-4",
        size === "lg" && "h-14 px-8",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin mr-2" />}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
}
