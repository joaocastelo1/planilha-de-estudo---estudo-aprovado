"use client";

import { useEffect, useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/db";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, CardTitle, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Flame,
  Target,
  ArrowRight,
  Plus,
  Zap,
  Sparkles,
  Activity,
  ChevronRight,
  Layout,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuthStore } from "@/store/authStore";
import { useAlertStore } from "@/store/useStore";
import { useGoalStore } from "@/store/useGoalStore";
import { usePerformanceStore } from "@/store/usePerformanceStore";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Olá");
  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "accuracy">("overview");
  const { user } = useAuthStore();
  const { refreshAlerts } = useAlertStore();
  const { fetchGoals, getWeeklyProgress, dailyChecklist, toggleChecklistItem } = useGoalStore();
  const { fetchPerformance, getWeeklyStats, weaknesses } = usePerformanceStore();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    refreshAlerts();
    fetchGoals();
    fetchPerformance();
  }, []);

  const subjects = useLiveQuery(() => db.subjects.where("userId").equals(user?.id!).toArray(), [user?.id]);
  const tasks = useLiveQuery(() => db.tasks.where("userId").equals(user?.id!).toArray(), [user?.id]);
  const revisions = useLiveQuery(() => db.revisions.where("userId").equals(user?.id!).toArray(), [user?.id]);
  const dailyStats = useLiveQuery(() => db.dailyStats.where("userId").equals(user?.id!).toArray(), [user?.id]);

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === "CONCLUIDA").length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const today = format(new Date(), "yyyy-MM-dd");
  const todayTasks = tasks?.filter(t => t.scheduledDate === today) || [];
  const pendingRevisions = revisions?.filter(r => r.status === "PENDENTE" && r.scheduledFor <= Date.now()) || [];

  const streak = user?.streak || 0;
  const weeklyProgress = getWeeklyProgress();
  const weeklyAccuracy = getWeeklyStats().accuracy;

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const stat = dailyStats?.find(s => s.date === dateStr);
      return {
        name: format(date, "EEE", { locale: ptBR }),
        minutes: stat?.minutesStudied || 0,
        tasks: stat?.tasksCompleted || 0,
        accuracy: Math.floor(Math.random() * 30) + 70, 
      };
    });
  }, [dailyStats]);

  const heatmapData = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 27);
    return eachDayOfInterval({ start, end }).map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const stat = dailyStats?.find(s => s.date === dateStr);
      return {
        date,
        intensity: stat ? Math.min(stat.minutesStudied / 60, 4) : 0,
      };
    });
  }, [dailyStats]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 flex items-center gap-2 w-fit">
            <Activity size={12} /> Elite Performance v4.0
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter font-display leading-tight">
            {greeting}, <span className="text-primary">{user?.name?.split(" ")[0] || "Estudante"}.</span>
          </h1>
          <p className="text-muted-foreground text-xl font-medium max-w-lg leading-relaxed">
            Seu desempenho semanal está em <span className="text-emerald-500 font-bold">{weeklyAccuracy}% acerto</span>. Mantenha o foco.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/tasks">
            <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-border/60 hover:bg-muted/50">
              Planejar Dia
            </Button>
          </Link>
          <Link href="/dashboard/focus">
            <Button className="h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 group">
              <Zap size={18} className="mr-2 group-hover:scale-125 transition-transform" /> Iniciar Estudo
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Precisão Semanal"
          value={`${weeklyAccuracy}%`}
          icon={<Target size={24} />}
          color="blue"
          trend={{ value: 5, isPositive: true, label: "acertos" }}
        />
        <StatCard
          title="Meta Semanal"
          value={`${weeklyProgress}%`}
          icon={<TrendingUp size={24} />}
          color="green"
          trend={{ value: 10, isPositive: true, label: "horas foco" }}
        />
        <StatCard
          title="Revisões SRS"
          value={pendingRevisions.length}
          icon={<Sparkles size={24} />}
          color="purple"
          trend={{ value: 2, isPositive: false, label: "atrasadas" }}
        />
        <StatCard
          title="Sequência"
          value={streak}
          icon={<Flame size={24} className="animate-bounce" />}
          color="red"
          trend={{ value: 100, isPositive: true, label: "Elite" }}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">

          <Card variant="glass" className="p-8 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <CardTitle>Pulso de Produtividade</CardTitle>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">Sua evolução em tempo real</p>
              </div>
              <div className="flex bg-muted/20 p-1 rounded-xl">
                 {(["overview", "stats", "accuracy"] as const).map((tab) => (
                   <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize", activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
                   >{tab === "overview" ? "Minutos" : tab === "stats" ? "Tarefas" : "Precisão"}</button>
                 ))}
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeTab === "accuracy" ? "#10b981" : "var(--primary)"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={activeTab === "accuracy" ? "#10b981" : "var(--primary)"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 700}}
                    dy={10}
                  />
                  <YAxis hide domain={activeTab === "accuracy" ? [0, 100] : ["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{backgroundColor: 'var(--card)', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                    itemStyle={{fontWeight: 700, fontSize: 12}}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeTab === "overview" ? "minutes" : activeTab === "stats" ? "tasks" : "accuracy"}
                    stroke={activeTab === "accuracy" ? "#10b981" : "var(--primary)"}
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <CardTitle>Checklist Diário</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{dailyChecklist.filter(c => c.completed).length}/4</Badge>
               </div>
               <div className="space-y-4">
                  {dailyChecklist.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleChecklistItem(item.id)}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer group"
                    >
                       <div className={cn(
                         "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                         item.completed ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
                       )}>
                          {item.completed && <CheckCircle2 size={12} className="text-white" />}
                       </div>
                       <span className={cn("text-sm font-bold", item.completed && "text-muted-foreground line-through")}>{item.title}</span>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="p-8">
               <div className="flex items-center justify-between mb-8">
                  <CardTitle>Fraquezas</CardTitle>
                  <AlertTriangle size={18} className="text-amber-500" />
               </div>
               <div className="space-y-4">
                  {weaknesses.length > 0 ? (
                    weaknesses.slice(0, 3).map((w, i) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between text-xs font-bold">
                            <span>{w.subject.name}</span>
                            <span className="text-rose-500">{Math.round(w.accuracy)}% acerto</span>
                         </div>
                         <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-rose-500 h-full transition-all" style={{ width: `${w.accuracy}%` }} />
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic py-4">Nenhuma fraqueza crítica identificada ainda.</p>
                  )}
                  <Link href="/dashboard/performance" className="block pt-2">
                    <Button variant="ghost" className="w-full text-xs font-bold text-primary">Ver Análise Completa</Button>
                  </Link>
               </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="p-8 border-primary/20 bg-primary/[0.02]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-black text-lg">Meta Semanal</h3>
                 <Badge className="bg-primary/10 text-primary border-none">Semana</Badge>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                 <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90">
                       <circle cx="80" cy="80" r="70" stroke="var(--muted)" strokeWidth="12" fill="transparent" opacity="0.1" />
                       <circle
                        cx="80" cy="80" r="70"
                        stroke="var(--primary)"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 * (1 - weeklyProgress/100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-4xl font-black">{weeklyProgress}%</span>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase">Meta</span>
                    </div>
                 </div>
                 <div className="text-center">
                    <p className="font-bold">Tempo de Estudo</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Mantenha a consistência para bater 100%.</p>
                 </div>
              </div>
           </Card>

           <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Mapas Mentais", icon: Layout, href: "/dashboard/mindmaps", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Flashcards", icon: Sparkles, href: "/dashboard/flashcards", color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Revisões", icon: AlertTriangle, href: "/dashboard/revisions", color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Desempenho", icon: TrendingUp, href: "/dashboard/performance", color: "text-blue-500", bg: "bg-blue-500/10" },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <Card hover className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg)}>
                       <item.icon size={22} className={item.color} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{item.label}</span>
                  </Card>
                </Link>
              ))}
           </div>

           <Card className="p-8">
              <div className="flex items-center justify-between mb-8">
                 <CardTitle className="text-lg">Próximas Metas</CardTitle>
                 <Link href="/dashboard/tasks">
                   <ChevronRight size={20} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                 </Link>
              </div>
              <div className="space-y-4">
                 {todayTasks.length > 0 ? (
                   todayTasks.slice(0, 3).map((task, i) => (
                     <div key={task.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer">
                        <div className={cn(
                          "w-3 h-3 rounded-full border-2",
                          task.status === "CONCLUIDA" ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30"
                        )} />
                        <div className="flex-1 min-w-0">
                           <p className={cn("text-sm font-bold truncate", task.status === "CONCLUIDA" && "line-through opacity-40")}>{task.title}</p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-center py-6 text-sm text-muted-foreground italic">Nenhuma meta pendente.</p>
                 )}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
