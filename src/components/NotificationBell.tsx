"use client";

import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { checkAllNotifications, markAsRead, dismissNotification } from "@/lib/notificationService";
import { Bell, X, CheckCheck, Clock, AlertTriangle, BookOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifications = useLiveQuery(
    () => db.notifications
      .where("isDismissed")
      .equals(0)
      .toArray(),
    []
  );

  useEffect(() => {
    const check = async () => {
      const all = await checkAllNotifications();
      setUnreadCount(all.length);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: number) => {
    await markAsRead(id);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleDismiss = async (id: number) => {
    await dismissNotification(id);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "REVISION_DUE": return <BookOpen size={14} className="text-purple-400" />;
      case "TASK_DUE": return <Clock size={14} className="text-amber-400" />;
      case "STREAK_REMINDER": return <AlertTriangle size={14} className="text-orange-400" />;
      default: return <Bell size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold">Notificações</h3>
              <span className="text-[10px] text-muted-foreground">{notifications?.length ?? 0} itens</span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {!notifications || notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <Bell size={24} className="mx-auto mb-2 opacity-30" />
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!n.isRead && (
                        <button onClick={() => handleMarkRead(n.id!)} className="p-1 rounded hover:bg-accent" title="Marcar como lida">
                          <CheckCheck size={12} className="text-emerald-400" />
                        </button>
                      )}
                      <button onClick={() => handleDismiss(n.id!)} className="p-1 rounded hover:bg-accent" title="Dispensar">
                        <X size={12} className="text-muted-foreground" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
