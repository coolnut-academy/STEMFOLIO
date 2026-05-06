"use client";

import React, { useState } from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DashboardFilters } from '@/lib/firestore/dashboard';
import { FilterBar } from '@/components/features/Dashboard/FilterBar';
import { StatsCard } from '@/components/features/Dashboard/StatsCard';
import { EventBarChart } from '@/components/features/Dashboard/EventBarChart';
import { ResultDonutChart } from '@/components/features/Dashboard/ResultDonutChart';
import { CategoryPieChart } from '@/components/features/Dashboard/CategoryPieChart';
import { DeadlineTracker } from '@/components/features/Dashboard/DeadlineTracker';
import { ActivityFeed } from '@/components/features/Dashboard/ActivityFeed';
import { DeleteRequestQueue } from '@/components/features/Dashboard/DeleteRequestQueue';
import { Skeleton } from '@/components/ui/Skeleton';
import { Folder, Send, Clock, Trophy, AlertTriangle, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const { 
    stats, 
    eventsByMonth, 
    resultDist, 
    categoryDist, 
    deadlines, 
    activity, 
    deleteRequests, 
    loading, 
    refresh 
  } = useDashboardStats(filters);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมโครงการ (Dashboard)</h1>
      </div>

      <FilterBar onFilterChange={setFilters} />

      {loading && !stats ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {deleteRequests.length > 0 && (
            <DeleteRequestQueue requests={deleteRequests} onRefresh={refresh} />
          )}

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatsCard label="โครงงานทั้งหมด" value={stats.totalProjects} icon={<Folder className="w-6 h-6" />} colorClass="text-blue-600" bgClass="bg-blue-100" />
              <StatsCard label="ส่งแข่งแล้ว" value={stats.totalSubmissions} icon={<Send className="w-6 h-6" />} colorClass="text-purple-600" bgClass="bg-purple-100" />
              <StatsCard label="รอประกาศผล" value={stats.pendingResults} icon={<Clock className="w-6 h-6" />} colorClass="text-yellow-600" bgClass="bg-yellow-100" />
              <StatsCard label="ผ่าน/ได้รางวัล" value={stats.passedOrAwarded} icon={<Trophy className="w-6 h-6" />} colorClass="text-green-600" bgClass="bg-green-100" />
              <StatsCard label="เลยกำหนดส่ง" value={stats.missedDeadlines} icon={<AlertTriangle className="w-6 h-6" />} colorClass="text-red-600" bgClass="bg-red-100" />
              <StatsCard label="คำขอลบ" value={stats.pendingDeletes} icon={<Trash2 className="w-6 h-6" />} colorClass="text-orange-600" bgClass="bg-orange-100" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EventBarChart data={eventsByMonth} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultDonutChart data={resultDist} />
              <CategoryPieChart data={categoryDist} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeadlineTracker deadlines={deadlines} />
            <ActivityFeed activities={activity} />
          </div>
        </>
      )}
    </div>
  );
}
