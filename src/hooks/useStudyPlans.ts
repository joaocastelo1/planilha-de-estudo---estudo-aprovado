"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { StudyPlan } from "@/lib/db";

export function useStudyPlans() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const allPlans = await db.studyPlans.toArray();
    setPlans(allPlans.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (plan: Omit<StudyPlan, "id" | "createdAt">) => {
    const newPlan: StudyPlan = {
      ...plan,
      createdAt: Date.now(),
    };
    await db.studyPlans.add(newPlan);
    await fetchPlans();
  }, [fetchPlans]);

  const updatePlan = useCallback(async (id: number, updates: Partial<StudyPlan>) => {
    await db.studyPlans.update(id, updates);
    await fetchPlans();
  }, [fetchPlans]);

  const deletePlan = useCallback(async (id: number) => {
    await db.studyPlans.delete(id);
    await fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    createPlan,
    updatePlan,
    deletePlan,
    refresh: fetchPlans,
  };
}
