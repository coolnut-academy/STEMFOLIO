"use client";

import React, { useEffect, useState, useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

export const StatsCard = ({ label, value, icon, colorClass, bgClass }: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // simple count-up animation
          let start = 0;
          const end = value;
          if (start === end) return;
          
          const duration = 1000;
          const incrementTime = Math.abs(Math.floor(duration / end));
          
          const timer = setInterval(() => {
            start += 1;
            setDisplayValue(start);
            if (start === end) {
              clearInterval(timer);
            }
          }, incrementTime);
          
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <GlassCard ref={cardRef} className="p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className={`text-4xl font-bold ${colorClass}`}>{displayValue}</span>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass} ${colorClass}`}>
        {icon}
      </div>
    </GlassCard>
  );
};
