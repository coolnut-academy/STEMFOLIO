"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  getStats, getEventsByMonth, getResultDistribution, getCategoryDistribution, 
  getUpcomingDeadlines, getRecentActivity, getPendingDeleteRequests,
  DashboardFilters, DashboardStats 
} from '@/lib/firestore/dashboard';
import { TimelineEvent, Project } from '@/types';

export const useDashboardStats = (filters?: DashboardFilters) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [eventsByMonth, setEventsByMonth] = useState<{ month: string, count: number }[]>([]);
  const [resultDist, setResultDist] = useState<{ result: string, count: number }[]>([]);
  const [categoryDist, setCategoryDist] = useState<{ category: string, count: number }[]>([]);
  const [deadlines, setDeadlines] = useState<{event: TimelineEvent, projectTitle: string, projectId: string}[]>([]);
  const [activity, setActivity] = useState<{event: TimelineEvent, projectId: string}[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<{ event: TimelineEvent, project: Project }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        statsData,
        monthData,
        resultData,
        catData,
        dlData,
        actData,
        delData
      ] = await Promise.all([
        getStats(filters),
        getEventsByMonth(filters),
        getResultDistribution(filters),
        getCategoryDistribution(),
        getUpcomingDeadlines(),
        getRecentActivity(20),
        getPendingDeleteRequests()
      ]);

      setStats(statsData);
      setEventsByMonth(monthData);
      setResultDist(resultData);
      setCategoryDist(catData);
      setDeadlines(dlData);
      setActivity(actData);
      setDeleteRequests(delData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { 
    stats, 
    eventsByMonth, 
    resultDist, 
    categoryDist, 
    deadlines, 
    activity, 
    deleteRequests, 
    loading, 
    refresh: fetchAll 
  };
};
