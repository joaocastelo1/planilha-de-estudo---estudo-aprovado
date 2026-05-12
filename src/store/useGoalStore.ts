import { create } from "zustand";
import { db, type WeeklyGoal, type DailyStats } from "@/lib/db";
import { startOfWeek, format } from "date-fns";

interface GoalState {
  weeklyGoals: WeeklyGoal[];
  dailyChecklist: { id: string; title: string; completed: boolean }[];
  isLoading: boolean;

  fetchGoals: () => Promise<void>;
  updateWeeklyGoal: (targetMinutes: number) => Promise<void>;
  toggleChecklistItem: (id: string) => void;
  getWeeklyProgress: () => number;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  weeklyGoals: [],
  dailyChecklist: [
    { id: "1", title: "Completar 1 Revisão", completed: false },
    { id: "2", title: "Bater meta de questões", completed: false },
    { id: "3", title: "Estudar 1 tópico novo", completed: false },
    { id: "4", title: "Limpar caixa de entrada", completed: false },
  ],
  isLoading: false,

  fetchGoals: async () => {
    set({ isLoading: true });
    const goals = await db.weeklyGoals.toArray();
    set({ weeklyGoals: goals, isLoading: false });
  },

  updateWeeklyGoal: async (targetMinutes) => {
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const existing = await db.weeklyGoals.where("weekStart").equals(weekStart).first();

    if (existing) {
      await db.weeklyGoals.update(existing.id!, { targetMinutes });
    } else {
      await db.weeklyGoals.add({
        weekStart,
        targetMinutes,
        completedMinutes: 0,
        status: "IN_PROGRESS",
        createdAt: Date.now(),
      });
    }
    await get().fetchGoals();
  },

  toggleChecklistItem: (id) => {
    set((state) => ({
      dailyChecklist: state.dailyChecklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  },

  getWeeklyProgress: () => {
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const goal = get().weeklyGoals.find(g => g.weekStart === weekStart);
    if (!goal || goal.targetMinutes === 0) return 0;
    return Math.min(100, Math.round((goal.completedMinutes / goal.targetMinutes) * 100));
  }
}));
