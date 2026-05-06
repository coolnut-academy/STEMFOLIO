"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultDonutChartProps {
  data: { result: string, count: number }[];
}

const COLORS: Record<string, string> = {
  'ผ่าน': '#22c55e', // green-500
  'ไม่ผ่าน': '#ef4444', // red-500
  'รางวัล': '#3b82f6', // blue-500
  'รอผล': '#eab308' // yellow-500
};

export const ResultDonutChart = ({ data }: ResultDonutChartProps) => {
  return (
    <GlassCard className="p-6 h-80 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-2">สัดส่วนผลลัพธ์การแข่งขัน</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
      ) : (
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="result"
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.result] || '#cbd5e1'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
};
