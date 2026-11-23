import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { 
  getRegisteredPatient, 
  saveRegisteredPatient, 
  normalizePhone, 
  purgeRahulVermaFromStorage,
  checkPhoneUniqueness 
} from '../utils/patientRegistry';
import {
  createAuthSession,
  validateAuthSession,
  terminateAuthSession,
  recordLoginHistory,
  resolveUserRole,
  getTargetDashboardForRole,
  checkUserRegistrationByPhone
} from '../services/otpAuthService';

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
        // Ensure role is valid
        parsed.role = resolveUserRole(parsed.contact || parsed.phone || '', parsed.role);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Validate session on mount
  useEffect(() => {
    if (user) {
      const sessionResult = validateAuthSession();
      if (!sessionResult.isValid && sessionResult.reason === 'SESSION_EXPIRED') {
        logout(true); // Expired session logout
      }
    }
  }, []);

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

  // Sync user state with localStorage and active session
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('zestmed_user', JSON.stringify(user));
        createAuthSession(user);
      } else {
        localStorage.removeItem('zestmed_user');
        terminateAuthSession();
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Login via Mobile Phone OTP
  const loginWithPhoneOtp = (phoneNumber, name = '', extraData = {}) => {
    purgeRahulVermaFromStorage();
    const cleanPhone = normalizePhone(phoneNumber);
    const registered = getRegisteredPatient(cleanPhone);

    // Check if there is a saved profile name in localStorage
    let savedProfileName = '';
    try {
      const savedProfile = localStorage.getItem('zestmed_patient_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.name && parsed.name !== 'Verified Patient' && !parsed.name.startsWith('Patient') && parsed.name !== 'Rahul Verma') {
          savedProfileName = parsed.name;
        }
      }
    } catch (_) {}

    // Resolve actual registered patient name (avoid generic 'Patient' or 'Rahul Verma')
    const resolvedName = (name && name.trim() && name.trim() !== 'Verified Patient' && !name.trim().startsWith('Patient') && name.trim() !== 'Rahul Verma')
      ? name.trim()
      : (registered && registered.name && registered.name !== 'Verified Patient' && !registered.name.startsWith('Patient') && registered.name !== 'Rahul Verma')
      ? registered.name
      : (savedProfileName || '');

    // Resolve user role based on phone or explicitly supplied role
    const resolvedRole = resolveUserRole(cleanPhone, extraData.role || registered?.role);

    // Save newly provided patient name to central registry if name provided
    if (resolvedName && !resolvedName.startsWith('Patient') && resolvedName !== 'Rahul Verma') {
      saveRegisteredPatient(cleanPhone, resolvedName, { ...registered, ...extraData, role: resolvedRole });
    }

    const userObj = {
      id: registered?.id || extraData.id || `ZM-PAT-${cleanPhone.slice(-4) || Date.now().toString(36)}`,
      name: resolvedName || 'Patient',
      contact: `+91 ${cleanPhone}`,
      phone: `+91 ${cleanPhone}`,
      email: registered?.email && !registered.email.includes('rahul.verma') 
        ? registered.email 
        : (extraData.email || `${cleanPhone}@patient.zestmed.com`),
      role: resolvedRole,
      authMethod: 'phone_otp',
      memberSince: registered?.registeredAt || extraData.registeredAt || 'Nov 2026',
      age: extraData.age || registered?.age || 30,
      gender: extraData.gender || registered?.gender || 'Not Specified',
      bloodGroup: extraData.bloodGroup || registered?.bloodGroup || 'B+',
      city: extraData.city || registered?.city || 'Guwahati, Assam'
    };

    setUser(userObj);
    setIsAuthModalOpen(false);

    // Record login in audit history
    recordLoginHistory({
      phone: cleanPhone,
      userId: userObj.id,
      userName: userObj.name,
      role: userObj.role,
      method: 'phone_otp',
      status: 'SUCCESS',
      reason: 'OTP verified successfully'
    });

    addToast(`Welcome to ZESTMED, ${userObj.name}!`, 'success');
    return userObj;
  };

  // Setup user profile after first-time login (Step 3)
  const setupUserProfile = (cleanPhone, profileData = {}) => {
    purgeRahulVermaFromStorage();
    const clean = normalizePhone(cleanPhone);
    const resolvedRole = resolveUserRole(clean, profileData.role || 'Patient');

    const userObj = {
      id: `ZM-PAT-${clean.slice(-4)}`,
      name: (profileData.name || 'New Patient').trim(),
      contact: `+91 ${clean}`,
      phone: `+91 ${clean}`,
      email: profileData.email || `${clean}@patient.zestmed.com`,
      role: resolvedRole,
      authMethod: 'phone_otp',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      age: profileData.age ? parseInt(profileData.age, 10) : 28,
      gender: profileData.gender || 'Not Specified',
      bloodGroup: profileData.bloodGroup || 'B+',
      city: profileData.city || 'Guwahati, Assam'
    };

    // Save strictly to registry (enforcing 1 number -> 1 user)
    saveRegisteredPatient(clean, userObj.name, userObj);
    setUser(userObj);
    setIsAuthModalOpen(false);

    recordLoginHistory({
      phone: clean,
      userId: userObj.id,
      userName: userObj.name,
      role: userObj.role,
      method: 'new_registration',
      status: 'SUCCESS',
      reason: 'New user profile completed'
    });

    addToast(`Profile setup complete. Welcome, ${userObj.name}!`, 'success');
    return userObj;
  };

  // Login via Google Sign-In
  const loginWithGoogle = (googleData = null) => {
    purgeRahulVermaFromStorage();
    const userObj = googleData || {
      id: `usr_g_${Date.now().toString(36)}`,
      name: 'Ajayendra Shekhar',
      contact: '+91 92791 25091',
      phone: '+91 92791 25091',
      email: 'ajayendra.shekhar@zestmed.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'Patient',
      authMethod: 'google',
      memberSince: 'Nov 2026',
    };
    setUser(userObj);
    setIsAuthModalOpen(false);

    recordLoginHistory({
      phone: userObj.phone,
      userId: userObj.id,
      userName: userObj.name,
      role: userObj.role,
      method: 'google',
      status: 'SUCCESS',
      reason: 'Google Sign-In successful'
    });

    addToast(`Signed in with Google as ${userObj.name}`, 'success');
    return userObj;
  };

  // Kept for backward compatibility
  const loginDemo = (phoneOrEmail, name = 'Ajayendra Shekhar') => {
    loginWithPhoneOtp(phoneOrEmail, name);
  };

  // Secure Logout (Clears user, session, tokens, and active cache)
  const logout = (wasExpired = false) => {
    if (user) {
      recordLoginHistory({
        phone: user.phone || user.contact,
        userId: user.id,
        userName: user.name,
        role: user.role,
        method: user.authMethod || 'manual_logout',
        status: 'SUCCESS',
        reason: wasExpired ? 'Session expired' : 'User clicked logout'
      });
    }

    terminateAuthSession();
    setUser(null);
    localStorage.removeItem('zestmed_user');
    localStorage.removeItem('zestmed_auth_session');

    // Notify other components
    window.dispatchEvent(new CustomEvent('zestmed:logout'));

    if (wasExpired) {
      addToast('Your session has expired. Please log in again for your security.', 'warning');
    } else {
      addToast('You have been logged out securely.', 'info');
    }
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
      setupUserProfile,
      loginWithGoogle,
      loginDemo,
      logout,
      updateUser,
      isAuthModalOpen,
      authMode,
      setAuthMode,
      openAuth,
      closeAuth,
      getTargetDashboardForRole
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
