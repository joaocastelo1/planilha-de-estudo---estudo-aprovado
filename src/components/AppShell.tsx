"use client";

import { useUIStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useUIStore();

  return (
    <div
      className={cn(
        "app-shell",
        !isSidebarOpen && "sidebar-collapsed"
      )}
    >
      {children}
    </div>
  );
}
