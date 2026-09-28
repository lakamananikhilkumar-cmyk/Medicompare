import React from 'react';
import { Sun, Moon, MapPin, Bell, Shield, Sliders } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { city, pincode, source } = useLocation();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your display, localization, and privacy preferences.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Appearance Section */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-teal-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Theme Appearance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toggle between light and dark clinical interface modes
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>

        {/* Location Preferences */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Current Search Origin</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active: <strong className="text-slate-900 dark:text-white">{city}</strong> ({pincode || 'GPS coords'}) • Source: {source}
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Health Query Privacy Standard</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            MediCompare does not sell or share personal search logs or medicine bookmark data with pharmaceutical advertisers or third-party brokers.
          </p>
        </div>
      </div>
    </div>
  );
};
