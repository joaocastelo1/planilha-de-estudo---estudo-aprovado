"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { StudySession } from "@/lib/db";

export function useStudySessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const allSessions = await db.studySessions.toArray();
    setSessions(allSessions.sort((a, b) => (b.startTime || 0) - (a.startTime || 0)));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    refresh: fetchSessions,
  };
}
