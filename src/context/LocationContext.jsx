import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const LocationContext = createContext(null);

// Exclusively Guwahati, Assam Neighborhoods & Service Hubs
export const DEFAULT_LOCATIONS = [
  { city: 'Guwahati - Dispur / Secretariat', pincode: '781005', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '3 km from Central Lab' },
  { city: 'Guwahati - Panbazar / Fancy Bazar', pincode: '781001', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '4.5 km from Central Lab' },
  { city: 'Guwahati - GS Road / Christian Basti', pincode: '781005', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '2.5 km from Central Lab' },
  { city: 'Guwahati - Ulubari / Paltan Bazar', pincode: '781007', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '3.8 km from Central Lab' },
  { city: 'Guwahati - Jalukbari / Gauhati Univ', pincode: '781014', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '8.2 km from Central Lab' },
  { city: 'Guwahati - Khanapara / Beltola', pincode: '781022', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '5.5 km from Central Lab' },
  { city: 'Guwahati - Six Mile / VIP Road', pincode: '781022', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '6.0 km from Central Lab' },
  { city: 'Guwahati - Chandmari / Silpukhuri', pincode: '781003', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '4.2 km from Central Lab' },
  { city: 'Guwahati - Zoo Road / Geetanagar', pincode: '781024', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '3.5 km from Central Lab' },
  { city: 'Guwahati - Bharalumukh / Shantipur', pincode: '781009', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '5.1 km from Central Lab' },
  { city: 'Guwahati - Maligaon / Kamakhya', pincode: '781011', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '7.8 km from Central Lab' },
  { city: 'Guwahati - Hatigaon / Bhetapara', pincode: '781038', district: 'Kamrup Metro', state: 'Assam', active: true, radiusKm: '5.8 km from Central Lab' },
];

export const GUWAHATI_HUBS = DEFAULT_LOCATIONS;
export const ASSAM_DISTRICTS = DEFAULT_LOCATIONS;

export const LocationProvider = ({ children }) => {
  const { addToast } = useToast();
  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure city is strictly Guwahati
        if (parsed.city && parsed.city.includes('Guwahati')) {
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
    addToast(`Delivery & Pickup set to ${loc.city} (${loc.pincode})`, 'success');
  };

  const setByPincode = (pincode) => {
    const cleanPin = pincode.trim();
    const match = DEFAULT_LOCATIONS.find(l => l.pincode === cleanPin);
    if (match) {
      selectLocation(match);
      return { success: true, message: `Fastest service active in ${match.city}! Free Senior 10km pick-up active.` };
    }

    // Guwahati postal codes strictly start with 7810xx or 781xxx
    if (/^781\d{3}$/.test(cleanPin)) {
      const customLoc = {
        city: `Guwahati (PIN: ${cleanPin})`,
        pincode: cleanPin,
        district: 'Kamrup Metro',
        state: 'Assam',
        active: true,
        radiusKm: 'Within Guwahati Coverage Area'
      };
      selectLocation(customLoc);
      return { success: true, message: `Active in Guwahati PIN ${cleanPin}. Reports in a single day guaranteed!` };
    }

    if (/^\d{6}$/.test(cleanPin)) {
      return { 
        success: false, 
        message: 'Zestmed operates exclusively in Guwahati, Assam (PIN codes starting with 781xxx). Free 10km senior citizen pick-up & drop is active throughout Guwahati!' 
      };
    }

    return { success: false, message: 'Please enter a valid 6-digit Guwahati PIN code (e.g. 781005)' };
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
