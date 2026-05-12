"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, markRevisionAsRead } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AlertsPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<"TODOS" | "PENDENTES" | "LIDOS">("PENDENTES");
  const [search, setSearch] = useState("");

  const alerts = useLiveQuery(
    () => db.revisions.where("userId").equals(user?.id!).toArray(),
    [user?.id]
  );

  const handleRead = async (id: number) => {
    await markRevisionAsRead(id);
    toast.success("Revisão concluída!");
  };

  const handleReadAll = async () => {
    const unread = alerts?.filter(a => a.status !== "CONCLUIDA") || [];
    for (const a of unread) {
      await markRevisionAsRead(a.id!);
    }
    toast.success("Todos os alertas foram limpos!");
  };

  const filtered = alerts?.filter(a => {
    if (filter === "PENDENTES") return a.status !== "CONCLUIDA";
    if (filter === "LIDOS") return a.status === "CONCLUIDA";
    return true;
  }).filter(a => {
    if (!search) return true;
    return a.type?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display">Central de Alertas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas notificações.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleReadAll} leftIcon={<CheckCheck size={18} />}>
            Marcar todos
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/30 backdrop-blur-md p-2 rounded-[2rem] border border-border/40">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar alertas..."
          className="flex-1 w-full pl-6 pr-4 py-4 bg-transparent focus:outline-none text-sm"
        />
        <div className="flex gap-2 p-1 bg-muted/50 rounded-2xl">
          {["PENDENTES", "LIDOS", "TODOS"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered?.map(alert => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-5 border rounded-xl flex items-center justify-between ${
                alert.status === "CONCLUIDA" ? "opacity-60 bg-muted/20" : "bg-card hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <Bell size={20} className={alert.status === "CONCLUIDA" ? "text-muted-foreground" : "text-primary"} />
                <div>
                  <p className="font-bold text-sm">{alert.type || "Revisão"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.scheduledFor || alert.alertDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.status !== "CONCLUIDA" && (
                  <Button size="sm" onClick={() => handleRead(alert.id!)}>
                    <CheckCheck size={16} />
                  </Button>
                )}
                <button className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered?.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold">Tudo em dia!</h3>
            <p>Nenhum alerta encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
