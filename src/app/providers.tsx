"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import ThemeProvider from "@/components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useUIStore();
  const { checkAuth, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    checkAuth();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
