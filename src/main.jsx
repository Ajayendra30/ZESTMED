import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Automatically redirect to Home page whenever the website is reloaded,
// EXCEPT for Admin, Lab, and Patient dashboards which must stay on their respective pages on reload.
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

  const navEntries = window.performance?.getEntriesByType?.('navigation');
  const isReloadByEntries = navEntries && navEntries.length > 0 && navEntries[0].type === 'reload';
  const isReloadByLegacy = window.performance?.navigation?.type === 1;
  const isReloadBySession = sessionStorage.getItem('zestmed_is_reloading') === 'true';

  sessionStorage.removeItem('zestmed_is_reloading');

  if ((isReloadByEntries || isReloadByLegacy || isReloadBySession) && !isAdminPath && !isLabPath && !isPatientPath) {
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
