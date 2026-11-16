// src/pages/LabDashboardPage.jsx
// Redesigned to match the exact ZESTMED Lab Executive Dashboard specification pixel-for-pixel
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSubdomainUrl } from '../utils/subdomain';
import {
  Users,
  Calendar,
  Syringe,
  Package,
  Upload,
  CheckCircle2,
  Bell,
  User,
  LogOut,
  Menu,
  Search,
  ChevronDown,
  Clock,
  Home,
  Building2,
  FlaskConical,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Plus,
  X,
  Phone,
  MapPin,
  RotateCcw,
  FileText,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  initialExecutiveProfile,
  initialPhlebotomyJobs,
  initialColdChainBoxes,
  initialPhlebotomistRoster
} from '../mock-data/labExecutiveData';
import SampleCollectionModal from '../components/SampleCollectionModal';
import PublishReportModal from '../components/PublishReportModal';
import DigitalLabReportModal from '../components/DigitalLabReportModal';
import NewLabJobModal from '../components/NewLabJobModal';
import { downloadClinicalReportPdf, openClinicalReportPdf } from '../utils/pdfGenerator';

export default function LabDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Navigation & Interactive State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Thu, Nov 13, 2026');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modals State
  const [selectedJobForCollection, setSelectedJobForCollection] = useState(null);
  const [selectedJobForPublish, setSelectedJobForPublish] = useState(null);
  const [selectedJobForReportView, setSelectedJobForReportView] = useState(null);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);

  // Persistent mock data
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_lab_jobs');
      return saved ? JSON.parse(saved) : initialPhlebotomyJobs;
    } catch {
      return initialPhlebotomyJobs;
    }
  });

  // Today's Schedule Exact Data from Image
  const [todaySchedule, setTodaySchedule] = useState([
    {
      id: '#LB10241',
      time: '09:00 AM',
      patient: 'Amit Verma',
      test: 'Full Blood Count',
      type: 'Home Collection',
      action: 'Collect Sample',
      status: 'Pending Collection'
    },
    {
      id: '#LB10242',
      time: '10:30 AM',
      patient: 'Priya Sharma',
      test: 'Thyroid Profile',
      type: 'Home Collection',
      action: 'Collect Sample',
      status: 'Pending Collection'
    },
    {
      id: '#LB10243',
      time: '12:00 PM',
      patient: 'Rajesh Kumar',
      test: 'Diabetes Package',
      type: 'Lab Visit',
      action: 'Check In',
      status: 'Awaiting Arrival'
    },
    {
      id: '#LB10244',
      time: '02:00 PM',
      patient: 'Sneha Singh',
      test: 'Lipid Profile',
      type: 'Home Collection',
      action: 'Collect Sample',
      status: 'Pending Collection'
    },
    {
      id: '#LB10245',
      time: '04:00 PM',
      patient: 'Vikram Das',
      test: 'Liver Function Test',
      type: 'Lab Visit',
      action: 'Check In',
      status: 'Awaiting Arrival'
    }
  ]);

  // Notifications demo list
  const notificationsList = [
    { id: 1, title: 'New Job Assigned', desc: 'Home Collection #LB10245 booked for Dispur.', time: '15m ago' },
    { id: 2, title: 'Cold Chain Check', desc: 'Box CCB-01 temp stabilized at 3.8°C.', time: '45m ago' },
    { id: 3, title: 'Pathology Alert', desc: 'Sample collected from Amit Verma arrived at central lab.', time: '1h ago' }
  ];

  const [assignedFilter, setAssignedFilter] = useState('all');
  const [barcodeInput, setBarcodeInput] = useState('AS-BC-781005-092');
  const [processingList, setProcessingList] = useState([
    { id: 'SPEC-9041', patient: 'Amit Verma', test: 'Complete Blood Count (CBC)', analyzer: 'Mindray BC-5150 Hematology', status: 'Running Assay', progress: 78, eta: '12m' },
    { id: 'SPEC-9042', patient: 'Priya Sharma', test: 'Thyroid Profile (T3, T4, TSH)', analyzer: 'Roche Cobas c311 Biochemistry', status: 'Centrifugation', progress: 45, eta: '25m' },
    { id: 'SPEC-9043', patient: 'Rajesh Kumar', test: 'Diabetes HbA1c Glycation', analyzer: 'Bio-Rad D-10 Analyzer', status: 'Verification', progress: 95, eta: '3m' },
    { id: 'SPEC-9044', patient: 'Sneha Singh', test: 'Lipid Profile Screen', analyzer: 'Roche Cobas c311 Biochemistry', status: 'Incubation', progress: 60, eta: '18m' }
  ]);
  const [completedList, setCompletedList] = useState([
    { id: 'REP-9021', patient: 'Rahul Verma', test: 'Complete Blood Count', time: '08:30 AM', pathologist: 'Dr. N. Bora, MD (Pathology)', status: 'Signed & Published' },
    { id: 'REP-9020', patient: 'Ananya Baruah', test: 'Vitamin D3 & B12 Vital Screen', time: 'Yesterday', pathologist: 'Dr. Arindam Sharma, MD', status: 'Signed & Published' },
    { id: 'REP-9019', patient: 'Minati Shekhar', test: 'Thyroid Profile Screen', time: 'Yesterday', pathologist: 'Dr. N. Bora, MD (Pathology)', status: 'Signed & Published' },
    { id: 'REP-9018', patient: 'Vikram Das', test: 'Liver Function Test (LFT)', time: '11 Nov 2026', pathologist: 'Dr. S. Das, MD', status: 'Signed & Published' }
  ]);

  // Action Handlers
  const handleActionClick = (item) => {
    if (item.action === 'Collect Sample') {
      setSelectedJobForCollection({
        id: item.id,
        bookingId: item.id,
        patientName: item.patient,
        patientPhone: '+91 92791 25091',
        testName: item.test,
        slot: item.time,
        type: item.type,
        address: 'House 14, Basistha Chariali, Dispur, Guwahati',
        district: 'Kamrup Metro',
        status: item.status
      });
    } else {
      // Check in patient
      setTodaySchedule((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, action: 'Checked In', status: 'Checked In' } : row))
      );
      addToast(`Patient ${item.patient} (${item.id}) checked in at Guwahati Central Lab.`, 'success');
    }
  };

  const handleConfirmCollection = (collectionData) => {
    if (selectedJobForCollection) {
      setTodaySchedule((prev) =>
        prev.map((row) =>
          row.id === selectedJobForCollection.id
            ? { ...row, action: 'Sample Collected', status: 'Collected' }
            : row
        )
      );
    }
    setSelectedJobForCollection(null);
    addToast('Barcoded sample secured in certified 2-8°C cold box!', 'success');
  };

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-sans antialiased overflow-hidden select-none relative">
      {/* Mobile Drawer Backdrop */}
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

            {/* Close button on mobile */}
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
              <LayoutDashboardIcon className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Assigned Bookings */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('assigned');
                setIsSidebarOpen(false);
                addToast('Viewing all 28 assigned bookings for Assam region', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'assigned'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Assigned Bookings</span>
            </button>

            {/* Today's Schedule */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('schedule');
                setIsSidebarOpen(false);
                addToast("Displaying Today's Phlebotomy Dispatch Schedule (12 Appointments)", 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'schedule'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Today's Schedule</span>
            </button>

            {/* Sample Collection */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('collection');
                setIsSidebarOpen(false);
                addToast('Opening Phlebotomy Sample Collection Workbench', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'collection'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Syringe className="w-4 h-4" />
              <span>Sample Collection</span>
            </button>

            {/* Test Processing */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('processing');
                setIsSidebarOpen(false);
                addToast('Viewing 6 active specimens currently in analyzer centrifuge', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'processing'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Test Processing</span>
            </button>

            {/* Upload Reports */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('upload-reports');
                setIsSidebarOpen(false);
                addToast('Opening Pathology Report Upload Desk', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'upload-reports'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Reports</span>
            </button>

            {/* Completed Tests */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('completed');
                setIsSidebarOpen(false);
                addToast('Viewing 34 verified and published test results', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'completed'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Tests</span>
            </button>

            {/* Notifications with red indicator dot */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('notifications');
                setIsSidebarOpen(false);
                addToast('Viewing real-time lab dispatch alerts', 'info');
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

            {/* My Profile */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('profile');
                setIsSidebarOpen(false);
                addToast('Phlebotomy ID: PH-ASM-204 | Assigned: Guwahati Hub', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'profile'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                addToast('Signed out of Lab Executive session. Returned to Public Store.', 'info');
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Bottom Sidebar Laboratory Beakers Illustration & Subtitle */}
        <div className="p-4 pt-0 shrink-0 text-center relative z-10">
          <div className="bg-[#0e2c47]/80 rounded-2xl p-3 border border-white/5 backdrop-blur-xs shadow-inner">
            <SidebarBeakersGraphic />
            <p className="text-white font-bold text-xs tracking-wide mt-2">
              Lab Executive Portal
            </p>
            <p className="text-[#88A0B8] text-[10.5px] mt-0.5">
              Sample Collection • Testing • Reports
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
                placeholder="Search booking ID, patient..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#005CB9] focus:ring-1 focus:ring-[#005CB9] transition"
              />
            </div>
          </div>

          {/* Right: Notifications Bell & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
                    <span className="text-xs font-bold text-slate-900">Lab Operation Alerts</span>
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
                {/* Circular Photo Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#005CB9]/20 bg-slate-100 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Rohit Das"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=Rohit+Das&background=14B8A6&color=fff';
                    }}
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    Rohit Das
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1 leading-none">
                    Lab Executive
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
                    <p className="text-xs font-bold text-slate-900">Rohit Das</p>
                    <p className="text-[11px] text-slate-400 font-mono">ID: PH-ASM-204</p>
                    <p className="text-[11px] text-teal-600 font-medium mt-0.5">Dispur Central Lab (Assam)</p>
                  </div>
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
                      addToast('Logged out of Lab Executive portal.', 'info');
                      navigate('/');
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
          {/* 3. GREETING & DATE FILTER ROW                            */}
          {/* ======================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Good Morning, Rohit</span>
                <span className="text-xl sm:text-2xl inline-block transform hover:rotate-12 transition-transform select-none">👋</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Here is your daily work overview and assigned tasks.
              </p>
            </div>

            {/* Date Range Dropdown Button */}
            <div className="relative self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className="bg-white border border-slate-200/90 shadow-xs px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{dateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isDateDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-20"
                  onMouseLeave={() => setIsDateDropdownOpen(false)}
                >
                  {['Thu, Nov 13, 2026', 'Fri, Nov 14, 2026', 'Sat, Nov 15, 2026', 'All Shifts (Assam)'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDateRange(opt);
                        setIsDateDropdownOpen(false);
                        addToast(`Shift date selected: ${opt}`, 'info');
                      }}
                      className={`w-full text-left px-4 py-1.5 text-xs font-medium ${
                        dateRange === opt ? 'text-[#005CB9] font-bold bg-teal-50/60' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. TOP 6 METRIC KPI CARDS ROW                            */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
            {/* 1. Assigned Bookings */}
            <div
              onClick={() => setActiveMenu('assigned')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-3.5 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Assigned
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  28
                </div>
              </div>
            </div>

            {/* 2. Today's Appointments */}
            <div
              onClick={() => setActiveMenu('schedule')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-3.5 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Today's
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  12
                </div>
              </div>
            </div>

            {/* 3. Samples Collected */}
            <div
              onClick={() => setActiveMenu('collection')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-3.5 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Syringe className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Collected
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  8
                </div>
              </div>
            </div>

            {/* 4. Tests Processing */}
            <div
              onClick={() => setActiveMenu('processing')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-3.5 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Processing
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  6
                </div>
              </div>
            </div>

            {/* 5. Reports Pending */}
            <div
              onClick={() => setActiveMenu('upload-reports')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-3.5 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Pending
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  4
                </div>
              </div>
            </div>

            {/* 6. Completed Tests */}
            <div
              onClick={() => setActiveMenu('completed')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-3.5 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Completed
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  34
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. MIDDLE SECTION: TODAY'S SCHEDULE + PROGRESS & ACTIONS */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Today's Schedule (12) (~65% width -> lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Today's Schedule (12)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('schedule');
                    addToast('Opening full 12 appointment roster (Assam Phlebotomy)', 'info');
                  }}
                  className="text-xs font-semibold text-[#005CB9] hover:underline flex items-center gap-1"
                >
                  <span>View Full Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 5 Schedule Table Rows */}
              <div className="space-y-3 pt-1">
                {todaySchedule.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100 gap-2.5 sm:gap-3"
                  >
                    {/* Time Badge */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold shrink-0">
                        {row.time}
                      </div>

                      {/* Patient Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 truncate">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{row.patient}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {row.id}
                        </div>
                      </div>
                    </div>

                    {/* Test Name */}
                    <div className="text-xs font-medium text-slate-800 min-w-0 truncate">
                      {row.test}
                    </div>

                    {/* Type Badge & Action Button Row on Mobile */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                      {row.type === 'Home Collection' ? (
                        <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-600 border border-sky-100 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          <Home className="w-3 h-3 text-sky-500" />
                          <span>Home Collection</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 border border-purple-100 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          <Building2 className="w-3 h-3 text-purple-500" />
                          <span>Lab Visit</span>
                        </span>
                      )}

                      {row.action === 'Collect Sample' ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(row)}
                          className="bg-[#005CB9] hover:bg-[#004C99] text-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                          Collect Sample
                        </button>
                      ) : row.action === 'Check In' ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(row)}
                          className="bg-white hover:bg-teal-50 text-[#005CB9] border border-[#005CB9] px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs font-semibold transition"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-blue-200">
                          <Check className="w-3.5 h-3.5" />
                          <span>{row.action}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Task Progress & Quick Actions (~35% width -> lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Upper Card: Task Progress Today */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Task Progress Today
                  </h3>
                </div>

                {/* Donut Chart + Legend Side-by-Side */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
                  {/* SVG Donut Chart with center text 18 */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                      {/* Circle 1: Samples Collected (8/18 -> 44.4%) -> 44.4% of 377 = 167.4 */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#005CB9"
                        strokeWidth="20"
                        strokeDasharray="167.4 377"
                        strokeDashoffset="0"
                      />
                      {/* Circle 2: Tests Processing (6/18 -> 33.3%) -> 33.3% of 377 = 125.5 */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#38BDF8"
                        strokeWidth="20"
                        strokeDasharray="125.5 377"
                        strokeDashoffset="-167.4"
                      />
                      {/* Circle 3: Reports Uploaded (4/18 -> 22.2%) -> 22.2% of 377 = 83.7 */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#FBBF24"
                        strokeWidth="20"
                        strokeDasharray="83.7 377"
                        strokeDashoffset="-292.9"
                      />
                      {/* Circle 4: Pending (0) -> None */}
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                      <span className="text-xl font-black text-slate-900 leading-none">
                        18
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 leading-none">
                        Total Tasks
                      </span>
                    </div>
                  </div>

                  {/* Legend on Right Side */}
                  <div className="space-y-2.5 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#005CB9]" />
                        <span className="text-slate-700 font-medium text-[11.5px]">Samples Collected</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">8</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                        <span className="text-slate-700 font-medium text-[11.5px]">Tests Processing</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">6</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                        <span className="text-slate-700 font-medium text-[11.5px]">Reports Uploaded</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">4</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C084FC]" />
                        <span className="text-slate-700 font-medium text-[11.5px]">Pending</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Card: Quick Actions */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Quick Actions
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {/* 1. Mark Collection */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobForCollection({
                        id: '#LB10241',
                        bookingId: '#LB10241',
                        patientName: 'Amit Verma',
                        patientPhone: '+91 92791 25091',
                        testName: 'Full Blood Count',
                        slot: '09:00 AM',
                        type: 'Home Collection',
                        address: 'Basistha Chariali, Dispur',
                        district: 'Kamrup Metro',
                        status: 'Pending Collection'
                      });
                    }}
                    className="bg-white border border-slate-100 hover:border-[#005CB9] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Syringe className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      Mark Collection
                    </span>
                  </button>

                  {/* 2. Update Test Status */}
                  <button
                    type="button"
                    onClick={() => {
                      addToast('Diagnostic specimen marked: In-Analyzer Centrifugation (Dispur Lab)', 'success');
                    }}
                    className="bg-white border border-slate-100 hover:border-[#005CB9] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FlaskConical className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      Update Test Status
                    </span>
                  </button>

                  {/* 3. Upload Report */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobForPublish({
                        id: '#LB10238',
                        bookingId: '#LB10238',
                        patientName: 'Sneha Singh',
                        testName: 'Complete Blood Count (CBC)',
                        collectedAt: '10:15 AM'
                      });
                    }}
                    className="bg-white border border-slate-100 hover:border-[#005CB9] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      Upload Report
                    </span>
                  </button>

                  {/* 4. View Assigned */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu('assigned');
                      addToast('Viewing all 28 assigned bookings for Assam region', 'info');
                    }}
                    className="bg-white border border-slate-100 hover:border-[#005CB9] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Layers className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      View Assigned
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 6. BOTTOM SECTION: RECENT ACTIVITIES + TESTS OVERVIEW    */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Recent Activities (~45% width -> lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Activities
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Opening comprehensive lab executive audit trail', 'info')}
                  className="text-xs font-semibold text-[#005CB9] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Activity Items matching image */}
              <div className="space-y-3 pt-1">
                {/* Activity 1 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      Report uploaded for LB10238
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    10:24 AM
                  </span>
                </div>

                {/* Activity 2 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      Sample collected from Amit Verma (LB10237)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    09:50 AM
                  </span>
                </div>

                {/* Activity 3 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      Test processing started for LB10236
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    09:20 AM
                  </span>
                </div>

                {/* Activity 4 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      New booking assigned – LB10245
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    08:45 AM
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Assigned Tests Overview (~55% width -> lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#005CB9]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Assigned Tests Overview
                </h3>
              </div>

              {/* 4 Progress Bars matching image */}
              <div className="space-y-4 pt-1">
                {/* 1. Blood Tests (10) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Blood Tests</span>
                    <span className="font-bold text-slate-900 font-mono">10</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#005CB9] rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                {/* 2. Hormone Tests (6) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Hormone Tests</span>
                    <span className="font-bold text-slate-900 font-mono">6</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                {/* 3. Liver & Kidney Tests (4) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Liver & Kidney Tests</span>
                    <span className="font-bold text-slate-900 font-mono">4</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FBBF24] rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                {/* 4. Other Tests (8) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Other Tests</span>
                    <span className="font-bold text-slate-900 font-mono">8</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#A855F7] rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 1. ASSIGNED BOOKINGS VIEW                                */}
          {/* ======================================================== */}
          {activeMenu === 'assigned' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#005CB9]" />
                    <span>Assigned Phlebotomy & Lab Bookings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    28 assigned home collections & center walk-ins across Kamrup Metro & Dispur.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(true)}
                  className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Job Dispatch</span>
                </button>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Assigned (28)' },
                  { id: 'home', label: 'Home Collection' },
                  { id: 'lab', label: 'Lab Visit' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAssignedFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      assignedFilter === f.id
                        ? 'bg-[#005CB9] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Jobs List */}
              <div className="space-y-3.5">
                {todaySchedule
                  .filter((j) => {
                    if (assignedFilter === 'all') return true;
                    if (assignedFilter === 'home') return j.type === 'Home Collection';
                    if (assignedFilter === 'lab') return j.type === 'Lab Visit';
                    return true;
                  })
                  .map((j) => (
                    <div
                      key={j.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <Syringe className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900">{j.patient}</h3>
                              <span className="text-xs font-mono text-slate-400">({j.id})</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{j.test}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            j.type === 'Home Collection'
                              ? 'bg-sky-50 text-sky-600 border border-sky-100'
                              : 'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {j.type}
                          </span>
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                            {j.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Basistha Chariali, Dispur (Guwahati)</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>+91 92791 25091</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleActionClick(j)}
                            className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                          >
                            <Syringe className="w-3.5 h-3.5" />
                            <span>{j.action}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addToast(`Dialing patient ${j.patient} (+91 92791 25091)...`, 'info')}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                            title="Call Patient"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => addToast(`Navigation route loaded for ${j.patient} (Dispur Hub).`, 'info')}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                            title="Directions"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. TODAY'S SCHEDULE VIEW                                 */}
          {/* ======================================================== */}
          {activeMenu === 'schedule' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#005CB9]" />
                    <span>Today's Shift Roster & Route Schedule</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Morning Shift: 08:00 AM - 04:30 PM • Phlebotomist: Rohit Sharma (Dispur Hub)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
                    12 Appointments Scheduled
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="space-y-3">
                  {todaySchedule.map((row, idx) => (
                    <div
                      key={row.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-100/60 text-[#005CB9] font-black text-sm flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{row.time}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.type === 'Home Collection' ? 'bg-sky-50 text-sky-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                              {row.type}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-800 mt-1">
                            {row.patient} • <span className="text-slate-500 font-normal">{row.test}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleActionClick(row)}
                          className="px-4 py-2 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          {row.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. SAMPLE COLLECTION WORKBENCH VIEW                      */}
          {/* ======================================================== */}
          {activeMenu === 'collection' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Syringe className="w-6 h-6 text-[#005CB9]" />
                  <span>Phlebotomy Sample Collection Workbench</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tag vacutainer tubes with barcode telemetry and log cold-chain transit temperatures.
                </p>
              </div>

              {/* Cold Chain Box Monitor Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-teal-800 font-bold block">Cold-Chain Box Temp</span>
                    <span className="text-xl font-black text-teal-900 font-mono">3.8°C (Optimal 2-8°C)</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-blue-800 font-bold block">Bio-Hazard Seal Status</span>
                    <span className="text-sm font-black text-blue-900">Tamper-Evident Active</span>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-purple-800 font-bold block">Samples In Cooler</span>
                    <span className="text-xl font-black text-purple-900 font-mono">8 Specimens</span>
                  </div>
                </div>
              </div>

              {/* Barcode scanner simulator */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Scan & Tag Specimen Barcode</h3>
                <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl text-xs">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan or enter barcode (e.g. AS-BC-781005-092)"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-[#005CB9]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToast(`Barcode ${barcodeInput} verified and associated with cold-box CCB-01!`, 'success');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#005CB9] hover:bg-[#004C99] text-white font-bold rounded-xl transition shrink-0"
                  >
                    Scan & Link
                  </button>
                </div>
              </div>

              {/* Ready for collection list */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Pending Field Collections</h3>
                <div className="space-y-2.5">
                  {todaySchedule.filter((r) => r.action === 'Collect Sample').map((row) => (
                    <div key={row.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900">{row.patient}</strong>
                        <p className="text-slate-500 mt-0.5">{row.test} • Slot: {row.time}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleActionClick(row)}
                        className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white font-bold rounded-xl shadow-xs transition"
                      >
                        Collect Sample
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. TEST PROCESSING WORKBENCH VIEW                        */}
          {/* ======================================================== */}
          {activeMenu === 'processing' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#005CB9]" />
                  <span>Laboratory Testing & Analyzer Centrifugation</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Central diagnostic equipment status (Mindray BC-5150 Hematology, Roche Cobas c311 Biochemistry).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processingList.map((proc) => (
                  <div key={proc.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono text-teal-600 font-bold">{proc.id}</span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{proc.patient}</h3>
                        <p className="text-xs text-slate-500">{proc.test}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                        ETA: {proc.eta}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Machine: <strong>{proc.analyzer}</strong></span>
                        <span className="font-bold text-[#005CB9]">{proc.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#005CB9] rounded-full transition-all duration-500" style={{ width: `${proc.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Status: <strong className="text-slate-800">{proc.status}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setProcessingList((prev) =>
                            prev.map((it) => (it.id === proc.id ? { ...it, progress: 100, status: 'Ready for Report' } : it))
                          );
                          addToast(`Specimen ${proc.id} testing finished! Ready for report release.`, 'success');
                        }}
                        className="px-3 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl font-bold transition shadow-xs"
                      >
                        Authorize Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. UPLOAD REPORTS DESK VIEW                              */}
          {/* ======================================================== */}
          {activeMenu === 'upload-reports' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Upload className="w-6 h-6 text-[#005CB9]" />
                  <span>Pathology Diagnostic Report Upload Desk</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload signed laboratory PDF reports and release verified findings to patient portal.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Booking ID</th>
                        <th className="py-3 px-4 font-bold">Patient</th>
                        <th className="py-3 px-4 font-bold">Test Name</th>
                        <th className="py-3 px-4 font-bold">Collection Time</th>
                        <th className="py-3 px-4 font-bold">Cold Box</th>
                        <th className="py-3 px-4 font-bold text-right">Publish Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { id: '#LB10238', patient: 'Sneha Singh', test: 'Complete Blood Count (CBC)', time: '10:15 AM', box: 'CCB-01' },
                        { id: '#LB10237', patient: 'Amit Verma', test: 'Lipid Profile Screen', time: '11:45 AM', box: 'CCB-02' },
                        { id: '#LB10236', patient: 'Priya Sharma', test: 'Thyroid Profile', time: '12:30 PM', box: 'CCB-01' }
                      ].map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{j.id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{j.patient}</td>
                          <td className="py-3.5 px-4 text-slate-700">{j.test}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{j.time}</td>
                          <td className="py-3.5 px-4 text-teal-600 font-mono">{j.box}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJobForPublish({
                                  id: j.id,
                                  bookingId: j.id,
                                  patientName: j.patient,
                                  testName: j.test,
                                  collectedAt: j.time
                                });
                              }}
                              className="px-3.5 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition shadow-xs"
                            >
                              Fill & Publish
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. COMPLETED TESTS ARCHIVE VIEW                          */}
          {/* ======================================================== */}
          {activeMenu === 'completed' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-[#005CB9]" />
                  <span>Authorized & Published Test Reports (34)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Digital archive of authorized diagnostic results available for patient download.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Report ID</th>
                        <th className="py-3 px-4 font-bold">Patient</th>
                        <th className="py-3 px-4 font-bold">Test Name</th>
                        <th className="py-3 px-4 font-bold">Released Time</th>
                        <th className="py-3 px-4 font-bold">Pathologist</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Digital Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {completedList.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{c.patient}</td>
                          <td className="py-3.5 px-4 text-slate-700">{c.test}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{c.time}</td>
                          <td className="py-3.5 px-4 text-slate-600">{c.pathologist}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedJobForReportView({
                                    id: c.id,
                                    bookingId: c.id,
                                    patientName: c.patient,
                                    patient: c.patient,
                                    testName: c.test,
                                    test: c.test,
                                    date: 'Nov 13, 2026',
                                    collectionDate: 'Nov 13, 2026',
                                    barcode: `AS-LAB-${c.id.replace(/\D/g, '') || '9021'}`,
                                    pathologist: c.pathologist,
                                    reportingDoctor: c.pathologist,
                                    status: 'Report Ready'
                                  });
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-[#005CB9] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs"
                              >
                                View PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  downloadClinicalReportPdf({
                                    id: c.id,
                                    bookingId: c.id,
                                    patientName: c.patient,
                                    testName: c.test,
                                    date: 'Nov 13, 2026',
                                    reportingDoctor: c.pathologist
                                  });
                                  addToast(`Signed PDF report downloaded for ${c.patient} (${c.id})`, 'success');
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-[#005CB9] hover:text-white text-slate-600 rounded-xl transition shadow-2xs"
                                title="Download PDF File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. NOTIFICATIONS VIEW                                    */}
          {/* ======================================================== */}
          {activeMenu === 'notifications' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Bell className="w-6 h-6 text-[#005CB9]" />
                    <span>Phlebotomy Dispatch & Field Alerts</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Urgent notifications from Dispur Central Laboratory and hospital partners.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('All field dispatch notifications marked as resolved.', 'success')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 self-start sm:self-auto"
                >
                  Mark All Resolved
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                {notificationsList.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{n.title}</p>
                      <p className="text-slate-600 mt-0.5">{n.desc}</p>
                      <span className="text-slate-400 font-mono text-[10px] mt-1 block">{n.time}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 8. MY PROFILE VIEW                                       */}
          {/* ======================================================== */}
          {activeMenu === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <User className="w-6 h-6 text-[#005CB9]" />
                  <span>Phlebotomist & Lab Executive Profile</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Operational credentials and active field shift information.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-xl space-y-4">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 font-black text-2xl flex items-center justify-center">
                    R
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Rohit Sharma</h3>
                    <p className="text-xs text-teal-600 font-bold mt-0.5">Senior Lab Technician & Phlebotomist Lead</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">Employee ID: ZM-LAB-042</p>
                  </div>
                </div>

                <div className="text-xs space-y-2 bg-slate-50 p-4 rounded-xl text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Diagnostic Hub:</span>
                    <strong className="text-slate-800">Guwahati Central Hub (Dispur)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duty Shift:</span>
                    <strong className="text-slate-800">08:00 AM - 04:30 PM (Active)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Number:</span>
                    <strong className="text-slate-800 font-mono">+91 92791 25091</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Field Transit Vehicle:</span>
                    <strong className="text-slate-800">Motorbike (AS-01-EE-4921)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cold Chain Box ID:</span>
                    <strong className="text-teal-600 font-mono font-bold">CCB-01 (3.8°C Monitored)</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addToast('Executive credentials verified and active with central dispatch.', 'success')}
                  className="w-full py-2.5 bg-[#005CB9] hover:bg-[#004C99] text-white font-bold rounded-xl text-xs transition shadow-xs"
                >
                  Verify Active Shift Status
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* 7. CONNECTED INTERACTIVE MODALS                          */}
      {/* ======================================================== */}
      {/* Sample Collection Modal */}
      {selectedJobForCollection && (
        <SampleCollectionModal
          job={selectedJobForCollection}
          onClose={() => setSelectedJobForCollection(null)}
          onConfirm={handleConfirmCollection}
        />
      )}

      {/* Publish Diagnostic Report Modal */}
      {selectedJobForPublish && (
        <PublishReportModal
          job={selectedJobForPublish}
          onClose={() => setSelectedJobForPublish(null)}
          onPublish={(reportData) => {
            setCompletedList(prev => [
              {
                id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
                patient: selectedJobForPublish.patientName || selectedJobForPublish.patient || 'Patient',
                test: selectedJobForPublish.testName || selectedJobForPublish.test || 'Diagnostic Screen',
                time: 'Just now',
                pathologist: 'Dr. Pranabesh Sarma, MD Pathology',
                status: 'Signed & Published'
              },
              ...prev
            ]);
            setSelectedJobForPublish(null);
            addToast(`Diagnostic report for ${selectedJobForPublish.patientName || selectedJobForPublish.patient} signed & published!`, 'success');
          }}
        />
      )}

      {/* Digital Lab Report Modal */}
      {selectedJobForReportView && (
        <DigitalLabReportModal
          booking={selectedJobForReportView}
          onClose={() => setSelectedJobForReportView(null)}
        />
      )}

      {/* New Lab Job Dispatch Modal */}
      {isNewJobModalOpen && (
        <NewLabJobModal
          onClose={() => setIsNewJobModalOpen(false)}
          onCreateJob={(newJob) => {
            setTodaySchedule((prev) => [newJob, ...prev]);
            setIsNewJobModalOpen(false);
            addToast(`New phlebotomy job dispatch created for ${newJob.patient}!`, 'success');
          }}
        />
      )}
    </div>
  );
}

// ===================================================================
// CUSTOM SVG GRAPHICS TO MATCH USER REFERENCE IMAGE IDENTICALLY
// ===================================================================

// Sidebar Bottom Laboratory Glassware Graphic
function SidebarBeakersGraphic() {
  return (
    <div className="relative w-16 h-12 mx-auto flex items-center justify-center">
      <svg viewBox="0 0 80 65" fill="none" className="w-full h-full drop-shadow-[0_0_8px_rgba(20,184,166,0.35)]">
        {/* Large Beaker */}
        <path
          d="M20 16 L20 22 L12 50 C10 56 14 60 21 60 L41 60 C48 60 52 56 50 50 L42 22 L42 16 Z"
          stroke="#005CB9"
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Liquid level */}
        <path
          d="M16 43 C22 41 28 45 36 43 C42 41 45 42 47 43 L49 50 C51 55 48 58 42 58 L20 58 C14 58 12 54 13 50 Z"
          fill="#005CB9"
          fillOpacity="0.35"
        />
        {/* Small Beaker / Flask behind right */}
        <path
          d="M54 24 L54 29 L48 51 C47 55 50 58 55 58 L67 58 C72 58 75 55 74 51 L68 29 L68 24 Z"
          stroke="#38BDF8"
          strokeWidth="2.2"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Liquid in small beaker */}
        <path
          d="M50 45 C54 44 60 46 66 45 L68 50 C70 54 67 57 63 57 L54 57 C50 57 48 54 49 50 Z"
          fill="#38BDF8"
          fillOpacity="0.35"
        />
        {/* Rising bubbles */}
        <circle cx="28" cy="33" r="2.2" fill="#5EEAD4" />
        <circle cx="34" cy="25" r="1.6" fill="#5EEAD4" />
        <circle cx="25" cy="18" r="1.3" fill="#5EEAD4" />
        <circle cx="61" cy="37" r="1.8" fill="#7DD3FC" />
        <circle cx="58" cy="29" r="1.3" fill="#7DD3FC" />
      </svg>
    </div>
  );
}

// Layout Dashboard Icon Helper
function LayoutDashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
