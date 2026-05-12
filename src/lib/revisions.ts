import { Subject } from "./db";

const ONE_DAY = 24 * 60 * 60 * 1000;
const SEVEN_DAYS = 7 * ONE_DAY;
const THIRTY_DAYS = 30 * ONE_DAY;

export interface RevisionAlert {
  subjectId: number;
  subjectName: string;
  category: string;
  interval: number; // 1, 7, 30
  daysSince: number;
  urgency: "high" | "medium" | "low";
  color: string;
  bgColor: string;
  label: string;
}

export function getRevisionAlerts(subjects: Subject[]): RevisionAlert[] {
  const now = Date.now();
  const alerts: RevisionAlert[] = [];

  for (const subject of subjects) {
    if (!subject.lastStudiedAt && !subject.lastRevisionAt) continue;

    const lastDate = subject.lastRevisionAt || subject.lastStudiedAt!;
    const daysSince = (now - lastDate) / ONE_DAY;

    let interval = 0;
    let urgency: "high" | "medium" | "low" = "low";
    let color = "";
    let bgColor = "";
    let label = "";

    if (daysSince >= 30) {
      interval = 30;
      urgency = "high";
      color = "text-red-400";
      bgColor = "bg-red-400/10";
      label = "Revisão atrasada (30 dias)";
    } else if (daysSince >= 7) {
      interval = 7;
      urgency = "medium";
      color = "text-orange-400";
      bgColor = "bg-orange-400/10";
      label = "Revisão pendente (7 dias)";
    } else if (daysSince >= 1) {
      interval = 1;
      urgency = "low";
      color = "text-yellow-400";
      bgColor = "bg-yellow-400/10";
      label = "Revisão pendente (1 dia)";
    } else {
      continue;
    }

    alerts.push({
      subjectId: subject.id!,
      subjectName: subject.name,
      category: subject.category,
      interval,
      daysSince: Math.floor(daysSince),
      urgency,
      color,
      bgColor,
      label,
    });
  }

  return alerts.sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

export function formatDaysSince(days: number): string {
  if (days < 1) return "hoje";
  if (days === 1) return "ontem";
  return `${Math.floor(days)} dias atrás`;
}
