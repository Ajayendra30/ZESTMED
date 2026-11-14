// src/pages/AdminDashboardPage.jsx
// Redesigned to match the exact ZESTMED Admin Dashboard specification pixel-for-pixel
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSubdomainUrl } from '../utils/subdomain';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  Users,
  ShoppingCart,
  FlaskConical,
  Coins,
  BarChart2,
  PieChart,
  Package,
  FileText,
  Layers,
  CreditCard,
  Settings,
  Pill,
  User,
  ArrowUpRight,
  TrendingUp,
  X,
  ExternalLink,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Navigation & Interactive State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isUsersExpanded, setIsUsersExpanded] = useState(true);
  const [isMedicinesExpanded, setIsMedicinesExpanded] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);

  // Exact Data from User Reference Image
  const kpiMetrics = [
    {
      title: 'Total Patients',
      value: '4,892',
      trend: '↑ +12.4%',
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Lab Bookings',
      value: '1,236',
      trend: '↑ +18.7%',
      icon: Calendar,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Medicine Orders',
      value: '2,168',
      trend: '↑ +14.2%',
      icon: ShoppingCart,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500'
    },
    {
      title: 'Diagnostic Tests',
      value: '56',
      trend: '↑ +9.8%',
      icon: FlaskConical,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500'
    },
    {
      title: 'Total Revenue',
      value: '₹12,48,320',
      trend: '↑ +20.6%',
      icon: Coins,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500'
    }
  ];

  // Recent Bookings Table Data
  const recentBookings = [
    {
      id: '#LB10234',
      patient: 'Rajesh Kumar',
      test: 'Complete Blood Count',
      type: 'Home Collection',
      status: 'Confirmed',
      statusBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
    },
    {
      id: '#LB10233',
      patient: 'Priya Sharma',
      test: 'Thyroid Profile',
      type: 'Lab Visit',
      status: 'Sample Collected',
      statusBg: 'bg-blue-50 text-blue-600 border border-blue-200/60'
    },
    {
      id: '#LB10232',
      patient: 'Amit Verma',
      test: 'Diabetes Package',
      type: 'Home Collection',
      status: 'In Process',
      statusBg: 'bg-amber-50 text-amber-600 border border-amber-200/60'
    },
    {
      id: '#LB10231',
      patient: 'Sneha Singh',
      test: 'Full Body Checkup',
      type: 'Lab Visit',
      status: 'Report Ready',
      statusBg: 'bg-purple-50 text-purple-600 border border-purple-200/60'
    }
  ];

  // Low Stock Medicines Table Data
  const lowStockMedicines = [
    { name: 'Paracetamol 500 mg', currentStock: 24, threshold: 100 },
    { name: 'Amoxicillin 250 mg', currentStock: 18, threshold: 50 },
    { name: 'Cetirizine 10 mg', currentStock: 15, threshold: 40 },
    { name: 'Omeprazole 20 mg', currentStock: 27, threshold: 75 },
    { name: 'Metformin 500 mg', currentStock: 30, threshold: 100 }
  ];

  // Revenue SVG Chart Coordinates (Exact matching curve)
  // ViewBox: 0 0 680 230
  // Values: Mar 1 (45), Mar 5 (85), Mar 9 (75), Mar 13 (95), Mar 17 (118), Mar 21 (102), Mar 25 (145), Mar 30 (195)
  const chartPoints = [
    { x: 35, y: 172, label: 'Mar 1', value: '₹2.8L' },
    { x: 120, y: 142, label: 'Mar 5', value: '₹5.4L' },
    { x: 205, y: 150, label: 'Mar 9', value: '₹4.6L' },
    { x: 290, y: 136, label: 'Mar 13', value: '₹6.0L' },
    { x: 375, y: 122, label: 'Mar 17', value: '₹7.2L' },
    { x: 460, y: 134, label: 'Mar 21', value: '₹6.2L' },
    { x: 545, y: 108, label: 'Mar 25', value: '₹8.8L' },
    { x: 635, y: 55, label: 'Mar 30', value: '₹12.5L' }
  ];

  // Smooth SVG cubic bezier path string
  const pathD = `M 35 172 C 80 160, 95 142, 120 142 C 150 142, 175 152, 205 150 C 235 148, 260 136, 290 136 C 320 136, 345 122, 375 122 C 405 122, 430 134, 460 134 C 490 134, 515 112, 545 108 C 585 102, 605 60, 635 55`;
  const areaD = `${pathD} L 635 200 L 35 200 Z`;

  // Notifications List Demo
  const notificationsList = [
    { id: 1, text: 'New home collection booking #LB10234 confirmed in Dispur.', time: '5m ago' },
    { id: 2, text: 'Stock alert: Cetirizine 10 mg reached critical low (15 units).', time: '22m ago' },
    { id: 3, text: 'Phlebotomist Bikash Das logged 4.2°C cold-chain arrival.', time: '1h ago' }
  ];

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-sans antialiased overflow-hidden">
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (Dark Navy #0B2238)                      */}
      {/* ======================================================== */}
      <aside className="w-64 bg-[#0B2238] flex flex-col shrink-0 select-none border-r border-[#081827]">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5">
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
          {/* Dashboard Item (Active Pill) */}
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

          {/* Users Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setIsUsersExpanded(!isUsersExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isUsersExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isUsersExpanded && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('users-patients');
                    addToast('Filtered view: Registered Assam Patients', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'users-patients' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Patients</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('users-executives');
                    addToast('Filtered view: On-Duty Lab Executives & Phlebotomists', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'users-executives' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Lab Executives</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('users-admins');
                    addToast('Super Admin Role Overview', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'users-admins' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Admins</span>
                </button>
              </div>
            )}
          </div>

          {/* Medicines Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setIsMedicinesExpanded(!isMedicinesExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <Pill className="w-4 h-4" />
                <span>Medicines</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMedicinesExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isMedicinesExpanded && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  type="button"
                  onClick={() => addToast('Opening Central Pharmacy Inventory', 'info')}
                  className="w-full text-left py-1 text-xs text-[#88A0B8] hover:text-white flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>All Products</span>
                </button>
                <button
                  type="button"
                  onClick={() => addToast('Opening Low Stock Warning List', 'info')}
                  className="w-full text-left py-1 text-xs text-[#88A0B8] hover:text-white flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Stock Alerts</span>
                </button>
              </div>
            )}
          </div>

          {/* Diagnostic Tests */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('diagnostic-tests');
              addToast('Diagnostic Tests Catalog', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'diagnostic-tests'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Diagnostic Tests</span>
          </button>

          {/* Lab Bookings */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('lab-bookings');
              addToast('Opening Lab Bookings Central Schedule', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'lab-bookings'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lab Bookings</span>
          </button>

          {/* Orders */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('orders');
              addToast('All Customer Medicine Orders', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'orders'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders</span>
          </button>

          {/* Prescriptions */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('prescriptions');
              addToast('Chief Pharmacist Prescription Queue', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'prescriptions'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Prescriptions</span>
          </button>

          {/* Inventory */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('inventory');
              addToast('Warehouse Racks & Stock Levels', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'inventory'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Inventory</span>
          </button>

          {/* Payments */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('payments');
              addToast('Payment Gateways & Ledger', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'payments'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments</span>
          </button>

          {/* Reports & Analytics */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('analytics');
              addToast('Clinical & Revenue Analytics', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'analytics'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Reports & Analytics</span>
          </button>

          {/* Notifications with red dot */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'notifications'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            {/* Red indicator dot */}
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('settings');
              addToast('Platform Settings & Demo Controls', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'settings'
                ? 'bg-[#14B8A6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Sidebar Footer Link back to Website */}
        <div className="p-3 border-t border-white/5">
          <Link
            to="/"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11.5px] font-semibold text-teal-400 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-500/20 transition"
          >
            <span>Exit to Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
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
                placeholder="Search patients, orders, bookings, medicines..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition"
              />
            </div>
          </div>

          {/* Right: Notifications + User Profile */}
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
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-30"
                  onMouseLeave={() => setIsNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <span className="text-[10px] font-bold text-[#14B8A6] bg-teal-50 px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>
                  <div className="space-y-2 pt-2">
                    {notificationsList.map((n) => (
                      <div key={n.id} className="text-xs p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                        <p className="text-slate-700 leading-snug">{n.text}</p>
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
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 hover:opacity-90 transition text-left"
              >
                {/* Avatar with initial 'A' in teal */}
                <div className="w-9 h-9 rounded-full bg-[#14B8A6] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  A
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    Admin
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1 leading-none">
                    Super Admin
                  </div>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30"
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Dr. Arindam Sharma</p>
                    <p className="text-[11px] text-slate-400">admin@zestmed.com</p>
                  </div>
                  <Link
                    to="/patient-dashboard"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span>Patient Dashboard</span>
                  </Link>
                  <Link
                    to="/lab"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Lab Executive Portal</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <Link
                    to="/"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Exit Admin Panel</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <main className="p-6 sm:p-8 space-y-6">
          {/* ======================================================== */}
          {/* 3. TITLE & DATE FILTER ROW                               */}
          {/* ======================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of ZESTMED operations, users, bookings, orders and revenue.
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
                  className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-20"
                  onMouseLeave={() => setIsDateDropdownOpen(false)}
                >
                  {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Financial Year'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDateRange(opt);
                        setIsDateDropdownOpen(false);
                        addToast(`Date filter updated: ${opt}`, 'info');
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
          {/* 4. TOP 5 METRIC CARDS ROW                                */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {kpiMetrics.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow"
                >
                  {/* Square rounded icon wrapper */}
                  <div className={`w-12 h-12 rounded-2xl ${kpi.bgColor} ${kpi.iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      {kpi.title}
                    </div>
                    <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                      {kpi.value}
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                      {kpi.trend}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* 5. MIDDLE SECTION: REVENUE OVERVIEW + ORDERS BY CATEGORY */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Revenue Overview (Width ~65%) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Revenue Overview
                  </h3>
                </div>
                <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold font-mono text-xs px-2.5 py-1 rounded-lg">
                  Revenue: ₹12,48,320
                </div>
              </div>

              {/* Exact SVG Chart Canvas */}
              <div className="relative w-full h-64 pt-2">
                <svg viewBox="0 0 680 230" className="w-full h-full overflow-visible">
                  <defs>
                    {/* Linear Gradient for Area under curve */}
                    <linearGradient id="revenueTealGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.22" />
                      <stop offset="85%" stopColor="#14B8A6" stopOpacity="0.02" />
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines & Y-Axis Labels */}
                  {/* Y = 35 (₹15L) */}
                  <line x1="35" y1="35" x2="645" y2="35" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="5" y="38" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹15L</text>

                  {/* Y = 68 (₹12L) */}
                  <line x1="35" y1="68" x2="645" y2="68" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="5" y="71" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹12L</text>

                  {/* Y = 101 (₹9L) */}
                  <line x1="35" y1="101" x2="645" y2="101" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="5" y="104" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹9L</text>

                  {/* Y = 134 (₹6L) */}
                  <line x1="35" y1="134" x2="645" y2="134" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="5" y="137" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹6L</text>

                  {/* Y = 167 (₹3L) */}
                  <line x1="35" y1="167" x2="645" y2="167" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="5" y="170" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹3L</text>

                  {/* Y = 200 (₹0 Base Line) */}
                  <line x1="35" y1="200" x2="645" y2="200" stroke="#CBD5E1" strokeWidth="1" />
                  <text x="14" y="203" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹0</text>

                  {/* Shaded Area Fill */}
                  <path d={areaD} fill="url(#revenueTealGradient)" />

                  {/* Teal Smooth Curved Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Point Circles on Curve */}
                  {chartPoints.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#FFFFFF"
                        stroke="#14B8A6"
                        strokeWidth="2.5"
                        className="cursor-pointer hover:scale-125 transition-transform"
                      />
                      {/* X-Axis Month Day Labels */}
                      <text
                        x={pt.x}
                        y="222"
                        textAnchor="middle"
                        fontSize="11"
                        fill="#64748B"
                        fontFamily="sans-serif"
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Right Card: Orders by Category (Width ~35%) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="w-5 h-5 text-[#14B8A6]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Orders by Category
                </h3>
              </div>

              {/* Donut Chart + Legend Side-by-Side */}
              <div className="flex items-center justify-between gap-4 py-2">
                {/* SVG Donut Chart with center text */}
                <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                    {/* Circle 1: Medicines (58%) -> Stroke Dash: 58% of 377 = 218.66 */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke="#14B8A6"
                      strokeWidth="22"
                      strokeDasharray="218.66 377"
                      strokeDashoffset="0"
                    />
                    {/* Circle 2: Lab Tests (28%) -> 28% of 377 = 105.56 */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke="#3B82F6"
                      strokeWidth="22"
                      strokeDasharray="105.56 377"
                      strokeDashoffset="-218.66"
                    />
                    {/* Circle 3: Health Packages (10%) -> 10% of 377 = 37.7 */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke="#C084FC"
                      strokeWidth="22"
                      strokeDasharray="37.7 377"
                      strokeDashoffset="-324.22"
                    />
                    {/* Circle 4: Others (4%) -> 4% of 377 = 15.08 */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke="#CBD5E1"
                      strokeWidth="22"
                      strokeDasharray="15.08 377"
                      strokeDashoffset="-361.92"
                    />
                  </svg>

                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    <span className="text-xl font-black text-slate-900 leading-none">
                      2,168
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium mt-1 leading-none">
                      Total Orders
                    </span>
                  </div>
                </div>

                {/* Legend on Right Side */}
                <div className="space-y-3 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
                      <span className="text-slate-700 font-medium">Medicines</span>
                    </div>
                    <span className="font-bold text-slate-900">58%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                      <span className="text-slate-700 font-medium">Lab Tests</span>
                    </div>
                    <span className="font-bold text-slate-900">28%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C084FC]" />
                      <span className="text-slate-700 font-medium">Health Packages</span>
                    </div>
                    <span className="font-bold text-slate-900">10%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
                      <span className="text-slate-700 font-medium">Others</span>
                    </div>
                    <span className="font-bold text-slate-900">4%</span>
                  </div>
                </div>
              </div>

              <div className="pt-2" />
            </div>
          </div>

          {/* ======================================================== */}
          {/* 6. BOTTOM SECTION: RECENT BOOKINGS + LOW STOCK MEDICINES */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Recent Bookings (Width ~65%) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Bookings
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Displaying full laboratory appointments list (Assam Hub)', 'info')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View All
                </button>
              </div>

              {/* Recent Bookings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-slate-100 pb-2.5">
                      <th className="py-2.5 font-bold">Booking ID</th>
                      <th className="py-2.5 font-bold">Patient</th>
                      <th className="py-2.5 font-bold">Test / Package</th>
                      <th className="py-2.5 font-bold">Type</th>
                      <th className="py-2.5 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 font-semibold text-slate-800">
                          {b.id}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{b.patient}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-700">
                          {b.test}
                        </td>
                        <td className="py-3 text-slate-600">
                          {b.type}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${b.statusBg}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Low Stock Medicines (Width ~35%) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Low Stock Medicines
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Opening Central Warehouse Low Stock Reorder List', 'info')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View All
                </button>
              </div>

              {/* Low Stock Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-slate-100 pb-2.5">
                      <th className="py-2.5 font-bold">Medicine</th>
                      <th className="py-2.5 font-bold text-center">Current Stock</th>
                      <th className="py-2.5 font-bold text-center">Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStockMedicines.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-2.5 font-medium text-slate-800">
                          {m.name}
                        </td>
                        <td className="py-2.5 text-center font-bold text-rose-500 font-mono">
                          {m.currentStock}
                        </td>
                        <td className="py-2.5 text-center text-slate-700 font-mono">
                          {m.threshold}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Icon helpers matching the exact image
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

function PieChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
