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
import SurgeryPackagesPage from './pages/SurgeryPackagesPage';
import SurgeryDetailPage from './pages/SurgeryDetailPage';
import DoctorAppointmentPage from './pages/DoctorAppointmentPage';
import BookDoctorPage from './pages/BookDoctorPage';
import PhysiotherapyPage from './pages/PhysiotherapyPage';
import PhysiotherapyDetailPage from './pages/PhysiotherapyDetailPage';
import PhysiotherapyBookingPage from './pages/PhysiotherapyBookingPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import BookDoctorModal from './components/BookDoctorModal';
import BookPhysioModal from './components/BookPhysioModal';
import SeniorCitizenPickUpModal from './components/SeniorCitizenPickUpModal';
import FloatingCallWhatsApp from './components/FloatingCallWhatsApp';
import { getActiveSubdomain } from './utils/subdomain';
import { isAuthorizedAdmin, isAuthorizedLab } from './services/otpAuthService';

// Authorized Role Route Guards - Inaccessible to Regular Users
function AdminRouteGuard({ children, user, navigate, addToast }) {
  useEffect(() => {
    if (!user || !isAuthorizedAdmin(user)) {
      addToast('Access Denied: The Admin Dashboard is restricted to authorized administrators only.', 'error');
      navigate('/', { replace: true });
    }
  }, [user, navigate, addToast]);

  if (!user || !isAuthorizedAdmin(user)) {
    return null;
  }

  return children;
}

function LabRouteGuard({ children, user, navigate, addToast }) {
  useEffect(() => {
    if (!user || !isAuthorizedLab(user)) {
      addToast('Access Denied: The Lab Portal is restricted to authorized lab executives only.', 'error');
      navigate('/', { replace: true });
    }
  }, [user, navigate, addToast]);

  if (!user || !isAuthorizedLab(user)) {
    return null;
  }

  return children;
}

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

  // Ensure redirect to Home page if the website was reloaded,
  // EXCEPT for Admin, Lab, and Patient dashboards which must stay on their respective pages on reload.
  useEffect(() => {
    try {
      const currentPath = location.pathname.toLowerCase();
      const isAdminPath = currentPath.startsWith('/admin') || currentPath === '/admin-dashboard' || activeSubdomain === 'admin';
      const isLabPath =
        currentPath === '/lab' ||
        currentPath.startsWith('/lab/') ||
        currentPath === '/lab-dashboard' ||
        currentPath.startsWith('/lab-dashboard/') ||
        activeSubdomain === 'lab';
      const isPatientPath =
        currentPath === '/patient-dashboard' ||
        currentPath.startsWith('/patient-dashboard/') ||
        currentPath === '/patient' ||
        currentPath.startsWith('/patient/');

      if (isAdminPath || isLabPath || isPatientPath) {
        return;
      }

      const navEntries = window.performance?.getEntriesByType?.('navigation');
      const isReloadByEntries = navEntries && navEntries.length > 0 && navEntries[0].type === 'reload';
      const isReloadByLegacy = window.performance?.navigation?.type === 1;
      const isReloadBySession = sessionStorage.getItem('zestmed_is_reloading') === 'true';

      if (isReloadByEntries || isReloadByLegacy || isReloadBySession) {
        sessionStorage.removeItem('zestmed_is_reloading');
        if (location.pathname !== '/' || location.search || location.hash) {
          navigate('/', { replace: true });
        }
      }
    } catch (_) {}
  }, []);

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
      <AdminRouteGuard user={user} navigate={navigate} addToast={addToast}>
        <div className="h-screen w-full overflow-hidden bg-[#F4F7FB]">
          <Routes>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="*" element={<AdminDashboardPage />} />
          </Routes>
          <ToastContainer />
        </div>
      </AdminRouteGuard>
    );
  }

  // =========================================================================
  // 2. DEDICATED LAB PANEL: http://localhost:5173/lab
  // Completely separate panel with its own layout, cold-chain, components & functions
  // =========================================================================
  const isLabExecutivePath =
    location.pathname === '/lab' ||
    location.pathname.startsWith('/lab/') ||
    location.pathname === '/lab-dashboard' ||
    location.pathname.startsWith('/lab-dashboard/');

  const isConsumerDiagnosticPath =
    location.pathname === '/diagnostics' ||
    location.pathname.startsWith('/diagnostics/') ||
    location.pathname === '/lab-tests' ||
    location.pathname.startsWith('/lab-tests/') ||
    location.pathname === '/labtests' ||
    location.pathname.startsWith('/labtests/') ||
    location.pathname === '/lab-test' ||
    location.pathname.startsWith('/lab-test/');

  if (!isConsumerDiagnosticPath && (isLabExecutivePath || activeSubdomain === 'lab')) {
    return (
      <LabRouteGuard user={user} navigate={navigate} addToast={addToast}>
        <div className="h-screen w-full overflow-hidden bg-[#F4F7FB]">
          <Routes>
            <Route path="/lab" element={<LabDashboardPage />} />
            <Route path="/lab/*" element={<LabDashboardPage />} />
            <Route path="/lab-dashboard" element={<LabDashboardPage />} />
            <Route path="*" element={<LabDashboardPage />} />
          </Routes>
          <ToastContainer />
        </div>
      </LabRouteGuard>
    );
  }

  // =========================================================================
  // 3. STANDALONE PATIENT DASHBOARD: http://localhost:5173/patient-dashboard
  // =========================================================================
  const isPatientDashboardPath =
    location.pathname === '/patient-dashboard' ||
    location.pathname.startsWith('/patient-dashboard/') ||
    location.pathname === '/patient' ||
    location.pathname.startsWith('/patient/');

  if (isPatientDashboardPath) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#F4F7FB]">
        <PatientDashboardPage
          onOpenPrescriptionModal={handleOpenPrescriptionRequest}
        />
        <CartDrawer
          onOpenPrescriptionModal={handleOpenPrescriptionRequest}
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
        onOpenSurgeryModal={() => navigate('/surgery-packages')}
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
          <Route path="/labtests" element={<DiagnosticPortalPage />} />
          <Route path="/lab-test" element={<DiagnosticPortalPage />} />
          <Route path="/surgery-packages" element={<SurgeryPackagesPage />} />
          <Route path="/surgery-packages/:id" element={<SurgeryDetailPage />} />
          <Route path="/surgeries" element={<SurgeryPackagesPage />} />
          <Route path="/surgeries/:id" element={<SurgeryDetailPage />} />
          <Route path="/surgery/:id" element={<SurgeryDetailPage />} />
          <Route path="/packages" element={<SurgeryPackagesPage />} />
          <Route path="/health-packages" element={<HealthPackagesPage />} />
          <Route path="/wellness-packages" element={<WellnessPackagesPage />} />
          <Route path="/wellness" element={<WellnessPackagesPage />} />
          <Route path="/doctor-appointment" element={<DoctorAppointmentPage />} />
          <Route path="/doctors" element={<DoctorAppointmentPage />} />
          <Route path="/doctor" element={<DoctorAppointmentPage />} />
          <Route path="/book-doctor" element={<BookDoctorPage />} />
          <Route path="/book-doctor-appointment" element={<BookDoctorPage />} />
          <Route path="/book-appointment" element={<BookDoctorPage />} />
          <Route path="/physiotherapy" element={<PhysiotherapyPage />} />
          <Route path="/physio" element={<PhysiotherapyPage />} />
          <Route path="/physiotherapist" element={<PhysiotherapyPage />} />
          <Route path="/physiotherapy/:id" element={<PhysiotherapyDetailPage />} />
          <Route path="/physio/:id" element={<PhysiotherapyDetailPage />} />
          <Route path="/physiotherapy-service/:id" element={<PhysiotherapyDetailPage />} />
          <Route path="/physiotherapy/:id/book" element={<PhysiotherapyBookingPage />} />
          <Route path="/book-physiotherapy" element={<PhysiotherapyBookingPage />} />
          <Route path="/book-physiotherapy/:id" element={<PhysiotherapyBookingPage />} />
          <Route path="/patient-dashboard" element={<PatientDashboardPage onOpenPrescriptionModal={handleOpenPrescriptionRequest} />} />
          <Route path="/patient-dashboard/*" element={<PatientDashboardPage onOpenPrescriptionModal={handleOpenPrescriptionRequest} />} />
          <Route path="/patient" element={<PatientDashboardPage onOpenPrescriptionModal={handleOpenPrescriptionRequest} />} />
          <Route path="/patient/*" element={<PatientDashboardPage onOpenPrescriptionModal={handleOpenPrescriptionRequest} />} />
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

      {/* Site-wide Floating Call & WhatsApp Buttons */}
      <FloatingCallWhatsApp />

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
