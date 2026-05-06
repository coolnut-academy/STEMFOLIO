"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryPieChartProps {
  data: { category: string, count: number }[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4'];

export const CategoryPieChart = ({ data }: CategoryPieChartProps) => {
  return (
    <GlassCard className="p-6 h-80 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-2">สัดส่วนหมวดหมู่โครงงาน</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">ไม่มีข้อมูล</div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                outerRadius={80}
                dataKey="count"
                nameKey="category"
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
