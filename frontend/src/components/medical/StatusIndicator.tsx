import React from 'react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';

interface StatusIndicatorProps {
  status: 'normal' | 'warning' | 'critical';
  label: string;
  icon?: React.ReactNode;
  showDot?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  icon,
  showDot = true,
}) => {
  const dotColors = {
    normal: 'bg-status-normal',
    warning: 'bg-status-warning',
    critical: 'bg-status-critical',
  };
  
  return (
    <div className="flex items-center gap-2">
      {showDot && (
        <span className={clsx('w-2.5 h-2.5 rounded-full', dotColors[status])} />
      )}
      {icon}
      <Badge variant={status} size="sm">
        {label}
      </Badge>
    </div>
  );
};
