import React, { useState } from 'react';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { city, pincode, source, isLocating, error, setManualLocation, requestBrowserLocation } = useLocation();
  const [inputCity, setInputCity] = useState(city);
  const [inputPincode, setInputPincode] = useState(pincode);

  if (!isOpen) return null;

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    setManualLocation(inputCity, inputPincode);
    onClose();
  };

  const handleGps = async () => {
    await requestBrowserLocation();
    onClose();
  };

  const popularCities = [
    { city: 'Bengaluru', pincode: '560001' },
    { city: 'New Delhi', pincode: '110001' },
    { city: 'Mumbai', pincode: '400050' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose Your Location</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discover pharmacies and calculate price differences nearby</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800">
            {error}
          </div>
        )}

        {/* GPS Option */}
        <button
          onClick={handleGps}
          disabled={isLocating}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 mb-5 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Detecting GPS Location...' : 'Use My Current Location'}
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          <span className="absolute px-3 text-xs uppercase bg-white dark:bg-slate-900 text-slate-400 font-medium">Or enter manually</span>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleSaveManual} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">City / Locality</label>
            <input
              type="text"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              placeholder="e.g. Bengaluru, New Delhi, Mumbai"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">Pincode (6-digit)</label>
            <input
              type="text"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 560001, 110001, 400050"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Quick City Presets */}
          <div>
            <label className="block mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Popular Demo Locations:</label>
            <div className="flex flex-wrap gap-2">
              {popularCities.map((pc) => (
                <button
                  type="button"
                  key={pc.pincode}
                  onClick={() => {
                    setInputCity(pc.city);
                    setInputPincode(pc.pincode);
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {pc.city} ({pc.pincode})
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
