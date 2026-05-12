import { db } from "@/lib/db";
import { format } from "date-fns";

/* ============================================================
   NOTIFICATION SERVICE - Visual alerts & feedback system
   ============================================================ */

export interface AppNotification {
  id?: number;
  type: "REVISION_DUE" | "TASK_DUE" | "GOAL_REMINDER" | "STREAK_ALERT" | "CUSTOM";
  title: string;
  message: string;
  relatedId?: number;
  color: "blue" | "red" | "green" | "yellow" | "purple";
  icon: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export async function createNotification(
  type: AppNotification["type"],
  title: string,
  message: string,
  options?: {
    relatedId?: number;
    color?: AppNotification["color"];
    priority?: AppNotification["priority"];
  }
): Promise<number> {
  const notification: AppNotification = {
    type,
    title,
    message,
    relatedId: options?.relatedId,
    color: options?.color || getColorForType(type),
    icon: getIconForType(type),
    isRead: false,
    isDismissed: false,
    createdAt: Date.now(),
    priority: options?.priority || "MEDIUM",
  };

  return db.revisionAlerts.add(notification as any); // Reusing table
}

export async function getUnreadNotifications(): Promise<any[]> {
  return db.revisionAlerts
    .where("isRead")
    .equals(0)
    .filter(n => !n.isDismissed)
    .toArray();
}

export async function markNotificationRead(id: number): Promise<void> {
  await db.revisionAlerts.update(id, { isRead: true });
}

export async function dismissNotification(id: number): Promise<void> {
  await db.revisionAlerts.update(id, { isDismissed: true });
}

export async function checkAndCreateAlerts(): Promise<void> {
  const today = format(new Date(), "yyyy-MM-dd");

  // Check for due tasks
  const dueTasks = await db.tasks
    .where("dueDate")
    .belowOrEqual(today)
    .filter(t => t.status !== "COMPLETED")
    .toArray();

  for (const task of dueTasks) {
    const existing = await db.revisionAlerts
      .where("relatedId")
      .equals(task.id!)
      .filter(a => a.type === "TASK_DUE" && !a.isDismissed)
      .first();

    if (!existing) {
      await createNotification(
        "TASK_DUE",
        "Tarefa Atrasada",
        `A tarefa "${task.title}" está atrasada!`,
        { relatedId: task.id, color: "red", priority: "HIGH" }
      );
    }
  }

  // Check for revision alerts (1, 7, 30 days)
  const pendingAlerts = await db.revisionAlerts
    .where("alertDate")
    .equals(today)
    .filter(a => !a.isRead && !a.isDismissed)
    .toArray();

  for (const alert of pendingAlerts) {
    const task = alert.taskId ? await db.tasks.get(alert.taskId) : null;
    await createNotification(
      "REVISION_DUE",
      getRevisionTitle(alert.type),
      task?.title ? `Hora de revisar: ${task.title}` : (alert.message || "Hora de revisar"),
      { relatedId: alert.id, color: "yellow", priority: "MEDIUM" }
    );
  }
}

function getRevisionTitle(type: string): string {
  switch (type) {
    case "1_DAY": return "Revisão (1 dia)";
    case "7_DAYS": return "Revisão (7 dias)";
    case "30_DAYS": return "Revisão (30 dias)";
    default: return "Revisão Pendente";
  }
}

function getColorForType(type: AppNotification["type"]): AppNotification["color"] {
  switch (type) {
    case "REVISION_DUE": return "yellow";
    case "TASK_DUE": return "red";
    case "GOAL_REMINDER": return "blue";
    case "STREAK_ALERT": return "green";
    default: return "purple";
  }
}

function getIconForType(type: AppNotification["type"]): string {
  switch (type) {
    case "REVISION_DUE": return "🔔";
    case "TASK_DUE": return "⚠️";
    case "GOAL_REMINDER": return "🎯";
    case "STREAK_ALERT": return "🔥";
    default: return "📢";
  }
}
