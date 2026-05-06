import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
}

export const Badge = ({ children, variant = 'gray', className = '', ...props }: BadgeProps) => {
  const variantClasses = {
    blue: 'bg-blue-100 text-[var(--accent-blue)] border-blue-200',
    green: 'bg-green-100 text-[var(--accent-green)] border-green-200',
    red: 'bg-red-100 text-[var(--accent-red)] border-red-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-100 text-[var(--accent-purple)] border-purple-200',
    orange: 'bg-orange-100 text-[var(--accent-orange)] border-orange-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-pill)] text-xs font-medium border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
