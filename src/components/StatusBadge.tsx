import React from 'react';
import { Severity } from '@/types';

interface StatusBadgeProps {
  severity: Severity;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ severity }) => {
  const getSeverityColors = (sev: Severity) => {
    switch (sev) {
      case 'critical':
        return 'bg-critical/10 text-critical border-critical/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved':
        return 'bg-resolved/10 text-resolved border-resolved/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getSeverityColors(
        severity
      )}`}
    >
      {severity}
    </span>
  );
};
