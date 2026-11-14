import React, { useState, useRef } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LocationModal from './components/LocationModal';
import AuthModal from './components/AuthModal';
import ToastContainer from './components/ToastContainer';
import Home from './pages/Home';
import MedicineStorePage from './pages/MedicineStorePage';
import DiagnosticPortalPage from './pages/DiagnosticPortalPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import LabDashboardPage from './pages/LabDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ContactPage from './pages/ContactPage';
import HealthPackagesPage from './pages/HealthPackagesPage';
import AboutPage from './pages/AboutPage';
import { getActiveSubdomain } from './utils/subdomain';

function AppContent() {
  const location = useLocation();
  const activeSubdomain = getActiveSubdomain();
  const [isPrescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const searchInputRef = useRef(null);

  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 400);
    }
  };

  // =========================================================================
  // 1. DEDICATED ADMIN PANEL: http://localhost:5173/admin
  // Completely separate panel with its own layout, sidebar, components & functions
  // =========================================================================
  if (location.pathname.startsWith('/admin') || activeSubdomain === 'admin') {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#F4F7FB]">
        <Routes>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="*" element={<AdminDashboardPage />} />
        </Routes>
        <ToastContainer />
      </div>
    );
  }

  // =========================================================================
  // 2. DEDICATED LAB PANEL: http://localhost:5173/lab
  // Completely separate panel with its own layout, cold-chain, components & functions
  // =========================================================================
  if (location.pathname.startsWith('/lab') || activeSubdomain === 'lab') {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#F4F7FB]">
        <Routes>
          <Route path="/lab" element={<LabDashboardPage />} />
          <Route path="/lab/*" element={<LabDashboardPage />} />
          <Route path="/lab-dashboard" element={<LabDashboardPage />} />
          <Route path="*" element={<LabDashboardPage />} />
        </Routes>
        <ToastContainer />
      </div>
    );
  }

  // =========================================================================
  // 3. STANDALONE PATIENT DASHBOARD: http://localhost:5173/patient-dashboard
  // =========================================================================
  if (location.pathname === '/patient-dashboard') {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#F4F7FB]">
        <PatientDashboardPage
          onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        />
        <CartDrawer
          onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        />
        <LocationModal />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  // =========================================================================
  // 4. MAIN CONSUMER STOREFRONT: http://localhost:5173/
  // =========================================================================
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Global Navbar */}
      <Navbar
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
        onSearchFocus={handleSearchFocus}
      />

      {/* Main Routed Content */}
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                isPrescriptionModalOpen={isPrescriptionModalOpen}
                setPrescriptionModalOpen={setPrescriptionModalOpen}
                searchInputRef={searchInputRef}
              />
            }
          />
          <Route
            path="/medicines"
            element={
              <MedicineStorePage
                onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
              />
            }
          />
          <Route path="/diagnostics" element={<DiagnosticPortalPage />} />
          <Route path="/lab-tests" element={<DiagnosticPortalPage />} />
          <Route path="/packages" element={<HealthPackagesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="*"
            element={
              <Home
                isPrescriptionModalOpen={isPrescriptionModalOpen}
                setPrescriptionModalOpen={setPrescriptionModalOpen}
                searchInputRef={searchInputRef}
              />
            }
          />
        </Routes>
      </div>

      {/* Global Footer */}
      <Footer onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)} />

      {/* Global Modals & Drawers */}
      <CartDrawer
        onOpenPrescriptionModal={() => setPrescriptionModalOpen(true)}
      />
      <LocationModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LocationProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </LocationProvider>
    </ToastProvider>
  );
}
