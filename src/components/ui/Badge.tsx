import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
}

export const Badge = ({ children, variant = 'gray', className = '', ...props }: BadgeProps) => {
  const variants = {
    blue:   'bg-blue-50   text-blue-600   border-blue-200   dark:bg-blue-950/50   dark:text-blue-300   dark:border-blue-800/60',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
    red:    'bg-rose-50   text-rose-600   border-rose-200   dark:bg-rose-950/50   dark:text-rose-300   dark:border-rose-800/60',
    yellow: 'bg-amber-50  text-amber-600  border-amber-200  dark:bg-amber-950/50  dark:text-amber-300  dark:border-amber-800/60',
    purple: 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
    gray:   'bg-slate-50  text-slate-500  border-slate-200  dark:bg-white/5       dark:text-slate-400  dark:border-white/10',
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
