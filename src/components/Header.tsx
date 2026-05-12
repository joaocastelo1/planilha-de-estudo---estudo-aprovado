"use client";

import { Bell, Moon, Sun, Search, User, Menu, RotateCcw, Zap, LogOut } from "lucide-react";
import { useUIStore, useAlertStore } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { db } from "@/lib/db";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Header() {
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { unreadAlerts } = useAlertStore();
  const [resetting, setResetting] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!confirm("⚠️ Atenção: Isso apagará TODOS os dados locais. Esta ação não pode ser desfeita. Confirmar?")) return;
    setResetting(true);
    try {
      await db.delete();
      localStorage.clear();
      toast.success("Sistema resetado. Reiniciando...");
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast.error("Falha ao resetar.");
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    const { logout } = useAuthStore.getState();
    await logout();
    router.push("/login");
  };

  return (
    <header className="app-header flex items-center h-[var(--header-height)] px-8 bg-background/50 backdrop-blur-xl border-b border-border/40 z-30 sticky top-0">
      <button
        onClick={toggleSidebar}
        className="p-3 rounded-2xl hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary md:hidden mr-4 shadow-sm"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 max-w-xl hidden md:block group">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
            <Search size={16} strokeWidth={3} />
          </div>
          <input
            type="text"
            placeholder="Buscar tarefas, disciplinas... (Ctrl + K)"
            className="w-full bg-muted/20 border border-transparent rounded-[1.25rem] pl-12 pr-4 py-2.5 text-sm font-medium placeholder:text-muted-foreground/30 focus:bg-card focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden sm:flex items-center gap-2 bg-card border border-border/60 rounded-2xl px-4 py-2 shadow-sm">
            <Zap size={16} className="text-orange-500 fill-orange-500" />
            <span className="text-xs font-bold">
              {user.streak ?? 0} <span className="text-muted-foreground/60 uppercase text-[9px]">Dias</span>
            </span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-card border border-border/60 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all shadow-sm"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="w-11 h-11 flex items-center justify-center rounded-2xl bg-card border border-border/60 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all shadow-sm relative">
          <Bell size={18} />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-background">
              {unreadAlerts}
            </span>
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={resetting}
          className={cn(
            "w-11 h-11 flex items-center justify-center rounded-2xl bg-card border border-border/60 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all shadow-sm",
            resetting && "animate-spin"
          )}
          title="Resetar sistema"
        >
          <RotateCcw size={18} />
        </button>

        <div className="w-px h-8 bg-border/40 mx-2 hidden lg:block" />

        {user && (
          <div className="flex items-center gap-3 pl-2 group cursor-pointer" onClick={handleLogout} title="Sair">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-bold tracking-tighter leading-none group-hover:text-primary transition-colors">
                {user.name ?? "Estudante"}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Plano {user.plan ?? "free"}
              </span>
            </div>
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-primary/60" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
