import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading = false, className = '', disabled, ...props }, ref) => {

    const base = `
      inline-flex items-center justify-center font-semibold
      rounded-[var(--radius-button)] transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,102,255,0.45)] focus-visible:ring-offset-2
      disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.97] select-none
    `;

    const variants = {
      primary: `
        bg-[#0066FF] text-white border border-[#0066FF]
        hover:bg-[#0052CC] hover:shadow-[var(--glow-blue)] hover:scale-[1.02]
      `,
      secondary: `
        bg-white border border-[rgba(0,102,255,0.22)] text-[#0066FF]
        hover:bg-blue-50 hover:border-[rgba(0,102,255,0.45)]
        hover:shadow-[0_0_18px_rgba(0,102,255,0.18)]
        dark:bg-white/8 dark:text-[#4D9FFF] dark:border-[rgba(77,159,255,0.25)]
      `,
      danger: `
        bg-white border border-rose-200 text-rose-600
        hover:bg-rose-50 hover:border-rose-300
        hover:shadow-[0_0_15px_rgba(225,29,72,0.18)]
      `,
      ghost: `
        bg-transparent border border-transparent text-slate-500
        hover:text-slate-700 hover:bg-slate-100
        dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/8
      `,
      outline: `
        bg-white border border-slate-200 text-slate-700
        hover:border-slate-300 hover:bg-slate-50
        dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2   text-sm  gap-2',
      lg: 'px-6 py-3   text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Spinner className="w-4 h-4" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
