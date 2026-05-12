"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, CATEGORY_LABELS, CATEGORY_COLORS, SubjectCategory } from "@/lib/db";
import { toast } from "react-hot-toast";
import {
  Plus, BookOpen, Trash2, Pencil, Search, TrendingUp, Filter,
  Scale, Monitor, Calculator, Globe, GraduationCap, Target,
  ChevronRight, Activity, Sparkles, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import SubjectCard from "@/components/SubjectCard";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORIES = [
  { value: "PORTUGUES", label: "Português", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { value: "DIREITO", label: "Direito", icon: Scale, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { value: "TI", label: "Tecnologia", icon: Monitor, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { value: "MATEMATICA", label: "Matemática", icon: Calculator, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  { value: "CONHECIMENTOS_GERAIS", label: "Gerais", icon: Globe, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { value: "OUTROS", label: "Outros", icon: GraduationCap, color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20" },
];

export default function DisciplinesPage() {
  const { user } = useAuthStore();
  const subjects = useLiveQuery(
    () => db.subjects.where("userId").equals(user?.id!).toArray(),
    [user?.id]
  );
  const tasks = useLiveQuery(
    () => db.tasks.where("userId").equals(user?.id!).toArray(),
    [user?.id]
  );

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const filtered = subjects?.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || s.category === filterCat;
    return matchSearch && matchCat;
  }) ?? [];

  const totalProgress = subjects?.length
    ? Math.round(subjects.reduce((acc, s) => acc + (s.progress || 0), 0) / subjects.length)
    : 0;

  const getSubjectTaskStats = (subjectId: number) => {
    const subjectTasks = tasks?.filter(t => t.subjectId === subjectId) || [];
    return {
      total: subjectTasks.length,
      completed: subjectTasks.filter(t => t.status === "CONCLUIDA").length,
    };
  };

  const [form, setForm] = useState({
    name: "", category: "PORTUGUES" as SubjectCategory, color: "#3b82f6", icon: "📚",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Digite o nome da disciplina");

    try {
      const subjectData = {
        userId: user?.id,
        name: form.name,
        category: form.category,
        color: form.color,
        icon: form.icon,
        progress: 0,
        difficulty: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalTasks: 0,
        completedTasks: 0,
        estimatedHours: 0,
        studiedHours: 0,
        lastStudiedAt: Date.now(),
      };

      if (editing) {
        await db.subjects.update(editing, { ...subjectData, id: undefined, userId: undefined });
        toast.success("Disciplina atualizada!");
      } else {
        await db.subjects.add(subjectData);
        toast.success("Disciplina criada!");
      }
      resetForm();
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const resetForm = () => {
    setForm({ name: "", category: "PORTUGUES", color: "#3b82f6", icon: "📚" });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir esta disciplina? Isso apagará também as tarefas vinculadas.")) return;
    await db.subjects.delete(id);
    await db.tasks.where("subjectId").equals(id).delete();
    toast.success("Disciplina excluída");
  };

  const startEdit = (s: import("@/lib/db").Subject) => {
    setForm({
      name: s.name, category: s.category, color: s.color, icon: s.icon || "📚",
    });
    setEditing(s.id!);
    setShowForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 animate-pulse">
            Dashboard de Estudos
          </Badge>
          <h1 className="text-4xl font-black tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
            Disciplinas
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Gerencie seu currículo e acompanhe seu desempenho em tempo real.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => { resetForm(); setShowForm(true); }}
            leftIcon={<Plus size={20} />}
            className="h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
          >
            Nova Disciplina
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Matérias Ativas", value: subjects?.length ?? 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+2 essa semana" },
          { label: "Progresso Médio", value: `${totalProgress}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "Em ascensão" },
          { label: "Horas Estudadas", value: `${subjects?.reduce((acc, s) => acc + (s.studiedHours || 0), 0).toFixed(1) || 0}h`, icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10", trend: "Foco total" },
          { label: "Total Tarefas", value: tasks?.length ?? 0, icon: Target, color: "text-orange-500", bg: "bg-orange-500/10", trend: "Pendente" },
        ].map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", stat.bg)}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
                  {stat.trend}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-black font-display mt-1 tracking-tight">{stat.value}</p>
              </div>
            </div>
            <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-500 w-0 group-hover:w-full", stat.bg.replace("/10", "/30"))} />
          </Card>
        ))}
      </section>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/30 backdrop-blur-md p-2 rounded-[2rem] border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por disciplina..."
            className="w-full pl-14 pr-6 py-4 bg-transparent rounded-[1.5rem] text-sm focus:outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>
        <div className="h-8 w-[1px] bg-border/40 hidden sm:block" />
        <div className="relative w-full sm:w-auto">
          <Filter size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none" />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="w-full sm:w-64 pl-14 pr-10 py-4 bg-transparent rounded-[1.5rem] text-sm focus:outline-none appearance-none cursor-pointer font-medium"
          >
            <option value="">Todas Categorias</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((s) => {
            const catInfo = CATEGORIES.find(c => c.value === s.category) || CATEGORIES[CATEGORIES.length - 1];
            const Icon = catInfo.icon;
            const taskStats = getSubjectTaskStats(s.id!);

            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card hover className="group relative h-full flex flex-col p-0 overflow-hidden border-border/40 hover:border-primary/20 shadow-none hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                  <div className={cn("h-1.5 w-full", catInfo.bg.replace("/10", ""))} />

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner transition-transform group-hover:-rotate-6 duration-500", catInfo.bg)}>
                        <Icon size={28} className={catInfo.color} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button onClick={() => startEdit(s)} className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDelete(s.id!)} className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("w-2 h-2 rounded-full", s.progress > 0 ? "bg-emerald-500 animate-pulse" : "bg-muted")} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{catInfo.label}</p>
                      </div>
                      <h3 className="font-black text-2xl mb-2 font-display leading-tight group-hover:text-primary transition-colors">{s.name}</h3>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                            <span className="text-muted-foreground/60">Progresso</span>
                            <span className={s.progress >= 70 ? "text-emerald-500" : s.progress >= 30 ? "text-blue-500" : "text-orange-500"}>{s.progress}%</span>
                          </div>
                          <ProgressBar
                            value={s.progress}
                            color={s.progress >= 70 ? "green" : s.progress >= 30 ? "blue" : "orange"}
                            className="h-2.5 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 py-6 border-y border-border/40">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Tarefas</p>
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-primary/60" />
                          <span className="text-sm font-bold">{taskStats.completed}/{taskStats.total}</span>
                        </div>
                      </div>
                      <div className="space-y-1 border-l border-border/40 pl-4">
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Último Estudo</p>
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-emerald-500/60" />
                          <span className="text-[11px] font-semibold truncate">
                            {s.lastStudiedAt
                              ? formatDistanceToNow(s.lastStudiedAt, { addSuffix: true, locale: ptBR })
                              : "Nunca estudado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-7">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          db.subjects.update(s.id!, {
                            progress: Math.min(100, (s.progress || 0) + 5),
                            lastStudiedAt: Date.now(),
                            updatedAt: Date.now(),
                          });
                          toast.success("Progresso atualizado!");
                        }}
                        className="rounded-xl border-border/60 font-bold hover:bg-emerald-500/5 hover:text-emerald-500 hover:border-emerald-500/20"
                      >
                        +5% Avanço
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          db.subjects.update(s.id!, {
                            progress: Math.max(0, (s.progress || 0) - 5),
                            updatedAt: Date.now(),
                          });
                          toast.success("Progresso atualizado!");
                        }}
                        className="rounded-xl border-border/60 font-bold hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
                      >
                        -5% Recuo
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 bg-card/20 backdrop-blur-sm border-2 border-dashed border-border/60 rounded-[3rem] text-center"
        >
          <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <BookOpen size={48} className="text-muted-foreground/20" />
          </div>
          <h3 className="text-2xl font-black font-display tracking-tight">Expandir seus Horizontes</h3>
          <p className="text-muted-foreground mt-3 max-w-sm text-lg leading-relaxed">
            {search || filterCat
              ? "Nenhum resultado corresponde à sua busca refinada. Tente novos parâmetros."
              : "Sua jornada de aprovação começa aqui. Adicone sua primeira disciplina para começar."}
          </p>
          {!search && !filterCat && (
            <Button onClick={() => setShowForm(true)} className="mt-10 h-14 px-8 rounded-2xl text-lg font-bold">
              Começar Agora
            </Button>
          )}
        </motion.div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editing ? "Refinar Disciplina" : "Mapear Nova Disciplina"}
              </h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Identificação da Matéria</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Direito Constitucional"
                  className="w-full px-6 py-3 bg-background border border-border rounded-2xl text-lg font-black focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Classificação Estratégica</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.value as SubjectCategory })}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                        form.category === cat.value
                          ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/20 scale-105"
                          : "bg-muted/20 border-border/40 text-muted-foreground/60 hover:border-primary/20"
                      )}
                    >
                      <cat.icon size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-center leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-border/20">
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={resetForm}>Descartar</Button>
                <Button type="submit" className="flex-[2] h-12 rounded-2xl font-bold shadow-xl shadow-primary/20">
                  {editing ? "Salvar Alterações" : "Mapear Disciplina"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
