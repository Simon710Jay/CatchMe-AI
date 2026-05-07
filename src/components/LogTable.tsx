"use client";

import React from 'react';
import { Log } from '@/types';
import { StatusBadge } from './StatusBadge';

interface LogTableProps {
  logs: Log[];
}

export const LogTable: React.FC<LogTableProps> = ({ logs }) => {
  return (
    <div className="bg-[#111827] rounded-xl p-5 border border-white/5 flex flex-col h-full">
      <h2 className="text-white font-semibold mb-4 text-lg">System Logs</h2>
      
      <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#111827] z-10 shadow-sm">
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr 
                  key={log._id} 
                  className="hover:bg-white/5 cursor-pointer transition-all duration-200 group active:bg-white/10"
                >
                  <td className="px-4 py-4 text-sm text-gray-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-white whitespace-nowrap">
                    {log.service}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 min-w-[300px]">
                    {log.message}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge severity={log.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
