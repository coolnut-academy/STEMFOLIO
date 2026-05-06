"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultDonutChartProps {
  data: { result: string, count: number }[];
}

const COLORS: Record<string, string> = {
  'ผ่าน':   '#10b981',
  'ไม่ผ่าน': '#ef4444',
  'รางวัล': '#6366f1',
  'รอผล':   '#f59e0b',
};

export const ResultDonutChart = ({ data }: ResultDonutChartProps) => {
  return (
    <GlassCard className="p-6 h-80 flex flex-col">
      <h3 className="text-base font-bold text-white mb-2">สัดส่วนผลลัพธ์</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/45 text-sm">ไม่มีข้อมูล</div>
      ) : (
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={55}
                outerRadius={78}
                paddingAngle={4}
                dataKey="count"
                nameKey="result"
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.result] || '#8b5cf6'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,13,35,0.95)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: 'rgba(255,255,255,0.60)', fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
};
