"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { StudyTask } from "@/lib/db";
import { generateRevisionAlerts } from "@/lib/revision";

export function useTasks() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const allTasks = await db.tasks.toArray();
    setTasks(allTasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (task: Omit<StudyTask, "id" | "createdAt">) => {
    const newTask: StudyTask = {
      ...task,
      createdAt: Date.now(),
    };
    await db.tasks.add(newTask);
    await fetchTasks();
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: number, updates: Partial<StudyTask>) => {
    await db.tasks.update(id, updates);
    await fetchTasks();
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: number) => {
    await db.tasks.delete(id);
    await fetchTasks();
  }, [fetchTasks]);

  const completeTask = useCallback(async (id: number) => {
    await db.tasks.update(id, {
      status: "COMPLETED",
      completedAt: Date.now(),
    });
    await generateRevisionAlerts(id, "task");
    await fetchTasks();
  }, [fetchTasks]);

  const getTasksByStatus = useCallback((status: StudyTask["status"]) => {
    return tasks.filter(t => t.status === status);
  }, [tasks]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    getTasksByStatus,
    refresh: fetchTasks,
  };
}
