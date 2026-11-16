// src/pages/AdminDashboardPage.jsx
// Redesigned to match the exact ZESTMED Admin Dashboard specification pixel-for-pixel
import React, { useState, useEffect } from 'react';
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
  Activity,
  Plus,
  Trash2,
  Edit,
  Download,
  RefreshCw,
  Clock,
  Truck,
  AlertTriangle,
  Check,
  MapPin,
  Phone,
  Mail,
  FileCheck,
  Eye,
  Sliders,
  UploadCloud,
  Lock,
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { initialInventoryMedicines, initialAdminProfile } from '../mock-data/adminData';
import { MOCK_DIAGNOSTIC_TESTS } from '../mock-data/diagnosticTests';
import { initialPhlebotomyJobs } from '../mock-data/labExecutiveData';
import { initialPatientOrders } from '../mock-data/patientData';
import AddDiagnosticTestModal from '../components/AddDiagnosticTestModal';
import RegisterPatientModal from '../components/RegisterPatientModal';
import EditPatientModal from '../components/EditPatientModal';
import DeletePatientModal from '../components/DeletePatientModal';
import ViewPatientModal from '../components/ViewPatientModal';
import AddExecutiveModal from '../components/AddExecutiveModal';
import EditExecutiveModal from '../components/EditExecutiveModal';
import DeleteExecutiveModal from '../components/DeleteExecutiveModal';
import UploadInventoryModal from '../components/UploadInventoryModal';
import UploadPackagesModal from '../components/UploadPackagesModal';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Navigation & Interactive State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsersExpanded, setIsUsersExpanded] = useState(true);
  const [isMedicinesExpanded, setIsMedicinesExpanded] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);
  const [testsList, setTestsList] = useState(MOCK_DIAGNOSTIC_TESTS);
  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState(false);
  const [isRegisterPatientModalOpen, setIsRegisterPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [isAddExecutiveModalOpen, setIsAddExecutiveModalOpen] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [deletingExecutive, setDeletingExecutive] = useState(null);

  // Bulk Upload Modals for Inventory & Packages
  const [isUploadInventoryOpen, setIsUploadInventoryOpen] = useState(false);
  const [isUploadPackagesOpen, setIsUploadPackagesOpen] = useState(false);

  // Razorpay Gateway Setup & Mandatory Statutory Business Documents
  const [isRazorpayLiveMode, setIsRazorpayLiveMode] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [razorpayDocs, setRazorpayDocs] = useState([
    {
      id: 'doc-1',
      title: 'Certificate of Incorporation / Partnership Deed',
      category: 'Business Identity',
      docNumber: 'CIN: U85110AS2024PTC023451',
      file: 'Zestmed_Incorporation_Assam_MCA.pdf',
      status: 'Verified',
      mandatoryFor: 'Corporate Merchant Registration',
      date: '10 Jan 2026'
    },
    {
      id: 'doc-2',
      title: 'Company PAN Card',
      category: 'Statutory Tax Identity',
      docNumber: 'PAN: AABCZ1234F',
      file: 'Zestmed_Company_PAN.pdf',
      status: 'Verified',
      mandatoryFor: 'Tax & AML Verification',
      date: '10 Jan 2026'
    },
    {
      id: 'doc-3',
      title: 'Assam State GSTIN Registration Certificate',
      category: 'GST Compliance',
      docNumber: 'GSTIN: 18AAACZ9901M1ZT (Kamrup Metro)',
      file: 'Assam_Commercial_Taxes_GST_Reg.pdf',
      status: 'Verified',
      mandatoryFor: 'B2C/B2B Invoicing & Tax Ledger',
      date: '12 Jan 2026'
    },
    {
      id: 'doc-4',
      title: 'Wholesale & Retail Drug License (Form 20B & 21B)',
      category: 'Pharmaceutical Regulatory',
      docNumber: 'Lic. No: DL-GUW-20B/21B-4492/24',
      file: 'Assam_Drugs_Control_Admin_License.pdf',
      status: 'Verified',
      mandatoryFor: 'Online Medicine & Pharmacy Gateway',
      date: '14 Jan 2026'
    },
    {
      id: 'doc-5',
      title: 'Clinical Establishment Act Registration (Govt. of Assam)',
      category: 'Diagnostic Lab Regulatory',
      docNumber: 'Reg. No: CEA-KAMRUP-METRO/2024/091',
      file: 'Directorate_Health_Services_Clinical_Reg.pdf',
      status: 'Verified',
      mandatoryFor: 'Diagnostic Pathology Test Collection',
      date: '15 Jan 2026'
    },
    {
      id: 'doc-6',
      title: 'Bank Account Cancelled Cheque / Account Statement',
      category: 'Settlement Account',
      docNumber: 'A/C: 502000889214 • HDFC Bank GS Road Branch',
      file: 'HDFC_Bank_Current_Account_Cheque.pdf',
      status: 'Verified',
      mandatoryFor: 'T+1 Automatic Daily Settlements',
      date: '16 Jan 2026'
    },
    {
      id: 'doc-7',
      title: 'Authorized Signatory & Directors KYC (Aadhaar & PAN)',
      category: 'Director Verification',
      docNumber: 'Dr. N. Bora & Ajayendra Shekhar',
      file: 'Directors_KYC_Assam_Dossier.pdf',
      status: 'Verified',
      mandatoryFor: 'PMLA / Banking Compliance',
      date: '16 Jan 2026'
    },
    {
      id: 'doc-8',
      title: 'Mandatory Healthcare Website Policies & Compliance URLs',
      category: 'RBI / Gateway Policy',
      docNumber: 'T&C, Privacy Policy, Refund Policy & Guwahati Grievance Lead',
      file: 'https://zestmed.in/terms (All 4 Live)',
      status: 'Verified',
      mandatoryFor: 'Live Merchant Checkout Approval',
      date: '18 Jan 2026'
    }
  ]);

  // Exact Data from User Reference Image
  const kpiMetrics = [
    {
      title: 'Total Patients',
      value: '4,892',
      trend: '↑ +12.4%',
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      targetMenu: 'users-patients'
    },
    {
      title: 'Lab Bookings',
      value: '1,236',
      trend: '↑ +18.7%',
      icon: Calendar,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      targetMenu: 'lab-bookings'
    },
    {
      title: 'Medicine Orders',
      value: '2,168',
      trend: '↑ +14.2%',
      icon: ShoppingCart,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      targetMenu: 'orders'
    },
    {
      title: 'Diagnostic Tests',
      value: '56',
      trend: '↑ +9.8%',
      icon: FlaskConical,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
      targetMenu: 'diagnostic-tests'
    },
    {
      title: 'Total Revenue',
      value: '₹12,48,320',
      trend: '↑ +20.6%',
      icon: Coins,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
      targetMenu: 'analytics'
    }
  ];

  // Interactive Management States
  const [adminMedicines, setAdminMedicines] = useState(initialInventoryMedicines);
  const [adminBookings, setAdminBookings] = useState([
    { id: '#LB10234', patient: 'Rajesh Kumar', phone: '+91 98765 43210', test: 'Complete Blood Count', type: 'Home Collection', executive: 'Bikash Das', status: 'Confirmed', statusBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60', amount: 349, slot: '09:00 AM' },
    { id: '#LB10233', patient: 'Priya Sharma', phone: '+91 94350 12345', test: 'Thyroid Profile', type: 'Lab Visit', executive: 'Rohit Sharma', status: 'Sample Collected', statusBg: 'bg-blue-50 text-blue-600 border border-blue-200/60', amount: 599, slot: '10:30 AM' },
    { id: '#LB10232', patient: 'Amit Verma', phone: '+91 97060 98765', test: 'Diabetes Package', type: 'Home Collection', executive: 'Manab Barua', status: 'In Process', statusBg: 'bg-amber-50 text-amber-600 border border-amber-200/60', amount: 899, slot: '11:00 AM' },
    { id: '#LB10231', patient: 'Sneha Singh', phone: '+91 91270 54321', test: 'Full Body Checkup', type: 'Lab Visit', executive: 'Dr. N. Bora', status: 'Report Ready', statusBg: 'bg-purple-50 text-purple-600 border border-purple-200/60', amount: 1499, slot: '12:15 PM' },
    { id: '#LB10230', patient: 'Vikram Das', phone: '+91 99540 67890', test: 'Lipid Profile', type: 'Home Collection', executive: 'Bikash Das', status: 'Confirmed', statusBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60', amount: 499, slot: '02:00 PM' }
  ]);
  const [adminOrders, setAdminOrders] = useState([
    { id: '#ORD5487', customer: 'Rajesh Kumar', items: 'Paracetamol 500 mg x 2, Vitamin C x 1', total: 340, payment: 'UPI Paid', status: 'Delivered', address: 'Dispur, Guwahati' },
    { id: '#ORD5462', customer: 'Priya Sharma', items: 'Vitamin D3 600 IU x 1, Calcium x 1', total: 620, payment: 'Prepaid UPI', status: 'Out for Delivery', address: 'Ulubari, Guwahati' },
    { id: '#ORD5420', customer: 'Amit Verma', items: 'Omeprazole 20 mg x 3, Antacid Gel x 1', total: 415, payment: 'COD', status: 'Processing', address: 'Jalukbari, Guwahati' },
    { id: '#ORD5415', customer: 'Bipul Shekhar', items: 'Metformin 500mg SR x 4', total: 180, payment: 'UPI Paid', status: 'Dispatched', address: 'Khanapara, Guwahati' }
  ]);
  const initialPatients = [
    { id: 'ZM-PAT-101', name: 'Ajayendra Shekhar', phone: '+91 92791 25091', city: 'Guwahati (Dispur)', bookingsCount: 8, ordersCount: 5, status: 'Active' },
    { id: 'ZM-PAT-102', name: 'Rajesh Kumar', phone: '+91 98765 43210', city: 'Guwahati (Ulubari)', bookingsCount: 4, ordersCount: 2, status: 'Active' },
    { id: 'ZM-PAT-103', name: 'Priya Sharma', phone: '+91 94350 12345', city: 'Guwahati (Chandmari)', bookingsCount: 3, ordersCount: 1, status: 'Active' },
    { id: 'ZM-PAT-104', name: 'Amit Verma', phone: '+91 97060 98765', city: 'Guwahati (Jalukbari)', bookingsCount: 6, ordersCount: 4, status: 'Active' },
    { id: 'ZM-PAT-105', name: 'Sneha Singh', phone: '+91 91270 54321', city: 'Guwahati (Khanapara)', bookingsCount: 2, ordersCount: 0, status: 'Active' }
  ];
  const [patientsList, setPatientsList] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_admin_patients');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialPatients;
  });

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_admin_patients', JSON.stringify(patientsList));
    } catch (e) {
      console.error(e);
    }
  }, [patientsList]);
  const initialExecutives = [
    { id: 'ZM-EXEC-01', name: 'Bikash Das', phone: '+91 92791 25091', zone: 'Dispur & GS Road Hub', tasksToday: 5, temp: '3.8°C', rating: '4.9 ★', status: 'On Route' },
    { id: 'ZM-EXEC-02', name: 'Manab Jyoti Barua', phone: '+91 98765 00001', zone: 'Ulubari & Paltan Bazar', tasksToday: 4, temp: '4.0°C', rating: '4.8 ★', status: 'Active' },
    { id: 'ZM-EXEC-03', name: 'Rohit Sharma', phone: '+91 94350 00002', zone: 'Jalukbari & Maligaon', tasksToday: 6, temp: '3.9°C', rating: '4.9 ★', status: 'Sample Collected' },
    { id: 'ZM-EXEC-04', name: 'Tridip Kalita', phone: '+91 97060 00003', zone: 'Khanapara & Beltola', tasksToday: 3, temp: '4.1°C', rating: '4.7 ★', status: 'Available' }
  ];
  const [executivesList, setExecutivesList] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_admin_executives');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialExecutives;
  });

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_admin_executives', JSON.stringify(executivesList));
    } catch (e) {
      console.error(e);
    }
  }, [executivesList]);
  const [adminsList, setAdminsList] = useState([
    { id: 'ADM-01', name: 'Dr. Arindam Sharma', email: 'arindam@zestmed.com', role: 'Super Admin & Medical Director', access: 'All Privileges', status: 'Active' },
    { id: 'ADM-02', name: 'Pankaj Barman', email: 'pankaj.pharma@zestmed.com', role: 'Chief Pharmacist Lead', access: 'Inventory & Prescriptions', status: 'Active' },
    { id: 'ADM-03', name: 'Dr. N. Bora', email: 'n.bora@zestmed.com', role: 'Chief of Pathology & Diagnostics', access: 'Lab & Diagnostic Approvals', status: 'Active' }
  ]);
  const [prescriptionsList, setPrescriptionsList] = useState([
    { id: 'RX-9821', patient: 'Ajayendra Shekhar', doctor: 'Dr. B. K. Sarma (MD)', date: 'Nov 12, 2026', items: 'Metformin 500mg, Rosuvastatin 10mg', status: 'Approved' },
    { id: 'RX-9822', patient: 'Minati Shekhar', doctor: 'Dr. D. Goswami (Cardiologist)', date: 'Nov 13, 2026', items: 'Telmisartan 40mg, Atorvastatin 20mg', status: 'Pending Audit' },
    { id: 'RX-9823', patient: 'Priya Sharma', doctor: 'Dr. S. Roy (General Med)', date: 'Nov 14, 2026', items: 'Thyroxine 50mcg', status: 'Pending Audit' }
  ]);
  const [paymentsList, setPaymentsList] = useState([
    { id: 'TXN-9081', ref: '#LB10234', customer: 'Rajesh Kumar', method: 'Razorpay UPI', amount: 349, date: '13 Nov 2026, 09:12 AM', status: 'Success' },
    { id: 'TXN-9080', ref: '#ORD5487', customer: 'Ajayendra Shekhar', method: 'UPI Instant', amount: 980, date: '12 Nov 2026, 10:45 AM', status: 'Success' },
    { id: 'TXN-9079', ref: '#LB10233', customer: 'Priya Sharma', method: 'NetBanking', amount: 599, date: '12 Nov 2026, 02:18 PM', status: 'Success' },
    { id: 'TXN-9078', ref: '#ORD5462', customer: 'Sneha Singh', method: 'Debit Card', amount: 620, date: '11 Nov 2026, 11:30 AM', status: 'Success' },
    { id: 'TXN-9077', ref: '#LB10232', customer: 'Amit Verma', method: 'Cash on Collection', amount: 899, date: '10 Nov 2026, 04:00 PM', status: 'Success' }
  ]);
  const [newMedForm, setNewMedForm] = useState({ name: '', genericName: '', categoryName: 'General', stock: 100, price: 50, expiry: 'Dec 2027' });

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
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-[#0A1E34] flex flex-col select-none border-r border-[#081827] overflow-hidden transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:shrink-0 lg:visible lg:pointer-events-auto ${
          isSidebarOpen
            ? 'translate-x-0 visible pointer-events-auto'
            : '-translate-x-full invisible pointer-events-none'
        }`}
      >
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
          {/* Dashboard Item (Active Pill) */}
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
                    setIsSidebarOpen(false);
                    addToast('Filtered view: Registered Assam Patients', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'users-patients' ? 'text-[#005CB9] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Patients</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('users-executives');
                    setIsSidebarOpen(false);
                    addToast('Filtered view: On-Duty Lab Executives & Phlebotomists', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'users-executives' ? 'text-[#005CB9] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Lab Executives</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('users-admins');
                    setIsSidebarOpen(false);
                    addToast('Super Admin Role Overview', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'users-admins' ? 'text-[#005CB9] font-bold' : 'text-[#88A0B8] hover:text-white'
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
              onClick={() => {
                setIsMedicinesExpanded(!isMedicinesExpanded);
                setActiveMenu('medicines');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'medicines' || activeMenu === 'medicines-all' || activeMenu === 'medicines-categories' || activeMenu === 'medicines-add'
                  ? 'bg-[#005CB9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
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
                  onClick={() => {
                    setActiveMenu('medicines-all');
                    setIsSidebarOpen(false);
                    addToast('Opening Central Pharmacy Catalog', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'medicines-all' ? 'text-[#005CB9] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>All Products</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('medicines-categories');
                    setIsSidebarOpen(false);
                    addToast('Opening Category Breakdown', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'medicines-categories' ? 'text-[#005CB9] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Categories</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('medicines-add');
                    setIsSidebarOpen(false);
                    addToast('Add New Medicine Form', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'medicines-add' ? 'text-[#005CB9] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Add Medicine</span>
                </button>
              </div>
            )}
          </div>

          {/* Diagnostic Tests */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('diagnostic-tests');
              setIsSidebarOpen(false);
              addToast('Diagnostic Tests Catalog', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'diagnostic-tests'
                ? 'bg-[#005CB9] text-white shadow-sm'
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
              setIsSidebarOpen(false);
              addToast('Opening Lab Bookings Central Schedule', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'lab-bookings'
                ? 'bg-[#005CB9] text-white shadow-sm'
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
              setIsSidebarOpen(false);
              addToast('All Customer Medicine Orders', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'orders'
                ? 'bg-[#005CB9] text-white shadow-sm'
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
              setIsSidebarOpen(false);
              addToast('Chief Pharmacist Prescription Queue', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'prescriptions'
                ? 'bg-[#005CB9] text-white shadow-sm'
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
              setIsSidebarOpen(false);
              addToast('Warehouse Racks & Stock Levels', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'inventory'
                ? 'bg-[#005CB9] text-white shadow-sm'
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
              setIsSidebarOpen(false);
              addToast('Payment Gateways & Ledger', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'payments'
                ? 'bg-[#005CB9] text-white shadow-sm'
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
              setIsSidebarOpen(false);
              addToast('Clinical & Revenue Analytics', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'analytics'
                ? 'bg-[#005CB9] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Reports & Analytics</span>
          </button>

          {/* Notifications with red dot */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('notifications');
              setIsSidebarOpen(false);
              addToast('Opening Admin Real-Time Operations Alerts', 'info');
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
            {/* Red indicator dot */}
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu('settings');
              setIsSidebarOpen(false);
              addToast('Platform Settings & Demo Controls', 'info');
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
              activeMenu === 'settings'
                ? 'bg-[#005CB9] text-white shadow-sm'
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
            onClick={() => setIsSidebarOpen(false)}
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
                placeholder="Search patients, orders, bookings..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#005CB9] focus:ring-1 focus:ring-[#005CB9] transition"
              />
            </div>
          </div>

          {/* Right: Notifications + User Profile */}
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
                  className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-30"
                  onMouseLeave={() => setIsNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <span className="text-[10px] font-bold text-[#005CB9] bg-teal-50 px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>
                  <div className="space-y-2 pt-2 max-h-60 overflow-y-auto">
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
                className="flex items-center gap-2 hover:opacity-90 transition text-left"
              >
                {/* Avatar with initial 'A' in teal */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#005CB9] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  A
                </div>
                <div className="hidden sm:block">
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
                  className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30"
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
        <main className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
          {activeMenu === 'dashboard' && (
            <>
          {/* ======================================================== */}
          {/* 3. TITLE & DATE FILTER ROW                               */}
          {/* ======================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
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
                className="bg-white border border-slate-200/90 shadow-xs px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition"
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
          {/* 4. TOP 5 METRIC CARDS ROW                                */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {kpiMetrics.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  onClick={() => kpi.targetMenu && setActiveMenu(kpi.targetMenu)}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-3.5 hover:shadow-md hover:border-teal-300 transition cursor-pointer group"
                >
                  {/* Square rounded icon wrapper */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${kpi.bgColor} ${kpi.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      {kpi.title}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                      {kpi.value}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                      <span>{kpi.trend}</span>
                      <span className="text-[10px] text-slate-400 font-normal">→</span>
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
            <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Revenue Overview
                  </h3>
                </div>
                <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold font-mono text-xs px-2.5 py-1 rounded-lg">
                  Revenue: ₹12,48,320
                </div>
              </div>

              {/* Exact SVG Chart Canvas */}
              <div className="relative w-full h-52 sm:h-64 pt-2">
                <svg viewBox="0 0 680 230" className="w-full h-full overflow-visible">
                  <defs>
                    {/* Linear Gradient for Area under curve */}
                    <linearGradient id="revenueTealGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#005CB9" stopOpacity="0.22" />
                      <stop offset="85%" stopColor="#005CB9" stopOpacity="0.02" />
                      <stop offset="100%" stopColor="#005CB9" stopOpacity="0.0" />
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
                    stroke="#005CB9"
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
                        stroke="#005CB9"
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
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="w-5 h-5 text-[#005CB9]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Orders by Category
                </h3>
              </div>

              {/* Donut Chart + Legend Side-by-Side */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                {/* SVG Donut Chart with center text */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                    {/* Circle 1: Medicines (58%) -> Stroke Dash: 58% of 377 = 218.66 */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="transparent"
                      stroke="#005CB9"
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
                      <span className="w-2.5 h-2.5 rounded-full bg-[#005CB9]" />
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
            <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Bookings
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMenu('lab-bookings')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View All
                </button>
              </div>

              {/* Recent Bookings Table */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[540px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-slate-100 pb-2.5">
                      <th className="py-2.5 px-2 sm:px-0 font-bold">Booking ID</th>
                      <th className="py-2.5 px-2 sm:px-0 font-bold">Patient</th>
                      <th className="py-2.5 px-2 sm:px-0 font-bold">Test / Package</th>
                      <th className="py-2.5 px-2 sm:px-0 font-bold">Type</th>
                      <th className="py-2.5 px-2 sm:px-0 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminBookings.slice(0, 4).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-2 sm:px-0 font-semibold text-slate-800">
                          {b.id}
                        </td>
                        <td className="py-3 px-2 sm:px-0">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{b.patient}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-0 text-slate-700">
                          {b.test}
                        </td>
                        <td className="py-3 px-2 sm:px-0 text-slate-600">
                          {b.type}
                        </td>
                        <td className="py-3 px-2 sm:px-0 text-center">
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
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-[#005CB9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Low Stock Medicines
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMenu('inventory')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View All
                </button>
              </div>

              {/* Low Stock Table */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[260px] text-left border-collapse text-xs">
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
            </>
          )}

          {/* ======================================================== */}
          {/* USERS: PATIENTS DIRECTORY                                */}
          {/* ======================================================== */}
          {activeMenu === 'users-patients' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#005CB9]" />
                    <span>Registered Patients Directory (Assam)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    4,892 verified patient accounts registered across Guwahati Hubs (Dispur, Panbazar, Ulubari, Jalukbari & Khanapara).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegisterPatientModalOpen(true)}
                  className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Patient</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">UHID</th>
                        <th className="py-3 px-4 font-bold">Patient Name</th>
                        <th className="py-3 px-4 font-bold">Contact Phone</th>
                        <th className="py-3 px-4 font-bold">Regional City</th>
                        <th className="py-3 px-4 font-bold text-center">Lab Bookings</th>
                        <th className="py-3 px-4 font-bold text-center">Medicine Orders</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patientsList.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{p.id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono">{p.phone}</td>
                          <td className="py-3.5 px-4 text-slate-700">{p.city}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-teal-600">{p.bookingsCount}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-sky-600">{p.ordersCount}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingPatient(p)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                                title="View Patient Details"
                              >
                                View Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPatient(p)}
                                className="p-1.5 bg-teal-50 hover:bg-teal-100 text-[#005CB9] rounded-lg transition"
                                title="Edit Patient Record"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingPatient(p)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                                title="Delete Patient Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          {/* USERS: LAB EXECUTIVES                                    */}
          {/* ======================================================== */}
          {activeMenu === 'users-executives' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[#005CB9]" />
                    <span>Lab Executives & Phlebotomists Roster</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Live shift tracking, cold-chain temperature telemetry & home sample collection dispatch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddExecutiveModalOpen(true)}
                  className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Executive</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {executivesList.map((ex) => (
                  <div key={ex.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 font-black flex items-center justify-center">
                          {ex.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{ex.name}</h3>
                          <span className="text-[11px] text-slate-400 font-mono">{ex.id}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {ex.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-xl text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Operating Zone:</span>
                        <strong className="text-slate-800">{ex.zone}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cold Box Temp:</span>
                        <strong className="text-teal-600 font-mono">{ex.temp} (Optimal)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tasks Today:</span>
                        <strong className="text-slate-800 font-bold">{ex.tasksToday} appointments</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Patient Rating:</span>
                        <strong className="text-amber-500 font-bold">{ex.rating}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => addToast(`Push notification & live route ping sent to ${ex.name}.`, 'info')}
                        className="flex-1 py-2 bg-slate-100 hover:bg-[#005CB9] hover:text-white rounded-xl text-xs font-bold transition text-center"
                      >
                        Assign Route / Ping
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingExecutive(ex)}
                        className="p-2 bg-teal-50 hover:bg-teal-100 text-[#005CB9] rounded-xl transition"
                        title="Edit Executive Record"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingExecutive(ex)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                        title="Remove Executive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* USERS: ADMINS                                            */}
          {/* ======================================================== */}
          {activeMenu === 'users-admins' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#005CB9]" />
                  <span>Administrative Staff & Access Roles</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  System administrators, chief pharmacists, and laboratory directors with cryptographic access keys.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {adminsList.map((adm) => (
                  <div key={adm.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 font-black flex items-center justify-center">
                        {adm.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{adm.name}</h3>
                        <p className="text-xs text-teal-600 font-semibold">{adm.role}</p>
                      </div>
                    </div>
                    <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl text-slate-600">
                      <div>Email: <strong className="text-slate-800">{adm.email}</strong></div>
                      <div>Privileges: <strong className="text-slate-800">{adm.access}</strong></div>
                      <div className="text-emerald-600 font-semibold mt-1">✓ 2FA Hardware Key Active</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MEDICINES: ALL PRODUCTS                                  */}
          {/* ======================================================== */}
          {(activeMenu === 'medicines' || activeMenu === 'medicines-all') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Pill className="w-6 h-6 text-[#005CB9]" />
                    <span>Pharmacy Inventory Catalog</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Central pharmaceutical warehouse stocks, batch numbers, and reorder levels (Dispur Hub).
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadInventoryOpen(true)}
                    className="bg-teal-50 hover:bg-teal-100 text-[#005CB9] border border-teal-200/80 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Inventory (CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('medicines-add')}
                    className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Medicine</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Medicine</th>
                        <th className="py-3 px-4 font-bold">Generic Name</th>
                        <th className="py-3 px-4 font-bold">Category</th>
                        <th className="py-3 px-4 font-bold text-center">Current Stock</th>
                        <th className="py-3 px-4 font-bold">Price (₹)</th>
                        <th className="py-3 px-4 font-bold">Batch / Expiry</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminMedicines.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                          <td className="py-3 px-4 text-slate-600">{m.genericName}</td>
                          <td className="py-3 px-4 text-slate-700">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{m.categoryName}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              m.stock <= (m.threshold || 50) ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {m.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900">₹{m.price}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{m.batchNo || 'B-902'} • {m.expiry}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminMedicines((prev) =>
                                  prev.map((it) => (it.id === m.id ? { ...it, stock: it.stock + 100 } : it))
                                );
                                addToast(`Restocked +100 units for ${m.name}`, 'success');
                              }}
                              className="px-2.5 py-1 bg-teal-50 text-[#005CB9] hover:bg-[#005CB9] hover:text-white rounded-lg text-xs font-bold transition mr-2"
                            >
                              +100 Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminMedicines((prev) => prev.filter((it) => it.id !== m.id));
                                addToast(`Removed ${m.name} from active inventory`, 'info');
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          {/* MEDICINES: CATEGORIES                                    */}
          {/* ======================================================== */}
          {activeMenu === 'medicines-categories' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-6 h-6 text-[#005CB9]" />
                  <span>Pharmaceutical Categories</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage inventory classifications, prescription enforcement & storage temperatures.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'General Medicines', count: 420, valuation: '₹4,85,000', icon: Pill },
                  { name: 'Diabetes Care', count: 185, valuation: '₹3,20,000', icon: Activity },
                  { name: 'Cardiac & BP', count: 210, valuation: '₹5,40,000', icon: ShieldCheck },
                  { name: 'Vitamins & Supplements', count: 340, valuation: '₹2,90,000', icon: Package },
                  { name: 'Antibiotics & Anti-Infectives', count: 120, valuation: '₹3,80,000', icon: FileCheck },
                  { name: 'Diagnostic Devices', count: 45, valuation: '₹1,50,000', icon: FlaskConical }
                ].map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                          <span className="text-xs text-slate-400 font-mono">{c.count} items in stock</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                        <span className="text-slate-500">Inventory Valuation:</span>
                        <strong className="text-slate-900 font-bold">{c.valuation}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu('medicines-all');
                          addToast(`Filtered inventory by ${c.name}`, 'info');
                        }}
                        className="w-full py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded-xl text-xs font-bold transition text-center"
                      >
                        View Category Items
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MEDICINES: ADD MEDICINE                                  */}
          {/* ======================================================== */}
          {activeMenu === 'medicines-add' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Plus className="w-6 h-6 text-[#005CB9]" />
                  <span>Add New Medicine to Pharmacy</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Register a new pharmaceutical product with NABL drug approval codes.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-2xl space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newMedForm.name) {
                      addToast('Please provide a medicine brand name', 'error');
                      return;
                    }
                    const newMed = {
                      id: `med-custom-${Date.now()}`,
                      name: newMedForm.name,
                      genericName: newMedForm.genericName || 'Active Salt IP',
                      categoryName: newMedForm.categoryName,
                      stock: Number(newMedForm.stock) || 100,
                      threshold: 40,
                      price: Number(newMedForm.price) || 50,
                      expiry: newMedForm.expiry || 'Dec 2027',
                      batchNo: `B-${Math.floor(100 + Math.random() * 900)}`
                    };
                    setAdminMedicines((prev) => [newMed, ...prev]);
                    addToast(`Medicine ${newMed.name} registered into central inventory!`, 'success');
                    setActiveMenu('medicines-all');
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Brand Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dolo 650 Tablets"
                        value={newMedForm.name}
                        onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#005CB9]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Generic Name / Composition</label>
                      <input
                        type="text"
                        placeholder="e.g. Paracetamol IP 650mg"
                        value={newMedForm.genericName}
                        onChange={(e) => setNewMedForm({ ...newMedForm, genericName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#005CB9]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Category</label>
                      <select
                        value={newMedForm.categoryName}
                        onChange={(e) => setNewMedForm({ ...newMedForm, categoryName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#005CB9] bg-white"
                      >
                        <option>General Medicines</option>
                        <option>Diabetes Care</option>
                        <option>Cardiac & BP</option>
                        <option>Vitamins & Supplements</option>
                        <option>Antibiotics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Stock Quantity (Units)</label>
                      <input
                        type="number"
                        value={newMedForm.stock}
                        onChange={(e) => setNewMedForm({ ...newMedForm, stock: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#005CB9]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        value={newMedForm.price}
                        onChange={(e) => setNewMedForm({ ...newMedForm, price: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#005CB9]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Dec 2027"
                        value={newMedForm.expiry}
                        onChange={(e) => setNewMedForm({ ...newMedForm, expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#005CB9]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#005CB9] hover:bg-[#004C99] text-white font-bold rounded-xl shadow-xs transition"
                    >
                      Save to Inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMenu('medicines-all')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* DIAGNOSTIC TESTS CATALOG                                 */}
          {/* ======================================================== */}
          {activeMenu === 'diagnostic-tests' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-[#005CB9]" />
                    <span>Diagnostic Pathology Tests Catalog</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage 56+ diagnostic tests, home collection parameters, and NABL pricing across Assam.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadPackagesOpen(true)}
                    className="bg-teal-50 hover:bg-teal-100 text-[#005CB9] border border-teal-200/80 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Packages (CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddTestModalOpen(true)}
                    className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Test</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Test Name</th>
                        <th className="py-3 px-4 font-bold">Sample</th>
                        <th className="py-3 px-4 font-bold">Category</th>
                        <th className="py-3 px-4 font-bold">Turnaround</th>
                        <th className="py-3 px-4 font-bold">Fasting</th>
                        <th className="py-3 px-4 font-bold">Price</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {testsList.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{t.sampleType}</td>
                          <td className="py-3 px-4 text-slate-700">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">{t.categoryName || t.category}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{t.turnaroundTime || '24 Hours'}</td>
                          <td className="py-3 px-4">
                            {t.fastingRequired ? (
                              <span className="text-amber-600 font-bold">Yes (8-10 hrs)</span>
                            ) : (
                              <span className="text-slate-400">Not required</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900">₹{t.price}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => addToast(`Price configuration for ${t.name} updated.`, 'success')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#005CB9] hover:text-white rounded-lg text-xs font-semibold transition"
                            >
                              Edit Price
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
          {/* LAB BOOKINGS CENTRAL MANAGER                             */}
          {/* ======================================================== */}
          {activeMenu === 'lab-bookings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#005CB9]" />
                    <span>Central Diagnostic & Home Collection Bookings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage appointments, assign field phlebotomists, and monitor sample statuses.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Booking ID</th>
                        <th className="py-3 px-4 font-bold">Patient</th>
                        <th className="py-3 px-4 font-bold">Test</th>
                        <th className="py-3 px-4 font-bold">Type</th>
                        <th className="py-3 px-4 font-bold">Executive</th>
                        <th className="py-3 px-4 font-bold">Slot</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{b.patient}</td>
                          <td className="py-3.5 px-4 text-slate-700">{b.test}</td>
                          <td className="py-3.5 px-4 text-slate-600">{b.type}</td>
                          <td className="py-3.5 px-4 font-medium text-teal-700">{b.executive || 'Unassigned'}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{b.slot}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${b.statusBg}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus =
                                  b.status === 'Confirmed'
                                    ? 'Sample Collected'
                                    : b.status === 'Sample Collected'
                                    ? 'In Process'
                                    : b.status === 'In Process'
                                    ? 'Report Ready'
                                    : 'Confirmed';
                                setAdminBookings((prev) =>
                                  prev.map((it) => (it.id === b.id ? { ...it, status: nextStatus } : it))
                                );
                                addToast(`Booking ${b.id} advanced to ${nextStatus}`, 'success');
                              }}
                              className="px-2.5 py-1 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                              Advance Status
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
          {/* ORDERS MANAGER                                           */}
          {/* ======================================================== */}
          {activeMenu === 'orders' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#005CB9]" />
                  <span>Customer Pharmacy Orders & Deliveries</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Express doorstep deliveries across Assam hubs with cold-chain verification.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Order ID</th>
                        <th className="py-3 px-4 font-bold">Customer</th>
                        <th className="py-3 px-4 font-bold">Items</th>
                        <th className="py-3 px-4 font-bold">Total</th>
                        <th className="py-3 px-4 font-bold">Payment</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            <div>{o.customer}</div>
                            <span className="text-[10px] text-slate-400">{o.address}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">{o.items}</td>
                          <td className="py-3.5 px-4 font-black text-slate-900">₹{o.total}</td>
                          <td className="py-3.5 px-4 text-slate-600">{o.payment}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus =
                                  o.status === 'Processing'
                                    ? 'Dispatched'
                                    : o.status === 'Dispatched'
                                    ? 'Out for Delivery'
                                    : o.status === 'Out for Delivery'
                                    ? 'Delivered'
                                    : 'Processing';
                                setAdminOrders((prev) =>
                                  prev.map((it) => (it.id === o.id ? { ...it, status: nextStatus } : it))
                                );
                                addToast(`Order ${o.id} updated to ${nextStatus}`, 'success');
                              }}
                              className="px-2.5 py-1 bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white rounded-lg text-xs font-bold transition mr-2"
                            >
                              Update Status
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
          {/* PRESCRIPTIONS QUEUE                                      */}
          {/* ======================================================== */}
          {activeMenu === 'prescriptions' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#005CB9]" />
                  <span>Chief Pharmacist Prescription Verification</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mandatory regulatory review of digital doctor prescriptions before pharmacy fulfillment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prescriptionsList.map((rx) => (
                  <div key={rx.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-teal-600">{rx.id}</span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rx.patient}</h3>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        rx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {rx.status}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl text-slate-600">
                      <div>Doctor: <strong className="text-slate-800">{rx.doctor}</strong></div>
                      <div>Uploaded: <span className="text-slate-500 font-mono">{rx.date}</span></div>
                      <div className="pt-1">Rx Medicines: <strong className="text-slate-800">{rx.items}</strong></div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPrescriptionsList((prev) =>
                            prev.map((it) => (it.id === rx.id ? { ...it, status: 'Approved' } : it))
                          );
                          addToast(`Prescription ${rx.id} approved! Order created for ${rx.patient}.`, 'success');
                        }}
                        className="flex-1 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-xl text-xs font-bold transition text-center shadow-xs"
                      >
                        Approve & Dispense
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPrescriptionsList((prev) => prev.filter((it) => it.id !== rx.id));
                          addToast(`Prescription ${rx.id} rejected with notice to patient.`, 'info');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-semibold transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* INVENTORY WAREHOUSE MANAGER                              */}
          {/* ======================================================== */}
          {activeMenu === 'inventory' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Layers className="w-6 h-6 text-[#005CB9]" />
                    <span>Central Warehouse Stock & Reorder Levels</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Automated low-stock threshold monitoring for Assam regional hubs.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadInventoryOpen(true)}
                    className="bg-teal-50 hover:bg-teal-100 text-[#005CB9] border border-teal-200/80 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Inventory (CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminMedicines((prev) => prev.map((m) => ({ ...m, stock: m.stock + 200 })));
                      addToast('Bulk Restock purchase order issued to manufacturers (+200 all items)!', 'success');
                    }}
                    className="bg-[#005CB9] hover:bg-[#004C99] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition shrink-0 self-start sm:self-auto"
                  >
                    Bulk Restock All
                  </button>
                </div>
              </div>

              {/* Alert box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-amber-800">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span><strong>Stock Warning:</strong> 3 medicines have dropped below safe threshold (Cetirizine 10mg, Metformin 500mg, Amoxicillin 250mg).</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Item Name</th>
                        <th className="py-3 px-4 font-bold">Rack Location</th>
                        <th className="py-3 px-4 font-bold text-center">Current Stock</th>
                        <th className="py-3 px-4 font-bold text-center">Safety Threshold</th>
                        <th className="py-3 px-4 font-bold text-right">Quick Restock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminMedicines.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{m.rackLocation || 'WH-GUW-01'}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{m.stock}</td>
                          <td className="py-3 px-4 text-center font-mono text-slate-500">{m.threshold || 50}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminMedicines((prev) =>
                                  prev.map((it) => (it.id === m.id ? { ...it, stock: it.stock + 100 } : it))
                                );
                                addToast(`+100 units added to ${m.name}`, 'success');
                              }}
                              className="px-3 py-1 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                              Restock +100
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
          {/* PAYMENTS & RAZORPAY GATEWAY LEDGER                       */}
          {/* ======================================================== */}
          {activeMenu === 'payments' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#005CB9]" />
                    <span>Razorpay Gateway Integration & Revenue Ledger</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Razorpay Healthcare Merchant ID: <strong className="font-mono text-slate-800">acc_ZM_GUW_2026</strong> • Settlement A/C: HDFC Bank, GS Road Branch, Guwahati.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRazorpayLiveMode(!isRazorpayLiveMode);
                      addToast(
                        isRazorpayLiveMode
                          ? 'Switched to Razorpay Sandbox Test Mode'
                          : 'Switched to Razorpay Live Production Mode (Documents Verified)',
                        'info'
                      );
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                      isRazorpayLiveMode
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isRazorpayLiveMode ? '● Mode: Live Production' : '● Mode: Sandbox Test'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addToast('Downloading GST audited financial statement CSV...', 'info')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Statement</span>
                  </button>
                </div>
              </div>

              {/* SECTION: RAZORPAY BUSINESS DOCUMENTS & REGULATORY COMPLIANCE */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#005CB9]" />
                      <h3 className="text-base font-bold text-slate-900">
                        Mandatory Statutory Business Documents for Razorpay Healthcare Activation
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        8 / 8 Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Required by RBI Payment Aggregator Guidelines & Drugs and Cosmetics Act for pharmaceutical and diagnostic collections in Assam.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToast('Regulatory KYC Dossier refreshed with Assam Licensing Authorities', 'success')}
                    className="text-xs text-[#005CB9] font-bold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Verification</span>
                  </button>
                </div>

                {/* Documents Table / Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Document Title</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Registration / License #</th>
                        <th className="py-2.5 px-3">Mandatory For</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {razorpayDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            <div>{doc.title}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.file}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{doc.category}</td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-700">{doc.docNumber}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">{doc.mandatoryFor}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{doc.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => addToast(`Opening statutory document preview: ${doc.title}`, 'info')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-[#005CB9] text-slate-700 rounded-lg text-[11px] font-bold transition shadow-2xs"
                            >
                              View Doc
                            </button>
                            <button
                              type="button"
                              onClick={() => addToast(`Re-upload prompt for ${doc.title}`, 'info')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition shadow-2xs"
                            >
                              Re-upload
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* API Credentials Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800">Razorpay API Credentials (Guwahati Central Node):</span>
                    <div className="flex flex-wrap items-center gap-3 text-slate-600 font-mono text-[11px]">
                      <span>Key ID: <strong>rzp_test_GuwahatiCentral2026</strong></span>
                      <span>•</span>
                      <span>
                        Key Secret:{' '}
                        <strong>{showRazorpaySecret ? 'sk_live_98ab7100guw_zest' : '••••••••••••••••'}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 transition"
                    >
                      {showRazorpaySecret ? 'Hide Secret' : 'Reveal Secret'}
                    </button>
                    <button
                      type="button"
                      onClick={() => addToast('Razorpay webhook verified on https://api.zestmed.in/razorpay/webhook', 'success')}
                      className="px-3 py-1.5 bg-[#005CB9] text-white hover:bg-[#004C99] rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Test Webhook
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial Transactions & Revenue Ledger Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recent Customer Transactions</h3>
                  <span className="text-xs text-slate-500">Auto-Reconciled</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Transaction ID</th>
                        <th className="py-3 px-4 font-bold">Reference</th>
                        <th className="py-3 px-4 font-bold">Customer</th>
                        <th className="py-3 px-4 font-bold">Payment Mode</th>
                        <th className="py-3 px-4 font-bold">Date & Time</th>
                        <th className="py-3 px-4 font-bold">Amount</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentsList.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tx.id}</td>
                          <td className="py-3.5 px-4 font-mono text-teal-600">{tx.ref}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">{tx.customer}</td>
                          <td className="py-3.5 px-4 text-slate-600">{tx.method}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{tx.date}</td>
                          <td className="py-3.5 px-4 font-black text-slate-900">₹{tx.amount}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              {tx.status}
                            </span>
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
          {/* REPORTS & ANALYTICS                                      */}
          {/* ======================================================== */}
          {activeMenu === 'analytics' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <BarChart2 className="w-6 h-6 text-[#005CB9]" />
                  <span>Executive Clinical & Revenue Analytics</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Quarterly performance review for Guwahati Central Diagnostics & Polyclinic Hub operations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Average Order Value</span>
                  <div className="text-2xl font-black text-slate-900">₹742.50</div>
                  <span className="text-xs text-emerald-600 font-bold">↑ +14.8% vs last month</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Diagnostic Fulfillment Rate</span>
                  <div className="text-2xl font-black text-slate-900">99.2%</div>
                  <span className="text-xs text-emerald-600 font-bold">Cold chain compliance 100%</span>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Active Assam Pin Codes</span>
                  <div className="text-2xl font-black text-slate-900">142</div>
                  <span className="text-xs text-teal-600 font-bold">8 Dedicated Hubs Online</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* NOTIFICATIONS FEED                                       */}
          {/* ======================================================== */}
          {activeMenu === 'notifications' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Bell className="w-6 h-6 text-[#005CB9]" />
                    <span>System Alerts & Operations Feed</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Live notifications across cold-chain, delivery riders, and laboratory testing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('All system notifications marked as resolved.', 'success')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 self-start sm:self-auto"
                >
                  Mark All Resolved
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                {notificationsList.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{n.text}</p>
                      <span className="text-slate-400 font-mono text-[10px] mt-1 block">{n.time}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SETTINGS                                                 */}
          {/* ======================================================== */}
          {activeMenu === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Settings className="w-6 h-6 text-[#005CB9]" />
                  <span>Platform & Regional Settings</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure delivery radius, phlebotomist emergency dispatch, and tax calculations.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-2xl space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Company Legal Entity</label>
                    <input
                      type="text"
                      defaultValue="ZESTMED Health Private Limited"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Assam GSTIN</label>
                    <input
                      type="text"
                      defaultValue="18AAACZ9901M1ZT"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Drug License Numbers</label>
                    <input
                      type="text"
                      defaultValue="AS-KAM-DL-88421 / 88422"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Central Laboratory Hub</label>
                    <input
                      type="text"
                      defaultValue="GS Road, Dispur, Guwahati - 781005"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => addToast('Platform and regional operational settings saved!', 'success')}
                    className="px-5 py-2.5 bg-[#005CB9] hover:bg-[#004C99] text-white font-bold rounded-xl shadow-xs transition"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Register Patient Modal */}
      {isRegisterPatientModalOpen && (
        <RegisterPatientModal
          isOpen={isRegisterPatientModalOpen}
          onClose={() => setIsRegisterPatientModalOpen(false)}
          onRegisterPatient={(newPat) => {
            setPatientsList((prev) => [newPat, ...prev]);
            setIsRegisterPatientModalOpen(false);
          }}
        />
      )}

      {/* Add Diagnostic Test Modal */}
      {isAddTestModalOpen && (
        <AddDiagnosticTestModal
          isOpen={isAddTestModalOpen}
          onClose={() => setIsAddTestModalOpen(false)}
          onAddTest={(newTest) => {
            setTestsList((prev) => [newTest, ...prev]);
            setIsAddTestModalOpen(false);
          }}
        />
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <EditPatientModal
          isOpen={!!editingPatient}
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSavePatient={(updated) => {
            setPatientsList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            setEditingPatient(null);
          }}
        />
      )}

      {/* Delete Patient Confirmation Modal */}
      {deletingPatient && (
        <DeletePatientModal
          isOpen={!!deletingPatient}
          patient={deletingPatient}
          onClose={() => setDeletingPatient(null)}
          onConfirmDelete={(patientId) => {
            setPatientsList((prev) => prev.filter((item) => item.id !== patientId));
            setDeletingPatient(null);
          }}
        />
      )}

      {/* View Patient Details Modal */}
      {viewingPatient && (
        <ViewPatientModal
          isOpen={!!viewingPatient}
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
          onEdit={(patient) => setEditingPatient(patient)}
        />
      )}

      {/* Add Executive Modal */}
      {isAddExecutiveModalOpen && (
        <AddExecutiveModal
          isOpen={isAddExecutiveModalOpen}
          onClose={() => setIsAddExecutiveModalOpen(false)}
          onAddExecutive={(newExec) => {
            setExecutivesList((prev) => [newExec, ...prev]);
            setIsAddExecutiveModalOpen(false);
          }}
        />
      )}

      {/* Edit Executive Modal */}
      {editingExecutive && (
        <EditExecutiveModal
          isOpen={!!editingExecutive}
          executive={editingExecutive}
          onClose={() => setEditingExecutive(null)}
          onSaveExecutive={(updated) => {
            setExecutivesList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            setEditingExecutive(null);
          }}
        />
      )}

      {/* Delete Executive Modal */}
      {deletingExecutive && (
        <DeleteExecutiveModal
          isOpen={!!deletingExecutive}
          executive={deletingExecutive}
          onClose={() => setDeletingExecutive(null)}
          onConfirmDelete={(execId) => {
            setExecutivesList((prev) => prev.filter((item) => item.id !== execId));
            setDeletingExecutive(null);
          }}
        />
      )}

      {/* Bulk Upload Medicine Inventory Modal */}
      {isUploadInventoryOpen && (
        <UploadInventoryModal
          isOpen={isUploadInventoryOpen}
          onClose={() => setIsUploadInventoryOpen(false)}
          onImportSuccess={(importedRows) => {
            setAdminMedicines((prev) => [...importedRows, ...prev]);
            addToast(`${importedRows.length} items added to warehouse stock!`, 'success');
          }}
        />
      )}

      {/* Bulk Upload Diagnostic Tests / Packages Modal */}
      {isUploadPackagesOpen && (
        <UploadPackagesModal
          isOpen={isUploadPackagesOpen}
          onClose={() => setIsUploadPackagesOpen(false)}
          onImportSuccess={(importedRows) => {
            setTestsList((prev) => [...importedRows, ...prev]);
            addToast(`${importedRows.length} diagnostic packages added to active catalog!`, 'success');
          }}
        />
      )}
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
