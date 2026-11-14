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
  Plus
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

export default function PatientDashboardPage({ onOpenPrescriptionModal }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  // Handlers for interactive actions
  const handleNextHealthTip = () => {
    setHealthTipIndex((prev) => (prev + 1) % healthTips.length);
  };

  const handlePrevHealthTip = () => {
    setHealthTipIndex((prev) => (prev - 1 + healthTips.length) % healthTips.length);
  };

  const handleOpenReportModal = (testName, dateStr) => {
    // Find matching booking or create demo mock object
    const match = labBookings.find((b) => b.testName.toLowerCase().includes(testName.toLowerCase().slice(0, 5))) || {
      id: 'LB-9024',
      bookingId: 'LB-9024',
      testName: testName,
      patientName: 'Ajayendra Shekhar',
      date: dateStr,
      time: '10:00 AM',
      type: 'Home Collection',
      status: 'Report Ready',
      price: 499,
      labExecutive: 'Bikash Das',
      barcode: 'ZM-ASSAM-2026-9024'
    };
    setSelectedReportBooking(match);
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
        name: 'Ajayendra Shekhar',
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
      {/* 1. LEFT SIDEBAR (Dark Navy #0B2238)                      */}
      {/* ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B2238] flex flex-col shrink-0 border-r border-[#081827] justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Menu Items */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              {/* Logo Cross */}
              <img
                src="/logo.png"
                alt="ZESTMED Logo"
                className="w-8 h-8 object-contain shrink-0 select-none"
              />
              <div>
                <div className="text-white font-extrabold text-base tracking-wide leading-none">
                  ZESTMED
                </div>
                <div className="text-[#88A0B8] text-[10.5px] font-medium mt-1 leading-none">
                  Healthcare & Diagnostics
                </div>
              </div>
            </div>

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
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                setIsSidebarOpen(false);
                if (onOpenPrescriptionModal) {
                  onOpenPrescriptionModal();
                } else {
                  addToast('Opening Prescription Upload Vault', 'info');
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <UploadCloud className="w-4 h-4" />
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
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                setIsSidebarOpen(false);
                setIsAddFamilyModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
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
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                setIsSidebarOpen(false);
                setIsNotificationsOpen(!isNotificationsOpen);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
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
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition"
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
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
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition"
              />
            </div>
          </div>

          {/* Right: Cart (with badge 2), Notification Bell & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Cart Icon with badge 2 */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-1.5 sm:p-2 rounded-xl text-[#00A884] hover:bg-teal-50 transition"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#00A884]" />
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
                    <span className="text-[10px] font-bold text-[#14B8A6] bg-teal-50 px-2 py-0.5 rounded-full">
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
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#14B8A6]/20 bg-slate-100 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="Ajayendra Shekhar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=Ajayendra+Shekhar&background=14B8A6&color=fff';
                    }}
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    Ajayendra Shekhar
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
                    <p className="text-xs font-bold text-slate-900">Ajayendra Shekhar</p>
                    <p className="text-[11px] text-slate-400 font-mono">UHID: ZM-PAT-781001</p>
                    <p className="text-[11px] text-teal-600 font-medium mt-0.5">Dispur, Guwahati (Assam)</p>
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
        <main className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* ======================================================== */}
          {/* 3. HERO GREETING BANNER WITH STETHOSCOPE GRAPHIC         */}
          {/* ======================================================== */}
          <div className="relative rounded-2xl p-4 sm:p-6 overflow-hidden border border-[#D5EAEF] bg-gradient-to-r from-[#EEF7F9] via-[#E8F4F6] to-[#DBEFF3] shadow-xs">
            <div className="relative z-10 max-w-xl">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B2238] tracking-tight flex items-center gap-2">
                <span>Good Morning, Ajayendra</span>
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
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Total Bookings
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  8
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                  <span>↑ +33%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Upcoming Appointments */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <TestTubeIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Upcoming
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  2
                </div>
              </div>
            </div>

            {/* Card 3: Medicine Orders */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Orders
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  5
                </div>
              </div>
            </div>

            {/* Card 4: Reports Available */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition">
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
                  <Calendar className="w-5 h-5 text-[#14B8A6]" />
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
                  className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center gap-1"
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
                    {/* Mint date box */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#E8F8F5] border border-emerald-100 text-[#00A884] flex flex-col items-center justify-center shrink-0">
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
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/80 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shrink-0">
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
                <Zap className="w-5 h-5 text-[#14B8A6]" />
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
                  className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group"
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
                  className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
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
                    if (onOpenPrescriptionModal) onOpenPrescriptionModal();
                    else addToast('Opening Prescription Upload Vault', 'info');
                  }}
                  className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group"
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
                  className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group"
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
                  <ShoppingCart className="w-5 h-5 text-[#14B8A6]" />
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
                  className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center gap-1"
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
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#14B8A6] transition">
                        Paracetamol 500 mg
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Order #ORD5487 • Nov 10, 2026
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
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
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#14B8A6] transition">
                        Vitamin D3 600 IU
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Order #ORD5462 • Nov 05, 2026
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
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
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#14B8A6] transition">
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
                  <FileText className="w-5 h-5 text-[#14B8A6]" />
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
                  className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center gap-1"
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
                    onClick={() => handleOpenReportModal('Complete Blood Count (CBC)', 'Nov 07, 2026')}
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
                    onClick={() => handleOpenReportModal('Lipid Profile', 'Oct 28, 2026')}
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
                    onClick={() => handleOpenReportModal('Liver Function Test (LFT)', 'Oct 20, 2026')}
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
                  <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Health Tips
                  </h3>
                </div>

                {/* Illustration + Tip Content */}
                <div className="flex items-start gap-3">
                  <HeartHealthGraphic />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0B2238] leading-tight">
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
                          ? 'w-4 h-1.5 rounded-full bg-[#14B8A6]'
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
        </main>
      </div>

      {/* ======================================================== */}
      {/* 7. CONNECTED INTERACTIVE MODALS                          */}
      {/* ======================================================== */}
      {/* Digital Lab Report Modal */}
      {selectedReportBooking && (
        <DigitalLabReportModal
          booking={selectedReportBooking}
          onClose={() => setSelectedReportBooking(null)}
        />
      )}

      {/* Order Invoice & Tracking Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Add Family Member Modal */}
      {isAddFamilyModalOpen && (
        <AddFamilyMemberModal
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
          onClose={() => setIsAddAddressModalOpen(false)}
          onAddAddress={(newAddr) => {
            setAddresses((prev) => [newAddr, ...prev]);
            addToast(`Address added for ${newAddr.locality}, ${newAddr.city}.`, 'success');
            setIsAddAddressModalOpen(false);
          }}
        />
      )}

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <PrescriptionDetailModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
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
        <rect x="35" y="8" width="30" height="14" rx="4" fill="#14B8A6" />
        <circle cx="50" cy="15" r="3" fill="#0B2238" />
        {/* Paper sheet */}
        <rect x="23" y="24" width="54" height="78" rx="4" fill="#FFFFFF" />
        {/* Document lines */}
        <line x1="30" y1="36" x2="65" y2="36" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="46" x2="70" y2="46" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" />
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
        <circle cx="180" cy="70" r="50" fill="#14B8A6" fillOpacity="0.08" />
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
        {/* Two green leaves on the left */}
        <path
          d="M 12 38 C 5 32, 6 22, 16 22 C 16 30, 14 36, 12 38 Z"
          fill="#10B981"
        />
        <path
          d="M 10 42 C 4 45, 6 52, 14 50 C 15 45, 12 43, 10 42 Z"
          fill="#059669"
        />
        {/* Red Heart */}
        <path
          d="M 34 16 C 30 10, 22 10, 19 16 C 15 23, 18 32, 34 46 C 50 32, 53 23, 49 16 C 46 10, 38 10, 34 16 Z"
          fill="#EF4444"
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
