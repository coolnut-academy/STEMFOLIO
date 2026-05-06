import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 text-sm
            bg-[var(--input-bg)]
            border ${error ? 'border-[rgba(239,68,68,0.45)] shadow-[0_0_10px_rgba(239,68,68,0.12)]' : 'border-[var(--input-border)]'}
            rounded-[var(--radius-input)]
            text-white/90
            placeholder-white/38
            backdrop-blur-[8px]
            transition-all duration-200
            focus:outline-none
            focus:border-[rgba(99,102,241,0.55)]
            focus:bg-[rgba(255,255,255,0.08)]
            focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]
            disabled:opacity-40 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[11px] font-medium text-[#f87171]">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
