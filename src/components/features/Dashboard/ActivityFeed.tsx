"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TimelineEvent } from '@/types';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface ActivityFeedProps {
  activities: {event: TimelineEvent, projectId: string}[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <GlassCard className="p-6 flex flex-col max-h-[500px]">
      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-[#a78bfa]" /> ความเคลื่อนไหวล่าสุด
      </h3>

      {activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/45 text-sm">ยังไม่มีความเคลื่อนไหว</div>
      ) : (
        <div className="overflow-y-auto pr-1 flex flex-col gap-2.5">
          {activities.map((item, idx) => (
            <Link href={`/project/${item.projectId}`} key={`${item.projectId}-${item.event.id}-${idx}`}>
              <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.07)]
                bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(99,102,241,0.08)]
                hover:border-[rgba(99,102,241,0.22)]
                transition-all flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={item.event.type === 'progress' ? 'blue' : item.event.type === 'submission' ? 'purple' : 'green'}
                  >
                    {item.event.type === 'progress' ? 'อัปเดต' : item.event.type === 'submission' ? 'ส่งแข่ง' : 'ประกาศผล'}
                  </Badge>
                  <span className="text-[11px] text-white/50">
                    {item.event.createdAt ? formatDistanceToNow(item.event.createdAt.toDate(), { addSuffix: true, locale: th }) : ''}
                  </span>
                </div>
                <div className="text-sm font-medium text-white/85 line-clamp-2 leading-snug">{item.event.title}</div>
                <div className="text-xs text-white/45 line-clamp-1">โปรเจกต์ ID: {item.projectId}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
