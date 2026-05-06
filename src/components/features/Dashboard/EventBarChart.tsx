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
      <h3 className="text-lg font-bold text-gray-800 mb-6">ความเคลื่อนไหว (โพสต์/เดือน)</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
};
