import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 text-sm
            bg-white/80 dark:bg-white/5
            border ${error ? 'border-rose-300' : 'border-slate-200 dark:border-white/10'}
            rounded-[var(--radius-input)]
            text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-600
            min-h-[100px] resize-y
            transition-all duration-200
            focus:outline-none
            focus:border-[#0066FF] dark:focus:border-[#4D9FFF]
            focus:bg-white dark:focus:bg-white/8
            focus:shadow-[0_0_0_3px_rgba(0,102,255,0.12)]
            disabled:opacity-40 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{error}</span>
        )}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';
