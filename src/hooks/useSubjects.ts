"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { Subject, ConcursoCategory } from "@/lib/db";

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    const allSubjects = await db.subjects.toArray();
    setSubjects(allSubjects.sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const createSubject = useCallback(async (subject: Omit<Subject, "id">) => {
    await db.subjects.add(subject);
    await fetchSubjects();
  }, [fetchSubjects]);

  const updateSubject = useCallback(async (id: number, updates: Partial<Subject>) => {
    await db.subjects.update(id, updates);
    await fetchSubjects();
  }, [fetchSubjects]);

  const deleteSubject = useCallback(async (id: number) => {
    await db.subjects.delete(id);
    await fetchSubjects();
  }, [fetchSubjects]);

  const getSubjectsByCategory = useCallback((category: ConcursoCategory) => {
    return subjects.filter(s => s.category === category);
  }, [subjects]);

  return {
    subjects,
    loading,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectsByCategory,
    refresh: fetchSubjects,
  };
}
