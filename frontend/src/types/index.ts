// Type definitions for API responses and data structures

export interface HeartbeatRecord {
  id: string;
  bpm: number;
  timestamp: Date;
  source: string;
}

export interface Alert {
  id: string;
  type: 'CRITICAL' | 'TACHYCARDIA' | 'BRADYCARDIA';
  alertType?: 'CRITICAL' | 'TACHYCARDIA' | 'BRADYCARDIA';
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

export interface ChartDataPoint {
  time?: string;
  timestamp?: string;
  bpm: number;
}

export interface BPMUpdateData {
  userId: string;
  bpm: number;
  timestamp: Date;
  source: string;
}

export interface AlertCreatedData {
  id: string;
  type: Alert['type'];
  alertType?: Alert['type'];
  message: string;
  timestamp: Date;
  dismissed?: boolean;
}

export interface TooltipPayload {
  color: string;
  dataKey: string;
  fill: string;
  name: string;
  payload: ChartDataPoint;
  type: string;
  unit: string | undefined;
  value: number;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}
