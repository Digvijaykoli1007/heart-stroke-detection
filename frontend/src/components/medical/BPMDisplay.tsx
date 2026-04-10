import React from 'react';
import { clsx } from 'clsx';
import { Heart } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface BPMDisplayProps {
  bpm: number | null;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate?: Date;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export const BPMDisplay: React.FC<BPMDisplayProps> = ({
  bpm,
  status,
  lastUpdate,
  size = 'md',
  showAnimation = true,
}) => {
  const statusConfig = {
    normal: { 
      label: 'Healthy Range', 
      variant: 'normal' as const, 
      color: 'text-primary-600',
      bgGradient: 'from-primary-500 to-primary-600',
      glowColor: 'shadow-primary-500/30'
    },
    warning: { 
      label: 'Monitor Closely', 
      variant: 'warning' as const, 
      color: 'text-amber-600',
      bgGradient: 'from-amber-500 to-amber-600',
      glowColor: 'shadow-amber-500/30'
    },
    critical: { 
      label: 'Immediate Attention', 
      variant: 'critical' as const, 
      color: 'text-rose-600',
      bgGradient: 'from-rose-500 to-rose-600',
      glowColor: 'shadow-rose-500/30'
    },
  };
  
  const sizeClasses = {
    sm: { bpm: 'text-5xl', label: 'text-lg', icon: 'w-10 h-10' },
    md: { bpm: 'text-7xl', label: 'text-2xl', icon: 'w-16 h-16' },
    lg: { bpm: 'text-9xl', label: 'text-3xl', icon: 'w-20 h-20' },
  };
  
  const config = statusConfig[status];
  const sizes = sizeClasses[size];
  
  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center text-center">
      {/* Background Glow Effect */}
      <div className={clsx(
        'absolute inset-0 bg-gradient-to-br opacity-5 rounded-3xl blur-3xl',
        config.bgGradient
      )} />
      
      {/* Heart Icon with Enhanced Animation */}
      <div className="relative mb-6">
        <div className={clsx(
          'rounded-full p-4 bg-gradient-to-br shadow-xl',
          config.bgGradient,
          config.glowColor,
          showAnimation && 'animate-heartbeat'
        )}>
          <Heart
            className={clsx(sizes.icon, 'text-white')}
            fill="currentColor"
          />
        </div>
        
        {/* Pulse Rings */}
        {showAnimation && status === 'normal' && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-primary-500/10 animate-pulse" />
          </>
        )}
      </div>
      
      {/* BPM Value with Modern Typography */}
      <div className="relative flex items-baseline gap-3 mb-4">
        <span
          className={clsx(
            'font-heading font-bold tabular-nums leading-none tracking-tight',
            sizes.bpm,
            config.color
          )}
        >
          {bpm ?? '--'}
        </span>
        <span className={clsx(
          'font-heading font-semibold text-neutral-500 uppercase tracking-wider',
          sizes.label
        )}>
          BPM
        </span>
      </div>
      
      {/* Status Badge with Enhanced Styling */}
      <div className="mb-3">
        <Badge variant={config.variant} size="md" className="px-4 py-1.5 font-semibold">
          {config.label}
        </Badge>
      </div>
      {/* Last Update */}
      {lastUpdate && (
        <p className="mt-3 text-sm text-clinical-gray-500">
          Last updated: {getTimeSince(lastUpdate)}
        </p>
      )}
    </div>
  );
};
