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
      <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-card/80 backdrop-blur-md border border-card-border shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-white/10">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">👤 Profile</div>
          <div className="font-semibold text-white text-lg">System Admin</div>
          <div className="text-sm text-gray-400">admin@catchme.ai</div>
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
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-8 h-4 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 relative"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
