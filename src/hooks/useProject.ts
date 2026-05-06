"use client";

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';
import { getProject } from '@/lib/firestore/projects';

export const useProject = (projectId?: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, refresh: fetchProject };
};
