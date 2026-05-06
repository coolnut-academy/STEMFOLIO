"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TimelineEvent } from '@/types';
import { Clock } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';

interface DeadlineTrackerProps {
  deadlines: {event: TimelineEvent, projectTitle: string, projectId: string}[];
}

export const DeadlineTracker = ({ deadlines }: DeadlineTrackerProps) => {
  if (deadlines.length === 0) {
    return (
      <GlassCard className="p-6 h-full flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" /> Deadline ที่กำลังจะมาถึง
        </h3>
        <div className="flex-1 flex items-center justify-center text-gray-400">ไม่มี Deadline ในขณะนี้</div>
      </GlassCard>
    );
  }

  const grouped = deadlines.reduce((acc, curr) => {
    if (!curr.event.deadline) return acc;
    const date = curr.event.deadline.toDate();
    const month = date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(curr);
    return acc;
  }, {} as Record<string, typeof deadlines>);

  return (
    <GlassCard className="p-6 flex flex-col max-h-[500px]">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" /> Deadline ที่กำลังจะมาถึง
      </h3>
      <div className="overflow-y-auto pr-2 flex flex-col gap-4">
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <h4 className="text-sm font-semibold text-gray-500 mb-2 sticky top-0 bg-white/80 backdrop-blur-sm py-1">{month}</h4>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => {
                const date = item.event.deadline!.toDate();
                const daysDiff = differenceInDays(date, new Date());
                
                let colorClass = 'border-l-green-500 bg-green-50';
                if (daysDiff < 3) colorClass = 'border-l-red-500 bg-red-50';
                else if (daysDiff < 7) colorClass = 'border-l-yellow-500 bg-yellow-50';

                return (
                  <Link href={`/project/${item.projectId}`} key={`${item.projectId}-${item.event.id}-${idx}`}>
                    <div className={`p-3 rounded-r-lg border border-l-4 border-y-gray-100 border-r-gray-100 hover:shadow-md transition-shadow ${colorClass}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-medium text-gray-800 line-clamp-1">{item.event.competitionName || item.event.title}</div>
                        <div className="text-xs font-bold whitespace-nowrap opacity-70">
                          {daysDiff === 0 ? 'วันนี้' : `อีก ${daysDiff} วัน`}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">{item.projectTitle}</div>
                      <div className="text-xs text-gray-400 mt-1">{date.toLocaleDateString('th-TH')}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
