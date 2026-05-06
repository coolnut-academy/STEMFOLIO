import React, { forwardRef } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  neon?: 'blue' | 'purple' | 'green' | 'red' | false;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', hoverEffect = false, neon = false, ...props }, ref) => {

    const neonBorder: Record<string, string> = {
      blue:   'border-[rgba(99,102,241,0.30)] shadow-[0_0_32px_rgba(99,102,241,0.12),0_8px_40px_rgba(0,0,0,0.35)]',
      purple: 'border-[rgba(139,92,246,0.30)] shadow-[0_0_32px_rgba(139,92,246,0.12),0_8px_40px_rgba(0,0,0,0.35)]',
      green:  'border-[rgba(16,185,129,0.30)]  shadow-[0_0_32px_rgba(16,185,129,0.12),0_8px_40px_rgba(0,0,0,0.35)]',
      red:    'border-[rgba(239,68,68,0.30)]    shadow-[0_0_32px_rgba(239,68,68,0.12),0_8px_40px_rgba(0,0,0,0.35)]',
    };

    const defaultStyle = 'border-[var(--glass-border)] shadow-[var(--glass-shadow)]';

    return (
      <div
        ref={ref}
        className={`
          bg-[var(--glass-bg)] backdrop-blur-[24px] backdrop-saturate-[160%]
          border rounded-[var(--radius-card)]
          transition-all duration-300
          ${neon ? neonBorder[neon] : defaultStyle}
          ${hoverEffect
            ? 'hover:bg-[var(--glass-bg-hover)] hover:border-[rgba(99,102,241,0.25)] hover:translate-x-0.5 cursor-pointer hover:shadow-[0_12px_48px_rgba(0,0,0,0.45)]'
            : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
