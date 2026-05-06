import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
}

export const Badge = ({ children, variant = 'gray', className = '', ...props }: BadgeProps) => {
  const variants = {
    blue:   'text-[#c7d2fe] bg-[rgba(99,102,241,0.18)]  border-[rgba(99,102,241,0.28)]',
    green:  'text-[#6ee7b7] bg-[rgba(16,185,129,0.18)]  border-[rgba(16,185,129,0.28)]',
    red:    'text-[#fca5a5] bg-[rgba(239,68,68,0.18)]    border-[rgba(239,68,68,0.28)]',
    yellow: 'text-[#fcd34d] bg-[rgba(245,158,11,0.18)]  border-[rgba(245,158,11,0.28)]',
    purple: 'text-[#d8b4fe] bg-[rgba(168,85,247,0.18)]  border-[rgba(168,85,247,0.28)]',
    orange: 'text-[#fdba74] bg-[rgba(249,115,22,0.18)]  border-[rgba(249,115,22,0.28)]',
    gray:   'text-white/50  bg-[rgba(255,255,255,0.07)]  border-[rgba(255,255,255,0.10)]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-semibold tracking-wide border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
