"use client";

import { useState, useEffect, useCallback } from 'react';
import { Advisor } from '@/types';
import { listAdvisors, searchAdvisors } from '@/lib/firestore/advisors';

export const useAdvisors = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdvisors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdvisors();
      setAdvisors(data);
    } catch (error) {
      console.error("Error fetching advisors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = async (query: string) => {
    setLoading(true);
    try {
      if (!query.trim()) {
        await fetchAdvisors();
      } else {
        const data = await searchAdvisors(query);
        setAdvisors(data);
      }
    } catch (error) {
      console.error("Error searching advisors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, [fetchAdvisors]);

  return { advisors, loading, search, refresh: fetchAdvisors };
};
