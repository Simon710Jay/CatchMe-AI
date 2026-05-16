import React from 'react';
import { useStore } from '../store/useStore';
import { dashboardApi } from '../services/api';
import { toast } from 'sonner';

interface SettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useStore();

  if (!isOpen) return null;

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // Optimistic update
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    try {
      const res = await dashboardApi.updateTheme(newTheme);
      if (!res.success) {
        console.error('Failed to save theme preference:', res.error?.message || res.message);
      }
    } catch (error: any) {
      console.error('Failed to save theme preference:', error.response?.data?.error?.message || error.message);
      // Revert if failed? Usually not worth it for theme
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-card/80 backdrop-blur-md border border-card-border shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-white/10">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">👤 Profile</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-white text-lg">System Admin</div>
              <div className="text-sm text-gray-400">admin@catchme.ai</div>
            </div>
            <a 
              href="/settings/integrations"
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all border border-white/10"
              title="Integrations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
            </a>
          </div>
        </div>
        
        <div className="p-3 space-y-6 pb-5">
          {/* Log Preferences */}
          <div>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              📜 Log Preferences
            </div>
            <div className="space-y-1 mt-1">
              <label className="flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg cursor-pointer transition">
                <span className="text-sm text-gray-300">Show critical logs only</span>
                <input type="checkbox" className="sr-only peer" />
                <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
              </label>
              <label className="flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg cursor-pointer transition">
                <span className="text-sm text-gray-300">Auto-refresh logs</span>
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
              </label>
              <label className="flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg cursor-pointer transition">
                <span className="text-sm text-gray-300">Enable AI insights</span>
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
              </label>
            </div>
          </div>

          <div className="border-t border-white/10 mx-2" />

          {/* Privacy */}
          <div>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              🔒 Privacy
            </div>
            <div className="space-y-1 mt-1">
              <label className="flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg cursor-pointer transition">
                <span className="text-sm text-gray-300">Anonymized logging</span>
                <input type="checkbox" className="sr-only peer" />
                <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
              </label>
              <label className="flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg cursor-pointer transition">
                <span className="text-sm text-gray-300">Store session history</span>
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
              </label>
            </div>
          </div>

          <div className="border-t border-white/10 mx-2" />

          {/* Theme */}
          <div>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              🌙 Theme
            </div>
            <div className="space-y-1 mt-1">
              <label className="flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-lg cursor-pointer transition">
                <span className="text-sm text-gray-300">Dark mode</span>
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={theme === 'dark'} 
                  onChange={toggleTheme} 
                />
                <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
