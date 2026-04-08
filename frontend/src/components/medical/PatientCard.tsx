import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Heart, Activity, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    age: number;
    currentBPM: number;
    status: 'normal' | 'warning' | 'critical';
    recentAlerts: number;
    lastReading: Date;
  };
  onClick?: () => void;
  isActive?: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onClick,
  isActive = false,
}) => {
  const statusConfig = {
    normal: { color: 'text-status-normal', bg: 'bg-status-normal-bg' },
    warning: { color: 'text-status-warning', bg: 'bg-status-warning-bg' },
    critical: { color: 'text-status-critical', bg: 'bg-status-critical-bg' },
  };
  
  const config = statusConfig[patient.status];
  
  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };
  
  return (
    <div
      onClick={onClick}
      className={clsx(
        'cursor-pointer',
        isActive && 'ring-2 ring-med-blue-500 rounded-lg'
      )}
    >
      <Card
        padding="md"
        hover={!isActive}
        className={clsx(
          'transition-all',
          isActive && 'shadow-clinical-md'
        )}
      >
      {/* Patient Info */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-clinical-gray-900">
            {patient.name}
          </h4>
          <p className="text-sm text-clinical-gray-600">
            Age {patient.age} • ID: {patient.id}
          </p>
        </div>
        <Badge variant={patient.status} size="sm">
          {patient.status}
        </Badge>
      </div>
      
      {/* Current BPM */}
      <div className={clsx('rounded-lg p-4 mb-3', config.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className={clsx('w-5 h-5', config.color)} />
            <span className="text-sm font-medium text-clinical-gray-800">
              Current BPM
            </span>
          </div>
          <span className={clsx('text-2xl font-mono font-bold', config.color)}>
            {patient.currentBPM}
          </span>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-clinical-gray-600">
          <Activity className="w-4 h-4" />
          <span>{getTimeSince(patient.lastReading)}</span>
        </div>
        
        {patient.recentAlerts > 0 && (
          <div className="flex items-center gap-1.5 text-status-warning">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{patient.recentAlerts} alerts</span>
          </div>
        )}
      </div>
    </Card>
    </div>
  );
};
