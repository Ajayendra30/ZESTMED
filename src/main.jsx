import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Automatically redirect to Home page whenever the website is reloaded,
// EXCEPT for key service pages and dashboards which must stay on their respective pages on reload:
// 1. Medicines
// 2. Lab Tests (and Diagnostics)
// 3. Surgery Packages
// 4. Wellness Packages
// 5. Physiotherapy
// 6. Doctor Appointment
// As well as Admin, Lab, and Patient dashboards, and auth pages.
try {
  const pathname = window.location.pathname.toLowerCase();
  const isAdminPath = pathname.startsWith('/admin') || pathname === '/admin-dashboard';
  const isLabPath =
    pathname === '/lab' ||
    pathname.startsWith('/lab/') ||
    pathname === '/lab-dashboard' ||
    pathname.startsWith('/lab-dashboard/');
  const isPatientPath =
    pathname === '/patient-dashboard' ||
    pathname.startsWith('/patient-dashboard/') ||
    pathname === '/patient' ||
    pathname.startsWith('/patient/');

  const isMedicinesPath =
    pathname === '/medicines' ||
    pathname.startsWith('/medicines/');

  const isLabTestsPath =
    pathname === '/lab-tests' ||
    pathname.startsWith('/lab-tests/') ||
    pathname === '/labtests' ||
    pathname.startsWith('/labtests/') ||
    pathname === '/lab-test' ||
    pathname.startsWith('/lab-test/') ||
    pathname === '/diagnostics' ||
    pathname.startsWith('/diagnostics/');

  const isSurgeryPath =
    pathname === '/surgery-packages' ||
    pathname.startsWith('/surgery-packages/') ||
    pathname === '/surgeries' ||
    pathname.startsWith('/surgeries/') ||
    pathname === '/surgery' ||
    pathname.startsWith('/surgery/') ||
    pathname === '/packages' ||
    pathname.startsWith('/packages/');

  const isWellnessPath =
    pathname === '/wellness-packages' ||
    pathname.startsWith('/wellness-packages/') ||
    pathname === '/wellness' ||
    pathname.startsWith('/wellness/') ||
    pathname === '/health-packages' ||
    pathname.startsWith('/health-packages/');

  const isPhysioPath =
    pathname === '/physiotherapy' ||
    pathname.startsWith('/physiotherapy/') ||
    pathname === '/physio' ||
    pathname.startsWith('/physio/') ||
    pathname === '/physiotherapist' ||
    pathname.startsWith('/physiotherapist/') ||
    pathname === '/physiotherapy-service' ||
    pathname.startsWith('/physiotherapy-service/') ||
    pathname === '/book-physiotherapy' ||
    pathname.startsWith('/book-physiotherapy/');

  const isDoctorPath =
    pathname === '/doctor-appointment' ||
    pathname.startsWith('/doctor-appointment/') ||
    pathname === '/doctors' ||
    pathname.startsWith('/doctors/') ||
    pathname === '/doctor' ||
    pathname.startsWith('/doctor/') ||
    pathname === '/book-doctor' ||
    pathname.startsWith('/book-doctor/') ||
    pathname === '/book-doctor-appointment' ||
    pathname.startsWith('/book-doctor-appointment/') ||
    pathname === '/book-appointment' ||
    pathname.startsWith('/book-appointment/');

  const isAuthPath =
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/register' ||
    pathname.startsWith('/register/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/');

  const shouldPreservePage =
    isAdminPath ||
    isLabPath ||
    isPatientPath ||
    isMedicinesPath ||
    isLabTestsPath ||
    isSurgeryPath ||
    isWellnessPath ||
    isPhysioPath ||
    isDoctorPath ||
    isAuthPath;

  const navEntries = window.performance?.getEntriesByType?.('navigation');
  const isReloadByEntries = navEntries && navEntries.length > 0 && navEntries[0].type === 'reload';
  const isReloadByLegacy = window.performance?.navigation?.type === 1;
  const isReloadBySession = sessionStorage.getItem('zestmed_is_reloading') === 'true';

  sessionStorage.removeItem('zestmed_is_reloading');

  if ((isReloadByEntries || isReloadByLegacy || isReloadBySession) && !shouldPreservePage) {
    if (window.location.pathname !== '/' || window.location.search || window.location.hash) {
      window.history.replaceState(null, '', '/');
    }
    window.scrollTo(0, 0);
  }
} catch (_) {}

window.addEventListener('beforeunload', () => {
  try {
    sessionStorage.setItem('zestmed_is_reloading', 'true');
  } catch (_) {}
});

// Auto-reload if an outdated deployment chunk was cached by the browser
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite preload error detected, reloading page]:', event);
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
