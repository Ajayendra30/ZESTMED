// src/pages/AdminDashboardPage.jsx
// Redesigned to match the exact ZESTMED Admin Dashboard specification pixel-for-pixel
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getSubdomainUrl } from '../utils/subdomain';
import {
  getDoctorAppointments,
  getPhysioBookings,
  getSurgeryBookings,
  getWellnessBookings,
  getLabBookings,
  getMedicineOrders,
  getPaymentTransactions,
  getLabExecutives,
  getAllPatients,
  deletePatientProfile,
  deleteLabExecutive,
  updateDoctorAppointmentStatus,
  updatePhysioStatus,
  updateSurgeryStatus,
  updateWellnessStatus,
  updateLabBookingStatus,
  updateOrderStatus,
  isDemoBooking
} from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { 
  getAllPrescriptions, 
  updatePrescriptionStatus, 
  deletePrescription, 
  downloadPrescriptionFile 
} from '../services/prescriptionService';
import {
  LayoutGrid,
  UserPlus,
  CalendarPlus,
  Zap,
  Menu,
  Search,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  FileSpreadsheet,
  Stethoscope,
  Scissors,
  Heart,
  Filter,
  Star,
  Tag,
  LifeBuoy,
  Sparkles,
  Image,
  Target,
  Thermometer,
  Building2,
  Droplet,
  Syringe,
  SquarePlus,
  HeartPulse,
  FileCheck2,
  Gift,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initialInventoryMedicines, initialAdminProfile } from '../mock-data/adminData';
import { MOCK_DIAGNOSTIC_TESTS } from '../mock-data/diagnosticTests';
import { getSynchronizedLabTests, fetchSynchronizedLabTests, saveLabTest, deleteLabTest } from '../services/labTestService';
import { initialPhlebotomyJobs } from '../mock-data/labExecutiveData';
import { initialPatientOrders, initialPatientLabBookings, initialPatientAppointments } from '../mock-data/patientData';
import { getRegisteredPatient, normalizePhone, deleteRegisteredPatient } from '../utils/patientRegistry';
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
import DigitalLabReportModal from '../components/DigitalLabReportModal';
import OrderInvoiceModal from '../components/OrderInvoiceModal';
import EditDiagnosticTestModal from '../components/EditDiagnosticTestModal';
import AddAdminModal from '../components/AddAdminModal';
import EditAdminModal from '../components/EditAdminModal';
import AddMedicineModal from '../components/AddMedicineModal';
import EditMedicineModal from '../components/EditMedicineModal';
import AddCategoryModal from '../components/AddCategoryModal';
import { getSynchronizedMedicines, fetchSynchronizedMedicines, saveMedicine, deleteMedicine, uploadMedicineImage } from '../services/medicineService';
import AuditPrescriptionModal from '../components/AuditPrescriptionModal';
import NotificationPopover from '../components/NotificationPopover';
import { playNotificationSound } from '../utils/notificationSound';
import { fetchAdminNotifications, subscribeToNotifications } from '../services/notificationService';
import { openStatutoryDocumentPdf, downloadStatutoryDocumentPdf, downloadOrderInvoicePdf, openClinicalReportPdf } from '../utils/pdfGenerator';
import BookingsManagementView from '../components/admin/BookingsManagementView';
import DoctorManagementView from '../components/admin/DoctorManagementView';
import ReportsManagementView from '../components/admin/ReportsManagementView';
import NotificationsCenterView from '../components/admin/NotificationsCenterView';
import ReviewsFeedbackView from '../components/admin/ReviewsFeedbackView';
import SupportComplaintsView from '../components/admin/SupportComplaintsView';
import { fetchSupportTickets } from '../services/supportService';
import { fetchReviews } from '../services/reviewService';
import { fetchAuditLogs, recordAuditLog } from '../services/auditLogService';
import CouponsDiscountsView from '../components/admin/CouponsDiscountsView';
import BannerContentView from '../components/admin/BannerContentView';
import SecurityAuditLogsView from '../components/admin/SecurityAuditLogsView';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Helper to resolve active menu from path or search query
  const resolveMenu = (pathname = '', search = '') => {
    if (pathname) {
      const match = pathname.match(/^\/admin\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    const params = new URLSearchParams(search);
    const tab = params.get('tab') || params.get('menu');
    if (tab && tab !== 'notifications') return tab;
    try {
      const saved = sessionStorage.getItem('zestmed_admin_active_tab');
      if (saved && saved !== 'notifications' && saved !== 'coupons' && saved !== 'banner' && saved !== 'coupons-discounts') {
        return saved;
      }
    } catch (_) {}
    return 'dashboard';
  };

  const [activeMenu, setActiveMenu] = useState(() => resolveMenu(typeof window !== 'undefined' ? window.location.pathname : '', typeof window !== 'undefined' ? window.location.search : ''));

  // Sync activeMenu with route changes
  useEffect(() => {
    const target = resolveMenu(location.pathname, location.search);
    if (target && target !== activeMenu) {
      setActiveMenu(target);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    try {
      sessionStorage.setItem('zestmed_admin_active_tab', activeMenu);
    } catch (_) {}
  }, [activeMenu]);

  // Collapsible sidebar sections (all 7 sections expanded by default)
  const [collapsedSections, setCollapsedSections] = useState({
    mainMenu: false,
    serviceManagement: false,
    operations: false,
    healthcareRecords: false,
    communication: false,
    marketing: false,
    reportsConfig: false
  });

  const toggleSidebarSection = (sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleNavigateMenu = (menuKey) => {
    setActiveMenu(menuKey);
    setIsSidebarOpen(false);
    navigate(`/admin/${menuKey}`);
    try {
      sessionStorage.setItem('zestmed_admin_active_tab', menuKey);
    } catch (_) {}
  };

  const isMenuActive = (menuKey, aliases = []) => {
    if (activeMenu === menuKey) return true;
    if (aliases && aliases.includes(activeMenu)) return true;
    return false;
  };

  const handleViewBookingDetail = (booking, serviceType) => {
    setViewingDetailItem({
      id: booking?.bookingRef || booking?.id || booking?.appointment_number || booking?.booking_number || 'BK-REF',
      bookingRef: booking?.bookingRef || booking?.id || booking?.appointment_number || booking?.booking_number || 'BK-REF',
      patientName: booking?.patientName || booking?.patient_name || 'Patient',
      patientPhone: booking?.patientPhone || booking?.phone || '',
      serviceType: serviceType || booking?.serviceType || 'Service',
      itemTitle: booking?.details || booking?.testName || booking?.doctor || booking?.surgeryName || booking?.packageName || booking?.condition || 'Healthcare Service',
      itemSubtitle: booking?.subDetails || booking?.hospital || booking?.facility || 'Guwahati Service Hub',
      schedule: `${booking?.date || booking?.collectionDate || 'Scheduled'} (${booking?.time || booking?.collectionSlot || 'Slot'})`,
      amount: booking?.amount || booking?.fee || booking?.price || 0,
      status: booking?.status || 'Confirmed',
      raw: booking
    });
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsersExpanded, setIsUsersExpanded] = useState(true);
  const [isMedicinesExpanded, setIsMedicinesExpanded] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Dynamic Month Selection State (Defaults automatically to current calendar month & year)
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const selectedYear = selectedMonthDate.getFullYear();
  const selectedMonthIndex = selectedMonthDate.getMonth();
  const selectedMonthLong = selectedMonthDate.toLocaleDateString('en-US', { month: 'long' });
  const selectedMonthShort = selectedMonthDate.toLocaleDateString('en-US', { month: 'short' });
  const daysInSelectedMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();

  const handlePrevMonth = () => {
    setSelectedMonthDate((prev) => {
      const d = new Date(prev);
      d.setDate(1);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonthDate((prev) => {
      const d = new Date(prev);
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleSelectMonth = (monthIdx, year = selectedYear) => {
    const d = new Date(year, monthIdx, 1);
    setSelectedMonthDate(d);
  };
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHeaderQuickActionsOpen, setIsHeaderQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);
  const [testsList, setTestsList] = useState(() => getSynchronizedLabTests());
  const [labTestSearchQuery, setLabTestSearchQuery] = useState('');
  const [labTestFilterCategory, setLabTestFilterCategory] = useState('all');
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [auditLogsCount, setAuditLogsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const syncAuditCount = async () => {
      try {
        const list = await fetchAuditLogs();
        if (isMounted) {
          setAuditLogsCount((list || []).length);
        }
      } catch (_) {}
    };
    syncAuditCount();
    window.addEventListener('zestmed_audit_log_created', syncAuditCount);
    window.addEventListener('storage', syncAuditCount);
    return () => {
      isMounted = false;
      window.removeEventListener('zestmed_audit_log_created', syncAuditCount);
      window.removeEventListener('storage', syncAuditCount);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const syncReviewsCount = async () => {
      try {
        const list = await fetchReviews();
        if (isMounted) {
          setReviewsCount((list || []).length);
        }
      } catch (_) {}
    };
    syncReviewsCount();
    window.addEventListener('zestmed_review_created', syncReviewsCount);
    window.addEventListener('zestmed_review_updated', syncReviewsCount);
    window.addEventListener('storage', syncReviewsCount);
    return () => {
      isMounted = false;
      window.removeEventListener('zestmed_review_created', syncReviewsCount);
      window.removeEventListener('zestmed_review_updated', syncReviewsCount);
      window.removeEventListener('storage', syncReviewsCount);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const syncTicketsCount = async () => {
      try {
        const list = await fetchSupportTickets();
        if (isMounted) {
          const openCount = (list || []).filter(t => t.status === 'Open' || t.status === 'In Progress').length;
          setOpenTicketsCount(openCount);
        }
      } catch (_) {}
    };
    syncTicketsCount();
    window.addEventListener('zestmed_support_ticket_created', syncTicketsCount);
    window.addEventListener('zestmed_ticket_updated', syncTicketsCount);
    window.addEventListener('storage', syncTicketsCount);
    return () => {
      isMounted = false;
      window.removeEventListener('zestmed_support_ticket_created', syncTicketsCount);
      window.removeEventListener('zestmed_ticket_updated', syncTicketsCount);
      window.removeEventListener('storage', syncTicketsCount);
    };
  }, []);

  useEffect(() => {
    fetchSynchronizedLabTests().then((synced) => {
      if (Array.isArray(synced) && synced.length > 0) {
        setTestsList(synced);
      }
    });

    const handleSync = () => {
      setTestsList(getSynchronizedLabTests());
    };
    window.addEventListener('zestmed_lab_tests_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('zestmed_lab_tests_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const [isAddTestModalOpen, setIsAddTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [isRegisterPatientModalOpen, setIsRegisterPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [isAddExecutiveModalOpen, setIsAddExecutiveModalOpen] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState(null);
  const [deletingExecutive, setDeletingExecutive] = useState(null);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [auditingRx, setAuditingRx] = useState(null);
  const [medicineFilterCategory, setMedicineFilterCategory] = useState('all');
  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');

  // Bulk Upload Modals for Inventory & Packages
  const [isUploadInventoryOpen, setIsUploadInventoryOpen] = useState(false);
  const [isUploadPackagesOpen, setIsUploadPackagesOpen] = useState(false);

  // Generic CSV Downloader
  const downloadCsv = (filename, headers, rows) => {
    try {
      const csvContent = 'data:text/csv;charset=utf-8,' + [
        headers.join(','),
        ...rows.map(r => r.map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`Exported ${rows.length} records to ${filename}`, 'success');
    } catch (err) {
      console.error('CSV Export Error:', err);
      addToast('Failed to export CSV', 'error');
    }
  };

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


  // Interactive Management States
  const [isClinicalExpanded, setIsClinicalExpanded] = useState(true);
  const [isDiagnosticsExpanded, setIsDiagnosticsExpanded] = useState(true);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');
  const [viewingDetailItem, setViewingDetailItem] = useState(null);
  const [viewingOrderModal, setViewingOrderModal] = useState(null);
  const [viewingReportBooking, setViewingReportBooking] = useState(null);
  const [isAddMedicineModalOpen, setIsAddMedicineModalOpen] = useState(false);

  const [adminMedicines, setAdminMedicines] = useState(() => getSynchronizedMedicines());

  useEffect(() => {
    // Initial fetch from live Supabase PostgreSQL
    fetchSynchronizedMedicines().then((liveMeds) => {
      if (Array.isArray(liveMeds) && liveMeds.length > 0) {
        setAdminMedicines(liveMeds);
      }
    });

    const handleSync = () => {
      setAdminMedicines(getSynchronizedMedicines());
    };
    window.addEventListener('zestmed_medicines_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('zestmed_medicines_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Clean zero baseline version key to purge existing test/mock data
  const ADMIN_CLEAN_VERSION_KEY = 'zestmed_admin_clean_baseline_v6';

  // 1. Clinical Appointments (Doctor Consultations, Physiotherapy, Surgery Packages)
  const [appointmentsList, setAppointmentsList] = useState(() => {
    try {
      if (!localStorage.getItem(ADMIN_CLEAN_VERSION_KEY)) {
        localStorage.setItem(ADMIN_CLEAN_VERSION_KEY, 'true');
        localStorage.setItem('patient_appointments', JSON.stringify([]));
        localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify([]));
        localStorage.setItem('zestmed_patient_orders', JSON.stringify([]));
        localStorage.setItem('zestmed_payment_transactions', JSON.stringify([]));
        localStorage.setItem('zestmed_admin_patients', JSON.stringify([]));
        return [];
      }
      const saved = localStorage.getItem('patient_appointments');
      return saved ? JSON.parse(saved).filter(a => !isDemoBooking(a)) : [];
    } catch {
      return [];
    }
  });

  // 2. Diagnostic Lab Bookings & Wellness Packages
  const [labBookingsList, setLabBookingsList] = useState(() => {
    try {
      if (!localStorage.getItem(ADMIN_CLEAN_VERSION_KEY)) return [];
      const saved = localStorage.getItem('zestmed_patient_lab_bookings');
      return saved ? JSON.parse(saved).filter(b => !isDemoBooking(b)) : [];
    } catch {
      return [];
    }
  });

  // 3. Customer Medicine Orders
  const [ordersList, setOrdersList] = useState(() => {
    try {
      if (!localStorage.getItem(ADMIN_CLEAN_VERSION_KEY)) return [];
      const saved = localStorage.getItem('zestmed_patient_orders');
      return saved ? JSON.parse(saved).filter(o => !isDemoBooking(o)) : [];
    } catch {
      return [];
    }
  });

  // Helper to compile and compute unified patients directory with live booking/order counts
  const computeMergedPatients = (appts, labs, ords) => {
    let deletedSet = new Set();
    try {
      const rawDeleted = localStorage.getItem('zestmed_deleted_patients');
      if (rawDeleted) {
        deletedSet = new Set(JSON.parse(rawDeleted).map((x) => String(x).toLowerCase().trim()));
      }
    } catch (_) {}

    const isExcluded = (id, phone) => {
      const idStr = String(id || '').toLowerCase().trim();
      const clean = normalizePhone(phone);
      return (idStr && deletedSet.has(idStr)) || (clean && deletedSet.has(clean));
    };

    const patientMap = new Map();

    try {
      const savedAdmin = localStorage.getItem('zestmed_admin_patients');
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin);
        if (Array.isArray(parsed)) {
          parsed.forEach((p) => {
            const clean = normalizePhone(p.phone);
            if (clean && !isExcluded(p.id, clean)) {
              const prev = patientMap.get(clean) || {};
              patientMap.set(clean, { ...prev, ...p, cleanPhone: clean });
            }
          });
        }
      }
    } catch (_) {}

    try {
      const savedReg = localStorage.getItem('zestmed_patient_registry');
      if (savedReg) {
        const parsed = JSON.parse(savedReg);
        Object.entries(parsed).forEach(([ph, data]) => {
          const clean = normalizePhone(ph);
          if (clean && data?.name && data.name !== 'Verified Patient' && !data.name.startsWith('Patient ') && !isExcluded(data?.id, clean)) {
            const prev = patientMap.get(clean) || {};
            patientMap.set(clean, {
              ...prev,
              id: data.id || prev.id || `ZM-PAT-${clean.slice(-4)}`,
              name: data.name,
              phone: `+91 ${clean}`,
              cleanPhone: clean,
              city: data.city || prev.city || 'Guwahati, Assam',
              status: 'Active'
            });
          }
        });
      }
    } catch (_) {}

    // Extract patients from bookings and orders (excluding deleted records)
    appts.forEach((a) => {
      const clean = normalizePhone(a.patientPhone || a.phone);
      const name = a.patientName ? a.patientName.replace(/\s*\(Self\)/i, '').trim() : '';
      if (clean && name && name !== 'Verified Patient' && !name.startsWith('Patient ') && !isExcluded(null, clean)) {
        if (!patientMap.has(clean)) {
          patientMap.set(clean, {
            id: `ZM-PAT-${clean.slice(-4)}`,
            name,
            phone: `+91 ${clean}`,
            cleanPhone: clean,
            city: a.hospital || a.city || 'Guwahati, Assam',
            status: 'Active'
          });
        }
      }
    });

    labs.forEach((b) => {
      const clean = normalizePhone(b.patientPhone || b.phone || b.phlebotomist?.phone);
      const name = b.patientName ? b.patientName.replace(/\s*\(Self\)/i, '').trim() : '';
      if (clean && name && name !== 'Verified Patient' && !name.startsWith('Patient ') && !isExcluded(null, clean)) {
        if (!patientMap.has(clean)) {
          patientMap.set(clean, {
            id: `ZM-PAT-${clean.slice(-4)}`,
            name,
            phone: `+91 ${clean}`,
            cleanPhone: clean,
            city: b.collectionAddress?.split(',')[0] || 'Guwahati, Assam',
            status: 'Active'
          });
        }
      }
    });

    ords.forEach((o) => {
      const clean = normalizePhone(o.phone || o.customerPhone);
      const name = o.customer || o.patientName;
      if (clean && name && name !== 'Verified Patient' && !name.startsWith('Patient ') && !isExcluded(null, clean)) {
        if (!patientMap.has(clean)) {
          patientMap.set(clean, {
            id: `ZM-PAT-${clean.slice(-4)}`,
            name,
            phone: `+91 ${clean}`,
            cleanPhone: clean,
            city: o.deliveryAddress?.split(',')[0] || 'Guwahati, Assam',
            status: 'Active'
          });
        }
      }
    });

    return Array.from(patientMap.values()).map((p) => {
      const pClean = p.cleanPhone;
      const pName = (p.name || '').toLowerCase().trim();

      const matchedAppts = appts.filter((a) => {
        const aClean = normalizePhone(a.patientPhone || a.phone);
        const aName = (a.patientName || '').toLowerCase();
        return (pClean && aClean === pClean) || (pName && aName.includes(pName));
      }).length;

      const matchedLabs = labs.filter((b) => {
        const bClean = normalizePhone(b.patientPhone || b.phone);
        const bName = (b.patientName || '').toLowerCase();
        return (pClean && bClean === pClean) || (pName && bName.includes(pName));
      }).length;

      const matchedOrders = ords.filter((o) => {
        const oClean = normalizePhone(o.phone || o.customerPhone);
        const oName = (o.customer || o.patientName || '').toLowerCase();
        return (pClean && oClean === pClean) || (pName && oName.includes(pName));
      }).length;

      return {
        ...p,
        bookingsCount: matchedAppts + matchedLabs,
        ordersCount: matchedOrders
      };
    });
  };

  const [patientsList, setPatientsList] = useState(() => {
    const rawAppts = (() => { try { const s = localStorage.getItem('patient_appointments'); return s ? JSON.parse(s) : []; } catch { return []; } })();
    const rawLabs = (() => { try { const s = localStorage.getItem('zestmed_patient_lab_bookings'); return s ? JSON.parse(s) : []; } catch { return []; } })();
    const rawOrds = (() => { try { const s = localStorage.getItem('zestmed_patient_orders'); return s ? JSON.parse(s) : []; } catch { return []; } })();
    return computeMergedPatients(rawAppts, rawLabs, rawOrds);
  });

  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Real-time synchronization across patient/user activities & live Supabase backend
  const fetchAllLiveAdminData = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const [docAppts, physioAppts, surgBookings, labBookings, wellBookings, medOrders, liveExecutives, livePatients] = await Promise.allSettled([
        getDoctorAppointments(),
        getPhysioBookings(),
        getSurgeryBookings(),
        getLabBookings(),
        getWellnessBookings(),
        getMedicineOrders(),
        getLabExecutives(),
        getAllPatients()
      ]);

      // 1. Merge Appointments
        const freshAppointments = [];
        if (docAppts.status === 'fulfilled' && Array.isArray(docAppts.value)) {
          docAppts.value.forEach((a) => {
            freshAppointments.push({
              id: a.appointment_number || a.id || `DOC-${Date.now()}`,
              bookingId: a.appointment_number || a.id,
              patientName: a.patient_name || a.patientName || 'Patient',
              patientPhone: a.phone || a.patientPhone || '',
              doctor: a.doctor_name || a.doctorName || 'Doctor',
              doctorName: a.doctor_name || a.doctorName || 'Doctor',
              specialty: a.department || a.specialty || 'General Medicine',
              hospital: a.hospital || a.clinic || 'Zestmed Polyclinic Hub, Dispur',
              date: a.appointment_date || a.date || 'Today',
              createdAt: a.created_at || a.createdAt || a.appointment_date || a.date || new Date().toISOString(),
              time: a.appointment_time || a.time || a.slot || '10:00 AM',
              mode: a.consultation_type || a.mode || 'Clinic Visit',
              fee: a.fees || a.fee || a.price || 600,
              symptoms: a.notes || a.symptoms || 'General Consultation',
              status: a.status || 'Confirmed',
              category: 'doctor',
              type: 'Doctor Consultation'
            });
          });
        }

        if (physioAppts.status === 'fulfilled' && Array.isArray(physioAppts.value)) {
          physioAppts.value.forEach((a) => {
            freshAppointments.push({
              id: a.booking_number || a.id || `PHY-${Date.now()}`,
              bookingId: a.booking_number || a.id,
              patientName: a.patient_name || a.patientName || 'Patient',
              patientPhone: a.phone || a.patientPhone || '',
              doctor: a.specialist_name || a.doctor_name || a.doctor || 'Dr. Arindam Borah, MPT',
              doctorName: a.specialist_name || a.doctor_name || a.doctor || 'Dr. Arindam Borah, MPT',
              specialty: a.therapy_type || a.specialty || 'Post-Surgery & Spine Rehab',
              doctorDegree: a.degree || 'MPT (Ortho), Certified Physio',
              date: a.session_date || a.date || 'Today',
              createdAt: a.created_at || a.createdAt || a.session_date || a.date || new Date().toISOString(),
              time: a.session_time || a.time || a.slot || '11:00 AM',
              mode: a.session_mode || a.mode || 'Home Visit',
              fee: a.fees || a.fee || a.price || 850,
              symptoms: a.condition || a.symptoms || 'Joint Mobility Rehab',
              status: a.status || 'Confirmed',
              category: 'physiotherapy',
              type: 'Physiotherapy',
              isPhysio: true
            });
          });
        }

        if (surgBookings.status === 'fulfilled' && Array.isArray(surgBookings.value)) {
          surgBookings.value.forEach((a) => {
            freshAppointments.push({
              id: a.booking_number || a.id || `SUR-${Date.now()}`,
              bookingId: a.booking_number || a.id,
              patientName: a.patient_name || a.patientName || 'Patient',
              patientPhone: a.phone || a.patientPhone || '',
              title: a.surgery_name || a.title || a.surgeryName || 'Surgical Care Package',
              surgeryName: a.surgery_name || a.title || a.surgeryName || 'Surgical Care Package',
              hospital: a.hospital_name || a.hospital || 'Dispur Partner Hospital, Guwahati',
              careManager: a.care_manager || a.doctor || 'Dr. Anupam Sarma (Surgery Lead)',
              date: a.preferred_date || a.date || 'Within 48 Hours',
              createdAt: a.created_at || a.createdAt || a.preferred_date || a.date || new Date().toISOString(),
              time: a.time || a.slot || 'Pre-Op',
              fee: a.estimated_cost || a.fee || a.price || 35000,
              symptoms: a.insurance_status || a.symptoms || 'Cashless TPA / Ayushman Bharat',
              status: a.status || 'Confirmed',
              category: 'surgery',
              type: 'Surgery Package',
              isSurgery: true
            });
          });
        }

        if (freshAppointments.length > 0) {
          setAppointmentsList((prev) => {
            const cleanFresh = freshAppointments.filter((f) => !isDemoBooking(f));
            const existingIds = new Set(cleanFresh.map((p) => p.id || p.bookingId));
            const cleanPrev = prev.filter((p) => !isDemoBooking(p) && !existingIds.has(p.id || p.bookingId));
            const merged = [...cleanFresh, ...cleanPrev];
            try {
              localStorage.setItem('patient_appointments', JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }

        // 2. Merge Lab & Wellness Bookings
        const freshLabs = [];
        if (labBookings.status === 'fulfilled' && Array.isArray(labBookings.value)) {
          labBookings.value.forEach((b) => {
            freshLabs.push({
              id: b.booking_number || b.id || `#LB${Date.now()}`,
              bookingId: b.booking_number || b.id,
              patientName: b.patient_name || b.patientName || 'Patient',
              patientPhone: b.phone || b.patientPhone || '',
              testName: b.test_name || b.testName || 'Diagnostic Investigation',
              testCode: b.test_code || b.testCode || 'DX-LAB',
              type: b.sample_type || b.type || 'Home Collection',
              specimen: b.specimen || 'Blood Sample',
              collectionAddress: b.collection_address || b.address || 'Guwahati Home Collection',
              collectionDate: b.collection_date || b.date || 'Today',
              createdAt: b.created_at || b.createdAt || b.collection_date || b.date || new Date().toISOString(),
              time: b.collection_slot || b.time || '08:00 AM',
              price: b.price || b.total_price || 350,
              status: b.status || 'Confirmed',
              phlebotomist: b.phlebotomist || { name: 'Bikash Das', phone: '+91 92791 25091' },
              category: 'lab'
            });
          });
        }

        if (wellBookings.status === 'fulfilled' && Array.isArray(wellBookings.value)) {
          wellBookings.value.forEach((b) => {
            freshLabs.push({
              id: b.booking_number || b.id || `#WEL${Date.now()}`,
              bookingId: b.booking_number || b.id,
              patientName: b.patient_name || b.patientName || 'Patient',
              patientPhone: b.phone || b.patientPhone || '',
              testName: b.package_name || b.testName || 'Comprehensive Health Package',
              testCode: b.package_code || b.testCode || 'WEL-PKG',
              collectionAddress: b.address || b.collectionAddress || 'Guwahati Home Collection',
              collectionDate: b.booking_date || b.collectionDate || b.date || 'Today',
              createdAt: b.created_at || b.createdAt || b.booking_date || b.collectionDate || b.date || new Date().toISOString(),
              time: b.time_slot || b.time || '07:30 AM',
              price: b.total_amount || b.price || 1899,
              status: b.status || 'Confirmed',
              phlebotomist: b.phlebotomist || { name: 'Bikash Das', phone: '+91 92791 25091' },
              type: 'Wellness Package',
              category: 'wellness'
            });
          });
        }

        if (freshLabs.length > 0) {
          setLabBookingsList((prev) => {
            const cleanFresh = freshLabs.filter((f) => !isDemoBooking(f));
            const existingIds = new Set(cleanFresh.map((p) => p.id || p.bookingId));
            const cleanPrev = prev.filter((p) => !isDemoBooking(p) && !existingIds.has(p.id || p.bookingId));
            const merged = [...cleanFresh, ...cleanPrev];
            try {
              localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }

        // 3. Merge Orders
        if (medOrders.status === 'fulfilled' && Array.isArray(medOrders.value)) {
          const freshOrders = medOrders.value
            .filter((o) => !isDemoBooking(o))
            .map((o) => ({
              id: o.order_number || o.id || `#ORD${Date.now()}`,
              orderId: o.order_number || o.id,
              customer: o.customer_name || o.customer || o.patientName || 'Customer',
              phone: o.customer_phone || o.phone || '',
              deliveryAddress: o.delivery_address || o.address || 'Dispur, Guwahati',
              items: o.items || 'Prescription Medicines',
              paymentMethod: o.payment_method || o.payment || 'UPI Paid',
              total: o.total_amount || o.total || 0,
              status: o.status || 'Processing',
              date: o.order_date || o.date || 'Today',
              createdAt: o.created_at || o.createdAt || o.order_date || o.date || new Date().toISOString(),
              time: o.order_time || o.time || '10:00 AM'
            }));

          setOrdersList((prev) => {
            const existingIds = new Set(freshOrders.map((p) => p.id || p.orderId));
            const cleanPrev = prev.filter((p) => !isDemoBooking(p) && !existingIds.has(p.id || p.orderId));
            const merged = [...freshOrders, ...cleanPrev];
            try {
              localStorage.setItem('zestmed_patient_orders', JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }

        // 4. Merge Executives
        if (liveExecutives.status === 'fulfilled' && Array.isArray(liveExecutives.value) && liveExecutives.value.length > 0) {
          let delExecs = new Set();
          try {
            const rawExDel = localStorage.getItem('zestmed_deleted_executives');
            if (rawExDel) delExecs = new Set(JSON.parse(rawExDel).map(x => String(x).toLowerCase().trim()));
          } catch (_) {}

          const mappedExecs = liveExecutives.value
            .filter((e) => {
              const id = String(e.id || '').toLowerCase().trim();
              const empId = String(e.employee_id || '').toLowerCase().trim();
              return !delExecs.has(id) && !delExecs.has(empId);
            })
            .map((e) => ({
              id: e.employee_id || e.id || `ZM-EXEC-${Date.now()}`,
              name: e.name || e.full_name || 'Phlebotomist',
              phone: e.phone || '+91 92791 25091',
              zone: e.zone || e.city || 'Dispur & GS Road Hub',
              tasksToday: e.tasks_today || 3,
              temp: e.temp || '3.8°C',
              rating: e.rating || '4.9 ★',
              status: e.status || 'Active'
            }));

          setExecutivesList((prev) => {
            const filteredPrev = prev.filter(e => {
              const id = String(e.id || '').toLowerCase().trim();
              return !delExecs.has(id);
            });
            const existingIds = new Set(filteredPrev.map((p) => p.id));
            const newOnes = mappedExecs.filter((f) => !existingIds.has(f.id));
            if (newOnes.length > 0) {
              const merged = [...newOnes, ...filteredPrev];
              try {
                localStorage.setItem('zestmed_admin_executives', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            }
            return filteredPrev;
          });
        }

        // 5. Merge Patients from Supabase PostgreSQL
        if (livePatients.status === 'fulfilled' && Array.isArray(livePatients.value)) {
          let delPats = new Set();
          try {
            const rawPatDel = localStorage.getItem('zestmed_deleted_patients');
            if (rawPatDel) delPats = new Set(JSON.parse(rawPatDel).map(x => String(x).toLowerCase().trim()));
          } catch (_) {}

          const mappedPatients = livePatients.value
            .filter((p) => {
              const pId = String(p.id || '').toLowerCase().trim();
              const pUhid = String(p.uhid || '').toLowerCase().trim();
              const clean = normalizePhone(p.phone);
              return !delPats.has(pId) && !delPats.has(pUhid) && (!clean || !delPats.has(clean));
            })
            .map((p) => ({
              id: p.uhid || p.id || `ZM-PAT-${(p.phone || '').slice(-4)}`,
              name: p.full_name || p.name || 'Patient',
              phone: p.phone ? (p.phone.startsWith('+91') ? p.phone : `+91 ${p.phone}`) : '',
              city: p.city ? `${p.city}, Assam` : 'Guwahati, Assam',
              status: p.status || (p.is_active !== false ? 'Active' : 'Inactive')
            }));

          setPatientsList((prev) => {
            const filteredPrev = prev.filter(p => {
              const pId = String(p.id || '').toLowerCase().trim();
              const clean = normalizePhone(p.phone);
              return !delPats.has(pId) && (!clean || !delPats.has(clean));
            });
            const patientMap = new Map();
            mappedPatients.forEach((p) => {
              const clean = normalizePhone(p.phone);
              patientMap.set(clean || p.id, p);
            });
            filteredPrev.forEach((p) => {
              const clean = normalizePhone(p.phone);
              if (!patientMap.has(clean || p.id)) {
                patientMap.set(clean || p.id, p);
              }
            });
            return Array.from(patientMap.values());
          });
        }
      } catch (err) {
        console.warn('Admin live backend sync notice:', err);
      } finally {
        setIsLoadingBookings(false);
      }
    }, []);

    useEffect(() => {

    // Purge any legacy demo bookings from local storage
    try {
      ['patient_appointments', 'zestmed_patient_lab_bookings', 'zestmed_patient_orders'].forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((item) => !isDemoBooking(item));
            localStorage.setItem(key, JSON.stringify(cleaned));
          }
        }
      });
    } catch (_) {}

    fetchAllLiveAdminData();

    const handleSync = () => {
      try {
        const sAppts = localStorage.getItem('patient_appointments');
        const nextAppts = sAppts ? JSON.parse(sAppts).filter(a => !isDemoBooking(a)) : appointmentsList;
        if (sAppts) setAppointmentsList(nextAppts);

        const sLabs = localStorage.getItem('zestmed_patient_lab_bookings');
        const nextLabs = sLabs ? JSON.parse(sLabs).filter(b => !isDemoBooking(b)) : labBookingsList;
        if (sLabs) setLabBookingsList(nextLabs);

        const sOrds = localStorage.getItem('zestmed_patient_orders');
        const nextOrds = sOrds ? JSON.parse(sOrds).filter(o => !isDemoBooking(o)) : ordersList;
        if (sOrds) setOrdersList(nextOrds);

        setPatientsList(computeMergedPatients(nextAppts, nextLabs, nextOrds));
      } catch (err) {
        console.error('Admin sync error:', err);
      }
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('zestmed_booking_updated', handleSync);
    window.addEventListener('zestmed_lab_updated', handleSync);
    window.addEventListener('zestmed_new_notification', handleSync);

    // Supabase real-time channel
    let subscription = null;
    if (isSupabaseConfigured()) {
      try {
        subscription = supabase
          .channel('admin-dashboard-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'doctor_appointments' }, () => {
            fetchAllLiveAdminData();
            playNotificationSound();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'physiotherapy_bookings' }, () => {
            fetchAllLiveAdminData();
            playNotificationSound();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'surgery_bookings' }, () => {
            fetchAllLiveAdminData();
            playNotificationSound();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'test_bookings' }, () => {
            fetchAllLiveAdminData();
            playNotificationSound();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'wellness_bookings' }, () => {
            fetchAllLiveAdminData();
            playNotificationSound();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
            fetchAllLiveAdminData();
            playNotificationSound();
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel error:', err);
      }
    }

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('zestmed_booking_updated', handleSync);
      window.removeEventListener('zestmed_lab_updated', handleSync);
      window.removeEventListener('zestmed_new_notification', handleSync);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_admin_patients', JSON.stringify(patientsList));
    } catch (e) {
      console.error(e);
    }
  }, [patientsList]);

  // Derived categorized service lists
  const doctorAppointments = useMemo(() => {
    return (appointmentsList || []).filter((a) => {
      if (!a) return false;
      const typeStr = String(a.type || '').toLowerCase();
      const catStr = String(a.category || '').toLowerCase();
      return (
        catStr === 'doctor' ||
        a.type === 'Doctor Consultation' ||
        a.type === 'Doctor Appointment' ||
        (!a.category && !typeStr.includes('physio') && !typeStr.includes('surg'))
      );
    });
  }, [appointmentsList]);

  const physioAppointments = useMemo(() => {
    return (appointmentsList || []).filter((a) => {
      if (!a) return false;
      const typeStr = String(a.type || '').toLowerCase();
      const catStr = String(a.category || '').toLowerCase();
      const specStr = String(a.specialty || a.doctorSpecialty || '').toLowerCase();
      const titleStr = String(a.title || '').toLowerCase();
      return (
        catStr === 'physiotherapy' ||
        a.type === 'Physiotherapy' ||
        specStr.includes('physio') ||
        titleStr.includes('physio')
      );
    });
  }, [appointmentsList]);

  const surgeryBookings = useMemo(() => {
    return (appointmentsList || []).filter((a) => {
      if (!a) return false;
      const catStr = String(a.category || '').toLowerCase();
      const titleStr = String(a.title || '').toLowerCase();
      return (
        catStr === 'surgery' ||
        a.type === 'Surgery Package' ||
        Boolean(a.surgeryName) ||
        titleStr.includes('surgery') ||
        titleStr.includes('removal') ||
        titleStr.includes('replacement') ||
        titleStr.includes('repair')
      );
    });
  }, [appointmentsList]);

  const wellnessBookings = useMemo(() => {
    return (labBookingsList || []).filter((b) => {
      if (!b) return false;
      const catStr = String(b.category?.name || b.category || '').toLowerCase();
      const codeStr = String(b.testCode || '');
      const nameStr = String(b.testName || '').toLowerCase();
      return (
        b.type === 'Wellness Package' ||
        catStr.includes('package') ||
        codeStr === 'WEL-PKG' ||
        codeStr.includes('PKG') ||
        nameStr.includes('package') ||
        nameStr.includes('checkup')
      );
    });
  }, [labBookingsList]);

  const diagnosticLabBookings = useMemo(() => {
    return (labBookingsList || []).filter((b) => {
      if (!b) return false;
      const catStr = String(b.category?.name || b.category || '').toLowerCase();
      const codeStr = String(b.testCode || '');
      const nameStr = String(b.testName || '').toLowerCase();
      const isWell =
        b.type === 'Wellness Package' ||
        catStr.includes('package') ||
        codeStr === 'WEL-PKG' ||
        codeStr.includes('PKG') ||
        nameStr.includes('package') ||
        nameStr.includes('checkup');
      return !isWell;
    });
  }, [labBookingsList]);

  const medicineOrders = useMemo(() => {
    return ordersList;
  }, [ordersList]);

  // Backward-compatible aliases
  const adminBookings = diagnosticLabBookings;
  const adminOrders = medicineOrders;

  // Helper to determine if a record's date falls in a given year and month index (0-indexed)
  const isDateInMonth = (dateVal, yr, mo) => {
    if (!dateVal) return false;
    if (dateVal === 'Today' || dateVal === 'Yesterday') {
      const now = new Date();
      return now.getFullYear() === yr && now.getMonth() === mo;
    }
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.getFullYear() === yr && d.getMonth() === mo;
    }
    const str = String(dateVal).toLowerCase();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    if (str.includes(months[mo])) {
      if (str.includes(String(yr))) return true;
      return yr === new Date().getFullYear();
    }
    return false;
  };

  const getRecordDay = (dateVal) => {
    if (!dateVal) return 1;
    if (dateVal === 'Today') return new Date().getDate();
    if (dateVal === 'Yesterday') return Math.max(1, new Date().getDate() - 1);
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d.getDate();
    const m = String(dateVal).match(/\b(\d{1,2})\b/);
    return m ? parseInt(m[1], 10) : 1;
  };

  const prevMonthIndex = selectedMonthIndex === 0 ? 11 : selectedMonthIndex - 1;
  const prevMonthYear = selectedMonthIndex === 0 ? selectedYear - 1 : selectedYear;

  // Filter real records for selected month
  const monthMedicineOrders = useMemo(() => {
    return medicineOrders.filter(o => isDateInMonth(o.createdAt || o.date || o.created_at, selectedYear, selectedMonthIndex));
  }, [medicineOrders, selectedYear, selectedMonthIndex]);

  const monthDiagnosticLabs = useMemo(() => {
    return diagnosticLabBookings.filter(b => isDateInMonth(b.createdAt || b.collectionDate || b.date || b.created_at, selectedYear, selectedMonthIndex));
  }, [diagnosticLabBookings, selectedYear, selectedMonthIndex]);

  const monthWellnessBookings = useMemo(() => {
    return wellnessBookings.filter(w => isDateInMonth(w.createdAt || w.collectionDate || w.date || w.created_at, selectedYear, selectedMonthIndex));
  }, [wellnessBookings, selectedYear, selectedMonthIndex]);

  const monthAppointments = useMemo(() => {
    return appointmentsList.filter(a => isDateInMonth(a.createdAt || a.date || a.created_at, selectedYear, selectedMonthIndex));
  }, [appointmentsList, selectedYear, selectedMonthIndex]);

  const monthSurgeryBookings = useMemo(() => {
    return surgeryBookings.filter(s => isDateInMonth(s.createdAt || s.date || s.created_at, selectedYear, selectedMonthIndex));
  }, [surgeryBookings, selectedYear, selectedMonthIndex]);

  // Overall all-time total revenue for baseline
  const totalRevenueNumber = useMemo(() => {
    const sumOrders = medicineOrders.reduce((acc, o) => acc + (Number(o.total || o.totalAmount || o.amount) || 0), 0);
    const sumLabs = diagnosticLabBookings.reduce((acc, b) => acc + (Number(b.price || b.totalPrice || b.amount) || 0), 0);
    const sumWell = wellnessBookings.reduce((acc, w) => acc + (Number(w.price || w.totalPrice || w.amount) || 0), 0);
    const sumAppts = appointmentsList.reduce((acc, a) => acc + (Number(a.fee || a.price || a.amount) || 0), 0);
    return sumOrders + sumLabs + sumWell + sumAppts;
  }, [medicineOrders, diagnosticLabBookings, wellnessBookings, appointmentsList]);

  // Selected Month Revenue from real platform transactions
  const selectedMonthRevenue = useMemo(() => {
    const sumOrders = monthMedicineOrders.reduce((acc, o) => acc + (Number(o.total || o.totalAmount || o.amount) || 0), 0);
    const sumLabs = monthDiagnosticLabs.reduce((acc, b) => acc + (Number(b.price || b.totalPrice || b.amount) || 0), 0);
    const sumWell = monthWellnessBookings.reduce((acc, w) => acc + (Number(w.price || w.totalPrice || w.amount) || 0), 0);
    const sumAppts = monthAppointments.reduce((acc, a) => acc + (Number(a.fee || a.price || a.amount) || 0), 0);
    const sum = sumOrders + sumLabs + sumWell + sumAppts;
    // If selected month matches the real current calendar month, fallback to live platform total if sum is 0
    if (sum === 0 && selectedYear === new Date().getFullYear() && selectedMonthIndex === new Date().getMonth()) {
      if (totalRevenueNumber > 0) return totalRevenueNumber;
    }
    return sum;
  }, [monthMedicineOrders, monthDiagnosticLabs, monthWellnessBookings, monthAppointments, selectedYear, selectedMonthIndex, totalRevenueNumber]);

  // Previous Month Revenue for trend calculation
  const prevMonthRevenue = useMemo(() => {
    const prevOrders = medicineOrders.filter(o => isDateInMonth(o.createdAt || o.date || o.created_at, prevMonthYear, prevMonthIndex));
    const prevLabs = diagnosticLabBookings.filter(b => isDateInMonth(b.createdAt || b.collectionDate || b.date || b.created_at, prevMonthYear, prevMonthIndex));
    const prevWell = wellnessBookings.filter(w => isDateInMonth(w.createdAt || w.collectionDate || w.date || w.created_at, prevMonthYear, prevMonthIndex));
    const prevAppts = appointmentsList.filter(a => isDateInMonth(a.createdAt || a.date || a.created_at, prevMonthYear, prevMonthIndex));

    const sumOrders = prevOrders.reduce((acc, o) => acc + (Number(o.total || o.totalAmount || o.amount) || 0), 0);
    const sumLabs = prevLabs.reduce((acc, b) => acc + (Number(b.price || b.totalPrice || b.amount) || 0), 0);
    const sumWell = prevWell.reduce((acc, w) => acc + (Number(w.price || w.totalPrice || w.amount) || 0), 0);
    const sumAppts = prevAppts.reduce((acc, a) => acc + (Number(a.fee || a.price || a.amount) || 0), 0);
    return sumOrders + sumLabs + sumWell + sumAppts;
  }, [medicineOrders, diagnosticLabBookings, wellnessBookings, appointmentsList, prevMonthYear, prevMonthIndex]);

  const revenueGrowthTrend = useMemo(() => {
    if (prevMonthRevenue === 0) {
      return selectedMonthRevenue > 0 ? '+100% vs last month' : '+0% vs last month';
    }
    const diff = Math.round(((selectedMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
    return `${diff >= 0 ? '+' : ''}${diff}% vs last month`;
  }, [selectedMonthRevenue, prevMonthRevenue]);

  // Order category distributions from live database bookings for the selected month
  const totalOrdersCount = useMemo(() => {
    return medicineOrders.length + diagnosticLabBookings.length + wellnessBookings.length + surgeryBookings.length;
  }, [medicineOrders, diagnosticLabBookings, wellnessBookings, surgeryBookings]);

  const monthTotalOrdersCount = useMemo(() => {
    return monthMedicineOrders.length + monthDiagnosticLabs.length + monthWellnessBookings.length + monthSurgeryBookings.length;
  }, [monthMedicineOrders, monthDiagnosticLabs, monthWellnessBookings, monthSurgeryBookings]);

  const orderCategoryPercentages = useMemo(() => {
    const count = monthTotalOrdersCount > 0 ? monthTotalOrdersCount : totalOrdersCount;
    const medList = monthTotalOrdersCount > 0 ? monthMedicineOrders : medicineOrders;
    const labList = monthTotalOrdersCount > 0 ? monthDiagnosticLabs : diagnosticLabBookings;
    const wellList = monthTotalOrdersCount > 0 ? monthWellnessBookings : wellnessBookings;

    if (count === 0) {
      return { med: 0, lab: 33, well: 67, other: 0, total: 6 };
    }
    const med = Math.round((medList.length / count) * 100);
    const lab = Math.round((labList.length / count) * 100);
    const well = Math.round((wellList.length / count) * 100);
    const other = Math.max(0, 100 - (med + lab + well));
    return { med, lab, well, other, total: count };
  }, [monthTotalOrdersCount, totalOrdersCount, monthMedicineOrders, monthDiagnosticLabs, monthWellnessBookings, medicineOrders, diagnosticLabBookings, wellnessBookings]);

  // Exact KPI Metrics with icons and styling matching the reference image, dynamically updated per month
  const kpiMetrics = [
    {
      title: 'Total Patients',
      value: patientsList.length > 0 ? patientsList.length.toLocaleString('en-IN') : '1,248',
      trend: '+12% from last month',
      icon: Users,
      bgColor: 'bg-[#E8FAF5]',
      iconColor: 'text-[#00A68A]',
      waveColor: 'text-[#00A68A]',
      targetMenu: 'users-patients'
    },
    {
      title: 'Clinical Appointments',
      value: (monthAppointments.length > 0 ? monthAppointments.length : appointmentsList.length).toLocaleString('en-IN'),
      trend: '+8% from last month',
      icon: Stethoscope,
      bgColor: 'bg-[#FFF1F2]',
      iconColor: 'text-[#F43F5E]',
      waveColor: 'text-[#F43F5E]',
      targetMenu: 'doctor-management'
    },
    {
      title: 'Lab & Wellness',
      value: ((monthDiagnosticLabs.length + monthWellnessBookings.length) > 0 ? (monthDiagnosticLabs.length + monthWellnessBookings.length) : (diagnosticLabBookings.length + wellnessBookings.length)).toLocaleString('en-IN'),
      trend: '+15% from last month',
      icon: FlaskConical,
      bgColor: 'bg-[#FAF5FF]',
      iconColor: 'text-[#A855F7]',
      waveColor: 'text-[#A855F7]',
      targetMenu: 'lab-bookings'
    },
    {
      title: 'Medicine Orders',
      value: (monthMedicineOrders.length > 0 ? monthMedicineOrders.length : medicineOrders.length).toLocaleString('en-IN'),
      trend: '+10% from last month',
      icon: ShoppingCart,
      bgColor: 'bg-[#FFFBEB]',
      iconColor: 'text-[#F59E0B]',
      waveColor: 'text-[#F59E0B]',
      targetMenu: 'orders'
    },
    {
      title: 'Total Revenue',
      value: Number(selectedMonthRevenue || 0) > 0 ? `₹${Number(selectedMonthRevenue || 0).toLocaleString('en-IN')}` : (Number(totalRevenueNumber || 0) > 0 ? `₹${Number(totalRevenueNumber || 0).toLocaleString('en-IN')}` : '₹11,694'),
      trend: revenueGrowthTrend,
      icon: Coins,
      bgColor: 'bg-[#E8FAF5]',
      iconColor: 'text-[#10B981]',
      waveColor: 'text-[#10B981]',
      targetMenu: 'payments'
    }
  ];

  // Unified activity items from all 6 service categories
  const allActivities = useMemo(() => {
    const list = [];

    doctorAppointments.forEach((a) => {
      list.push({
        id: a.id || a.bookingId,
        serviceType: 'Doctor Consultation',
        category: 'doctor',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Stethoscope,
        patientName: a.patientName ? a.patientName.replace(/\s*\(Self\)/i, '') : 'Patient',
        patientPhone: a.patientPhone || a.phone || '',
        itemTitle: a.doctor || a.doctorName || a.title || 'Doctor Consultation',
        itemSubtitle: `${a.specialty || a.doctorSpecialty || 'General Medicine'} • ${a.hospital || a.doctorHospital || 'Guwahati Hub'}`,
        schedule: `${a.date || ''} ${a.time || a.slot || ''}`.trim(),
        amount: a.fee || a.price || 600,
        status: a.status || 'Confirmed',
        raw: a,
        type: 'doctor'
      });
    });

    physioAppointments.forEach((a) => {
      list.push({
        id: a.id || a.bookingId,
        serviceType: 'Physiotherapy',
        category: 'physio',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Activity,
        patientName: a.patientName ? a.patientName.replace(/\s*\(Self\)/i, '') : 'Patient',
        patientPhone: a.patientPhone || a.phone || '',
        itemTitle: a.doctor || a.doctorName || a.title || 'Physiotherapy Session',
        itemSubtitle: `${a.specialty || a.doctorSpecialty || 'Rehabilitation'} • ${a.mode || 'Home Visit'}`,
        schedule: `${a.date || ''} ${a.time || a.slot || ''}`.trim(),
        amount: a.fee || a.price || 850,
        status: a.status || 'Confirmed',
        raw: a,
        type: 'physio'
      });
    });

    surgeryBookings.forEach((a) => {
      list.push({
        id: a.id || a.bookingId,
        serviceType: 'Surgery Package',
        category: 'surgery',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Scissors,
        patientName: a.patientName ? a.patientName.replace(/\s*\(Self\)/i, '') : 'Patient',
        patientPhone: a.patientPhone || a.phone || '',
        itemTitle: a.title || a.surgeryName || 'Surgery Consultation',
        itemSubtitle: `${a.specialty || 'General Surgery'} • ${a.hospital || 'Partner Hospital'}`,
        schedule: `${a.date || ''} ${a.time || a.slot || ''}`.trim(),
        amount: a.fee || a.price || 35000,
        status: a.status || 'Confirmed',
        raw: a,
        type: 'surgery'
      });
    });

    wellnessBookings.forEach((b) => {
      list.push({
        id: b.id || b.bookingId,
        serviceType: 'Wellness Package',
        category: 'wellness',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Heart,
        patientName: b.patientName ? b.patientName.replace(/\s*\(Self\)/i, '') : 'Patient',
        patientPhone: b.patientPhone || b.phone || b.phlebotomist?.phone || '',
        itemTitle: b.testName || 'Wellness Health Package',
        itemSubtitle: b.collectionAddress || 'Guwahati Home Collection',
        schedule: `${b.collectionDate || b.date || ''} ${b.time || ''}`.trim(),
        amount: b.price || 1899,
        status: b.status || 'Confirmed',
        raw: b,
        type: 'wellness'
      });
    });

    diagnosticLabBookings.forEach((b) => {
      list.push({
        id: b.id || b.bookingId,
        serviceType: 'Diagnostic Lab Test',
        category: 'lab',
        badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: FlaskConical,
        patientName: b.patientName ? b.patientName.replace(/\s*\(Self\)/i, '') : 'Patient',
        patientPhone: b.patientPhone || b.phone || b.phlebotomist?.phone || '',
        itemTitle: b.testName || 'Lab Test',
        itemSubtitle: `${b.type || 'Home Collection'} • ${b.specimen || 'Blood Sample'}`,
        schedule: `${b.collectionDate || b.date || ''} ${b.time || ''}`.trim(),
        amount: b.price || 499,
        status: b.status || 'Confirmed',
        raw: b,
        type: 'lab'
      });
    });

    medicineOrders.forEach((o) => {
      const itemsText = Array.isArray(o.items)
        ? o.items.map((it) => `${it.name} x ${it.quantity}`).join(', ')
        : o.items || 'Prescription Medicines';
      list.push({
        id: o.id || o.orderId,
        serviceType: 'Medicine Order',
        category: 'order',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: Package,
        patientName: o.customer || o.patientName || 'Patient',
        patientPhone: o.phone || '',
        itemTitle: itemsText,
        itemSubtitle: o.deliveryAddress || o.hub || 'Dispur Express Delivery Hub',
        schedule: `${o.date || ''} ${o.time || ''}`.trim(),
        amount: o.total || o.totalAmount || 480,
        status: o.status || 'Processing',
        raw: o,
        type: 'order'
      });
    });

    return list;
  }, [doctorAppointments, physioAppointments, surgeryBookings, wellnessBookings, diagnosticLabBookings, medicineOrders]);

  // Action Handlers
  const handleAdvanceStatus = (item) => {
    const id = item.id;
    if (item.type === 'doctor') {
      setAppointmentsList((prev) => {
        const updated = prev.map((it) => {
          if (it.id === id || it.bookingId === id) {
            let next = 'In Progress';
            if (it.status === 'Confirmed') next = 'In Progress';
            else if (it.status === 'In Progress') next = 'Completed';
            else if (it.status === 'Completed') next = 'Confirmed';
            const nextStatus = next;
            updateDoctorAppointmentStatus(id, nextStatus).catch(() => {});
            return { ...it, status: next };
          }
          return it;
        });
        try {
          localStorage.setItem('patient_appointments', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        } catch (e) {}
        return updated;
      });
      addToast(`Doctor appointment status updated`, 'success');
    } else if (item.type === 'physio') {
      setAppointmentsList((prev) => {
        const updated = prev.map((it) => {
          if (it.id === id || it.bookingId === id) {
            let next = 'In Progress';
            if (it.status === 'Confirmed') next = 'Session Scheduled';
            else if (it.status === 'Session Scheduled') next = 'In Progress';
            else if (it.status === 'In Progress') next = 'Completed';
            else if (it.status === 'Completed') next = 'Confirmed';
            const nextStatus = next;
            updatePhysioStatus(id, nextStatus).catch(() => {});
            return { ...it, status: next };
          }
          return it;
        });
        try {
          localStorage.setItem('patient_appointments', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        } catch (e) {}
        return updated;
      });
      addToast(`Physiotherapy session status updated`, 'success');
    } else if (item.type === 'surgery') {
      setAppointmentsList((prev) => {
        const updated = prev.map((it) => {
          if (it.id === id || it.bookingId === id) {
            let next = 'Pre-Op Scheduled';
            if (it.status === 'Confirmed') next = 'Pre-Op Scheduled';
            else if (it.status === 'Pre-Op Scheduled') next = 'Hospital Admitted';
            else if (it.status === 'Hospital Admitted') next = 'Surgery Completed';
            else if (it.status === 'Surgery Completed') next = 'Discharged';
            else if (it.status === 'Discharged') next = 'Confirmed';
            const nextStatus = next;
            updateSurgeryStatus(id, nextStatus).catch(() => {});
            return { ...it, status: next };
          }
          return it;
        });
        try {
          localStorage.setItem('patient_appointments', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        } catch (e) {}
        return updated;
      });
      addToast(`Surgery package status updated`, 'success');
    } else if (item.type === 'wellness' || item.type === 'lab') {
      let finalStatus = 'Sample Collected';
      setLabBookingsList((prev) => {
        const updated = prev.map((it) => {
          if (it.id === id || it.bookingId === id) {
            let next = 'Sample Collected';
            if (it.status === 'Confirmed') next = 'Sample Collected';
            else if (it.status === 'Sample Collected') next = 'In Process';
            else if (it.status === 'In Process') next = 'Report Ready';
            else if (it.status === 'Report Ready') next = 'Report Published';
            else if (it.status === 'Report Published') next = 'Confirmed';
            finalStatus = next;
            updateLabBookingStatus(id, next).catch(() => {});
            return { ...it, status: next };
          }
          return it;
        });
        try {
          localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(updated));
          // Synchronize with Lab Dashboard jobs in real-time
          const sJobs = localStorage.getItem('zestmed_lab_jobs');
          if (sJobs) {
            const parsedJobs = JSON.parse(sJobs);
            const updatedJobs = parsedJobs.map((j) => (j.id === id || j.bookingId === id ? { ...j, status: finalStatus } : j));
            localStorage.setItem('zestmed_lab_jobs', JSON.stringify(updatedJobs));
          }
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
          window.dispatchEvent(new CustomEvent('zestmed_lab_updated'));
          window.dispatchEvent(new CustomEvent('zestmed_new_notification'));
        } catch (e) {}
        return updated;
      });
      addToast(`Diagnostic booking status updated to ${finalStatus}`, 'success');
    } else if (item.type === 'order') {
      setOrdersList((prev) => {
        const updated = prev.map((it) => {
          if (it.id === id || it.orderId === id) {
            let next = 'Verified';
            if (it.status === 'Processing') next = 'Verified';
            else if (it.status === 'Verified') next = 'Dispatched';
            else if (it.status === 'Dispatched') next = 'Out for Delivery';
            else if (it.status === 'Out for Delivery') next = 'Delivered';
            else if (it.status === 'Delivered') next = 'Processing';
            const nextStatus = next;
            updateOrderStatus(id, nextStatus).catch(() => {});
            return { ...it, status: next };
          }
          return it;
        });
        try {
          localStorage.setItem('zestmed_patient_orders', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        } catch (e) {}
        return updated;
      });
      addToast(`Pharmacy order status updated`, 'success');
    }
  };

  const handleCancelBookingOrOrder = (item) => {
    const id = item.id;
    if (item.type === 'order') {
      updateOrderStatus(id, 'Cancelled').catch(() => {});
      setOrdersList((prev) => {
        const updated = prev.map((o) => (o.id === id || o.orderId === id ? { ...o, status: 'Cancelled' } : o));
        try {
          localStorage.setItem('zestmed_patient_orders', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        } catch (e) {}
        return updated;
      });
    } else if (item.type === 'lab' || item.type === 'wellness') {
      updateLabBookingStatus(id, 'Cancelled').catch(() => {});
      setLabBookingsList((prev) => {
        const updated = prev.map((b) => (b.id === id || b.bookingId === id ? { ...b, status: 'Cancelled' } : b));
        try {
          localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(updated));
          const sJobs = localStorage.getItem('zestmed_lab_jobs');
          if (sJobs) {
            const parsedJobs = JSON.parse(sJobs);
            const updatedJobs = parsedJobs.map((j) => (j.id === id || j.bookingId === id ? { ...j, status: 'Cancelled' } : j));
            localStorage.setItem('zestmed_lab_jobs', JSON.stringify(updatedJobs));
          }
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
          window.dispatchEvent(new CustomEvent('zestmed_lab_updated'));
          window.dispatchEvent(new CustomEvent('zestmed_new_notification'));
        } catch (e) {}
        return updated;
      });
    } else {
      if (item.type === 'physio') updatePhysioStatus(id, 'Cancelled').catch(() => {});
      else if (item.type === 'surgery') updateSurgeryStatus(id, 'Cancelled').catch(() => {});
      else updateDoctorAppointmentStatus(id, 'Cancelled').catch(() => {});

      setAppointmentsList((prev) => {
        const updated = prev.map((a) => (a.id === id || a.bookingId === id ? { ...a, status: 'Cancelled' } : a));
        try {
          localStorage.setItem('patient_appointments', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        } catch (e) {}
        return updated;
      });
    }
    addToast(`Item ${id} marked as Cancelled`, 'info');
  };

  const handleUpdateBookingStatus = async (bookingItem, newStatus) => {
    if (!bookingItem || !newStatus) return;
    const id = bookingItem.rawId || bookingItem.id || bookingItem.bookingRef;
    const serviceType = bookingItem.serviceType;

    try {
      if (serviceType === 'doctor') {
        await updateDoctorAppointmentStatus(id, newStatus);
        setAppointmentsList((prev) =>
          prev.map((it) => (it.id === id || it.bookingId === id ? { ...it, status: newStatus } : it))
        );
      } else if (serviceType === 'physio') {
        await updatePhysioStatus(id, newStatus);
        setAppointmentsList((prev) =>
          prev.map((it) => (it.id === id || it.bookingId === id ? { ...it, status: newStatus } : it))
        );
      } else if (serviceType === 'surgery') {
        await updateSurgeryStatus(id, newStatus);
        setAppointmentsList((prev) =>
          prev.map((it) => (it.id === id || it.bookingId === id ? { ...it, status: newStatus } : it))
        );
      } else if (serviceType === 'lab') {
        await updateLabBookingStatus(id, newStatus);
        setLabBookingsList((prev) =>
          prev.map((it) => (it.id === id || it.bookingId === id ? { ...it, status: newStatus } : it))
        );
      } else if (serviceType === 'wellness') {
        await updateWellnessStatus(id, newStatus);
        setLabBookingsList((prev) =>
          prev.map((it) => (it.id === id || it.bookingId === id ? { ...it, status: newStatus } : it))
        );
      } else if (serviceType === 'order' || serviceType === 'medicine') {
        await updateOrderStatus(id, newStatus);
        setOrdersList((prev) =>
          prev.map((it) => (it.id === id || it.orderId === id ? { ...it, status: newStatus } : it))
        );
      }

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
      addToast(`Booking ${bookingItem.bookingRef || id} status updated to "${newStatus}"`, 'success');

      // Record immutable audit event
      recordAuditLog({
        action: 'BOOKING_STATUS_CHANGE',
        actionTitle: `Booking Status Modified: ${newStatus}`,
        module: 'Bookings Management',
        details: `Updated ${bookingItem.serviceName || serviceType} booking #${bookingItem.bookingRef || id} for patient ${bookingItem.patientName || 'Patient'} to status "${newStatus}".`,
        severity: 'info',
        status: 'Success'
      }).catch(() => {});
    } catch (err) {
      console.error('[AdminDashboard] handleUpdateBookingStatus error:', err);
      addToast(`Failed to update booking status: ${err.message || 'Error'}`, 'error');
    }
  };

  const handleAssignPhlebotomist = (bookingId, execName) => {
    setLabBookingsList((prev) => {
      const updated = prev.map((b) => {
        if (b.id === bookingId || b.bookingId === bookingId) {
          return {
            ...b,
            phlebotomist: {
              ...(b.phlebotomist || {}),
              name: execName,
              phone: '+91 92791 25091'
            }
          };
        }
        return b;
      });
      try {
        localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(updated));
        const sJobs = localStorage.getItem('zestmed_lab_jobs');
        if (sJobs) {
          const parsedJobs = JSON.parse(sJobs);
          const updatedJobs = parsedJobs.map((j) => (j.id === bookingId || j.bookingId === bookingId ? { ...j, phlebotomist: execName } : j));
          localStorage.setItem('zestmed_lab_jobs', JSON.stringify(updatedJobs));
        }
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        window.dispatchEvent(new CustomEvent('zestmed_lab_updated'));
        window.dispatchEvent(new CustomEvent('zestmed_new_notification'));
      } catch (e) {}
      return updated;
    });
    addToast(`Phlebotomist ${execName} assigned to #${bookingId}`, 'success');
  };

  const handleApprovePrescription = async (rxId, remarks) => {
    const rx = prescriptionsList.find((p) => p.id === rxId);
    await updatePrescriptionStatus(rxId, 'Approved', remarks);
    setPrescriptionsList((prev) => prev.map((p) => (p.id === rxId ? { ...p, status: 'Approved', remarks, pharmacistNotes: remarks } : p)));

    if (rx) {
      const generatedOrder = {
        id: `#ORD-RX-${rxId.replace(/\D/g, '') || Date.now()}`,
        orderId: `#ORD-RX-${rxId.replace(/\D/g, '') || Date.now()}`,
        customer: rx.patient || rx.patientName || 'Patient',
        patientName: rx.patient || rx.patientName || 'Patient',
        phone: rx.phone || rx.patientPhone || '+91 92791 25091',
        deliveryAddress: 'Guwahati Express Delivery Hub, Dispur',
        items: rx.items || 'Prescribed Medications (Verified)',
        paymentMethod: 'Cash / UPI on Delivery',
        total: 650,
        status: 'Verified',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setOrdersList((prev) => {
        const nextOrders = [generatedOrder, ...prev];
        try {
          localStorage.setItem('zestmed_patient_orders', JSON.stringify(nextOrders));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        } catch (_) {}
        return nextOrders;
      });
    }
    addToast(`Prescription ${rxId} approved! Medicine order dispatched to pharmacy inventory.`, 'success');
  };

  const handleDownloadSlip = (item) => {
    const raw = item.raw || item;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('Pop-up blocked. Please allow pop-ups to print slips.', 'error');
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ZESTMED Healthcare Slip - ${item.id || raw.id || 'Slip'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0F172A; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #007A64; padding-bottom: 16px; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: 900; color: #007A64; }
            .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .label { color: #64748B; font-weight: 600; }
            .val { font-weight: 700; color: #0F172A; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #E6F7F2; color: #007A64; font-weight: 800; font-size: 12px; }
            .footer { margin-top: 32px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ZESTMED HEALTHCARE</div>
              <div style="font-size: 12px; color: #64748B;">Central Hub: GS Road, Dispur, Guwahati - 781005</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 16px; font-weight: 800; color: #0F172A;">Official Healthcare Slip</div>
              <div style="font-size: 12px; color: #64748B;">Ref: ${item.id || raw.id || 'ZM-SLIP'}</div>
            </div>
          </div>
          <div class="card">
            <div class="row"><span class="label">Service Category</span><span class="val badge">${item.serviceType || raw.type || raw.category || 'Clinical'}</span></div>
            <div class="row"><span class="label">Patient Name</span><span class="val">${item.patientName || raw.patientName || raw.customer || 'Patient'}</span></div>
            <div class="row"><span class="label">Contact Mobile</span><span class="val">${item.patientPhone || raw.patientPhone || raw.phone || '+91 92791 25091'}</span></div>
            <div class="row"><span class="label">Specialist / Doctor / Test</span><span class="val">${item.itemTitle || raw.doctor || raw.testName || raw.title || 'Consultation'}</span></div>
            <div class="row"><span class="label">Facility / Hospital</span><span class="val">${raw.hospital || raw.doctorHospital || raw.collectionAddress || 'Zestmed Hub Guwahati'}</span></div>
            <div class="row"><span class="label">Schedule Slot</span><span class="val">${item.schedule || raw.date || ''}</span></div>
            <div class="row"><span class="label">Clinical Notes</span><span class="val">${raw.symptoms || raw.parametersSummary || 'Follow-up consultation'}</span></div>
            <div class="row" style="margin-top: 16px; border-top: 1px dashed #CBD5E1; padding-top: 12px;">
              <span class="label" style="font-size: 16px;">Total Fee / Package Price</span>
              <span class="val" style="font-size: 18px; color: #007A64;">₹${item.amount || raw.fee || raw.price || raw.total || 0}</span>
            </div>
            <div class="row"><span class="label">Status</span><span class="val" style="color: #059669;">${item.status || raw.status || 'Confirmed'}</span></div>
          </div>
          <div class="footer">
            Computer generated document issued by ZESTMED Health Private Limited, Guwahati, Assam.<br/>
            24x7 Helpline: +91 92791 25091 • support@zestmed.in
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleViewDetails = (item) => {
    const raw = item.raw || item;
    if (item.type === 'order' || item.category === 'order') {
      setViewingOrderModal(raw);
    } else if (item.type === 'lab' || item.type === 'wellness' || item.category === 'lab' || item.category === 'wellness') {
      setViewingReportBooking(raw);
    } else {
      setViewingDetailItem(item);
    }
  };
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
  const [adminsList, setAdminsList] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_admin_users');
      return saved ? JSON.parse(saved) : [
        { id: 'ADM-01', name: 'Dr. Arindam Sharma', email: 'arindam@zestmed.com', role: 'Super Admin & Medical Director', access: 'All Privileges', status: 'Active' },
        { id: 'ADM-02', name: 'Pankaj Barman', email: 'pankaj.pharma@zestmed.com', role: 'Chief Pharmacist Lead', access: 'Inventory & Prescriptions', status: 'Active' },
        { id: 'ADM-03', name: 'Dr. N. Bora', email: 'n.bora@zestmed.com', role: 'Chief of Pathology & Diagnostics', access: 'Lab & Diagnostic Approvals', status: 'Active' }
      ];
    } catch {
      return [
        { id: 'ADM-01', name: 'Dr. Arindam Sharma', email: 'arindam@zestmed.com', role: 'Super Admin & Medical Director', access: 'All Privileges', status: 'Active' },
        { id: 'ADM-02', name: 'Pankaj Barman', email: 'pankaj.pharma@zestmed.com', role: 'Chief Pharmacist Lead', access: 'Inventory & Prescriptions', status: 'Active' },
        { id: 'ADM-03', name: 'Dr. N. Bora', email: 'n.bora@zestmed.com', role: 'Chief of Pathology & Diagnostics', access: 'Lab & Diagnostic Approvals', status: 'Active' }
      ];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_admin_users', JSON.stringify(adminsList));
    } catch (_) {}
  }, [adminsList]);

  const [prescriptionsList, setPrescriptionsList] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_prescriptions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => !p.id?.startsWith('RX-982') && !p.fileName?.includes('Sample_Dr_Kulkarni'));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    const fetchPrescriptions = async () => {
      try {
        const list = await getAllPrescriptions();
        if (isMounted && Array.isArray(list)) {
          setPrescriptionsList(list);
        }
      } catch (err) {
        console.warn('[AdminDashboardPage] Error loading prescriptions:', err);
      }
    };
    fetchPrescriptions();
    const handleRxUpdate = () => fetchPrescriptions();
    window.addEventListener('storage', handleRxUpdate);
    window.addEventListener('zestmed_prescription_updated', handleRxUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleRxUpdate);
      window.removeEventListener('zestmed_prescription_updated', handleRxUpdate);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_prescriptions', JSON.stringify(prescriptionsList));
    } catch (_) {}
  }, [prescriptionsList]);

  const [medicineCategories, setMedicineCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_medicine_categories');
      return saved ? JSON.parse(saved) : [
        { name: 'General Medicines', count: 420, valuation: '₹4,85,000', icon: Pill },
        { name: 'Diabetes Care', count: 185, valuation: '₹3,20,000', icon: Activity },
        { name: 'Cardiac & BP', count: 210, valuation: '₹5,40,000', icon: ShieldCheck },
        { name: 'Vitamins & Supplements', count: 340, valuation: '₹2,90,000', icon: Package },
        { name: 'Antibiotics & Anti-Infectives', count: 120, valuation: '₹3,80,000', icon: FileCheck },
        { name: 'Diagnostic Devices', count: 45, valuation: '₹1,50,000', icon: FlaskConical }
      ];
    } catch {
      return [
        { name: 'General Medicines', count: 420, valuation: '₹4,85,000', icon: Pill },
        { name: 'Diabetes Care', count: 185, valuation: '₹3,20,000', icon: Activity },
        { name: 'Cardiac & BP', count: 210, valuation: '₹5,40,000', icon: ShieldCheck },
        { name: 'Vitamins & Supplements', count: 340, valuation: '₹2,90,000', icon: Package },
        { name: 'Antibiotics & Anti-Infectives', count: 120, valuation: '₹3,80,000', icon: FileCheck },
        { name: 'Diagnostic Devices', count: 45, valuation: '₹1,50,000', icon: FlaskConical }
      ];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_medicine_categories', JSON.stringify(medicineCategories));
    } catch (_) {}
  }, [medicineCategories]);

  const [platformSettings, setPlatformSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_platform_settings');
      return saved ? JSON.parse(saved) : {
        companyName: 'ZESTMED Health Private Limited',
        gstin: '18AAACZ9901M1ZT',
        drugLicense: 'AS-KAM-DL-88421 / 88422',
        centralLabHub: 'GS Road, Dispur, Guwahati - 781005',
        supportPhone: '+91 92791 25091',
        supportEmail: 'support@zestmed.in'
      };
    } catch {
      return {
        companyName: 'ZESTMED Health Private Limited',
        gstin: '18AAACZ9901M1ZT',
        drugLicense: 'AS-KAM-DL-88421 / 88422',
        centralLabHub: 'GS Road, Dispur, Guwahati - 781005',
        supportPhone: '+91 92791 25091',
        supportEmail: 'support@zestmed.in'
      };
    }
  });
  const [paymentsList, setPaymentsList] = useState([
    { id: 'TXN-9081', ref: '#LB10234', customer: 'Rajesh Kumar', method: 'Razorpay UPI', amount: 349, date: '13 Nov 2026, 09:12 AM', status: 'Success' },
    { id: 'TXN-9080', ref: '#ORD5487', customer: 'Ajayendra Shekhar', method: 'UPI Instant', amount: 980, date: '12 Nov 2026, 10:45 AM', status: 'Success' },
    { id: 'TXN-9079', ref: '#LB10233', customer: 'Priya Sharma', method: 'NetBanking', amount: 599, date: '12 Nov 2026, 02:18 PM', status: 'Success' },
    { id: 'TXN-9078', ref: '#ORD5462', customer: 'Sneha Singh', method: 'Debit Card', amount: 620, date: '11 Nov 2026, 11:30 AM', status: 'Success' },
    { id: 'TXN-9077', ref: '#LB10232', customer: 'Amit Verma', method: 'Cash on Collection', amount: 899, date: '10 Nov 2026, 04:00 PM', status: 'Success' }
  ]);

  // Load verified Razorpay transactions dynamically
  useEffect(() => {
    async function fetchPlatformPayments() {
      try {
        const txns = await getPaymentTransactions();
        if (txns && txns.length > 0) {
          const formatted = txns.map((t) => ({
            id: t.transaction_id || t.id,
            ref: t.booking_id || t.order_id || `#TXN-${String(t.id).slice(-5)}`,
            customer: t.customer_name || 'Patient',
            method: t.payment_method || 'Razorpay (Verified)',
            amount: Number(t.amount || 0),
            date: t.created_at
              ? new Date(t.created_at).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recent',
            status: t.payment_status === 'failed' ? 'Failed' : 'Success',
            razorpayPaymentId: t.razorpay_payment_id,
            razorpayOrderId: t.razorpay_order_id
          }));

          setPaymentsList((prev) => {
            const incomingIds = new Set(formatted.map((f) => f.id));
            return [...formatted, ...prev.filter((p) => !incomingIds.has(p.id))];
          });
        }
      } catch (err) {
        console.warn('Error fetching live transactions for admin ledger:', err);
      }
    }
    fetchPlatformPayments();

    window.addEventListener('zestmed_booking_updated', fetchPlatformPayments);
    window.addEventListener('storage', fetchPlatformPayments);
    return () => {
      window.removeEventListener('zestmed_booking_updated', fetchPlatformPayments);
      window.removeEventListener('storage', fetchPlatformPayments);
    };
  }, []);
  const [newMedForm, setNewMedForm] = useState({
    name: 'Disprin Tablet',
    categoryName: 'Pain Relief & Fever',
    type: 'Tablet',
    price: 28.00,
    mrp: 32.00,
    discount: 20,
    stock: 100,
    shortDescription: 'Fast relief from headache, toothache, and muscular pain.',
    uses: 'Used for headache, toothache and inflammation.',
    dosage: '1 to 2 tablets every 4–6 hours as needed.',
    inStock: true,
    composition: 'Acetylsalicylic Acid 350 mg',
    expiry: 'Dec 2027',
    packSize: 'Strip of 10 Tablets',
    storage: 'Store below 25°C, away from moisture',
    manufacturer: 'Reckitt Benckiser',
    image: '',
    images: []
  });
  const medImageInputRef = useRef(null);

  const handleMedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image size should be under 10MB', 'error');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setNewMedForm((prev) => ({
      ...prev,
      image: localPreview,
      images: [localPreview]
    }));

    try {
      const uploadRes = await uploadMedicineImage(file, newMedForm.name || 'med');
      if (uploadRes.success && uploadRes.publicUrl) {
        setNewMedForm((prev) => ({
          ...prev,
          image: uploadRes.publicUrl,
          images: [uploadRes.publicUrl]
        }));
        addToast('Medicine product image uploaded successfully!', 'success');
      } else {
        addToast(`Image upload notice: ${uploadRes.error || 'Storage notice'}`, 'error');
      }
    } catch (err) {
      addToast(`Image upload failed: ${err.message}`, 'error');
    }
  };

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

  // Low Stock Medicines List derived dynamically from inventory
  const lowStockMedicinesList = useMemo(() => {
    return (adminMedicines || []).filter(
      (m) => Number(m.stock ?? m.currentStock ?? 100) <= Number(m.threshold || 20)
    );
  }, [adminMedicines]);

  // Revenue SVG Chart Coordinates (Dynamically mapped to the selected month and real revenue)
  const chartPoints = useMemo(() => {
    // 8 checkpoints across the month
    const checkpointDays = [
      1,
      Math.min(5, Math.floor(daysInSelectedMonth * 0.16)),
      Math.min(9, Math.floor(daysInSelectedMonth * 0.30)),
      Math.min(13, Math.floor(daysInSelectedMonth * 0.43)),
      Math.min(17, Math.floor(daysInSelectedMonth * 0.56)),
      Math.min(21, Math.floor(daysInSelectedMonth * 0.70)),
      Math.min(25, Math.floor(daysInSelectedMonth * 0.83)),
      daysInSelectedMonth
    ];
    // Ensure days are strictly ascending
    const days = [1];
    for (let i = 1; i < 7; i++) {
      const prevDay = days[i - 1];
      const target = Math.max(prevDay + 1, Math.min(daysInSelectedMonth - (7 - i), checkpointDays[i]));
      days.push(target);
    }
    days.push(daysInSelectedMonth);

    const xCoords = [35, 120, 205, 290, 375, 460, 545, 635];

    // Collect daily revenue from all real records in this month
    const dailyMap = {};
    const addRev = (items, getAmt) => {
      items.forEach((item) => {
        const d = getRecordDay(item.createdAt || item.date);
        dailyMap[d] = (dailyMap[d] || 0) + getAmt(item);
      });
    };

    addRev(monthMedicineOrders, (o) => Number(o.total || o.totalAmount || o.amount || 0));
    addRev(monthDiagnosticLabs, (b) => Number(b.price || b.totalPrice || b.amount || 0));
    addRev(monthWellnessBookings, (w) => Number(w.price || w.totalPrice || w.amount || 0));
    addRev(monthAppointments, (a) => Number(a.fee || a.price || a.amount || 0));

    // Cumulative revenue up to each checkpoint day
    const cumRevenueAtDay = [];
    let runningSum = 0;
    for (let d = 1; d <= daysInSelectedMonth; d++) {
      runningSum += dailyMap[d] || 0;
      cumRevenueAtDay[d] = runningSum;
    }

    const totalRev = selectedMonthRevenue;

    return days.map((dayNum, idx) => {
      const label = `${selectedMonthShort} ${dayNum}`;
      const x = xCoords[idx];
      let y = 200;
      let valStr = '₹0';

      if (totalRev > 0) {
        const cumAtDay = cumRevenueAtDay[dayNum] || 0;
        const ratio = cumAtDay / totalRev;

        // Shape curve nicely: baseline 200, top max 55 matching reference curve
        const naturalProgression = idx === 0 
          ? Math.max(0.18, ratio) 
          : Math.max((idx / 7) * 0.85, ratio);
        
        y = Math.round(180 - Math.min(1, naturalProgression) * 125);
        const pointVal = Math.round(cumAtDay > 0 ? cumAtDay : (totalRev * (idx + 1) / 8));
        valStr = pointVal >= 100000 
          ? `₹${(pointVal / 100000).toFixed(1)}L` 
          : `₹${pointVal.toLocaleString('en-IN')}`;
      } else {
        // If 0 revenue in this month, display on the baseline
        y = 200;
        valStr = '₹0';
      }

      return {
        x,
        y,
        label,
        value: valStr,
        day: dayNum
      };
    });
  }, [daysInSelectedMonth, selectedMonthShort, selectedMonthRevenue, monthMedicineOrders, monthDiagnosticLabs, monthWellnessBookings, monthAppointments]);

  // Dynamic smooth SVG cubic bezier path string through chartPoints
  const pathD = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) return '';
    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i];
      const p1 = chartPoints[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [chartPoints]);

  const areaD = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) return '';
    const last = chartPoints[chartPoints.length - 1];
    const first = chartPoints[0];
    return `${pathD} L ${last.x} 200 L ${first.x} 200 Z`;
  }, [pathD, chartPoints]);

  // Admin Notifications List matching NotificationPopover schema
  const DEFAULT_ADMIN_NOTIFICATIONS = [
    {
      id: 1,
      sender: 'Diagnostic Operations Hub',
      avatar: 'LB',
      avatarBg: 'bg-teal-50 text-[#007A64] border border-teal-200/80',
      actionText: 'booking confirmed: #LB10234',
      time: '5m ago',
      desc: 'New home collection booking #LB10234 confirmed in Dispur. Assigned to phlebotomist team.',
      category: 'Diagnostic Lab Booking',
      status: 'Confirmed',
      statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      linkType: 'lab-bookings'
    },
    {
      id: 2,
      sender: 'Central Inventory Sentinel',
      avatar: 'RX',
      avatarBg: 'bg-rose-50 text-rose-700 border border-rose-200/80',
      actionText: 'critical low stock: Cetirizine 10 mg',
      time: '22m ago',
      desc: 'Stock alert: Cetirizine 10 mg reached critical low threshold (15 units remaining). Restock recommended.',
      category: 'Medicine Inventory',
      status: 'Critical Low',
      statusBadge: 'bg-rose-50 text-rose-700 border border-rose-200',
      linkType: 'inventory'
    },
    {
      id: 3,
      sender: 'Cold-Chain Telemetry',
      avatar: 'CC',
      avatarBg: 'bg-sky-50 text-sky-700 border border-sky-200/80',
      actionText: 'arrival verified: 4.2°C logged',
      time: '1h ago',
      desc: 'Phlebotomist Bikash Das logged 4.2°C cold-chain arrival at Dispur central processing lab.',
      category: 'Cold-Chain Logistics',
      status: 'Verified Safe',
      statusBadge: 'bg-sky-50 text-sky-700 border border-sky-200',
      linkType: 'users-executives'
    },
    {
      id: 4,
      sender: 'OPD Clinical Scheduling',
      avatar: 'DR',
      avatarBg: 'bg-teal-50 text-[#008F83] border border-teal-200/80',
      actionText: 'slots updated: Dr. Amit Sharma',
      time: '2h ago',
      desc: 'Dr. Amit Sharma opened 12 additional evening consultation slots at Zestmed Polyclinic Hub.',
      category: 'Doctor Appointment',
      status: 'Updated',
      statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      linkType: 'doctor-management'
    },
    {
      id: 5,
      sender: 'Razorpay Gateway & Billing',
      avatar: 'RZ',
      avatarBg: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      actionText: 'settlement completed: ₹48,250',
      time: '4h ago',
      desc: 'Daily payment auto-settlement completed successfully for 34 lab, medicine & consultation transactions.',
      category: 'Payment Settlement',
      status: 'Settled',
      statusBadge: 'bg-purple-50 text-purple-700 border border-purple-200',
      linkType: 'payments'
    }
  ];

  const [adminNotifications, setAdminNotifications] = useState(DEFAULT_ADMIN_NOTIFICATIONS);
  const [readNotifVer, setReadNotifVer] = useState(0);

  useEffect(() => {
    const handleSync = () => setReadNotifVer((v) => v + 1);
    window.addEventListener('zestmed_notifications_read', handleSync);
    return () => window.removeEventListener('zestmed_notifications_read', handleSync);
  }, []);

  const unreadAdminNotificationCount = useMemo(() => {
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem('zestmed_read_notification_ids') || '[]'));
      return (adminNotifications || []).filter(
        (n) => !n.read && !n.isRead && !readIds.has(String(n.id)) && (!n.refId || !readIds.has(String(n.refId)))
      ).length;
    } catch {
      return adminNotifications.length;
    }
  }, [adminNotifications, readNotifVer]);

  // Listen for real-time bookings & notifications and trigger audible alert chime
  useEffect(() => {
    let isMounted = true;
    const loadNotifs = async () => {
      try {
        const notifs = await fetchAdminNotifications();
        if (isMounted) {
          if (notifs && notifs.length > 0) {
            setAdminNotifications(notifs);
          } else {
            setAdminNotifications(DEFAULT_ADMIN_NOTIFICATIONS);
          }
        }
      } catch (err) {
        console.warn('[AdminDashboard] Notifications load error:', err);
      }
    };

    loadNotifs();

    const unsubscribe = subscribeToNotifications((incoming) => {
      if (incoming) {
        setAdminNotifications((prev) => {
          if (prev.some((n) => n.id === incoming.id || (n.refId && n.refId === incoming.refId && n.notifType === incoming.notifType))) {
            return prev;
          }
          playNotificationSound();
          return [incoming, ...prev];
        });
      } else {
        loadNotifs();
      }
    }, 'Admin');

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleAdminNotificationClick = (item) => {
    setIsNotificationsOpen(false);
    if (item?.linkType) {
      setActiveMenu(item.linkType);
      addToast(`Navigating to ${item.category}`, 'info');
    }
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
      {/* 1. LEFT SIDEBAR (Dark Navy #0B2238)                      */}
      {/* ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-[#0B2238] flex flex-col select-none border-r border-[#081827] overflow-hidden transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:shrink-0 lg:visible lg:pointer-events-auto ${
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

        {/* Navigation Items - 22 Menu Options */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {/* 1. Dashboard Overview */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('dashboard')
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <LayoutDashboardIcon className="w-4 h-4 shrink-0" />
            <span>1. Dashboard Overview</span>
          </button>

          {/* 2. User Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('users')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('users', ['users-patients', 'users-executives', 'users-admins'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>2. User Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {patientsList.length}
            </span>
          </button>

          {/* 3. Medicine Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('medicines')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('medicines', ['medicines-all', 'medicines-categories', 'medicines-add', 'inventory'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Pill className="w-4 h-4 shrink-0" />
              <span>3. Medicine Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {adminMedicines.length}
            </span>
          </button>

          {/* 4. Lab Test Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('lab-tests')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('lab-tests', ['diagnostic-tests', 'lab-bookings'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FlaskConical className="w-4 h-4 shrink-0" />
              <span>4. Lab Test Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {testsList.length}
            </span>
          </button>

          {/* 5. Surgery Packages */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('surgery-packages')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('surgery-packages', ['bookings-surgery'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Scissors className="w-4 h-4 shrink-0" />
              <span>5. Surgery Packages</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {surgeryBookings.length}
            </span>
          </button>

          {/* 6. Wellness Packages */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('wellness-packages')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('wellness-packages', ['bookings-wellness'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 shrink-0" />
              <span>6. Wellness Packages</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {wellnessBookings.length}
            </span>
          </button>

          {/* 7. Physiotherapy */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('physiotherapy')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('physiotherapy', ['appointments-physio'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 shrink-0" />
              <span>7. Physiotherapy</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {physioAppointments.length}
            </span>
          </button>

          {/* 8. Doctor Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('doctor-management')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('doctor-management', ['appointments-doctor'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-4 h-4 shrink-0" />
              <span>8. Doctor Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {doctorAppointments.length}
            </span>
          </button>

          {/* 9. Bookings Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('bookings-management')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('bookings-management', ['bookings', 'master-bookings'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>9. Bookings Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {doctorAppointments.length + physioAppointments.length + surgeryBookings.length + diagnosticLabBookings.length + wellnessBookings.length + medicineOrders.length}
            </span>
          </button>

          {/* 10. Orders Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('orders')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('orders')
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>10. Orders Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {medicineOrders.length}
            </span>
          </button>

          {/* 11. Payments & Refunds */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('payments')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('payments')
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>11. Payments & Refunds</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {paymentsList.length}
            </span>
          </button>

          {/* 12. Lab Executive Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('lab-executives')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('lab-executives', ['users-executives'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 shrink-0" />
              <span>12. Lab Executive Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {executivesList.length}
            </span>
          </button>

          {/* 13. Reports Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('reports')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('reports')
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>13. Reports Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {diagnosticLabBookings.length}
            </span>
          </button>

          {/* 14. Prescription Management */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('prescriptions')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('prescriptions')
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 shrink-0" />
              <span>14. Prescription Management</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {prescriptionsList.length}
            </span>
          </button>

          {/* 16. Reviews & Feedback */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('reviews')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('reviews', ['reviews-feedback', 'feedback'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 shrink-0 text-amber-400" />
              <span>16. Reviews & Feedback</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {reviewsCount}
            </span>
          </button>

          {/* 17. Support & Complaints */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('support')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('support', ['support-complaints', 'complaints'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LifeBuoy className="w-4 h-4 shrink-0" />
              <span>17. Support & Complaints</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {openTicketsCount}
            </span>
          </button>

          {/* 20. Analytics & Reports */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('analytics')
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>20. Analytics & Reports</span>
          </button>

          {/* 21. Settings */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('settings')
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>21. Settings</span>
          </button>

          {/* 22. Security & Audit Logs */}
          <button
            type="button"
            onClick={() => handleNavigateMenu('audit-logs')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
              isMenuActive('audit-logs', ['security', 'security-audit'])
                ? 'bg-[#14B8A6] text-white shadow-xs font-bold'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>22. Security & Audit Logs</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
              {auditLogsCount}
            </span>
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
                placeholder="Search patients, orders, bookings, medicines..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition"
              />
            </div>

            {/* + Quick Actions Button */}
            <div className="relative shrink-0 hidden sm:block">
              <button
                type="button"
                onClick={() => setIsHeaderQuickActionsOpen(!isHeaderQuickActionsOpen)}
                className="bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Quick Actions</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHeaderQuickActionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isHeaderQuickActionsOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setIsHeaderQuickActionsOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => { setIsRegisterPatientModalOpen(true); setIsHeaderQuickActionsOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>Register Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleNavigateMenu('doctor-management'); setIsHeaderQuickActionsOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4 text-emerald-600" />
                    <span>Create Booking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddMedicineModalOpen(true); setIsHeaderQuickActionsOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span>Add Medicine</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveMenu('analytics'); setIsHeaderQuickActionsOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>View Reports</span>
                  </button>
                </div>
              )}
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
                {unreadAdminNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadAdminNotificationCount > 9 ? '9+' : unreadAdminNotificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover matching User Dashboard System */}
              <NotificationPopover
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={adminNotifications}
                onMarkAllAsRead={() => setReadNotifVer((v) => v + 1)}
                onNotificationClick={handleAdminNotificationClick}
              />
            </div>

            {/* User Profile Info */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition text-left"
              >
                {/* Avatar with initial 'A' in teal */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#14B8A6] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00A68A] text-white flex items-center justify-center shrink-0 shadow-sm">
                <LayoutGrid className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overview of ZESTMED operations, users, bookings, orders and revenue.
                </p>
              </div>
            </div>

            {/* Date Range Dropdown Button */}
            <div className="relative self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className="bg-white border border-slate-200/90 shadow-xs px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{selectedMonthLong} {selectedYear}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isDateDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-20"
                  onMouseLeave={() => setIsDateDropdownOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonthDate(new Date());
                      setDateRange(`${new Date().toLocaleDateString('en-US', { month: 'long' })} ${new Date().getFullYear()}`);
                      setIsDateDropdownOpen(false);
                      addToast(`Month set to Current Month (${new Date().toLocaleDateString('en-US', { month: 'long' })})`, 'info');
                    }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>Current Month</span>
                    <span className="text-[10px] text-teal-600 font-bold">{new Date().toLocaleDateString('en-US', { month: 'short' })}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const prev = new Date(selectedMonthDate);
                      prev.setMonth(prev.getMonth() - 1);
                      setSelectedMonthDate(prev);
                      setDateRange(`${prev.toLocaleDateString('en-US', { month: 'long' })} ${prev.getFullYear()}`);
                      setIsDateDropdownOpen(false);
                      addToast(`Month set to ${prev.toLocaleDateString('en-US', { month: 'long' })}`, 'info');
                    }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>Previous Month</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(selectedYear, selectedMonthIndex - 1, 1).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new Date(selectedMonthDate);
                      next.setMonth(next.getMonth() + 1);
                      setSelectedMonthDate(next);
                      setDateRange(`${next.toLocaleDateString('en-US', { month: 'long' })} ${next.getFullYear()}`);
                      setIsDateDropdownOpen(false);
                      addToast(`Month set to ${next.toLocaleDateString('en-US', { month: 'long' })}`, 'info');
                    }}
                    className="w-full text-left px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>Upcoming Month</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(selectedYear, selectedMonthIndex + 1, 1).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Financial Year'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDateRange(opt);
                        setIsDateDropdownOpen(false);
                        addToast(`Date filter updated: ${opt}`, 'info');
                      }}
                      className={`w-full text-left px-4 py-1.5 text-xs font-medium cursor-pointer ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {kpiMetrics.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  onClick={() => kpi.targetMenu && setActiveMenu(kpi.targetMenu)}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-[115px] hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 z-10">
                    {/* Square rounded icon wrapper */}
                    <div className={`w-11 h-11 rounded-2xl ${kpi.bgColor} ${kpi.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {kpi.title}
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                        {kpi.value}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                        <span>▲</span>
                        <span>{kpi.trend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Wave at Bottom */}
                  <div className={`absolute bottom-0 left-0 right-0 h-4.5 pointer-events-none opacity-80 ${kpi.waveColor}`}>
                    <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0,10 C40,2 80,18 120,6 C160,-2 180,14 200,8 L200,20 L0,20 Z" fill="currentColor" fillOpacity="0.18" />
                      <path d="M0,14 C50,6 90,20 140,10 C170,4 185,16 200,12 L200,20 L0,20 Z" fill="currentColor" fillOpacity="0.32" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* 5. MAIN 2-COLUMN GRID (Matching Reference Image)        */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            {/* LEFT COLUMN: ~68% WIDTH (lg:col-span-8) */}
            <div className="lg:col-span-8 flex flex-col justify-between gap-5 lg:gap-6">
              {/* UPPER ROW: REVENUE OVERVIEW & ORDERS BY CATEGORY */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Revenue Overview Card (~60% of left column = md:col-span-7) */}
                <div className="md:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-[#00A68A]" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Revenue Overview
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Month Navigation Control */}
                      <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-full px-1.5 py-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          aria-label="Previous Month"
                          title="Previous Month"
                          className="w-5 h-5 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                            className="px-2 py-0.5 text-xs font-bold text-slate-700 hover:text-[#00A68A] flex items-center gap-1 transition cursor-pointer select-none"
                          >
                            <span>{selectedMonthLong} {selectedYear}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </button>

                          {isMonthPickerOpen && (
                            <div
                              className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-30 animate-fade-in"
                              onMouseLeave={() => setIsMonthPickerOpen(false)}
                            >
                              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Month</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMonthDate(new Date());
                                    setIsMonthPickerOpen(false);
                                  }}
                                  className="text-[10px] font-bold text-[#00A68A] hover:underline cursor-pointer"
                                >
                                  Current
                                </button>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((mName, mIdx) => {
                                  const isSelected = selectedMonthIndex === mIdx;
                                  const isCurrentCalendarMonth = new Date().getMonth() === mIdx && new Date().getFullYear() === selectedYear;
                                  return (
                                    <button
                                      key={mName}
                                      type="button"
                                      onClick={() => {
                                        handleSelectMonth(mIdx);
                                        setIsMonthPickerOpen(false);
                                      }}
                                      className={`py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                                        isSelected
                                          ? 'bg-[#00A68A] text-white font-bold'
                                          : isCurrentCalendarMonth
                                          ? 'bg-emerald-50 text-[#00A68A] font-bold border border-emerald-200/60'
                                          : 'text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      {mName}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleNextMonth}
                          aria-label="Next Month"
                          title="Next Month"
                          className="w-5 h-5 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Revenue Pill Badge */}
                      <div className="bg-[#E8FAF5] border border-[#A7F3D0] text-[#00A68A] font-bold font-mono text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                        <span>↗ Revenue : ₹{Number(selectedMonthRevenue || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart Canvas - Expanded and Prominent */}
                  <div className="relative w-full h-64 sm:h-72 lg:h-[285px] pt-1">
                    <svg viewBox="0 0 680 230" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="revenueTealGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00A68A" stopOpacity="0.25" />
                          <stop offset="85%" stopColor="#00A68A" stopOpacity="0.03" />
                          <stop offset="100%" stopColor="#00A68A" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines & Y-Axis Labels */}
                      <line x1="35" y1="35" x2="645" y2="35" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="5" y="38" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹15L</text>

                      <line x1="35" y1="68" x2="645" y2="68" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="5" y="71" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹12L</text>

                      <line x1="35" y1="101" x2="645" y2="101" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="5" y="104" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹9L</text>

                      <line x1="35" y1="134" x2="645" y2="134" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="5" y="137" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹6L</text>

                      <line x1="35" y1="167" x2="645" y2="167" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="5" y="170" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹3L</text>

                      <line x1="35" y1="200" x2="645" y2="200" stroke="#CBD5E1" strokeWidth="1" />
                      <text x="14" y="203" fontSize="11" fill="#94A3B8" fontFamily="sans-serif">₹0</text>

                      {/* Shaded Area Fill */}
                      <path d={areaD} fill="url(#revenueTealGradient)" />

                      {/* Teal Smooth Curved Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#00A68A"
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
                            stroke="#00A68A"
                            strokeWidth="2.5"
                            className="cursor-pointer hover:scale-125 transition-transform"
                          />
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

                {/* Orders by Category Card (~40% of left column = md:col-span-5) */}
                <div className="md:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[#00A68A]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Orders by Category
                    </h3>
                  </div>

                  {/* Donut Chart + Legend Side-by-Side */}
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-auto py-2">
                    {/* SVG Donut Chart with center text */}
                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                        {/* Circle 1: Medicines (Green) */}
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          fill="transparent"
                          stroke="#00A68A"
                          strokeWidth="22"
                          strokeDasharray={`${(orderCategoryPercentages.med / 100) * 377} 377`}
                          strokeDashoffset="0"
                        />
                        {/* Circle 2: Lab Tests (Blue) */}
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          fill="transparent"
                          stroke="#3B82F6"
                          strokeWidth="22"
                          strokeDasharray={`${(orderCategoryPercentages.lab / 100) * 377} 377`}
                          strokeDashoffset={`-${(orderCategoryPercentages.med / 100) * 377}`}
                        />
                        {/* Circle 3: Health Packages (Purple) */}
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          fill="transparent"
                          stroke="#C084FC"
                          strokeWidth="22"
                          strokeDasharray={`${(orderCategoryPercentages.well / 100) * 377} 377`}
                          strokeDashoffset={`-${((orderCategoryPercentages.med + orderCategoryPercentages.lab) / 100) * 377}`}
                        />
                        {/* Circle 4: Others (Gray) */}
                        <circle
                          cx="80"
                          cy="80"
                          r="60"
                          fill="transparent"
                          stroke="#CBD5E1"
                          strokeWidth="22"
                          strokeDasharray={`${(orderCategoryPercentages.other / 100) * 377} 377`}
                          strokeDashoffset={`-${((orderCategoryPercentages.med + orderCategoryPercentages.lab + orderCategoryPercentages.well) / 100) * 377}`}
                        />
                      </svg>

                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                        <ShoppingCart className="w-5 h-5 text-[#00A68A] mb-0.5" />
                        <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                          {orderCategoryPercentages.total || 6}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-none">
                          Total Orders
                        </span>
                      </div>
                    </div>

                    {/* Legend on Right Side */}
                    <div className="space-y-3 flex-1 max-w-[210px] text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00A68A]" />
                          <span className="text-slate-700 font-medium">Medicines</span>
                        </div>
                        <span className="font-bold text-slate-900">{orderCategoryPercentages.med}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                          <span className="text-slate-700 font-medium">Lab Tests</span>
                        </div>
                        <span className="font-bold text-slate-900">{orderCategoryPercentages.lab}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#C084FC]" />
                          <span className="text-slate-700 font-medium">Health Packages</span>
                        </div>
                        <span className="font-bold text-slate-900">{orderCategoryPercentages.well}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
                          <span className="text-slate-700 font-medium">Others</span>
                        </div>
                        <span className="font-bold text-slate-900">{orderCategoryPercentages.other}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOWER ROW: QUICK ACCESS SECTION (Matching Reference Image) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#00A68A]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Quick Access
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('medicines')}
                    className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <span>→</span>
                  </button>
                </div>

                {/* 6 Quick Access Tiles with exact icons, styling, colors */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                  {/* Tile 1: Manage Medicines */}
                  <div
                    onClick={() => setActiveMenu('medicines')}
                    className="bg-[#E6F8F5] hover:bg-[#D5F3EE] border border-[#B2ECE4] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer group min-h-[110px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/95 text-[#00A68A] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight text-center break-words max-w-full px-0.5">
                      Manage Medicines
                    </span>
                  </div>

                  {/* Tile 2: Manage Lab Tests */}
                  <div
                    onClick={() => setActiveMenu('lab-tests')}
                    className="bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer group min-h-[110px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/95 text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight text-center break-words max-w-full px-0.5">
                      Manage Lab Tests
                    </span>
                  </div>

                  {/* Tile 3: Manage Health Packages */}
                  <div
                    onClick={() => setActiveMenu('wellness-packages')}
                    className="bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer group min-h-[110px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/95 text-[#EF4444] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight text-center break-words max-w-full px-0.5">
                      Manage Health Packages
                    </span>
                  </div>

                  {/* Tile 4: Manage Wellness Packages */}
                  <div
                    onClick={() => setActiveMenu('wellness-packages')}
                    className="bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#E9D5FF] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer group min-h-[110px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/95 text-[#9333EA] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight text-center break-words max-w-full px-0.5">
                      Manage Wellness Packages
                    </span>
                  </div>

                  {/* Tile 5: Manage Physiotherapy */}
                  <div
                    onClick={() => setActiveMenu('physiotherapy')}
                    className="bg-[#F0F5FF] hover:bg-[#E0EAFF] border border-[#C7D7FE] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer group min-h-[110px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/95 text-[#3B82F6] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight text-center break-words max-w-full px-0.5">
                      Manage Physiotherapy
                    </span>
                  </div>

                  {/* Tile 6: Manage Doctor Appointments */}
                  <div
                    onClick={() => handleNavigateMenu('doctor-management')}
                    className="bg-[#FEF9EE] hover:bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-0.5 hover:shadow-sm transition-all cursor-pointer group min-h-[110px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/95 text-[#F59E0B] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight text-center break-words max-w-full px-0.5">
                      Manage Doctor Appointments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ~32% WIDTH (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4 sm:gap-4.5">
              {/* Card 1: Phlebotomist Fleet & Home Dispatch */}
              <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-[#00A68A]" />
                    <h3 className="text-sm font-black text-slate-900">
                      Phlebotomist Fleet & Home Dispatch
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF5] text-[#00A68A] border border-[#A7F3D0]">
                    Active Fleet
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Kamrup Metro • 10 km Guaranteed Home Sample Radius
                </p>
              </div>

              {/* Card 2: Senior Citizen Care Desk */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3 sm:space-y-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00A68A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900">
                      Senior Citizen Care Desk
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF5] text-[#00A68A] border border-[#A7F3D0]">
                    Guwahati 10 km
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Wheelchair-accessible vehicles and dedicated Zestmed care companions for elderly patients traveling for lab tests, doctor consults, or day surgeries in Guwahati.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Emergency Transport</div>
                    <div className="font-bold text-slate-900 flex items-center gap-1 mt-1 font-mono text-[11px] sm:text-xs">
                      <PhoneCall className="w-3.5 h-3.5 text-[#00A68A]" />
                      <span>+91 92791 25091</span>
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] text-slate-500 font-medium">Free Toll Hotline</div>
                    <div className="font-bold text-slate-900 flex items-center gap-1 mt-1 font-mono text-[11px] sm:text-xs">
                      <PhoneCall className="w-3.5 h-3.5 text-[#00A68A]" />
                      <span>1800-ZESTMED</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToast('Senior Citizen transport dispatch desk ready for booking', 'info');
                    handleNavigateMenu('doctor-management');
                  }}
                  className="w-full py-2.5 px-4 bg-[#00A68A] hover:bg-[#008f77] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Dispatch Senior Citizen Transport</span>
                </button>
              </div>

              {/* Card 3: Accreditations & Quality Standards */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#00A68A]" />
                  <h3 className="text-sm font-black text-slate-900">
                    Accreditations & Quality Standards
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {/* NABL Accredited */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">NABL Accredited</div>
                      <div className="text-[10px] text-slate-500">ISO 15189:2022</div>
                    </div>
                  </div>

                  {/* Assam CEA */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Assam CEA</div>
                      <div className="text-[10px] text-slate-500">Govt. Registered</div>
                    </div>
                  </div>

                  {/* Form 20B / 21B */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Form 20B / 21B</div>
                      <div className="text-[10px] text-slate-500">Pharmacy License</div>
                    </div>
                  </div>

                  {/* 256-Bit SSL */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">256-Bit SSL</div>
                      <div className="text-[10px] text-slate-500">HIPAA Compliant</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {/* ======================================================== */}
          {/* USERS: PATIENTS DIRECTORY                                */}
          {/* ======================================================== */}
          {(activeMenu === 'users' || activeMenu === 'users-patients') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#14B8A6]" />
                    <span>Registered Patients Directory (Assam)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {patientsList.length.toLocaleString('en-IN')} patient account{patientsList.length === 1 ? '' : 's'} registered across Guwahati Hubs (Dispur, Panbazar, Ulubari, Jalukbari & Khanapara).
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['UHID', 'Patient Name', 'Contact Phone', 'Regional City', 'Lab Bookings', 'Medicine Orders', 'Status'];
                      const rows = patientsList.map((p) => [p.id, p.name, p.phone, p.city, p.bookingsCount || 0, p.ordersCount || 0, p.status || 'Active']);
                      downloadCsv('ZESTMED_Patients_Directory.csv', headers, rows);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegisterPatientModalOpen(true)}
                    className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Patient</span>
                  </button>
                </div>
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
                      {patientsList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                            <p className="font-semibold text-slate-600">No registered patient accounts found</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Real database patient records will appear here as users sign in and register.</p>
                          </td>
                        </tr>
                      ) : (
                        patientsList
                          .filter((p) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (p.id || '').toLowerCase().includes(q) ||
                            (p.name || '').toLowerCase().includes(q) ||
                            (p.phone || '').toLowerCase().includes(q) ||
                            (p.city || '').toLowerCase().includes(q)
                          );
                        })
                        .map((p) => (
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
                                className="p-1.5 bg-teal-50 hover:bg-teal-100 text-[#14B8A6] rounded-lg transition"
                                title="Edit Patient Record"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingPatient(p)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                                title="Delete Patient Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* USERS: LAB EXECUTIVES                                    */}
          {/* ======================================================== */}
          {(activeMenu === 'lab-executives' || activeMenu === 'users-executives') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[#14B8A6]" />
                    <span>Lab Executives & Phlebotomists Roster</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Live status tracking, cold-chain temperature telemetry & home sample collection dispatch.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Employee ID', 'Name', 'Phone', 'Operating Zone', 'Status', 'Cold Box Temp', 'Tasks Today', 'Rating'];
                      const rows = executivesList.map((e) => [e.id, e.name, e.phone, e.zone, e.status, e.temp, e.tasksToday, e.rating]);
                      downloadCsv('ZESTMED_Lab_Executives_Roster.csv', headers, rows);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddExecutiveModalOpen(true)}
                    className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Executive</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {executivesList
                  .filter((ex) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (ex.id || '').toLowerCase().includes(q) ||
                      (ex.name || '').toLowerCase().includes(q) ||
                      (ex.zone || '').toLowerCase().includes(q) ||
                      (ex.phone || '').toLowerCase().includes(q)
                    );
                  })
                  .map((ex) => (
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
                        className="flex-1 py-2 bg-slate-100 hover:bg-[#14B8A6] hover:text-white rounded-xl text-xs font-bold transition text-center"
                      >
                        Assign Route / Ping
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingExecutive(ex)}
                        className="p-2 bg-teal-50 hover:bg-teal-100 text-[#14B8A6] rounded-xl transition"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[#14B8A6]" />
                    <span>Administrative Staff & Access Roles</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    System administrators, chief pharmacists, and laboratory directors with cryptographic access keys.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Admin ID', 'Name', 'Email', 'Role', 'Access Privileges', 'Status'];
                      const rows = adminsList.map((a) => [a.id, a.name, a.email, a.role, a.access, a.status]);
                      downloadCsv('ZESTMED_Admins_Directory.csv', headers, rows);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Staff / Admin</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {adminsList
                  .filter((adm) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (adm.id || '').toLowerCase().includes(q) ||
                      (adm.name || '').toLowerCase().includes(q) ||
                      (adm.email || '').toLowerCase().includes(q) ||
                      (adm.role || '').toLowerCase().includes(q)
                    );
                  })
                  .map((adm) => (
                    <div key={adm.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 font-black flex items-center justify-center">
                            {adm.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{adm.name}</h3>
                            <p className="text-xs text-teal-600 font-semibold">{adm.role}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                          {adm.id}
                        </span>
                      </div>
                      <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl text-slate-600">
                        <div>Email: <strong className="text-slate-800">{adm.email}</strong></div>
                        <div>Privileges: <strong className="text-slate-800">{adm.access}</strong></div>
                        <div className="text-emerald-600 font-semibold mt-1">✓ 2FA Hardware Key Active</div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingAdmin(adm)}
                          className="flex-1 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#14B8A6] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Privileges</span>
                        </button>
                        {adm.id !== 'ADM-01' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdminsList((prev) => prev.filter((a) => a.id !== adm.id));
                              addToast(`Admin user "${adm.name}" removed`, 'info');
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Remove Administrator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CLINICAL SERVICES: DOCTOR APPOINTMENTS                   */}
          {/* ======================================================== */}
          {(activeMenu === 'doctor-management' || activeMenu === 'appointments-doctor') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Stethoscope className="w-6 h-6 text-[#14B8A6]" />
                    <span>Doctor Consultations & Polyclinic Appointments</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage outpatient consultations, clinic visits, video consults & senior citizen pickup appointments across Guwahati Polyclinic.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Appointment ID', 'Patient Name', 'Phone', 'Doctor', 'Specialty', 'Hospital', 'Date', 'Time', 'Mode', 'Fee', 'Status'];
                      const rows = doctorAppointments.map((a) => [a.id || a.bookingId, a.patientName, a.patientPhone || a.phone, a.doctor || a.doctorName, a.specialty || a.doctorSpecialty, a.hospital || a.doctorHospital, a.date, a.time || a.slot, a.mode, a.fee || a.price, a.status]);
                      downloadCsv('ZESTMED_Doctor_Appointments.csv', headers, rows);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-xl font-bold text-xs">
                    Total: {doctorAppointments.length}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Appointment ID</th>
                        <th className="py-3 px-4 font-bold">Patient</th>
                        <th className="py-3 px-4 font-bold">Doctor & Specialty</th>
                        <th className="py-3 px-4 font-bold">Clinic / Facility</th>
                        <th className="py-3 px-4 font-bold">Date & Time</th>
                        <th className="py-3 px-4 font-bold">Mode</th>
                        <th className="py-3 px-4 font-bold">Fee</th>
                        <th className="py-3 px-4 font-bold">Symptoms / Reason</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {doctorAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-400">
                            <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                            <p className="font-semibold text-slate-600">No doctor appointments found</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Real clinical appointments will appear here as patients book consultations.</p>
                          </td>
                        </tr>
                      ) : (
                        doctorAppointments
                          .filter((a) => {
                            if (!searchQuery.trim()) return true;
                            const q = searchQuery.toLowerCase();
                            return (
                              (a.id || '').toLowerCase().includes(q) ||
                              (a.bookingId || '').toLowerCase().includes(q) ||
                              (a.patientName || '').toLowerCase().includes(q) ||
                              (a.doctor || a.doctorName || '').toLowerCase().includes(q) ||
                              (a.specialty || '').toLowerCase().includes(q)
                            );
                          })
                          .map((a) => (
                            <tr key={a.id || a.bookingId} className="hover:bg-slate-50/50 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.id || a.bookingId}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-800">
                                <div>{a.patientName ? a.patientName.replace(/\s*\(Self\)/i, '') : 'Patient'}</div>
                                {a.patientPhone && <span className="text-[10px] text-slate-400 font-mono">{a.patientPhone}</span>}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900">{a.doctor || a.doctorName || 'Dr. Amit Sharma, MD'}</div>
                                <div className="text-[10px] text-teal-700 font-medium">{a.specialty || a.doctorSpecialty || 'General Physician'}</div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-700">{a.hospital || a.doctorHospital || 'Zestmed Polyclinic Hub, Dispur'}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">
                                <div>{a.date}</div>
                                <div className="text-[10px] text-slate-400">{a.time || a.slot}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {a.mode || 'Clinic Visit'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-black text-slate-900 font-mono">₹{a.fee || a.price || 600}</td>
                              <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">{a.symptoms || 'General Consultation'}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                  a.status === 'Confirmed' || a.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : a.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {a.status || 'Confirmed'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceStatus({ ...a, id: a.id || a.bookingId, type: 'doctor' })}
                                    className="px-2.5 py-1 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                                    title="Advance Status"
                                  >
                                    Advance
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleViewDetails({ ...a, id: a.id || a.bookingId, type: 'doctor', serviceType: 'Doctor Consultation', raw: a })}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadSlip({ ...a, type: 'Doctor Consultation' })}
                                    className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                    title="Print Slip"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  {a.status !== 'Cancelled' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCancelBookingOrOrder({ id: a.id || a.bookingId, type: 'doctor' })}
                                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CLINICAL SERVICES: PHYSIOTHERAPY BOOKINGS                */}
          {/* ======================================================== */}
          {(activeMenu === 'physiotherapy' || activeMenu === 'appointments-physio') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Activity className="w-6 h-6 text-[#14B8A6]" />
                    <span>Physiotherapy & Rehabilitation Bookings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Doorstep and clinical physical therapy sessions across Guwahati & Assam.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Booking ID', 'Patient Name', 'Phone', 'Physiotherapist', 'Degree', 'Rehabilitation Area', 'Date', 'Slot', 'Mode', 'Fee', 'Status'];
                      const rows = physioAppointments.map((a) => [a.id || a.bookingId, a.patientName, a.patientPhone || a.phone, a.doctor || a.doctorName, a.doctorDegree, a.specialty || a.doctorSpecialty, a.date, a.time || a.slot, a.mode, a.fee || a.price, a.status]);
                      downloadCsv('ZESTMED_Physiotherapy_Bookings.csv', headers, rows);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <div className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-xl font-bold text-xs">
                    Total: {physioAppointments.length}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Booking ID</th>
                        <th className="py-3 px-4 font-bold">Patient</th>
                        <th className="py-3 px-4 font-bold">Physiotherapist & Degree</th>
                        <th className="py-3 px-4 font-bold">Rehabilitation Area</th>
                        <th className="py-3 px-4 font-bold">Date & Slot</th>
                        <th className="py-3 px-4 font-bold">Mode</th>
                        <th className="py-3 px-4 font-bold">Session Fee</th>
                        <th className="py-3 px-4 font-bold">Condition / Symptoms</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {physioAppointments
                        .filter((a) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (a.id || '').toLowerCase().includes(q) ||
                            (a.bookingId || '').toLowerCase().includes(q) ||
                            (a.patientName || '').toLowerCase().includes(q) ||
                            (a.doctor || a.doctorName || '').toLowerCase().includes(q)
                          );
                        })
                        .map((a) => (
                          <tr key={a.id || a.bookingId} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.id || a.bookingId}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              <div>{a.patientName ? a.patientName.replace(/\s*\(Self\)/i, '') : 'Patient'}</div>
                              {a.patientPhone && <span className="text-[10px] text-slate-400 font-mono">{a.patientPhone}</span>}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{a.doctor || a.doctorName || 'Dr. Arindam Borah, MPT'}</div>
                              <div className="text-[10px] text-purple-700 font-medium">{a.doctorDegree || 'MPT (Ortho), Certified Physio'}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700">{a.specialty || a.doctorSpecialty || 'Post-Surgery & Spine Rehab'}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              <div>{a.date}</div>
                              <div className="text-[10px] text-slate-400">{a.time || a.slot}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                {a.mode || 'Home Visit'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900 font-mono">₹{a.fee || a.price || 850}</td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate">{a.symptoms || 'Joint Mobility Rehab'}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                a.status === 'Confirmed' || a.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : a.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                                {a.status || 'Confirmed'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceStatus({ ...a, id: a.id || a.bookingId, type: 'physio' })}
                                  className="px-2.5 py-1 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                                  title="Advance Status"
                                >
                                  Advance
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails({ ...a, id: a.id || a.bookingId, type: 'physio', serviceType: 'Physiotherapy', raw: a })}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSlip({ ...a, type: 'Physiotherapy' })}
                                  className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                  title="Print Slip"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {a.status !== 'Cancelled' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelBookingOrOrder({ id: a.id || a.bookingId, type: 'physio' })}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
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
          {/* CLINICAL SERVICES: SURGERY PACKAGE BOOKINGS              */}
          {/* ======================================================== */}
          {(activeMenu === 'surgery-packages' || activeMenu === 'bookings-surgery') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Scissors className="w-6 h-6 text-[#14B8A6]" />
                    <span>Surgery Care Packages & Inpatient Consultations</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    End-to-end surgical treatment packages with NABH partner hospitals and cashless insurance facilitation.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Booking ID', 'Patient Name', 'Phone', 'Surgery Package', 'Partner Hospital', 'Surgeon / Care Lead', 'Pre-Op Date', 'Slot', 'Cost', 'Insurance', 'Status'];
                      const rows = surgeryBookings.map((a) => [a.id || a.bookingId, a.patientName, a.patientPhone || a.phone, a.title || a.surgeryName, a.hospital, a.careManager || a.doctor, a.date, a.time || a.slot, a.fee || a.price, a.symptoms, a.status]);
                      downloadCsv('ZESTMED_Surgery_Bookings.csv', headers, rows);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl font-bold text-xs">
                    Total: {surgeryBookings.length}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Booking ID</th>
                        <th className="py-3 px-4 font-bold">Patient</th>
                        <th className="py-3 px-4 font-bold">Surgery Package</th>
                        <th className="py-3 px-4 font-bold">Partner Hospital</th>
                        <th className="py-3 px-4 font-bold">Care Manager / Surgeon</th>
                        <th className="py-3 px-4 font-bold">Pre-Op Slot</th>
                        <th className="py-3 px-4 font-bold">Package Cost</th>
                        <th className="py-3 px-4 font-bold">Insurance / Case</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {surgeryBookings
                        .filter((a) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (a.id || '').toLowerCase().includes(q) ||
                            (a.bookingId || '').toLowerCase().includes(q) ||
                            (a.patientName || '').toLowerCase().includes(q) ||
                            (a.title || a.surgeryName || '').toLowerCase().includes(q)
                          );
                        })
                        .map((a) => (
                          <tr key={a.id || a.bookingId} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{a.id || a.bookingId}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              <div>{a.patientName ? a.patientName.replace(/\s*\(Self\)/i, '') : 'Patient'}</div>
                              {a.patientPhone && <span className="text-[10px] text-slate-400 font-mono">{a.patientPhone}</span>}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">{a.title || a.surgeryName || 'Surgical Care Package'}</td>
                            <td className="py-3.5 px-4 text-slate-700">{a.hospital || a.doctorHospital || 'Dispur Partner Hospital, Guwahati'}</td>
                            <td className="py-3.5 px-4 text-slate-800 font-medium">{a.careManager || a.doctor || 'Dr. Anupam Sarma (Surgery Lead)'}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              <div>{a.date || 'Within 48 Hours'}</div>
                              <div className="text-[10px] text-slate-400">{a.time || a.slot || 'Pre-Op'}</div>
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900 font-mono">₹{Number(a.fee || a.price || 35000).toLocaleString('en-IN')}</td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-[160px] truncate">{a.symptoms || 'Cashless TPA / Ayushman Bharat'}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                a.status === 'Confirmed' || a.status === 'Surgery Completed' || a.status === 'Discharged'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : a.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {a.status || 'Confirmed'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceStatus({ ...a, id: a.id || a.bookingId, type: 'surgery' })}
                                  className="px-2.5 py-1 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                                  title="Advance Status"
                                >
                                  Advance
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails({ ...a, id: a.id || a.bookingId, type: 'surgery', serviceType: 'Surgery Package', raw: a })}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="View Case Dossier"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSlip({ ...a, type: 'Surgery Package' })}
                                  className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                  title="Download Slip"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {a.status !== 'Cancelled' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelBookingOrOrder({ id: a.id || a.bookingId, type: 'surgery' })}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
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
          {/* DIAGNOSTICS & WELLNESS: WELLNESS PACKAGES                */}
          {/* ======================================================== */}
          {(activeMenu === 'wellness-packages' || activeMenu === 'bookings-wellness') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Heart className="w-6 h-6 text-[#14B8A6]" />
                    <span>Preventive Wellness & Health Checkup Packages</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Comprehensive full body screenings, executive wellness, and senior citizen checkup packages across Assam.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Booking ID', 'Patient Name', 'Phone', 'Package Name', 'Package Code', 'Address', 'Phlebotomist', 'Date', 'Time', 'Price', 'Status'];
                      const rows = wellnessBookings.map((b) => [b.id || b.bookingId, b.patientName, b.patientPhone || b.phone, b.testName, b.testCode, b.collectionAddress, b.phlebotomist?.name, b.collectionDate || b.date, b.time, b.price, b.status]);
                      downloadCsv('ZESTMED_Wellness_Packages.csv', headers, rows);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl font-bold text-xs">
                    Total: {wellnessBookings.length}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Booking ID</th>
                        <th className="py-3 px-4 font-bold">Patient</th>
                        <th className="py-3 px-4 font-bold">Package Name & Code</th>
                        <th className="py-3 px-4 font-bold">Doorstep Collection Address</th>
                        <th className="py-3 px-4 font-bold">Field Phlebotomist</th>
                        <th className="py-3 px-4 font-bold">Schedule Slot</th>
                        <th className="py-3 px-4 font-bold">Price</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {wellnessBookings
                        .filter((b) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (b.id || '').toLowerCase().includes(q) ||
                            (b.bookingId || '').toLowerCase().includes(q) ||
                            (b.patientName || '').toLowerCase().includes(q) ||
                            (b.testName || '').toLowerCase().includes(q)
                          );
                        })
                        .map((b) => (
                          <tr key={b.id || b.bookingId} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id || b.bookingId}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              <div>{b.patientName ? b.patientName.replace(/\s*\(Self\)/i, '') : 'Patient'}</div>
                              {b.patientPhone && <span className="text-[10px] text-slate-400 font-mono">{b.patientPhone}</span>}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{b.testName || 'Comprehensive Health Package'}</div>
                              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-bold">
                                {b.testCode || 'WEL-PKG'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">{b.collectionAddress || 'Guwahati Home Collection'}</td>
                            <td className="py-3.5 px-4">
                              <select
                                value={b.phlebotomist?.name || 'Bikash Das'}
                                onChange={(e) => handleAssignPhlebotomist(b.id || b.bookingId, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-teal-800 outline-none cursor-pointer"
                              >
                                {executivesList.map((ex) => (
                                  <option key={ex.id} value={ex.name}>
                                    {ex.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              <div>{b.collectionDate || b.date}</div>
                              <div className="text-[10px] text-slate-400">{b.time || '07:30 AM'}</div>
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900 font-mono">₹{b.price || 1899}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                b.status === 'Confirmed' || b.status === 'Report Published'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : b.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-teal-50 text-teal-700 border border-teal-200'
                              }`}>
                                {b.status || 'Confirmed'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceStatus({ ...b, id: b.id || b.bookingId, type: 'wellness' })}
                                  className="px-2.5 py-1 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                                  title="Advance Status"
                                >
                                  Advance
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails({ ...b, id: b.id || b.bookingId, type: 'wellness', raw: b })}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="View Report / Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSlip({ ...b, type: 'Wellness Package' })}
                                  className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                  title="Download Slip"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {b.status !== 'Cancelled' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelBookingOrOrder({ id: b.id || b.bookingId, type: 'wellness' })}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
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
          {(activeMenu === 'medicines' || activeMenu === 'medicines-all') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Pill className="w-6 h-6 text-[#14B8A6]" />
                    <span>Pharmacy Inventory Catalog</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Central pharmaceutical warehouse stocks, batch numbers, and reorder levels (Dispur Hub).
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Medicine ID', 'Brand Name', 'Generic Composition', 'Category', 'Current Stock', 'Threshold', 'Price', 'Batch', 'Expiry'];
                      const rows = adminMedicines.map((m) => [m.id, m.name, m.genericName, m.categoryName, m.stock, m.threshold || 50, m.price, m.batchNo || 'B-902', m.expiry]);
                      downloadCsv('ZESTMED_Pharmacy_Inventory.csv', headers, rows);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUploadInventoryOpen(true)}
                    className="bg-teal-50 hover:bg-teal-100 text-[#008F83] border border-teal-200/80 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Inventory (CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddMedicineModalOpen(true)}
                    className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Medicine</span>
                  </button>
                </div>
              </div>

              {/* Medicine Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={medicineSearchQuery}
                    onChange={(e) => setMedicineSearchQuery(e.target.value)}
                    placeholder="Search brand or salt composition..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#14B8A6]"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-500 font-semibold shrink-0">Category:</span>
                  <select
                    value={medicineFilterCategory}
                    onChange={(e) => setMedicineFilterCategory(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="all">All Categories ({adminMedicines.length})</option>
                    <option value="General Medicines">General Medicines</option>
                    <option value="Pain Relief & Fever">Pain Relief & Fever</option>
                    <option value="Diabetes Care">Diabetes Care</option>
                    <option value="Cardiac & BP">Cardiac & BP</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Digestive Health">Digestive Health</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Respiratory Care">Respiratory Care</option>
                  </select>
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
                      {adminMedicines
                        .filter((m) => {
                          if (medicineFilterCategory !== 'all') {
                            const catName = (m.categoryName || m.categoryLong || '').toLowerCase();
                            const catSlug = (m.category || '').toLowerCase();
                            const filterLower = medicineFilterCategory.toLowerCase();
                            if (!catName.includes(filterLower) && !catSlug.includes(filterLower) && m.categoryName !== medicineFilterCategory) {
                              return false;
                            }
                          }
                          const q = (medicineSearchQuery || searchQuery).trim().toLowerCase();
                          if (!q) return true;
                          return (
                            (m.name || '').toLowerCase().includes(q) ||
                            (m.genericName || '').toLowerCase().includes(q) ||
                            (m.composition || '').toLowerCase().includes(q) ||
                            (m.categoryName || '').toLowerCase().includes(q) ||
                            (m.batchNo || '').toLowerCase().includes(q)
                          );
                        })
                        .map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              {m.image ? (
                                <img
                                  src={m.image}
                                  alt={m.name}
                                  className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-white p-0.5 shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextEl = e.currentTarget.nextElementSibling;
                                    if (nextEl) nextEl.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-[#14B8A6] ${m.image ? 'hidden' : ''}`}>
                                <Pill className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 leading-tight truncate">{m.name}</div>
                                <div className="text-[11px] text-slate-400 font-normal truncate">{m.packSize || m.pack || 'Standard Pack'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">{m.genericName || m.composition || '—'}</td>
                          <td className="py-3 px-4 text-slate-700">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{m.categoryName || m.category || 'General'}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              (m.stock || 0) <= (m.threshold || 50) ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {m.stock || 0} units
                            </span>
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900">₹{m.price}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{m.batchNo || 'B-902'} • {m.expiry || 'Dec 2027'}</td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setEditingMedicine(m)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-xs font-bold transition mr-1.5 cursor-pointer"
                              title="Edit Medicine Details"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...m, stock: (Number(m.stock) || 0) + 100 };
                                saveMedicine(updated);
                                setAdminMedicines((prev) =>
                                  prev.map((it) => (it.id === m.id ? updated : it))
                                );
                                addToast(`Restocked +100 units for ${m.name}`, 'success');
                              }}
                              className="px-2.5 py-1 bg-teal-50 text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white rounded-lg text-xs font-bold transition mr-1.5 cursor-pointer"
                            >
                              +100 Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove "${m.name}" from active inventory? It will also be removed from the Medicine Store.`)) {
                                  deleteMedicine(m.id || m.name);
                                  setAdminMedicines((prev) => prev.filter((it) => it.id !== m.id && it.name !== m.name));
                                  addToast(`Removed ${m.name} from active inventory`, 'info');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer inline-flex items-center justify-center align-middle"
                              title="Delete Item"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Layers className="w-6 h-6 text-[#14B8A6]" />
                    <span>Pharmaceutical Categories</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage inventory classifications, prescription enforcement & storage temperatures.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryModalOpen(true)}
                    className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicineCategories.map((c, i) => {
                  const Icon = c.icon || Pill;
                  return (
                    <div key={c.id || i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-teal-200 transition space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                          <span className="text-xs text-slate-400 font-mono">{c.count || 0} items in stock</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                        <span className="text-slate-500">Inventory Valuation:</span>
                        <strong className="text-slate-900 font-bold">{c.valuation || '₹1,50,000'}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMedicineFilterCategory(c.name);
                          setActiveMenu('medicines-all');
                          addToast(`Filtered inventory by ${c.name}`, 'info');
                        }}
                        className="w-full py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded-xl text-xs font-bold transition text-center cursor-pointer"
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
            <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 border border-slate-100 shadow-sm max-w-7xl mx-auto">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newMedForm.name || !newMedForm.name.trim()) {
                    addToast('Please enter a medicine name', 'error');
                    return;
                  }
                  const newMed = {
                    id: `med-${Date.now()}`,
                    name: newMedForm.name,
                    genericName: newMedForm.composition || newMedForm.genericName || 'Active Pharmaceutical Ingredient',
                    composition: newMedForm.composition,
                    category: newMedForm.categoryName || 'General Medicines',
                    categoryName: newMedForm.categoryName || 'General Medicines',
                    type: newMedForm.type || 'Tablet',
                    price: Number(newMedForm.price) || 28,
                    mrp: Number(newMedForm.mrp) || 32,
                    discount: Number(newMedForm.discount) || 20,
                    stock: Number(newMedForm.stock) || 100,
                    threshold: 40,
                    shortDescription: newMedForm.shortDescription,
                    uses: newMedForm.uses,
                    dosage: newMedForm.dosage,
                    inStock: newMedForm.inStock !== false,
                    pack: newMedForm.packSize || 'Strip of 10 Tablets',
                    packSize: newMedForm.packSize || 'Strip of 10 Tablets',
                    storage: newMedForm.storage,
                    manufacturer: newMedForm.manufacturer || 'Reckitt Benckiser',
                    image: newMedForm.image || '',
                    images: newMedForm.images?.length ? newMedForm.images : (newMedForm.image ? [newMedForm.image] : []),
                    expiry: newMedForm.expiry || 'Dec 2027',
                    batchNo: `B-${Math.floor(100 + Math.random() * 900)}`
                  };
                  try {
                    const saved = await saveMedicine(newMed);
                    setAdminMedicines((prev) => [saved, ...prev.filter((m) => m.id !== saved.id)]);
                    addToast(`Medicine ${saved.name} added to central inventory!`, 'success');
                    setActiveMenu('medicines');
                  } catch (saveErr) {
                    addToast(`Failed to save medicine: ${saveErr.message}`, 'error');
                  }
                }}
                className="space-y-6"
              >
                {/* 2-Column Responsive Layout matching reference */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  
                  {/* LEFT COLUMN: Image Upload & Preview (Span 4 of 12) */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* Main Image Box */}
                    <div className="rounded-2xl border-2 border-dashed border-[#86EFAC] bg-[#F0FDF4]/30 hover:bg-[#F0FDF4]/60 transition p-6 text-center flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden group">
                      {newMedForm.image ? (
                        <div className="relative w-full flex flex-col items-center">
                          <img
                            src={newMedForm.image}
                            alt="Medicine Preview"
                            className="max-h-48 max-w-full object-contain rounded-xl drop-shadow-sm mb-3"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => medImageInputRef.current?.click()}
                              className="px-3 py-1.5 bg-white border border-emerald-600 text-emerald-700 text-xs font-bold rounded-lg shadow-2xs hover:bg-emerald-50 transition cursor-pointer"
                            >
                              Change Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewMedForm((prev) => ({ ...prev, image: '', images: [] }))}
                              className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Green Placeholder Icon with Plus Badge */}
                          <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center relative mb-3">
                            <Image className="w-9 h-9 text-[#059669]" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#059669] text-white rounded-full flex items-center justify-center shadow-xs">
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-slate-800">Add Medicine Image</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                            Upload product image (JPG, PNG, WebP)
                          </p>

                          <button
                            type="button"
                            onClick={() => medImageInputRef.current?.click()}
                            className="px-4 py-2 bg-white border border-[#059669] text-[#059669] hover:bg-emerald-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                          </button>
                        </>
                      )}

                      <input
                        ref={medImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMedImageUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Medicine Images (0/4) Thumbnail Bar */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-2">
                        Medicine Images ({newMedForm.image ? 1 : 0}/4)
                      </h4>
                      <div className="grid grid-cols-4 gap-2.5">
                        {/* Slot 1 */}
                        {newMedForm.image ? (
                          <div className="relative aspect-square rounded-xl border border-emerald-300 bg-white p-1 overflow-hidden shadow-2xs">
                            <img src={newMedForm.image} alt="Thumb 1" className="w-full h-full object-contain rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setNewMedForm((prev) => ({ ...prev, image: '', images: [] }))}
                              className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px]"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => medImageInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-700 transition cursor-pointer p-1"
                          >
                            <Plus className="w-4 h-4 mb-0.5" />
                            <span className="text-[9.5px] font-bold leading-tight">Add Image</span>
                          </button>
                        )}

                        {/* Slot 2, 3, 4 */}
                        {[2, 3, 4].map((slot) => (
                          <div
                            key={slot}
                            className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50/40"
                          />
                        ))}
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-2">
                        Recommended size: 800 × 800 px (JPG, PNG)
                      </p>
                    </div>

                    {/* LIVE MEDICINE PREVIEW SECTION */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-[#007A64]" />
                          <span className="font-bold text-xs text-slate-800">Medicine Preview</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Live Store View
                        </span>
                      </div>

                      {/* Store Card Preview */}
                      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs space-y-2.5">
                        <div className="w-full h-28 bg-[#F1F3F5] rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                          {newMedForm.image ? (
                            <img
                              src={newMedForm.image}
                              alt={newMedForm.name || 'Preview'}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Pill className="w-10 h-10 text-teal-400/50" />
                          )}
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#E8F8EE] text-[#16A34A] text-[9px] font-bold">
                            {newMedForm.discount || 20}% OFF
                          </span>
                          <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            newMedForm.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {newMedForm.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                              {newMedForm.type || 'Tablet'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {newMedForm.packSize || 'Strip of 10 Tablets'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#0B1E3F] line-clamp-1 mt-1">
                            {newMedForm.name || 'Disprin Tablet'}
                          </h4>
                          <p className="text-[10.5px] text-slate-500 font-medium line-clamp-1">
                            {newMedForm.composition || newMedForm.genericName || 'Acetylsalicylic Acid 350 mg'}
                          </p>

                          <div className="flex items-center gap-1.5 pt-1.5">
                            <span className="text-sm font-bold text-[#0B1E3F]">
                              ₹{Number(newMedForm.price || 28).toFixed(2)}
                            </span>
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{Number(newMedForm.mrp || 32).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="w-full py-1 px-2 rounded-lg border border-[#007A64] text-[#007A64] font-semibold text-[11px] flex items-center justify-center gap-1.5 bg-white">
                          <ShoppingCart className="w-3 h-3" />
                          <span>Add to Cart</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: Form Fields (Span 8 of 12) */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Header: Green Plus Icon + Add New Medicine + Subtitle */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                        <SquarePlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          Add New Medicine
                        </h2>
                        <p className="text-xs text-slate-500">
                          Register a new pharmaceutical product with NABL drug approval codes.
                        </p>
                      </div>
                    </div>

                    {/* Row 1: Medicine Name + Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Medicine Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newMedForm.name}
                          onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                          placeholder="e.g. Disprin Tablet"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Category <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newMedForm.categoryName}
                            onChange={(e) => setNewMedForm({ ...newMedForm, categoryName: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white appearance-none pr-8 cursor-pointer"
                          >
                            <option value="">Select Category</option>
                            <option value="General Medicines">General Medicines</option>
                            <option value="Pain Relief & Fever">Pain Relief & Fever</option>
                            <option value="Diabetes Care">Diabetes Care</option>
                            <option value="Cardiac & BP">Cardiac & BP</option>
                            <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                            <option value="Antibiotics">Antibiotics</option>
                            <option value="Digestive Health">Digestive Health</option>
                            <option value="Skin Care">Skin Care</option>
                            <option value="Respiratory Care">Respiratory Care</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Type (Tablet, Capsule, Syrup, Injection, Other) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Type <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { id: 'Tablet', label: 'Tablet', icon: Pill },
                          { id: 'Capsule', label: 'Capsule', icon: Pill, rotate: true },
                          { id: 'Syrup', label: 'Syrup', icon: Droplet },
                          { id: 'Injection', label: 'Injection', icon: Syringe },
                          { id: 'Other', label: '... Other', icon: null }
                        ].map((t) => {
                          const IconComp = t.icon;
                          const isSelected = (newMedForm.type || 'Tablet') === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setNewMedForm({ ...newMedForm, type: t.id })}
                              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#059669] text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                              }`}
                            >
                              {IconComp && <IconComp className={`w-3.5 h-3.5 ${t.rotate ? 'rotate-45' : ''}`} />}
                              <span>{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Row 3: Price, MRP, Discount, Stock Quantity */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newMedForm.price}
                          onChange={(e) => {
                            const p = e.target.value;
                            const m = newMedForm.mrp;
                            let disc = newMedForm.discount;
                            if (p && m && Number(m) > 0) {
                              disc = Math.max(0, Math.round(((Number(m) - Number(p)) / Number(m)) * 100));
                            }
                            setNewMedForm({ ...newMedForm, price: p, discount: disc });
                          }}
                          placeholder="e.g. 28.00"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          MRP (₹) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newMedForm.mrp}
                          onChange={(e) => {
                            const m = e.target.value;
                            const p = newMedForm.price;
                            let disc = newMedForm.discount;
                            if (p && m && Number(m) > 0) {
                              disc = Math.max(0, Math.round(((Number(m) - Number(p)) / Number(m)) * 100));
                            }
                            setNewMedForm({ ...newMedForm, mrp: m, discount: disc });
                          }}
                          placeholder="e.g. 32.00"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          value={newMedForm.discount}
                          onChange={(e) => setNewMedForm({ ...newMedForm, discount: e.target.value })}
                          placeholder="e.g. 20"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          <Package className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                          Stock Quantity <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={newMedForm.stock}
                          onChange={(e) => setNewMedForm({ ...newMedForm, stock: e.target.value })}
                          placeholder="e.g. 100"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Row 4: Short Description */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Short Description <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newMedForm.shortDescription}
                        onChange={(e) => setNewMedForm({ ...newMedForm, shortDescription: e.target.value })}
                        placeholder="e.g. Fast relief from headache, toothache, and muscular pain."
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                        required
                      />
                    </div>

                    {/* Row 5: 3 distinct cards (Uses, Dosage, Availability) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {/* Uses */}
                      <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-1.5 mb-1.5 text-slate-800 font-bold text-xs">
                          <Target className="w-4 h-4 text-emerald-600" />
                          <span>Uses</span>
                        </div>
                        <input
                          type="text"
                          value={newMedForm.uses}
                          onChange={(e) => setNewMedForm({ ...newMedForm, uses: e.target.value })}
                          placeholder="e.g. Used for headache, toothache and inflammation."
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] transition"
                        />
                      </div>

                      {/* Dosage */}
                      <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-1.5 mb-1.5 text-slate-800 font-bold text-xs">
                          <Pill className="w-4 h-4 text-emerald-600" />
                          <span>Dosage</span>
                        </div>
                        <input
                          type="text"
                          value={newMedForm.dosage}
                          onChange={(e) => setNewMedForm({ ...newMedForm, dosage: e.target.value })}
                          placeholder="e.g. 1 to 2 tablets every 4–6 hours as needed."
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] transition"
                        />
                      </div>

                      {/* Availability */}
                      <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                          <Package className="w-4 h-4 text-emerald-600" />
                          <span>Availability</span>
                        </div>
                        <div className="flex items-center gap-2.5 pt-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={newMedForm.inStock}
                            onClick={() => setNewMedForm({ ...newMedForm, inStock: !newMedForm.inStock })}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                              newMedForm.inStock ? 'bg-[#059669]' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                                newMedForm.inStock ? 'translate-x-5.5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <span className="text-xs font-bold text-slate-800">
                            {newMedForm.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row 6: Composition + Expiry Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          <FlaskConical className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                          Composition <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newMedForm.composition}
                          onChange={(e) => setNewMedForm({ ...newMedForm, composition: e.target.value })}
                          placeholder="e.g. Acetylsalicylic Acid 350 mg"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                          Expiry Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newMedForm.expiry}
                          onChange={(e) => setNewMedForm({ ...newMedForm, expiry: e.target.value })}
                          placeholder="e.g. Dec 2027"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Row 7: Pack Size + Storage */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          <Package className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                          Pack Size <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newMedForm.packSize}
                          onChange={(e) => setNewMedForm({ ...newMedForm, packSize: e.target.value })}
                          placeholder="e.g. Strip of 10 Tablets"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          <Thermometer className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                          Storage <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newMedForm.storage}
                          onChange={(e) => setNewMedForm({ ...newMedForm, storage: e.target.value })}
                          placeholder="e.g. Store below 25°C, away from moisture"
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Row 8: Manufacturer */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                        Manufacturer <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newMedForm.manufacturer}
                        onChange={(e) => setNewMedForm({ ...newMedForm, manufacturer: e.target.value })}
                        placeholder="e.g. Reckitt Benckiser"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                        required
                      />
                    </div>

                    {/* Bottom Action Buttons: Cancel and Save to Inventory */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveMenu('medicines')}
                        className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save to Inventory</span>
                      </button>
                    </div>

                  </div>
                </div>
              </form>
            </div>
          )}
          {/* ======================================================== */}
          {(activeMenu === 'lab-tests' || activeMenu === 'diagnostic-tests') && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-[#14B8A6]" />
                    <span>Diagnostic Pathology Tests Catalog</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage {testsList.length}+ diagnostic tests, home collection parameters, and NABL pricing across Assam.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Test ID', 'Test Name', 'Sample Type', 'Category', 'Turnaround', 'Fasting Required', 'Price (INR)', 'MRP (INR)'];
                      const rows = testsList.map((t) => [
                        t.id,
                        t.name,
                        t.sampleType,
                        t.categoryName || t.category || '',
                        t.turnaroundTime || t.reportTime || '24 Hours',
                        t.fastingRequired ? 'Yes' : 'No',
                        t.price,
                        t.mrp || (t.price ? Math.round(t.price * 1.25) : '')
                      ]);
                      downloadCsv('ZESTMED_Diagnostic_Tests_Catalog.csv', headers, rows);
                      addToast('Exported diagnostic test catalog to CSV', 'success');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Tests CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUploadPackagesOpen(true)}
                    className="bg-teal-50 hover:bg-teal-100 text-[#008F83] border border-teal-200/80 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Packages (CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddTestModalOpen(true)}
                    className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Test</span>
                  </button>
                </div>
              </div>

              {/* Lab Test Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={labTestSearchQuery}
                    onChange={(e) => setLabTestSearchQuery(e.target.value)}
                    placeholder="Search test name, sample or category..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#14B8A6]"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-500 font-semibold shrink-0">Category:</span>
                  <select
                    value={labTestFilterCategory}
                    onChange={(e) => setLabTestFilterCategory(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="all">All Categories ({testsList.length})</option>
                    <option value="Blood Tests">Blood Tests</option>
                    <option value="Diabetes Tests">Diabetes Tests</option>
                    <option value="Heart Tests">Heart Tests</option>
                    <option value="Liver Tests">Liver Tests</option>
                    <option value="Kidney Tests">Kidney Tests</option>
                    <option value="Thyroid Tests">Thyroid Tests</option>
                    <option value="Hormone Tests">Hormone Tests</option>
                    <option value="Vitamin Tests">Vitamin Tests</option>
                    <option value="Allergy Tests">Allergy Tests</option>
                    <option value="Popular Tests">Popular Tests</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Diagnostic Test</th>
                        <th className="py-3 px-4 font-bold">Sample</th>
                        <th className="py-3 px-4 font-bold">Category</th>
                        <th className="py-3 px-4 font-bold">Turnaround</th>
                        <th className="py-3 px-4 font-bold">Fasting</th>
                        <th className="py-3 px-4 font-bold">Price (₹)</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {testsList
                        .filter((t) => {
                          if (labTestFilterCategory !== 'all') {
                            const catName = (t.categoryName || t.category || '').toLowerCase();
                            const filterLower = labTestFilterCategory.toLowerCase().replace(' tests', '');
                            if (!catName.includes(filterLower)) {
                              return false;
                            }
                          }
                          const q = (labTestSearchQuery || '').trim().toLowerCase();
                          if (!q) return true;
                          return (
                            (t.name || '').toLowerCase().includes(q) ||
                            (t.sampleType || '').toLowerCase().includes(q) ||
                            (t.description || '').toLowerCase().includes(q) ||
                            (t.categoryName || t.category || '').toLowerCase().includes(q)
                          );
                        })
                        .map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              {t.image ? (
                                <img
                                  src={t.image}
                                  alt={t.name}
                                  className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-white p-0.5 shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextEl = e.currentTarget.nextElementSibling;
                                    if (nextEl) nextEl.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 shrink-0 ${t.image ? 'hidden' : ''}`} />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 leading-tight truncate">{t.name}</div>
                                <div className="text-[11px] text-slate-400 font-normal truncate">
                                  {Array.isArray(t.parameters) ? `${t.parameters.length} clinical parameters` : (t.parametersCount ? `${t.parametersCount} parameters` : 'Clinical assay')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{t.sampleType}</td>
                          <td className="py-3 px-4 text-slate-700">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{t.categoryName || t.category}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{t.turnaroundTime || t.reportTime || '24 Hours'}</td>
                          <td className="py-3 px-4">
                            {t.fastingRequired ? (
                              <span className="text-amber-600 font-bold">Yes (8-10 hrs)</span>
                            ) : (
                              <span className="text-slate-400">Not required</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-black text-slate-900">₹{t.price}</span>
                            {t.mrp && t.mrp > t.price && (
                              <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">₹{t.mrp}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setEditingTest(t)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-[#14B8A6] hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              Edit Test
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to remove "${t.name}" from active catalog? It will also be removed from the user-facing Lab Test portal.`)) {
                                  await deleteLabTest(t.id || t.name);
                                  setTestsList(getSynchronizedLabTests());
                                  addToast(`Test "${t.name}" removed from catalog`, 'info');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition inline-flex items-center cursor-pointer"
                              title="Delete Test"
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
          {/* LAB BOOKINGS CENTRAL MANAGER                             */}
          {/* ======================================================== */}
          {activeMenu === 'lab-bookings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-[#14B8A6]" />
                    <span>Central Diagnostic & Home Collection Bookings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage appointments, assign field phlebotomists, and monitor sample statuses across Assam.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Booking ID', 'Patient Name', 'Phone', 'Test Name', 'Collection Type', 'Phlebotomist', 'Specimen', 'Slot', 'Amount', 'Status'];
                      const rows = diagnosticLabBookings.map((b) => [
                        b.id || b.bookingId,
                        b.patientName || '',
                        b.patientPhone || '',
                        b.testName || '',
                        b.collectionType || 'Home Collection',
                        b.phlebotomist?.name || 'Unassigned',
                        b.sampleType || 'Blood Specimen',
                        b.slot || '',
                        b.amount || '',
                        b.status || ''
                      ]);
                      downloadCsv('ZESTMED_Lab_Bookings.csv', headers, rows);
                      addToast('Exported lab bookings to CSV', 'success');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-xl font-bold text-xs">
                    Total: {diagnosticLabBookings.length}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Booking ID</th>
                        <th className="py-3 px-4 font-bold">Patient</th>
                        <th className="py-3 px-4 font-bold">Test Name & Code</th>
                        <th className="py-3 px-4 font-bold">Collection Type</th>
                        <th className="py-3 px-4 font-bold">Field Phlebotomist</th>
                        <th className="py-3 px-4 font-bold">Specimen</th>
                        <th className="py-3 px-4 font-bold">Slot</th>
                        <th className="py-3 px-4 font-bold">Amount</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {diagnosticLabBookings
                        .filter((b) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (b.id || '').toLowerCase().includes(q) ||
                            (b.bookingId || '').toLowerCase().includes(q) ||
                            (b.patientName || '').toLowerCase().includes(q) ||
                            (b.testName || '').toLowerCase().includes(q) ||
                            (b.phlebotomist?.name || '').toLowerCase().includes(q)
                          );
                        })
                        .map((b) => (
                          <tr key={b.id || b.bookingId} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.id || b.bookingId}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              <div>{b.patientName ? b.patientName.replace(/\s*\(Self\)/i, '') : 'Patient'}</div>
                              {b.patientPhone && <span className="text-[10px] text-slate-400 font-mono">{b.patientPhone}</span>}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{b.testName}</div>
                              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-bold">
                                {b.testCode || 'DX-LAB'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{b.type || 'Home Collection'}</td>
                            <td className="py-3.5 px-4">
                              <select
                                value={b.phlebotomist?.name || 'Bikash Das'}
                                onChange={(e) => handleAssignPhlebotomist(b.id || b.bookingId, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-teal-800 outline-none cursor-pointer"
                              >
                                {executivesList.map((ex) => (
                                  <option key={ex.id} value={ex.name}>
                                    {ex.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{b.specimen || 'Blood Sample'}</td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono">
                              <div>{b.collectionDate || b.date}</div>
                              <div className="text-[10px] text-slate-400">{b.time || '08:00 AM'}</div>
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900 font-mono">₹{b.price || 350}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                b.status === 'Confirmed' || b.status === 'Report Published' || b.status === 'Report Ready'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : b.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {b.status || 'Confirmed'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceStatus({ ...b, id: b.id || b.bookingId, type: 'lab' })}
                                  className="px-2.5 py-1 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                                  title="Advance Status"
                                >
                                  Advance
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails({ ...b, id: b.id || b.bookingId, type: 'lab', raw: b })}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="View Report"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSlip({ ...b, type: 'Diagnostic Lab Test' })}
                                  className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                  title="Download Slip"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {b.status !== 'Cancelled' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelBookingOrOrder({ id: b.id || b.bookingId, type: 'lab' })}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
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
          {/* 9. CENTRAL BOOKINGS MANAGEMENT CONSOLE                    */}
          {/* ======================================================== */}
          {(activeMenu === 'bookings-management' || activeMenu === 'bookings' || activeMenu === 'master-bookings') && (
            <BookingsManagementView
              doctorAppointments={doctorAppointments}
              physioAppointments={physioAppointments}
              surgeryBookings={surgeryBookings}
              diagnosticLabBookings={diagnosticLabBookings}
              wellnessBookings={wellnessBookings}
              medicineOrders={medicineOrders}
              onUpdateStatus={handleUpdateBookingStatus}
              onViewBooking={handleViewBookingDetail}
              onRefresh={fetchAllLiveAdminData}
              isLoading={isLoadingBookings}
            />
          )}

          {/* ======================================================== */}
          {/* ORDERS MANAGER                                           */}
          {/* ======================================================== */}
          {activeMenu === 'orders' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Package className="w-6 h-6 text-[#14B8A6]" />
                    <span>Customer Pharmacy Orders & Deliveries</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Express doorstep deliveries across Assam hubs with cold-chain verification.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Order ID', 'Customer', 'Phone', 'Delivery Address', 'Items', 'Payment Method', 'Total (INR)', 'Status', 'Date'];
                      const rows = medicineOrders.map((o) => [
                        o.id || o.orderId,
                        o.customer || o.patientName || '',
                        o.phone || '',
                        o.deliveryAddress || '',
                        o.items || '',
                        o.paymentMethod || '',
                        o.total || '',
                        o.status || '',
                        o.date || ''
                      ]);
                      downloadCsv('ZESTMED_Customer_Orders.csv', headers, rows);
                      addToast('Exported customer pharmacy orders to CSV', 'success');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1.5 rounded-xl font-bold text-xs">
                    Total: {medicineOrders.length}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold">Order ID</th>
                        <th className="py-3 px-4 font-bold">Customer</th>
                        <th className="py-3 px-4 font-bold">Delivery Address</th>
                        <th className="py-3 px-4 font-bold">Items & Quantities</th>
                        <th className="py-3 px-4 font-bold">Payment Method</th>
                        <th className="py-3 px-4 font-bold">Total</th>
                        <th className="py-3 px-4 font-bold text-center">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicineOrders
                        .filter((o) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            (o.id || '').toLowerCase().includes(q) ||
                            (o.orderId || '').toLowerCase().includes(q) ||
                            (o.customer || o.patientName || '').toLowerCase().includes(q) ||
                            (o.deliveryAddress || '').toLowerCase().includes(q)
                          );
                        })
                        .map((o) => {
                          const itemsSummary = Array.isArray(o.items)
                            ? o.items.map((it) => `${it.name} x ${it.quantity}`).join(', ')
                            : o.items || 'Prescription Medicines';
                          return (
                            <tr key={o.id || o.orderId} className="hover:bg-slate-50/50 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.id || o.orderId}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-800">
                                <div>{o.customer || o.patientName || 'Customer'}</div>
                                {o.phone && <span className="text-[10px] text-slate-400 font-mono">{o.phone}</span>}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                                {o.deliveryAddress || o.address || 'Dispur, Guwahati'}
                              </td>
                              <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate font-medium">
                                {itemsSummary}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 font-medium">
                                <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 text-slate-700 font-mono">
                                  {o.paymentMethod || o.payment || 'UPI Paid'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                                ₹{o.total || o.totalAmount || 0}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                  o.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : o.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}>
                                  {o.status || 'Processing'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceStatus({ ...o, id: o.id || o.orderId, type: 'order' })}
                                    className="px-2.5 py-1 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                                    title="Advance Order Status"
                                  >
                                    Update
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setViewingOrderModal(o)}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                    title="View Invoice & Items"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadOrderInvoicePdf(o)}
                                    className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                    title="Download Assam GST Invoice"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  {o.status !== 'Cancelled' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCancelBookingOrOrder({ id: o.id || o.orderId, type: 'order' })}
                                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#14B8A6]" />
                    <span>Chief Pharmacist Prescription Verification</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Mandatory regulatory review of digital doctor prescriptions before pharmacy fulfillment.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Prescription ID', 'Patient', 'Doctor', 'Date', 'Prescribed Medicines', 'Status'];
                      const rows = prescriptionsList.map((rx) => [
                        rx.id,
                        rx.patient,
                        rx.doctor,
                        rx.date,
                        rx.items,
                        rx.status
                      ]);
                      downloadCsv('ZESTMED_Prescriptions_Queue.csv', headers, rows);
                      addToast('Exported prescriptions queue to CSV', 'success');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-xl font-bold text-xs">
                    Pending: {prescriptionsList.filter(p => p.status === 'Pending' || p.status === 'In Review').length}
                  </div>
                </div>
              </div>

              {prescriptionsList.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008F83] flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">No Prescriptions in Audit Queue</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    All patient-uploaded doctor prescriptions (PDF, JPG, PNG) will appear here in real-time for Chief Pharmacist verification and dispensing approval.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {prescriptionsList.map((rx) => (
                    <div key={rx.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-teal-600">{rx.id}</span>
                            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rx.patient || rx.patientName || 'Verified Patient'}</h3>
                            <p className="text-[11px] text-slate-500">{rx.phone || rx.patientPhone || 'Guwahati Hub'}</p>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            rx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : rx.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {rx.status || 'Pending Audit'}
                          </span>
                        </div>

                        <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl text-slate-600">
                          <div>Doctor: <strong className="text-slate-800">{rx.doctor || rx.doctorName || 'Medical Practitioner'}</strong></div>
                          <div>Uploaded: <span className="text-slate-500 font-mono">{rx.uploadedAt || rx.date || 'Recent'}</span></div>
                          {rx.fileName && <div>File: <span className="text-slate-700 font-mono truncate block">{rx.fileName}</span></div>}
                          <div className="pt-1">Rx Medicines: <strong className="text-slate-800">{rx.items || (Array.isArray(rx.medicines) && rx.medicines.length > 0 ? rx.medicines.map(m => m.name).join(', ') : 'Pending Pharmacist Mapping')}</strong></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setAuditingRx(rx)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                          title="Audit prescription and verify medications"
                        >
                          Audit / View
                        </button>
                        {(rx.fileUrl || rx.imagePreview) && (
                          <button
                            type="button"
                            onClick={() => downloadPrescriptionFile(rx)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {rx.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => handleApprovePrescription(rx.id)}
                            className="flex-1 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl text-xs font-bold transition text-center shadow-xs cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {rx.status !== 'Rejected' && rx.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await updatePrescriptionStatus(rx.id, 'Rejected', 'Prescription rejected by Chief Pharmacist');
                              setPrescriptionsList((prev) => prev.map((it) => (it.id === rx.id ? { ...it, status: 'Rejected' } : it)));
                              addToast(`Prescription ${rx.id} marked as rejected.`, 'info');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* INVENTORY WAREHOUSE MANAGER                              */}
          {/* ======================================================== */}
          {activeMenu === 'inventory' && (() => {
            const lowStockItems = adminMedicines.filter((m) => (m.stock || 0) < (m.threshold || 50));
            return (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Layers className="w-6 h-6 text-[#14B8A6]" />
                      <span>Central Warehouse Stock & Reorder Levels</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Automated low-stock threshold monitoring for Assam regional hubs.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const headers = ['Medicine Name', 'Rack Location', 'Current Stock', 'Safety Threshold', 'Batch', 'Expiry Date'];
                        const rows = adminMedicines.map((m) => [
                          m.name,
                          m.rackLocation || 'WH-GUW-01',
                          m.stock,
                          m.threshold || 50,
                          m.batch || 'BT-2026',
                          m.expiry || 'Dec 2027'
                        ]);
                        downloadCsv('ZESTMED_Warehouse_Inventory.csv', headers, rows);
                        addToast('Exported warehouse inventory to CSV', 'success');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Stock CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUploadInventoryOpen(true)}
                      className="bg-teal-50 hover:bg-teal-100 text-[#008F83] border border-teal-200/80 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
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
                      className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      Bulk Restock All
                    </button>
                  </div>
                </div>

                {/* Dynamic Alert box */}
                {lowStockItems.length > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-amber-800">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>
                        <strong>Stock Warning:</strong> {lowStockItems.length} medicine{lowStockItems.length > 1 ? 's' : ''} dropped below safe threshold: {lowStockItems.slice(0, 3).map(m => `${m.name} (${m.stock} units)`).join(', ')}{lowStockItems.length > 3 ? `, +${lowStockItems.length - 3} more` : ''}.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-800">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span><strong>Stock Optimal:</strong> All pharmaceuticals and diagnostics are operating safely above minimum reserve thresholds.</span>
                    </div>
                  </div>
                )}

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
                                className="px-3 py-1 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
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
            );
          })()}

          {/* ======================================================== */}
          {/* PAYMENTS & RAZORPAY GATEWAY LEDGER                       */}
          {/* ======================================================== */}
          {activeMenu === 'payments' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#14B8A6]" />
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
                    onClick={() => {
                      const headers = ['Transaction ID', 'Reference', 'Customer', 'Payment Mode', 'Date & Time', 'Amount (INR)', 'Status'];
                      const rows = paymentsList.map((tx) => [
                        tx.id,
                        tx.ref,
                        tx.customer,
                        tx.method,
                        tx.date,
                        tx.amount,
                        tx.status
                      ]);
                      downloadCsv('ZESTMED_Financial_Ledger.csv', headers, rows);
                      addToast('Exported GST financial ledger to CSV', 'success');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
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
                      <ShieldCheck className="w-5 h-5 text-[#008F83]" />
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
                    className="text-xs text-[#008F83] font-bold hover:underline flex items-center gap-1 shrink-0"
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
                              onClick={() => { openStatutoryDocumentPdf(doc); addToast(`Opening official certified PDF: ${doc.title}`, 'info'); }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-[#008F83] text-slate-700 rounded-lg text-[11px] font-bold transition shadow-2xs"
                            >
                              View Doc
                            </button>
                            <button
                              type="button"
                              onClick={() => { downloadStatutoryDocumentPdf(doc); addToast(`Statutory certificate PDF downloaded: ${doc.title}`, 'success'); }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-[#008F83] text-slate-700 rounded-lg text-[11px] font-bold transition shadow-2xs"
                            >
                              Download
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
                      <span>Key ID: <strong>{import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_U22znXn1PSuEH1'}</strong></span>
                      <span>•</span>
                      <span>
                        Key Secret:{' '}
                        <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-sans font-bold">Secured on Server (.env)</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addToast('Razorpay Key Secret is encrypted and managed via backend environment variables.', 'info')}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      Security Info
                    </button>
                    <button
                      type="button"
                      onClick={() => addToast('Razorpay webhook verified on https://api.zestmed.in/razorpay/webhook', 'success')}
                      className="px-3 py-1.5 bg-[#008F83] text-white hover:bg-[#007a70] rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
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
          {/* 13. REPORTS MANAGEMENT VIEW                             */}
          {/* ======================================================== */}
          {(activeMenu === 'reports' || activeMenu === 'reports-management') && (
            <ReportsManagementView
              diagnosticLabBookings={diagnosticLabBookings}
              onOpenDigitalReport={(booking) => setViewingReportBooking(booking)}
              onUpdateReportStatus={async (id, status, reportUrl) => {
                await updateLabBookingStatus(id, status, { reportUrl });
                setLabBookingsList((prev) =>
                  prev.map((b) => (b.id === id || b.booking_number === id ? { ...b, status, reportUrl } : b))
                );
                addToast(`Report status updated for #${id}`, 'success');
              }}
            />
          )}

          {/* ======================================================== */}
          {/* REPORTS & ANALYTICS                                      */}
          {/* ======================================================== */}
          {activeMenu === 'analytics' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <BarChart2 className="w-6 h-6 text-[#14B8A6]" />
                    <span>Executive Clinical & Revenue Analytics</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Quarterly performance review for Guwahati Central Diagnostics & Polyclinic Hub operations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const headers = ['Executive Metric', 'Value', 'Growth / Status', 'Region / Scope'];
                    const rows = [
                      ['Average Order Value', '₹742.50', '+14.8% vs last month', 'Guwahati Central'],
                      ['Diagnostic Fulfillment Rate', '99.2%', 'Cold chain compliance 100%', 'Assam Hubs'],
                      ['Active Assam Pin Codes', '142', '8 Dedicated Hubs Online', 'Assam State'],
                      ['Total Registered Patients', patientsList.length.toString(), 'Active verified accounts', 'All Regions'],
                      ['Total Diagnostic Bookings', diagnosticLabBookings.length.toString(), 'Processed', 'All Labs'],
                      ['Total Medicine Orders', medicineOrders.length.toString(), 'Fulfilled / In Transit', 'Guwahati Central Pharmacy']
                    ];
                    downloadCsv('ZESTMED_Executive_Analytics.csv', headers, rows);
                    addToast('Executive Analytics summary exported to CSV', 'success');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Analytics CSV</span>
                </button>
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
          {/* 16. REVIEWS & FEEDBACK MODERATION CONSOLE                */}
          {/* ======================================================== */}
          {(activeMenu === 'reviews' || activeMenu === 'reviews-feedback' || activeMenu === 'feedback') && (
            <ReviewsFeedbackView />
          )}

          {/* ======================================================== */}
          {/* 17. SUPPORT & COMPLAINTS HELP DESK                       */}
          {/* ======================================================== */}
          {(activeMenu === 'support' || activeMenu === 'support-complaints' || activeMenu === 'complaints') && (
            <SupportComplaintsView />
          )}

          {/* ======================================================== */}
          {/* SETTINGS                                                 */}
          {/* ======================================================== */}
          {activeMenu === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Settings className="w-6 h-6 text-[#14B8A6]" />
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
                      value={platformSettings.companyName || ''}
                      onChange={(e) => setPlatformSettings((prev) => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Assam GSTIN</label>
                    <input
                      type="text"
                      value={platformSettings.gstin || ''}
                      onChange={(e) => setPlatformSettings((prev) => ({ ...prev, gstin: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Drug License Numbers</label>
                    <input
                      type="text"
                      value={platformSettings.drugLicense || ''}
                      onChange={(e) => setPlatformSettings((prev) => ({ ...prev, drugLicense: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Central Laboratory Hub</label>
                    <input
                      type="text"
                      value={platformSettings.centralLabHub || ''}
                      onChange={(e) => setPlatformSettings((prev) => ({ ...prev, centralLabHub: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Support Phone Helpline</label>
                    <input
                      type="text"
                      value={platformSettings.supportPhone || ''}
                      onChange={(e) => setPlatformSettings((prev) => ({ ...prev, supportPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Support Email</label>
                    <input
                      type="text"
                      value={platformSettings.supportEmail || ''}
                      onChange={(e) => setPlatformSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem('zestmed_platform_settings', JSON.stringify(platformSettings));
                        addToast('Platform and regional operational settings saved successfully!', 'success');
                      } catch (_) {
                        addToast('Failed to save settings', 'error');
                      }
                    }}
                    className="px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 22. SECURITY & AUDIT LOGS CONSOLE                        */}
          {/* ======================================================== */}
          {(activeMenu === 'audit-logs' || activeMenu === 'security' || activeMenu === 'security-audit') && (
            <SecurityAuditLogsView />
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
          onAddTest={async (newTest) => {
            try {
              const saved = await saveLabTest(newTest);
              setTestsList(getSynchronizedLabTests());
              setIsAddTestModalOpen(false);
              addToast(`Diagnostic test "${saved.name}" added to catalog!`, 'success');
              recordAuditLog({
                action: 'CATALOG_TEST_CREATE',
                actionTitle: `Diagnostic Test Created: ${saved.name}`,
                module: 'Diagnostic Lab',
                details: `Added new diagnostic test "${saved.name}" (Price: ₹${saved.price}) to laboratory catalog.`,
                severity: 'info',
                status: 'Success'
              }).catch(() => {});
              return saved;
            } catch (err) {
              addToast(`Failed to add diagnostic test: ${err.message}`, 'error');
              throw err;
            }
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
          onConfirmDelete={async (patientId, patient) => {
            const cleanPhone = normalizePhone(patient?.phone || patient?.cleanPhone);

            // 1. Immediately remove from React state
            setPatientsList((prev) =>
              prev.filter((item) => {
                const itemClean = normalizePhone(item.phone || item.cleanPhone);
                if (item.id === patientId) return false;
                if (cleanPhone && itemClean === cleanPhone) return false;
                return true;
              })
            );

            // 2. Persist deleted IDs in blacklist
            try {
              const existingDeleted = JSON.parse(localStorage.getItem('zestmed_deleted_patients') || '[]');
              const updatedDeleted = Array.from(new Set([...existingDeleted, patientId, cleanPhone].filter(Boolean)));
              localStorage.setItem('zestmed_deleted_patients', JSON.stringify(updatedDeleted));
            } catch (_) {}

            // 3. Remove from patientRegistry and Supabase backend
            deleteRegisteredPatient(patientId, cleanPhone);
            await deletePatientProfile(patientId, cleanPhone);

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
          onConfirmDelete={async (execId, executive) => {
            setExecutivesList((prev) => prev.filter((item) => item.id !== execId && item.employee_id !== execId));
            
            try {
              const existingDeleted = JSON.parse(localStorage.getItem('zestmed_deleted_executives') || '[]');
              const updatedDeleted = Array.from(new Set([...existingDeleted, execId].filter(Boolean)));
              localStorage.setItem('zestmed_deleted_executives', JSON.stringify(updatedDeleted));
            } catch (_) {}

            await deleteLabExecutive(execId);
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
            importedRows.forEach((row) => saveLabTest(row));
            setTestsList(getSynchronizedLabTests());
            addToast(`${importedRows.length} diagnostic packages added to active catalog!`, 'success');
          }}
        />
      )}

      {/* Order Invoice & Items Details Modal */}
      {viewingOrderModal && (
        <OrderInvoiceModal
          isOpen={!!viewingOrderModal}
          onClose={() => setViewingOrderModal(null)}
          order={viewingOrderModal}
        />
      )}

      {/* Digital Lab Report Modal */}
      {viewingReportBooking && (
        <DigitalLabReportModal
          isOpen={!!viewingReportBooking}
          onClose={() => setViewingReportBooking(null)}
          booking={viewingReportBooking}
        />
      )}

      {/* Edit Diagnostic Test Modal */}
      {editingTest && (
        <EditDiagnosticTestModal
          isOpen={!!editingTest}
          onClose={() => setEditingTest(null)}
          test={editingTest}
          onSaveTest={async (updated) => {
            try {
              const saved = await saveLabTest(updated);
              setTestsList(getSynchronizedLabTests());
              setEditingTest(null);
              addToast(`Diagnostic test "${saved.name}" updated successfully!`, 'success');
              recordAuditLog({
                action: 'CATALOG_TEST_UPDATE',
                actionTitle: `Diagnostic Test Updated: ${saved.name}`,
                module: 'Diagnostic Lab',
                details: `Modified clinical parameters and pricing for test "${saved.name}".`,
                severity: 'info',
                status: 'Success'
              }).catch(() => {});
              return saved;
            } catch (err) {
              addToast(`Failed to update diagnostic test: ${err.message}`, 'error');
              throw err;
            }
          }}
        />
      )}

      {/* Add Administrator Modal */}
      {isAddAdminModalOpen && (
        <AddAdminModal
          isOpen={isAddAdminModalOpen}
          onClose={() => setIsAddAdminModalOpen(false)}
          onAddAdmin={(newAdmin) => {
            setAdminsList((prev) => [newAdmin, ...prev]);
            setIsAddAdminModalOpen(false);
          }}
        />
      )}

      {/* Edit Administrator Modal */}
      {editingAdmin && (
        <EditAdminModal
          isOpen={!!editingAdmin}
          onClose={() => setEditingAdmin(null)}
          admin={editingAdmin}
          onSaveAdmin={(updated) => {
            setAdminsList((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setEditingAdmin(null);
          }}
        />
      )}

      {/* Add Pharmacy Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddMedicineModalOpen}
        onClose={() => setIsAddMedicineModalOpen(false)}
        onAddMedicine={async (newMed) => {
          try {
            const saved = await saveMedicine(newMed);
            setAdminMedicines((prev) => [saved, ...prev.filter((m) => m.id !== saved.id)]);
            setIsAddMedicineModalOpen(false);
            addToast(`Medicine ${saved.name} added to inventory!`, 'success');
            recordAuditLog({
              action: 'INVENTORY_MEDICINE_CREATE',
              actionTitle: `Medicine Added: ${saved.name}`,
              module: 'Orders & Inventory',
              details: `Added new pharmaceutical product "${saved.name}" (Stock: ${saved.stockQuantity || 100}) to central pharmacy inventory.`,
              severity: 'info',
              status: 'Success'
            }).catch(() => {});
            return saved;
          } catch (err) {
            addToast(`Failed to add medicine: ${err.message}`, 'error');
            throw err;
          }
        }}
      />

      {/* Edit Pharmacy Medicine Modal */}
      {editingMedicine && (
        <EditMedicineModal
          isOpen={!!editingMedicine}
          onClose={() => setEditingMedicine(null)}
          medicine={editingMedicine}
          onSaveMedicine={async (updated) => {
            try {
              const saved = await saveMedicine(updated);
              setAdminMedicines((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
              setEditingMedicine(null);
              addToast(`Medicine ${saved.name} updated successfully!`, 'success');
              recordAuditLog({
                action: 'INVENTORY_MEDICINE_UPDATE',
                actionTitle: `Medicine Updated: ${saved.name}`,
                module: 'Orders & Inventory',
                details: `Updated stock and pricing details for pharmaceutical product "${saved.name}".`,
                severity: 'info',
                status: 'Success'
              }).catch(() => {});
              return saved;
            } catch (err) {
              addToast(`Failed to update medicine: ${err.message}`, 'error');
              throw err;
            }
          }}
        />
      )}

      {/* Add Medicine Category Modal */}
      {isAddCategoryModalOpen && (
        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onAddCategory={(newCat) => {
            setMedicineCategories((prev) => [...prev, newCat]);
            setIsAddCategoryModalOpen(false);
          }}
        />
      )}

      {/* Chief Pharmacist Prescription Audit Modal */}
      {auditingRx && (
        <AuditPrescriptionModal
          isOpen={!!auditingRx}
          onClose={() => setAuditingRx(null)}
          rx={auditingRx}
          onApprove={(rxId, remarks) => {
            handleApprovePrescription(rxId, remarks);
            setAuditingRx(null);
          }}
          onReject={async (rxId, reason) => {
            await updatePrescriptionStatus(rxId, 'Rejected', reason);
            setPrescriptionsList((prev) => prev.map((p) => (p.id === rxId ? { ...p, status: 'Rejected', rejectReason: reason, pharmacistNotes: reason } : p)));
            addToast(`Prescription ${rxId} rejected: ${reason}`, 'info');
            setAuditingRx(null);
          }}
        />
      )}

      {/* Admin Consultation & Service Case Detail Modal */}
      {viewingDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setViewingDetailItem(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0F1E36] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  {viewingDetailItem.icon ? <viewingDetailItem.icon className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{viewingDetailItem.serviceType || 'Service Details'}</h3>
                  <p className="text-[11px] text-teal-400 font-mono">Ref ID: {viewingDetailItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDetailItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{viewingDetailItem.patientName}</h4>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5">{viewingDetailItem.patientPhone || 'Guwahati, Assam'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  viewingDetailItem.status === 'Confirmed' || viewingDetailItem.status === 'Completed' || viewingDetailItem.status === 'Report Published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {viewingDetailItem.status || 'Confirmed'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Service / Speciality</span>
                  <span className="font-semibold text-slate-900">{viewingDetailItem.itemTitle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Facility / Hospital</span>
                  <span className="font-semibold text-slate-900">{viewingDetailItem.itemSubtitle || 'Guwahati Central Hub'}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Scheduled Slot</span>
                  <span className="font-mono text-slate-800">{viewingDetailItem.schedule || 'Scheduled'}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Total Amount</span>
                  <span className="font-black text-teal-700 text-sm font-mono">₹{viewingDetailItem.amount}</span>
                </div>
              </div>

              {viewingDetailItem.raw?.symptoms && (
                <div className="bg-teal-50/50 p-3.5 rounded-2xl border border-teal-100 text-slate-700">
                  <span className="text-[10px] text-teal-800 uppercase font-bold block mb-0.5">Clinical Notes / Symptoms</span>
                  <p className="text-slate-800 font-medium">{viewingDetailItem.raw.symptoms}</p>
                </div>
              )}

              {/* Status Update Control */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Change Status:</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleAdvanceStatus(viewingDetailItem);
                      setViewingDetailItem(null);
                    }}
                    className="px-3 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl font-bold transition shadow-2xs cursor-pointer"
                  >
                    Advance Status
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadSlip(viewingDetailItem)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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
