import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const LocationContext = createContext(null);

export const DEFAULT_LOCATIONS = [
  { city: 'Guwahati', pincode: '781001', district: 'Kamrup Metro', state: 'Assam', active: true },
  { city: 'Dibrugarh', pincode: '786001', district: 'Dibrugarh', state: 'Assam', active: true },
  { city: 'Silchar', pincode: '788001', district: 'Cachar', state: 'Assam', active: true },
  { city: 'Jorhat', pincode: '785001', district: 'Jorhat', state: 'Assam', active: true },
  { city: 'Nagaon', pincode: '782001', district: 'Nagaon', state: 'Assam', active: true },
  { city: 'Tezpur', pincode: '784001', district: 'Sonitpur', state: 'Assam', active: true },
  { city: 'Tinsukia', pincode: '786125', district: 'Tinsukia', state: 'Assam', active: true },
  { city: 'Bongaigaon', pincode: '783380', district: 'Bongaigaon', state: 'Assam', active: true },
];

export const ASSAM_DISTRICTS = DEFAULT_LOCATIONS;

export const LocationProvider = ({ children }) => {
  const { addToast } = useToast();
  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure legacy non-Assam stored locations are reset to Assam default
        if (parsed.state === 'Assam') {
          return parsed;
        }
      }
      return DEFAULT_LOCATIONS[0];
    } catch {
      return DEFAULT_LOCATIONS[0];
    }
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_location', JSON.stringify(currentLocation));
    } catch (e) {
      console.error(e);
    }
  }, [currentLocation]);

  const selectLocation = (loc) => {
    setCurrentLocation(loc);
    setIsLocationModalOpen(false);
    addToast(`Delivery location set to ${loc.city}, Assam (${loc.pincode})`, 'success');
  };

  const setByPincode = (pincode) => {
    const cleanPin = pincode.trim();
    const match = DEFAULT_LOCATIONS.find(l => l.pincode === cleanPin);
    if (match) {
      selectLocation(match);
      return { success: true, message: `Fastest delivery active in ${match.city}, Assam!` };
    }

    // Assam postal codes always start with 78
    if (/^78\d{4}$/.test(cleanPin)) {
      const customLoc = {
        city: 'Assam Region',
        pincode: cleanPin,
        district: 'Assam Service District',
        state: 'Assam',
        active: true
      };
      selectLocation(customLoc);
      return { success: true, message: `Service active for PIN ${cleanPin} in Assam.` };
    }

    if (/^\d{6}$/.test(cleanPin)) {
      return { 
        success: false, 
        message: 'Zestmed Health operates exclusively in Assam (PIN codes starting with 78xxxx). Expansion to other states coming soon!' 
      };
    }

    return { success: false, message: 'Please enter a valid 6-digit Assam PIN code (e.g. 781001)' };
  };

  return (
    <LocationContext.Provider value={{
      currentLocation,
      selectLocation,
      setByPincode,
      isLocationModalOpen,
      openLocationModal: () => setIsLocationModalOpen(true),
      closeLocationModal: () => setIsLocationModalOpen(false),
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
