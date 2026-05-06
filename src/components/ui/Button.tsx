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
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,0.50)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060918]
      disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.97] select-none
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7]
        text-white border border-[rgba(99,102,241,0.30)]
        shadow-[0_10px_30px_rgba(99,102,241,0.28)]
        hover:brightness-110 hover:shadow-[0_12px_36px_rgba(99,102,241,0.38)]
        hover:scale-[1.02]
      `,
      secondary: `
        bg-[rgba(255,255,255,0.07)] text-white/85
        border border-[rgba(255,255,255,0.12)]
        backdrop-blur-[8px]
        hover:bg-[rgba(255,255,255,0.11)] hover:border-[rgba(255,255,255,0.18)]
        hover:text-white
      `,
      danger: `
        bg-[rgba(239,68,68,0.12)] text-[#f87171]
        border border-[rgba(239,68,68,0.25)]
        hover:bg-[rgba(239,68,68,0.18)] hover:border-[rgba(239,68,68,0.40)]
        hover:shadow-[0_0_16px_rgba(239,68,68,0.22)]
      `,
      ghost: `
        bg-transparent border border-transparent
        text-white/60
        hover:text-white/90 hover:bg-[rgba(255,255,255,0.05)]
      `,
      outline: `
        bg-transparent text-white/70
        border border-[rgba(255,255,255,0.12)]
        hover:border-[rgba(99,102,241,0.40)] hover:text-white
        hover:bg-[rgba(99,102,241,0.08)]
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
