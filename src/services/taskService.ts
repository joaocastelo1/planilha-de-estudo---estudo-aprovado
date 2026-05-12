import { db } from "@/lib/db";
import type { StudyTask } from "@/lib/db";
import { addDays, format } from "date-fns";

/* ============================================================
   TASK SERVICE - Full CRUD operations for study tasks
   ============================================================ */

export async function createTask(task: Omit<StudyTask, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const now = Date.now();
  const taskWithTimestamps = {
    ...task,
    createdAt: now,
    updatedAt: now,
    notifyRevision1: task.notifyRevision1 ?? true,
    notifyRevision7: task.notifyRevision7 ?? true,
    notifyRevision30: task.notifyRevision30 ?? true,
  };

  const id = await db.tasks.add(taskWithTimestamps);

  // Schedule revision alerts if dueDate is set
  if (task.dueDate) {
    const dueDateStr = new Date(task.dueDate).toISOString().split('T')[0];
    await scheduleRevisionAlerts(id, dueDateStr, task.subjectId);
  }

  // Add to sync queue (offline-first)
  await db.syncQueue.add({
    entity: "task",
    entityId: id,
    operation: "CREATE",
    payload: taskWithTimestamps,
    timestamp: now,
    synced: false,
  });

  return id;
}

export async function updateTask(id: number, updates: Partial<StudyTask>): Promise<void> {
  const now = Date.now();
  await db.tasks.update(id, { ...updates, updatedAt: now });

  await db.syncQueue.add({
    entity: "task",
    entityId: id,
    operation: "UPDATE",
    payload: updates,
    timestamp: now,
    synced: false,
  });
}

export async function deleteTask(id: number): Promise<void> {
  await db.tasks.delete(id);

  await db.syncQueue.add({
    entity: "task",
    entityId: id,
    operation: "DELETE",
    payload: { id },
    timestamp: Date.now(),
    synced: false,
  });
}

export async function completeTask(id: number): Promise<void> {
  const now = Date.now();
  await db.tasks.update(id, {
    status: "CONCLUIDA",
    completedAt: now,
    updatedAt: now,
  });

  // Update daily stats
  const task = await db.tasks.get(id);
  if (task?.subjectId) {
    await updateDailyStats(task.subjectId, { tasksCompleted: 1 });
  }
}

export async function getTasks(filters?: {
  status?: StudyTask["status"];
  priority?: StudyTask["priority"];
  subjectId?: number;
  dueBefore?: string;
}): Promise<StudyTask[]> {
  let query = db.tasks.toCollection();

  if (filters?.status) {
    query = query.filter(t => t.status === filters.status) as any;
  }
  if (filters?.priority) {
    query = query.filter(t => t.priority === filters.priority) as any;
  }
  if (filters?.subjectId) {
    query = query.filter(t => t.subjectId === filters.subjectId) as any;
  }
  if (filters?.dueBefore) {
    const dueTime = new Date(filters.dueBefore).getTime();
    query = query.filter(t => t.dueDate !== undefined && t.dueDate <= dueTime) as any;
  }

  return query.toArray();
}

export async function getDueTasks(): Promise<StudyTask[]> {
  const now = Date.now();
  return db.tasks
    .where("dueDate")
    .belowOrEqual(now)
    .filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED")
    .toArray();
}

/* ============================================================
   REVISION ALERTS - Spaced repetition (1/7/30 days)
   ============================================================ */

async function scheduleRevisionAlerts(taskId: number, dueDate: string, subjectId?: number): Promise<void> {
  const baseDate = new Date(dueDate);

  const alerts = [
    { type: "1_DAY" as const, days: 1 },
    { type: "7_DAYS" as const, days: 7 },
    { type: "30_DAYS" as const, days: 30 },
  ];

  for (const { type, days } of alerts) {
    const alertDate = format(addDays(baseDate, days), "yyyy-MM-dd");
    const scheduledFor = addDays(baseDate, days).getTime();
    await db.revisionAlerts.add({
      taskId,
      subjectId: subjectId || 0,
      type,
      alertDate,
      scheduledFor,
      status: "PENDENTE",
      message: `Revisar: ${type === "1_DAY" ? "amanhã (1 dia)" : type === "7_DAYS" ? "em 7 dias" : "em 30 dias"}`,
      isRead: false,
      isNotified: false,
      isDismissed: false,
      createdAt: Date.now(),
    });
  }
}

export async function getPendingRevisionAlerts(): Promise<any[]> {
  const today = format(new Date(), "yyyy-MM-dd");
  return db.revisionAlerts
    .where("alertDate")
    .equals(today)
    .filter(a => !a.isRead && !a.isDismissed)
    .toArray();
}

export async function dismissAlert(alertId: number): Promise<void> {
  await db.revisionAlerts.update(alertId, { isDismissed: true });
}

export async function markAlertAsRead(alertId: number): Promise<void> {
  await db.revisionAlerts.update(alertId, { isRead: true, isNotified: true });
}

/* ============================================================
   DAILY STATS - For evolution charts
   ============================================================ */

async function updateDailyStats(subjectId: number, updates: {
  tasksCompleted?: number;
  minutesStudied?: number;
  topicsStudied?: number;
  performanceScore?: number;
}): Promise<void> {
  const today = format(new Date(), "yyyy-MM-dd");
  const existing = await db.dailyStats.where("date").equals(today).first();

  if (existing) {
    await db.dailyStats.update(existing.id!, {
      tasksCompleted: (existing.tasksCompleted || 0) + (updates.tasksCompleted || 0),
      minutesStudied: (existing.minutesStudied || 0) + (updates.minutesStudied || 0),
      topicsStudied: (existing.topicsStudied || 0) + (updates.topicsStudied || 0),
      performanceScore: updates.performanceScore || existing.performanceScore,
    });
  } else {
    await db.dailyStats.add({
      date: today,
      userId: 1,
      minutesStudied: updates.minutesStudied || 0,
      tasksCompleted: updates.tasksCompleted || 0,
      revisionsDone: 0,
      studyTimeMinutes: updates.minutesStudied || 0,
      streakDay: true,
      topicsStudied: updates.topicsStudied || 0,
      performanceScore: updates.performanceScore || 0,
      createdAt: Date.now(),
    });
  }

  // Also log to performance log
  await db.performanceLogs.add({
    subjectId,
    date: today,
    totalQuestions: updates.tasksCompleted || 0,
    correctQuestions: updates.tasksCompleted || 0, // Simplified for legacy compatibility
    createdAt: Date.now(),
  });
}

/* ============================================================
   STUDY GOALS - Daily/Weekly/Monthly targets
   ============================================================ */

export async function createGoal(goal: any): Promise<number> {
  const id = await db.goals.add({ ...goal, createdAt: Date.now() });
  return id;
}

export async function updateGoalProgress(goalId: number, increment: number): Promise<void> {
  const goal = await db.goals.get(goalId);
  if (goal) {
    const newCurrent = goal.completedMinutes + increment;
    await db.goals.update(goalId, {
      completedMinutes: newCurrent,
      status: newCurrent >= goal.targetMinutes ? "COMPLETED" : "IN_PROGRESS",
    });
  }
}

export async function getActiveGoals(): Promise<any[]> {
  return db.goals.where("status").equals("IN_PROGRESS").toArray();
}
