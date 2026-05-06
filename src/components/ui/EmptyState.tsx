import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="
      relative flex flex-col items-center justify-center p-14 text-center
      bg-[var(--glass-bg)] backdrop-blur-[24px]
      border border-[var(--glass-border)]
      rounded-[var(--radius-card)] overflow-hidden
    ">
      <div className="empty-state-glow absolute inset-0 pointer-events-none" />

      {/* Corner brackets */}
      <span className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[rgba(99,102,241,0.28)] rounded-tl-sm" />
      <span className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[rgba(99,102,241,0.28)] rounded-tr-sm" />
      <span className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[rgba(99,102,241,0.28)] rounded-bl-sm" />
      <span className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[rgba(99,102,241,0.28)] rounded-br-sm" />

      <div className="relative flex flex-col items-center gap-5">
        <div className="
          w-20 h-20 rounded-full
          border border-[rgba(99,102,241,0.22)]
          bg-[rgba(99,102,241,0.08)]
          flex items-center justify-center
          shadow-[0_0_30px_rgba(99,102,241,0.10)]
          float-anim
        ">
          <div className="text-[#818cf8]/70">{icon}</div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white/80 mb-1.5">{title}</h3>
          {description && (
            <p className="text-sm text-white/58 max-w-sm leading-relaxed">{description}</p>
          )}
        </div>

        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
};
