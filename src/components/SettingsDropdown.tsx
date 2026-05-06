import React from 'react';

interface SettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-card/80 backdrop-blur-md border border-card-border shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-card-border/50">
          <div className="font-semibold text-white">System Admin</div>
          <div className="text-sm text-gray-400">admin@catchme.ai</div>
        </div>
        
        <div className="p-2">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Log Preferences
          </div>
          <label className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
            <span className="text-sm text-gray-300">Show critical logs only</span>
            <input type="checkbox" className="sr-only peer" />
            <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
          </label>
          <label className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
            <span className="text-sm text-gray-300">Auto-refresh logs</span>
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
          </label>
          <label className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
            <span className="text-sm text-gray-300">Enable AI insights</span>
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
          </label>
        </div>

        <div className="p-2 border-t border-card-border/50">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Privacy
          </div>
          <label className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
            <span className="text-sm text-gray-300">Anonymized logging</span>
            <input type="checkbox" className="sr-only peer" />
            <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
          </label>
          <label className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
            <span className="text-sm text-gray-300">Store session history</span>
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
          </label>
        </div>

        <div className="p-2 border-t border-card-border/50">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Theme
          </div>
          <label className="flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
            <span className="text-sm text-gray-300">Dark mode</span>
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
          </label>
        </div>
      </div>
    </>
  );
};
