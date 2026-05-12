"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Layout,
  BookOpen,
  Settings,
  Timer,
  FileText,
  Brain,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useUIStore, useAlertStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen,         label: "Disciplinas", href: "/dashboard/disciplines" },
  { icon: FileText,         label: "Tarefas", href: "/dashboard/tasks" },
  { icon: TrendingUp,       label: "Desempenho", href: "/dashboard/performance" },
  { icon: Layout,           label: "Mapas Mentais", href: "/dashboard/mindmaps" },
  { icon: Brain,            label: "Flashcards",  href: "/dashboard/flashcards" },
  { icon: Timer,            label: "Foco",   href: "/dashboard/focus" },
  { icon: Sparkles,         label: "Revisões", href: "/dashboard/revisions" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { unreadAlerts } = useAlertStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "app-sidebar flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-3xl transition-all duration-500 z-40 relative overflow-visible",
        isSidebarOpen ? "w-[280px]" : "w-[80px]"
      )}
    >
      <div className="flex items-center h-[var(--header-height)] px-6 relative">
        <div className="relative group">
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-2xl shadow-primary/20 transition-transform group-hover:scale-110 duration-500">
              <Zap size={20} className="text-white fill-white animate-pulse" />
           </div>
           <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-4"
          >
            <h2 className="font-bold text-lg tracking-tighter font-display leading-tight uppercase">
              Estudo <span className="text-primary">Aprovado</span>
            </h2>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Organização e Aprovação</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Icon size={20} className={cn("shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground/40")} />
              {isSidebarOpen && <span className="truncate tracking-tight">{label}</span>}

              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}

              {label === "Revisões" && unreadAlerts > 0 && (
                <span className={cn(
                  "bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/20",
                  isSidebarOpen ? "ml-auto px-2 py-0.5" : "absolute top-2 right-2 w-4 h-4"
                )}>
                  {unreadAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-border/40 bg-muted/5">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
            pathname === "/dashboard/settings" ? "bg-primary/10 text-primary" : "text-muted-foreground/60 hover:text-foreground"
          )}
        >
          <Settings size={20} className="shrink-0 group-hover:rotate-90 transition-transform duration-500" />
          {isSidebarOpen && <span className="truncate tracking-tight">Configurações</span>}
        </Link>

        {isSidebarOpen && user && (
          <div className="px-4 py-3 rounded-2xl bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Plano {user.plan}</p>
              </div>
              <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Sair">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-card border border-border/60 rounded-full items-center justify-center text-muted-foreground hover:text-primary z-50 shadow-xl transition-all hover:scale-110 active:scale-90"
      >
        {isSidebarOpen ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
      </button>
    </aside>
  );
}
