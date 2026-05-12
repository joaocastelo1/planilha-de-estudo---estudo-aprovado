import { db } from "./db";
import type { Subject, StudyTask, Notification } from "./db";

export async function generateReviewNotifications() {
  const now = Date.now();
  const subjects = await db.subjects.toArray();

  for (const subject of subjects) {
    if (!subject.nextReviewDate) continue;

    const daysUntil = Math.ceil((subject.nextReviewDate - now) / (1000 * 60 * 60 * 24));

    // Check if notification already exists for this subject/date to avoid duplicates
    const existing = await db.notifications
      .where("relatedId")
      .equals(subject.id!)
      .and(n => n.type === "REVISION_DUE" && Math.abs(n.createdAt - now) < 3600000)
      .first();

    if (existing) continue;

    if (daysUntil <= 0) {
      await db.notifications.add({
        type: "REVISION_DUE",
        title: "Revisão Pendente",
        message: `A disciplina "${subject.name}" está pendente de revisão!`,
        relatedId: subject.id,
        isRead: false,
        isDismissed: false,
        createdAt: now,
      });
    } else if (daysUntil === 1) {
      await db.notifications.add({
        type: "REVISION_DUE",
        title: "Revisão Amanhã",
        message: `Prepare-se para revisar "${subject.name}" amanhã.`,
        relatedId: subject.id,
        isRead: false,
        isDismissed: false,
        createdAt: now,
        scheduledFor: subject.nextReviewDate,
      });
    }
  }
}

export async function generateTaskNotifications() {
  const now = Date.now();
  const tasks = await db.tasks
    .where("status")
    .anyOf(["PENDENTE", "EM_ANDAMENTO"])
    .toArray();

  for (const task of tasks) {
    if (!task.dueDate) continue;

    const daysUntil = Math.ceil((task.dueDate - now) / (1000 * 60 * 60 * 24));

    const existing = await db.notifications
      .where("relatedId")
      .equals(task.id!)
      .and(n => n.type === "TASK_DUE" && Math.abs(n.createdAt - now) < 3600000)
      .first();

    if (existing) continue;

    if (daysUntil === 0) {
      await db.notifications.add({
        type: "TASK_DUE",
        title: "Tarefa Vence Hoje",
        message: `A tarefa "${task.title}" vence hoje!`,
        relatedId: task.id,
        isRead: false,
        isDismissed: false,
        createdAt: now,
      });
    } else if (daysUntil < 0) {
      await db.notifications.add({
        type: "TASK_DUE",
        title: "Tarefa Atrasada",
        message: `A tarefa "${task.title}" está atrasada!`,
        relatedId: task.id,
        isRead: false,
        isDismissed: false,
        createdAt: now,
      });
    }
  }
}

export async function scheduleNextReview(subjectId: number) {
  const subject = await db.subjects.get(subjectId);
  if (!subject) return;

  const now = Date.now();
  const currentInterval = subject.revisionInterval || 1;

  let nextInterval: number;
  if (currentInterval < 7) {
    nextInterval = 7;
  } else if (currentInterval < 30) {
    nextInterval = 30;
  } else {
    nextInterval = 60;
  }

  const nextReviewDate = now + nextInterval * 24 * 60 * 60 * 1000;

  await db.subjects.update(subjectId, {
    revisionInterval: nextInterval,
    nextReviewDate,
    lastRevisionAt: now,
    revisionCount: (subject.revisionCount || 0) + 1,
  });

  return nextReviewDate;
}

export async function getUnreadNotifications() {
  return await db.notifications
    .where("isRead")
    .equals(0)
    .and((n) => !n.isDismissed)
    .toArray();
}

export async function markAsRead(notificationId: number) {
  await db.notifications.update(notificationId, { isRead: 1 });
}

export async function dismissNotification(notificationId: number) {
  await db.notifications.update(notificationId, { isDismissed: 1 });
}

export async function checkAllNotifications() {
  await generateReviewNotifications();
  await generateTaskNotifications();
  return await getUnreadNotifications();
}
