"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface EventBarChartProps {
  data: { month: string, count: number }[];
}

export const EventBarChart = ({ data }: EventBarChartProps) => {
  return (
    <GlassCard className="p-6 h-80 flex flex-col">
      <h3 className="text-base font-bold text-white mb-5">ความเคลื่อนไหว (โพสต์/เดือน)</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/45 text-sm">ไม่มีข้อมูล</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} dx={-10} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                contentStyle={{
                  background: 'rgba(10,13,35,0.95)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '10px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.60)' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
};
