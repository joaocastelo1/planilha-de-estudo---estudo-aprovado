"use client";

import { ReactNode, useEffect } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  theme: string;
}

export default function ThemeProvider({ children, theme }: ThemeProviderProps) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <>{children}</>;
}
