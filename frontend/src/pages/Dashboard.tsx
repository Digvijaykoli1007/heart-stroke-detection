import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { BPMDisplay } from '../components/medical/BPMDisplay';
import { BPMLineChart } from '../components/charts/BPMLineChart';
import { SpO2LineChart } from '../components/charts/SpO2LineChart';
import { Activity, AlertCircle, Wind } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { fetchLatestVitals } from '../services/firebaseApi';
import { ChartDataPoint } from '../types';

export const Dashboard: React.FC = () => {
  const { } = useAuth();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentBPM, setCurrentBPM] = useState<number | null>(null);
  const [currentSpO2, setCurrentSpO2] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const lastTimeRef = React.useRef<string | null>(null);

  // Poll Firebase Realtime Database
  useEffect(() => {
    setIsLoading(false); // Immediate load since we poll

    const updateDashboard = async () => {
      const latest = await fetchLatestVitals();
      
      // If no data or data is missing time, we treat as disconnected/idle
      if (!latest || !latest.time) {
        setIsConnected(false);
        setCurrentBPM(null);
        setCurrentSpO2(null);
        return;
      }

      // ONLY update if it's a NEW reading (timestamp changed)
      if (latest.time === lastTimeRef.current) {
        // Data is same as before, don't update chart or current values
        // This stops the graph from moving until new hardware data arrives
        return;
      }

      // New unique reading arrived!
      lastTimeRef.current = latest.time;
      setIsConnected(true);
      setCurrentBPM(latest.heartRate);
      setCurrentSpO2(latest.spo2);

      const timeLabel = new Date(latest.time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setChartData(prev => [
        ...prev.slice(-23), // Keep last 23 points for chart
        { time: timeLabel, bpm: latest.heartRate, spo2: latest.spo2 }
      ]);
    };

    updateDashboard(); // initial sync
    const interval = setInterval(updateDashboard, 3000); 
    return () => clearInterval(interval);
  }, []);

  const getBPMStatus = (bpm: number | null): 'normal' | 'warning' | 'critical' => {
    if (bpm == null || isNaN(bpm)) return 'normal';
    if (bpm < 50 || bpm > 120) return 'critical';
    if (bpm < 60 || bpm > 100) return 'warning';
    return 'normal';
  };

  const getSpO2Status = (spo2: number | null): 'normal' | 'warning' | 'critical' => {
    if (spo2 == null || isNaN(spo2)) return 'normal';
    if (spo2 < 90) return 'critical';
    if (spo2 < 95) return 'warning';
    return 'normal';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <Activity className="w-12 h-12 text-medical-blue-500 mx-auto" />
            </div>
            <p className="text-clinical-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const bpStatus = getBPMStatus(currentBPM);
  const spo2Status = getSpO2Status(currentSpO2);
  const isCritical = bpStatus === 'critical' || spo2Status === 'critical';

  return (
    <DashboardLayout>
      {/* Critical Alert Banner */}
      {isCritical && (
        <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-rose-700">Critical Vitals Alert</p>
              <p className="text-sm text-rose-600">
                Patient vitals are in critical range. Check immediately.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hardware Connection Status */}
      <div className="mb-6 flex justify-end">
        <div className={clsx(
          "px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium",
          isConnected && currentBPM !== null ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"
        )}>
          <div className={clsx(
            "w-2.5 h-2.5 rounded-full",
            isConnected && currentBPM !== null ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
          )} />
          {isConnected && currentBPM !== null ? "Hardware Connected (Firebase)" : "Waiting for ESP32 Data..."}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Heart Rate Card */}
        <Card padding="lg">
          <CardHeader
            title="Real-time Heart Rate"
            subtitle="from Max30102 Sensor"
          />
          <div className="mt-6 flex justify-center">
            <BPMDisplay
              bpm={currentBPM}
              status={getBPMStatus(currentBPM)}
              lastUpdate={new Date()}
              size="lg"
              showAnimation={true}
            />
          </div>
        </Card>

        {/* SpO2 Card */}
        <Card padding="lg">
          <CardHeader
            title="Blood Oxygen (SpO2)"
            subtitle="from Max30102 Sensor"
          />
          <div className="mt-6 flex justify-center items-center h-full pb-10">
            <div className="relative flex flex-col items-center justify-center text-center">
                <div className={clsx(
                  'rounded-full p-6 mb-6',
                  spo2Status === 'normal' ? 'bg-indigo-50 text-indigo-500' :
                  spo2Status === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                )}>
                  <Wind className="w-16 h-16" />
                </div>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={clsx(
                    "text-8xl font-bold font-heading tabular-nums",
                    spo2Status === 'normal' ? 'text-indigo-600' :
                    spo2Status === 'warning' ? 'text-amber-600' : 'text-rose-600'
                  )}>
                    {currentSpO2 ?? '--'}
                  </span>
                  <span className="text-3xl font-semibold text-neutral-400">%</span>
                </div>
                <div className={clsx(
                  "px-4 py-1.5 rounded-full text-sm font-semibold",
                  spo2Status === 'normal' ? 'bg-indigo-100 text-indigo-700' :
                  spo2Status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                )}>
                  {spo2Status === 'normal' ? 'Optimal Range' : spo2Status === 'warning' ? 'Monitor Closely' : 'Hypoxia Alert'}
                </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Trends Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card padding="md">
            <CardHeader
              title="Heart Rate History"
              subtitle="Real-time monitoring"
            />
            <div className="mt-4">
              <BPMLineChart data={chartData} height={350} />
            </div>
          </Card>
          <Card padding="md">
            <CardHeader
              title="SpO2 History"
              subtitle="Real-time monitoring"
            />
            <div className="mt-4">
              <SpO2LineChart data={chartData} height={350} />
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};
