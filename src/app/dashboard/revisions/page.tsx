"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { CheckCircle2, Clock, AlertTriangle, Calendar, Bell, X } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";

export default function RevisionsPage() {
  const { user } = useAuthStore();
  const revisions = useLiveQuery(
    () => db.revisions.where("userId").equals(user?.id!).toArray(),
    [user?.id]
  );
  const tasks = useLiveQuery(
    () => db.tasks.where("userId").equals(user?.id!).toArray(),
    [user?.id]
  );

  const [pendingRevisions, setPendingRevisions] = useState<any[]>([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState<any[]>([]);
  const [completedRevisions, setCompletedRevisions] = useState<any[]>([]);

  useEffect(() => {
    if (!revisions) return;
    const now = Date.now();
    const pending = revisions.filter((r) => r.status === "PENDENTE" && r.scheduledFor <= now);
    const upcoming = revisions.filter((r) => r.status === "PENDENTE" && r.scheduledFor > now);
    const completed = revisions.filter((r) => r.status === "CONCLUIDA").slice(0, 20);

    setPendingRevisions(pending);
    setUpcomingRevisions(upcoming.sort((a, b) => a.scheduledFor - b.scheduledFor));
    setCompletedRevisions(completed);
  }, [revisions]);

  const getTaskTitle = (taskId: number) => {
    const task = tasks?.find((t) => t.id === taskId);
    return task ? task.title : "Tarefa não encontrada";
  };

  const handleCompleteRevision = async (id: number) => {
    await db.revisions.update(id, {
      status: "CONCLUIDA",
      completedAt: Date.now(),
      isRead: 1,
    });
    toast.success("Revisão concluída!");
  };

  const handleScheduleRevision = async (taskId: number, subjectId: number) => {
    const now = Date.now();
    const intervals = [1, 7, 30];
    for (const days of intervals) {
      await db.revisions.add({
        userId: user?.id,
        taskId,
        subjectId,
        type: "spaced_repetition",
        alertDate: new Date(now + days * 24 * 60 * 60 * 1000).toISOString(),
        scheduledFor: now + days * 24 * 60 * 60 * 1000,
        status: "PENDENTE",
        isRead: 0,
        interval: days,
        repetitions: intervals.indexOf(days) + 1,
        easeFactor: 2.5,
        createdAt: now,
      });
    }
    toast.success("Revisões agendadas!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revisão Inteligente</h1>
        <p className="text-muted-foreground mt-1">Sistema de repetição espaçada para máxima retenção</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">Revisões Atrasadas</span>
          </div>
          <p className="text-3xl font-bold text-destructive">{pendingRevisions.length}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <Clock size={18} />
            <span className="text-sm font-medium">Agendadas</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{upcomingRevisions.length}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">Concluídas</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{completedRevisions.length}</p>
        </div>
      </div>

      {pendingRevisions.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-destructive animate-pulse" />
            <h2 className="text-xl font-bold text-destructive">Revisões Pendentes</h2>
          </div>
          <div className="space-y-3">
            {pendingRevisions.map((rev) => {
              const overdueDays = differenceInDays(Date.now(), rev.scheduledFor);
              return (
                <div
                  key={rev.id}
                  className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{getTaskTitle(rev.taskId)}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-destructive">
                        {overdueDays > 0 ? `Atrasada há ${overdueDays} dia(s)` : "Vence hoje"}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Intervalo: {rev.interval} dias
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompleteRevision(rev.id!)}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-colors"
                  >
                    <CheckCircle2 size={16} />
                    Marcar como Revisada
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Próximas Revisões</h2>
        {upcomingRevisions.length > 0 ? (
          <div className="space-y-3">
            {upcomingRevisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-foreground font-medium">{getTaskTitle(rev.taskId)}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(rev.scheduledFor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {rev.interval === 1 ? "Amanhã" : rev.interval === 7 ? "Em 7 dias" : "Em 30 dias"}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {differenceInDays(rev.scheduledFor, Date.now())} dia(s) restantes
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma revisão agendada.</p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Histórico de Revisões</h2>
        {completedRevisions.length > 0 ? (
          <div className="space-y-2">
            {completedRevisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg"
              >
                <CheckCircle2 size={16} className="text-emerald-400" />
                <div className="flex-1">
                  <p className="text-foreground/90">{getTaskTitle(rev.taskId)}</p>
                  <p className="text-xs text-muted-foreground">
                    Revisado em {format(new Date(rev.completedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Repetição #{rev.repetitions}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma revisão concluída ainda.</p>
        )}
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary mb-2">Como funciona a Revisão Espaçada?</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">1.</span>
            <span>Ao concluir uma tarefa, o sistema agenda automaticamente 3 revisões: 1 dia, 7 dias e 30 dias depois.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">2.</span>
            <span>Você receberá alertas visuais quando uma revisão estiver pendente.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">3.</span>
            <span>Marque como "Revisada" para manter o ciclo de repetição espaçada ativo.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
