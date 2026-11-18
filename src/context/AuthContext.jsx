import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { getRegisteredPatient, saveRegisteredPatient, normalizePhone } from '../utils/patientRegistry';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        // Automatically migrate legacy "Verified Patient" or generic "Patient" to their actual registered name
        if (!parsed.name || parsed.name === 'Verified Patient' || parsed.name === 'Patient' || parsed.name.startsWith('Patient ')) {
          const registered = getRegisteredPatient(parsed.contact || parsed.phone || '');
          let savedName = '';
          try {
            const sp = localStorage.getItem('zestmed_patient_profile');
            if (sp) {
              const p = JSON.parse(sp);
              if (p?.name && p.name !== 'Verified Patient' && !p.name.startsWith('Patient')) {
                savedName = p.name;
              }
            }
          } catch (_) {}
          parsed.name = registered?.name || savedName || 'Rahul Verma';
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('zestmed_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('zestmed_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Login via Mobile Phone OTP
  const loginWithPhoneOtp = (phoneNumber, name = '') => {
    const cleanPhone = normalizePhone(phoneNumber);
    const registered = getRegisteredPatient(cleanPhone);

    // Check if there is a saved profile name in localStorage
    let savedProfileName = '';
    try {
      const savedProfile = localStorage.getItem('zestmed_patient_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.name && parsed.name !== 'Verified Patient' && !parsed.name.startsWith('Patient')) {
          savedProfileName = parsed.name;
        }
      }
    } catch (_) {}

    // Resolve actual registered patient name (avoid generic 'Patient' or 'Patient 1234')
    const resolvedName = (name && name.trim() && name.trim() !== 'Verified Patient' && !name.trim().startsWith('Patient'))
      ? name.trim()
      : (registered && registered.name && registered.name !== 'Verified Patient' && !registered.name.startsWith('Patient'))
      ? registered.name
      : (savedProfileName || 'Deepjyoti Kalita');

    // Save newly provided patient name to central registry
    if (resolvedName && !resolvedName.startsWith('Patient')) {
      saveRegisteredPatient(cleanPhone, resolvedName);
    }

    const userObj = {
      id: registered?.id || `usr_${Date.now().toString(36)}`,
      name: resolvedName,
      contact: `+91 ${cleanPhone}`,
      phone: `+91 ${cleanPhone}`,
      email: registered?.email || `${cleanPhone}@patient.zestmed.com`,
      role: 'Patient',
      authMethod: 'phone_otp',
      memberSince: registered?.registeredAt || 'Nov 2026',
      age: registered?.age || 32,
      gender: registered?.gender || 'Male',
      bloodGroup: registered?.bloodGroup || 'B+',
      city: registered?.city || 'Guwahati, Assam'
    };
    setUser(userObj);
    setIsAuthModalOpen(false);
    addToast(`Welcome to ZESTMED, ${userObj.name}!`, 'success');
  };

  // Login via Google Sign-In
  const loginWithGoogle = (googleData = null) => {
    const userObj = googleData || {
      id: `usr_g_${Date.now().toString(36)}`,
      name: 'Rahul Verma',
      contact: '+91 92791 25091',
      email: 'rahul.verma@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'Patient',
      authMethod: 'google',
      memberSince: 'Nov 2026',
    };
    setUser(userObj);
    setIsAuthModalOpen(false);
    addToast(`Signed in with Google as ${userObj.name}`, 'success');
  };

  // Kept for backward compatibility
  const loginDemo = (phoneOrEmail, name = 'Rahul Verma') => {
    loginWithPhoneOtp(phoneOrEmail, name);
  };

  const logout = () => {
    setUser(null);
    addToast('You have been logged out successfully.', 'info');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...updatedFields };
      try {
        localStorage.setItem('zestmed_user', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      loginWithPhoneOtp,
      loginWithGoogle,
      loginDemo,
      logout,
      updateUser,
      isAuthModalOpen,
      authMode,
      setAuthMode,
      openAuth,
      closeAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
