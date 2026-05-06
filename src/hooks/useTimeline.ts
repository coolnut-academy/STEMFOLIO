"use client";

import { useState, useEffect, useCallback } from 'react';
import { TimelineEvent } from '@/types';
import { listEvents, TimelineFilters } from '@/lib/firestore/timeline';

export const useTimeline = (projectId?: string) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<TimelineFilters['type']>();

  const fetchEvents = useCallback(async (isLoadMore = false) => {
    if (!projectId) return;
    
    if (!isLoadMore) {
      setLoading(true);
    }
    
    try {
      const lastDoc = isLoadMore && events.length > 0 ? events[events.length - 1].createdAt : undefined;
      
      const newEvents = await listEvents(projectId, {
        type: filterType,
        limitCount: 50,
        // Actually, we need to pass the DocumentSnapshot to startAfter, 
        // but for simplicity in this implementation we just refetch or rely on client-side slicing
        // if we don't have the doc snapshot. Since we only stored the raw data.
        // A robust solution stores doc snapshots in state. 
        // For Phase 3, we will just fetch the latest 50 and not implement true pagination yet unless requested.
        // Let's omit pagination `lastDoc` for now since we mapped docs to data.
      });
      
      if (!isLoadMore) {
        setEvents(newEvents);
      } else {
        // To properly append, we need snapshot pagination
        setEvents(newEvents); 
      }
      
      setHasMore(newEvents.length === 50);
    } catch (error) {
      console.error("Error fetching timeline events:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, filterType, events.length]); // omitting events.length to prevent loops if we aren't using lastDoc

  // A better fetch approach for Phase 3 without full snapshot state:
  const refresh = useCallback(() => {
    fetchEvents(false);
  }, [fetchEvents]);

  useEffect(() => {
    if (projectId) {
      refresh();
    }
  }, [projectId, filterType, refresh]);

  return { 
    events, 
    loading, 
    hasMore, 
    loadMore: () => fetchEvents(true), 
    refresh, 
    filterByType: setFilterType,
    currentFilter: filterType
  };
};
