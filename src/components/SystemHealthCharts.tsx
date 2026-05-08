"use client";

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export const SystemHealthCharts: React.FC = () => {
  const { healthHistory, errorDistribution } = useStore();

  const pieData = errorDistribution ? [
    { name: 'Critical', value: errorDistribution.critical, color: 'var(--color-critical)' },
    { name: 'Warning', value: errorDistribution.warning, color: 'var(--color-warning)' },
    { name: 'Resolved', value: errorDistribution.resolved, color: 'var(--color-resolved)' },
  ] : [];

  const chartData = healthHistory.map(point => ({
    ...point,
    time: format(new Date(point.timestamp), 'HH:mm:ss'),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Health History Chart */}
      <div className="bg-card border border-card-border rounded-xl p-6 h-80 flex flex-col shadow-lg">
        <h3 className="text-gray-400 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          System Health History
        </h3>
        <div className="flex-1 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="healthScore" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorHealth)" 
                  strokeWidth={2}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-sm animate-pulse">Waiting for telemetry data...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Error Distribution Chart */}
      <div className="bg-card border border-card-border rounded-xl p-6 h-80 flex flex-col shadow-lg">
        <h3 className="text-gray-400 text-xs font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Incident Distribution
        </h3>
        <div className="flex-1 w-full">
          {pieData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                   itemStyle={{ fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-gray-400 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center flex-col gap-2">
              <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin" />
              <p className="text-gray-500 text-sm">Calibrating incident metrics...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
