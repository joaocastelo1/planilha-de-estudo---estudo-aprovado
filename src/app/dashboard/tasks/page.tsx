"use client";

import { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, CheckCircle2, Circle, Pencil, Trash2,
  X, Clock, Filter, Calendar, Tag, AlertCircle, Check, Search, Target,
  ChevronRight, MoreVertical, LayoutGrid, List as ListIcon,
  ArrowUpRight, Clock3, Zap, Sparkles
} from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import TaskCard from "@/components/TaskCard";
import TaskModal from "@/components/TaskModal";
import { useAuthStore } from "@/store/authStore";

export default function TasksPage() {
  const { user } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<import("@/lib/db").StudyTask | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [filterPriority, setFilterPriority] = useState<string>("TODOS");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  const tasks = useLiveQuery(
    () => db.tasks.where("userId").equals(user?.id!).toArray(),
    [user?.id]
  );
  const subjects = useLiveQuery(
    () => db.subjects.where("userId").equals(user?.id!).toArray(),
    [user?.id]
  );

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "TODOS" || t.status === filterStatus;
      const matchPriority = filterPriority === "TODOS" || t.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    }).sort((a, b) => {
      if (a.status === "CONCLUIDA" && b.status !== "CONCLUIDA") return 1;
      if (a.status !== "CONCLUIDA" && b.status === "CONCLUIDA") return -1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }, [tasks, search, filterStatus, filterPriority]);

  const handleSave = async (taskData: Partial<import("@/lib/db").StudyTask>, isEditing: boolean) => {
    try {
      if (isEditing && editingTask) {
        await db.tasks.update(editingTask.id, {
          ...taskData,
          updatedAt: Date.now(),
        });
        toast.success("Tarefa atualizada!");
      } else {
        const newTask: import("@/lib/db").StudyTask = {
          title: taskData.title || "Nova Tarefa",
          description: taskData.description || "",
          priority: taskData.priority || "MEDIA",
          subjectId: taskData.subjectId,
          scheduledDate: taskData.scheduledDate,
          estimatedMinutes: taskData.estimatedMinutes || 60,
          userId: user?.id,
          status: "PENDENTE",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          order: 0,
        };
        await db.tasks.add(newTask);
        toast.success("Nova meta adicionada!");
      }
      closeModal();
    } catch {
      toast.error("Falha ao salvar meta");
    }
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingTask(null);
  };

  const startEdit = (task: import("@/lib/db").StudyTask) => {
    setEditingTask(task);
    setIsAdding(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 flex items-center gap-2 w-fit">
            <Zap size={12} className="animate-pulse" /> High-Performance Sprint
          </Badge>
          <h1 className="text-4xl font-black tracking-tighter font-display leading-tight">
            Planejamento <span className="text-primary italic">Ágil</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Sua execução diária, refinada por dados.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsAdding(true)} leftIcon={<Plus size={20} />} className="h-12 px-6 rounded-2xl shadow-xl shadow-primary/20">
            Nova Meta
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-center bg-card/30 backdrop-blur-md p-2 rounded-[2rem] border border-border/40 shadow-sm overflow-hidden">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar tarefas da sprint..."
            className="w-full pl-16 pr-6 py-4 bg-transparent focus:outline-none text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2 pr-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
          <div className="h-8 w-[1px] bg-border/40 hidden lg:block mx-2" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-xs font-bold uppercase tracking-widest px-4 py-2 focus:outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <option value="TODOS">Todos Status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="CONCLUIDA">Concluídas</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-transparent text-xs font-bold uppercase tracking-widest px-4 py-2 focus:outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <option value="TODOS">Todas Prioridades</option>
            <option value="URGENTE">P0 - Urgente</option>
            <option value="ALTA">P1 - Alta</option>
            <option value="MEDIA">P2 - Média</option>
            <option value="BAIXA">P3 - Baixa</option>
          </select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border/40 shadow-2xl shadow-black/5">
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subjects={subjects || []}
                onEdit={startEdit}
              />
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center justify-center bg-card/20 backdrop-blur-sm">
              <div className="w-20 h-20 bg-muted/40 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <LayoutGrid size={32} className="text-muted-foreground/20" />
              </div>
              <h3 className="text-xl font-black font-display tracking-tight">Vácuo de Execução</h3>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">Sua lista de tarefas está limpa. É hora de planejar sua próxima grande meta ou relaxar.</p>
              <Button onClick={() => setIsAdding(true)} variant="outline" className="mt-8 h-12 rounded-xl">Planejar Sprint</Button>
            </div>
          )}
        </div>
      </Card>

      <TaskModal
        isOpen={isAdding}
        onClose={closeModal}
        task={editingTask || undefined}
        subjects={subjects || []}
        onSave={handleSave}
      />
    </div>
  );
}
