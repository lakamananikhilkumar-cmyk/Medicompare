import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationState {
  city: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  source: 'browser' | 'manual' | 'default';
  isLocating: boolean;
  error: string | null;
}

interface LocationContextType extends LocationState {
  setManualLocation: (city: string, pincode: string) => void;
  requestBrowserLocation: () => Promise<void>;
  resetToDefault: () => void;
}

const DEFAULT_LOCATION: LocationState = {
  city: 'Bengaluru',
  pincode: '560001',
  latitude: 12.9716,
  longitude: 77.5946,
  source: 'default',
  isLocating: false,
  error: null,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationState>(() => {
    const saved = localStorage.getItem('medicompare_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_LOCATION;
  });

  useEffect(() => {
    localStorage.setItem('medicompare_location', JSON.stringify(location));
  }, [location]);

  const setManualLocation = (city: string, pincode: string) => {
    setLocation({
      city: city || 'Bengaluru',
      pincode: pincode || '560001',
      latitude: null, // Let backend geocode via pincode
      longitude: null,
      source: 'manual',
      isLocating: false,
      error: null,
    });
  };

  const requestBrowserLocation = async () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser. Please enter your pincode or city manually.',
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, isLocating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          city: 'Current Location',
          pincode: '',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: 'browser',
          isLocating: false,
          error: null,
        });
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err.message);
        setLocation((prev) => ({
          ...prev,
          isLocating: false,
          error: 'Location access was denied or timed out. Switched to manual location.',
        }));
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const resetToDefault = () => {
    setLocation(DEFAULT_LOCATION);
  };

  return (
    <LocationContext.Provider
      value={{
        ...location,
        setManualLocation,
        requestBrowserLocation,
        resetToDefault,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
