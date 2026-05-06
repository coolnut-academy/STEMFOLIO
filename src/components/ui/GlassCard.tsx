import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const GlassCard = ({ children, className = '', hoverEffect = false, ...props }: GlassCardProps) => {
  return (
    <div
      className={`
        bg-[var(--glass-bg)] backdrop-blur-[20px] backdrop-saturate-[180%]
        border border-[var(--glass-border)] rounded-[var(--radius-card)]
        shadow-[var(--glass-shadow)] transition-all duration-300
        ${hoverEffect ? 'hover:bg-[var(--glass-bg-hover)] hover:shadow-lg' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
