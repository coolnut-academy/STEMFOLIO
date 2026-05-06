import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <select
          ref={ref}
          className={`
            w-full px-4 py-2 bg-[var(--glass-bg)] backdrop-blur-md
            border ${error ? 'border-[var(--accent-red)]' : 'border-[var(--glass-border)]'}
            rounded-[var(--radius-input)] focus:outline-none focus:ring-2
            focus:ring-[var(--accent-blue)] transition-shadow
            disabled:opacity-50 disabled:bg-gray-100 text-gray-800 appearance-none
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-[var(--accent-red)]">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
