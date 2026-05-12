import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db, getPendingRevisions } from "@/lib/db";
import { useAuthStore } from "./authStore";

interface UIState {
  theme: "dark" | "light";
  isSidebarOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      isSidebarOpen: true,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: "estudo-aprovado-ui",
    }
  )
);

interface AlertState {
  unreadAlerts: number;
  refreshAlerts: () => Promise<void>;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      unreadAlerts: 0,
      refreshAlerts: async () => {
        const alerts = await getPendingRevisions();
        set({ unreadAlerts: alerts.length });
      },
    }),
    {
      name: "estudo-aprovado-alerts",
    }
  )
);

interface StudyState {
  sessionTime: number;
  addTime: (time: number) => void;
  resetTime: () => void;
}

export const useStudyTimerStore = create<StudyState>((set) => ({
  sessionTime: 0,
  addTime: (time) =>
    set((state) => ({ sessionTime: state.sessionTime + time })),
  resetTime: () => set({ sessionTime: 0 }),
}));
