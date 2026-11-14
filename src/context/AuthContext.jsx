import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        if (!parsed.name) {
          parsed.name = parsed.email || parsed.contact || 'Patient';
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
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const userName = name.trim() || 'Verified Patient';
    const userObj = {
      id: `usr_${Date.now().toString(36)}`,
      name: userName,
      contact: `+91 ${cleanPhone}`,
      email: `${cleanPhone}@patient.zestmed.com`,
      role: 'Patient',
      authMethod: 'phone_otp',
      memberSince: 'Nov 2026',
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
