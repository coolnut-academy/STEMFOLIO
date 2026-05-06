import React, { forwardRef } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  neon?: 'blue' | 'purple' | 'green' | 'red' | false;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', hoverEffect = false, neon = false, ...props }, ref) => {

    const neonBorder: Record<string, string> = {
      blue:   'border-[rgba(0,102,255,0.28)] shadow-[0_0_30px_rgba(0,102,255,0.10),0_8px_32px_rgba(0,0,0,0.06)]',
      purple: 'border-[rgba(124,58,237,0.28)] shadow-[0_0_30px_rgba(124,58,237,0.10),0_8px_32px_rgba(0,0,0,0.06)]',
      green:  'border-[rgba(5,150,105,0.28)] shadow-[0_0_30px_rgba(5,150,105,0.10),0_8px_32px_rgba(0,0,0,0.06)]',
      red:    'border-[rgba(225,29,72,0.28)] shadow-[0_0_30px_rgba(225,29,72,0.10),0_8px_32px_rgba(0,0,0,0.06)]',
    };

    const defaultStyle = 'border-[var(--glass-border)] shadow-[var(--glass-shadow)]';

    return (
      <div
        ref={ref}
        className={`
          bg-[var(--glass-bg)] backdrop-blur-[40px] backdrop-saturate-[180%]
          border rounded-[var(--radius-card)]
          transition-all duration-300
          ${neon ? neonBorder[neon] : defaultStyle}
          ${hoverEffect
            ? 'hover:border-[rgba(0,102,255,0.22)] hover:-translate-y-1.5 cursor-pointer hover:shadow-[0_8px_40px_rgba(0,66,180,0.13),0_2px_6px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] hover:bg-white/95'
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
