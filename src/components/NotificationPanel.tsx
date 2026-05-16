import React, { useState } from 'react';
import { Notification } from '@/types';
import { dashboardApi } from '@/services/api';
import { StatusBadge } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { useStore } from '@/store/useStore';

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  isOpen, 
  onClose 
}) => {
  const [isClearing, setIsClearing] = useState(false);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    try {
      await dashboardApi.markNotificationAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const handleClearAll = async () => {
    if (!notifications.length || isClearing) return;
    
    // Optimistic UI update
    const previousNotifications = [...notifications];
    useStore.getState().setNotifications([]);
    setIsClearing(true);
    
    try {
      const res = await dashboardApi.clearAllNotifications();
      if (res.success) {
        toast.success('Notifications cleared');
      } else {
        // Revert on failure
        useStore.getState().setNotifications(previousNotifications);
        toast.error(res.message || 'Failed to clear notifications');
        console.error('Failed to clear notifications:', res);
      }
    } catch (error: any) {
      // Revert on failure
      useStore.getState().setNotifications(previousNotifications);
      
      let errorMessage = 'Failed to clear notifications';
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Backend may be offline.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to backend server (CORS or offline)';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
      console.error('Clear notifications error:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/20" 
        onClick={onClose}
      />
      <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-card/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            {notifications.filter(n => !n.read).length} Unread
          </span>
        </div>
        
        <div className="divide-y divide-white/5">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${!n.read ? 'bg-blue-500/5' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    <StatusBadge severity={n.severity} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium transition-colors ${!n.read ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 bg-white/5 border-t border-white/5 text-center flex justify-center">
          <button 
            className="text-[10px] text-gray-400 hover:text-white uppercase tracking-widest font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            onClick={handleClearAll}
            disabled={notifications.length === 0 || isClearing}
          >
            {isClearing ? (
              <>
                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Clearing...
              </>
            ) : (
              'Clear All'
            )}
          </button>
        </div>
      </div>
    </>
  );
};
