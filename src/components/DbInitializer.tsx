"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";
import { DEFAULT_SUBJECTS } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";

export function DbInitializer() {
  const { user } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (!user?.id) return;

      const discCount = await db.subjects.where("userId").equals(user.id).count();
      if (discCount === 0) {
        const now = Date.now();

        for (const subj of DEFAULT_SUBJECTS) {
          const id = await db.subjects.add({
            userId: user.id,
            name: subj.name,
            category: subj.category,
            color: subj.color,
            icon: subj.icon,
            progress: 0,
            difficulty: 1,
            createdAt: now,
            updatedAt: now,
            totalTasks: 0,
            completedTasks: 0,
            estimatedHours: 0,
            studiedHours: 0,
            lastStudiedAt: now,
          });

          await db.tasks.add({
            userId: user.id,
            subjectId: Number(id),
            title: `Estudar fundamentos de ${subj.name}`,
            status: "CONCLUIDA",
            priority: "MEDIA",
            scheduledDate: new Date().toISOString().split("T")[0],
            estimatedMinutes: 60,
            createdAt: now,
            updatedAt: now,
            order: 0,
          });

          await db.tasks.add({
            userId: user.id,
            subjectId: Number(id),
            title: `Resolver exercícios de ${subj.name}`,
            status: "PENDENTE",
            priority: "ALTA",
            scheduledDate: new Date().toISOString().split("T")[0],
            estimatedMinutes: 45,
            createdAt: now,
            updatedAt: now,
            order: 1,
          });
        }

        await db.notes.add({
          userId: user.id,
          title: "Bem-vindo ao Estudo Aprovado!",
          content: "Aqui você organiza seus estudos para concursos públicos. Use as disciplinas para organizar seu conhecimento!",
          tags: ["Bem-vindo", "Dica"],
          links: [],
          isPinned: true,
          createdAt: now,
          updatedAt: now,
        });

        const today = new Date().toISOString().split("T")[0];
        await db.dailyStats.add({
          userId: user.id,
          date: today,
          minutesStudied: 120,
          tasksCompleted: 3,
          revisionsDone: 2,
          studyTimeMinutes: 120,
          streakDay: true,
          createdAt: now,
        });
      }
    };
    init();
  }, [user?.id]);

  return null;
}
