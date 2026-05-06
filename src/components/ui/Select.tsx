import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-3 py-2.5 text-sm
            bg-[var(--input-bg)]
            border ${error ? 'border-[rgba(239,68,68,0.45)]' : 'border-[var(--input-border)]'}
            rounded-[var(--radius-input)]
            text-white/85
            appearance-none cursor-pointer
            backdrop-blur-[8px]
            transition-all duration-200
            focus:outline-none
            focus:border-[rgba(99,102,241,0.55)]
            focus:bg-[rgba(255,255,255,0.08)]
            focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]
            disabled:opacity-40 disabled:cursor-not-allowed
            [&>option]:bg-[#0e1228] [&>option]:text-white/85
            ${className}
          `}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && (
          <span className="text-[11px] font-medium text-[#f87171]">{error}</span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
