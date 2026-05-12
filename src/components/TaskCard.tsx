"use client";

import { useState } from "react";
import { type StudyTask, type Subject } from "@/lib/db";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Trash2, Pencil, Clock, BookOpen, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

interface TaskCardProps {
  task: StudyTask;
  subjects: Subject[];
  onEdit: (task: StudyTask) => void;
}

export default function TaskCard({ task, subjects, onEdit }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggleComplete = async () => {
    setIsCompleting(true);
    try {
      if (task.status !== "CONCLUIDA") {
        await db.tasks.update(task.id!, {
          status: "CONCLUIDA",
          completedAt: Date.now(),
          updatedAt: Date.now(),
        });
        toast.success("Tarefa concluída! Revisões agendadas.");
      } else {
        await db.tasks.update(task.id!, {
          status: "PENDENTE",
          completedAt: undefined,
          updatedAt: Date.now(),
        });
        toast.success("Tarefa desmarcada.");
      }
    } catch {
      toast.error("Erro ao atualizar tarefa.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await db.tasks.delete(task.id!);
        toast.success("Tarefa excluída.");
      } catch {
        toast.error("Erro ao excluir tarefa.");
      }
    }
  };

  const subject = subjects?.find((s) => s.id === task.subjectId);
  const isCompleted = task.status === "CONCLUIDA";

  const priorityInfo = {
    URGENTE: { color: "text-rose-500", bg: "bg-rose-500/10", label: "P0" },
    ALTA: { color: "text-orange-500", bg: "bg-orange-500/10", label: "P1" },
    MEDIA: { color: "text-amber-500", bg: "bg-amber-500/10", label: "P2" },
    BAIXA: { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "P3" },
  };

  const currentPriority =
    priorityInfo[task.priority as keyof typeof priorityInfo] || priorityInfo.MEDIA;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        "group flex items-center gap-4 px-6 py-4 border-b border-border/40 hover:bg-muted/30 transition-all cursor-default",
        isCompleted && "bg-muted/10"
      )}
    >
      <button
        onClick={handleToggleComplete}
        disabled={isCompleting}
        className={cn(
          "shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300",
          isCompleted
            ? "bg-primary border-primary text-white"
            : "border-border/60 hover:border-primary/50 group-hover:border-primary/40"
        )}
      >
        {isCompleted && <CheckCircle size={12} strokeWidth={4} />}
      </button>

      <div
        className={cn(
          "hidden sm:flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter",
          currentPriority.bg,
          currentPriority.color
        )}
      >
        {currentPriority.label}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h3
            className={cn(
              "text-sm font-bold truncate transition-all duration-500",
              isCompleted ? "text-muted-foreground/40 font-normal line-through" : "text-foreground"
            )}
          >
            {task.title}
          </h3>
          {subject && (
            <span className="text-[9px] py-0 px-2 bg-muted/50 border-none text-muted-foreground/60 hidden md:block">
              {subject.name}
            </span>
          )}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
          <Clock size={12} /> {task.estimatedMinutes}m
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
          <Calendar size={12} /> {task.scheduledDate ? format(new Date(task.scheduledDate), "dd MMM") : "N/D"}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-2 rounded-lg hover:bg-card text-muted-foreground hover:text-primary transition-all">
          <Pencil size={14} />
        </button>
        <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
