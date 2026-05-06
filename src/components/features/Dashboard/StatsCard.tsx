"use client";

import React, { useEffect, useState, useRef } from 'react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

const colorMap: Record<string, { icon: string; value: string; bg: string }> = {
  'text-blue-600':   { icon: 'text-[#818cf8]', value: 'text-[#c7d2fe]', bg: 'bg-[rgba(99,102,241,0.12)]  border-[rgba(99,102,241,0.20)]' },
  'text-purple-600': { icon: 'text-[#c4b5fd]', value: 'text-[#ddd6fe]', bg: 'bg-[rgba(139,92,246,0.12)]  border-[rgba(139,92,246,0.20)]' },
  'text-yellow-600': { icon: 'text-[#fcd34d]', value: 'text-[#fde68a]', bg: 'bg-[rgba(245,158,11,0.12)]  border-[rgba(245,158,11,0.20)]' },
  'text-green-600':  { icon: 'text-[#6ee7b7]', value: 'text-[#a7f3d0]', bg: 'bg-[rgba(16,185,129,0.12)]  border-[rgba(16,185,129,0.20)]' },
  'text-red-600':    { icon: 'text-[#fca5a5]', value: 'text-[#fecaca]', bg: 'bg-[rgba(239,68,68,0.12)]   border-[rgba(239,68,68,0.20)]' },
  'text-orange-600': { icon: 'text-[#fdba74]', value: 'text-[#fed7aa]', bg: 'bg-[rgba(249,115,22,0.12)]  border-[rgba(249,115,22,0.20)]' },
};

export const StatsCard = ({ label, value, icon, colorClass }: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const colors = colorMap[colorClass] ?? colorMap['text-blue-600'];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = value;
          if (start === end) return;

          const duration = 900;
          const incrementTime = Math.max(1, Math.abs(Math.floor(duration / end)));

          const timer = setInterval(() => {
            start += 1;
            setDisplayValue(start);
            if (start === end) clearInterval(timer);
          }, incrementTime);

          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={cardRef}
      className="
        relative flex flex-col gap-3 p-5
        bg-[var(--glass-bg)] backdrop-blur-[24px]
        border border-[var(--glass-border)]
        rounded-[var(--radius-card)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:bg-[var(--glass-bg-hover)]
        hover:border-[rgba(99,102,241,0.18)]
      "
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors.bg} ${colors.icon}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60 mb-0.5">{label}</p>
        <p className={`text-3xl font-bold ${colors.value}`}>{displayValue}</p>
      </div>
    </div>
  );
};
