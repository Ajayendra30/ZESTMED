// src/pages/PatientDashboardPage.jsx
// Redesigned to match the exact ZESTMED Patient / User Dashboard specification pixel-for-pixel
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSubdomainUrl } from '../utils/subdomain';
import {
  Home,
  FlaskConical,
  Calendar,
  ShoppingCart,
  Package,
  UploadCloud,
  Upload,
  FileText,
  Users,
  User,
  Bell,
  LogOut,
  Menu,
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  Clock,
  Zap,
  Pill,
  Heart,
  Check,
  CheckCircle2,
  ArrowRight,
  X,
  Eye,
  ExternalLink,
  Plus,
  MapPin,
  Phone,
  Mail,
  Trash2,
  Edit2,
  ShieldCheck,
  Share2,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  initialPatientProfile,
  initialPatientOrders,
  initialPatientLabBookings,
  initialPatientPrescriptions,
  initialFamilyMembers,
  initialAssamAddresses
} from '../mock-data/patientData';
import DigitalLabReportModal from '../components/DigitalLabReportModal';
import OrderInvoiceModal from '../components/OrderInvoiceModal';
import AddFamilyMemberModal from '../components/AddFamilyMemberModal';
import AddAddressModal from '../components/AddAddressModal';
import PrescriptionDetailModal from '../components/PrescriptionDetailModal';
import PrescriptionUploadModal from '../components/PrescriptionUploadModal';
import AuthModal from '../components/AuthModal';
import { getMockReportDetails, downloadClinicalReport, shareClinicalReport } from '../utils/reportGenerator';
import { downloadOrderInvoicePdf, openClinicalReportPdf } from '../utils/pdfGenerator';

export default function PatientDashboardPage({ onOpenPrescriptionModal }) {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, openAuth, loginWithGoogle, updateUser } = useAuth();
  const { cartCount, openCart } = useCart();
  const { addToast } = useToast();

  // Navigation State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [healthTipIndex, setHealthTipIndex] = useState(0);

  // Modals State
  const [selectedReportBooking, setSelectedReportBooking] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isPrescriptionUploadModalOpen, setIsPrescriptionUploadModalOpen] = useState(false);

  // Check URL query to open prescription vault if requested
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('open') === 'prescription' || params.get('tab') === 'prescription') {
      setActiveMenu('prescription');
      setIsPrescriptionUploadModalOpen(true);
    }
  }, []);

  // Persistent User Data
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_patient_orders');
      return saved ? JSON.parse(saved) : initialPatientOrders;
    } catch {
      return initialPatientOrders;
    }
  });

  const [labBookings, setLabBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_patient_lab_bookings');
      return saved ? JSON.parse(saved) : initialPatientLabBookings;
    } catch {
      return initialPatientLabBookings;
    }
  });

  const [familyMembers, setFamilyMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_family_members');
      return saved ? JSON.parse(saved) : initialFamilyMembers;
    } catch {
      return initialFamilyMembers;
    }
  });

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_saved_addresses');
      return saved ? JSON.parse(saved) : initialAssamAddresses;
    } catch {
      return initialAssamAddresses;
    }
  });

  // Notifications demo list
  const notificationsList = [
    {
      id: 1,
      title: 'Lab Report Ready',
      desc: 'Complete Blood Count (CBC) report is now available for download.',
      time: '10m ago'
    },
    {
      id: 2,
      title: 'Phlebotomist Assigned',
      desc: 'Bikash Das assigned for Home Collection on Nov 15, 10:00 AM (Guwahati).',
      time: '1h ago'
    },
    {
      id: 3,
      title: 'Medicine Dispatched',
      desc: 'Order #ORD5487 out for express delivery in Dispur.',
      time: 'Yesterday'
    }
  ];

  // Health Tips Carousel Items
  const healthTips = [
    {
      title: 'Stay Healthy Stay Active',
      text: 'Drink enough water, eat a balanced diet and get regular checkups.'
    },
    {
      title: 'Assam Monsoon Care',
      text: 'Stay hydrated with boiled water, use mosquito nets, and keep home first-aid stocked.'
    },
    {
      title: 'Preventive Lab Checks',
      text: 'Regular lipid profile and HbA1c screening helps manage metabolic health early.'
    }
  ];

  const [bookingFilter, setBookingFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [profileForm, setProfileForm] = useState(() => {
    let saved = null;
    try {
      const stored = localStorage.getItem('zestmed_patient_profile');
      if (stored) saved = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      name: user?.name || saved?.name || 'Rahul Verma',
      uhid: user?.uhid || saved?.uhid || (user?.id ? `ZM-PAT-${user.id.replace(/\D/g, '').slice(-6) || '501284'}` : 'ZM-PAT-501284'),
      email: user?.email || saved?.email || 'rahul.verma@gmail.com',
      phone: user?.contact || user?.phone || saved?.phone || '+91 92791 25091',
      age: user?.age || saved?.age || '34',
      gender: user?.gender || saved?.gender || 'Male',
      bloodGroup: user?.bloodGroup || saved?.bloodGroup || 'B+',
      emergencyContact: user?.emergencyContact || saved?.emergencyContact || 'Emergency Contact (+91 92791 25091)',
      city: user?.city || saved?.city || 'Guwahati, Assam'
    };
  });

  const handleCancelBooking = (bookingId) => {
    setLabBookings((prev) =>
      prev.map((b) => (b.id === bookingId || b.bookingId === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    addToast(`Booking ${bookingId} cancelled. Refund will be processed if prepaid.`, 'info');
  };

  const handleDeleteFamilyMember = (memberId) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== memberId));
    addToast('Family member removed from records.', 'info');
  };

  const handleDeleteAddress = (addressId) => {
    setAddresses((prev) => {
      const updated = prev.filter((a) => a.id !== addressId);
      try {
        localStorage.setItem('zestmed_saved_addresses', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    addToast('Address removed.', 'info');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      addToast('Please enter your full legal name.', 'error');
      return;
    }

    const updatedProfile = {
      ...profileForm,
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
      bloodGroup: profileForm.bloodGroup.trim(),
      emergencyContact: profileForm.emergencyContact.trim(),
    };

    setProfileForm(updatedProfile);

    if (updateUser) {
      updateUser({
        name: updatedProfile.name,
        email: updatedProfile.email,
        contact: updatedProfile.phone,
        phone: updatedProfile.phone,
        bloodGroup: updatedProfile.bloodGroup,
        emergencyContact: updatedProfile.emergencyContact,
        age: updatedProfile.age,
        gender: updatedProfile.gender,
        city: updatedProfile.city,
        uhid: updatedProfile.uhid
      });
    }

    try {
      localStorage.setItem('zestmed_patient_profile', JSON.stringify(updatedProfile));
    } catch (err) {
      console.error(err);
    }

    addToast('Profile changes saved successfully!', 'success');
  };

  // Handlers for interactive actions
  const handleNextHealthTip = () => {
    setHealthTipIndex((prev) => (prev + 1) % healthTips.length);
  };

  const handlePrevHealthTip = () => {
    setHealthTipIndex((prev) => (prev - 1 + healthTips.length) % healthTips.length);
  };

  const handleOpenReportModal = (testName, dateStr, reportId, pathologist) => {
    // Find matching booking or create demo mock object with full diagnostic parameters
    const existing = labBookings.find((b) => b.testName.toLowerCase().includes(testName.toLowerCase().slice(0, 5)));
    const detailed = getMockReportDetails(testName, dateStr, reportId || existing?.id, pathologist);
    setSelectedReportBooking({
      ...detailed,
      ...(existing || {}),
      reportData: detailed.reportData,
      testName: testName || existing?.testName,
      patientName: patientFullName,
      collectionDate: dateStr || existing?.date || 'Nov 07, 2026',
      date: dateStr || existing?.date || 'Nov 07, 2026',
      id: reportId || existing?.id || 'ZM-REP-9041',
      bookingId: reportId || existing?.id || 'ZM-REP-9041',
      reportingDoctor: pathologist || 'Dr. N. Bora, MD (Pathology)'
    });
  };

  const handleOpenOrderModal = (medicineName, orderId) => {
    const match = orders.find((o) => o.id === orderId) || {
      id: orderId,
      date: 'Nov 10, 2026',
      total: 340,
      status: 'Delivered',
      items: [
        {
          id: 'med-1',
          name: medicineName,
          dosage: '500 mg',
          quantity: 2,
          price: 170
        }
      ],
      shippingAddress: {
        name: patientFullName,
        street: 'Flat 4B, Brahmaputra Heights, GS Road',
        locality: 'Dispur',
        city: 'Guwahati',
        pincode: '781005'
      }
    };
    setSelectedInvoiceOrder(match);
  };

  const handleLogout = () => {
    if (logout) logout();
    addToast('Signed out of patient session. Returned to Public Store.', 'info');
    navigate('/');
  };

  // Synchronize profile form when authenticated user changes
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.contact || user.phone || prev.phone,
        bloodGroup: user.bloodGroup || prev.bloodGroup,
        emergencyContact: user.emergencyContact || prev.emergencyContact,
        uhid: user.uhid || (user.id ? `ZM-PAT-${user.id.replace(/\D/g, '').slice(-6) || '501284'}` : prev.uhid)
      }));
    }
  }, [user]);

  const currentHour = new Date().getHours();
  const greetingText = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const patientFullName = user?.name || profileForm.name || 'Patient';
  const patientFirstName = patientFullName.split(' ')[0] || 'Patient';
  const patientUHID = user?.uhid || profileForm.uhid || (user?.id ? `ZM-PAT-${user.id.replace(/\D/g, '').slice(-6) || '501284'}` : 'ZM-PAT-501284');

  // Protected Route Authentication Guard:
  // If user is not authenticated, show professional ZESTMED Patient Portal Login Gate
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#071828] via-[#0D233A] to-[#0A1A2A] flex flex-col justify-between p-4 sm:p-6 text-white select-none relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00BFA5]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#005CB9]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-2">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5722] to-[#005CB9] flex items-center justify-center shadow-lg shadow-[#005CB9]/30 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
                ZEST<span className="text-[#FF5722]">MED</span>
              </span>
              <span className="text-[10.5px] text-blue-200/80 tracking-wider uppercase block font-semibold">
                Patient Health Portal
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white font-medium transition backdrop-blur-xs"
          >
            <span>Exit to Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Central Auth Gate Card */}
        <div className="relative z-10 max-w-md mx-auto w-full my-auto py-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Glowing Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#005CB9] shadow-inner mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Patient Portal Access
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Please sign in with your verified mobile number or Google account to access your personal dashboard, lab test reports, and active prescriptions.
            </p>

            {/* Quick Benefits list */}
            <div className="my-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>NABL Accredited Digital Diagnostic Reports</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Real-time Cold-Chain Medicine Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Doctor Prescriptions & Family Health History</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-[#005CB9] to-[#00BFA5] hover:from-[#007b70] hover:to-[#00a892] text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition transform active:scale-[0.98] cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Login with Mobile OTP</span>
              </button>

              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>256-bit Encrypted Medical Data • HIPAA & NABH Compliant</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center py-2 text-xs text-slate-400">
          © 2026 ZESTMED Health Private Limited • Assam Healthcare Hub
        </footer>

        {/* Global AuthModal mounted for seamless login */}
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-sans antialiased overflow-hidden select-none relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (Dark Navy #0A1E34)                      */}
      {/* ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-[#0A1E34] flex flex-col border-r border-[#081827] justify-between overflow-hidden transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:shrink-0 lg:visible lg:pointer-events-auto ${
          isSidebarOpen
            ? 'translate-x-0 visible pointer-events-auto'
            : '-translate-x-full invisible pointer-events-none'
        }`}
      >
        {/* Top: Logo & Menu Items */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="Zestmed Diagnostics & Polyclinic"
                className="h-8 sm:h-9 w-auto object-contain shrink-0 select-none"
              />
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {/* Dashboard (Active Pill) */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('dashboard');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'dashboard'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Book Lab Test */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/diagnostics');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Book Lab Test</span>
            </button>

            {/* My Lab Bookings */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('bookings');
                setIsSidebarOpen(false);
                addToast('Viewing Assam Home & Lab Appointments', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'bookings'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Lab Bookings</span>
            </button>

            {/* Medicine Store */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/medicines');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Medicine Store</span>
            </button>

            {/* My Medicine Orders */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('orders');
                setIsSidebarOpen(false);
                addToast('Viewing Medicine Order History', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'orders'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Medicine Orders</span>
            </button>

            {/* Upload Prescription */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('prescription');
                setIsSidebarOpen(false);
                setIsPrescriptionUploadModalOpen(true);
                addToast('Opening Prescription Upload Vault', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'prescription'
                  ? 'bg-[#102A45] text-white shadow-sm ring-1 ring-teal-500/40'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <UploadCloud className={`w-4 h-4 ${activeMenu === 'prescription' ? 'text-[#005CB9]' : ''}`} />
              <span>Upload Prescription</span>
            </button>

            {/* My Reports */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('reports');
                setIsSidebarOpen(false);
                addToast('Viewing Verified Pathology Reports', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'reports'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Reports</span>
            </button>

            {/* Family Members */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('family');
                setIsSidebarOpen(false);
                addToast('Viewing Family Health Beneficiaries', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'family'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family Members</span>
            </button>

            {/* My Profile */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('profile');
                setIsSidebarOpen(false);
                addToast('UHID: ZM-PAT-781001 (Dispur, Assam)', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'profile'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            {/* Notifications with red indicator dot */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('notifications');
                setIsSidebarOpen(false);
                addToast('Viewing real-time medical & appointment alerts', 'info');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'notifications'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Bottom Sidebar Brand Graphic & Tagline */}
        <div className="p-4 pt-0 shrink-0 text-center relative z-10">
          <div className="bg-[#0e2c47]/80 rounded-2xl p-3 border border-white/5 backdrop-blur-xs shadow-inner">
            <SidebarClipboardGraphic />
            <p className="text-white font-semibold text-xs tracking-wide mt-2">
              Your Health, Our Priority
            </p>
          </div>
        </div>

        {/* Ambient background glow at bottom */}
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#00BFA5]/15 rounded-full blur-3xl pointer-events-none" />
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA (Header + Dashboard Body)           */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          {/* Left: Hamburger + Search Input */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl min-w-0 mr-2 sm:mr-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 transition rounded-lg hover:bg-slate-100 shrink-0"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Prominent Search Bar */}
            <div className="relative w-full min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines, lab tests..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#005CB9] focus:ring-1 focus:ring-[#005CB9] transition"
              />
            </div>
          </div>

          {/* Right: Cart (with badge 2), Notification Bell & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Cart Icon with badge 2 */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-1.5 sm:p-2 rounded-xl text-[#005CB9] hover:bg-blue-50 transition"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#005CB9]" />
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount > 0 ? cartCount : 2}
              </span>
            </button>

            {/* Notification Bell with Red Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-30"
                  onMouseLeave={() => setIsNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Health Alerts & Updates</span>
                    <span className="text-[10px] font-bold text-[#005CB9] bg-teal-50 px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>
                  <div className="space-y-2 pt-2.5 max-h-60 overflow-y-auto">
                    {notificationsList.map((n) => (
                      <div key={n.id} className="text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                        <p className="font-bold text-slate-900 leading-tight">{n.title}</p>
                        <p className="text-slate-600 leading-snug mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition text-left"
              >
                {/* Circular Patient Photo Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#005CB9]/20 bg-slate-100 shrink-0">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patientFullName)}&background=14B8A6&color=fff`}
                    alt={patientFullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patientFullName)}&background=14B8A6&color=fff`;
                    }}
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    {patientFullName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1 leading-none">
                    Patient
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 sm:w-60 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{patientFullName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">UHID: {patientUHID}</p>
                    <p className="text-[11px] text-teal-600 font-medium mt-0.5">{profileForm.city || 'Dispur, Guwahati (Assam)'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsAddFamilyModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Manage Family Members</span>
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <Link
                    to="/"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Exit to Public Store</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
          {activeMenu === 'dashboard' && (
            <>
          {/* ======================================================== */}
          {/* 3. HERO GREETING BANNER WITH STETHOSCOPE GRAPHIC         */}
          {/* ======================================================== */}
          <div className="relative rounded-2xl p-4 sm:p-6 overflow-hidden border border-[#D5EAEF] bg-gradient-to-r from-[#EEF7F9] via-[#E8F4F6] to-[#DBEFF3] shadow-xs">
            <div className="relative z-10 max-w-xl">
              <h1 className="text-xl sm:text-2xl font-black text-[#0A1E34] tracking-tight flex items-center gap-2">
                <span>{greetingText}, {patientFirstName}</span>
                <span className="text-xl sm:text-2xl inline-block transform hover:rotate-12 transition-transform select-none">👋</span>
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Welcome to your ZESTMED health dashboard. Here's your health summary.
              </p>
            </div>

            {/* Realistic Stethoscope Graphic on the Right */}
            <StethoscopeGraphic />
          </div>

          {/* ======================================================== */}
          {/* 4. TOP 4 METRIC KPI CARDS ROW                            */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Bookings */}
            <div
              onClick={() => setActiveMenu('bookings')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Total Bookings
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {labBookings.length}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-blue-600 mt-0.5 flex items-center gap-0.5">
                  <span>View All →</span>
                </div>
              </div>
            </div>

            {/* Card 2: Upcoming Appointments */}
            <div
              onClick={() => setActiveMenu('bookings')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <TestTubeIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Upcoming
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  2
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-blue-600 mt-0.5 flex items-center gap-0.5">
                  <span>Scheduled →</span>
                </div>
              </div>
            </div>

            {/* Card 3: Medicine Orders */}
            <div
              onClick={() => setActiveMenu('orders')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Orders
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {orders.length}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-sky-600 mt-0.5 flex items-center gap-0.5">
                  <span>Track →</span>
                </div>
              </div>
            </div>

            {/* Card 4: Reports Available */}
            <div
              onClick={() => setActiveMenu('reports')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Reports
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  4
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-purple-600 mt-0.5 flex items-center gap-0.5">
                  <span>Download →</span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. MIDDLE SECTION: UPCOMING APPOINTMENTS + QUICK ACTIONS  */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Upcoming Appointments (~58% width) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Upcoming Appointments
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('bookings');
                    addToast('Displaying full laboratory appointments list (Assam Hub)', 'info');
                  }}
                  className="text-xs font-semibold text-[#005CB9] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2 Appointments Matching Image */}
              <div className="space-y-3 pt-1">
                {/* Appointment 1 */}
                <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100 gap-2">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    {/* Azure date box */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F0F6FE] border border-blue-100 text-[#005CB9] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none">Nov</span>
                      <span className="text-base sm:text-lg font-black leading-none mt-0.5 sm:mt-1">15</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        Complete Blood Count (CBC)
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">10:00 AM - Home Collection</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-50 border border-blue-600/80 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shrink-0">
                    Confirmed
                  </span>
                </div>

                {/* Appointment 2 */}
                <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100 gap-2">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    {/* Blue date box */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#EFF6FF] border border-blue-100 text-[#2563EB] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none">Nov</span>
                      <span className="text-base sm:text-lg font-black leading-none mt-0.5 sm:mt-1">20</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        Thyroid Profile (T3, T4, TSH)
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">11:30 AM - Lab Visit</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-600 border border-blue-200/80 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shrink-0">
                    Scheduled
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Quick Actions (~42% width) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#005CB9]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Quick Actions
                </h3>
              </div>

              {/* 4 Quick Action Buttons matching row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 my-auto">
                {/* 1. Book Lab Test */}
                <button
                  type="button"
                  onClick={() => navigate('/diagnostics')}
                  className="bg-white border border-slate-100 hover:border-[#005CB9] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FlaskConical className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    Book Lab Test
                  </span>
                </button>

                {/* 2. Order Medicines */}
                <button
                  type="button"
                  onClick={() => navigate('/medicines')}
                  className="bg-white border border-slate-100 hover:border-[#005CB9] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-200 text-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Pill className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    Order Medicines
                  </span>
                </button>

                {/* 3. Upload Prescription */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('prescription');
                    setIsPrescriptionUploadModalOpen(true);
                    addToast('Opening Doctor\'s Prescription Upload Vault', 'info');
                  }}
                  className="bg-white border border-slate-100 hover:border-[#005CB9] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    Upload Prescription
                  </span>
                </button>

                {/* 4. Add Family Member */}
                <button
                  type="button"
                  onClick={() => setIsAddFamilyModalOpen(true)}
                  className="bg-white border border-slate-100 hover:border-[#005CB9] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    Add Family Member
                  </span>
                </button>
              </div>
              <div className="pt-2" />
            </div>
          </div>

          {/* ======================================================== */}
          {/* 6. BOTTOM SECTION: MEDICINE ORDERS + REPORTS + HEALTH TIPS*/}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Card 1: Recent Medicine Orders (~38% width -> lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Medicine Orders
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('orders');
                    addToast('Opening complete pharmacy orders ledger', 'info');
                  }}
                  className="text-xs font-semibold text-[#005CB9] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Medicine Orders matching image */}
              <div className="space-y-3 pt-1">
                {/* 1. Paracetamol 500 mg */}
                <div
                  onClick={() => handleOpenOrderModal('Paracetamol 500 mg', '#ORD5487')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <MedicineBoxThumb type="paracetamol" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#005CB9] transition">
                        Paracetamol 500 mg
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Order #ORD5487 • Nov 10, 2026
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-blue-50 border border-blue-600/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      Delivered
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* 2. Vitamin D3 600 IU */}
                <div
                  onClick={() => handleOpenOrderModal('Vitamin D3 600 IU', '#ORD5462')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <MedicineBoxThumb type="vitamind3" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#005CB9] transition">
                        Vitamin D3 600 IU
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Order #ORD5462 • Nov 05, 2026
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-200 text-blue-50 border border-blue-600/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      Delivered
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* 3. Omeprazole 20 mg */}
                <div
                  onClick={() => handleOpenOrderModal('Omeprazole 20 mg', '#ORD5420')}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <MedicineBoxThumb type="omeprazole" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#005CB9] transition">
                        Omeprazole 20 mg
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Order #ORD5420 • Nov 01, 2026
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-600 border border-blue-200/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      Completed
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Recent Reports (~35% width -> lg:col-span-4) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Reports
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('reports');
                    addToast('Opening digital reports archive', 'info');
                  }}
                  className="text-xs font-semibold text-[#005CB9] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Reports matching image */}
              <div className="space-y-3 pt-1">
                {/* 1. Complete Blood Count (CBC) */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Complete Blood Count (CBC)
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Nov 07, 2026
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      downloadClinicalReport({ test: 'Complete Blood Count (CBC)', date: 'Nov 07, 2026', id: 'ZM-REP-9041' });
                      addToast('Official signed PDF report downloaded for Complete Blood Count (CBC).', 'success');
                    }}
                    className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Lipid Profile */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Lipid Profile
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Oct 28, 2026
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      downloadClinicalReport({ test: 'Lipid Profile', date: 'Oct 28, 2026', id: 'ZM-REP-8812' });
                      addToast('Official signed PDF report downloaded for Lipid Profile.', 'success');
                    }}
                    className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* 3. Liver Function Test (LFT) */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Liver Function Test (LFT)
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Oct 20, 2026
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      downloadClinicalReport({ test: 'Liver Function Test (LFT)', date: 'Oct 20, 2026', id: 'ZM-REP-8450' });
                      addToast('Official signed PDF report downloaded for Liver Function Test (LFT).', 'success');
                    }}
                    className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Health Tips (~27% width -> lg:col-span-3) */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-blue-200 fill-blue-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Health Tips
                  </h3>
                </div>

                {/* Illustration + Tip Content */}
                <div className="flex items-start gap-3">
                  <HeartHealthGraphic />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0A1E34] leading-tight">
                      {healthTips[healthTipIndex].title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {healthTips[healthTipIndex].text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carousel Navigation at Bottom */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={handlePrevHealthTip}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Previous Tip"
                >
                  <span className="text-sm font-bold leading-none select-none">‹</span>
                </button>

                {/* 3 Pagination Indicator Dots */}
                <div className="flex items-center gap-1.5">
                  {healthTips.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHealthTipIndex(i)}
                      className={`transition-all duration-200 ${
                        healthTipIndex === i
                          ? 'w-4 h-1.5 rounded-full bg-[#005CB9]'
                          : 'w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextHealthTip}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Next Tip"
                >
                  <span className="text-sm font-bold leading-none select-none">›</span>
                </button>
              </div>
            </div>
          </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 1. MY LAB BOOKINGS VIEW                                  */}
          {/* ======================================================== */}
          {activeMenu === 'bookings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-[#005CB9]" />
                    <span>My Diagnostic & Lab Bookings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage all your home sample collections and lab visits across Assam.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/diagnostics')}
                  className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book New Lab Test</span>
                </button>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Bookings' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'report-ready', label: 'Report Ready' },
                  { id: 'completed', label: 'Completed' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setBookingFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      bookingFilter === f.id
                        ? 'bg-[#005CB9] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              <div className="space-y-3.5">
                {labBookings
                  .filter((b) => {
                    if (bookingFilter === 'all') return true;
                    if (bookingFilter === 'confirmed')
                      return (b.status || '').toLowerCase().includes('confirm') || (b.status || '').toLowerCase().includes('schedule');
                    if (bookingFilter === 'report-ready')
                      return (b.status || '').toLowerCase().includes('report') || (b.status || '').toLowerCase().includes('ready');
                    if (bookingFilter === 'completed')
                      return (b.status || '').toLowerCase().includes('complete');
                    return true;
                  })
                  .map((b) => (
                    <div
                      key={b.id || b.bookingId}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <FlaskConical className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{b.testName}</h3>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              ID: {b.bookingId || b.id} • Patient: {b.patientName || 'Self'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              (b.status || '').toLowerCase().includes('report')
                                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                : (b.status || '').toLowerCase().includes('confirm')
                                ? 'bg-blue-500 text-blue-50 border border-blue-600'
                                : (b.status || '').toLowerCase().includes('cancel')
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : 'bg-blue-50 text-blue-600 border border-blue-200'
                            }`}
                          >
                            {b.status || 'Confirmed'}
                          </span>
                          <span className="text-sm font-black text-slate-900 ml-1">
                            ₹{b.price || 499}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{b.date} • {b.time || '10:00 AM'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Home className="w-4 h-4 text-teal-500" />
                            <span className="font-medium">{b.type || 'Home Collection'}</span>
                          </div>
                          {b.labExecutive && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <User className="w-4 h-4 text-slate-400" />
                              <span>Phlebotomist: <strong className="text-slate-700">{b.labExecutive}</strong></span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {(b.status || '').toLowerCase().includes('report') && (
                            <button
                              type="button"
                              onClick={() => handleOpenReportModal(b.testName, b.date)}
                              className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>View Report</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => addToast(`Phlebotomist ${b.labExecutive || 'Bikash Das'} is active (Cold-Chain Box CCB-04).`, 'info')}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
                          >
                            Track Phlebotomist
                          </button>
                          {!(b.status || '').toLowerCase().includes('cancel') && (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(b.id || b.bookingId)}
                              className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. MY MEDICINE ORDERS VIEW                               */}
          {/* ======================================================== */}
          {activeMenu === 'orders' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-[#005CB9]" />
                    <span>My Medicine Orders</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Track genuine prescription pharmacy orders delivered across Assam.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/medicines')}
                  className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buy Medicines</span>
                </button>
              </div>

              {/* Order Status Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'out', label: 'Out for Delivery' },
                  { id: 'delivered', label: 'Delivered' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setOrderFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      orderFilter === f.id
                        ? 'bg-[#005CB9] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="space-y-3.5">
                {orders
                  .filter((o) => {
                    if (orderFilter === 'all') return true;
                    if (orderFilter === 'out') return (o.status || '').toLowerCase().includes('out');
                    if (orderFilter === 'delivered') return (o.status || '').toLowerCase().includes('deliver');
                    return true;
                  })
                  .map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900">{order.id}</h3>
                              <span className="text-xs text-slate-400 font-medium">• {order.date}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                              {order.deliveryAddress || 'Guwahati Central Hub Delivery'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              order.status === 'Delivered'
                                ? 'bg-blue-200 text-blue-50 border border-blue-600'
                                : 'bg-sky-50 text-sky-600 border border-sky-200'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-sm font-black text-slate-900 ml-1">
                            ₹{order.totalAmount || order.total || 340}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="bg-slate-50/60 rounded-xl p-3 space-y-2">
                        {(order.items || [
                          { name: 'Paracetamol 500 mg', dosage: '500 mg', quantity: 2, price: 170 }
                        ]).map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#005CB9]" />
                              <span className="font-semibold text-slate-800">{it.name}</span>
                              <span className="text-slate-400 font-normal">({it.dosage || 'Standard'})</span>
                            </div>
                            <span className="font-mono text-slate-600">Qty: {it.quantity} • ₹{it.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="text-xs text-slate-500">
                          Payment: <strong className="text-slate-700 font-semibold">{order.paymentMethod || 'Prepaid UPI'}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenOrderModal(order.items?.[0]?.name || 'Medicines', order.id)}
                            className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Invoice & Tracking</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              downloadOrderInvoicePdf(order);
                              addToast(`Tax Invoice PDF downloaded for Order #${order.id}.`, 'success');
                            }}
                            className="p-1.5 text-slate-600 hover:text-[#005CB9] hover:bg-slate-100 rounded-xl transition border border-slate-200"
                            title="Download Invoice PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              addToast(`Medicines from order ${order.id} re-added to cart!`, 'success');
                              openCart();
                            }}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reorder</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* UPLOAD DOCTOR'S PRESCRIPTION VAULT VIEW                  */}
          {/* ======================================================== */}
          {activeMenu === 'prescription' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header Card with Primary Upload Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <UploadCloud className="w-6 h-6 text-[#005CB9]" />
                    <span>Doctor's Prescription Vault</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload handwritten or digital doctor prescriptions for registered pharmacist verification and quick re-orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrescriptionUploadModalOpen(true)}
                  className="bg-[#005CB9] hover:bg-[#004C99] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload New Prescription</span>
                </button>
              </div>

              {/* Upload Dropzone Hero Card */}
              <div 
                onClick={() => setIsPrescriptionUploadModalOpen(true)}
                className="bg-gradient-to-br from-teal-50/60 via-blue-200/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-dashed border-[#005CB9]/40 hover:border-[#005CB9] transition cursor-pointer text-center group shadow-xs"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-[#005CB9] border border-teal-100 flex items-center justify-center mx-auto mb-3 shadow-xs group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Click here to Upload Doctor's Prescription
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Drag & drop your prescription image (JPG, PNG) or PDF document. Our Guwahati chief pharmacist verifies and pre-fills your medicine cart within 15 minutes.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-teal-200 text-[#005CB9] text-xs font-bold shadow-2xs">
                  <span>🔒 100% Confidential • Verified by Licensed Pharmacists</span>
                </div>
              </div>

              {/* Active & Past Prescriptions List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Uploaded & Verified Prescriptions ({initialPatientPrescriptions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initialPatientPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#005CB9]">{rx.id}</span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{rx.doctorName}</h4>
                            <p className="text-[11px] text-slate-500">{rx.specialty} • {rx.hospital}</p>
                          </div>
                          <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                            rx.status.toLowerCase().includes('verified')
                              ? 'bg-blue-50 text-blue-50 border border-blue-700'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {rx.status}
                          </span>
                        </div>

                        <div className="py-3 text-xs text-slate-600 space-y-1">
                          <p><strong className="text-slate-700">Issued On:</strong> {rx.dateOfIssue}</p>
                          <p><strong className="text-slate-700">Valid Until:</strong> {rx.expiryDate}</p>
                          <p><strong className="text-slate-700">Medications:</strong> {rx.medicines?.map(m => m.name).join(', ') || 'Metformin, Atorvastatin'}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPrescription(rx)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addToast(`Prescribed medicines from ${rx.id} added to cart!`, 'success');
                            openCart();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#005CB9] hover:bg-[#004C99] text-white text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Order Medicines</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. MY DIAGNOSTIC REPORTS VIEW                            */}
          {/* ======================================================== */}
          {activeMenu === 'reports' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#005CB9]" />
                    <span>My Diagnostic Test Reports</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Digital reports authorized by certified MD Pathologists (Dispur Central Laboratory).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/diagnostics')}
                  className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Another Test</span>
                </button>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    test: 'Complete Blood Count (CBC)',
                    date: 'Nov 07, 2026',
                    id: 'ZM-REP-9041',
                    status: 'Normal',
                    pathologist: 'Dr. N. Bora, MD (Pathology)'
                  },
                  {
                    test: 'Lipid Profile Screen',
                    date: 'Oct 28, 2026',
                    id: 'ZM-REP-8812',
                    status: 'Desirable',
                    pathologist: 'Dr. Arindam Sharma, MD'
                  },
                  {
                    test: 'Liver Function Test (LFT)',
                    date: 'Oct 20, 2026',
                    id: 'ZM-REP-8450',
                    status: 'Normal',
                    pathologist: 'Dr. N. Bora, MD (Pathology)'
                  },
                  {
                    test: 'Thyroid Profile (T3, T4, TSH)',
                    date: 'Sep 15, 2026',
                    id: 'ZM-REP-7901',
                    status: 'Optimal',
                    pathologist: 'Dr. S. Das, MD (Biochemistry)'
                  }
                ].map((rep, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{rep.test}</h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {rep.id} • {rep.date}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-200 bg-blue-600 border border-blue-50 px-2.5 py-0.5 rounded-full shrink-0">
                        {rep.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                      <span>Pathologist: <strong className="text-slate-700">{rep.pathologist}</strong></span>
                      <ShieldCheck className="w-4 h-4 text-[#005CB9]" />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenReportModal(rep.test, rep.date, rep.id, rep.pathologist)}
                        className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          downloadClinicalReport(rep);
                          addToast(`Official signed PDF report downloaded for ${rep.test}.`, 'success');
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => shareClinicalReport(rep, addToast)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
                        title="Share with Doctor"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. FAMILY MEMBERS VIEW                                   */}
          {/* ======================================================== */}
          {activeMenu === 'family' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#005CB9]" />
                    <span>Family Members & Beneficiaries</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage profiles, book lab tests, and track health vitals for your loved ones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddFamilyModalOpen(true)}
                  className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Family Member</span>
                </button>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-black text-base flex items-center justify-center shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                            <span className="inline-block bg-teal-50 text-[#005CB9] text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                              {member.relationship || 'Family'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {member.bloodGroup || 'O+'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-50 p-3 rounded-xl text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                          <span className="font-bold text-slate-800">{member.age || '34'} yrs • {member.gender || 'Male'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Contact</span>
                          <span className="font-bold text-slate-800 truncate block">{member.phone || '+91 92791 25091'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          addToast(`Booking lab test for ${member.name}...`, 'info');
                          navigate('/diagnostics');
                        }}
                        className="flex-1 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition text-center shadow-xs"
                      >
                        Book Test
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFamilyMember(member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. MY PROFILE VIEW                                       */}
          {/* ======================================================== */}
          {activeMenu === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <User className="w-6 h-6 text-[#005CB9]" />
                  <span>My Profile & Saved Addresses</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your personal health identity, contact info, and Assam delivery locations.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Profile Form */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#005CB9]" />
                    <span>Personal Health Identity</span>
                  </h3>

                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#005CB9]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Unique Health ID (UHID)</label>
                        <input
                          type="text"
                          value={profileForm.uhid}
                          disabled
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Email Address</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#005CB9]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#005CB9]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Blood Group</label>
                        <input
                          type="text"
                          value={profileForm.bloodGroup}
                          onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#005CB9]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Emergency Contact</label>
                        <input
                          type="text"
                          value={profileForm.emergencyContact}
                          onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#005CB9]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#005CB9] hover:bg-[#004C99] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right: Saved Addresses */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#005CB9]" />
                        <span>Saved Assam Addresses</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        className="text-xs text-[#005CB9] hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition flex items-start justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px] inline-block mb-1">
                              {addr.tag || 'Home'}
                            </span>
                            <p className="text-slate-700 font-medium leading-relaxed">{addr.addressLine || addr.street}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">{addr.locality}, {addr.city} - {addr.pincode}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. NOTIFICATIONS CENTER VIEW                             */}
          {/* ======================================================== */}
          {activeMenu === 'notifications' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Bell className="w-6 h-6 text-[#005CB9]" />
                    <span>Notification Center</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Real-time operational alerts for diagnostic reports, home sample collections, and pharmacy orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('All notifications marked as read', 'success')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-200" />
                  <span>Mark All as Read</span>
                </button>
              </div>

              {/* Notification Cards List */}
              <div className="space-y-3">
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-5 h-5 text-[#005CB9]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {n.title.toLowerCase().includes('report') && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu('reports');
                            addToast('Navigating to verified reports', 'info');
                          }}
                          className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          View Report
                        </button>
                      )}
                      {n.title.toLowerCase().includes('phlebotomist') && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu('bookings');
                            addToast('Navigating to active lab bookings', 'info');
                          }}
                          className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Track Visit
                        </button>
                      )}
                      {n.title.toLowerCase().includes('medicine') && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu('orders');
                            addToast('Navigating to medicine orders', 'info');
                          }}
                          className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Track Delivery
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => addToast(`Notification #${n.id} dismissed`, 'info')}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-slate-600 rounded-xl text-xs transition cursor-pointer"
                        title="Dismiss"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* 7. CONNECTED INTERACTIVE MODALS                          */}
      {/* ======================================================== */}
      {/* Digital Lab Report Modal */}
      {selectedReportBooking && (
        <DigitalLabReportModal
          isOpen={!!selectedReportBooking}
          booking={selectedReportBooking}
          onClose={() => setSelectedReportBooking(null)}
        />
      )}

      {/* Order Invoice & Tracking Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Add Family Member Modal */}
      {isAddFamilyModalOpen && (
        <AddFamilyMemberModal
          isOpen={isAddFamilyModalOpen}
          onClose={() => setIsAddFamilyModalOpen(false)}
          onAddMember={(newMember) => {
            setFamilyMembers((prev) => [newMember, ...prev]);
            addToast(`Family member ${newMember.name} added successfully!`, 'success');
            setIsAddFamilyModalOpen(false);
          }}
        />
      )}

      {/* Add Assam Address Modal */}
      {isAddAddressModalOpen && (
        <AddAddressModal
          isOpen={isAddAddressModalOpen}
          onClose={() => setIsAddAddressModalOpen(false)}
          onAddAddress={(newAddr) => {
            setAddresses((prev) => {
              const updated = [newAddr, ...prev];
              try {
                localStorage.setItem('zestmed_saved_addresses', JSON.stringify(updated));
              } catch (e) {
                console.error(e);
              }
              return updated;
            });
            addToast(`Address added for ${newAddr.locality || newAddr.city}.`, 'success');
            setIsAddAddressModalOpen(false);
          }}
        />
      )}

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <PrescriptionDetailModal
          isOpen={!!selectedPrescription}
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}

      {/* Upload Doctor's Prescription Modal */}
      <PrescriptionUploadModal
        isOpen={isPrescriptionUploadModalOpen}
        onClose={() => setIsPrescriptionUploadModalOpen(false)}
      />
    </div>
  );
}

// ===================================================================
// CUSTOM SVG GRAPHICS TO MATCH USER REFERENCE IMAGE IDENTICALLY
// ===================================================================

// Sidebar Bottom Clipboard Graphic
function SidebarClipboardGraphic() {
  return (
    <div className="relative w-16 h-20 mx-auto flex items-center justify-center">
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
        {/* Clipboard back board */}
        <rect x="15" y="15" width="70" height="95" rx="8" fill="#1E3E5B" />
        {/* Clip top */}
        <rect x="35" y="8" width="30" height="14" rx="4" fill="#005CB9" />
        <circle cx="50" cy="15" r="3" fill="#0A1E34" />
        {/* Paper sheet */}
        <rect x="23" y="24" width="54" height="78" rx="4" fill="#FFFFFF" />
        {/* Document lines */}
        <line x1="30" y1="36" x2="65" y2="36" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="46" x2="70" y2="46" stroke="#005CB9" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="56" x2="60" y2="56" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="66" x2="52" y2="66" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Pulse / Heart circle badge overlapping bottom right */}
        <circle cx="70" cy="82" r="16" fill="#F43F5E" />
        <path
          d="M60 82 h4 l3 -6 l4 12 l3 -6 h6"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// Realistic Stethoscope Graphic for the Hero Banner
function StethoscopeGraphic() {
  return (
    <div className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 w-64 h-32 opacity-95 pointer-events-none select-none">
      <svg viewBox="0 0 280 140" fill="none" className="w-full h-full">
        {/* Soft background glow */}
        <circle cx="180" cy="70" r="50" fill="#005CB9" fillOpacity="0.08" />
        {/* Tubing */}
        <path
          d="M 20 20 C 50 110, 110 130, 160 90 C 200 60, 230 85, 235 95"
          stroke="#334155"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 20 20 C 50 110, 110 130, 160 90 C 200 60, 230 85, 235 95"
          stroke="#64748B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Metallic Chestpiece / Diaphragm */}
        <circle cx="238" cy="98" r="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="3" />
        <circle cx="238" cy="98" r="15" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
        <circle cx="238" cy="98" r="7" fill="#F8FAFC" />
        {/* Metallic Earpiece Binaural Tubes */}
        <path d="M 20 20 C 15 15, 25 5, 45 10" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="48" cy="11" r="3" fill="#334155" />
        <path d="M 22 28 C 10 35, 12 50, 25 58" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="27" cy="60" r="3" fill="#334155" />
      </svg>
    </div>
  );
}

// Health Tips Heart with Leaves Graphic
function HeartHealthGraphic() {
  return (
    <div className="w-12 h-12 relative shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 60 60" className="w-full h-full">
        {/* Two Royal Blue leaves on the left */}
        <path
          d="M 12 38 C 5 32, 6 22, 16 22 C 16 30, 14 36, 12 38 Z"
          fill="#005CB9"
        />
        <path
          d="M 10 42 C 4 45, 6 52, 14 50 C 15 45, 12 43, 10 42 Z"
          fill="#004C99"
        />
        {/* Heartbeat Orange Heart matching Logo */}
        <path
          d="M 34 16 C 30 10, 22 10, 19 16 C 15 23, 18 32, 34 46 C 50 32, 53 23, 49 16 C 46 10, 38 10, 34 16 Z"
          fill="#FF5722"
        />
        {/* White ECG heartbeat pulse line through the heart */}
        <path
          d="M 17 28 H 26 L 29 20 L 33 36 L 36 25 L 39 30 H 48"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// Medicine Thumbnail Box Graphic
function MedicineBoxThumb({ type }) {
  if (type === 'paracetamol') {
    return (
      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 p-1 flex items-center justify-center shrink-0">
        <div className="w-8 h-6 bg-white rounded border border-sky-200 flex flex-col justify-between p-0.5 shadow-xs">
          <div className="h-1.5 bg-sky-500 rounded-xs w-full" />
          <div className="flex gap-0.5 justify-center">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    );
  }
  if (type === 'vitamind3') {
    return (
      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 p-1 flex items-center justify-center shrink-0">
        <div className="w-8 h-6 bg-white rounded border border-amber-200 flex flex-col justify-between p-0.5 shadow-xs">
          <div className="h-1.5 bg-amber-500 rounded-xs w-full" />
          <div className="text-[6px] font-bold text-amber-600 text-center leading-none">D3</div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 p-1 flex items-center justify-center shrink-0">
      <div className="w-8 h-6 bg-white rounded border border-purple-200 flex flex-col justify-between p-0.5 shadow-xs">
        <div className="h-1.5 bg-purple-500 rounded-xs w-full" />
        <div className="flex gap-0.5 justify-center">
          <span className="w-1 h-1 rounded-full bg-purple-300" />
          <span className="w-1 h-1 rounded-full bg-purple-300" />
        </div>
      </div>
    </div>
  );
}

// Test Tube Icon for KPI Card 2
function TestTubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
      <path d="M8.5 2h7" />
      <path d="M14.5 16h-5" />
    </svg>
  );
}
