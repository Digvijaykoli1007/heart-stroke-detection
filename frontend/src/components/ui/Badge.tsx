import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'normal' | 'warning' | 'critical' | 'info';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  size = 'md',
  icon,
  className,
}) => {
  const variants = {
    normal: 'bg-status-normal-bg text-green-800 border-status-normal-border',
    warning: 'bg-status-warning-bg text-amber-800 border-status-warning-border',
    critical: 'bg-status-critical-bg text-red-800 border-status-critical-border',
    info: 'bg-status-info-bg text-blue-800 border-blue-300',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full border uppercase tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
};
