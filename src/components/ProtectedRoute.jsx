// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * ProtectedRoute component:
 * Protects services that require mandatory login:
 * 1. Surgery Packages
 * 2. Physiotherapy
 * 3. Doctor Appointment
 * 
 * If the user is not authenticated:
 * - Saves the intended service URL in sessionStorage as a safeguard
 * - Shows an informative toast notification
 * - Redirects immediately to /login with the return URL preserved in the redirect query parameter
 * 
 * After successful login, AuthPage reads the redirect parameter and seamlessly navigates
 * the user back to the originally requested service page.
 */
export default function ProtectedRoute({ children, serviceName = 'this service' }) {
  const { user } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();

  const currentTarget = location.pathname + location.search;

  useEffect(() => {
    if (!user) {
      addToast(`Please login to access and use ${serviceName}`, 'info');
      try {
        sessionStorage.setItem('zestmed_redirect_target', currentTarget);
      } catch (_) {}
    }
  }, [user, serviceName, currentTarget, addToast]);

  if (!user) {
    try {
      sessionStorage.setItem('zestmed_redirect_target', currentTarget);
    } catch (_) {}

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(currentTarget)}`}
        replace
        state={{ from: currentTarget, serviceName }}
      />
    );
  }

  return children;
}
