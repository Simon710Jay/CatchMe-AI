import React from 'react';
import { Log } from '@/types';
import { StatusBadge } from './StatusBadge';

interface LogTableProps {
  logs: Log[];
}

export const LogTable: React.FC<LogTableProps> = ({ logs }) => {
  return (
    <div className="bg-card border border-card-border rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="px-5 md:px-6 py-4 md:py-5 border-b border-card-border">
        <h2 className="text-lg font-semibold text-white">System Logs</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-card-border/50 bg-card-border/20 text-gray-400 text-sm">
              <th className="px-4 md:px-6 py-3 font-medium">Timestamp</th>
              <th className="px-4 md:px-6 py-3 font-medium">Service</th>
              <th className="px-4 md:px-6 py-3 font-medium">Message</th>
              <th className="px-4 md:px-6 py-3 font-medium">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/50">
            {logs.map((log) => (
              <tr 
                key={log.id} 
                className="hover:bg-white/5 cursor-pointer transition-all duration-200 group"
                onClick={() => console.log('Row clicked:', log.id)}
              >
                <td className="px-5 md:px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="px-5 md:px-6 py-4 text-sm font-medium text-white whitespace-nowrap">
                  {log.service}
                </td>
                <td className="px-5 md:px-6 py-4 text-sm text-gray-300">
                  {log.message}
                </td>
                <td className="px-5 md:px-6 py-4 whitespace-nowrap">
                  <StatusBadge severity={log.severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
