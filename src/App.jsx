import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { ToastProvider, useToast } from './context/ToastContext';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import WellnessPackagesPage from './pages/WellnessPackagesPage';
import DoctorAppointmentPage from './pages/DoctorAppointmentPage';
import PhysiotherapyPage from './pages/PhysiotherapyPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import BookDoctorModal from './components/BookDoctorModal';
import BookPhysioModal from './components/BookPhysioModal';
import BookSurgeryModal from './components/BookSurgeryModal';
import SeniorCitizenPickUpModal from './components/SeniorCitizenPickUpModal';
import { getActiveSubdomain } from './utils/subdomain';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  const { addToast } = useToast();
  const activeSubdomain = getActiveSubdomain();
  const searchInputRef = useRef(null);

  // Automatically scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Global Interactive Modals for New Core Services
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isPhysioModalOpen, setIsPhysioModalOpen] = useState(false);
  const [isSurgeryModalOpen, setIsSurgeryModalOpen] = useState(false);
  const [isSeniorPickupOpen, setIsSeniorPickupOpen] = useState(false);

  // Upload Prescription is NOT accessible directly from the homepage.
  // It is only available after login/registration, redirecting to the Patient Dashboard.
  const handleOpenPrescriptionRequest = () => {
    if (!user) {
      addToast('Please login to upload your doctor\'s prescription', 'info');
      openAuth('login');
    } else {
      navigate('/patient-dashboard?open=prescription');
    }
  };

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
        onOpenPrescriptionModal={handleOpenPrescriptionRequest}
        onSearchFocus={handleSearchFocus}
        onOpenDoctorModal={() => setIsDoctorModalOpen(true)}
        onOpenPhysioModal={() => setIsPhysioModalOpen(true)}
        onOpenSurgeryModal={() => setIsSurgeryModalOpen(true)}
        onOpenSeniorPickup={() => setIsSeniorPickupOpen(true)}
      />

      {/* Main Routed Content */}
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home 
                searchInputRef={searchInputRef}
                isDoctorModalOpen={isDoctorModalOpen}
                setIsDoctorModalOpen={setIsDoctorModalOpen}
                isPhysioModalOpen={isPhysioModalOpen}
                setIsPhysioModalOpen={setIsPhysioModalOpen}
                isSurgeryModalOpen={isSurgeryModalOpen}
                setIsSurgeryModalOpen={setIsSurgeryModalOpen}
                isSeniorPickupOpen={isSeniorPickupOpen}
                setIsSeniorPickupOpen={setIsSeniorPickupOpen}
              />
            }
          />
          <Route
            path="/medicines"
            element={
              <MedicineStorePage
                onOpenPrescriptionModal={handleOpenPrescriptionRequest}
              />
            }
          />
          <Route path="/diagnostics" element={<DiagnosticPortalPage />} />
          <Route path="/lab-tests" element={<DiagnosticPortalPage />} />
          <Route path="/packages" element={<HealthPackagesPage />} />
          <Route path="/wellness-packages" element={<WellnessPackagesPage />} />
          <Route path="/wellness" element={<WellnessPackagesPage />} />
          <Route path="/doctor-appointment" element={<DoctorAppointmentPage />} />
          <Route path="/doctors" element={<DoctorAppointmentPage />} />
          <Route path="/doctor" element={<DoctorAppointmentPage />} />
          <Route path="/book-doctor" element={<DoctorAppointmentPage />} />
          <Route path="/physiotherapy" element={<PhysiotherapyPage />} />
          <Route path="/physio" element={<PhysiotherapyPage />} />
          <Route path="/physiotherapist" element={<PhysiotherapyPage />} />
          <Route 
            path="/surgeries" 
            element={
              <Home 
                searchInputRef={searchInputRef}
                isDoctorModalOpen={isDoctorModalOpen}
                setIsDoctorModalOpen={setIsDoctorModalOpen}
                isPhysioModalOpen={isPhysioModalOpen}
                setIsPhysioModalOpen={setIsPhysioModalOpen}
                isSurgeryModalOpen={true}
                setIsSurgeryModalOpen={setIsSurgeryModalOpen}
                isSeniorPickupOpen={isSeniorPickupOpen}
                setIsSeniorPickupOpen={setIsSeniorPickupOpen}
              />
            } 
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="*"
            element={<Home searchInputRef={searchInputRef} />}
          />
        </Routes>
      </div>

      {/* Global Footer */}
      <Footer onOpenPrescriptionModal={handleOpenPrescriptionRequest} />

      {/* Global Modals & Drawers */}
      <CartDrawer
        onOpenPrescriptionModal={handleOpenPrescriptionRequest}
      />
      <LocationModal />
      <AuthModal />
      <ToastContainer />

      {/* Global Core Service Modals */}
      <BookDoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onOpenSeniorPickup={() => setIsSeniorPickupOpen(true)}
      />
      <BookPhysioModal
        isOpen={isPhysioModalOpen}
        onClose={() => setIsPhysioModalOpen(false)}
        onOpenSeniorPickup={() => setIsSeniorPickupOpen(true)}
      />
      <BookSurgeryModal
        isOpen={isSurgeryModalOpen}
        onClose={() => setIsSurgeryModalOpen(false)}
        onOpenSeniorPickup={() => setIsSeniorPickupOpen(true)}
      />
      <SeniorCitizenPickUpModal
        isOpen={isSeniorPickupOpen}
        onClose={() => setIsSeniorPickupOpen(false)}
      />
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
