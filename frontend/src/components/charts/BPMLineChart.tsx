import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CustomTooltipProps } from '../../types';

interface BPMChartDataPoint {
  time?: string;
  timestamp?: string;
  bpm: number;
}

interface BPMLineChartProps {
  data: BPMChartDataPoint[];
  height?: number;
}

export const BPMLineChart: React.FC<BPMLineChartProps> = ({ data, height = 300 }) => {
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const bpm = payload[0].value;
      let status = 'Normal';
      let statusColor = '#10B981';
      
      if (bpm < 50 || bpm > 120) {
        status = 'Critical';
        statusColor = '#EF4444';
      } else if (bpm < 60 || bpm > 100) {
        status = 'Warning';
        statusColor = '#F59E0B';
      }
      
      return (
        <div className="bg-clinical-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-clinical-gray-700">
          <p className="font-mono text-lg font-bold" style={{ color: statusColor }}>
            {bpm} BPM
          </p>
          <p className="text-xs mt-1 text-clinical-gray-400">
            {String(payload[0].payload.time || payload[0].payload.timestamp || '')}
          </p>
          <p className="text-xs mt-1" style={{ color: statusColor }}>{status}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        
        {/* Reference zones */}
        <ReferenceLine y={50} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.3} />
        <ReferenceLine y={120} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.3} />
        <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="3 3" strokeOpacity={0.2} />
        <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="3 3" strokeOpacity={0.2} />
        
        <XAxis
          dataKey="time"
          stroke="#9BA3AF"
          style={{ fontSize: '12px', fontFamily: 'Inter' }}
        />
        <YAxis
          stroke="#9BA3AF"
          style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
          domain={[40, 140]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="bpm"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', r: 3 }}
          activeDot={{ r: 6, fill: '#2563EB' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
