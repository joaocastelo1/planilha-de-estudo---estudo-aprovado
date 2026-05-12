"use client";

import { type Subject } from "@/lib/db";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubjectCardProps {
  subject: Subject;
  taskStats: { total: number; completed: number };
  onEdit: (subject: Subject) => void;
  onDelete: (id: number) => void;
  onProgress: (id: number, increment: number) => void;
}

export default function SubjectCard({ subject, taskStats, onEdit, onDelete, onProgress }: SubjectCardProps) {
  const progress = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card hover className="group relative h-full flex flex-col p-0 overflow-hidden">
        <div className={`h-1.5 w-full bg-[${subject.color}]`} />

        <div className="p-7 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-6">
            <div 
              className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner transition-transform group-hover:-rotate-6 duration-500 bg-[${subject.color}]/10`}
            >
              <span className="text-2xl">{subject.icon || "📚"}</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => onEdit(subject)} 
                  className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => onDelete(subject.id!)} 
                  className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className={`w-2 h-2 rounded-full ${subject.progress > 0 ? "bg-emerald-500 animate-pulse" : "bg-muted"}`} 
              />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {subject.category}
              </p>
            </div>
            <h3 className="font-black text-2xl mb-2 font-display leading-tight group-hover:text-primary transition-colors">
              {subject.name}
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="text-muted-foreground/60">Progresso</span>
                  <span className={subject.progress >= 70 ? "text-emerald-500" : subject.progress >= 30 ? "text-blue-500" : "text-orange-500"}>
                    {subject.progress}%
                  </span>
                </div>
                <ProgressBar 
                  value={subject.progress} 
                  color={subject.progress >= 70 ? "green" : subject.progress >= 30 ? "blue" : "orange"}
                  className="h-2.5 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 py-6 border-t border-border/40">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Tarefas</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{taskStats.completed}/{taskStats.total}</span>
              </div>
            </div>
            <div className="space-y-1 border-l border-border/40 pl-4">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Último Estudo</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold truncate">
                  {subject.lastStudiedAt
                    ? formatDistanceToNow(subject.lastStudiedAt, { addSuffix: true, locale: ptBR })
                    : "Nunca estudado"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-7">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onProgress(subject.id!, 5)}
              className="rounded-xl border-border/60 font-bold hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/20"
            >
              +5% Avanço
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onProgress(subject.id!, -5)}
              className="rounded-xl border-border/60 font-bold hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
            >
              -5% Recuo
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
