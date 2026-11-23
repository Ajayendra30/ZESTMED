import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { getRegisteredPatient, saveRegisteredPatient, normalizePhone, purgeRahulVermaFromStorage } from '../utils/patientRegistry';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const [user, setUser] = useState(() => {
    try {
      purgeRahulVermaFromStorage();
      const saved = localStorage.getItem('zestmed_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        // Automatically migrate legacy "Verified Patient", generic "Patient", or stale "Rahul Verma" to actual registered name
        if (!parsed.name || parsed.name === 'Verified Patient' || parsed.name === 'Patient' || parsed.name.startsWith('Patient ') || parsed.name === 'Rahul Verma') {
          const registered = getRegisteredPatient(parsed.contact || parsed.phone || '');
          let savedName = '';
          try {
            const sp = localStorage.getItem('zestmed_patient_profile');
            if (sp) {
              const p = JSON.parse(sp);
              if (p?.name && p.name !== 'Verified Patient' && !p.name.startsWith('Patient') && p.name !== 'Rahul Verma') {
                savedName = p.name;
              }
            }
          } catch (_) {}
          parsed.name = registered?.name || savedName || 'Ajayendra Shekhar';
        }
        if (parsed.name === 'Rahul Verma') {
          parsed.name = 'Ajayendra Shekhar';
        }
        if (parsed.email && parsed.email.includes('rahul.verma')) {
          parsed.email = parsed.email.replace(/rahul\.verma/gi, 'ajayendra.shekhar');
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

  // Global listener for opening auth modal from authGuard or anywhere in the app
  useEffect(() => {
    const handleGlobalOpenAuth = (e) => {
      const mode = e.detail?.mode || 'login';
      setAuthMode(mode);
      setIsAuthModalOpen(true);
    };

    window.addEventListener('zestmed:open-auth', handleGlobalOpenAuth);
    return () => {
      window.removeEventListener('zestmed:open-auth', handleGlobalOpenAuth);
    };
  }, []);

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
    purgeRahulVermaFromStorage();
    const cleanPhone = normalizePhone(phoneNumber);
    const registered = getRegisteredPatient(cleanPhone);

    // Check if there is a saved profile name in localStorage for this specific phone number
    let savedProfileName = '';
    try {
      const savedProfile = localStorage.getItem('zestmed_patient_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        const parsedPhone = normalizePhone(parsed?.phone || parsed?.contact || '');
        if (parsedPhone && parsedPhone === cleanPhone && parsed?.name && parsed.name !== 'Verified Patient' && !parsed.name.startsWith('Patient') && parsed.name !== 'Rahul Verma') {
          savedProfileName = parsed.name;
        }
      }
    } catch (_) {}

    // Resolve actual registered patient name
    const resolvedName = (name && name.trim() && name.trim() !== 'Verified Patient' && !name.trim().startsWith('Patient') && name.trim() !== 'Rahul Verma')
      ? name.trim()
      : (registered && registered.name && registered.name !== 'Verified Patient' && !registered.name.startsWith('Patient') && registered.name !== 'Rahul Verma')
      ? registered.name
      : (savedProfileName || 'Verified Patient');

    // Save newly provided patient name to central registry if valid
    if (resolvedName && resolvedName !== 'Verified Patient' && !resolvedName.startsWith('Patient') && resolvedName !== 'Rahul Verma') {
      saveRegisteredPatient(cleanPhone, resolvedName);
    }

    const userObj = {
      id: registered?.id || `usr_${Date.now().toString(36)}`,
      name: resolvedName,
      contact: `+91 ${cleanPhone}`,
      phone: `+91 ${cleanPhone}`,
      email: registered?.email && !registered.email.includes('rahul.verma') ? registered.email : `${cleanPhone}@patient.zestmed.com`,
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
    purgeRahulVermaFromStorage();
    const userObj = googleData || {
      id: `usr_g_${Date.now().toString(36)}`,
      name: 'Ajayendra Shekhar',
      contact: '+91 92791 25091',
      email: 'ajayendra.shekhar@zestmed.com',
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
  const loginDemo = (phoneOrEmail, name = 'Ajayendra Shekhar') => {
    loginWithPhoneOtp(phoneOrEmail, name);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('zestmed_user');
      localStorage.removeItem('zestmed_patient_profile');
      localStorage.removeItem('patient_profile');
      localStorage.removeItem('zestmed_patient_notifications');
      localStorage.removeItem('zestmed_patient_reports');
      localStorage.removeItem('zestmed_patient_prescriptions');
      localStorage.removeItem('zestmed_saved_addresses');
      sessionStorage.clear();
    } catch (_) {}
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
