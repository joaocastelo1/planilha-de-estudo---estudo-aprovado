import Dexie, { Table } from "dexie";

/* ============================================================
   ESTUDO APROVADO - DATABASE SCHEMA (Consolidated)
   Focus: Public Exam Preparation (Concursos Públicos)
   Architecture: Offline-first with Dexie.js
   ============================================================ */

/* ─── Types & Enums ────────────────────────────────────────── */
export type SubjectCategory =
  | "TI"
  | "PORTUGUES"
  | "DIREITO"
  | "MATEMATICA"
  | "CONHECIMENTOS_GERAIS"
  | "INFORMES"
  | "OUTROS";

export type ConcursoCategory = SubjectCategory;
export type TaskStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";
export type TaskPriority = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

/* ─── User ─────────────────────────── */
export interface User {
  id?: number;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  joinedAt: number;
  streak: number;
  lastStudyDate?: string;
  preferences: {
    theme: "dark" | "light";
    pomodoroTime: number;
    breakTime: number;
    dailyStudyGoal: number;
  };
  plan: "free" | "pro" | "premium";
  subscriptionExpiresAt?: number;
  isActive: number; // 1 for true, 0 for false
  createdAt: number;
  updatedAt: number;
}

/* ─── Subject ───────────────── */
export interface Subject {
  id?: number;
  userId?: number;
  name: string;
  category: SubjectCategory;
  color: string;
  icon: string;
  progress: number;
  difficulty: number | string;
  lastStudiedAt?: number;
  createdAt: number;
  updatedAt: number;
  totalTasks: number;
  completedTasks: number;
  estimatedHours: number;
  studiedHours: number;
  nextReviewDate?: number;
  revisionInterval?: number;
  lastRevisionAt?: number;
  revisionCount?: number;
  totalQuestions?: number;
  correctQuestions?: number;
}

/* ─── Study Task ─── */
export interface StudyTask {
  id?: number;
  userId?: number;
  subjectId?: number;
  title: string;
  description?: string;
  status: TaskStatus | string;
  priority: TaskPriority | string;
  scheduledDate?: string;
  dueDate?: number;
  estimatedMinutes?: number;
  actualMinutes?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
  order: number;
  questionsAttempted?: number;
  questionsCorrect?: number;
  notifyRevision1?: boolean;
  notifyRevision7?: boolean;
  notifyRevision30?: boolean;
}

/* ─── Notification ─── */
export interface Notification {
  id?: number;
  userId?: number;
  type: "REVISION_DUE" | "TASK_DUE" | "STREAK_REMINDER" | "SYSTEM";
  title: string;
  message: string;
  relatedId?: number;
  isRead: boolean | number;
  isDismissed: boolean | number;
  createdAt: number;
  scheduledFor?: number;
}

/* ─── Revision Alert ─── */
export interface RevisionAlert {
  id?: number;
  userId?: number;
  taskId?: number;
  subjectId: number;
  type: string;
  scheduledFor: number;
  alertDate: string | number;
  status: string;
  isRead: boolean | number;
  isDismissed?: boolean | number;
  isNotified?: boolean | number;
  message?: string;
  completedAt?: number;
  createdAt: number;
  interval?: number;
  repetitions?: number;
  easeFactor?: number;
}

export type Revision = RevisionAlert;
export type Task = StudyTask;

/* ─── Topic ─── */
export interface Topic {
  id?: number;
  subjectId: number;
  name: string;
  content: string;
  status: string;
  difficulty: string;
  importance: number;
  createdAt: number;
  updatedAt: number;
  totalQuestions?: number;
  correctQuestions?: number;
}

/* ─── Question Performance ─── */
export interface QuestionPerformance {
  id?: number;
  userId?: number;
  subjectId: number;
  topicId?: number;
  totalQuestions: number;
  correctQuestions: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

/* ─── Flashcard ─── */
export interface Flashcard {
  id?: number;
  topicId: number;
  question: string;
  answer: string;
  nextReview: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  createdAt: number;
  updatedAt: number;
}

/* ─── Note ─── */
export interface Note {
  id?: number;
  userId?: number;
  subjectId?: number;
  title: string;
  content: string;
  tags: string[];
  links: number[];
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

/* ─── Daily Stats ─── */
export interface DailyStats {
  id?: number;
  userId?: number;
  date: string;
  minutesStudied: number;
  tasksCompleted: number;
  revisionsDone: number;
  studyTimeMinutes: number;
  streakDay: boolean;
  createdAt: number;
  totalQuestions?: number;
  correctQuestions?: number;
  topicsStudied?: number;
  performanceScore?: number;
}

/* ─── Mind Map ─── */
export interface MindMap {
  id?: number;
  userId?: number;
  subjectId: number;
  topicId?: number;
  title: string;
  imageUrl?: string;
  content?: string; // For textual description or JSON representation
  createdAt: number;
  updatedAt: number;
}

/* ─── Weekly Goal ─── */
export interface WeeklyGoal {
  id?: number;
  userId?: number;
  weekStart: string; // YYYY-MM-DD (Monday)
  targetMinutes: number;
  completedMinutes: number;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: number;
}

export type StudyGoal = WeeklyGoal;

/* ─── Study Plan ─── */
export interface StudyPlan {
  id?: number;
  userId?: number;
  name: string;
  description?: string;
  subjects: number[]; // Subject IDs
  startDate: string;
  endDate: string;
  createdAt: number;
  updatedAt: number;
}

/* ─── Study Session ─── */
export interface StudySession {
  id?: number;
  userId?: number;
  taskId?: number;
  subjectId?: number;
  startTime: number;
  endTime?: number;
  duration: number;
  type: "pomodoro" | "focus" | "normal";
  createdAt: number;
  questionsAttempted?: number;
  questionsCorrect?: number;
}

/* ─── Database Class ───────────────────────────────────────── */
class StudyDB extends Dexie {
  users!: Table<User>;
  subjects!: Table<Subject>;
  tasks!: Table<StudyTask>;
  revisions!: Table<Revision>;
  topics!: Table<Topic>;
  flashcards!: Table<Flashcard>;
  notes!: Table<Note>;
  dailyStats!: Table<DailyStats>;
  studySessions!: Table<StudySession>;
  notifications!: Table<Notification>;
  questionPerformance!: Table<QuestionPerformance>;
  weeklyGoals!: Table<WeeklyGoal>;
  mindMaps!: Table<MindMap>;
  studyPlans!: Table<StudyPlan>;
  revisionAlerts!: Table<Revision>; // Alias for compatibility
  performanceLogs!: Table<QuestionPerformance>; // Alias for compatibility
  goals!: Table<WeeklyGoal>; // Alias for compatibility
  syncQueue!: Table<any>; // For offline sync

  constructor() {
    super("StudyAprovadoDB");

    this.version(4).stores({
      users: "++id, email, plan, isActive, createdAt",
      subjects: "++id, userId, category, lastStudiedAt, createdAt",
      tasks: "++id, userId, subjectId, status, scheduledDate, priority, updatedAt, createdAt, dueDate",
      revisions: "++id, userId, taskId, subjectId, scheduledFor, status, reviewDate, createdAt",
      topics: "++id, subjectId, status, createdAt",
      flashcards: "++id, topicId, nextReview, createdAt",
      notes: "++id, userId, title, subjectId, isPinned, *tags, createdAt",
      dailyStats: "++id, userId, date, createdAt",
      studySessions: "++id, userId, taskId, subjectId, startTime, createdAt",
      notifications: "++id, userId, type, isRead, isDismissed, createdAt",
      questionPerformance: "++id, userId, subjectId, topicId, date, createdAt",
      weeklyGoals: "++id, userId, weekStart, status, createdAt",
      mindMaps: "++id, subjectId, topicId, createdAt",
      studyPlans: "++id, userId, startDate, endDate, createdAt",
      syncQueue: "++id, entity, operation, synced, timestamp",
    });

    this.revisionAlerts = this.table("revisions");
    this.performanceLogs = this.table("questionPerformance");
    this.goals = this.table("weeklyGoals");
    this.syncQueue = this.table("syncQueue");
  }
}

export const db = new StudyDB();

/* ─── Helper Functions ─────────────────────────────────────── */
export async function getPendingRevisions(): Promise<Revision[]> {
  const now = Date.now();
  return await db.revisions
    .where("status")
    .equals("PENDENTE")
    .and((r) => r.scheduledFor <= now)
    .toArray();
}

export async function markRevisionAsRead(id: number): Promise<void> {
  await db.revisions.update(id, {
    isRead: 1,
    status: "CONCLUIDA",
    completedAt: Date.now(),
  });
}

export const CATEGORY_LABELS: Record<SubjectCategory, string> = {
  TI: "Tecnologia da Informação",
  PORTUGUES: "Língua Portuguesa",
  DIREITO: "Direito",
  MATEMATICA: "Matemática / RLM",
  CONHECIMENTOS_GERAIS: "Conhecimentos Gerais",
  INFORMES: "Informativos / Jurisprudência",
  OUTROS: "Outras Matérias",
};

export const CATEGORY_COLORS: Record<SubjectCategory, { bar: string; text: string; bg: string }> = {
  TI: { bar: "#8b5cf6", text: "text-purple-400", bg: "bg-purple-500/10" },
  PORTUGUES: { bar: "#3b82f6", text: "text-blue-400", bg: "bg-blue-500/10" },
  DIREITO: { bar: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10" },
  MATEMATICA: { bar: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  CONHECIMENTOS_GERAIS: { bar: "#f97316", text: "text-orange-400", bg: "bg-orange-500/10" },
  INFORMES: { bar: "#06b6d4", text: "text-cyan-400", bg: "bg-cyan-500/10" },
  OUTROS: { bar: "#64748b", text: "text-slate-400", bg: "bg-slate-500/10" },
};

export const DEFAULT_SUBJECTS = [
  { name: "Língua Portuguesa", category: "PORTUGUES" as SubjectCategory, color: "#3b82f6", icon: "📚" },
  { name: "Matemática / RLM", category: "MATEMATICA" as SubjectCategory, color: "#10b981", icon: "🔢" },
  { name: "Direito Administrativo", category: "DIREITO" as SubjectCategory, color: "#f59e0b", icon: "⚖️" },
  { name: "Direito Constitucional", category: "DIREITO" as SubjectCategory, color: "#ef4444", icon: "🏛️" },
  { name: "Informática / TI", category: "TI" as SubjectCategory, color: "#8b5cf6", icon: "💻" },
  { name: "Conhecimentos Gerais", category: "CONHECIMENTOS_GERAIS" as SubjectCategory, color: "#f97316", icon: "🌍" },
];
