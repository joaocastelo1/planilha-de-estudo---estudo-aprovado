"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { Notification } from "@/lib/db";

export function useAlerts() {
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    const allAlerts = await db.notifications.toArray();
    const now = Date.now();
    const activeAlerts = allAlerts.filter(alert => 
      alert.scheduledFor && alert.scheduledFor <= now && !alert.isRead && !alert.isDismissed
    );
    setAlerts(activeAlerts);
    setUnreadCount(activeAlerts.length);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const markAsRead = useCallback(async (id: number) => {
    await db.notifications.update(id, { isRead: true });
    await fetchAlerts();
  }, [fetchAlerts]);

  const dismissAlert = useCallback(async (id: number) => {
    await db.notifications.update(id, { isDismissed: true });
    await fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    dismissAlert,
    refresh: fetchAlerts,
  };
}
