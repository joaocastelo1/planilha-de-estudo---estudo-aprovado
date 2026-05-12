import { create } from "zustand";
import { db, type QuestionPerformance, type Subject } from "@/lib/db";
import { startOfWeek, endOfWeek, format } from "date-fns";

interface PerformanceState {
  performanceLogs: QuestionPerformance[];
  weaknesses: { subject: Subject; accuracy: number }[];
  isLoading: boolean;

  fetchPerformance: () => Promise<void>;
  addLog: (log: Omit<QuestionPerformance, "id" | "createdAt">) => Promise<void>;
  getAccuracyBySubject: (subjectId: number) => number;
  getWeeklyStats: () => { total: number; correct: number; accuracy: number };
}

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  performanceLogs: [],
  weaknesses: [],
  isLoading: false,

  fetchPerformance: async () => {
    set({ isLoading: true });
    const logs = await db.questionPerformance.toArray();
    const subjects = await db.subjects.toArray();
    
    // Identify weaknesses (accuracy < 70%)
    const weaknesses = subjects.map(s => {
        const subLogs = logs.filter(l => l.subjectId === s.id);
        const total = subLogs.reduce((acc, l) => acc + l.totalQuestions, 0);
        const correct = subLogs.reduce((acc, l) => acc + l.correctQuestions, 0);
        const accuracy = total > 0 ? (correct / total) * 100 : 100;
        return { subject: s, accuracy };
    }).filter(w => w.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);

    set({ performanceLogs: logs, weaknesses, isLoading: false });
  },

  addLog: async (logData) => {
    const now = Date.now();
    await db.questionPerformance.add({
      ...logData,
      createdAt: now,
    });
    
    // Update Subject totals for quick access
    const subject = await db.subjects.get(logData.subjectId);
    if (subject) {
      await db.subjects.update(logData.subjectId, {
        totalQuestions: (subject.totalQuestions || 0) + logData.totalQuestions,
        correctQuestions: (subject.correctQuestions || 0) + logData.correctQuestions,
      });
    }

    await get().fetchPerformance();
  },

  getAccuracyBySubject: (subjectId) => {
    const logs = get().performanceLogs.filter(l => l.subjectId === subjectId);
    const total = logs.reduce((acc, l) => acc + l.totalQuestions, 0);
    const correct = logs.reduce((acc, l) => acc + l.correctQuestions, 0);
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  },

  getWeeklyStats: () => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    
    const weekLogs = get().performanceLogs.filter(l => {
        const d = new Date(l.date);
        return d >= start && d <= end;
    });

    const total = weekLogs.reduce((acc, l) => acc + l.totalQuestions, 0);
    const correct = weekLogs.reduce((acc, l) => acc + l.correctQuestions, 0);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, accuracy };
  }
}));
