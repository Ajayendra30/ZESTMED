// src/pages/AdminDashboardPage.jsx
// Redesigned to match the exact ZESTMED Admin Dashboard specification pixel-for-pixel
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  updateDoctorAppointmentStatus,
  updatePhysioStatus,
  updateSurgeryStatus,
  updateWellnessStatus,
  updateLabBookingStatus,
  updateOrderStatus
} from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
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
  FileSpreadsheet,
  Stethoscope,
  Scissors,
  Heart,
  Filter
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { initialInventoryMedicines, initialAdminProfile } from '../mock-data/adminData';
import { MOCK_DIAGNOSTIC_TESTS } from '../mock-data/diagnosticTests';
import { initialPhlebotomyJobs } from '../mock-data/labExecutiveData';
import { initialPatientOrders, initialPatientLabBookings, initialPatientAppointments } from '../mock-data/patientData';
import { getRegisteredPatient, DEFAULT_REGISTERED_PATIENTS, normalizePhone } from '../utils/patientRegistry';
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
import EditMedicineModal from '../components/EditMedicineModal';
import AddCategoryModal from '../components/AddCategoryModal';
import AuditPrescriptionModal from '../components/AuditPrescriptionModal';
import NotificationPopover from '../components/NotificationPopover';
import { playNotificationSound } from '../utils/notificationSound';
import { fetchAdminNotifications, subscribeToNotifications } from '../services/notificationService';
import { openStatutoryDocumentPdf, downloadStatutoryDocumentPdf, downloadOrderInvoicePdf, openClinicalReportPdf } from '../utils/pdfGenerator';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Navigation & Interactive State (persisted across reloads)
  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') || urlParams.get('menu');
      if (tabParam && tabParam !== 'notifications') return tabParam;
      const saved = sessionStorage.getItem('zestmed_admin_active_tab');
      return saved && saved !== 'notifications' ? saved : 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('zestmed_admin_active_tab', activeMenu);
    } catch (_) {}
  }, [activeMenu]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUsersExpanded, setIsUsersExpanded] = useState(true);
  const [isMedicinesExpanded, setIsMedicinesExpanded] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);
  const [testsList, setTestsList] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_diagnostic_tests');
      return saved ? JSON.parse(saved) : MOCK_DIAGNOSTIC_TESTS;
    } catch {
      return MOCK_DIAGNOSTIC_TESTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_diagnostic_tests', JSON.stringify(testsList));
    } catch (_) {}
  }, [testsList]);

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

  const [adminMedicines, setAdminMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_inventory_medicines');
      return saved ? JSON.parse(saved) : initialInventoryMedicines;
    } catch {
      return initialInventoryMedicines;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zestmed_inventory_medicines', JSON.stringify(adminMedicines));
    } catch (_) {}
  }, [adminMedicines]);

  // 1. Clinical Appointments (Doctor Consultations, Physiotherapy, Surgery Packages)
  const [appointmentsList, setAppointmentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('patient_appointments');
      return saved ? JSON.parse(saved) : initialPatientAppointments;
    } catch {
      return initialPatientAppointments;
    }
  });

  // 2. Diagnostic Lab Bookings & Wellness Packages
  const [labBookingsList, setLabBookingsList] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_patient_lab_bookings');
      return saved ? JSON.parse(saved) : initialPatientLabBookings;
    } catch {
      return initialPatientLabBookings;
    }
  });

  // 3. Customer Medicine Orders
  const [ordersList, setOrdersList] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_patient_orders');
      return saved ? JSON.parse(saved) : initialPatientOrders;
    } catch {
      return initialPatientOrders;
    }
  });

  // Helper to compile and compute unified patients directory with live booking/order counts
  const computeMergedPatients = (appts, labs, ords) => {
    const patientMap = new Map();

    const basePatients = [
      { id: 'ZM-PAT-101', name: 'Ajayendra Shekhar', phone: '+91 92791 25091', city: 'Guwahati (Dispur)', status: 'Active' },
      { id: 'ZM-PAT-102', name: 'Rajesh Kumar', phone: '+91 98765 43210', city: 'Guwahati (Ulubari)', status: 'Active' },
      { id: 'ZM-PAT-103', name: 'Priya Sharma', phone: '+91 94350 12345', city: 'Guwahati (Chandmari)', status: 'Active' },
      { id: 'ZM-PAT-104', name: 'Amit Verma', phone: '+91 97060 98765', city: 'Guwahati (Jalukbari)', status: 'Active' },
      { id: 'ZM-PAT-105', name: 'Sneha Singh', phone: '+91 91270 54321', city: 'Guwahati (Khanapara)', status: 'Active' },
      { id: 'ZM-PAT-106', name: 'Deepjyoti Kalita', phone: '+91 98640 12345', city: 'Guwahati (Panbazar)', status: 'Active' }
    ];

    basePatients.forEach((p) => {
      const clean = normalizePhone(p.phone);
      patientMap.set(clean || p.id, { ...p, cleanPhone: clean });
    });

    DEFAULT_REGISTERED_PATIENTS.forEach((p) => {
      const clean = normalizePhone(p.phone);
      if (clean && !patientMap.has(clean)) {
        patientMap.set(clean, {
          id: p.id,
          name: p.name,
          phone: `+91 ${clean}`,
          cleanPhone: clean,
          city: p.city || 'Guwahati, Assam',
          status: 'Active'
        });
      }
    });

    try {
      const savedAdmin = localStorage.getItem('zestmed_admin_patients');
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin);
        if (Array.isArray(parsed)) {
          parsed.forEach((p) => {
            const clean = normalizePhone(p.phone);
            if (clean) {
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
          if (clean && data?.name && data.name !== 'Verified Patient' && !data.name.startsWith('Patient ')) {
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

    // Extract patients from bookings and orders
    appts.forEach((a) => {
      const clean = normalizePhone(a.patientPhone || a.phone);
      const name = a.patientName ? a.patientName.replace(/\s*\(Self\)/i, '').trim() : '';
      if (clean && name && name !== 'Verified Patient' && !name.startsWith('Patient ')) {
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
      if (clean && name && name !== 'Verified Patient' && !name.startsWith('Patient ')) {
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
      if (clean && name && name !== 'Verified Patient' && !name.startsWith('Patient ')) {
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
    const rawAppts = (() => { try { const s = localStorage.getItem('patient_appointments'); return s ? JSON.parse(s) : initialPatientAppointments; } catch { return initialPatientAppointments; } })();
    const rawLabs = (() => { try { const s = localStorage.getItem('zestmed_patient_lab_bookings'); return s ? JSON.parse(s) : initialPatientLabBookings; } catch { return initialPatientLabBookings; } })();
    const rawOrds = (() => { try { const s = localStorage.getItem('zestmed_patient_orders'); return s ? JSON.parse(s) : initialPatientOrders; } catch { return initialPatientOrders; } })();
    return computeMergedPatients(rawAppts, rawLabs, rawOrds);
  });

  // Real-time synchronization across patient/user activities & live Supabase backend
  useEffect(() => {
    let isMounted = true;

    const fetchAllLiveAdminData = async () => {
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

        if (!isMounted) return;

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
            const existingIds = new Set(prev.map((p) => p.id || p.bookingId));
            const newOnes = freshAppointments.filter((f) => !existingIds.has(f.id));
            if (newOnes.length > 0) {
              const merged = [...newOnes, ...prev];
              try {
                localStorage.setItem('patient_appointments', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            }
            return prev;
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
            const existingIds = new Set(prev.map((p) => p.id || p.bookingId));
            const newOnes = freshLabs.filter((f) => !existingIds.has(f.id));
            if (newOnes.length > 0) {
              const merged = [...newOnes, ...prev];
              try {
                localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            }
            return prev;
          });
        }

        // 3. Merge Orders
        if (medOrders.status === 'fulfilled' && Array.isArray(medOrders.value) && medOrders.value.length > 0) {
          const freshOrders = medOrders.value.map((o) => ({
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
            time: o.order_time || o.time || '10:00 AM'
          }));

          setOrdersList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id || p.orderId));
            const newOnes = freshOrders.filter((f) => !existingIds.has(f.id));
            if (newOnes.length > 0) {
              const merged = [...newOnes, ...prev];
              try {
                localStorage.setItem('zestmed_patient_orders', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            }
            return prev;
          });
        }

        // 4. Merge Executives
        if (liveExecutives.status === 'fulfilled' && Array.isArray(liveExecutives.value) && liveExecutives.value.length > 0) {
          const mappedExecs = liveExecutives.value.map((e) => ({
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
            const existingIds = new Set(prev.map((p) => p.id));
            const newOnes = mappedExecs.filter((f) => !existingIds.has(f.id));
            if (newOnes.length > 0) {
              const merged = [...newOnes, ...prev];
              try {
                localStorage.setItem('zestmed_admin_executives', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            }
            return prev;
          });
        }

        // 5. Merge Patients
        if (livePatients.status === 'fulfilled' && Array.isArray(livePatients.value) && livePatients.value.length > 0) {
          const mappedPatients = livePatients.value.map((p) => ({
            id: p.uhid || p.id || `ZM-PAT-${(p.phone || '').slice(-4)}`,
            name: p.full_name || p.name || 'Patient',
            phone: p.phone ? (p.phone.startsWith('+91') ? p.phone : `+91 ${p.phone}`) : '+91 92791 25091',
            city: p.city ? `${p.city}, Assam` : 'Guwahati, Assam',
            status: p.status || 'Active'
          }));

          setPatientsList((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newOnes = mappedPatients.filter((f) => !existingIds.has(f.id));
            if (newOnes.length > 0) {
              return [...newOnes, ...prev];
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Admin live backend sync notice:', err);
      }
    };

    fetchAllLiveAdminData();

    const handleSync = () => {
      try {
        const sAppts = localStorage.getItem('patient_appointments');
        const nextAppts = sAppts ? JSON.parse(sAppts) : appointmentsList;
        if (sAppts) setAppointmentsList(nextAppts);

        const sLabs = localStorage.getItem('zestmed_patient_lab_bookings');
        const nextLabs = sLabs ? JSON.parse(sLabs) : labBookingsList;
        if (sLabs) setLabBookingsList(nextLabs);

        const sOrds = localStorage.getItem('zestmed_patient_orders');
        const nextOrds = sOrds ? JSON.parse(sOrds) : ordersList;
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
    return appointmentsList.filter(
      (a) =>
        a.category === 'doctor' ||
        a.type === 'Doctor Consultation' ||
        a.type === 'Doctor Appointment' ||
        (!a.category && !a.type?.toLowerCase().includes('physio') && !a.type?.toLowerCase().includes('surg'))
    );
  }, [appointmentsList]);

  const physioAppointments = useMemo(() => {
    return appointmentsList.filter(
      (a) =>
        a.category === 'physiotherapy' ||
        a.type === 'Physiotherapy' ||
        a.specialty?.toLowerCase().includes('physio') ||
        a.doctorSpecialty?.toLowerCase().includes('physio') ||
        a.title?.toLowerCase().includes('physio')
    );
  }, [appointmentsList]);

  const surgeryBookings = useMemo(() => {
    return appointmentsList.filter(
      (a) =>
        a.category === 'surgery' ||
        a.type === 'Surgery Package' ||
        Boolean(a.surgeryName) ||
        a.title?.toLowerCase().includes('surgery') ||
        a.title?.toLowerCase().includes('removal') ||
        a.title?.toLowerCase().includes('replacement') ||
        a.title?.toLowerCase().includes('repair')
    );
  }, [appointmentsList]);

  const wellnessBookings = useMemo(() => {
    return labBookingsList.filter(
      (b) =>
        b.type === 'Wellness Package' ||
        b.category?.toLowerCase().includes('package') ||
        b.testCode === 'WEL-PKG' ||
        b.testCode?.includes('PKG') ||
        b.testName?.toLowerCase().includes('package') ||
        b.testName?.toLowerCase().includes('checkup')
    );
  }, [labBookingsList]);

  const diagnosticLabBookings = useMemo(() => {
    return labBookingsList.filter(
      (b) =>
        !(
          b.type === 'Wellness Package' ||
          b.category?.toLowerCase().includes('package') ||
          b.testCode === 'WEL-PKG' ||
          b.testCode?.includes('PKG') ||
          b.testName?.toLowerCase().includes('package') ||
          b.testName?.toLowerCase().includes('checkup')
        )
    );
  }, [labBookingsList]);

  const medicineOrders = useMemo(() => {
    return ordersList;
  }, [ordersList]);

  // Backward-compatible aliases
  const adminBookings = diagnosticLabBookings;
  const adminOrders = medicineOrders;

  // Revenue calculation from all confirmed platform transactions
  const totalRevenueNumber = useMemo(() => {
    const sumOrders = medicineOrders.reduce((acc, o) => acc + (Number(o.total || o.totalAmount) || 0), 0);
    const sumLabs = labBookingsList.reduce((acc, b) => acc + (Number(b.price) || 0), 0);
    const sumAppts = appointmentsList.reduce((acc, a) => acc + (Number(a.fee || a.price) || 0), 0);
    return 1248320 + sumOrders + sumLabs + sumAppts;
  }, [medicineOrders, labBookingsList, appointmentsList]);

  // Exact KPI Metrics with live counts
  const kpiMetrics = [
    {
      title: 'Total Patients',
      value: `${patientsList.length > 6 ? 4892 + (patientsList.length - 6) : 4892}`,
      trend: '↑ +12.4%',
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      targetMenu: 'users-patients'
    },
    {
      title: 'Clinical Appointments',
      value: `${doctorAppointments.length + physioAppointments.length + surgeryBookings.length + 840}`,
      trend: '↑ +16.2%',
      icon: Stethoscope,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      targetMenu: 'appointments-doctor'
    },
    {
      title: 'Lab & Wellness',
      value: `${diagnosticLabBookings.length + wellnessBookings.length + 1230}`,
      trend: '↑ +18.7%',
      icon: Calendar,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      targetMenu: 'lab-bookings'
    },
    {
      title: 'Medicine Orders',
      value: `${medicineOrders.length + 2164}`,
      trend: '↑ +14.2%',
      icon: ShoppingCart,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
      targetMenu: 'orders'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenueNumber.toLocaleString('en-IN')}`,
      trend: '↑ +20.6%',
      icon: Coins,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
      targetMenu: 'analytics'
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

  const handleApprovePrescription = (rxId, remarks) => {
    const rx = prescriptionsList.find((p) => p.id === rxId);
    setPrescriptionsList((prev) => prev.map((p) => (p.id === rxId ? { ...p, status: 'Approved', remarks } : p)));

    if (rx) {
      const generatedOrder = {
        id: `#ORD-RX-${rxId.replace(/\D/g, '') || Date.now()}`,
        orderId: `#ORD-RX-${rxId.replace(/\D/g, '') || Date.now()}`,
        customer: rx.patient || rx.patientName || 'Patient',
        patientName: rx.patient || rx.patientName || 'Patient',
        phone: rx.phone || '+91 92791 25091',
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
      return saved ? JSON.parse(saved) : [
        { id: 'RX-9821', patient: 'Ajayendra Shekhar', patientName: 'Ajayendra Shekhar', phone: '+91 92791 25091', doctor: 'Dr. B. K. Sarma (MD)', date: 'Nov 12, 2026', items: 'Metformin 500mg, Rosuvastatin 10mg', status: 'Approved' },
        { id: 'RX-9822', patient: 'Minati Shekhar', patientName: 'Minati Shekhar', phone: '+91 98765 43210', doctor: 'Dr. D. Goswami (Cardiologist)', date: 'Nov 13, 2026', items: 'Telmisartan 40mg, Atorvastatin 20mg', status: 'Pending Audit' },
        { id: 'RX-9823', patient: 'Priya Sharma', patientName: 'Priya Sharma', phone: '+91 94350 12345', doctor: 'Dr. S. Roy (General Med)', date: 'Nov 14, 2026', items: 'Thyroxine 50mcg', status: 'Pending Audit' }
      ];
    } catch {
      return [
        { id: 'RX-9821', patient: 'Ajayendra Shekhar', patientName: 'Ajayendra Shekhar', phone: '+91 92791 25091', doctor: 'Dr. B. K. Sarma (MD)', date: 'Nov 12, 2026', items: 'Metformin 500mg, Rosuvastatin 10mg', status: 'Approved' },
        { id: 'RX-9822', patient: 'Minati Shekhar', patientName: 'Minati Shekhar', phone: '+91 98765 43210', doctor: 'Dr. D. Goswami (Cardiologist)', date: 'Nov 13, 2026', items: 'Telmisartan 40mg, Atorvastatin 20mg', status: 'Pending Audit' },
        { id: 'RX-9823', patient: 'Priya Sharma', patientName: 'Priya Sharma', phone: '+91 94350 12345', doctor: 'Dr. S. Roy (General Med)', date: 'Nov 14, 2026', items: 'Thyroxine 50mcg', status: 'Pending Audit' }
      ];
    }
  });

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
      linkType: 'appointments-doctor'
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
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
                  {patientsList.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isUsersExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
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
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'users-patients' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Patients</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{patientsList.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('users-executives');
                    setIsSidebarOpen(false);
                    addToast('Filtered view: On-Duty Lab Executives & Phlebotomists', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'users-executives' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Lab Executives</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{executivesList.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('users-admins');
                    setIsSidebarOpen(false);
                    addToast('Super Admin Role Overview', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'users-admins' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Admins</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{adminsList.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Clinical Services Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setIsClinicalExpanded(!isClinicalExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'appointments-doctor' || activeMenu === 'appointments-physio' || activeMenu === 'bookings-surgery'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="w-4 h-4" />
                <span>Clinical Services</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
                  {doctorAppointments.length + physioAppointments.length + surgeryBookings.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isClinicalExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {isClinicalExpanded && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('appointments-doctor');
                    setIsSidebarOpen(false);
                    addToast('Doctor Consultations & Appointments', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'appointments-doctor' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Doctor Appointments</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{doctorAppointments.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('appointments-physio');
                    setIsSidebarOpen(false);
                    addToast('Physiotherapy & Rehab Bookings', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'appointments-physio' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Physiotherapy</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{physioAppointments.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('bookings-surgery');
                    setIsSidebarOpen(false);
                    addToast('Surgery Package Bookings', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'bookings-surgery' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Surgery Packages</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{surgeryBookings.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Diagnostics & Wellness Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setIsDiagnosticsExpanded(!isDiagnosticsExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'lab-bookings' || activeMenu === 'bookings-wellness' || activeMenu === 'diagnostic-tests'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="w-4 h-4" />
                <span>Diagnostics & Wellness</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
                  {diagnosticLabBookings.length + wellnessBookings.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isDiagnosticsExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {isDiagnosticsExpanded && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('lab-bookings');
                    setIsSidebarOpen(false);
                    addToast('Diagnostic Lab Test Bookings', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'lab-bookings' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Lab Tests</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{diagnosticLabBookings.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('bookings-wellness');
                    setIsSidebarOpen(false);
                    addToast('Preventive Wellness Packages', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'bookings-wellness' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Wellness Packages</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{wellnessBookings.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('diagnostic-tests');
                    setIsSidebarOpen(false);
                    addToast('Diagnostic Tests Catalog', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'diagnostic-tests' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Test Catalog</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{testsList.length}</span>
                </button>
              </div>
            )}
          </div>

          {/* Medicines & Orders Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setIsMedicinesExpanded(!isMedicinesExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'orders' || activeMenu === 'medicines' || activeMenu === 'medicines-all' || activeMenu === 'medicines-categories' || activeMenu === 'medicines-add'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Pill className="w-4 h-4" />
                <span>Medicines & Pharmacy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-teal-400 font-mono">
                  {medicineOrders.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMedicinesExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {isMedicinesExpanded && (
              <div className="pl-9 pr-2 py-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('orders');
                    setIsSidebarOpen(false);
                    addToast('Customer Medicine Orders', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                    activeMenu === 'orders' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Medicine Orders</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{medicineOrders.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('medicines-all');
                    setIsSidebarOpen(false);
                    addToast('Opening Central Pharmacy Catalog', 'info');
                  }}
                  className={`w-full text-left py-1 text-xs transition flex items-center gap-2 ${
                    activeMenu === 'medicines-all' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
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
                    activeMenu === 'medicines-categories' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
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
                    activeMenu === 'medicines-add' ? 'text-[#14B8A6] font-bold' : 'text-[#88A0B8] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>Add Medicine</span>
                </button>
              </div>
            )}
          </div>

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
              setIsSidebarOpen(false);
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
              setIsSidebarOpen(false);
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
              setIsSidebarOpen(false);
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
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition"
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
              <div className="relative w-full h-52 sm:h-64 pt-2">
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
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="w-5 h-5 text-[#14B8A6]" />
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
          {/* 6. BOTTOM SECTION: ALL SERVICES FEED + LOW STOCK         */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Live Unified Feed of All Services (Width ~65%) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#14B8A6]" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      All Services & Live Activities Overview
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Real-time bookings across Doctor Consultations, Physiotherapy, Surgeries, Wellness, Lab Tests & Orders
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Activities', count: allActivities.length },
                  { id: 'doctor', label: 'Doctor', count: doctorAppointments.length },
                  { id: 'physio', label: 'Physiotherapy', count: physioAppointments.length },
                  { id: 'surgery', label: 'Surgery', count: surgeryBookings.length },
                  { id: 'wellness', label: 'Wellness', count: wellnessBookings.length },
                  { id: 'lab', label: 'Lab Tests', count: diagnosticLabBookings.length },
                  { id: 'order', label: 'Medicine Orders', count: medicineOrders.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivityCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                      activityCategoryFilter === tab.id
                        ? 'bg-[#14B8A6] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activityCategoryFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Activities Table */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-slate-100 pb-2.5">
                      <th className="py-2.5 px-3 font-bold">Service Category</th>
                      <th className="py-2.5 px-3 font-bold">ID / Ref</th>
                      <th className="py-2.5 px-3 font-bold">Patient</th>
                      <th className="py-2.5 px-3 font-bold">Service / Item Details</th>
                      <th className="py-2.5 px-3 font-bold">Schedule / Date</th>
                      <th className="py-2.5 px-3 font-bold">Amount</th>
                      <th className="py-2.5 px-3 font-bold text-center">Status</th>
                      <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allActivities
                      .filter((item) => {
                        if (activityCategoryFilter !== 'all' && item.category !== activityCategoryFilter) return false;
                        if (searchQuery.trim()) {
                          const q = searchQuery.toLowerCase();
                          return (
                            (item.id || '').toLowerCase().includes(q) ||
                            (item.patientName || '').toLowerCase().includes(q) ||
                            (item.itemTitle || '').toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .slice(0, 8)
                      .map((item) => {
                        const IconComp = item.icon || Activity;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${item.badgeClass}`}>
                                <IconComp className="w-3.5 h-3.5 shrink-0" />
                                <span>{item.serviceType}</span>
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                              {item.id}
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              <div>{item.patientName}</div>
                              {item.patientPhone && <span className="text-[10px] text-slate-400 font-mono">{item.patientPhone}</span>}
                            </td>
                            <td className="py-3 px-3 text-slate-700 max-w-[200px]">
                              <div className="font-semibold text-slate-900 truncate">{item.itemTitle}</div>
                              <div className="text-[10px] text-slate-400 truncate">{item.itemSubtitle}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                              {item.schedule || 'Scheduled'}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                              ₹{item.amount}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                item.status === 'Confirmed' || item.status === 'Delivered' || item.status === 'Report Published' || item.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceStatus(item)}
                                  className="px-2 py-1 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer"
                                  title="Advance Status"
                                >
                                  Advance
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails(item)}
                                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="View Full Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSlip(item)}
                                  className="p-1 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                  title="Download / Print Slip"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Low Stock Medicines (Width ~35%) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-[#14B8A6]" />
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
                    <Users className="w-6 h-6 text-[#14B8A6]" />
                    <span>Registered Patients Directory (Assam)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    4,892 patient accounts registered across Guwahati Hubs (Dispur, Panbazar, Ulubari, Jalukbari & Khanapara).
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
                      {patientsList
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
          {activeMenu === 'appointments-doctor' && (
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
                      {doctorAppointments
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
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CLINICAL SERVICES: PHYSIOTHERAPY BOOKINGS                */}
          {/* ======================================================== */}
          {activeMenu === 'appointments-physio' && (
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
          {activeMenu === 'bookings-surgery' && (
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
          {activeMenu === 'bookings-wellness' && (
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
                    onClick={() => setActiveMenu('medicines-add')}
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
                    <option value="Diabetes Care">Diabetes Care</option>
                    <option value="Cardiac & BP">Cardiac & BP</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Digestive Health">Digestive Health</option>
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
                          if (medicineFilterCategory !== 'all' && m.categoryName !== medicineFilterCategory) return false;
                          const q = (medicineSearchQuery || searchQuery).trim().toLowerCase();
                          if (!q) return true;
                          return (
                            (m.name || '').toLowerCase().includes(q) ||
                            (m.genericName || '').toLowerCase().includes(q) ||
                            (m.categoryName || '').toLowerCase().includes(q) ||
                            (m.batchNo || '').toLowerCase().includes(q)
                          );
                        })
                        .map((m) => (
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
                              onClick={() => setEditingMedicine(m)}
                              className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-xs font-bold transition mr-1.5 cursor-pointer"
                              title="Edit Medicine Details"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminMedicines((prev) =>
                                  prev.map((it) => (it.id === m.id ? { ...it, stock: it.stock + 100 } : it))
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
                                setAdminMedicines((prev) => prev.filter((it) => it.id !== m.id));
                                addToast(`Removed ${m.name} from active inventory`, 'info');
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
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
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Plus className="w-6 h-6 text-[#14B8A6]" />
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#14B8A6]"
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#14B8A6]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Category</label>
                      <select
                        value={newMedForm.categoryName}
                        onChange={(e) => setNewMedForm({ ...newMedForm, categoryName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#14B8A6] bg-white"
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#14B8A6]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        value={newMedForm.price}
                        onChange={(e) => setNewMedForm({ ...newMedForm, price: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#14B8A6]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="e.g. Dec 2027"
                        value={newMedForm.expiry}
                        onChange={(e) => setNewMedForm({ ...newMedForm, expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#14B8A6]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold rounded-xl shadow-xs transition"
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
                    <FlaskConical className="w-6 h-6 text-[#14B8A6]" />
                    <span>Diagnostic Pathology Tests Catalog</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage 56+ diagnostic tests, home collection parameters, and NABL pricing across Assam.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const headers = ['Test ID', 'Test Name', 'Sample Type', 'Category', 'Turnaround', 'Fasting Required', 'Price (INR)'];
                      const rows = testsList.map((t) => [
                        t.id,
                        t.name,
                        t.sampleType,
                        t.categoryName || t.category || '',
                        t.turnaroundTime || '24 Hours',
                        t.fastingRequired ? 'Yes' : 'No',
                        t.price
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
                              onClick={() => {
                                setTestsList((prev) => prev.filter((item) => item.id !== t.id));
                                addToast(`Test "${t.name}" removed from catalog`, 'info');
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prescriptionsList.map((rx) => (
                  <div key={rx.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-teal-600">{rx.id}</span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rx.patient}</h3>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        rx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : rx.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
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
                        onClick={() => setAuditingRx(rx)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                        title="Audit prescription and verify medications"
                      >
                        Audit / View
                      </button>
                      {rx.status !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() => handleApprovePrescription(rx.id)}
                          className="flex-1 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl text-xs font-bold transition text-center shadow-xs cursor-pointer"
                        >
                          Approve & Dispense
                        </button>
                      )}
                      {rx.status !== 'Rejected' && rx.status !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() => {
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
          onSaveTest={(updated) => {
            setTestsList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setEditingTest(null);
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

      {/* Edit Pharmacy Medicine Modal */}
      {editingMedicine && (
        <EditMedicineModal
          isOpen={!!editingMedicine}
          onClose={() => setEditingMedicine(null)}
          medicine={editingMedicine}
          onSaveMedicine={(updated) => {
            setAdminMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            setEditingMedicine(null);
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
          onReject={(rxId, reason) => {
            setPrescriptionsList((prev) => prev.map((p) => (p.id === rxId ? { ...p, status: 'Rejected', rejectReason: reason } : p)));
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
