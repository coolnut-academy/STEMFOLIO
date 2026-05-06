"use client";

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { listStudents, searchStudents } from '@/lib/firestore/users';

export const useStudents = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = async (query: string) => {
    setLoading(true);
    try {
      if (!query.trim()) {
        await fetchStudents();
      } else {
        const data = await searchStudents(query);
        setStudents(data);
      }
    } catch (error) {
      console.error("Error searching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, search, refresh: fetchStudents };
};
