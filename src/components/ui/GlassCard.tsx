import React, { forwardRef } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ children, className = '', hoverEffect = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-[var(--glass-bg)] backdrop-blur-[20px] backdrop-saturate-[180%]
        border border-[var(--glass-border)] rounded-[var(--radius-card)]
        shadow-[var(--glass-shadow)] transition-all duration-300
        dark:bg-[var(--glass-bg)] dark:border-white/10 dark:shadow-black/50
        ${hoverEffect ? 'hover:bg-[var(--glass-bg-hover)] hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/70' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});
GlassCard.displayName = 'GlassCard';
