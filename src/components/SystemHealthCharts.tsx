import React from 'react';

export const SystemHealthCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-[#111827] border border-white/10 rounded-xl p-6 h-64 flex flex-col">
        <h3 className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-wider">System Health (24h)</h3>
        <div className="flex-1 w-full bg-blue-500/5 rounded-lg border border-blue-500/10 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-end px-4 gap-1">
            {[40, 70, 45, 90, 65, 80, 95, 70, 85, 90, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <span className="relative text-blue-400 font-mono text-xs font-bold bg-[#111827]/80 px-2 py-1 rounded">HEALTH_STABLE</span>
        </div>
      </div>
      
      <div className="bg-[#111827] border border-white/10 rounded-xl p-6 h-64 flex flex-col">
        <h3 className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-wider">Error Distribution</h3>
        <div className="flex-1 w-full bg-red-500/5 rounded-lg border border-red-500/10 flex items-center justify-center relative overflow-hidden">
          <div className="w-32 h-32 rounded-full border-8 border-red-500/20 border-t-red-500 animate-spin-slow"></div>
          <span className="absolute text-red-400 font-mono text-xs font-bold">142_ERRORS</span>
        </div>
      </div>
    </div>
  );
};
