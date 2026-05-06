import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading = false, className = '', disabled, ...props }, ref) => {
    
    const baseClasses = `inline-flex items-center justify-center font-medium rounded-[var(--radius-button)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed`;
    
    const variantClasses = {
      primary: `bg-[var(--accent-blue)] text-white hover:bg-blue-600 focus:ring-blue-500 shadow-md dark:shadow-blue-900/50 border border-transparent`,
      secondary: `bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] text-gray-800 dark:text-gray-200 hover:bg-[var(--glass-bg-hover)] focus:ring-gray-300 dark:focus:ring-gray-700 shadow-sm`,
      danger: `bg-[var(--accent-red)] text-white hover:bg-red-600 focus:ring-red-500 shadow-md dark:shadow-red-900/50 border border-transparent`,
      ghost: `bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 focus:ring-gray-300 dark:focus:ring-gray-700 border border-transparent`,
      outline: `bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm focus:ring-gray-300 dark:focus:ring-gray-600`,
    };
    
    const sizeClasses = {
      sm: `px-3 py-1.5 text-sm`,
      md: `px-4 py-2 text-base`,
      lg: `px-6 py-3 text-lg`,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {loading && <Spinner className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
