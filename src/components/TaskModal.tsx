"use client";

import { useState, useEffect } from "react";
import { type StudyTask, type Subject } from "@/lib/db";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: StudyTask;
  subjects: Subject[];
  onSave: (taskData: any, isEditing: boolean) => void;
}

export default function TaskModal({ isOpen, onClose, task, subjects, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [subjectId, setSubjectId] = useState(
    task?.subjectId || (subjects && subjects.length > 0 ? subjects[0].id : 0)
  );
  const [date, setDate] = useState(
    task?.scheduledDate
      ? task.scheduledDate
      : format(new Date(), "yyyy-MM-dd")
  );
  const [duration, setDuration] = useState(task?.estimatedMinutes || 60);
  const [priority, setPriority] = useState(task?.priority || "MEDIA");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setSubjectId(task.subjectId || 0);
      setDate(task.scheduledDate || format(new Date(), "yyyy-MM-dd"));
      setDuration(task.estimatedMinutes || 60);
      setPriority(task.priority || "MEDIA");
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Digite um título para a tarefa");
      return;
    }
    if (!subjectId) {
      toast.error("Selecione uma disciplina");
      return;
    }
    onSave(
      {
        title,
        description,
        subjectId: Number(subjectId),
        scheduledDate: date,
        estimatedMinutes: Number(duration),
        priority,
      },
      !!task
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {task ? "Editar Tarefa" : "Nova Tarefa"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Título</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Estudar Português"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Disciplina</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
              >
                <option value={0}>Selecione...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prioridade</label>
              <div className="grid grid-cols-4 gap-2">
                {["BAIXA", "MEDIA", "ALTA", "URGENTE"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-3 rounded-xl border text-[10px] font-black tracking-tighter transition-all ${
                      priority === p
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                        : "bg-muted/20 border-border/40 text-muted-foreground/60 hover:border-primary/20"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Duração (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={15}
                step={15}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border/20">
            <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={onClose}>
              Descartar
            </Button>
            <Button type="submit" className="flex-[2] h-14 rounded-2xl font-bold shadow-xl shadow-primary/20">
              <Save className="w-4 h-4 mr-2" />
              {task ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
