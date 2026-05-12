import { cn } from "@/lib/utils";
import { Pencil, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { StudyTask } from "@/lib/db";

interface TaskCardProps {
  task: StudyTask;
  onEdit: (task: StudyTask) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  BAIXA: { label: "Baixa", color: "text-muted-foreground", bg: "bg-muted" },
  MEDIA: { label: "Média", color: "text-blue-400", bg: "bg-blue-400/10" },
  ALTA: { label: "Alta", color: "text-amber-400", bg: "bg-amber-400/10" },
  URGENTE: { label: "Urgente", color: "text-red-400", bg: "bg-red-400/10" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDENTE: { label: "Pendente", color: "text-muted-foreground" },
  EM_PROGRESSO: { label: "Em Progresso", color: "text-blue-400" },
  CONCLUIDA: { label: "Concluída", color: "text-emerald-400" },
  CANCELADA: { label: "Cancelada", color: "text-red-400" },
};

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const isCompleted = task.status === "COMPLETED";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-all",
        isCompleted && "opacity-60"
      )}
    >
      <button
        onClick={() => !isCompleted && onComplete(task.id!)}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
          isCompleted ? "bg-emerald-500 border-emerald-500" : "border-border hover:border-primary"
        )}
      >
        {isCompleted && <CheckCircle2 size={12} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isCompleted && "line-through")}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase", priority.bg, priority.color)}>
            {priority.label}
          </span>
          <span className={cn("text-[10px]", status.color)}>{status.label}</span>
          {task.dueDate && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground" title="Editar">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(task.id!)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Excluir">
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}
