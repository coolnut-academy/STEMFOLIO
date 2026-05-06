"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TimelineEvent } from '@/types';
import { Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';

interface DeadlineTrackerProps {
  deadlines: {event: TimelineEvent, projectTitle: string, projectId: string}[];
}

export const DeadlineTracker = ({ deadlines }: DeadlineTrackerProps) => {
  if (deadlines.length === 0) {
    return (
      <GlassCard className="p-6 h-full flex flex-col">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#818cf8]" /> Deadline ที่กำลังจะมาถึง
        </h3>
        <div className="flex-1 flex items-center justify-center text-white/45 text-sm">ไม่มี Deadline ในขณะนี้</div>
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
      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#818cf8]" /> Deadline ที่กำลังจะมาถึง
      </h3>
      <div className="overflow-y-auto pr-1 flex flex-col gap-4">
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55 mb-2 sticky top-0 bg-[rgba(6,9,24,0.85)] backdrop-blur-sm py-1">
              {month}
            </h4>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => {
                const date = item.event.deadline!.toDate();
                const daysDiff = differenceInDays(date, new Date());

                let borderColor = 'border-l-[#10b981]';
                let urgencyColor = 'text-[#6ee7b7]';
                if (daysDiff < 3) { borderColor = 'border-l-[#ef4444]'; urgencyColor = 'text-[#fca5a5]'; }
                else if (daysDiff < 7) { borderColor = 'border-l-[#f59e0b]'; urgencyColor = 'text-[#fcd34d]'; }

                return (
                  <Link href={`/project/${item.projectId}`} key={`${item.projectId}-${item.event.id}-${idx}`}>
                    <div className={`p-3 rounded-r-lg border-l-4 border border-[rgba(255,255,255,0.07)] ${borderColor}
                      bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(99,102,241,0.08)]
                      hover:border-[rgba(99,102,241,0.22)]
                      transition-all`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-sm font-medium text-white/88 line-clamp-1">
                          {item.event.competitionName || item.event.title}
                        </div>
                        <div className={`text-xs font-bold whitespace-nowrap ${urgencyColor}`}>
                          {daysDiff === 0 ? 'วันนี้' : `อีก ${daysDiff} วัน`}
                        </div>
                      </div>
                      <div className="text-xs text-white/58 line-clamp-1 mt-1">{item.projectTitle}</div>
                      <div className="text-xs text-white/40 mt-0.5">{date.toLocaleDateString('th-TH')}</div>
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
