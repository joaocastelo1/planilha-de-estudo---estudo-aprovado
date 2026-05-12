import { db } from "./db";
import type { Notification, StudyTask, Subject } from "./db";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type RevisionInterval = 1 | 7 | 30;

export const REVISION_CONFIG = {
  1: { label: "1 dia", color: "text-blue-400", bg: "bg-blue-400/10", icon: "📅" },
  7: { label: "7 dias", color: "text-amber-400", bg: "bg-amber-400/10", icon: "📆" },
  30: { label: "30 dias", color: "text-purple-400", bg: "bg-purple-400/10", icon: "🗓️" },
} as const;

export async function scheduleRevisionAlert(
  relatedId: number,
  type: Notification["type"],
  intervalDays: RevisionInterval,
  title: string,
  message: string
) {
  const scheduledFor = Date.now() + intervalDays * MS_PER_DAY;

  await db.notifications.add({
    type,
    title,
    message,
    relatedId,
    scheduledFor,
    isRead: false,
    isDismissed: false,
    createdAt: Date.now(),
  });
}

export async function createSubjectRevisionAlerts(subjectId: number, subjectName: string) {
  const intervals: RevisionInterval[] = [1, 7, 30];
  const types: Notification["type"][] = ["REVISION_DUE", "REVISION_DUE", "REVISION_DUE"];

  for (let i = 0; i < intervals.length; i++) {
    await scheduleRevisionAlert(
      subjectId,
      types[i],
      intervals[i],
      `Revisão: ${subjectName}`,
      `Revisão programada para ${REVISION_CONFIG[intervals[i]].label} após estudo.`
    );
  }
}

export async function createTaskDueAlert(task: StudyTask) {
  if (!task.dueDate) return;

  const dueTime = new Date(`${task.dueDate}T23:59:59`).getTime();
  const now = Date.now();

  if (dueTime > now) {
    await db.notifications.add({
      type: "TASK_DUE",
      title: `Tarefa: ${task.title}`,
      message: `Vence em ${new Date(task.dueDate).toLocaleDateString("pt-BR")}`,
      relatedId: task.id!,
      scheduledFor: dueTime,
      isRead: false,
      isDismissed: false,
      createdAt: Date.now(),
    });
  }
}

export async function getPendingAlerts() {
  const now = Date.now();
  return db.notifications
    .where("scheduledFor")
    .belowOrEqual(now)
    .and((alert) => !alert.isRead && !alert.isDismissed)
    .toArray();
}

export async function markAlertRead(alertId: number) {
  await db.notifications.update(alertId, { isRead: true });
}

export async function dismissAlert(alertId: number) {
  await db.notifications.update(alertId, { isDismissed: true });
}

export async function checkDailyAlerts() {
  const today = new Date().toISOString().split("T")[0];
  const lastCheck = localStorage.getItem("lastAlertCheck");

  if (lastCheck === today) return;

  const pending = await getPendingAlerts();
  if (pending.length > 0) {
    localStorage.setItem("lastAlertCheck", today);
  }

  return pending;
}
