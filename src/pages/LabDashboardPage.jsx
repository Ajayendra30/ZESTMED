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
  Plus
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

export default function LabDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Navigation & Interactive State
  const [activeMenu, setActiveMenu] = useState('dashboard');
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
    <div className="flex h-screen bg-[#F4F7FB] font-sans antialiased overflow-hidden select-none">
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (Dark Navy #0B2238)                      */}
      {/* ======================================================== */}
      <aside className="w-64 bg-[#0B2238] flex flex-col shrink-0 border-r border-[#081827] justify-between relative overflow-hidden">
        {/* Top: Logo & Menu Items */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5 shrink-0">
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

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {/* Dashboard (Active Pill) */}
            <button
              type="button"
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'dashboard'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                addToast('Viewing all 28 assigned bookings for Assam region', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'assigned'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                addToast("Displaying Today's Phlebotomy Dispatch Schedule (12 Appointments)", 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'schedule'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                setSelectedJobForCollection({
                  id: '#LB10241',
                  bookingId: '#LB10241',
                  patientName: 'Amit Verma',
                  patientPhone: '+91 92791 25091',
                  testName: 'Full Blood Count',
                  slot: '09:00 AM',
                  type: 'Home Collection',
                  address: 'House 14, Basistha Chariali, Dispur, Guwahati',
                  district: 'Kamrup Metro',
                  status: 'Pending Collection'
                });
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <Syringe className="w-4 h-4" />
              <span>Sample Collection</span>
            </button>

            {/* Test Processing */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('processing');
                addToast('Viewing 6 active specimens currently in analyzer centrifuge', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'processing'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                setSelectedJobForPublish({
                  id: '#LB10238',
                  bookingId: '#LB10238',
                  patientName: 'Sneha Singh',
                  testName: 'Complete Blood Count (CBC)',
                  collectedAt: '10:15 AM'
                });
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Reports</span>
            </button>

            {/* Completed Tests */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('completed');
                addToast('Viewing 34 verified and published test results', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'completed'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Tests</span>
            </button>

            {/* Notifications with red indicator dot */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
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
                addToast('Phlebotomy ID: PH-ASM-204 | Assigned: Guwahati Hub', 'info');
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

            {/* Logout */}
            <button
              type="button"
              onClick={() => {
                addToast('Signed out of Lab Executive session. Returned to Public Store.', 'info');
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition"
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          {/* Left: Hamburger + Search Input */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => addToast('Sidebar menu toggled', 'info')}
              className="p-1.5 text-slate-700 hover:text-slate-900 transition"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Prominent Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search booking ID, patient, test..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition"
              />
            </div>
          </div>

          {/* Right: Notifications Bell & User Profile */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Notification Bell with Red Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-30"
                  onMouseLeave={() => setIsNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Lab Operation Alerts</span>
                    <span className="text-[10px] font-bold text-[#14B8A6] bg-teal-50 px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>
                  <div className="space-y-2 pt-2.5">
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
                className="flex items-center gap-2.5 hover:opacity-90 transition text-left"
              >
                {/* Circular Photo Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#14B8A6]/20 bg-slate-100 shrink-0">
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
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    Rohit Das
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1 leading-none">
                    Lab Executive
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Rohit Das</p>
                    <p className="text-[11px] text-slate-400 font-mono">ID: PH-ASM-204</p>
                    <p className="text-[11px] text-teal-600 font-medium mt-0.5">Dispur Central Lab (Assam)</p>
                  </div>
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
        <main className="p-6 sm:p-8 space-y-6">
          {/* ======================================================== */}
          {/* 3. GREETING & DATE FILTER ROW                            */}
          {/* ======================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Good Morning, Rohit</span>
                <span className="text-2xl inline-block transform hover:rotate-12 transition-transform select-none">👋</span>
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
                className="bg-white border border-slate-200/90 shadow-xs px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition"
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
                        dateRange === opt ? 'text-[#14B8A6] font-bold bg-teal-50/60' : 'text-slate-700 hover:bg-slate-50'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {/* 1. Assigned Bookings */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Assigned Bookings
                </div>
                <div className="text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  28
                </div>
              </div>
            </div>

            {/* 2. Today's Appointments */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Today's Appointments
                </div>
                <div className="text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  12
                </div>
              </div>
            </div>

            {/* 3. Samples Collected */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <Syringe className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Samples Collected
                </div>
                <div className="text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  8
                </div>
              </div>
            </div>

            {/* 4. Tests Processing */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Tests Processing
                </div>
                <div className="text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  6
                </div>
              </div>
            </div>

            {/* 5. Reports Pending */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Reports Pending
                </div>
                <div className="text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  4
                </div>
              </div>
            </div>

            {/* 6. Completed Tests */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Completed Tests
                </div>
                <div className="text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
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
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#14B8A6]" />
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
                  className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center gap-1"
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100 gap-3"
                  >
                    {/* Time Badge */}
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold shrink-0">
                        {row.time}
                      </div>

                      {/* Patient Info */}
                      <div className="min-w-[130px]">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{row.patient}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {row.id}
                        </div>
                      </div>
                    </div>

                    {/* Test Name */}
                    <div className="text-xs font-medium text-slate-800 min-w-[140px]">
                      {row.test}
                    </div>

                    {/* Type Badge (Home Collection or Lab Visit) */}
                    <div>
                      {row.type === 'Home Collection' ? (
                        <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-600 border border-sky-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          <Home className="w-3 h-3 text-sky-500" />
                          <span>Home Collection</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 border border-purple-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          <Building2 className="w-3 h-3 text-purple-500" />
                          <span>Lab Visit</span>
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div>
                      {row.action === 'Collect Sample' ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(row)}
                          className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                          Collect Sample
                        </button>
                      ) : row.action === 'Check In' ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(row)}
                          className="bg-white hover:bg-teal-50 text-[#14B8A6] border border-[#14B8A6] px-4 py-1.5 rounded-xl text-xs font-semibold transition"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
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
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Task Progress Today
                  </h3>
                </div>

                {/* Donut Chart + Legend Side-by-Side */}
                <div className="flex items-center justify-between gap-4 py-1">
                  {/* SVG Donut Chart with center text 18 */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                      {/* Circle 1: Samples Collected (8/18 -> 44.4%) -> 44.4% of 377 = 167.4 */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#14B8A6"
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
                        <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
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
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Quick Actions
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
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
                    className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
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
                    className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group"
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
                    className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group"
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
                    className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group"
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
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Activities
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Opening comprehensive lab executive audit trail', 'info')}
                  className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Activity Items matching image */}
              <div className="space-y-3 pt-1">
                {/* Activity 1 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Report uploaded for LB10238
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    10:24 AM
                  </span>
                </div>

                {/* Activity 2 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Sample collected from Amit Verma (LB10237)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    09:50 AM
                  </span>
                </div>

                {/* Activity 3 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Test processing started for LB10236
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    09:20 AM
                  </span>
                </div>

                {/* Activity 4 */}
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      New booking assigned – LB10245
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    08:45 AM
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Assigned Tests Overview (~55% width -> lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#14B8A6]" />
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
                    <div className="h-full bg-[#14B8A6] rounded-full" style={{ width: '75%' }} />
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
            setSelectedJobForPublish(null);
            addToast(`Diagnostic report for ${selectedJobForPublish.patientName} (${selectedJobForPublish.id}) signed & published!`, 'success');
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
          stroke="#14B8A6"
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Liquid level */}
        <path
          d="M16 43 C22 41 28 45 36 43 C42 41 45 42 47 43 L49 50 C51 55 48 58 42 58 L20 58 C14 58 12 54 13 50 Z"
          fill="#14B8A6"
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
