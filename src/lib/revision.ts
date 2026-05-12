import { db } from "./db";
import { Notification } from "./db";

export async function generateRevisionAlerts(relatedId: number, type: "task" | "session") {
  const now = Date.now();

  const alerts: Omit<Notification, "id">[] = [
    {
      type: "REVISION_DUE",
      title: "Revisão 1 dia",
      message: `Revisar conteúdo após 1 dia de estudo`,
      relatedId,
      scheduledFor: now + 1 * 24 * 60 * 60 * 1000,
      isRead: false,
      isDismissed: false,
      createdAt: now,
    },
    {
      type: "REVISION_DUE",
      title: "Revisão 7 dias",
      message: `Revisar conteúdo após 7 dias de estudo`,
      relatedId,
      scheduledFor: now + 7 * 24 * 60 * 60 * 1000,
      isRead: false,
      isDismissed: false,
      createdAt: now,
    },
    {
      type: "REVISION_DUE",
      title: "Revisão 30 dias",
      message: `Revisar conteúdo após 30 dias de estudo`,
      relatedId,
      scheduledFor: now + 30 * 24 * 60 * 60 * 1000,
      isRead: false,
      isDismissed: false,
      createdAt: now,
    },
  ];

  for (const alert of alerts) {
    await db.notifications.add(alert);
  }
}
