import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CustomTooltipProps } from '../../types';

interface SpO2ChartDataPoint {
  time?: string;
  timestamp?: string;
  spo2?: number;
}

interface SpO2LineChartProps {
  data: SpO2ChartDataPoint[];
  height?: number;
}

export const SpO2LineChart: React.FC<SpO2LineChartProps> = ({ data, height = 300 }) => {
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const spo2 = payload[0].value;
      let status = 'Normal';
      let statusColor = '#6366F1'; // indigo-500
      
      if (spo2 < 90) {
        status = 'Critical';
        statusColor = '#EF4444'; // rose-500
      } else if (spo2 < 95) {
        status = 'Warning';
        statusColor = '#F59E0B'; // amber-500
      }
      
      return (
        <div className="bg-clinical-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-clinical-gray-700">
          <p className="font-mono text-lg font-bold" style={{ color: statusColor }}>
            {spo2}%
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
        
        {/* Reference zones for SpO2 */}
        <ReferenceLine y={90} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.3} />
        <ReferenceLine y={95} stroke="#F59E0B" strokeDasharray="3 3" strokeOpacity={0.2} />
        
        <XAxis
          dataKey="time"
          stroke="#9BA3AF"
          style={{ fontSize: '12px', fontFamily: 'Inter' }}
        />
        <YAxis
          stroke="#9BA3AF"
          style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
          domain={[80, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="spo2"
          stroke="#6366F1"
          strokeWidth={2}
          dot={{ fill: '#6366F1', r: 3 }}
          activeDot={{ r: 6, fill: '#4F46E5' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
