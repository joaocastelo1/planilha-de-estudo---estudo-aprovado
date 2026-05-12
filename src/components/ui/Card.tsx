"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass";
  hover?: boolean;
}

export function Card({ children, className, variant = "default", hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-border/40 bg-card shadow-sm",
        variant === "glass" && "bg-card/50 backdrop-blur-xl",
        hover && "hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg font-bold font-display", className)}>
      {children}
    </h3>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "red";
  trend?: { value: number; isPositive: boolean; label: string };
}

const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  red: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
};

export function StatCard({ title, value, icon, color = "blue", trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <Card className={`p-6 border-${color}-500/10`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-3xl font-black font-display mt-1 tracking-tight">{value}</p>
          {trend && (
            <p className={`text-[10px] font-bold ${trend.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
              {trend.isPositive ? "+" : "-"}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} ${c.border} border`}>
          <div className={c.text}>{icon}</div>
        </div>
      </div>
    </Card>
  );
}
