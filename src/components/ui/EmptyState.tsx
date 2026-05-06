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
      bg-white/70 dark:bg-[rgba(8,12,30,0.70)]
      backdrop-blur-xl
      border border-slate-200/60 dark:border-white/6
      rounded-[var(--radius-card)] overflow-hidden
    ">
      {/* Subtle radial glow */}
      <div className="empty-state-glow absolute inset-0 pointer-events-none" />

      {/* Corner brackets */}
      <span className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[rgba(0,102,255,0.25)] rounded-tl-sm" />
      <span className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[rgba(0,102,255,0.25)] rounded-tr-sm" />
      <span className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[rgba(0,102,255,0.25)] rounded-bl-sm" />
      <span className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[rgba(0,102,255,0.25)] rounded-br-sm" />

      <div className="relative flex flex-col items-center gap-5">
        {/* Icon ring */}
        <div className="
          w-20 h-20 rounded-full
          border-2 border-blue-100 dark:border-blue-900/40
          bg-blue-50 dark:bg-blue-950/30
          flex items-center justify-center
          shadow-[0_0_30px_rgba(0,102,255,0.08)]
          float-anim
        ">
          <div className="text-blue-300 dark:text-blue-600">{icon}</div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{title}</h3>
          {description && (
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">{description}</p>
          )}
        </div>

        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
};
