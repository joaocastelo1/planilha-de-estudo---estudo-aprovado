import { create } from "zustand";
import { db, type StudyTask, type Subject, type Revision } from "@/lib/db";
import { getTodayStr } from "@/lib/utils";
import { format } from "date-fns";

interface TaskState {
  tasks: StudyTask[];
  subjects: Subject[];
  revisions: Revision[];
  loading: boolean;

  fetchTasks: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  fetchRevisions: () => Promise<void>;

  addTask: (task: Omit<StudyTask, "id" | "createdAt" | "updatedAt" | "order">) => Promise<number>;
  updateTask: (id: number, updates: Partial<StudyTask>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  completeTask: (id: number) => Promise<void>;

  addSubject: (subject: Omit<Subject, "id" | "createdAt" | "totalTasks" | "completedTasks" | "studiedHours" | "progress">) => Promise<number>;
  updateSubject: (id: number, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: number) => Promise<void>;

  scheduleRevision: (taskId: number, subjectId: number) => Promise<void>;
  completeRevision: (revisionId: number) => Promise<void>;

  getPendingRevisions: () => Revision[];
  getTasksDueToday: () => StudyTask[];
  getOverdueTasks: () => StudyTask[];
  getSubjectProgress: (subjectId: number) => { total: number; completed: number; percentage: number; };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  subjects: [],
  revisions: [],
  loading: false,

  fetchTasks: async () => {
    const tasks = await db.tasks.toArray();
    set({ tasks });
  },

  fetchSubjects: async () => {
    const subjects = await db.subjects.toArray();
    set({ subjects });
  },

  fetchRevisions: async () => {
    const revisions = await db.revisions.toArray();
    set({ revisions });
  },

  addTask: async (task) => {
    const tasks = get().tasks;
    const order = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) + 1 : 0;
    const now = Date.now();
    const newTask: StudyTask = {
      ...task,
      createdAt: now,
      updatedAt: now,
      order,
      dueDate: task.scheduledDate ? new Date(task.scheduledDate).getTime() : undefined,
    };
    const id = await db.tasks.add(newTask);
    await get().fetchTasks();

    if (task.dueDate && task.subjectId) {
      await get().scheduleRevision(id as number, task.subjectId);
    }

    return id as number;
  },

  updateTask: async (id, updates) => {
    await db.tasks.update(id, { ...updates, updatedAt: Date.now() });
    await get().fetchTasks();
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id);
    await db.revisions.where({ taskId: id }).delete();
    await get().fetchTasks();
    await get().fetchRevisions();
  },

  completeTask: async (id) => {
    const now = Date.now();
    await db.tasks.update(id, {
      status: "CONCLUIDA",
      completedAt: now,
      updatedAt: now,
    });

    const task = await db.tasks.get(id);
    if (task && task.subjectId) {
      await db.subjects.update(task.subjectId, {
        completedTasks: await db.tasks.where({ subjectId: task.subjectId, status: "CONCLUIDA" }).count(),
        totalTasks: await db.tasks.where({ subjectId: task.subjectId }).count(),
      });

      await db.dailyStats.put({
        userId: task.userId,
        date: getTodayStr(),
        minutesStudied: task.actualMinutes || 0,
        tasksCompleted: 1,
        revisionsDone: 0,
        studyTimeMinutes: task.actualMinutes || 0,
        streakDay: true,
        createdAt: now,
      } as import("@/lib/db").DailyStats);
    }

    await get().fetchTasks();
    await get().fetchSubjects();
  },

  addSubject: async (subject) => {
    const now = Date.now();
    const newSubject: Subject = {
      ...subject,
      createdAt: now,
      totalTasks: 0,
      completedTasks: 0,
      studiedHours: 0,
      progress: 0,
    };
    const id = await db.subjects.add(newSubject);
    await get().fetchSubjects();
    return id as number;
  },

  updateSubject: async (id, updates) => {
    await db.subjects.update(id, updates);
    await get().fetchSubjects();
  },

  deleteSubject: async (id) => {
    await db.subjects.delete(id);
    await db.tasks.where({ subjectId: id }).delete();
    await db.revisions.where({ subjectId: id }).delete();
    await get().fetchSubjects();
    await get().fetchTasks();
    await get().fetchRevisions();
  },

  scheduleRevision: async (taskId, subjectId) => {
    const now = Date.now();
    const intervals = [1, 7, 30];

    for (const days of intervals) {
      await db.revisions.add({
        taskId,
        subjectId,
        scheduledFor: now + days * 24 * 60 * 60 * 1000,
        alertDate: format(now + days * 24 * 60 * 60 * 1000, "yyyy-MM-dd"),
        status: "PENDENTE",
        isRead: 0,
        createdAt: now,
      } as import("@/lib/db").Revision);
    }

    await get().fetchRevisions();
  },

  completeRevision: async (revisionId) => {
    await db.revisions.update(revisionId, {
      status: "CONCLUIDA",
      completedAt: Date.now(),
    });
    await get().fetchRevisions();
  },

  getPendingRevisions: () => {
    const { revisions } = get();
    return revisions.filter((r) => r.status === "PENDENTE" && r.scheduledFor <= Date.now());
  },

  getTasksDueToday: () => {
    const { tasks } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(
      (t) =>
        t.status !== "CONCLUIDA" &&
        t.dueDate &&
        t.dueDate >= today.getTime() &&
        t.dueDate < tomorrow.getTime()
    );
  },

  getOverdueTasks: () => {
    const { tasks } = get();
    const now = Date.now();
    return tasks.filter((t) => t.status !== "CONCLUIDA" && t.dueDate && t.dueDate < now);
  },

  getSubjectProgress: (subjectId) => {
    const { tasks } = get();
    const subjectTasks = tasks.filter((t) => t.subjectId === subjectId);
    const total = subjectTasks.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = subjectTasks.filter((t) => t.status === "CONCLUIDA").length;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  },
}));
