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
        // Automatically migrate legacy "Verified Patient" to their actual registered name
        if (!parsed.name || parsed.name === 'Verified Patient') {
          const registered = getRegisteredPatient(parsed.contact || parsed.phone || '');
          parsed.name = registered?.name || (parsed.contact ? `Patient ${normalizePhone(parsed.contact).slice(-4)}` : 'Patient');
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

    // Resolve actual registered patient name
    const resolvedName = (name && name.trim() && name.trim() !== 'Verified Patient')
      ? name.trim()
      : (registered && registered.name && registered.name !== 'Verified Patient')
      ? registered.name
      : (cleanPhone ? `Patient ${cleanPhone.slice(-4)}` : 'Patient');

    // Save newly provided patient name to central registry
    if (resolvedName && resolvedName !== 'Patient' && !resolvedName.startsWith('Patient ')) {
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
