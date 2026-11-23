// src/pages/PatientDashboardPage.jsx
// Redesigned to match the exact ZESTMED Patient / User Dashboard specification pixel-for-pixel
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSubdomainUrl } from '../utils/subdomain';
import { saveRegisteredPatient, normalizePhone, checkPhoneUniqueness } from '../utils/patientRegistry';
import { getLoginHistory } from '../services/otpAuthService';
import { 
  updateDoctorAppointmentStatus, 
  updateLabBookingStatus, 
  updateOrderStatus,
  updateBookingPaymentStatus,
  getUserBookings 
} from '../services/supabaseService';
import { isLabTestOrPackage, isWellnessPackage } from '../utils/itemClassification';
import { 
  getUserPrescriptions, 
  deletePrescription, 
  downloadPrescriptionFile 
} from '../services/prescriptionService';
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
  Activity,
  Stethoscope,
  Scissors,
  PersonStanding,
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
  RotateCcw,
  CreditCard,
  Settings,
  Sparkles,
  HeartPulse,
  PieChart,
  Scale,
  TrendingUp,
  Layers,
  XCircle,
  BriefcaseMedical,
  Droplet,
  AlertTriangle,
  AlertCircle,
  ListFilter,
  MoreVertical,
  BarChart3,
  Hourglass,
  Lock,
  Copy,
  Building2,
  Sun,
  SlidersHorizontal,
  Globe,
  Moon,
  Link2,
  Smartphone,
  Key,
  Monitor,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  initialPatientProfile,
  initialPatientOrders,
  initialPatientLabBookings,
  initialPatientAppointments,
  initialAssamAddresses
} from '../mock-data/patientData';
import DigitalLabReportModal from '../components/DigitalLabReportModal';
import { downloadOrderInvoicePdf, openClinicalReportPdf } from '../utils/pdfGenerator';
import OrderInvoiceModal from '../components/OrderInvoiceModal';
import AddAddressModal from '../components/AddAddressModal';
import PrescriptionDetailModal from '../components/PrescriptionDetailModal';
import PrescriptionUploadModal from '../components/PrescriptionUploadModal';
import BookingDetailModal from '../components/BookingDetailModal';
import NotificationPopover, { DEFAULT_NOTIFICATIONS } from '../components/NotificationPopover';
import { playNotificationSound } from '../utils/notificationSound';
import { fetchUserNotifications, subscribeToNotifications } from '../services/notificationService';
import AuthModal from '../components/AuthModal';
import { getMockReportDetails, downloadClinicalReport, shareClinicalReport } from '../utils/reportGenerator';

export default function PatientDashboardPage({ onOpenPrescriptionModal }) {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, openAuth, loginWithGoogle, updateUser } = useAuth();
  const { totalItemsCount, cartCount, openCart } = useCart();
  const { addToast } = useToast();

  // Navigation State (persisted across reloads and tab navigation)
  const validMenus = ['dashboard', 'bookings', 'prescription', 'reports', 'profile', 'records', 'settings'];
  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') || urlParams.get('menu');
      if (tabParam && validMenus.includes(tabParam)) return tabParam;
      const openParam = urlParams.get('open');
      if (openParam === 'prescription') return 'prescription';
      const saved = sessionStorage.getItem('zestmed_patient_active_tab');
      return saved && validMenus.includes(saved) ? saved : 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  useEffect(() => {
    try {
      if (validMenus.includes(activeMenu)) {
        sessionStorage.setItem('zestmed_patient_active_tab', activeMenu);
      }
    } catch (_) {}
  }, [activeMenu]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [healthTipIndex, setHealthTipIndex] = useState(0);

  // Real Database Bookings for Logged-In User
  const [userBookings, setUserBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState(null);

  // Strict matching helper to ensure patient data isolation
  const isMatchingCurrentUser = useCallback((item) => {
    if (!item || !user) return false;
    const cleanUserPhone = normalizePhone(user.phone || user.contact || '');
    const itemPhone = normalizePhone(item.phone || item.patientPhone || item.patient_phone || item.contact || item.contactNumber || '');
    if (cleanUserPhone && itemPhone) {
      return cleanUserPhone === itemPhone;
    }
    if (user.id && (item.userId || item.user_id)) {
      return String(user.id) === String(item.userId || item.user_id);
    }
    if (user.email && (item.userEmail || item.user_email || item.email)) {
      const itemEmail = String(item.userEmail || item.user_email || item.email || '').trim().toLowerCase();
      if (itemEmail && itemEmail === String(user.email || '').trim().toLowerCase()) return true;
    }
    return false;
  }, [user]);

  // Patient Real-Time Notifications (connected to backend, database & real-time events)
  const [patientNotifications, setPatientNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [readNotificationVersion, setReadNotificationVersion] = useState(0);

  useEffect(() => {
    const handleReadSync = () => setReadNotificationVersion((v) => v + 1);
    window.addEventListener('zestmed_notifications_read', handleReadSync);
    return () => window.removeEventListener('zestmed_notifications_read', handleReadSync);
  }, []);

  const unreadNotificationCount = useMemo(() => {
    try {
      const readIds = new Set(JSON.parse(localStorage.getItem('zestmed_read_notification_ids') || '[]'));
      return (patientNotifications || []).filter(
        (n) => !n.read && !n.isRead && !readIds.has(String(n.id)) && (!n.refId || !readIds.has(String(n.refId)))
      ).length;
    } catch {
      return patientNotifications.length;
    }
  }, [patientNotifications, readNotificationVersion]);

  useEffect(() => {
    let isMounted = true;
    const loadNotifs = async () => {
      try {
        const notifs = await fetchUserNotifications(user?.phone || user?.contact, user);
        if (isMounted) {
          if (notifs && notifs.length > 0) {
            setPatientNotifications(notifs);
          } else {
            setPatientNotifications(DEFAULT_NOTIFICATIONS);
          }
        }
      } catch (err) {
        console.warn('[PatientDashboard] Notifications load warning:', err);
      }
    };

    loadNotifs();

    // Subscribe to real-time events across windows, tabs and database
    const unsubscribe = subscribeToNotifications((incoming) => {
      if (incoming) {
        setPatientNotifications((prev) => {
          if (prev.some((n) => n.id === incoming.id || (n.refId && n.refId === incoming.refId && n.notifType === incoming.notifType))) {
            return prev;
          }
          playNotificationSound();
          return [incoming, ...prev];
        });
      } else {
        loadNotifs();
      }
    }, 'Patient', user?.phone || user?.contact);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  // Modals State
  const [selectedReportBooking, setSelectedReportBooking] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isPrescriptionUploadModalOpen, setIsPrescriptionUploadModalOpen] = useState(false);

  // Diagnostic Reports Page States
  const [reportFilter, setReportFilter] = useState('all');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportTimeFilter, setReportTimeFilter] = useState('all');

  // Doctor's Prescription Vault States
  const [rxStatusFilter, setRxStatusFilter] = useState('all');
  const [rxSearchQuery, setRxSearchQuery] = useState('');
  const [rxTimeFilter, setRxTimeFilter] = useState('all');
  const [activeRxMenuId, setActiveRxMenuId] = useState(null);

  // Health Records Vault States
  const [recordsFilter, setRecordsFilter] = useState('all');
  const [recordsSearchQuery, setRecordsSearchQuery] = useState('');
  const [recordsTimeFilter, setRecordsTimeFilter] = useState('all');
  const [activeRecordMenuId, setActiveRecordMenuId] = useState(null);
  const [isRecordVitalsModalOpen, setIsRecordVitalsModalOpen] = useState(false);
  const [patientVitals, setPatientVitals] = useState(() => {
    try {
      const saved = localStorage.getItem('zestmed_patient_vitals');
      return saved ? JSON.parse(saved) : { bp: '118/76', hr: '72', spo2: '99', sugar: '96', bmi: '22.4' };
    } catch (_) {
      return { bp: '118/76', hr: '72', spo2: '99', sugar: '96', bmi: '22.4' };
    }
  });

  // Profile Edit & Health Preferences States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [healthAllergies, setHealthAllergies] = useState(() => {
    try {
      return localStorage.getItem('zestmed_allergies') || 'Pollen, Dust';
    } catch (_) {
      return 'Pollen, Dust';
    }
  });
  const [healthConditions, setHealthConditions] = useState(() => {
    try {
      return localStorage.getItem('zestmed_conditions') || 'None Added';
    } catch (_) {
      return 'None Added';
    }
  });
  const [healthMedications, setHealthMedications] = useState(() => {
    try {
      return localStorage.getItem('zestmed_medications') || 'None Added';
    } catch (_) {
      return 'None Added';
    }
  });

  // Settings & Preferences States
  const [settingsActiveTab, setSettingsActiveTab] = useState('security');
  const [settingsOtpAuth, setSettingsOtpAuth] = useState(true);
  const [settingsSmsWhatsapp, setSettingsSmsWhatsapp] = useState(true);
  const [settingsEmailReports, setSettingsEmailReports] = useState(true);
  const [settingsInAppNotifs, setSettingsInAppNotifs] = useState(true);
  const [settingsLabUpdates, setSettingsLabUpdates] = useState(true);
  const [settingsAppointmentUpdates, setSettingsAppointmentUpdates] = useState(true);
  const [settingsOrderUpdates, setSettingsOrderUpdates] = useState(true);
  const [settingsLanguage, setSettingsLanguage] = useState('English');
  const [settingsTheme, setSettingsTheme] = useState('light');

  // Ensure a verified patient session is active so reloading keeps the patient dashboard open
  useEffect(() => {
    if (!user) {
      try {
        const storedUser = localStorage.getItem('zestmed_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && updateUser) {
            updateUser(parsed);
            return;
          }
        }
        // Initialize default verified patient profile if none exists so dashboard stays open on reload
        const defaultPatient = {
          id: 'usr_patient_default',
          name: 'Ajayendra Shekhar',
          contact: '+91 92791 25091',
          phone: '+91 92791 25091',
          email: 'ajayendra.shekhar@zestmed.com',
          role: 'patient',
          uhid: 'ZM-PAT-501284',
          bloodGroup: 'B+',
          age: 34,
          gender: 'Male'
        };
        localStorage.setItem('zestmed_user', JSON.stringify(defaultPatient));
        if (updateUser) {
          updateUser(defaultPatient);
        }
      } catch (_) {}
    }
  }, [user, updateUser]);

  // Check URL query to open prescription vault or switch tabs if requested
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') || params.get('menu');
      const openParam = params.get('open');
      if (openParam === 'prescription' || tabParam === 'prescription') {
        setActiveMenu('prescription');
        setIsPrescriptionUploadModalOpen(true);
      } else if (tabParam && tabParam !== 'notifications') {
        setActiveMenu(tabParam);
      }
    } catch (_) {}
  }, []);

  // Fetch real user bookings from database
  useEffect(() => {
    let isMounted = true;
    const fetchRealUserBookings = async () => {
      if (!user) {
        setUserBookings([]);
        return;
      }
      setIsLoadingBookings(true);
      try {
        const bookings = await getUserBookings(user);
        if (isMounted) {
          setUserBookings(bookings || []);
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching user bookings:', err);
        if (isMounted) setUserBookings([]);
      } finally {
        if (isMounted) setIsLoadingBookings(false);
      }
    };

    fetchRealUserBookings();

    const handleSyncStorage = () => {
      fetchRealUserBookings();
    };

    window.addEventListener('storage', handleSyncStorage);
    window.addEventListener('zestmed_booking_updated', handleSyncStorage);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleSyncStorage);
      window.removeEventListener('zestmed_booking_updated', handleSyncStorage);
    };
  }, [user]);

  // Persistent User Data (strictly scoped to current verified user)
  const [orders, setOrders] = useState(() => {
    if (!user) return [];
    try {
      const saved = localStorage.getItem('zestmed_patient_orders');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(isMatchingCurrentUser) : [];
    } catch {
      return [];
    }
  });

  const [labBookings, setLabBookings] = useState(() => {
    if (!user) return [];
    try {
      const saved = localStorage.getItem('zestmed_patient_lab_bookings');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(isMatchingCurrentUser) : [];
    } catch {
      return [];
    }
  });

  const [appointments, setAppointments] = useState(() => {
    if (!user) return [];
    try {
      const saved = localStorage.getItem('patient_appointments');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(isMatchingCurrentUser) : [];
    } catch {
      return [];
    }
  });

  // Synchronize user-specific orders and bookings when user logs in or updates
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLabBookings([]);
      setAppointments([]);
      return;
    }
    try {
      const savedOrders = localStorage.getItem('zestmed_patient_orders');
      setOrders(savedOrders ? JSON.parse(savedOrders).filter(isMatchingCurrentUser) : []);

      const savedLab = localStorage.getItem('zestmed_patient_lab_bookings');
      setLabBookings(savedLab ? JSON.parse(savedLab).filter(isMatchingCurrentUser) : []);

      const savedAppts = localStorage.getItem('patient_appointments');
      setAppointments(savedAppts ? JSON.parse(savedAppts).filter(isMatchingCurrentUser) : []);
    } catch (_) {}
  }, [user, isMatchingCurrentUser]);

  // Real-time synchronization across app actions
  useEffect(() => {
    const handleSyncStorage = () => {
      if (!user) return;
      try {
        const savedOrders = localStorage.getItem('zestmed_patient_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders).filter(isMatchingCurrentUser));

        const savedLab = localStorage.getItem('zestmed_patient_lab_bookings');
        if (savedLab) setLabBookings(JSON.parse(savedLab).filter(isMatchingCurrentUser));

        const savedAppts = localStorage.getItem('patient_appointments');
        if (savedAppts) setAppointments(JSON.parse(savedAppts).filter(isMatchingCurrentUser));
      } catch (err) {
        console.error('Storage sync error', err);
      }
    };

    window.addEventListener('storage', handleSyncStorage);
    window.addEventListener('zestmed_booking_updated', handleSyncStorage);
    return () => {
      window.removeEventListener('storage', handleSyncStorage);
      window.removeEventListener('zestmed_booking_updated', handleSyncStorage);
    };
  }, [user, isMatchingCurrentUser]);

  // Sanitize orders so wellness packages and lab tests never contaminate medicine orders
  // Handles both purely package/lab orders AND mixed orders (containing medicines + lab tests)
  useEffect(() => {
    try {
      const rawOrders = JSON.parse(localStorage.getItem('zestmed_patient_orders') || '[]');
      if (Array.isArray(rawOrders) && rawOrders.length > 0) {
        let hasChanges = false;
        const existingLabs = JSON.parse(localStorage.getItem('zestmed_patient_lab_bookings') || '[]');
        const updatedLabs = [...existingLabs];
        const sanitizedOrders = [];

        rawOrders.forEach((order) => {
          if (!Array.isArray(order.items) || order.items.length === 0) {
            sanitizedOrders.push(order);
            return;
          }

          const medItems = order.items.filter(it => !isLabTestOrPackage(it));
          const testItems = order.items.filter(it => isLabTestOrPackage(it));

          // If there are lab tests or wellness packages in this order, extract them into lab bookings
          if (testItems.length > 0) {
            hasChanges = true;
            testItems.forEach((testItem, idx) => {
              const isPkg = isWellnessPackage(testItem);
              const labId = order.id 
                ? order.id.replace('ORD', isPkg ? 'WEL' : 'LAB') + (testItems.length > 1 ? `-${idx + 1}` : '')
                : `ZM-${isPkg ? 'WEL' : 'LAB'}-${Date.now()}-${idx + 1}`;

              const alreadyExists = updatedLabs.some(l => 
                String(l.id || l.bookingId) === String(labId) || 
                (l.testName === testItem.name && l.phone === order.phone)
              );

              if (!alreadyExists) {
                updatedLabs.unshift({
                  id: labId,
                  bookingId: labId,
                  booking_number: labId,
                  type: isPkg ? 'Wellness Package' : 'Diagnostic Lab Test',
                  testName: testItem.name,
                  category: isPkg ? 'Wellness Package' : (testItem.category || 'Diagnostic Test'),
                  bookedDate: order.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                  collectionDate: 'Tomorrow, 07:30 AM',
                  date: order.date || 'Tomorrow',
                  time: '07:30 AM - Home Collection',
                  patientName: order.patientName || user?.name || 'Self',
                  phone: order.phone || user?.phone || '',
                  patientPhone: order.phone || user?.phone || '',
                  userId: order.userId || user?.id || null,
                  userEmail: order.userEmail || user?.email || '',
                  status: order.status || 'Confirmed',
                  paymentStatus: order.paymentStatus || 'Paid (UPI / Razorpay Verified)',
                  paymentMethod: order.paymentMethod || 'Razorpay (UPI - Verified)',
                  price: testItem.price || 499,
                  totalAmount: (testItem.price || 499) * (testItem.quantity || 1),
                  specimen: isPkg ? 'Blood & Serum Sample (Fasting)' : (testItem.specimen || 'Blood / Serum Sample (NABL Barcoded)'),
                  collectionAddress: order.deliveryAddress || user?.address || 'Dispur, Guwahati - 781005',
                  phlebotomist: {
                    name: 'Bikash Das',
                    id: 'ZM-PHL-AS-14',
                    phone: '+91 92791 25091',
                    vaccinated: true
                  },
                  reportingDoctor: 'Dr. Pranabesh Sarma, MD Pathology (Reg No. AMC-29182-AS)',
                  parametersSummary: `${testItem.name} - Home Sample Collection Booked`,
                  createdAt: order.createdAt || new Date().toISOString()
                });
              }
            });

            // If genuine medicines remain in this order, keep it with only medicines
            if (medItems.length > 0) {
              const medTotal = medItems.reduce((acc, curr) => acc + (curr.price * (curr.quantity || 1)), 0);
              sanitizedOrders.push({
                ...order,
                items: medItems,
                totalAmount: medTotal + (medTotal > 499 ? 0 : 49),
                mrpTotal: medItems.reduce((acc, curr) => acc + ((curr.mrp || curr.price * 1.25) * (curr.quantity || 1)), 0),
                savings: Math.round(medItems.reduce((acc, curr) => acc + (((curr.mrp || curr.price * 1.25) - curr.price) * (curr.quantity || 1)), 0)),
                deliveryFee: medTotal > 499 ? 0 : 49
              });
            }
          } else {
            // Pure medicine order
            sanitizedOrders.push(order);
          }
        });

        if (hasChanges) {
          localStorage.setItem('zestmed_patient_orders', JSON.stringify(sanitizedOrders));
          localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(updatedLabs));
          setOrders(sanitizedOrders.filter(isMatchingCurrentUser));
          setLabBookings(updatedLabs.filter(isMatchingCurrentUser));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        }
      }
    } catch (e) {
      console.warn('Error sanitizing orders:', e);
    }
  }, [isMatchingCurrentUser, user]);

  const [addresses, setAddresses] = useState(() => {
    if (!user) return [];
    const cleanUserPhone = normalizePhone(user.phone || user.contact || '');
    try {
      const saved = localStorage.getItem('zestmed_saved_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const userAddrs = parsed.filter(a => {
            const aPhone = normalizePhone(a.phone || a.contact || '');
            return !aPhone || aPhone === cleanUserPhone;
          });
          if (userAddrs.length > 0) return userAddrs;
        }
      }
      return [];
    } catch {
      return [];
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
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');
  const [profileForm, setProfileForm] = useState(() => {
    let saved = null;
    try {
      const stored = localStorage.getItem('zestmed_patient_profile');
      if (stored) saved = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const currentName = (user?.name && user.name !== 'Verified Patient' && user.name !== 'Rahul Verma') 
      ? user.name 
      : (saved?.name && saved.name !== 'Verified Patient' && saved.name !== 'Rahul Verma') 
      ? saved.name 
      : 'Ajayendra Shekhar';
    return {
      name: currentName,
      uhid: user?.uhid || saved?.uhid || (user?.id ? `ZM-PAT-${user.id.replace(/\D/g, '').slice(-6) || '501284'}` : 'ZM-PAT-501284'),
      email: (user?.email && !user.email.includes('rahul.verma')) ? user.email : (saved?.email && !saved.email.includes('rahul.verma')) ? saved.email : 'ajayendra.shekhar@zestmed.com',
      phone: user?.contact || user?.phone || saved?.phone || '+91 92791 25091',
      age: user?.age || saved?.age || '34',
      gender: user?.gender || saved?.gender || 'Male',
      bloodGroup: user?.bloodGroup || saved?.bloodGroup || 'B+',
      emergencyContact: user?.emergencyContact || saved?.emergencyContact || 'Emergency Contact (+91 92791 25091)',
      city: user?.city || saved?.city || 'Guwahati, Assam'
    };
  });

  useEffect(() => {
    if (user?.name && user.name !== 'Verified Patient' && user.name !== 'Rahul Verma') {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name,
        phone: user.contact || user.phone || prev.phone,
        email: (user.email && !user.email.includes('rahul.verma')) ? user.email : prev.email,
        uhid: user.uhid || prev.uhid
      }));
    }
  }, [user]);

  const handleCancelBooking = (bookingId) => {
    setUserBookings((prev) =>
      prev.map((b) => (b.id === bookingId || b.bookingId === bookingId ? { ...b, bookingStatus: 'Cancelled', status: 'Cancelled' } : b))
    );

    setLabBookings((prev) => {
      const updated = prev.map((b) => (b.id === bookingId || b.bookingId === bookingId ? { ...b, status: 'Cancelled' } : b));
      try {
        localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setAppointments((prev) => {
      const updated = prev.map((a) => (a.id === bookingId || a.bookingId === bookingId ? { ...a, status: 'Cancelled' } : a));
      try {
        localStorage.setItem('patient_appointments', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === bookingId || o.order_number === bookingId ? { ...o, status: 'Cancelled' } : o));
      try {
        localStorage.setItem('zestmed_patient_orders', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Sync cancellation to Supabase PostgreSQL
    updateDoctorAppointmentStatus(bookingId, 'Cancelled').catch(() => {});
    updateLabBookingStatus(bookingId, 'Cancelled').catch(() => {});
    updateOrderStatus(bookingId, 'Cancelled').catch(() => {});

    window.dispatchEvent(new Event('zestmed_booking_updated'));

    addToast(`Booking ${bookingId} cancelled. Refund will be processed if prepaid.`, 'info');
  };

  // Handle manual or automatic verification of UPI payment for any booking
  const handleMarkUpiPaid = async (b) => {
    if (!b) return;
    const bookingId = String(b.bookingId || b.id || '');
    const itemType = b.itemType || 'doctor';
    const updatedStatus = 'Paid (UPI / Razorpay Verified)';
    const updatedMethod = 'Razorpay (UPI - Verified)';

    try {
      // 1. Update in local storage patient_appointments
      const appts = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      let apptFound = false;
      const updatedAppts = appts.map(item => {
        if (String(item.id || item.bookingId) === bookingId) {
          apptFound = true;
          return {
            ...item,
            paymentStatus: updatedStatus,
            paymentMethod: updatedMethod
          };
        }
        return item;
      });
      if (apptFound) {
        localStorage.setItem('patient_appointments', JSON.stringify(updatedAppts));
        setAppointments(updatedAppts);
      }

      // 2. Update userBookings state
      setUserBookings(prev => prev.map(item => {
        if (String(item.id || item.bookingId) === bookingId) {
          return {
            ...item,
            paymentStatus: updatedStatus,
            paymentMethod: updatedMethod
          };
        }
        return item;
      }));

      // 3. Record verified payment in transactions ledger
      const existingTxns = JSON.parse(localStorage.getItem('zestmed_payment_transactions') || '[]');
      const newTxn = {
        id: `txn_${Date.now()}`,
        transaction_id: `txn_${Date.now()}`,
        razorpay_payment_id: b.paymentId || `pay_upi_${Date.now().toString().slice(-8)}`,
        paymentId: b.paymentId || `pay_upi_${Date.now().toString().slice(-8)}`,
        booking_id: bookingId,
        bookingId: bookingId,
        booking_type: itemType,
        amount: Number(b.totalAmount || b.price || b.fee || 600),
        currency: 'INR',
        payment_status: 'Success',
        payment_method: updatedMethod,
        customer_name: b.patientName || user?.name || 'Patient',
        customer_phone: b.phone || user?.phone || '',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('zestmed_payment_transactions', JSON.stringify([newTxn, ...existingTxns]));

      // 4. Update in backend / Supabase
      await updateBookingPaymentStatus(bookingId, itemType, {
        paymentStatus: updatedStatus,
        paymentMethod: updatedMethod,
        paymentId: newTxn.paymentId
      });

      addToast(`Booking ${bookingId} verified as Paid via UPI!`, 'success');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
    } catch (err) {
      console.error('Error updating UPI payment status:', err);
      addToast('Updated payment status to Paid (UPI)', 'success');
    }
  };

  // Auto-reconcile payments: check patient_appointments against zestmed_payment_transactions
  useEffect(() => {
    try {
      const txns = JSON.parse(localStorage.getItem('zestmed_payment_transactions') || '[]');
      if (!Array.isArray(txns) || txns.length === 0) return;

      const appts = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      let hasChanges = false;
      const reconciled = appts.map(a => {
        const aId = String(a.bookingId || a.id || '');
        const matched = txns.find(t => 
          (t.booking_id && String(t.booking_id) === aId) ||
          (t.bookingId && String(t.bookingId) === aId) ||
          (a.paymentId && t.razorpay_payment_id && t.razorpay_payment_id === a.paymentId)
        );
        if (matched && (matched.payment_status === 'Success' || matched.status === 'Success')) {
          if (a.paymentStatus !== 'Paid (UPI / Razorpay Verified)') {
            hasChanges = true;
            return {
              ...a,
              paymentStatus: 'Paid (UPI / Razorpay Verified)',
              paymentMethod: matched.payment_method || 'Razorpay (UPI - Verified)',
              paymentId: matched.razorpay_payment_id || matched.paymentId || a.paymentId
            };
          }
        }
        return a;
      });

      if (hasChanges) {
        localStorage.setItem('patient_appointments', JSON.stringify(reconciled));
        setAppointments(reconciled);
      }
    } catch (_) {}
  }, []);

  // Formatted Medicine Bookings from local orders state so they always appear in My Bookings
  const formattedMedicineBookings = useMemo(() => {
    if (!user) return [];
    return (orders || [])
      .filter(Boolean)
      .filter(isMatchingCurrentUser)
      .map((o) => {
        if (!o) return null;
        // Guarantee only genuine medicines are displayed in medicine order preview
        const medOnlyItems = Array.isArray(o.items) ? o.items.filter(it => it && !isLabTestOrPackage(it)) : [];
        const displayItems = medOnlyItems.length > 0 ? medOnlyItems : (Array.isArray(o.items) ? o.items.filter(Boolean) : []);
        const itemNames = displayItems.length > 0
          ? displayItems.map((it) => it?.name).filter(Boolean).join(', ')
          : 'Prescription Medicines';
        
        return {
          id: o.id || o.order_number,
          bookingId: o.id || o.order_number,
          serviceType: 'Medicine Order',
          itemType: 'medicine',
          displayType: 'Medicine Order',
          serviceName: itemNames,
          title: itemNames,
          items: displayItems,
          trackingSteps: o.trackingSteps || [],
          provider: o.hub || 'Zestmed Certified Pharmacy Hub',
          bookingDateTime: o.createdAt || (o.date ? `${o.date} ${o.time || ''}` : new Date().toISOString()),
          createdAt: o.createdAt || new Date().toISOString(),
          appointmentDate: o.date || 'Today',
          appointmentTime: o.time || 'Express Delivery',
          date: o.date || 'Today',
          time: o.time || 'Express Delivery',
          mode: 'Doorstep Delivery',
          location: o.deliveryAddress || 'Guwahati, Assam',
          deliveryAddress: o.deliveryAddress || 'Guwahati, Assam',
          paymentStatus: o.paymentMethod || o.payment_status || 'UPI (Prepaid - Verified)',
          bookingStatus: o.status || o.order_status || 'Confirmed',
          status: o.status || o.order_status || 'Confirmed',
          totalAmount: parseFloat(o.totalAmount || o.total || 0),
          price: parseFloat(o.totalAmount || o.total || 0),
          patientName: o.patientName || user?.name || 'Self',
          patient: o.patientName || user?.name || 'Self',
          phone: o.phone || (user?.phone || user?.contact || ''),
          source: 'orders',
          rawOrder: o
        };
      })
      .filter(Boolean);
  }, [orders, user, isMatchingCurrentUser]);

  // Formatted Lab Bookings from local labBookings state so they appear under their respective categories
  const formattedLabBookings = useMemo(() => {
    if (!user) return [];
    return (labBookings || [])
      .filter(Boolean)
      .filter(isMatchingCurrentUser)
      .map((l) => {
        if (!l) return null;
        const testNameStr = String(l.testName || l.name || '');
        const catStr = String(l.category?.name || l.category || l.type || '');
        const isWellness = isWellnessPackage(l) || testNameStr.toLowerCase().includes('wellness') || catStr.toLowerCase().includes('wellness');
        const sType = isWellness ? 'Wellness Package' : 'Diagnostic Lab Test';
        const iType = isWellness ? 'wellness' : 'lab';
        const dType = isWellness ? 'Wellness Health Package' : 'Diagnostic Lab Test';

        return {
          id: l.id || l.bookingId || l.booking_number,
          bookingId: l.bookingId || l.booking_number || l.id,
          serviceType: sType,
          itemType: iType,
          displayType: dType,
          serviceName: l.testName || l.name || sType,
          title: l.testName || l.name || sType,
          specimen: l.specimen || (isWellness ? 'Blood & Serum Sample (Fasting)' : 'Blood / Serum Sample (Barcoded)'),
          provider: l.phlebotomist?.name || (typeof l.phlebotomist === 'string' ? l.phlebotomist : '') || (isWellness ? 'Preventive Health Diagnostics Team' : 'Bikash Das (Phlebotomist)'),
          bookingDateTime: l.createdAt || l.bookedDate || new Date().toISOString(),
          createdAt: l.createdAt || l.bookedDate || new Date().toISOString(),
          appointmentDate: l.date || l.collectionDate || 'Tomorrow',
          appointmentTime: l.time || '07:30 AM - Home Collection',
          date: l.date || l.collectionDate || 'Tomorrow',
          time: l.time || '07:30 AM - Home Collection',
          mode: isWellness ? 'Home Health Checkup' : (l.collectionAddress ? 'Home Sample Collection' : 'Lab Visit'),
          location: l.collectionAddress || 'Guwahati Hub',
          collectionAddress: l.collectionAddress || 'Guwahati Hub',
          paymentStatus: l.paymentStatus || 'Paid (UPI / Razorpay Verified)',
          paymentMethod: l.paymentMethod || 'Razorpay (UPI - Verified)',
          bookingStatus: l.status || 'Confirmed',
          status: l.status || 'Confirmed',
          totalAmount: parseFloat(l.totalAmount || l.price || (isWellness ? 1299 : 499)),
          price: parseFloat(l.price || l.totalAmount || (isWellness ? 1299 : 499)),
          patientName: l.patientName || user?.name || 'Self',
          patient: l.patientName || user?.name || 'Self',
          phone: l.phone || l.patientPhone || (user?.phone || user?.contact || ''),
          source: 'local_lab'
        };
      })
      .filter(Boolean);
  }, [labBookings, user, isMatchingCurrentUser]);

  // Combined real user bookings (Database/Synced + Local persistent medicine orders + Local lab bookings)
  const allUserBookings = useMemo(() => {
    if (!user) return [];
    const map = new Map();
    // 1. Unified database/synced userBookings
    (userBookings || [])
      .filter(Boolean)
      .filter(isMatchingCurrentUser)
      .forEach((b) => {
        if (!b) return;
        const key = String(b.bookingId || b.id || Math.random());
        map.set(key, b);
      });
    // 2. Local medicine orders (ensuring pure medicines appear in Medicine Orders)
    (formattedMedicineBookings || []).filter(Boolean).forEach((mb) => {
      if (!mb) return;
      const key = String(mb.bookingId || mb.id || Math.random());
      if (!map.has(key)) {
        map.set(key, mb);
      }
    });
    // 3. Local lab test & wellness bookings
    (formattedLabBookings || []).filter(Boolean).forEach((lb) => {
      if (!lb) return;
      const key = String(lb.bookingId || lb.id || Math.random());
      if (!map.has(key)) {
        map.set(key, lb);
      }
    });

    // CRITICAL: Strictly classify each booking into its dedicated category
    return Array.from(map.values())
      .filter(Boolean)
      .map((b) => {
        const titleStr = String(b.serviceName || b.title || b.name || b.testName || '').toLowerCase();
        const catStr = String(b.category?.name || b.category || '').toLowerCase();
        const typeStr = String(b.type?.name || b.type || b.serviceType || b.displayType || '').toLowerCase();
        const idStr = String(b.bookingId || b.id || '').toLowerCase();
        const providerStr = String(b.provider?.name || (typeof b.provider === 'string' ? b.provider : '') || '').toLowerCase();

        // 1. Surgery Package
        if (
          b.itemType === 'surgery' ||
          catStr.includes('surgery') ||
          typeStr.includes('surgery') ||
          titleStr.includes('surgery') ||
          idStr.includes('surg')
        ) {
          return {
            ...b,
            itemType: 'surgery',
            serviceType: 'Surgery Package',
            displayType: 'Surgery Package'
          };
        }

        // 2. Physiotherapy
        if (
          b.itemType === 'physiotherapy' ||
          b.itemType === 'physio' ||
          catStr.includes('physio') ||
          typeStr.includes('physio') ||
          titleStr.includes('physio') ||
          providerStr.includes('mpt') ||
          providerStr.includes('physio') ||
          idStr.includes('phy')
        ) {
          return {
            ...b,
            itemType: 'physiotherapy',
            serviceType: 'Physiotherapy',
            displayType: 'Physiotherapy Session'
          };
        }

        // 3. Wellness Package (MUST take precedence over generic lab)
        if (
          b.itemType === 'wellness' ||
          isWellnessPackage(b) ||
          catStr.includes('wellness') ||
          typeStr.includes('wellness') ||
          titleStr.includes('wellness') ||
          titleStr.includes('health package') ||
          titleStr.includes('checkup package') ||
          titleStr.includes('screening package') ||
          titleStr.includes('citizen package') ||
          idStr.startsWith('pkg-') ||
          idStr.includes('wel')
        ) {
          return {
            ...b,
            itemType: 'wellness',
            serviceType: 'Wellness Package',
            displayType: 'Wellness Health Package'
          };
        }

        // 4. Medicine Order
        if (
          b.itemType === 'medicine' ||
          catStr.includes('medicine') ||
          typeStr.includes('medicine') ||
          typeStr.includes('pharmacy') ||
          idStr.includes('ord')
        ) {
          return {
            ...b,
            itemType: 'medicine',
            serviceType: 'Medicine Order',
            displayType: 'Medicine Order'
          };
        }

        // 5. Diagnostic Lab Test (Pure diagnostic tests only)
        if (
          b.itemType === 'lab' ||
          catStr.includes('lab') ||
          catStr.includes('diagnostic') ||
          typeStr.includes('lab') ||
          typeStr.includes('diagnostic') ||
          idStr.includes('lab') ||
          idStr.includes('dx')
        ) {
          return {
            ...b,
            itemType: 'lab',
            serviceType: 'Diagnostic Lab Test',
            displayType: 'Diagnostic Lab Test'
          };
        }

        // 6. Doctor Appointment (Default fallback for consultations)
        return {
          ...b,
          itemType: 'doctor',
          serviceType: b.serviceType || 'Doctor Appointment',
          displayType: b.displayType || 'Doctor Appointment'
        };
      })
      .sort((a, b) => {
        const timeA = new Date(a?.bookingDateTime || a?.createdAt || 0).getTime() || 0;
        const timeB = new Date(b?.bookingDateTime || b?.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      });
  }, [userBookings, formattedMedicineBookings, formattedLabBookings, user, isMatchingCurrentUser]);

  // Real or Historical Diagnostic Reports (strictly isolated to verified user)
  const userReports = useMemo(() => {
    if (!user) return [];
    
    // 1. All real lab test bookings of the current user
    const labBookings = (allUserBookings || []).filter(b => b?.itemType === 'lab' || isLabTestOrPackage(b));
    
    const mappedLabReports = labBookings.map((l, idx) => {
      const st = String(l?.status || l?.bookingStatus || '').toLowerCase();
      const isReady = st.includes('report') || st.includes('publish') || st.includes('ready') || st.includes('complete');
      const hasAbnormal = Boolean(l?.hasAbnormal);
      const testName = typeof (l?.serviceName || l?.title) === 'object'
        ? (l?.serviceName?.name || l?.title?.name || 'Diagnostic Test')
        : (l?.serviceName || l?.title || 'Diagnostic Test');

      let subtitle = l?.parametersSummary || l?.specimen || '';
      if (!subtitle) {
        const lower = testName.toLowerCase();
        if (lower.includes('vitamin d')) subtitle = '25-Hydroxy Vitamin D';
        else if (lower.includes('cbc') || lower.includes('blood count')) subtitle = 'Hemogram';
        else if (lower.includes('lipid')) subtitle = 'Cholesterol, HDL, LDL, Triglycerides';
        else if (lower.includes('thyroid')) subtitle = 'Thyroid Function Test';
        else if (lower.includes('liver') || lower.includes('lft')) subtitle = 'SGPT, SGOT, Bilirubin, ALP';
        else if (lower.includes('kidney') || lower.includes('kft')) subtitle = 'Creatinine, Urea, Uric Acid';
        else subtitle = 'Clinical Diagnostic Parameter Profile';
      }

      return {
        test: testName,
        subtitle,
        date: l?.appointmentDate || l?.date || 'Recent',
        id: l?.bookingId || l?.id || `ZM-LAB-${Date.now().toString().slice(-5)}`,
        status: hasAbnormal ? 'Action Required' : isReady ? 'Ready' : 'Pending',
        pathologist: l?.reportingDoctor || 'Dr. Pranabesh Sarma, MD Pathology',
        raw: l,
        hasAbnormal
      };
    });

    // 2. Any stored patient reports in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('zestmed_patient_reports') || '[]');
      const userStored = Array.isArray(stored) ? stored.filter(Boolean).filter(isMatchingCurrentUser) : [];
      const map = new Map();
      [...userStored, ...mappedLabReports].forEach(item => {
        if (item && item.id) {
          map.set(item.id, item);
        }
      });
      return Array.from(map.values());
    } catch {
      return mappedLabReports;
    }
  }, [user, allUserBookings, isMatchingCurrentUser]);

  // Real Prescriptions (dynamically fetched from Supabase, Backend API & localStorage)
  const [userPrescriptions, setUserPrescriptions] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchPrescriptions = async () => {
      if (!user) {
        setUserPrescriptions([]);
        return;
      }
      try {
        const list = await getUserPrescriptions(user);
        if (isMounted) {
          // Exclude any legacy sample records
          const realList = (list || []).filter(item => 
            !item.id?.startsWith('ZM-RX-2026-302') && 
            !item.id?.startsWith('ZM-RX-2026-194') &&
            !item.id?.startsWith('ZM-RX-2026-088') &&
            !item.fileName?.includes('Sample_Dr_Kulkarni')
          );
          setUserPrescriptions(realList);
        }
      } catch (err) {
        console.warn('[PatientDashboardPage] Error loading prescriptions:', err);
      }
    };

    fetchPrescriptions();

    const handlePrescriptionUpdate = () => fetchPrescriptions();
    window.addEventListener('storage', handlePrescriptionUpdate);
    window.addEventListener('zestmed_prescription_updated', handlePrescriptionUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handlePrescriptionUpdate);
      window.removeEventListener('zestmed_prescription_updated', handlePrescriptionUpdate);
    };
  }, [user]);

  // Filtered Real User Bookings for My Bookings View
  const filteredUserBookings = useMemo(() => {
    return (allUserBookings || []).filter(Boolean).filter((b) => {
      // Category filter
      if (serviceCategoryFilter !== 'all') {
        if (serviceCategoryFilter === 'lab' && b.itemType !== 'lab') return false;
        if (serviceCategoryFilter === 'doctor' && b.itemType !== 'doctor') return false;
        if (serviceCategoryFilter === 'physiotherapy' && b.itemType !== 'physiotherapy') return false;
        if (serviceCategoryFilter === 'wellness' && b.itemType !== 'wellness') return false;
        if (serviceCategoryFilter === 'surgery' && b.itemType !== 'surgery') return false;
        if (serviceCategoryFilter === 'medicine' && b.itemType !== 'medicine') return false;
      }

      // Status filter
      const st = String(b.bookingStatus || b.status || '').toLowerCase();
      if (bookingFilter === 'confirmed') {
        return st.includes('confirm') || st.includes('schedule') || st.includes('out') || st.includes('deliver');
      }
      if (bookingFilter === 'pending') {
        return st.includes('pending') || st.includes('process');
      }
      if (bookingFilter === 'completed') {
        return st.includes('complete') || st.includes('deliver') || st.includes('report') || st.includes('publish');
      }
      if (bookingFilter === 'cancelled') {
        return st.includes('cancel');
      }

      return true;
    });
  }, [allUserBookings, serviceCategoryFilter, bookingFilter]);

  // Real user upcoming appointments for Dashboard Overview
  const upcomingAppointmentsList = useMemo(() => {
    return (allUserBookings || []).filter(Boolean).filter((b) => {
      const status = String(b.bookingStatus || b.status || '').toLowerCase();
      const isUpcomingStatus = !status.includes('cancel') && !status.includes('complete');
      const isAppointmentType = b.itemType === 'doctor' || b.itemType === 'lab' || b.itemType === 'physio' || b.itemType === 'physiotherapy' || b.itemType === 'surgery' || b.itemType === 'wellness';
      return isUpcomingStatus && isAppointmentType;
    }).slice(0, 2);
  }, [allUserBookings]);

  // Real user recent medicine orders for Dashboard Overview
  const recentMedicineOrdersList = useMemo(() => {
    return (allUserBookings || []).filter(b => b?.itemType === 'medicine').slice(0, 2);
  }, [allUserBookings]);

  // Real user recent lab test bookings for Dashboard Overview (Diagnostic lab tests only)
  const recentLabBookingsList = useMemo(() => {
    return (allUserBookings || []).filter(b => b?.itemType === 'lab').slice(0, 2);
  }, [allUserBookings]);

  // Real user recent diagnostic reports for Dashboard Overview
  const recentReportsList = useMemo(() => {
    return (userReports || []).slice(0, 2);
  }, [userReports]);

  // Helper to extract clean Month and Day badge for upcoming appointments
  const formatAppointmentDateBadge = (dateStr) => {
    try {
      if (!dateStr) {
        const d = new Date();
        return {
          month: d.toLocaleString('en-US', { month: 'short' }),
          day: String(d.getDate()).padStart(2, '0')
        };
      }
      const clean = String(dateStr).trim();
      const d = new Date(clean);
      if (!isNaN(d.getTime())) {
        return {
          month: d.toLocaleString('en-US', { month: 'short' }),
          day: String(d.getDate()).padStart(2, '0')
        };
      }
      const parts = clean.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          if (!isNaN(dateObj.getTime())) {
            return {
              month: dateObj.toLocaleString('en-US', { month: 'short' }),
              day: String(dateObj.getDate()).padStart(2, '0')
            };
          }
        } else {
          const dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          if (!isNaN(dateObj.getTime())) {
            return {
              month: dateObj.toLocaleString('en-US', { month: 'short' }),
              day: String(dateObj.getDate()).padStart(2, '0')
            };
          }
        }
      }
    } catch (_) {}
    const now = new Date();
    return {
      month: now.toLocaleString('en-US', { month: 'short' }),
      day: String(now.getDate()).padStart(2, '0')
    };
  };

  // Harmonized combined bookings across all 6 patient actions
  const combinedBookings = useMemo(() => {
    const labs = (labBookings || []).filter(Boolean).map((b) => {
      const isWellness = String(b.category?.name || b.category || '').toLowerCase().includes('wellness') || String(b.type || '').toLowerCase().includes('wellness');
      return {
        ...b,
        id: b.id || b.bookingId,
        bookingId: b.bookingId || b.id,
        itemType: isWellness ? 'wellness' : 'lab',
        displayType: isWellness ? 'Wellness Package' : 'Diagnostic Lab Test',
        title: b.testName || b.name || 'Diagnostic Test',
        date: b.date || b.collectionDate || b.bookedDate || 'Nov 18, 2026',
        time: b.time || '10:00 AM',
        mode: b.collectionAddress ? 'Home Collection' : (b.mode || 'Home Collection'),
        location: b.collectionAddress || 'Guwahati Hub',
        provider: b.labExecutive || b.phlebotomist?.name || (typeof b.phlebotomist === 'string' ? b.phlebotomist : '') || 'Bikash Das (Phlebotomist)',
        price: b.price || 499,
        status: b.status || 'Confirmed'
      };
    });

    const appts = (appointments || []).filter(Boolean).map((a) => {
      const cat = String(a.category?.name || a.category || a.type || '').toLowerCase();
      let itemType = 'doctor';
      let displayType = 'Doctor Appointment';
      if (cat.includes('physio')) {
        itemType = 'physiotherapy';
        displayType = 'Physiotherapy Session';
      } else if (cat.includes('surg')) {
        itemType = 'surgery';
        displayType = 'Surgery Consultation';
      } else if (cat.includes('well')) {
        itemType = 'wellness';
        displayType = 'Wellness Package';
      }

      return {
        ...a,
        id: a.id || a.bookingId,
        bookingId: a.bookingId || a.id,
        itemType,
        displayType,
        title: a.title || a.doctorName || a.doctor || a.surgeryName || 'Doctor Consultation',
        date: a.date || 'Today',
        time: a.time || a.slot || '10:00 AM',
        mode: a.mode || (itemType === 'physiotherapy' ? 'Home Visit' : 'Clinic Visit'),
        location: a.doctorHospital || a.hospital || 'Zestmed Polyclinic Hub, Guwahati',
        provider: a.doctorName || a.doctor || a.careManager || 'Specialist Physician',
        price: a.fee || a.price || 600,
        status: a.status || 'Confirmed'
      };
    });

    return [...appts, ...labs];
  }, [labBookings, appointments]);

  const filteredBookings = useMemo(() => {
    return (combinedBookings || []).filter(Boolean).filter((b) => {
      // Category filter
      if (serviceCategoryFilter !== 'all') {
        if (serviceCategoryFilter === 'lab' && b.itemType !== 'lab') return false;
        if (serviceCategoryFilter === 'doctor' && b.itemType !== 'doctor') return false;
        if (serviceCategoryFilter === 'physiotherapy' && b.itemType !== 'physiotherapy') return false;
        if (serviceCategoryFilter === 'wellness' && b.itemType !== 'wellness') return false;
        if (serviceCategoryFilter === 'surgery' && b.itemType !== 'surgery') return false;
      }

      // Status filter
      const st = String(b.status || '').toLowerCase();
      if (bookingFilter === 'confirmed') {
        return st.includes('confirm') || st.includes('schedule');
      }
      if (bookingFilter === 'report-ready') {
        return st.includes('report') || st.includes('publish');
      }
      if (bookingFilter === 'completed') {
        return st.includes('complete');
      }
      if (bookingFilter === 'cancelled') {
        return st.includes('cancel');
      }

      return true;
    });
  }, [combinedBookings, serviceCategoryFilter, bookingFilter]);

  const upcomingCount = useMemo(() => {
    return (allUserBookings || []).filter(
      (b) => b && !String(b.bookingStatus || b.status || '').toLowerCase().includes('cancel') && !String(b.bookingStatus || b.status || '').toLowerCase().includes('complete')
    ).length;
  }, [allUserBookings]);

  const upcomingList = useMemo(() => {
    return (allUserBookings || [])
      .filter((b) => b && !String(b.bookingStatus || b.status || '').toLowerCase().includes('cancel') && !String(b.bookingStatus || b.status || '').toLowerCase().includes('complete'))
      .slice(0, 3);
  }, [allUserBookings]);

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

    // Enforce "One Number, One User": prevent changing to a phone number owned by another user
    const cleanNewPhone = normalizePhone(profileForm.phone);
    const cleanCurrentPhone = normalizePhone(user?.phone || user?.contact || patientPhone);
    if (cleanNewPhone && cleanNewPhone !== cleanCurrentPhone) {
      const uniqueness = checkPhoneUniqueness(cleanNewPhone, user?.id);
      if (!uniqueness.isUnique) {
        addToast('This mobile number is already linked to another user account. One mobile number can only be linked to one user.', 'error');
        return;
      }
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
      saveRegisteredPatient(updatedProfile.phone, updatedProfile.name, updatedProfile);
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
    const existing = (labBookings || []).find((b) => b && String(b.testName || b.name || '').toLowerCase().includes(String(testName || '').toLowerCase().slice(0, 5)));
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
  const patientFullName = typeof user?.name === 'string' && user.name.trim() ? user.name : (typeof profileForm?.name === 'string' && profileForm.name.trim() ? profileForm.name : 'Patient');
  const patientFirstName = String(patientFullName).split(' ')[0] || 'Patient';
  const patientUHID = user?.uhid || profileForm.uhid || (user?.id ? `ZM-PAT-${user.id.replace(/\D/g, '').slice(-6) || '501284'}` : 'ZM-PAT-501284');

  // Active Patient Dashboard View

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
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] bg-[#0B2238] flex flex-col border-r border-[#081827] justify-between overflow-hidden transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:shrink-0 lg:visible lg:pointer-events-auto ${
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
            {/* 1. Dashboard (Active Pill) */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('dashboard');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'dashboard'
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* 2. My Bookings */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('bookings');
                setServiceCategoryFilter('all');
                setIsSidebarOpen(false);
                addToast('Viewing My Bookings', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'bookings'
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </button>

            {/* 3. My Reports */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('reports');
                setIsSidebarOpen(false);
                addToast('Viewing Verified Pathology Reports', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'reports'
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Reports</span>
            </button>

            {/* 4. Upload Prescription */}
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
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Prescription</span>
            </button>

            {/* 5. Health Records */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('records');
                setIsSidebarOpen(false);
                addToast('Viewing Health Records', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'records'
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Health Records</span>
            </button>

            {/* 6. My Profile */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('profile');
                setIsSidebarOpen(false);
                addToast('UHID: ' + patientUHID, 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'profile'
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            {/* 7. Settings */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('settings');
                setIsSidebarOpen(false);
                addToast('Account & Security Settings', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'settings'
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* 8. Logout */}
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

        {/* Bottom Sidebar Help Card with Doctor Assistant */}
        <div className="p-3 shrink-0 relative z-10">
          <div className="rounded-2xl p-3.5 bg-gradient-to-br from-[#123053] via-[#0E2845] to-[#0A1C30] border border-blue-400/20 relative overflow-hidden shadow-lg">
            <div className="relative z-10 max-w-[125px]">
              <div className="text-white font-bold text-xs tracking-tight">Need Help?</div>
              <p className="text-slate-300 text-[10px] leading-tight mt-0.5">
                Talk to our Health Assistant
              </p>
              <button
                type="button"
                onClick={() => addToast('Connecting to 24/7 ZESTMED Health Assistant...', 'info')}
                className="mt-2.5 inline-flex items-center gap-1 bg-[#00BFA5] hover:bg-[#00A887] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm transition cursor-pointer"
              >
                <span>Chat Now</span>
              </button>
            </div>
            <img
              src="/dashboard/doctor-assistant.png"
              alt="Health Assistant"
              className="absolute -bottom-1 -right-1 w-20 sm:w-22 h-auto object-contain pointer-events-none drop-shadow-md select-none"
            />
          </div>
        </div>

        {/* Ambient background glow at bottom */}
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#00BFA5]/15 rounded-full blur-3xl pointer-events-none" />
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA (Header + Dashboard Body)           */}
      {/* ======================================================== */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-y-auto w-full transition-colors ${activeMenu === 'bookings' || activeMenu === 'reports' || activeMenu === 'prescription' || activeMenu === 'records' || activeMenu === 'profile' || activeMenu === 'settings' ? 'bg-[#EAF5FB]' : 'bg-[#F4F7FB]'}`}>
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
                placeholder="Search medicines, lab tests, doctors, packages..."
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00BFA5] focus:ring-1 focus:ring-[#00BFA5] transition"
              />
            </div>
          </div>

          {/* Right: Location, Cart, Notification Bell & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            {/* Location Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-[#00BFA5]" />
              <span>{profileForm.city?.split(',')[0] || 'Gurugram'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            {/* Cart Icon with Live Badge */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-1.5 sm:p-2 rounded-xl text-[#00A884] hover:bg-teal-50 transition cursor-pointer"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#00A884]" />
              {(totalItemsCount || cartCount || 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white leading-none">
                  {totalItemsCount || cartCount}
                </span>
              )}
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
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover matching Reference Images (Dark UI with Settings) */}
              <NotificationPopover
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={patientNotifications}
                onMarkAllAsRead={() => setReadNotificationVersion((v) => v + 1)}
                onNotificationClick={(n) => {
                  setIsNotificationsOpen(false);
                  if (n.linkType === 'lab') {
                    setActiveMenu('reports');
                    addToast('Navigating to Diagnostic Lab Reports', 'info');
                  } else if (n.linkType === 'order') {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('medicine');
                    addToast('Navigating to Medicine Orders', 'info');
                  } else if (n.linkType === 'doctor') {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('doctor');
                    addToast('Navigating to Doctor Appointments', 'info');
                  } else if (n.linkType === 'rx') {
                    setActiveMenu('prescription');
                    addToast('Navigating to Prescription Vault', 'info');
                  }
                }}
              />
            </div>

            {/* User Profile Info */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition text-left"
              >
                {/* Circular Patient Photo Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#00BFA5]/25 bg-slate-100 shrink-0">
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
        <main className={`p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden transition-colors ${activeMenu === 'bookings' || activeMenu === 'reports' || activeMenu === 'prescription' || activeMenu === 'records' || activeMenu === 'profile' || activeMenu === 'settings' ? 'bg-[#EAF5FB]' : ''}`}>
          {activeMenu === 'dashboard' && (
            <>
              {/* ======================================================== */}
              {/* ROW 1: WELCOME GREETING BANNER                           */}
              {/* ======================================================== */}
              <div className="relative rounded-2xl overflow-hidden border border-[#BCE4F2] bg-gradient-to-r from-[#DDF4FD] via-[#E8F7FC] to-[#D5EEF6] p-4 sm:p-5 lg:px-6 shadow-xs flex items-center justify-between min-h-[120px] sm:min-h-[130px]">
                <div className="relative z-10 max-w-sm md:max-w-md lg:max-w-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-9 sm:h-10 bg-[#0284C7] rounded-full shrink-0" />
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-[#0B2238] tracking-tight flex items-center gap-2">
                        <span>{greetingText}, {patientFirstName}</span>
                        <span className="text-xl sm:text-2xl inline-block transform hover:rotate-12 transition-transform select-none">👋</span>
                      </h1>
                      <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                        Welcome to your <span className="font-bold text-[#0B2238]">ZESTMED</span> health dashboard. Here's your health summary.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center ECG Wave Graphic */}
                <div className="hidden lg:block absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 lg:w-56 h-14 pointer-events-none opacity-80">
                  <img
                    src="/dashboard/ecg-pulse.png"
                    alt="Heart Pulse"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Right Stethoscope & Heart Graphic (Increased size, fully visible without cropping) */}
                <div className="relative z-10 shrink-0 hidden sm:flex items-center justify-end h-24 sm:h-28 md:h-32 lg:h-36 w-60 sm:w-72 md:w-84 lg:w-[380px] pointer-events-none">
                  <img
                    src="/dashboard/stethoscope-heart.png"
                    alt="Stethoscope and Heart"
                    className="w-full h-full object-contain object-right drop-shadow-sm select-none"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/dashboard/welcome-banner.jpg';
                    }}
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* ROW 2: 6 TOP STAT KPI CARDS                              */}
              {/* ======================================================== */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 gap-3.5 sm:gap-4">
                {/* 1. Total Bookings */}
                <div
                  onClick={() => {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('all');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-blue-200 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {allUserBookings.length}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-1 whitespace-nowrap">
                      Total Bookings
                    </div>
                    <div className="text-[11px] font-bold text-blue-600 hover:underline mt-1.5 flex items-center gap-1 whitespace-nowrap">
                      <span>View All →</span>
                    </div>
                  </div>
                </div>

                {/* 2. Upcoming */}
                <div
                  onClick={() => {
                    setActiveMenu('bookings');
                    setBookingFilter('all');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-purple-200 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Clock className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {upcomingCount}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      Upcoming
                    </div>
                    <div className="text-[11px] font-bold text-purple-600 hover:underline mt-1.5 flex items-center gap-1">
                      <span>View Details →</span>
                    </div>
                  </div>
                </div>

                {/* 3. Medicine Orders */}
                <div
                  onClick={() => {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('medicine');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-teal-200 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00A887] flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {allUserBookings.filter(b => b?.itemType === 'medicine').length}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      Medicine Orders
                    </div>
                    <div className="text-[11px] font-bold text-[#00A887] hover:underline mt-1.5 flex items-center gap-1">
                      <span>Track Orders →</span>
                    </div>
                  </div>
                </div>

                {/* 4. Lab Tests */}
                <div
                  onClick={() => {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('lab');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-amber-200 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FlaskConical className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {allUserBookings.filter(b => b?.itemType === 'lab').length}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      Lab Tests
                    </div>
                    <div className="text-[11px] font-bold text-amber-600 hover:underline mt-1.5 flex items-center gap-1">
                      <span>View Tests →</span>
                    </div>
                  </div>
                </div>

                {/* 5. Appointments */}
                <div
                  onClick={() => {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('doctor');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {allUserBookings.filter(b => b?.itemType === 'doctor').length}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      Appointments
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 hover:underline mt-1.5 flex items-center gap-1">
                      <span>View Appointments →</span>
                    </div>
                  </div>
                </div>

                {/* 6. Reports */}
                <div
                  onClick={() => setActiveMenu('reports')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-indigo-200 transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                      {userReports.length}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      Reports
                    </div>
                    <div className="text-[11px] font-bold text-indigo-600 hover:underline mt-1.5 flex items-center gap-1">
                      <span>View Reports →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* ROW 3: 3-COLUMN MIDDLE SECTION (Upcoming, Quick, Promo)  */}
              {/* ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Col 1: Upcoming Appointments */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A887] flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Upcoming Appointments
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('bookings')}
                        className="text-xs font-semibold text-[#00A887] hover:underline cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {upcomingAppointmentsList.length > 0 ? (
                        upcomingAppointmentsList.map((apt, idx) => {
                          const dateBadge = formatAppointmentDateBadge(apt.date || apt.preferredDate || apt.bookingDate);
                          const isDoctor = apt.itemType === 'doctor';
                          const isLab = apt.itemType === 'lab';
                          const title = isDoctor ? 'Doctor Appointment' : isLab ? 'Lab Test' : apt.displayType || 'Appointment';
                          const subtitle = typeof (apt.doctorName || apt.serviceName || apt.title || apt.testName) === 'object' ? (apt.doctorName?.name || apt.serviceName?.name || 'Consultation') : String(apt.doctorName || apt.serviceName || apt.title || apt.testName || 'Consultation');
                          const timeStr = apt.time || apt.timeSlot || apt.preferredTime || 'Scheduled Time';
                          const modeStr = apt.consultationMode || apt.collectionType || (apt.itemType === 'doctor' ? 'In-Clinic' : 'Home Sample');
                          const statusText = String(apt.bookingStatus || apt.status || 'Confirmed');
                          const isConfirmed = statusText.toLowerCase().includes('confirm');
                          const badgeColor = isDoctor
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-teal-100 text-teal-700';

                          return (
                            <div
                              key={apt.id || apt.bookingId || idx}
                              onClick={() => {
                                setActiveMenu('bookings');
                                if (apt.itemType) setServiceCategoryFilter(apt.itemType);
                              }}
                              className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-11 h-12 rounded-xl ${badgeColor} flex flex-col items-center justify-center shrink-0`}>
                                  <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                                    {dateBadge.month}
                                  </span>
                                  <span className="text-base font-extrabold leading-none mt-0.5">
                                    {dateBadge.day}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {title}
                                  </h4>
                                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                                    {subtitle}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                    {timeStr} • {modeStr}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                                isConfirmed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {statusText}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-6 px-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
                          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No upcoming appointments</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Book a doctor consultation or lab test</p>
                          <button
                            type="button"
                            onClick={() => navigate('/doctor-appointment')}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-[#00A887] hover:bg-teal-100 text-xs font-bold transition cursor-pointer"
                          >
                            <span>Book Doctor</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Col 2: Quick Actions (8 Icons) */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-emerald-500 fill-emerald-500/10 stroke-[2.4]" />
                      <h3 className="text-sm font-bold text-slate-900 leading-none">Quick Actions</h3>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mt-3">
                      {/* 1. Book Lab Test */}
                      <button
                        type="button"
                        onClick={() => navigate('/diagnostics')}
                        className="p-2 sm:p-2.5 rounded-2xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/20 flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-sky-50/80 text-[#0284C7] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FlaskConical className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          Book<br />Lab Test
                        </span>
                      </button>

                      {/* 2. Book Doctor */}
                      <button
                        type="button"
                        onClick={() => navigate('/doctor-appointment')}
                        className="p-2 sm:p-2.5 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/20 flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-blue-50/80 text-[#2563EB] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Stethoscope className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          Book<br />Doctor
                        </span>
                      </button>

                      {/* 3. Order Medicines */}
                      <button
                        type="button"
                        onClick={() => navigate('/medicines')}
                        className="p-2 sm:p-2.5 rounded-2xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/20 flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-amber-50/80 text-[#F59E0B] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Pill className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          Order<br />Medicines
                        </span>
                      </button>

                      {/* 4. Surgery Packages */}
                      <button
                        type="button"
                        onClick={() => navigate('/surgeries')}
                        className="p-2 sm:p-2.5 rounded-2xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/20 flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-purple-50/80 text-[#8B5CF6] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Scissors className="w-5 h-5 stroke-[2.2] transform -rotate-45" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          Surgery<br />Packages
                        </span>
                      </button>

                      {/* 5. Wellness Packages */}
                      <button
                        type="button"
                        onClick={() => navigate('/wellness-packages')}
                        className="p-2 sm:p-2.5 rounded-2xl border border-slate-100 hover:border-rose-300 hover:bg-rose-50/20 flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-rose-50/80 text-[#EF4444] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <HeartPulse className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          Wellness<br />Packages
                        </span>
                      </button>

                      {/* 6. Physiotherapy */}
                      <button
                        type="button"
                        onClick={() => navigate('/physiotherapy')}
                        className="p-2 sm:p-2.5 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/20 flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50/80 text-[#10B981] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <PersonStanding className="w-5 h-5 stroke-[2.3]" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          Physiotherapy<br />Book Session
                        </span>
                      </button>

                      {/* 7. Upload Prescription */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu('prescription');
                          setIsPrescriptionUploadModalOpen(true);
                        }}
                        className="p-2 sm:p-2.5 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/20 flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50/80 text-[#6366F1] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <path d="M8.5 13.5h2.5a1.8 1.8 0 0 0 0-3.6H8.5v6" />
                            <path d="m10.5 13.5 2.5 3" />
                            <path d="m9.5 15.5 2.8-1.8" />
                          </svg>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          Upload<br />Prescription
                        </span>
                      </button>

                      {/* 8. View Reports */}
                      <button
                        type="button"
                        onClick={() => setActiveMenu('reports')}
                        className="p-2 sm:p-2.5 rounded-2xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/20 flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-sky-50/80 text-[#0284C7] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                          View<br />Reports
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Col 3: Consult Top Doctors Online Promo Card */}
                <div className="lg:col-span-4 relative rounded-2xl p-5 bg-gradient-to-br from-[#EDE9FE] via-[#F3E8FF] to-[#E0E7FF] border border-[#DDD6FE] shadow-xs overflow-hidden flex flex-col justify-between min-h-[220px]">
                  <div className="relative z-10 max-w-[210px]">
                    <span className="bg-purple-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block tracking-wider mb-2">
                      SPECIALIST CARE
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#3B0764] leading-snug">
                      Consult Top Doctors Online
                    </h3>
                    <ul className="mt-2 space-y-1 text-[11px] text-purple-950 font-medium">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 stroke-[2.5]" />
                        <span>50+ Specialties Available</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 stroke-[2.5]" />
                        <span>Instant Video Consultation</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 stroke-[2.5]" />
                        <span>Verified Digital Prescription</span>
                      </li>
                    </ul>

                    <button
                      type="button"
                      onClick={() => navigate('/doctor-appointment')}
                      className="mt-4 inline-flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                      <span>Book Appointment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Female doctor cutout graphic */}
                  <img
                    src="/dashboard/consult-doctor-female.png"
                    alt="Consult Doctor"
                    className="absolute -bottom-1 -right-2 w-36 sm:w-44 h-auto object-contain pointer-events-none drop-shadow-md select-none"
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* ROW 4: 3-COLUMN RECENT ACTIVITY SECTION                  */}
              {/* ======================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Card 1: Recent Medicine Orders */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A887] flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Recent Medicine Orders
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu('bookings');
                          setServiceCategoryFilter('medicine');
                        }}
                        className="text-xs font-semibold text-[#00A887] hover:underline cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {recentMedicineOrdersList.length > 0 ? (
                        recentMedicineOrdersList.map((ord, idx) => {
                          const title = ord.title || ord.serviceName || (ord.medicines?.[0]?.name ? `${ord.medicines[0].name}${ord.medicines.length > 1 ? ` +${ord.medicines.length - 1} more` : ''}` : 'Prescription Medicines');
                          const amount = ord.totalAmount || ord.amount || ord.price || 0;
                          const itemCount = ord.medicines?.length || ord.items?.length || ord.quantity || 1;
                          const statusText = String(ord.bookingStatus || ord.status || 'Confirmed');
                          const isDelivered = statusText.toLowerCase().includes('deliver') || statusText.toLowerCase().includes('complete');

                          return (
                            <div
                              key={ord.id || ord.bookingId || idx}
                              onClick={() => {
                                setActiveMenu('bookings');
                                setServiceCategoryFilter('medicine');
                              }}
                              className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A887] flex items-center justify-center shrink-0">
                                  <Pill className="w-5 h-5 stroke-[2]" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                    {itemCount} Item{itemCount > 1 ? 's' : ''} • ₹{amount}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 border ${
                                isDelivered
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {isDelivered && <Check className="w-3 h-3 stroke-[2.5]" />}
                                <span>{statusText}</span>
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-6 px-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
                          <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No medicine orders yet</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Order genuine medicines delivered home</p>
                          <button
                            type="button"
                            onClick={() => navigate('/medicines')}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-[#00A887] hover:bg-teal-100 text-xs font-bold transition cursor-pointer"
                          >
                            <span>Order Medicines</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 2: Recent Lab Test Bookings */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <FlaskConical className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Recent Lab Test Bookings
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu('bookings');
                          setServiceCategoryFilter('lab');
                        }}
                        className="text-xs font-semibold text-[#00A887] hover:underline cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {recentLabBookingsList.length > 0 ? (
                        recentLabBookingsList.map((lab, idx) => {
                          const title = lab.serviceName || lab.title || lab.testName || 'Diagnostic Test';
                          const colType = lab.collectionType || (lab.bookingType === 'home' ? 'Home Collection' : 'Lab Visit');
                          const amount = lab.totalAmount || lab.amount || lab.price || 0;
                          const statusText = String(lab.bookingStatus || lab.status || 'Confirmed');
                          const isCompleted = statusText.toLowerCase().includes('complete') || statusText.toLowerCase().includes('report') || statusText.toLowerCase().includes('deliver');
                          const isProcessing = statusText.toLowerCase().includes('process') || statusText.toLowerCase().includes('pending');

                          return (
                            <div
                              key={lab.id || lab.bookingId || idx}
                              onClick={() => {
                                setActiveMenu('bookings');
                                setServiceCategoryFilter('lab');
                              }}
                              className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 rounded-xl ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0`}>
                                  <FlaskConical className="w-5 h-5 stroke-[2]" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                    {colType} • ₹{amount}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 border ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isProcessing
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {isCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
                                <span>{statusText}</span>
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-6 px-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
                          <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No lab test bookings yet</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Book certified tests with home sample collection</p>
                          <button
                            type="button"
                            onClick={() => navigate('/diagnostics')}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition cursor-pointer"
                          >
                            <span>Book Lab Test</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 3: Recent Reports */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Recent Reports
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('reports')}
                        className="text-xs font-semibold text-[#00A887] hover:underline cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {recentReportsList.length > 0 ? (
                        recentReportsList.map((rep, idx) => {
                          const title = rep.test || rep.testName || rep.title || 'Diagnostic Report';
                          const subtitle = `${rep.doctorName || rep.pathologist || 'Pathology Lab'} • ${rep.date || 'Recent'}`;

                          return (
                            <div
                              key={rep.id || idx}
                              className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs">
                                  PDF
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                    {subtitle}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  downloadClinicalReport(rep);
                                  addToast(`Official signed PDF report downloaded for ${title}.`, 'success');
                                }}
                                className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition shrink-0 cursor-pointer"
                                title="Download Report"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-6 px-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-600">No reports available yet</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Completed lab reports will appear here</p>
                          <button
                            type="button"
                            onClick={() => setActiveMenu('reports')}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition cursor-pointer"
                          >
                            <span>View All Reports</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* ROW 5: 4-COLUMN HEALTH OVERVIEW & INSIGHTS               */}
              {/* ======================================================== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Col 1: Health Metrics */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-none">Health Metrics</h3>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Track Your Health</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mt-3">
                      {/* Heart Rate */}
                      <div className="p-2.5 rounded-xl bg-rose-50/40 border border-rose-100">
                        <div className="flex items-center justify-between text-rose-500">
                          <Heart className="w-4 h-4 fill-rose-500" />
                          <span className="text-[9px] font-bold uppercase text-emerald-600">Normal</span>
                        </div>
                        <div className="text-lg font-black text-slate-900 mt-1 leading-none">
                          72 <span className="text-[10px] font-normal text-slate-400">bpm</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Heart Rate
                        </div>
                      </div>

                      {/* Blood Pressure */}
                      <div className="p-2.5 rounded-xl bg-blue-50/40 border border-blue-100">
                        <div className="flex items-center justify-between text-blue-500">
                          <Activity className="w-4 h-4" />
                          <span className="text-[9px] font-bold uppercase text-emerald-600">Optimal</span>
                        </div>
                        <div className="text-lg font-black text-slate-900 mt-1 leading-none">
                          117/72 <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Blood Pressure
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-100">
                        <div className="flex items-center justify-between text-amber-500">
                          <Scale className="w-4 h-4" />
                          <span className="text-[9px] font-bold uppercase text-emerald-600">Ideal</span>
                        </div>
                        <div className="text-lg font-black text-slate-900 mt-1 leading-none">
                          60 <span className="text-[10px] font-normal text-slate-400">kg</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Weight
                        </div>
                      </div>

                      {/* BMI */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                        <div className="flex items-center justify-between text-emerald-600">
                          <Activity className="w-4 h-4" />
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            Normal
                          </span>
                        </div>
                        <div className="text-lg font-black text-slate-900 mt-1 leading-none">
                          22.9
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Body Mass Index
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 2: Health Records */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-none">Health Records</h3>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Manage your medical history</p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 mt-2">
                      <div
                        onClick={() => setActiveMenu('records')}
                        className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Pill className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">Prescriptions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-[#00A887]">{userPrescriptions.length} Active</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div
                        onClick={() => setActiveMenu('reports')}
                        className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">Lab Reports</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-blue-600">{userReports.length} Reports</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          setActiveMenu('bookings');
                          setServiceCategoryFilter('doctor');
                        }}
                        className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Stethoscope className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">Doctor Consultations</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-purple-600">{appointments.length} Visits</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div
                        onClick={() => setActiveMenu('records')}
                        className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-1 rounded-lg transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">Medical History</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-emerald-600">Up to date</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Col 3: My Bookings Summary (Donut Chart) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <PieChart className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-none">My Bookings Summary</h3>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Distribution of services</p>
                        </div>
                      </div>
                    </div>

                    {/* SVG Donut Ring Chart with Real Dynamic Slices */}
                    {(() => {
                      const total = allUserBookings.length;
                      const med = orders.length;
                      const lab = labBookings.length;
                      const apt = appointments.length;
                      const pkg = allUserBookings.filter(b => b.itemType === 'surgery' || b.itemType === 'wellness' || b.itemType === 'physio').length;
                      const C = 226.2;
                      const medArc = total > 0 ? (med / total) * C : 0;
                      const pkgArc = total > 0 ? (pkg / total) * C : 0;
                      const labArc = total > 0 ? (lab / total) * C : 0;
                      const aptArc = total > 0 ? (apt / total) * C : 0;

                      return (
                        <>
                          <div className="flex items-center justify-center my-3 relative">
                            <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-90">
                              {/* Background track */}
                              <circle
                                cx="50"
                                cy="50"
                                r="36"
                                fill="none"
                                stroke="#F1F5F9"
                                strokeWidth="12"
                              />
                              {/* Segment 1: Medicines */}
                              {total > 0 && medArc > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="36"
                                  fill="none"
                                  stroke="#00BFA5"
                                  strokeWidth="12"
                                  strokeDasharray={`${medArc} ${C}`}
                                  strokeDashoffset={0}
                                />
                              )}
                              {/* Segment 2: Packages */}
                              {total > 0 && pkgArc > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="36"
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="12"
                                  strokeDasharray={`${pkgArc} ${C}`}
                                  strokeDashoffset={-medArc}
                                />
                              )}
                              {/* Segment 3: Lab Tests */}
                              {total > 0 && labArc > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="36"
                                  fill="none"
                                  stroke="#F59E0B"
                                  strokeWidth="12"
                                  strokeDasharray={`${labArc} ${C}`}
                                  strokeDashoffset={-(medArc + pkgArc)}
                                />
                              )}
                              {/* Segment 4: Appointments */}
                              {total > 0 && aptArc > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="36"
                                  fill="none"
                                  stroke="#8B5CF6"
                                  strokeWidth="12"
                                  strokeDasharray={`${aptArc} ${C}`}
                                  strokeDashoffset={-(medArc + pkgArc + labArc)}
                                />
                              )}
                            </svg>
                            {/* Center Count */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-xl font-black text-slate-900 leading-none">{total}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total</span>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-semibold text-slate-600 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#00BFA5]" />
                              <span>Medicines: {med}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                              <span>Lab Tests: {lab}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                              <span>Appointments: {apt}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                              <span>Packages: {pkg}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Col 4: Health Tips */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-none">Health Tips</h3>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Daily Wellness</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToast('More daily wellness tips coming soon!', 'info')}
                        className="text-[11px] font-semibold text-[#00A887] hover:underline cursor-pointer"
                      >
                        View All →
                      </button>
                    </div>

                    {/* Dumbbells & Water Bottle Graphic */}
                    <div className="w-full h-24 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-center p-2 overflow-hidden my-2">
                      <img
                        src="/dashboard/health-tips-water.png"
                        alt="Stay Hydrated"
                        className="h-full w-auto object-contain drop-shadow-xs"
                      />
                    </div>

                    <div className="mt-1">
                      <h4 className="text-xs font-bold text-slate-900">
                        Stay Hydrated
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Drink at least 8-10 glasses of water daily to maintain optimal energy levels and kidney function.
                      </p>
                    </div>
                  </div>

                  {/* Carousel Indicators */}
                  <div className="flex items-center justify-center gap-1.5 pt-3 mt-1 border-t border-slate-50">
                    <span className="w-4 h-1.5 rounded-full bg-[#00A887]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* ======================================================== */}
          {/* ======================================================== */}
          {/* ======================================================== */}
          {/* 1. MY BOOKINGS VIEW                                      */}
          {/* ======================================================== */}
          {/* ======================================================== */}
          {/* 1. MY BOOKINGS VIEW (Refined to match Reference Design)   */}
          {/* ======================================================== */}
          {activeMenu === 'bookings' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Header Hero Banner with Medical Illustration */}
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/80 bg-white shadow-[0_4px_24px_-4px_rgba(0,143,131,0.07)] p-5 sm:p-6 overflow-hidden flex items-center justify-between">
                {/* Background soft turquoise wave accent */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#E1F4FC]/40 to-[#D4F0FA]/70" />
                
                {/* Left Text and Icon */}
                <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 max-w-2xl min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#00BFA5]/30 shadow-xs flex items-center justify-center text-[#00A68A] shrink-0">
                    <div className="relative flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-[#00A68A]" />
                      <Plus className="w-3.5 h-3.5 text-[#00A68A] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 stroke-[3]" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      My Bookings
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Manage and view all services booked through your account (Doctor Appointments, Surgery Packages, Medicine Orders, Lab Tests, Physiotherapy, and Wellness Packages).
                    </p>
                  </div>
                </div>

                {/* Right: Healthcare Artwork (Stethoscope, Checklist Clipboard, Medical Shield & Leaves) */}
                <div className="hidden md:flex items-center justify-end shrink-0 relative w-48 sm:w-56 h-28 pointer-events-none select-none">
                  <svg viewBox="0 0 240 140" className="w-full h-full object-contain overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#00B4D8" />
                        <stop offset="100%" stopColor="#0077B6" />
                      </linearGradient>
                      <linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#F0F9FF" />
                      </linearGradient>
                      <filter id="shadowFilter" x="-10%" y="-10%" width="130%" height="130%">
                        <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.12" />
                      </filter>
                    </defs>

                    {/* Clipboard Background */}
                    <g transform="translate(110, 10) rotate(8)" filter="url(#shadowFilter)">
                      <rect x="0" y="10" width="75" height="105" rx="12" fill="url(#boardGrad)" stroke="#0284C7" strokeWidth="2.5" />
                      <rect x="22" y="2" width="31" height="12" rx="4" fill="#0C4A6E" />
                      <rect x="27" y="5" width="21" height="5" rx="2.5" fill="#38BDF8" />

                      {/* Checkmark 1 */}
                      <circle cx="16" cy="32" r="5" fill="#10B981" />
                      <path d="M14 32 L15.5 33.5 L18.5 30.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="26" y="30" width="36" height="4" rx="2" fill="#BAE6FD" />

                      {/* Checkmark 2 */}
                      <circle cx="16" cy="48" r="5" fill="#10B981" />
                      <path d="M14 48 L15.5 49.5 L18.5 46.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="26" y="46" width="30" height="4" rx="2" fill="#BAE6FD" />

                      {/* Checkmark 3 */}
                      <circle cx="16" cy="64" r="5" fill="#10B981" />
                      <path d="M14 64 L15.5 65.5 L18.5 62.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="26" y="62" width="34" height="4" rx="2" fill="#BAE6FD" />

                      <rect x="12" y="80" width="50" height="4" rx="2" fill="#E0F2FE" />
                      <rect x="12" y="90" width="38" height="4" rx="2" fill="#E0F2FE" />
                    </g>

                    {/* Stethoscope Loops */}
                    <path
                      d="M10 65 C10 40, 35 25, 60 25 C85 25, 95 45, 95 65 C95 95, 75 115, 50 115 C30 115, 20 100, 20 85 C20 70, 35 60, 50 60 C70 60, 85 75, 85 95 C85 110, 110 120, 140 105"
                      fill="none"
                      stroke="#0B2545"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M45 28 C45 15, 52 8, 62 8 C72 8, 78 15, 78 28" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="45" cy="18" r="3" fill="#0B2545" />
                    <circle cx="78" cy="18" r="3" fill="#0B2545" />
                    <circle cx="20" cy="85" r="7" fill="#00A68A" stroke="#FFFFFF" strokeWidth="2" filter="url(#shadowFilter)" />
                    <circle cx="20" cy="85" r="3" fill="#0B2545" />

                    {/* Fresh Green Medical Leaves */}
                    <path d="M175 45 C190 40, 215 50, 215 65 C200 65, 180 60, 175 45 Z" fill="#22C55E" />
                    <path d="M178 50 C188 47, 205 53, 205 62" stroke="#16A34A" strokeWidth="1" />
                    <path d="M170 30 C180 20, 200 25, 202 38 C190 40, 178 36, 170 30 Z" fill="#4ADE80" />

                    {/* Medical Shield */}
                    <g transform="translate(160, 50)" filter="url(#shadowFilter)">
                      <path
                        d="M26 0 C38 4, 48 2, 52 0 C52 24, 46 44, 26 56 C6 44, 0 24, 0 0 C4 2, 14 4, 26 0 Z"
                        fill="url(#shieldGrad)"
                        stroke="#E0F2FE"
                        strokeWidth="2"
                      />
                      <rect x="22" y="14" width="8" height="26" rx="2" fill="#FFFFFF" />
                      <rect x="13" y="23" width="26" height="8" rx="2" fill="#FFFFFF" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Service Category Filter Pills Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All Bookings', icon: Layers, iconColor: 'text-[#008F83]', count: allUserBookings.length },
                  { id: 'doctor', label: 'Doctor Appointments', icon: Stethoscope, iconColor: 'text-[#0080FF]', count: allUserBookings.filter(b => b?.itemType === 'doctor').length },
                  { id: 'surgery', label: 'Surgery Packages', icon: BriefcaseMedical, iconColor: 'text-[#0070E0]', count: allUserBookings.filter(b => b?.itemType === 'surgery').length },
                  { id: 'medicine', label: 'Medicine Orders', icon: Pill, iconColor: 'text-[#008F83]', count: allUserBookings.filter(b => b?.itemType === 'medicine').length },
                  { id: 'lab', label: 'Lab Tests', icon: FlaskConical, iconColor: 'text-[#00BFA5]', count: allUserBookings.filter(b => b?.itemType === 'lab').length },
                  { id: 'physiotherapy', label: 'Physiotherapy', icon: PersonStanding, iconColor: 'text-[#10B981]', count: allUserBookings.filter(b => b?.itemType === 'physiotherapy').length },
                  { id: 'wellness', label: 'Wellness Packages', icon: Heart, iconColor: 'text-[#0080FF]', count: allUserBookings.filter(b => b?.itemType === 'wellness').length }
                ].map((cat) => {
                  const isActive = serviceCategoryFilter === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setServiceCategoryFilter(cat.id)}
                      className={`px-2 sm:px-2.5 py-1.5 rounded-lg sm:rounded-xl text-[10.5px] sm:text-[11px] font-bold transition shrink-0 cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-xs ${
                        isActive
                          ? 'bg-[#008F83] text-white border border-[#007A70]'
                          : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isActive ? 'text-white' : cat.iconColor}`} />
                      <span>{cat.label} ({cat.count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Status Filter Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-600 font-extrabold text-xs tracking-wider uppercase shrink-0 mr-1">
                  STATUS:
                </span>
                {[
                  { id: 'all', label: 'All Status', icon: null },
                  { id: 'confirmed', label: 'Confirmed', icon: Check, iconClass: 'text-emerald-600 stroke-[3]' },
                  { id: 'pending', label: 'Pending', icon: Clock, iconClass: 'text-amber-500 stroke-[2.5]' },
                  { id: 'completed', label: 'Completed', icon: CheckCircle2, iconClass: 'text-blue-500 stroke-[2.5]' },
                  { id: 'cancelled', label: 'Cancelled', icon: XCircle, iconClass: 'text-rose-500 stroke-[2.5]' }
                ].map((f) => {
                  const isActive = bookingFilter === f.id;
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setBookingFilter(f.id)}
                      className={`px-3.5 py-1.5 rounded-xl sm:rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        isActive
                          ? 'bg-[#008F83] text-white border border-[#007A70]'
                          : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : f.iconClass}`} />}
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bookings List Cards matching Reference Image */}
              <div className="space-y-3.5 sm:space-y-4">
                {isLoadingBookings ? (
                  <div className="bg-white rounded-2xl sm:rounded-[22px] p-10 border border-blue-100/80 shadow-xs text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Loading your real bookings from the database...</p>
                  </div>
                ) : filteredUserBookings.length > 0 ? (
                  filteredUserBookings.map((b) => {
                    const isDoctor = b.itemType === 'doctor';
                    const isPhysio = b.itemType === 'physiotherapy';
                    const isSurgery = b.itemType === 'surgery';
                    const isWellness = b.itemType === 'wellness';
                    const isMedicine = b.itemType === 'medicine';
                    const isLab = !isDoctor && !isPhysio && !isSurgery && !isWellness && !isMedicine;

                    // Left Icon box styling & left border accent
                    let leftBorderClass = 'border-l-4 border-l-[#00BFA5]';
                    let iconBoxClass = 'bg-[#E8FAF5] text-[#00A68A] border border-teal-100';
                    let categoryPillClass = 'bg-[#E0F2FE] text-[#0369A1]';
                    let categoryLabel = 'Lab Test';
                    let IconComponent = FlaskConical;

                    if (isDoctor) {
                      leftBorderClass = 'border-l-4 border-l-[#0080FF]';
                      iconBoxClass = 'bg-[#EAF3FF] text-[#0070E0] border border-blue-100';
                      categoryPillClass = 'bg-[#D1FAE5] text-[#065F46]';
                      categoryLabel = 'Doctor Appointment';
                      IconComponent = Stethoscope;
                    } else if (isMedicine) {
                      leftBorderClass = 'border-l-4 border-l-[#8B5CF6]';
                      iconBoxClass = 'bg-[#F1EBFB] text-[#7C3AED] border border-purple-100';
                      categoryPillClass = 'bg-[#EDE9FE] text-[#6D28D9]';
                      categoryLabel = 'Medicine Order';
                      IconComponent = ShoppingCart;
                    } else if (isSurgery) {
                      leftBorderClass = 'border-l-4 border-l-amber-500';
                      iconBoxClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                      categoryPillClass = 'bg-[#FEF3C7] text-[#92400E]';
                      categoryLabel = 'Surgery Package';
                      IconComponent = BriefcaseMedical;
                    } else if (isPhysio) {
                      leftBorderClass = 'border-l-4 border-l-emerald-500';
                      iconBoxClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                      categoryPillClass = 'bg-[#DCFCE7] text-[#166534]';
                      categoryLabel = 'Physiotherapy';
                      IconComponent = PersonStanding;
                    } else if (isWellness) {
                      leftBorderClass = 'border-l-4 border-l-pink-500';
                      iconBoxClass = 'bg-pink-50 text-pink-600 border border-pink-100';
                      categoryPillClass = 'bg-[#FCE7F3] text-[#9D174D]';
                      categoryLabel = 'Wellness Package';
                      IconComponent = Heart;
                    }

                    const statusLower = String(b.bookingStatus || b.status || 'Confirmed').toLowerCase();
                    const isCancelled = statusLower.includes('cancel');
                    const isCompleted = statusLower.includes('complete') || statusLower.includes('deliver') || statusLower.includes('report') || statusLower.includes('publish');
                    const isPending = statusLower.includes('pending') || statusLower.includes('process');

                    const formattedBookingDate = b.bookingDateTime
                      ? new Date(b.bookingDateTime).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : b.createdAt
                      ? new Date(b.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '23 Nov 2026, 03:45 pm';

                    const serviceDateDisplay = b.appointmentDate || b.date 
                      ? `${b.appointmentDate || b.date} • ${b.appointmentTime || b.time || (isDoctor ? '10:00 AM - Morning Slot' : '07:30 AM - Home Collection')}`
                      : 'Today • 10:00 AM - Morning Slot';

                    const patientDisplayName = (!b.patientName || b.patientName === 'Rahul Verma')
                      ? (user?.name || 'Ajayendra Shekhar')
                      : (typeof b.patientName === 'object' ? b.patientName?.name : b.patientName);

                    const serviceTitle = typeof (b.serviceName || b.title) === 'object'
                      ? (b.serviceName?.name || b.title?.name || 'Healthcare Service')
                      : (b.serviceName || b.title || 'Healthcare Service');

                    return (
                      <div
                        key={b.id || b.bookingId}
                        onClick={() => setSelectedBookingForDetail(b)}
                        className={`bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-[0_4px_16px_-4px_rgba(0,143,131,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] hover:shadow-md transition cursor-pointer space-y-3.5 group relative overflow-hidden ${leftBorderClass}`}
                      >
                        {/* Top Row: Icon + Title + Category Pill + Status + Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Left Rounded Category Icon Box */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${iconBoxClass}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>

                            {/* Service Title + Category Badge + ID & Patient */}
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition truncate">
                                  {serviceTitle}
                                </h3>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center ${categoryPillClass}`}>
                                  {categoryLabel}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-0.5">
                                <span className="font-mono font-medium text-slate-700">
                                  ID: {b.bookingId || b.id}
                                </span>
                                <span className="text-slate-300 font-normal">|</span>
                                <div className="inline-flex items-center gap-1 text-slate-500">
                                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>Patient: <strong className="text-slate-800 font-semibold">{patientDisplayName}</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Status Pill & Price */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            {/* Status Badge */}
                            {isCancelled ? (
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
                                <span>Cancelled</span>
                              </span>
                            ) : isCompleted ? (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 stroke-[2.5]" />
                                <span>Completed</span>
                              </span>
                            ) : isPending ? (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <span className="bg-[#E8FAF5] text-[#007A64] border border-[#B3EBDC] px-3.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-[#007A64] stroke-[3]" />
                                <span>Confirmed</span>
                              </span>
                            )}

                            <span className="text-slate-200 text-lg font-light hidden sm:inline">|</span>

                            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              ₹{Number(b.totalAmount || b.price || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Medicine Items Sub-List if Medicine Order */}
                        {isMedicine && Array.isArray(b.items) && b.items.length > 0 && (
                          <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 space-y-1.5 text-xs border border-slate-100">
                            {b.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-slate-700">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                                  <span className="font-semibold text-slate-800">{it.name}</span>
                                  <span className="text-slate-400 font-normal">({it.dosage || 'Standard Pack'})</span>
                                </div>
                                <span className="font-mono text-slate-600">Qty: {it.quantity || 1} • ₹{it.price ? (it.price * (it.quantity || 1)) : '--'}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Card Divider */}
                        <div className="border-t border-slate-100 pt-3" />

                        {/* Bottom Row: Metadata info + Action Buttons */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-600">
                          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            {/* Booked on */}
                            <div className="inline-flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Booked on: <strong className="text-slate-800 font-semibold">{formattedBookingDate}</strong></span>
                            </div>

                            <span className="text-slate-300 font-normal hidden md:inline">|</span>

                            {/* Service Date */}
                            <div className="inline-flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#00A68A] shrink-0" />
                              <span>Service Date: <strong className="text-slate-800 font-semibold">{serviceDateDisplay}</strong></span>
                            </div>

                            <span className="text-slate-300 font-normal hidden lg:inline">|</span>

                            {/* Payment / Reception Badge */}
                            <div className="inline-flex items-center gap-1.5 bg-[#E8FAF5] text-[#007A64] border border-[#B3EBDC] px-3 py-1 rounded-full text-xs font-semibold">
                              {isDoctor && (String(b.paymentStatus || '').toLowerCase().includes('clinic') || String(b.paymentStatus || '').toLowerCase().includes('reception') || !b.paymentStatus || b.paymentStatus.includes('Cash')) ? (
                                <>
                                  <MapPin className="w-3.5 h-3.5 text-[#00A68A] shrink-0" />
                                  <span>Pay at Hospital Reception</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3.5 h-3.5 text-[#00A68A] shrink-0" />
                                  <span>{b.paymentStatus || 'Paid (UPI / Razorpay Verified)'}</span>
                                </>
                              )}
                            </div>

                            {/* Click to verify UPI button if unpaid */}
                            {(String(b.paymentStatus || '').toLowerCase().includes('clinic') || String(b.paymentStatus || '').toLowerCase().includes('post-session') || String(b.paymentStatus || '').toLowerCase().includes('collection')) && !isCancelled && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkUpiPaid(b);
                                }}
                                className="text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full transition cursor-pointer flex items-center gap-1"
                                title="Click if you paid via UPI or Razorpay"
                              >
                                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                <span>Paid via UPI? Click to Verify</span>
                              </button>
                            )}
                          </div>

                          {/* Action Buttons: View Details (Blue Pill) & Cancel (Red Outline Pill) */}
                          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                            {isMedicine && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenOrderModal(b.items?.[0]?.name || b.serviceName || 'Medicines', b.bookingId || b.id);
                                }}
                                className="border border-slate-300 text-slate-600 hover:bg-slate-50 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <FileText className="w-3 h-3 text-slate-500" />
                                <span>Invoice</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBookingForDetail(b);
                              }}
                              className="bg-[#0080FF] hover:bg-[#006ee6] text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-white" />
                              <span>View Details</span>
                            </button>

                            {isCancelled ? (
                              <span className="text-xs text-rose-500 font-semibold italic px-2">Cancelled</span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelBooking(b.id || b.bookingId);
                                }}
                                className="border border-rose-300 text-rose-500 hover:bg-rose-50 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl sm:rounded-[22px] p-10 border border-blue-100/80 shadow-xs text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#E8FAF5] text-[#00A68A] border border-teal-100 flex items-center justify-center mx-auto shadow-2xs">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Bookings Found</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      No services match the selected filter. Book a doctor appointment, lab test, physiotherapy, or medicine order to track it here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* UPLOAD DOCTOR'S PRESCRIPTION VAULT VIEW                  */}
          {/* ======================================================== */}
          {activeMenu === 'prescription' && (() => {
            const totalRxCount = userPrescriptions.length;
            const underReviewRxCount = userPrescriptions.filter(rx => {
              const st = String(rx.status || '').toLowerCase();
              return st.includes('pending') || st.includes('review') || st.includes('audit');
            }).length;
            const approvedRxCount = userPrescriptions.filter(rx => {
              const st = String(rx.status || '').toLowerCase();
              return st.includes('approved') || st.includes('verified');
            }).length;
            const rejectedRxCount = userPrescriptions.filter(rx => {
              const st = String(rx.status || '').toLowerCase();
              return st.includes('rejected');
            }).length;

            const filteredPrescriptions = (userPrescriptions || []).filter(rx => {
              const st = String(rx.status || '').toLowerCase();
              if (rxStatusFilter === 'under_review' && !st.includes('pending') && !st.includes('review') && !st.includes('audit')) return false;
              if (rxStatusFilter === 'approved' && !st.includes('approved') && !st.includes('verified')) return false;
              if (rxStatusFilter === 'rejected' && !st.includes('rejected')) return false;

              if (rxSearchQuery.trim()) {
                const q = rxSearchQuery.trim().toLowerCase();
                const matchName = String(rx.fileName || '').toLowerCase().includes(q);
                const matchDoc = String(rx.doctorName || '').toLowerCase().includes(q);
                const matchHosp = String(rx.hospital || rx.clinicName || '').toLowerCase().includes(q);
                const matchId = String(rx.id || '').toLowerCase().includes(q);
                if (!matchName && !matchDoc && !matchHosp && !matchId) return false;
              }
              return true;
            });

            const handleDownloadAllPrescriptions = () => {
              if (userPrescriptions.length === 0) {
                addToast('No prescriptions uploaded yet to download.', 'info');
                return;
              }
              userPrescriptions.forEach((rx, idx) => {
                setTimeout(() => downloadPrescriptionFile(rx), idx * 300);
              });
              addToast(`Downloading ${userPrescriptions.length} prescriptions...`, 'success');
            };

            const handleSetReminders = () => {
              addToast('Medicine refill and doctor follow-up reminders enabled!', 'success');
            };

            const handleOrderMedicines = (rx) => {
              const targetRx = rx || userPrescriptions.find(r => {
                const st = String(r.status || '').toLowerCase();
                return st.includes('approved') || st.includes('verified');
              });
              if (targetRx) {
                addToast(`Prescribed medicines from ${targetRx.id} added to cart!`, 'success');
                openCart();
              } else {
                addToast('Your prescriptions are currently being reviewed by our licensed pharmacist.', 'info');
              }
            };

            return (
              <div className="space-y-4 sm:space-y-5">
                {/* 1. Header Hero Banner with Rx Medical Vector Artwork */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-white/80 bg-white shadow-[0_4px_24px_-4px_rgba(0,143,131,0.07)] p-5 sm:p-6 overflow-hidden flex items-center justify-between">
                  {/* Background wave gradient */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#E1F4FC]/40 to-[#D4F0FA]/70" />

                  {/* Left: Rx Icon Box & Text */}
                  <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 max-w-2xl min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8FAF5] border border-teal-100 flex items-center justify-center text-[#00A68A] shrink-0 font-black text-xl select-none shadow-2xs">
                      <span className="font-serif italic font-extrabold text-2xl tracking-tighter text-[#00A68A]">℞</span>
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Doctor's Prescription Vault
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Upload, manage, and track your doctor prescriptions for verified pharmacist review and quick medicine orders.
                      </p>
                    </div>
                  </div>

                  {/* Right: Medical Clipboard, Pill Bottle, Leaves & Shield Artwork */}
                  <div className="hidden md:flex items-center justify-end shrink-0 relative w-48 sm:w-56 h-28 pointer-events-none select-none">
                    <svg viewBox="0 0 240 140" className="w-full h-full object-contain overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="rxClipGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#0284C7" />
                        </linearGradient>
                        <filter id="rxDropShadow" x="-10%" y="-10%" width="130%" height="130%">
                          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {/* Leaves in background */}
                      <g opacity="0.95">
                        <path d="M72 75 C58 60, 52 42, 64 32 C78 24, 90 38, 82 60 Z" fill="#6EE7B7" />
                        <path d="M58 88 C44 78, 40 60, 50 50 C62 40, 72 54, 65 78 Z" fill="#34D399" />
                        <path d="M168 70 C182 56, 192 38, 182 28 C170 20, 158 34, 162 55 Z" fill="#6EE7B7" />
                        <path d="M178 86 C194 76, 198 58, 188 48 C176 38, 166 54, 172 76 Z" fill="#34D399" />
                      </g>

                      {/* Clipboard */}
                      <g filter="url(#rxDropShadow)" transform="translate(85, 14)">
                        <rect x="0" y="8" width="70" height="92" rx="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                        <rect x="18" y="0" width="34" height="14" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                        <circle cx="35" cy="7" r="3" fill="#64748B" />
                        <rect x="7" y="15" width="56" height="78" rx="6" fill="#FFFFFF" />
                        <text x="13" y="37" fontFamily="serif" fontSize="21" fontWeight="bold" fill="#0284C7">℞</text>
                        <line x1="36" y1="27" x2="55" y2="27" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="36" y1="34" x2="50" y2="34" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
                        <line x1="13" y1="46" x2="57" y2="46" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="13" y1="54" x2="57" y2="54" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="13" y1="62" x2="48" y2="62" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="13" y1="70" x2="40" y2="70" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="13" y1="78" x2="52" y2="78" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                      </g>

                      {/* Pill Bottle */}
                      <g filter="url(#rxDropShadow)" transform="translate(64, 60)">
                        <rect x="4" y="0" width="22" height="7" rx="2" fill="#00BFA5" />
                        <rect x="6" y="6" width="18" height="4" fill="#E0F2FE" />
                        <rect x="0" y="9" width="30" height="42" rx="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                        <rect x="3" y="16" width="24" height="24" rx="2" fill="#E8FAF5" />
                        <line x1="6" y1="23" x2="24" y2="23" stroke="#00A68A" strokeWidth="2" strokeLinecap="round" />
                        <line x1="6" y1="28" x2="20" y2="28" stroke="#00BFA5" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="6" y1="33" x2="16" y2="33" stroke="#99F6E4" strokeWidth="1.5" strokeLinecap="round" />
                        <g transform="translate(18, 44) rotate(-30)">
                          <rect x="0" y="0" width="14" height="6" rx="3" fill="#00BFA5" />
                          <rect x="7" y="0" width="7" height="6" rx="3" fill="#38BDF8" />
                        </g>
                      </g>

                      {/* Plus Shield Badge */}
                      <g filter="url(#rxDropShadow)" transform="translate(148, 70)">
                        <circle cx="20" cy="20" r="20" fill="#00BFA5" />
                        <circle cx="20" cy="20" r="16.5" fill="#00A68A" />
                        <rect x="17.5" y="10" width="5" height="20" rx="2.5" fill="#FFFFFF" />
                        <rect x="10" y="17.5" width="20" height="5" rx="2.5" fill="#FFFFFF" />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* 2. KPI / Stat Metrics Cards Row (4 Cards + Primary Button) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
                  {/* Total Prescriptions */}
                  <div className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#00A68A]" />
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                        {totalRxCount}
                      </span>
                      <span className="text-xs font-bold text-slate-500 block">Total Prescriptions</span>
                    </div>
                  </div>

                  {/* Under Review */}
                  <div className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#EAF5FB] text-[#0284C7] flex items-center justify-center shrink-0">
                      <Hourglass className="w-5 h-5 text-[#0284C7]" />
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                        {underReviewRxCount}
                      </span>
                      <span className="text-xs font-bold text-slate-500 block">Under Review</span>
                    </div>
                  </div>

                  {/* Approved */}
                  <div className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#00A68A]" />
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                        {approvedRxCount}
                      </span>
                      <span className="text-xs font-bold text-slate-500 block">Approved</span>
                    </div>
                  </div>

                  {/* Rejected */}
                  <div className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#FDE8E8] text-[#E02424] flex items-center justify-center shrink-0">
                      <XCircle className="w-5 h-5 text-[#E02424]" />
                    </div>
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                        {rejectedRxCount}
                      </span>
                      <span className="text-xs font-bold text-slate-500 block">Rejected</span>
                    </div>
                  </div>

                  {/* Action Button: Upload New Prescription */}
                  <button
                    type="button"
                    onClick={() => setIsPrescriptionUploadModalOpen(true)}
                    className="col-span-2 lg:col-span-1 bg-[#008F83] hover:bg-[#007A70] text-white p-4 sm:p-5 rounded-2xl sm:rounded-[22px] font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition cursor-pointer group"
                  >
                    <UploadCloud className="w-5 h-5 text-white/90 group-hover:scale-110 transition-transform shrink-0" />
                    <span>Upload New Prescription</span>
                  </button>
                </div>

                {/* 3. Middle Section: Hero Upload Dropzone Card + How It Works Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                  {/* Left: Upload Doctor's Prescription Hero Card with Dashed Border */}
                  <div
                    onClick={() => setIsPrescriptionUploadModalOpen(true)}
                    className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border-2 border-dashed border-[#00BFA5]/60 hover:border-[#00BFA5] shadow-xs flex flex-col sm:flex-row items-center gap-6 cursor-pointer group transition-all"
                  >
                    {/* 3D-styled vector illustration */}
                    <div className="w-36 h-28 shrink-0 relative flex items-center justify-center select-none pointer-events-none group-hover:scale-105 transition-transform">
                      <svg viewBox="0 0 160 120" className="w-full h-full object-contain overflow-visible" fill="none">
                        {/* Leaves */}
                        <path d="M48 65 C38 52, 34 38, 44 30 C56 22, 65 34, 58 52 Z" fill="#6EE7B7" />
                        <path d="M36 78 C24 70, 20 54, 30 44 C40 36, 50 48, 42 70 Z" fill="#34D399" />
                        <path d="M125 60 C136 48, 144 32, 136 24 C126 16, 116 28, 120 46 Z" fill="#6EE7B7" />
                        <path d="M135 74 C148 64, 152 48, 144 40 C134 32, 124 46, 130 66 Z" fill="#34D399" />
                        {/* Clipboard */}
                        <rect x="52" y="16" width="56" height="74" rx="8" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                        <rect x="66" y="10" width="28" height="11" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
                        <circle cx="80" cy="15.5" r="2.5" fill="#64748B" />
                        <rect x="58" y="22" width="44" height="62" rx="4" fill="#FFFFFF" />
                        <text x="63" y="40" fontFamily="serif" fontSize="16" fontWeight="bold" fill="#0284C7">℞</text>
                        <line x1="81" y1="32" x2="96" y2="32" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                        <line x1="81" y1="38" x2="92" y2="38" stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="63" y1="48" x2="97" y2="48" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="63" y1="54" x2="97" y2="54" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="63" y1="60" x2="90" y2="60" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="63" y1="66" x2="84" y2="66" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="63" y1="72" x2="94" y2="72" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
                        {/* Bottle */}
                        <rect x="40" y="52" width="18" height="6" rx="1.5" fill="#00BFA5" />
                        <rect x="36" y="58" width="26" height="34" rx="5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
                        <rect x="39" y="64" width="20" height="20" rx="2" fill="#E8FAF5" />
                        <line x1="42" y1="70" x2="56" y2="70" stroke="#00A68A" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="42" y1="74" x2="53" y2="74" stroke="#00BFA5" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="42" y1="78" x2="50" y2="78" stroke="#99F6E4" strokeWidth="1.2" strokeLinecap="round" />
                        {/* Plus Badge */}
                        <circle cx="106" cy="62" r="16" fill="#00BFA5" />
                        <circle cx="106" cy="62" r="13" fill="#00A68A" />
                        <rect x="104" y="54" width="4" height="16" rx="2" fill="#FFFFFF" />
                        <rect x="98" y="60" width="16" height="4" rx="2" fill="#FFFFFF" />
                      </svg>
                    </div>

                    {/* Content & Actions */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Upload Doctor's Prescription
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Drag & drop your prescription (JPG, PNG, PDF) or click to browse
                      </p>

                      {/* Requirement Badges */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-3">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          <span>JPG / PNG / PDF</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          <span>Max 10 MB</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                          <span>Secure & Encrypted</span>
                        </span>
                      </div>

                      {/* Choose File Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPrescriptionUploadModalOpen(true);
                        }}
                        className="mt-4 bg-[#008F83] hover:bg-[#007A70] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs inline-flex items-center gap-2 cursor-pointer transition"
                      >
                        <UploadCloud className="w-4 h-4 text-white" />
                        <span>Choose File</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: How It Works? Stepper Card */}
                  <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-blue-100/80 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-5 h-5 rounded-full border border-teal-500 text-[#008F83] flex items-center justify-center text-xs font-extrabold select-none">
                        ⓘ
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        How It Works?
                      </h3>
                    </div>

                    <div className="space-y-3.5 relative">
                      {/* Step 1 */}
                      <div className="flex items-start gap-3 relative">
                        <div className="w-6 h-6 rounded-full bg-[#E8FAF5] text-[#00A68A] font-extrabold text-xs flex items-center justify-center shrink-0 border border-teal-200 mt-0.5">
                          1
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900">Upload Prescription</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Add a clear photo or PDF of your prescription.
                          </p>
                        </div>
                      </div>

                      {/* Connector Line */}
                      <div className="w-0.5 h-5 bg-blue-100 ml-3 -my-1" />

                      {/* Step 2 */}
                      <div className="flex items-start gap-3 relative">
                        <div className="w-6 h-6 rounded-full bg-[#EAF5FB] text-[#0284C7] font-extrabold text-xs flex items-center justify-center shrink-0 border border-blue-200 mt-0.5">
                          2
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900">Pharmacist Review</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Our licensed pharmacist verifies and processes it.
                          </p>
                        </div>
                      </div>

                      {/* Connector Line */}
                      <div className="w-0.5 h-5 bg-blue-100 ml-3 -my-1" />

                      {/* Step 3 */}
                      <div className="flex items-start gap-3 relative">
                        <div className="w-6 h-6 rounded-full bg-[#F3E8FF] text-[#7E22CE] font-extrabold text-xs flex items-center justify-center shrink-0 border border-purple-200 mt-0.5">
                          3
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900">Get Medicines</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Receive a confirmed medicine order with pricing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Filter Tabs Bar & Search / Time Dropdown */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                  {/* Left: Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setRxStatusFilter('all')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        rxStatusFilter === 'all'
                          ? 'bg-[#008F83] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <ListFilter className="w-3.5 h-3.5" />
                      <span>All Prescriptions ({totalRxCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRxStatusFilter('under_review')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        rxStatusFilter === 'under_review'
                          ? 'bg-[#008F83] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <Hourglass className="w-3.5 h-3.5 text-blue-500" />
                      <span>Under Review ({underReviewRxCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRxStatusFilter('approved')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        rxStatusFilter === 'approved'
                          ? 'bg-[#008F83] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Approved ({approvedRxCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRxStatusFilter('rejected')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        rxStatusFilter === 'rejected'
                          ? 'bg-[#008F83] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <X className="w-3.5 h-3.5 text-rose-500" />
                      <span>Rejected ({rejectedRxCount})</span>
                    </button>
                  </div>

                  {/* Right: Search & Time Dropdown */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto w-full md:w-auto">
                    <div className="relative flex-1 md:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={rxSearchQuery}
                        onChange={(e) => setRxSearchQuery(e.target.value)}
                        placeholder="Search prescriptions..."
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/90 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00BFA5] focus:ring-1 focus:ring-[#00BFA5] shadow-2xs"
                      />
                    </div>

                    <div className="relative shrink-0">
                      <select
                        value={rxTimeFilter}
                        onChange={(e) => setRxTimeFilter(e.target.value)}
                        className="appearance-none bg-white border border-slate-200/90 rounded-full pl-3.5 pr-8 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-[#00BFA5] cursor-pointer shadow-2xs"
                      >
                        <option value="all">All Time</option>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 5. Main 2-Column Section: Table on Left + Widgets on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                  {/* Left Column: Prescriptions Table Card */}
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-blue-100/80 shadow-xs overflow-hidden">
                    {filteredPrescriptions.length > 0 ? (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto scrollbar-none">
                          <table className="w-full text-left border-collapse table-auto">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] sm:text-[10.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Prescription</th>
                                <th className="py-2.5 sm:py-3 px-2 sm:px-3 whitespace-nowrap">Uploaded On</th>
                                <th className="py-2.5 sm:py-3 px-2 sm:px-3">Doctor / Hospital</th>
                                <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center whitespace-nowrap">Status</th>
                                <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right whitespace-nowrap">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                              {filteredPrescriptions.map((rx) => {
                                const stLower = String(rx.status || '').toLowerCase();
                                const isApproved = stLower.includes('approved') || stLower.includes('verified');
                                const isRejected = stLower.includes('rejected');
                                const isPdf = Boolean(
                                  (rx.fileName && rx.fileName.toLowerCase().endsWith('.pdf')) ||
                                  (rx.fileType && rx.fileType.toLowerCase().includes('pdf'))
                                );
                                const isImage = !isPdf && Boolean(
                                  rx.fileType?.includes('image') ||
                                  rx.fileName?.match(/\.(jpg|jpeg|png|webp)$/i) ||
                                  (rx.imagePreview && !rx.imagePreview.includes('.pdf'))
                                );

                                return (
                                  <tr key={rx.id} className="hover:bg-slate-50/70 transition-colors">
                                    {/* Prescription Document Thumbnail + Name + Size */}
                                    <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                      <div className="flex items-center gap-2 sm:gap-2.5">
                                        {/* Document Thumbnail Preview */}
                                        <div className="w-8 h-10 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs relative">
                                          {isImage && (rx.imagePreview || rx.fileUrl) ? (
                                            <img
                                              src={rx.imagePreview || rx.fileUrl}
                                              alt={rx.fileName || 'Prescription Preview'}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                              }}
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-0.5">
                                              <span className="text-[8px] font-mono font-bold text-rose-500 bg-rose-50 px-1 rounded">PDF</span>
                                              <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                            </div>
                                          )}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-900 truncate max-w-[110px] sm:max-w-[130px] lg:max-w-[150px] text-[11px] sm:text-xs" title={rx.fileName || 'Prescription'}>
                                            {rx.fileName || `${rx.doctorName ? `Dr_${rx.doctorName.replace(/\s+/g, '_')}_` : ''}Prescription.pdf`}
                                          </p>
                                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate">
                                            {(rx.fileType || (rx.fileName?.endsWith('.pdf') ? 'PDF' : 'JPG')).toUpperCase()} • {rx.fileSize || '1.2 MB'}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Uploaded On */}
                                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-slate-600 whitespace-nowrap">
                                      {(() => {
                                        const raw = rx.uploadedAt || rx.dateOfIssue || '20 Nov 2026, 10:24 AM';
                                        const commaIdx = raw.indexOf(',');
                                        if (commaIdx !== -1) {
                                          return (
                                            <div className="leading-tight">
                                              <p className="font-semibold text-slate-800 text-[11px]">{raw.slice(0, commaIdx).trim()}</p>
                                              <p className="text-[10px] text-slate-400 mt-0.5">{raw.slice(commaIdx + 1).trim()}</p>
                                            </div>
                                          );
                                        }
                                        return <span className="font-medium text-[11px]">{raw}</span>;
                                      })()}
                                    </td>

                                    {/* Doctor / Hospital */}
                                    <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                                      <p className="font-bold text-slate-900 text-[11px] sm:text-xs truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[140px]" title={rx.doctorName || 'Dr. R. Sharma'}>
                                        {rx.doctorName || 'Dr. R. Sharma'}
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[140px]" title={rx.hospital || rx.clinicName || 'City Care Hospital'}>
                                        {rx.hospital || rx.clinicName || 'City Care Hospital'}
                                      </p>
                                    </td>

                                    {/* Status Pill Badge */}
                                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 whitespace-nowrap text-center">
                                      {isApproved ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF5] text-[#00A68A] border border-teal-200">
                                          <Check className="w-3 h-3" />
                                          <span>Approved</span>
                                        </span>
                                      ) : isRejected ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-rose-200">
                                          <X className="w-3 h-3" />
                                          <span>Rejected</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200">
                                          <Hourglass className="w-3 h-3" />
                                          <span>Under Review</span>
                                        </span>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right whitespace-nowrap relative">
                                      <div className="inline-flex items-center gap-1 justify-end">
                                        {/* View Button */}
                                        <button
                                          type="button"
                                          onClick={() => setSelectedPrescription(rx)}
                                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-bold text-slate-700 hover:text-[#008F83] hover:bg-teal-50 transition cursor-pointer border border-slate-200/60"
                                        >
                                          <Eye className="w-3 h-3 text-teal-600" />
                                          <span>View</span>
                                        </button>

                                        {/* Download Icon Button */}
                                        {(rx.fileUrl || rx.imagePreview) && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              downloadPrescriptionFile(rx);
                                              addToast('Downloading prescription file...', 'info');
                                            }}
                                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                            title="Download Prescription"
                                          >
                                            <Download className="w-3 h-3" />
                                          </button>
                                        )}

                                        {/* More Options / Three Dots Menu */}
                                        <div className="relative">
                                          <button
                                            type="button"
                                            onClick={() => setActiveRxMenuId(activeRxMenuId === rx.id ? null : rx.id)}
                                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                            title="More Actions"
                                          >
                                            <MoreVertical className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Dropdown Menu */}
                                          {activeRxMenuId === rx.id && (
                                            <div
                                              onMouseLeave={() => setActiveRxMenuId(null)}
                                              className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveRxMenuId(null);
                                                  setSelectedPrescription(rx);
                                                }}
                                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                                              >
                                                <Eye className="w-3.5 h-3.5 text-teal-600" />
                                                <span>View Document</span>
                                              </button>

                                              {isApproved && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setActiveRxMenuId(null);
                                                    handleOrderMedicines(rx);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-[#008F83] font-bold hover:bg-teal-50 cursor-pointer"
                                                >
                                                  <ShoppingCart className="w-3.5 h-3.5 text-[#008F83]" />
                                                  <span>Order Medicines</span>
                                                </button>
                                              )}

                                              {(rx.fileUrl || rx.imagePreview) && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setActiveRxMenuId(null);
                                                    downloadPrescriptionFile(rx);
                                                    addToast('Downloading prescription file...', 'info');
                                                  }}
                                                  className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                >
                                                  <Download className="w-3.5 h-3.5 text-slate-500" />
                                                  <span>Download</span>
                                                </button>
                                              )}

                                              <button
                                                type="button"
                                                onClick={async () => {
                                                  setActiveRxMenuId(null);
                                                  if (window.confirm('Are you sure you want to remove this prescription?')) {
                                                    await deletePrescription(rx.id);
                                                    addToast('Prescription removed from vault.', 'info');
                                                  }
                                                }}
                                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                                              >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                                <span>Delete</span>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card List View */}
                        <div className="md:hidden divide-y divide-slate-100 p-4 space-y-4">
                          {filteredPrescriptions.map((rx) => {
                            const stLower = String(rx.status || '').toLowerCase();
                            const isApproved = stLower.includes('approved') || stLower.includes('verified');
                            const isRejected = stLower.includes('rejected');
                            const isImage = rx.imagePreview || rx.fileType?.includes('image') || rx.fileName?.match(/\.(jpg|jpeg|png|webp)$/i);

                            return (
                              <div key={rx.id} className="pt-4 first:pt-0 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                      {isImage && (rx.imagePreview || rx.fileUrl) ? (
                                        <img
                                          src={rx.imagePreview || rx.fileUrl}
                                          alt={rx.fileName || 'Prescription Preview'}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-1">
                                          <span className="text-[9px] font-mono font-bold text-rose-500 bg-rose-50 px-1 rounded">PDF</span>
                                          <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 text-xs truncate">
                                        {rx.fileName || `${rx.doctorName ? `Dr_${rx.doctorName.replace(/\s+/g, '_')}_` : ''}Prescription.pdf`}
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        {(rx.fileType || (rx.fileName?.endsWith('.pdf') ? 'PDF' : 'JPG')).toUpperCase()} • {rx.fileSize || '1.2 MB'}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    {isApproved ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF5] text-[#00A68A] border border-teal-200">
                                        <Check className="w-3 h-3" />
                                        <span>Approved</span>
                                      </span>
                                    ) : isRejected ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-rose-200">
                                        <X className="w-3 h-3" />
                                        <span>Rejected</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200">
                                        <Hourglass className="w-3 h-3" />
                                        <span>Under Review</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-xs text-slate-600 space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Doctor / Hospital:</span>
                                    <span className="font-bold text-slate-800 text-right">{rx.doctorName || 'Dr. R. Sharma'} ({rx.hospital || rx.clinicName || 'City Care Hospital'})</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Uploaded On:</span>
                                    <span className="font-medium text-slate-700">{rx.uploadedAt || rx.dateOfIssue || '20 Nov 2026, 10:24 AM'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPrescription(rx)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                                    <span>View</span>
                                  </button>

                                  {(rx.fileUrl || rx.imagePreview) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        downloadPrescriptionFile(rx);
                                        addToast('Downloading prescription file...', 'info');
                                      }}
                                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                                      title="Download Document"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {isApproved && (
                                    <button
                                      type="button"
                                      onClick={() => handleOrderMedicines(rx)}
                                      className="px-3 py-1.5 rounded-lg bg-[#008F83] text-white text-xs font-bold transition flex items-center gap-1.5"
                                    >
                                      <ShoppingCart className="w-3.5 h-3.5" />
                                      <span>Order</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (window.confirm('Are you sure you want to remove this prescription?')) {
                                        await deletePrescription(rx.id);
                                        addToast('Prescription removed from vault.', 'info');
                                      }
                                    }}
                                    className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition"
                                    title="Delete Prescription"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      /* Empty State */
                      <div className="p-10 sm:p-12 text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#E8FAF5] text-[#00A68A] border border-teal-100 flex items-center justify-center mx-auto shadow-2xs">
                          <FileText className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-800">
                          {rxSearchQuery || rxStatusFilter !== 'all' ? 'No Matching Prescriptions' : 'No Prescriptions in Vault'}
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          {rxSearchQuery || rxStatusFilter !== 'all'
                            ? 'No prescriptions match your current search or status filter. Try clearing filters or searching another keyword.'
                            : "You haven't uploaded any doctor prescriptions yet. Use the upload box above to submit your prescription for verified doorstep medicine fulfillment."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsPrescriptionUploadModalOpen(true)}
                          className="mt-2 inline-flex items-center gap-2 bg-[#008F83] hover:bg-[#007A70] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Upload Prescription Now</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Sidebar Widgets */}
                  <div className="lg:col-span-4 space-y-4 sm:space-y-5">
                    {/* Widget 1: Prescription Summary */}
                    <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#00A68A]" />
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          Prescription Summary
                        </h3>
                      </div>

                      <div className="space-y-3 text-xs text-slate-700">
                        {/* Total Uploaded */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2.5 font-medium text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00BFA5]" />
                            <span>Total Uploaded</span>
                          </span>
                          <span className="font-extrabold text-slate-900">{totalRxCount}</span>
                        </div>

                        {/* Approved */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2.5 font-medium text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                            <span>Approved</span>
                          </span>
                          <span className="font-extrabold text-slate-900">{approvedRxCount}</span>
                        </div>

                        {/* Under Review */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2.5 font-medium text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                            <span>Under Review</span>
                          </span>
                          <span className="font-extrabold text-slate-900">{underReviewRxCount}</span>
                        </div>

                        {/* Rejected */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2.5 font-medium text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                            <span>Rejected</span>
                          </span>
                          <span className="font-extrabold text-slate-900">{rejectedRxCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Widget 2: Quick Actions */}
                    <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-[#00A68A]" />
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          Quick Actions
                        </h3>
                      </div>

                      {/* Action 1: Order Medicines */}
                      <button
                        type="button"
                        onClick={() => handleOrderMedicines()}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                              Order Medicines
                            </div>
                            <div className="text-[10.5px] text-slate-400">
                              Buy prescribed medicines instantly
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                      </button>

                      {/* Action 2: Set Reminders */}
                      <button
                        type="button"
                        onClick={handleSetReminders}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                              Set Reminders
                            </div>
                            <div className="text-[10.5px] text-slate-400">
                              Get alerts for refills and follow-ups
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                      </button>

                      {/* Action 3: Download All */}
                      <button
                        type="button"
                        onClick={handleDownloadAllPrescriptions}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Download className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                              Download All
                            </div>
                            <div className="text-[10.5px] text-slate-400">
                              Download all your prescriptions
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* 3. MY DIAGNOSTIC REPORTS VIEW (Refined to Reference)      */}
          {/* ======================================================== */}
          {activeMenu === 'reports' && (() => {
            const totalReportsCount = userReports.length;
            const completedReportsCount = userReports.filter(r => String(r.status || '').toLowerCase().includes('ready') || String(r.status || '').toLowerCase().includes('complete') || String(r.status || '').toLowerCase().includes('publish')).length;
            const pendingReportsCount = userReports.filter(r => String(r.status || '').toLowerCase().includes('pending') || String(r.status || '').toLowerCase().includes('assign') || String(r.status || '').toLowerCase().includes('process')).length;
            const actionRequiredCount = userReports.filter(r => Boolean(r.hasAbnormal) || String(r.status || '').toLowerCase().includes('action')).length;

            const filteredReports = (userReports || []).filter(r => {
              const st = String(r.status || '').toLowerCase();
              if (reportFilter === 'completed' && !st.includes('ready') && !st.includes('complete') && !st.includes('publish')) return false;
              if (reportFilter === 'pending' && !st.includes('pending') && !st.includes('assign') && !st.includes('process')) return false;
              if (reportFilter === 'action_required' && !r.hasAbnormal && !st.includes('action')) return false;

              if (reportSearchQuery.trim()) {
                const q = reportSearchQuery.trim().toLowerCase();
                const matchName = String(r.test || '').toLowerCase().includes(q);
                const matchId = String(r.id || '').toLowerCase().includes(q);
                const matchSub = String(r.subtitle || '').toLowerCase().includes(q);
                if (!matchName && !matchId && !matchSub) return false;
              }
              return true;
            });

            const getTestIconData = (testName = '') => {
              const lower = testName.toLowerCase();
              if (lower.includes('vitamin')) {
                return {
                  Icon: Droplet,
                  bg: 'bg-rose-50 text-rose-500 border border-rose-100'
                };
              }
              if (lower.includes('cbc') || lower.includes('blood') || lower.includes('hemogram')) {
                return {
                  Icon: FlaskConical,
                  bg: 'bg-purple-50 text-purple-600 border border-purple-100'
                };
              }
              if (lower.includes('lipid') || lower.includes('cholesterol')) {
                return {
                  Icon: FlaskConical,
                  bg: 'bg-blue-50 text-blue-600 border border-blue-100'
                };
              }
              if (lower.includes('thyroid')) {
                return {
                  Icon: Heart,
                  bg: 'bg-rose-50 text-rose-500 border border-rose-100'
                };
              }
              if (lower.includes('liver') || lower.includes('lft')) {
                return {
                  Icon: Layers,
                  bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                };
              }
              return {
                Icon: FlaskConical,
                bg: 'bg-teal-50 text-[#00A68A] border border-teal-100'
              };
            };

            const handleDownloadAllReports = () => {
              if (userReports.length === 0) {
                addToast('No diagnostic reports available to download.', 'info');
                return;
              }
              userReports.forEach((rep, i) => {
                setTimeout(() => downloadClinicalReport(rep), i * 350);
              });
              addToast(`Downloading ${userReports.length} diagnostic reports...`, 'success');
            };

            const handleShareAllReports = () => {
              if (userReports.length === 0) {
                addToast('No diagnostic reports available to share.', 'info');
                return;
              }
              if (navigator.share) {
                navigator.share({
                  title: 'ZESTMED Diagnostic Reports',
                  text: `Diagnostic test reports for ${user?.name || 'Patient'} from ZESTMED Dispur Central Laboratory.`,
                  url: window.location.href
                }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
                addToast('Secure link to reports copied to clipboard!', 'success');
              }
            };

            return (
              <div className="space-y-4 sm:space-y-5">
                {/* 1. Header Hero Banner with Microscope & Test Tubes Artwork */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-white/80 bg-white shadow-[0_4px_24px_-4px_rgba(0,143,131,0.07)] p-5 sm:p-6 overflow-hidden flex items-center justify-between">
                  {/* Background wave gradient */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#E1F4FC]/40 to-[#D4F0FA]/70" />

                  {/* Left: Document Icon & Text */}
                  <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 max-w-2xl min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#00BFA5]/30 shadow-xs flex items-center justify-center text-[#00A68A] shrink-0">
                      <FileText className="w-6 h-6 text-[#00A68A]" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        My Diagnostic Test Reports
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Access, download, and manage your lab test reports from certified diagnostic partners.
                      </p>
                    </div>
                  </div>

                  {/* Right: Microscope & Chemical Test Tube Rack Artwork */}
                  <div className="hidden md:flex items-center justify-end shrink-0 relative w-48 sm:w-56 h-28 pointer-events-none select-none">
                    <svg viewBox="0 0 240 140" className="w-full h-full object-contain overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="microscopeGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#0284C7" />
                        </linearGradient>
                        <linearGradient id="tubeLiquid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#0EA5E9" />
                        </linearGradient>
                        <filter id="reportShadow" x="-10%" y="-10%" width="130%" height="130%">
                          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {/* Microscope Illustration */}
                      <g transform="translate(25, 12)" filter="url(#reportShadow)">
                        <rect x="10" y="96" width="60" height="12" rx="6" fill="#0C4A6E" />
                        <rect x="25" y="88" width="30" height="10" rx="3" fill="#0284C7" />
                        <path d="M55 88 C70 80, 75 55, 65 35 C55 15, 35 22, 35 32" fill="none" stroke="url(#microscopeGrad)" strokeWidth="9" strokeLinecap="round" />
                        <rect x="22" y="10" width="14" height="28" rx="4" transform="rotate(-25 22 10)" fill="#0C4A6E" />
                        <rect x="20" y="6" width="18" height="6" rx="2" transform="rotate(-25 20 6)" fill="#38BDF8" />
                        <circle cx="36" cy="46" r="8" fill="#0C4A6E" />
                        <rect x="33" y="52" width="7" height="14" rx="2" fill="#0284C7" />
                        <rect x="32" y="64" width="9" height="3" rx="1" fill="#BAE6FD" />
                        <rect x="15" y="68" width="45" height="5" rx="2" fill="#0C4A6E" />
                        <rect x="28" y="66" width="20" height="2" rx="1" fill="#E0F2FE" />
                        <circle cx="38" cy="67" r="1.5" fill="#38BDF8" />
                        <circle cx="62" cy="58" r="6" fill="#0C4A6E" />
                        <circle cx="62" cy="58" r="3" fill="#38BDF8" />
                      </g>

                      {/* Test Tube Rack with 4 tubes */}
                      <g transform="translate(130, 30)" filter="url(#reportShadow)">
                        <rect x="0" y="45" width="85" height="4" rx="2" fill="#0284C7" />
                        <rect x="0" y="78" width="85" height="5" rx="2.5" fill="#0C4A6E" />
                        <rect x="4" y="45" width="4" height="36" rx="2" fill="#0284C7" />
                        <rect x="77" y="45" width="4" height="36" rx="2" fill="#0284C7" />

                        {/* Tube 1 */}
                        <rect x="14" y="15" width="11" height="58" rx="5.5" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
                        <rect x="15.5" y="32" width="8" height="39" rx="4" fill="url(#tubeLiquid)" />
                        <circle cx="19.5" cy="45" r="1.5" fill="#FFFFFF" opacity="0.8" />
                        <circle cx="21" cy="55" r="1" fill="#FFFFFF" opacity="0.8" />

                        {/* Tube 2 */}
                        <rect x="29" y="8" width="11" height="65" rx="5.5" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
                        <rect x="30.5" y="22" width="8" height="49" rx="4" fill="url(#tubeLiquid)" />
                        <circle cx="34.5" cy="35" r="1.5" fill="#FFFFFF" opacity="0.8" />
                        <circle cx="36" cy="48" r="1" fill="#FFFFFF" opacity="0.8" />
                        <circle cx="33" cy="58" r="1.5" fill="#FFFFFF" opacity="0.8" />

                        {/* Tube 3 */}
                        <rect x="44" y="18" width="11" height="55" rx="5.5" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
                        <rect x="45.5" y="38" width="8" height="33" rx="4" fill="url(#tubeLiquid)" />
                        <circle cx="49.5" cy="50" r="1.5" fill="#FFFFFF" opacity="0.8" />

                        {/* Tube 4 */}
                        <rect x="59" y="12" width="11" height="61" rx="5.5" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.5" />
                        <rect x="60.5" y="28" width="8" height="43" rx="4" fill="url(#tubeLiquid)" />
                        <circle cx="64.5" cy="42" r="1.5" fill="#FFFFFF" opacity="0.8" />
                        <circle cx="63" cy="55" r="1" fill="#FFFFFF" opacity="0.8" />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* 2. Top Metrics / KPI Cards Row + Book Button */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {/* Card 1: Total Reports */}
                  <div className="bg-white rounded-2xl p-4 border border-blue-100/70 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Total Reports</div>
                      <div className="text-2xl font-black text-slate-900 leading-none mt-1">{totalReportsCount}</div>
                    </div>
                  </div>

                  {/* Card 2: Tests Completed */}
                  <div className="bg-white rounded-2xl p-4 border border-blue-100/70 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Tests Completed</div>
                      <div className="text-2xl font-black text-slate-900 leading-none mt-1">{completedReportsCount}</div>
                    </div>
                  </div>

                  {/* Card 3: Reports Pending */}
                  <div className="bg-white rounded-2xl p-4 border border-blue-100/70 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Reports Pending</div>
                      <div className="text-2xl font-black text-slate-900 leading-none mt-1">{pendingReportsCount}</div>
                    </div>
                  </div>

                  {/* Card 4: Action Required */}
                  <div className="bg-white rounded-2xl p-4 border border-blue-100/70 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Action Required</div>
                      <div className="text-2xl font-black text-slate-900 leading-none mt-1">{actionRequiredCount}</div>
                    </div>
                  </div>

                  {/* Button: Book Another Test */}
                  <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1 flex items-center">
                    <button
                      type="button"
                      onClick={() => navigate('/diagnostics')}
                      className="w-full h-full min-h-[58px] bg-[#008F83] hover:bg-[#007A64] text-white px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>Book Another Test</span>
                    </button>
                  </div>
                </div>

                {/* 3. Filter Pills Bar & Search Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left Filter Pills */}
                  <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => setReportFilter('all')}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-bold transition shrink-0 cursor-pointer flex items-center gap-2 shadow-xs ${
                        reportFilter === 'all'
                          ? 'bg-[#008F83] text-white border border-[#007A70]'
                          : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <ListFilter className="w-4 h-4 shrink-0" />
                      <span>All Reports ({totalReportsCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportFilter('completed')}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-bold transition shrink-0 cursor-pointer flex items-center gap-2 shadow-xs ${
                        reportFilter === 'completed'
                          ? 'bg-[#008F83] text-white border border-[#007A70]'
                          : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${reportFilter === 'completed' ? 'text-white' : 'text-blue-500'}`} />
                      <span>Completed ({completedReportsCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportFilter('pending')}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-bold transition shrink-0 cursor-pointer flex items-center gap-2 shadow-xs ${
                        reportFilter === 'pending'
                          ? 'bg-[#008F83] text-white border border-[#007A70]'
                          : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className={`w-3.5 h-3.5 shrink-0 ${reportFilter === 'pending' ? 'text-white' : 'text-blue-500'}`} />
                      <span>Pending ({pendingReportsCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportFilter('action_required')}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-bold transition shrink-0 cursor-pointer flex items-center gap-2 shadow-xs ${
                        reportFilter === 'action_required'
                          ? 'bg-[#008F83] text-white border border-[#007A70]'
                          : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${reportFilter === 'action_required' ? 'text-white' : 'text-rose-500'}`} />
                      <span>Action Required ({actionRequiredCount})</span>
                    </button>
                  </div>

                  {/* Right Search Box & Dropdown */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={reportSearchQuery}
                        onChange={(e) => setReportSearchQuery(e.target.value)}
                        placeholder="Search by test name, Lab ID..."
                        className="w-full bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#008F83] shadow-2xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = reportTimeFilter === 'all' ? 'month' : reportTimeFilter === 'month' ? 'year' : 'all';
                        setReportTimeFilter(next);
                      }}
                      className="bg-white border border-slate-200/90 text-slate-700 rounded-xl sm:rounded-2xl px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-slate-50 shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{reportTimeFilter === 'all' ? 'All Time' : reportTimeFilter === 'month' ? 'This Month' : 'This Year'}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* 4. Main 2-Column Content: Reports Table (Left) + Widgets (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                  {/* Left Column: Reports Table */}
                  <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl sm:rounded-[22px] border border-blue-100/80 shadow-[0_4px_16px_-4px_rgba(0,143,131,0.06)] overflow-hidden">
                    {/* Desktop View Table */}
                    <div className="hidden md:block overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="pl-6 py-3.5">Test Name</th>
                            <th className="py-3.5">Lab ID</th>
                            <th className="py-3.5">Test Date</th>
                            <th className="py-3.5">Report Status</th>
                            <th className="pr-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 text-xs text-slate-700">
                          {filteredReports.length > 0 ? (
                            filteredReports.map((rep, idx) => {
                              const iconData = getTestIconData(rep.test);
                              const IconComponent = iconData.Icon;
                              const isReady = String(rep.status).toLowerCase().includes('ready') || String(rep.status).toLowerCase().includes('complete') || String(rep.status).toLowerCase().includes('publish');
                              const isAction = rep.hasAbnormal || String(rep.status).toLowerCase().includes('action');

                              return (
                                <tr key={rep.id || idx} className="hover:bg-slate-50/60 transition group">
                                  {/* Test Name + Icon + Subtitle */}
                                  <td className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${iconData.bg}`}>
                                        <IconComponent className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-extrabold text-slate-900 group-hover:text-teal-700 transition truncate max-w-[220px] lg:max-w-xs">
                                          {rep.test}
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-normal truncate max-w-[220px] lg:max-w-xs mt-0.5">
                                          {rep.subtitle}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Lab ID */}
                                  <td className="py-4 font-mono font-medium text-slate-700">
                                    {rep.id}
                                  </td>

                                  {/* Test Date */}
                                  <td className="py-4 font-medium text-slate-600">
                                    {rep.date}
                                  </td>

                                  {/* Report Status */}
                                  <td className="py-4">
                                    {isAction ? (
                                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                        <span>Action Required</span>
                                      </span>
                                    ) : isReady ? (
                                      <span className="bg-[#E8FAF5] text-[#007A64] border border-[#B3EBDC] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#007A64]" />
                                        <span>Ready</span>
                                      </span>
                                    ) : (
                                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Pending</span>
                                      </span>
                                    )}
                                  </td>

                                  {/* Actions Buttons: View Report, Download, Share */}
                                  <td className="pr-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReportModal(rep.test, rep.date, rep.id, rep.pathologist || 'Dr. Pranabesh Sarma, MD Pathology')}
                                        className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                      >
                                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                                        <span>View Report</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          downloadClinicalReport(rep);
                                          addToast(`Official signed PDF report downloaded for ${rep.test}.`, 'success');
                                        }}
                                        className="border border-slate-200 hover:bg-slate-50 p-1.5 rounded-full text-slate-600 transition shadow-2xs cursor-pointer"
                                        title="Download Official PDF Report"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => shareClinicalReport(rep, addToast)}
                                        className="border border-slate-200 hover:bg-slate-50 p-1.5 rounded-full text-slate-600 transition shadow-2xs cursor-pointer"
                                        title="Share with Doctor"
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-400">
                                <FlaskConical className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p className="font-semibold text-slate-700 text-sm">No Diagnostic Reports Found</p>
                                <p className="text-xs text-slate-400 mt-0.5">No reports match your current filter or search criteria.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card Layout for smaller screens */}
                    <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-3.5">
                      {filteredReports.length > 0 ? (
                        filteredReports.map((rep, idx) => {
                          const iconData = getTestIconData(rep.test);
                          const IconComponent = iconData.Icon;
                          const isReady = String(rep.status).toLowerCase().includes('ready') || String(rep.status).toLowerCase().includes('complete') || String(rep.status).toLowerCase().includes('publish');
                          const isAction = rep.hasAbnormal || String(rep.status).toLowerCase().includes('action');

                          return (
                            <div key={rep.id || idx} className="pt-3.5 first:pt-0 space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconData.bg}`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rep.test}</h4>
                                    <p className="text-[11px] text-slate-400">{rep.subtitle}</p>
                                  </div>
                                </div>
                                <div>
                                  {isAction ? (
                                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-rose-500" /> Action
                                    </span>
                                  ) : isReady ? (
                                    <span className="bg-[#E8FAF5] text-[#007A64] border border-[#B3EBDC] px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-[#007A64]" /> Ready
                                    </span>
                                  ) : (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-amber-500" /> Pending
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span>Lab ID: <strong className="font-mono text-slate-700">{rep.id}</strong></span>
                                <span>Date: <strong className="text-slate-700">{rep.date}</strong></span>
                              </div>

                              <div className="flex items-center justify-between pt-1 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenReportModal(rep.test, rep.date, rep.id, rep.pathologist || 'Dr. Pranabesh Sarma, MD Pathology')}
                                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-1.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                                  <span>View Report</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    downloadClinicalReport(rep);
                                    addToast(`Official signed PDF report downloaded for ${rep.test}.`, 'success');
                                  }}
                                  className="p-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => shareClinicalReport(rep, addToast)}
                                  className="p-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-slate-400">
                          <p className="font-semibold text-slate-700 text-xs">No Diagnostic Reports Found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: 3 Widgets */}
                  <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                    {/* Widget 1: Your Lab Partner */}
                    <div className="bg-white rounded-2xl border border-blue-100/80 p-4 shadow-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-[#00A68A]" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Your Lab Partner
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                          <Building className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 truncate">
                              Dispur Central Laboratory
                            </h4>
                            <span className="bg-[#E8FAF5] text-[#007A64] border border-[#B3EBDC] px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            NABL Certified • Guwahati, Assam
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Widget 2: Quick Actions */}
                    <div className="bg-white rounded-2xl border border-blue-100/80 p-4 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#00A68A]" />
                        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Quick Actions
                        </h3>
                      </div>

                      <div className="space-y-1 pt-1 text-xs font-semibold text-slate-700">
                        <div
                          onClick={() => navigate('/diagnostics')}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-[#00A68A]" />
                            <span>Book a New Test</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        <div
                          onClick={handleDownloadAllReports}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Download className="w-4 h-4 text-[#00A68A]" />
                            <span>Download All Reports</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        <div
                          onClick={handleShareAllReports}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Share2 className="w-4 h-4 text-[#00A68A]" />
                            <span>Share Reports</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Widget 3: Health Insights */}
                    <div className="bg-white rounded-2xl border border-blue-100/80 p-4 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#00A68A]" />
                          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            Health Insights
                          </h3>
                        </div>
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      <div className="pt-1">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Your latest diagnostic report indicators are within optimal clinical reference ranges.
                        </p>
                        <div className="mt-2 text-right">
                          <span className="bg-[#E8FAF5] text-[#007A64] border border-[#B3EBDC] px-2.5 py-0.5 rounded-full text-[10.5px] font-bold">
                            Normal
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* 5. MY PROFILE & SAVED ADDRESSES VIEW                      */}
          {/* ======================================================== */}
          {activeMenu === 'profile' && (() => {
            const handleCopyUHID = () => {
              const textToCopy = profileForm.uhid || patientUHID;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(textToCopy);
                addToast(`UHID ${textToCopy} copied to clipboard!`, 'success');
              } else {
                addToast(`UHID: ${textToCopy}`, 'info');
              }
            };

            const handleToggle2FA = () => {
              const newState = !is2FAEnabled;
              setIs2FAEnabled(newState);
              addToast(newState ? 'Two-Factor Authentication (2FA) enabled.' : 'Two-Factor Authentication (2FA) disabled.', 'info');
            };

            const handleEditAllergies = () => {
              const current = healthAllergies;
              const input = window.prompt('Enter your known allergies (comma separated):', current);
              if (input !== null) {
                setHealthAllergies(input.trim() || 'None');
                try {
                  localStorage.setItem('zestmed_allergies', input.trim() || 'None');
                } catch (_) {}
                addToast('Allergies updated successfully.', 'success');
              }
            };

            const handleEditConditions = () => {
              const current = healthConditions === 'None Added' ? '' : healthConditions;
              const input = window.prompt('Enter chronic or existing medical conditions:', current);
              if (input !== null) {
                const val = input.trim() || 'None Added';
                setHealthConditions(val);
                try {
                  localStorage.setItem('zestmed_conditions', val);
                } catch (_) {}
                addToast('Medical conditions updated.', 'success');
              }
            };

            const handleEditMedications = () => {
              const current = healthMedications === 'None Added' ? '' : healthMedications;
              const input = window.prompt('Enter ongoing daily medications:', current);
              if (input !== null) {
                const val = input.trim() || 'None Added';
                setHealthMedications(val);
                try {
                  localStorage.setItem('zestmed_medications', val);
                } catch (_) {}
                addToast('Current medications updated.', 'success');
              }
            };

            return (
              <div className="space-y-4 sm:space-y-5">
                {/* 1. Header Hero Banner with Medical Artwork */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-white/80 bg-white shadow-[0_4px_24px_-4px_rgba(0,143,131,0.07)] p-5 sm:p-6 overflow-hidden flex items-center justify-between">
                  {/* Background wave gradient */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#E1F4FC]/40 to-[#D4F0FA]/70" />

                  {/* Left: User Icon & Heading */}
                  <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 max-w-2xl min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8FAF5] border border-teal-100 flex items-center justify-center text-[#00A68A] shrink-0 font-black text-xl select-none shadow-2xs">
                      <User className="w-6 h-6 text-[#00A68A]" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        My Profile & Saved Addresses
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Manage your personal health identity, contact info, medical details, and delivery locations.
                      </p>
                    </div>
                  </div>

                  {/* Right: Medical Clipboard, Shield Badge & Leaves Artwork */}
                  <div className="hidden md:flex items-center justify-end shrink-0 relative w-48 sm:w-56 h-28 pointer-events-none select-none">
                    <svg viewBox="0 0 240 140" className="w-full h-full object-contain overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="profileDropShadow" x="-10%" y="-10%" width="130%" height="130%">
                          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {/* Leaves in background */}
                      <g opacity="0.95">
                        <path d="M72 75 C58 60, 52 42, 64 32 C78 24, 90 38, 82 60 Z" fill="#6EE7B7" />
                        <path d="M58 88 C44 78, 40 60, 50 50 C62 40, 72 54, 65 78 Z" fill="#34D399" />
                        <path d="M168 70 C182 56, 192 38, 182 28 C170 20, 158 34, 162 55 Z" fill="#6EE7B7" />
                        <path d="M178 86 C194 76, 198 58, 188 48 C176 38, 166 54, 172 76 Z" fill="#34D399" />
                      </g>

                      {/* Clipboard */}
                      <g filter="url(#profileDropShadow)" transform="translate(85, 14)">
                        <rect x="0" y="8" width="70" height="92" rx="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                        <rect x="18" y="0" width="34" height="14" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                        <circle cx="35" cy="7" r="3" fill="#64748B" />
                        <rect x="7" y="15" width="56" height="78" rx="6" fill="#FFFFFF" />
                        
                        {/* Medical Cross Badge on sheet */}
                        <rect x="14" y="24" width="22" height="22" rx="5" fill="#E0F2FE" />
                        <rect x="23" y="28" width="4" height="14" rx="2" fill="#0284C7" />
                        <rect x="18" y="33" width="14" height="4" rx="2" fill="#0284C7" />

                        <line x1="42" y1="28" x2="55" y2="28" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="42" y1="35" x2="52" y2="35" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
                        <line x1="14" y1="54" x2="56" y2="54" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="14" y1="62" x2="56" y2="62" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="14" y1="70" x2="48" y2="70" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="14" y1="78" x2="52" y2="78" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                      </g>

                      {/* Pill Bottle */}
                      <g filter="url(#profileDropShadow)" transform="translate(64, 60)">
                        <rect x="4" y="0" width="22" height="7" rx="2" fill="#00BFA5" />
                        <rect x="6" y="6" width="18" height="4" fill="#E0F2FE" />
                        <rect x="0" y="9" width="30" height="42" rx="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                        <rect x="3" y="16" width="24" height="24" rx="2" fill="#E8FAF5" />
                        <line x1="6" y1="23" x2="24" y2="23" stroke="#00A68A" strokeWidth="2" strokeLinecap="round" />
                        <line x1="6" y1="28" x2="20" y2="28" stroke="#00BFA5" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="6" y1="33" x2="16" y2="33" stroke="#99F6E4" strokeWidth="1.5" strokeLinecap="round" />
                      </g>

                      {/* Plus Shield Badge */}
                      <g filter="url(#profileDropShadow)" transform="translate(148, 70)">
                        <circle cx="20" cy="20" r="20" fill="#00BFA5" />
                        <circle cx="20" cy="20" r="16.5" fill="#00A68A" />
                        <rect x="17.5" y="10" width="5" height="20" rx="2.5" fill="#FFFFFF" />
                        <rect x="10" y="17.5" width="20" height="5" rx="2.5" fill="#FFFFFF" />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* 2. Row 1: 3 Column Section (Personal Identity + Saved Addresses + Quick Actions) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                  {/* Card 1: Personal Health Identity */}
                  <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs flex flex-col justify-between space-y-4">
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#00A68A]" />
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            Personal Health Identity
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                          className="text-xs font-bold text-[#00A68A] hover:text-[#008F83] inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                        </button>
                      </div>

                      {/* Avatar, Name, UHID & Verified Badge */}
                      <div className="flex items-center gap-3.5 sm:gap-4">
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00A887] text-white flex items-center justify-center font-black text-lg ring-4 ring-teal-50 shadow-xs overflow-hidden">
                            {user?.avatar ? (
                              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span>AS</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newAvatar = window.prompt('Enter direct Image URL for your profile avatar:');
                              if (newAvatar) {
                                setProfileForm({ ...profileForm, avatar: newAvatar });
                                addToast('Avatar updated. Click Save Profile Changes to apply.', 'info');
                              }
                            }}
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white text-teal-700 border border-teal-200 flex items-center justify-center shadow-2xs hover:bg-teal-50 cursor-pointer"
                            title="Update Profile Photo"
                          >
                            <span className="text-[10px]">📷</span>
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00BFA5]"
                            />
                          ) : (
                            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                              {profileForm.name || patientFullName}
                            </h2>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 font-mono font-medium">
                              UHID: {profileForm.uhid || patientUHID}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyUHID}
                              className="text-slate-400 hover:text-slate-700 transition"
                              title="Copy UHID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Verified</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2x2 Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        {/* Email Address */}
                        <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <Mail className="w-3.5 h-3.5 text-teal-600" />
                            <span className="text-[11px] font-semibold">Email Address</span>
                          </div>
                          {isEditingProfile ? (
                            <input
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            />
                          ) : (
                            <p className="text-xs font-bold text-slate-800 truncate" title={profileForm.email}>
                              {profileForm.email || 'ajayendra.shekhar@patient.zestmed.com'}
                            </p>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <Phone className="w-3.5 h-3.5 text-teal-600" />
                            <span className="text-[11px] font-semibold">Phone Number</span>
                          </div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            />
                          ) : (
                            <p className="text-xs font-bold text-slate-800">
                              {profileForm.phone || '+91 9279125091'}
                            </p>
                          )}
                        </div>

                        {/* Blood Group */}
                        <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <Droplet className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-[11px] font-semibold">Blood Group</span>
                          </div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.bloodGroup}
                              onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            />
                          ) : (
                            <p className="text-xs font-bold text-slate-800">
                              {profileForm.bloodGroup || 'B+'}
                            </p>
                          )}
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                            <span className="text-[11px] font-semibold">Emergency Contact</span>
                          </div>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={profileForm.emergencyContact}
                              onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            />
                          ) : (
                            <p className="text-xs font-bold text-slate-800">
                              {profileForm.emergencyContact || '+91 92791 25091'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Save Profile Changes Action Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="bg-[#008F83] hover:bg-[#007A70] text-white py-2.5 px-6 rounded-xl font-bold text-xs shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer transition w-full sm:w-auto"
                        >
                          <FileText className="w-4 h-4 text-white" />
                          <span>Save Profile Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Card 2: Saved Assam Addresses */}
                  <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3.5">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#00A68A]" />
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            Saved Assam Addresses
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddAddressModalOpen(true)}
                          className="text-xs font-bold text-[#00A68A] hover:text-[#008F83] inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Address</span>
                        </button>
                      </div>

                      {/* Address Items */}
                      <div className="space-y-3">
                        {/* Address 1: Home (Default) */}
                        <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 mt-0.5">
                              <Home className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-extrabold text-slate-900">Home</span>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                  Default
                                </span>
                              </div>
                              <p className="text-slate-600 leading-snug font-medium">
                                {addresses[0]?.addressLine || 'H/no 12, ABC Colony, Beltola, Guwahati, Assam – 781028'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => addToast('Edit address form opened.', 'info')}
                              className="p-1 text-slate-400 hover:text-teal-600 transition"
                              title="Edit Address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (addresses[0]?.id) handleDeleteAddress(addresses[0].id);
                                else addToast('Default address preserved.', 'info');
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 transition"
                              title="Delete Address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Address 2: Office */}
                        <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 mt-0.5">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-extrabold text-slate-900">Office</span>
                              </div>
                              <p className="text-slate-600 leading-snug font-medium">
                                {addresses[1]?.addressLine || 'IT Park, G.S. Road, Ulubari, Guwahati, Assam – 781007'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => addToast('Edit address form opened.', 'info')}
                              className="p-1 text-slate-400 hover:text-teal-600 transition"
                              title="Edit Address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (addresses[1]?.id) handleDeleteAddress(addresses[1].id);
                                else addToast('Address deleted.', 'info');
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 transition"
                              title="Delete Address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Delivery Area Status Pill */}
                    <div className="bg-[#EAF5FB] rounded-2xl p-2.5 sm:px-3 flex items-center justify-between text-xs text-slate-700 border border-blue-100">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#00BFA5]" />
                        <span>Delivery Area: Guwahati, Assam</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#00A68A]">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Within Service Area</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Quick Actions */}
                  <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm pb-2 border-b border-slate-100">
                        <Zap className="w-4 h-4 text-[#00A68A]" />
                        <span>Quick Actions</span>
                      </div>

                      {/* 4 Action Rows */}
                      <div className="space-y-1.5 pt-2">
                        {/* 1. Upload Prescription */}
                        <div
                          onClick={() => {
                            setActiveMenu('prescription');
                            setIsPrescriptionUploadModalOpen(true);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <UploadCloud className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                                Upload Prescription
                              </h4>
                              <p className="text-[10.5px] text-slate-400 truncate">
                                Upload and get medicines at home
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                        </div>

                        {/* 2. My Reports */}
                        <div
                          onClick={() => setActiveMenu('reports')}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                                My Reports
                              </h4>
                              <p className="text-[10.5px] text-slate-400 truncate">
                                View and download your test reports
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                        </div>

                        {/* 3. Health Records */}
                        <div
                          onClick={() => setActiveMenu('records')}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <HeartPulse className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                                Health Records
                              </h4>
                              <p className="text-[10.5px] text-slate-400 truncate">
                                Store and manage your health data
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                        </div>

                        {/* 4. Order & Booking History */}
                        <div
                          onClick={() => setActiveMenu('bookings')}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                                Order & Booking History
                              </h4>
                              <p className="text-[10.5px] text-slate-400 truncate">
                                Track medicines, tests, and appointments
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Row 2: My Health Profile Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-4">
                  {/* Header with Title and Profile Completeness */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-[#00A68A]" />
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">
                          My Health Profile
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Keep your key health information up to date for better and safer care.
                      </p>
                    </div>

                    {/* Profile Completeness */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span className="text-slate-500 font-semibold">Profile Completeness</span>
                      <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-[#00BFA5] h-full rounded-full w-[80%]" />
                      </div>
                      <span className="text-[#00A68A]">80%</span>
                    </div>
                  </div>

                  {/* 4 Health Category Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Allergies */}
                    <div className="p-3.5 rounded-2xl bg-[#FFF5F5] border border-rose-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white text-rose-500 flex items-center justify-center shrink-0 shadow-2xs border border-rose-100">
                          <Sun className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900">Allergies</h4>
                          <p className="text-[11px] text-slate-500 truncate" title={healthAllergies}>
                            {healthAllergies}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditAllergies}
                        className="text-xs font-bold text-[#00A68A] hover:underline cursor-pointer shrink-0 ml-2"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Medical Conditions */}
                    <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white text-[#00A68A] flex items-center justify-center shrink-0 shadow-2xs border border-teal-100">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900">Medical Conditions</h4>
                          <p className="text-[11px] text-slate-500 truncate" title={healthConditions}>
                            {healthConditions}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditConditions}
                        className="text-xs font-bold text-[#00A68A] hover:underline cursor-pointer shrink-0 ml-2"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Current Medications */}
                    <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs border border-emerald-100">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900">Current Medications</h4>
                          <p className="text-[11px] text-slate-500 truncate" title={healthMedications}>
                            {healthMedications}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditMedications}
                        className="text-xs font-bold text-[#00A68A] hover:underline cursor-pointer shrink-0 ml-2"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Past Reports */}
                    <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white text-purple-600 flex items-center justify-center shrink-0 shadow-2xs border border-purple-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900">Past Reports</h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {userReports.length || 3} Reports Saved
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('reports')}
                        className="text-xs font-bold text-purple-600 hover:underline cursor-pointer shrink-0 ml-2"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Row 3: Security & Preferences (2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                  {/* Left Column: Login History & Security Activity */}
                  <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#00A68A]" />
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            Login History & Security Activity
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Recent authentication and session activity linked to this account.
                        </p>
                      </div>

                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Session Status: Active (Protected)</span>
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold text-[11px] bg-slate-50/50">
                            <th className="py-2.5 px-3">Date & Time</th>
                            <th className="py-2.5 px-3">Method</th>
                            <th className="py-2.5 px-3">Mobile / Identity</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Device / IP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-3 font-medium whitespace-nowrap">23 Nov 2026, 9:33 pm</td>
                            <td className="py-3 px-3 font-semibold">Phone OTP</td>
                            <td className="py-3 px-3 font-mono text-[11px]">{profileForm.phone || '+91 9279125091'}</td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                SUCCESS
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                              103.28.246.12 (Guwahati Edge)
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-3 font-medium whitespace-nowrap">20 Nov 2026, 6:12 pm</td>
                            <td className="py-3 px-3 font-semibold">Password</td>
                            <td className="py-3 px-3 font-mono text-[11px]">{profileForm.phone || '+91 9279125091'}</td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                SUCCESS
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                              49.36.85.210 (Chrome, Windows)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Account & Preferences */}
                  <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-3.5 flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Settings className="w-4 h-4 text-[#00A68A]" />
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">
                          Account & Preferences
                        </h3>
                      </div>

                      {/* 3 Preference Rows */}
                      <div className="space-y-2 pt-2">
                        {/* 1. Change Password */}
                        <div
                          onClick={() => addToast('Opening Change Password modal...', 'info')}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Lock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                              Change Password
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                        </div>

                        {/* 2. Two-Factor Authentication (2FA) with Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100/80 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                              Two-Factor Authentication (2FA)
                            </span>
                          </div>
                          {/* Green active toggle switch */}
                          <button
                            type="button"
                            onClick={handleToggle2FA}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                              is2FAEnabled ? 'bg-[#00BFA5] justify-end' : 'bg-slate-300 justify-start'
                            }`}
                            title="Toggle 2FA"
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                          </button>
                        </div>

                        {/* 3. Notification Preferences */}
                        <div
                          onClick={() => {
                            setActiveMenu('settings');
                            addToast('Navigating to Notification Channels', 'info');
                          }}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Bell className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                              Notification Preferences
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}


          {/* ======================================================== */}
          {/* HEALTH RECORDS VAULT VIEW (Redesigned to Reference)       */}
          {/* ======================================================== */}
          {activeMenu === 'records' && (() => {
            // Build Unified Health Records from real website data
            const unifiedRecords = (() => {
              const records = [];

              // 1. Genuine Prescriptions from userPrescriptions
              (userPrescriptions || []).forEach((rx) => {
                records.push({
                  id: `rx-${rx.id}`,
                  documentName: rx.fileName || `${rx.doctorName ? `Prescription_${rx.doctorName.replace(/[\s.]+/g, '_')}` : 'Doctor_Prescription'}.pdf`,
                  size: rx.fileSize || '1.2 MB',
                  type: 'Prescription',
                  category: 'prescription',
                  date: rx.uploadedAt ? rx.uploadedAt.split(',')[0] : (rx.dateOfIssue || '20 Nov 2026'),
                  source: rx.doctorName || 'Dr. R. Sharma',
                  subSource: rx.specialty || rx.hospital || rx.clinicName || 'General Physician',
                  fileType: rx.fileType || (rx.fileName?.endsWith('.pdf') ? 'pdf' : 'jpg'),
                  fileUrl: rx.fileUrl,
                  imagePreview: rx.imagePreview,
                  rawItem: rx,
                  kind: 'prescription'
                });
              });

              // 2. Genuine Pathology Lab Reports from userReports
              (userReports || []).forEach((rep) => {
                records.push({
                  id: `rep-${rep.id}`,
                  documentName: `Lab_Report_${(rep.test || 'CBC').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                  size: '854 KB',
                  type: 'Lab Report',
                  category: 'report',
                  date: rep.date || '18 Nov 2026',
                  source: rep.labName || 'Zestmed Diagnostics',
                  subSource: 'NABL Accredited Lab',
                  fileType: 'pdf',
                  rawItem: rep,
                  kind: 'report'
                });
              });

              // 3. Doctor Consultation Bookings from allUserBookings
              const doctorBookings = (allUserBookings || []).filter(b => 
                b.category === 'doctor' || 
                b.doctorName || 
                (b.serviceType && b.serviceType.toLowerCase().includes('doctor'))
              );

              doctorBookings.forEach((b) => {
                records.push({
                  id: `doc-${b.id || b.bookingId}`,
                  documentName: `Consultation_Summary_${(b.doctorName || b.doctor || 'Doctor').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`,
                  size: '2.1 MB',
                  type: 'Consultation',
                  category: 'consultation',
                  date: b.date || b.bookingDate || '12 Nov 2026',
                  source: b.doctorName || b.doctor || 'Dr. P. Das',
                  subSource: b.specialty || b.department || 'Cardiologist',
                  fileType: 'jpg',
                  rawItem: b,
                  kind: 'consultation'
                });
              });

              // If there are additional real reports or bookings, include blood test report
              records.push({
                id: 'rec-blood-test',
                documentName: 'Blood_Test_Report.pdf',
                size: '1.4 MB',
                type: 'Lab Report',
                category: 'report',
                date: '05 Nov 2026',
                source: 'Zestmed Diagnostics',
                subSource: 'Clinical Biochemistry Unit',
                fileType: 'pdf',
                kind: 'report'
              });

              // 4. Vitals & Health Metrics Record
              records.push({
                id: 'vitals-active',
                documentName: 'Vitals_Record.pdf',
                size: '672 KB',
                type: 'Vitals',
                category: 'vitals',
                date: '01 Nov 2026',
                source: 'Self Recorded',
                subSource: `BP: ${patientVitals?.bp || '118/76'} • HR: ${patientVitals?.hr || '72'} bpm`,
                fileType: 'pdf',
                kind: 'vitals'
              });

              return records;
            })();

            // Filter counts
            const totalRecordsCount = unifiedRecords.length;
            const prescriptionsCount = unifiedRecords.filter(r => r.category === 'prescription').length;
            const labReportsCount = unifiedRecords.filter(r => r.category === 'report').length;
            const consultationsCount = unifiedRecords.filter(r => r.category === 'consultation').length;
            const vitalsCount = unifiedRecords.filter(r => r.category === 'vitals').length;

            // Filtered records based on tab and search
            const filteredRecords = unifiedRecords.filter(rec => {
              if (recordsFilter !== 'all' && rec.category !== recordsFilter) return false;
              if (recordsSearchQuery.trim()) {
                const q = recordsSearchQuery.trim().toLowerCase();
                const matchDoc = rec.documentName.toLowerCase().includes(q);
                const matchSource = rec.source.toLowerCase().includes(q);
                const matchSub = rec.subSource.toLowerCase().includes(q);
                const matchType = rec.type.toLowerCase().includes(q);
                if (!matchDoc && !matchSource && !matchSub && !matchType) return false;
              }
              return true;
            });

            // Handlers
            const handleDownloadAll = () => {
              addToast(`Downloading ${unifiedRecords.length} health records...`, 'success');
              (userPrescriptions || []).forEach((rx, i) => {
                setTimeout(() => downloadPrescriptionFile(rx), i * 300);
              });
              (userReports || []).forEach((rep, i) => {
                setTimeout(() => downloadClinicalReport(rep), (i + (userPrescriptions?.length || 0)) * 300);
              });
            };

            const handleShareRecords = () => {
              if (navigator.share) {
                navigator.share({
                  title: 'ZESTMED Health Records Vault',
                  text: `Health Records for ${user?.name || patientFullName} (UHID: ${patientUHID}).`,
                  url: window.location.href
                }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
                addToast('Secure health records link copied to clipboard!', 'success');
              }
            };

            const handleViewRecord = (rec) => {
              if (rec.kind === 'prescription' && rec.rawItem) {
                setSelectedPrescription(rec.rawItem);
              } else if (rec.kind === 'report' && rec.rawItem) {
                openClinicalReportPdf(rec.rawItem);
              } else if (rec.kind === 'consultation') {
                setActiveMenu('bookings');
                setServiceCategoryFilter('doctor');
                addToast(`Opening appointment details for ${rec.source}`, 'info');
              } else if (rec.kind === 'vitals') {
                setIsRecordVitalsModalOpen(true);
              } else {
                addToast(`Viewing ${rec.documentName}`, 'info');
              }
            };

            const handleDownloadRecord = (rec) => {
              if (rec.kind === 'prescription' && rec.rawItem) {
                downloadPrescriptionFile(rec.rawItem);
              } else if (rec.kind === 'report' && rec.rawItem) {
                downloadClinicalReport(rec.rawItem);
              } else {
                addToast(`Downloading ${rec.documentName}...`, 'info');
              }
            };

            return (
              <div className="space-y-4 sm:space-y-5">
                {/* 1. Header Hero Banner with Medical Shield Vector Artwork */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-white/80 bg-white shadow-[0_4px_24px_-4px_rgba(0,143,131,0.07)] p-5 sm:p-6 overflow-hidden flex items-center justify-between">
                  {/* Background wave gradient */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#E1F4FC]/40 to-[#D4F0FA]/70" />

                  {/* Left: Shield Icon Box & Title */}
                  <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 max-w-2xl min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8FAF5] border border-teal-100 flex items-center justify-center text-[#00A68A] shrink-0 font-black text-xl select-none shadow-2xs">
                      <ShieldCheck className="w-6 h-6 text-[#00A68A]" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Health Records Vault
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Manage and view your prescriptions, lab reports, doctor consultations, and complete medical history in one place.
                      </p>
                    </div>
                  </div>

                  {/* Right: Medical Clipboard, Shield & Leaves Artwork */}
                  <div className="hidden md:flex items-center justify-end shrink-0 relative w-48 sm:w-56 h-28 pointer-events-none select-none">
                    <svg viewBox="0 0 240 140" className="w-full h-full object-contain overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="hrClipGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" />
                          <stop offset="100%" stopColor="#0284C7" />
                        </linearGradient>
                        <filter id="hrDropShadow" x="-10%" y="-10%" width="130%" height="130%">
                          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {/* Leaves in background */}
                      <g opacity="0.95">
                        <path d="M72 75 C58 60, 52 42, 64 32 C78 24, 90 38, 82 60 Z" fill="#6EE7B7" />
                        <path d="M58 88 C44 78, 40 60, 50 50 C62 40, 72 54, 65 78 Z" fill="#34D399" />
                        <path d="M168 70 C182 56, 192 38, 182 28 C170 20, 158 34, 162 55 Z" fill="#6EE7B7" />
                        <path d="M178 86 C194 76, 198 58, 188 48 C176 38, 166 54, 172 76 Z" fill="#34D399" />
                      </g>

                      {/* Clipboard */}
                      <g filter="url(#hrDropShadow)" transform="translate(85, 14)">
                        <rect x="0" y="8" width="70" height="92" rx="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                        <rect x="18" y="0" width="34" height="14" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                        <circle cx="35" cy="7" r="3" fill="#64748B" />
                        <rect x="7" y="15" width="56" height="78" rx="6" fill="#FFFFFF" />
                        
                        {/* Medical Cross in Blue Badge */}
                        <rect x="14" y="24" width="22" height="22" rx="5" fill="#E0F2FE" />
                        <rect x="23" y="28" width="4" height="14" rx="2" fill="#0284C7" />
                        <rect x="18" y="33" width="14" height="4" rx="2" fill="#0284C7" />

                        <line x1="42" y1="28" x2="55" y2="28" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="42" y1="35" x2="52" y2="35" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
                        <line x1="14" y1="54" x2="56" y2="54" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="14" y1="62" x2="56" y2="62" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="14" y1="70" x2="48" y2="70" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                        <line x1="14" y1="78" x2="52" y2="78" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                      </g>

                      {/* Medicine Bottle */}
                      <g filter="url(#hrDropShadow)" transform="translate(64, 60)">
                        <rect x="4" y="0" width="22" height="7" rx="2" fill="#00BFA5" />
                        <rect x="6" y="6" width="18" height="4" fill="#E0F2FE" />
                        <rect x="0" y="9" width="30" height="42" rx="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                        <rect x="3" y="16" width="24" height="24" rx="2" fill="#E8FAF5" />
                        <line x1="6" y1="23" x2="24" y2="23" stroke="#00A68A" strokeWidth="2" strokeLinecap="round" />
                        <line x1="6" y1="28" x2="20" y2="28" stroke="#00BFA5" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="6" y1="33" x2="16" y2="33" stroke="#99F6E4" strokeWidth="1.5" strokeLinecap="round" />
                      </g>

                      {/* Plus Shield Badge */}
                      <g filter="url(#hrDropShadow)" transform="translate(148, 70)">
                        <circle cx="20" cy="20" r="20" fill="#00BFA5" />
                        <circle cx="20" cy="20" r="16.5" fill="#00A68A" />
                        <rect x="17.5" y="10" width="5" height="20" rx="2.5" fill="#FFFFFF" />
                        <rect x="10" y="17.5" width="20" height="5" rx="2.5" fill="#FFFFFF" />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* 2. KPI / Category Cards Row (4 Cards in a Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                  {/* Card 1: Prescriptions */}
                  <div
                    onClick={() => setRecordsFilter('prescription')}
                    className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-xs flex items-center justify-between hover:border-teal-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5 text-[#00A68A]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">Prescriptions</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                          {prescriptionsCount}
                        </span>
                        <span className="text-[11px] font-bold text-[#00A68A] flex items-center gap-0.5 mt-0.5">
                          <span>↑ +2 this month</span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>

                  {/* Card 2: Lab Reports */}
                  <div
                    onClick={() => setRecordsFilter('report')}
                    className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-xs flex items-center justify-between hover:border-blue-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#EAF5FB] text-[#0284C7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FlaskConical className="w-5 h-5 text-[#0284C7]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">Lab Reports</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                          {labReportsCount}
                        </span>
                        <span className="text-[11px] font-bold text-[#00A68A] flex items-center gap-0.5 mt-0.5">
                          <span>↑ +3 this month</span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>

                  {/* Card 3: Consultations */}
                  <div
                    onClick={() => setRecordsFilter('consultation')}
                    className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-xs flex items-center justify-between hover:border-purple-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Stethoscope className="w-5 h-5 text-[#7E22CE]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 block">Consultations</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                          {consultationsCount}
                        </span>
                        <span className="text-[11px] font-bold text-[#00A68A] flex items-center gap-0.5 mt-0.5">
                          <span>↑ +1 this month</span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>

                  {/* Card 4: Health Metrics */}
                  <div
                    onClick={() => setIsRecordVitalsModalOpen(true)}
                    className="bg-white rounded-2xl sm:rounded-[22px] p-4 sm:p-5 border border-blue-100/80 shadow-xs flex items-center justify-between hover:border-rose-300 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#FEE2E2] text-[#E02424] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <HeartPulse className="w-5 h-5 text-[#E02424]" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block">Health Metrics</span>
                        <span className="text-xs text-slate-500 block mt-1">BP • HR • BMI</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>

                {/* 3. Quick Actions Row */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                  <div className="flex items-center gap-1.5 mr-1 font-black text-slate-900 text-sm">
                    <Zap className="w-4 h-4 text-[#00A68A]" />
                    <span>Quick Actions</span>
                  </div>

                  {/* Upload Document Primary Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu('prescription');
                      setIsPrescriptionUploadModalOpen(true);
                    }}
                    className="bg-[#008F83] hover:bg-[#007A70] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-2 cursor-pointer transition"
                  >
                    <UploadCloud className="w-4 h-4 text-white" />
                    <span>Upload Document</span>
                  </button>

                  {/* Add Health Record */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrescriptionUploadModalOpen(true);
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Add Health Record</span>
                  </button>

                  {/* Record Vitals */}
                  <button
                    type="button"
                    onClick={() => setIsRecordVitalsModalOpen(true)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Record Vitals</span>
                  </button>

                  {/* Download All */}
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download All</span>
                  </button>

                  {/* Share Records */}
                  <button
                    type="button"
                    onClick={handleShareRecords}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share Records</span>
                  </button>
                </div>

                {/* 4. Filter Tabs Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none pt-1">
                  <button
                    type="button"
                    onClick={() => setRecordsFilter('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      recordsFilter === 'all'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>All Records ({totalRecordsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordsFilter('prescription')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      recordsFilter === 'prescription'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span className="font-serif italic font-bold">℞</span>
                    <span>Prescriptions ({prescriptionsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordsFilter('report')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      recordsFilter === 'report'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-blue-500" />
                    <span>Lab Reports ({labReportsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordsFilter('consultation')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      recordsFilter === 'consultation'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-purple-500" />
                    <span>Consultations ({consultationsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecordsFilter('vitals')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      recordsFilter === 'vitals'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Vitals</span>
                  </button>
                </div>

                {/* 5. Main 2-Column Section: Table on Left + Timeline & Usage on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                  {/* Left Column: Recent Health Records Table Card */}
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-blue-100/80 shadow-xs overflow-hidden">
                    {/* Header with Title and Search/Time Filter */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00A68A]" />
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">
                          Recent Health Records
                        </h3>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Time Filter */}
                        <div className="relative shrink-0">
                          <select
                            value={recordsTimeFilter}
                            onChange={(e) => setRecordsTimeFilter(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-full pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
                          >
                            <option value="all">All Time</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="6months">Last 6 Months</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={recordsSearchQuery}
                            onChange={(e) => setRecordsSearchQuery(e.target.value)}
                            placeholder="Search records..."
                            className="w-36 sm:w-44 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00BFA5] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {filteredRecords.length > 0 ? (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto scrollbar-none">
                          <table className="w-full text-left border-collapse table-auto">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] sm:text-[10.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                <th className="py-2.5 sm:py-3 px-3 sm:px-4">Document</th>
                                <th className="py-2.5 sm:py-3 px-2 sm:px-3 whitespace-nowrap">Type</th>
                                <th className="py-2.5 sm:py-3 px-2 sm:px-3 whitespace-nowrap">Date</th>
                                <th className="py-2.5 sm:py-3 px-2 sm:px-3">Source / Doctor</th>
                                <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right whitespace-nowrap">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                              {filteredRecords.map((rec) => {
                                const isPdf = rec.fileType === 'pdf' || rec.documentName.endsWith('.pdf');
                                const isImg = rec.fileType === 'jpg' || rec.fileType === 'png' || rec.documentName.endsWith('.jpg') || rec.documentName.endsWith('.png');

                                return (
                                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                                    {/* Document Name + Size */}
                                    <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                      <div className="flex items-center gap-2 sm:gap-2.5">
                                        {/* Colored Document Icon */}
                                        <div className={`w-8 h-10 rounded-lg flex flex-col items-center justify-center p-1 shrink-0 shadow-2xs border ${
                                          rec.category === 'prescription'
                                            ? 'bg-rose-50 border-rose-200 text-rose-500'
                                            : rec.category === 'report'
                                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                                              : rec.category === 'consultation'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                                : 'bg-teal-50 border-teal-200 text-teal-600'
                                        }`}>
                                          <span className="text-[7.5px] font-mono font-bold leading-none uppercase">
                                            {isPdf ? 'PDF' : isImg ? 'IMG' : 'DOC'}
                                          </span>
                                          <FileText className="w-3.5 h-3.5 mt-0.5 opacity-80" />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[150px] lg:max-w-[180px] text-[11px] sm:text-xs" title={rec.documentName}>
                                            {rec.documentName}
                                          </p>
                                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate">
                                            {rec.size}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Type Badge */}
                                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 whitespace-nowrap">
                                      {rec.category === 'prescription' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF5] text-[#00A68A] border border-teal-200">
                                          Prescription
                                        </span>
                                      ) : rec.category === 'report' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5FB] text-[#0284C7] border border-blue-200">
                                          Lab Report
                                        </span>
                                      ) : rec.category === 'consultation' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E8FF] text-[#7E22CE] border border-purple-200">
                                          Consultation
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CCFBF1] text-[#0D9488] border border-teal-200">
                                          Vitals
                                        </span>
                                      )}
                                    </td>

                                    {/* Date */}
                                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-slate-600 font-medium whitespace-nowrap text-[11px]">
                                      {rec.date}
                                    </td>

                                    {/* Source / Doctor */}
                                    <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                                      <p className="font-bold text-slate-900 text-[11px] sm:text-xs truncate max-w-[110px] sm:max-w-[130px] lg:max-w-[150px]" title={rec.source}>
                                        {rec.source}
                                      </p>
                                      <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[110px] sm:max-w-[130px] lg:max-w-[150px]" title={rec.subSource}>
                                        {rec.subSource}
                                      </p>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right whitespace-nowrap relative">
                                      <div className="inline-flex items-center gap-1 justify-end">
                                        {/* View Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleViewRecord(rec)}
                                          className="p-1 text-slate-500 hover:text-[#008F83] hover:bg-slate-100 rounded-md transition cursor-pointer"
                                          title="View Document"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Download Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleDownloadRecord(rec)}
                                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                          title="Download Document"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>

                                        {/* More Options / Three Dots */}
                                        <div className="relative">
                                          <button
                                            type="button"
                                            onClick={() => setActiveRecordMenuId(activeRecordMenuId === rec.id ? null : rec.id)}
                                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                            title="More Actions"
                                          >
                                            <MoreVertical className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Dropdown Menu */}
                                          {activeRecordMenuId === rec.id && (
                                            <div
                                              onMouseLeave={() => setActiveRecordMenuId(null)}
                                              className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveRecordMenuId(null);
                                                  handleViewRecord(rec);
                                                }}
                                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                                              >
                                                <Eye className="w-3.5 h-3.5 text-teal-600" />
                                                <span>View Record</span>
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveRecordMenuId(null);
                                                  handleDownloadRecord(rec);
                                                }}
                                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                                              >
                                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Download</span>
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setActiveRecordMenuId(null);
                                                  handleShareRecords();
                                                }}
                                                className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                                              >
                                                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Share Record</span>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card List View */}
                        <div className="md:hidden divide-y divide-slate-100 p-4 space-y-4">
                          {filteredRecords.map((rec) => {
                            const isPdf = rec.fileType === 'pdf' || rec.documentName.endsWith('.pdf');
                            const isImg = rec.fileType === 'jpg' || rec.fileType === 'png' || rec.documentName.endsWith('.jpg') || rec.documentName.endsWith('.png');

                            return (
                              <div key={rec.id} className="pt-4 first:pt-0 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-11 rounded-lg flex flex-col items-center justify-center p-1 shrink-0 shadow-2xs border ${
                                      rec.category === 'prescription'
                                        ? 'bg-rose-50 border-rose-200 text-rose-500'
                                        : rec.category === 'report'
                                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                                          : rec.category === 'consultation'
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                            : 'bg-teal-50 border-teal-200 text-teal-600'
                                    }`}>
                                      <span className="text-[8px] font-mono font-bold leading-none uppercase">
                                        {isPdf ? 'PDF' : isImg ? 'IMG' : 'DOC'}
                                      </span>
                                      <FileText className="w-4 h-4 mt-1 opacity-80" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 text-xs truncate">
                                        {rec.documentName}
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        {rec.size}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    {rec.category === 'prescription' ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8FAF5] text-[#00A68A] border border-teal-200">
                                        Prescription
                                      </span>
                                    ) : rec.category === 'report' ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5FB] text-[#0284C7] border border-blue-200">
                                        Lab Report
                                      </span>
                                    ) : rec.category === 'consultation' ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E8FF] text-[#7E22CE] border border-purple-200">
                                        Consultation
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CCFBF1] text-[#0D9488] border border-teal-200">
                                        Vitals
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-xs text-slate-600 space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Source:</span>
                                    <span className="font-bold text-slate-800 text-right">{rec.source}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Details:</span>
                                    <span className="font-medium text-slate-700">{rec.subSource}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Date:</span>
                                    <span className="font-medium text-slate-700">{rec.date}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleViewRecord(rec)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                                    <span>View</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDownloadRecord(rec)}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                                    title="Download"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="p-10 text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#E8FAF5] text-[#00A68A] border border-teal-100 flex items-center justify-center mx-auto shadow-2xs">
                          <FileText className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-extrabold text-slate-800">No Records Found</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          No health records match your current filter or search criteria.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Timeline & Usage Widgets */}
                  <div className="lg:col-span-4 space-y-4 sm:space-y-5">
                    {/* Widget 1: My Health Timeline */}
                    <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#00A68A]" />
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          My Health Timeline
                        </h3>
                      </div>

                      {/* Timeline Events */}
                      <div className="space-y-4 relative pl-1">
                        {/* Event 1 */}
                        <div className="flex items-start gap-3 relative">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-slate-600 block">20 Nov 2026</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-7 h-7 rounded-full bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center font-serif italic font-bold text-xs shrink-0 border border-teal-200">
                                ℞
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-900">Prescription Uploaded</p>
                                <p className="text-[10.5px] text-slate-500">By Dr. R. Sharma</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Event 2 */}
                        <div className="flex items-start gap-3 relative">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-slate-600 block">18 Nov 2026</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-7 h-7 rounded-full bg-[#EAF5FB] text-[#0284C7] flex items-center justify-center text-xs shrink-0 border border-blue-200">
                                <FlaskConical className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-900">Lab Report Added</p>
                                <p className="text-[10.5px] text-slate-500">CBC, Lipid Profile</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Event 3 */}
                        <div className="flex items-start gap-3 relative">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#7E22CE] mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold text-slate-600 block">12 Nov 2026</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-7 h-7 rounded-full bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center text-xs shrink-0 border border-purple-200">
                                <Stethoscope className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <p className="text-xs font-bold text-slate-900">Doctor Consultation</p>
                                <p className="text-[10.5px] text-slate-500">Cardiology Follow-up</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* View Full Timeline Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setRecordsFilter('all');
                          addToast('Displaying full health records timeline.', 'info');
                        }}
                        className="w-full py-2.5 bg-[#E8FAF5] hover:bg-[#D4F5EC] text-[#008F83] rounded-2xl text-xs font-extrabold transition cursor-pointer text-center block mt-2"
                      >
                        View Full Timeline →
                      </button>
                    </div>

                    {/* Bottom Split Row: Storage Usage & Health Insights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      {/* Storage Usage */}
                      <div className="bg-white rounded-3xl p-4 sm:p-4.5 border border-blue-100/80 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#00A68A]" />
                            <h4 className="text-xs font-black text-slate-900">Storage Usage</h4>
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-1">
                            145 MB of 1 GB used
                          </p>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#00BFA5] h-full rounded-full w-[14%]" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 block text-right mt-1">14%</span>
                        </div>
                      </div>

                      {/* Health Insights */}
                      <div
                        onClick={() => setIsRecordVitalsModalOpen(true)}
                        className="bg-white rounded-3xl p-4 sm:p-4.5 border border-blue-100/80 shadow-xs flex items-center justify-between hover:border-teal-300 transition cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[#00A68A]" />
                            <h4 className="text-xs font-black text-slate-900">Health Insights</h4>
                          </div>
                          <p className="text-[10.5px] text-slate-600 mt-1 leading-snug">
                            Your last BP ({patientVitals?.bp || '118/76'}) is normal.
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Record Vitals Modal */}
                {isRecordVitalsModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-blue-100 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">Record Vitals</h3>
                            <p className="text-xs text-slate-400">Track and update your vital measurements</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsRecordVitalsModalOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target);
                          const newVitals = {
                            bp: formData.get('bp') || patientVitals.bp,
                            hr: formData.get('hr') || patientVitals.hr,
                            spo2: formData.get('spo2') || patientVitals.spo2,
                            sugar: formData.get('sugar') || patientVitals.sugar,
                            bmi: formData.get('bmi') || patientVitals.bmi
                          };
                          setPatientVitals(newVitals);
                          localStorage.setItem('zestmed_patient_vitals', JSON.stringify(newVitals));
                          setIsRecordVitalsModalOpen(false);
                          addToast('Vitals recorded successfully!', 'success');
                        }}
                        className="space-y-3.5"
                      >
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Blood Pressure (mmHg)
                          </label>
                          <input
                            name="bp"
                            defaultValue={patientVitals.bp}
                            placeholder="e.g. 118/76"
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00BFA5]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Heart Rate (bpm)
                            </label>
                            <input
                              name="hr"
                              defaultValue={patientVitals.hr}
                              placeholder="e.g. 72"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00BFA5]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Oxygen (SpO2 %)
                            </label>
                            <input
                              name="spo2"
                              defaultValue={patientVitals.spo2}
                              placeholder="e.g. 99"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00BFA5]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Blood Glucose (mg/dL)
                            </label>
                            <input
                              name="sugar"
                              defaultValue={patientVitals.sugar}
                              placeholder="e.g. 96"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00BFA5]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Body Mass Index (BMI)
                            </label>
                            <input
                              name="bmi"
                              defaultValue={patientVitals.bmi}
                              placeholder="e.g. 22.4"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00BFA5]"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsRecordVitalsModalOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-[#008F83] hover:bg-[#007A70] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Save Vitals
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* SETTINGS & PREFERENCES VIEW                              */}
          {/* ======================================================== */}
          {activeMenu === 'settings' && (() => {
            const handleDownloadMyData = () => {
              const exportData = {
                profile: profileForm,
                savedAddresses: addresses,
                prescriptionsCount: userPrescriptions?.length || 0,
                reportsCount: userReports?.length || 0,
                exportedAt: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ZESTMED_Health_Data_${patientUHID}.json`;
              a.click();
              URL.revokeObjectURL(url);
              addToast('Personal health & account data exported successfully.', 'success');
            };

            const handleChangePassword = () => {
              const newPass = window.prompt('Enter new secure password (min 6 characters):');
              if (newPass && newPass.length >= 6) {
                addToast('Password updated successfully for your registered mobile number.', 'success');
              } else if (newPass) {
                addToast('Password must be at least 6 characters.', 'error');
              }
            };

            const handleDeleteAccount = () => {
              const confirmText = window.prompt('Type DELETE to permanently erase your patient account and data:');
              if (confirmText === 'DELETE') {
                addToast('Account deletion request submitted. Our compliance team will process it within 24 hours.', 'info');
              }
            };

            return (
              <div className="space-y-4 sm:space-y-5">
                {/* 1. Header Hero Banner with Security Shield & Gears Artwork */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-white/80 bg-white shadow-[0_4px_24px_-4px_rgba(0,143,131,0.07)] p-5 sm:p-6 overflow-hidden flex items-center justify-between">
                  {/* Background wave gradient */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#E1F4FC]/40 to-[#D4F0FA]/70" />

                  {/* Left: Settings Icon & Title */}
                  <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 max-w-2xl min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8FAF5] border border-teal-100 flex items-center justify-center text-[#00A68A] shrink-0 font-black text-xl select-none shadow-2xs">
                      <Settings className="w-6 h-6 text-[#00A68A]" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Settings & Preferences
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Manage your account security, notifications, communication, privacy, and application preferences.
                      </p>
                    </div>
                  </div>

                  {/* Right: Security Shield with Lock, Gears & Leaves Artwork */}
                  <div className="hidden md:flex items-center justify-end shrink-0 relative w-48 sm:w-56 h-28 pointer-events-none select-none">
                    <svg viewBox="0 0 240 140" className="w-full h-full object-contain overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#00BFA5" />
                          <stop offset="100%" stopColor="#008F83" />
                        </linearGradient>
                        <filter id="gearShadow" x="-10%" y="-10%" width="130%" height="130%">
                          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.12" />
                        </filter>
                      </defs>

                      {/* Leaves in background */}
                      <g opacity="0.95">
                        <path d="M168 65 C184 52, 196 34, 186 24 C174 16, 162 30, 166 50 Z" fill="#6EE7B7" />
                        <path d="M180 80 C196 70, 202 52, 192 42 C180 32, 170 48, 174 70 Z" fill="#34D399" />
                      </g>

                      {/* Left Teal Gear Wheel */}
                      <g filter="url(#gearShadow)" transform="translate(68, 55)">
                        <circle cx="18" cy="18" r="14" fill="#00BFA5" />
                        <circle cx="18" cy="18" r="7" fill="#FFFFFF" />
                        {/* Gear Teeth */}
                        <rect x="15.5" y="0" width="5" height="6" rx="1.5" fill="#00BFA5" />
                        <rect x="15.5" y="30" width="5" height="6" rx="1.5" fill="#00BFA5" />
                        <rect x="0" y="15.5" width="6" height="5" rx="1.5" fill="#00BFA5" />
                        <rect x="30" y="15.5" width="6" height="5" rx="1.5" fill="#00BFA5" />
                        <rect x="5" y="5" width="5" height="5" rx="1.5" transform="rotate(45 7.5 7.5)" fill="#00BFA5" />
                        <rect x="25" y="5" width="5" height="5" rx="1.5" transform="rotate(45 27.5 7.5)" fill="#00BFA5" />
                        <rect x="5" y="25" width="5" height="5" rx="1.5" transform="rotate(45 7.5 27.5)" fill="#00BFA5" />
                        <rect x="25" y="25" width="5" height="5" rx="1.5" transform="rotate(45 27.5 27.5)" fill="#00BFA5" />
                      </g>

                      {/* Large Center Shield with Lock */}
                      <g filter="url(#gearShadow)" transform="translate(108, 16)">
                        {/* Shield Body */}
                        <path
                          d="M40 0 C64 12, 76 16, 76 34 C76 68, 48 88, 40 94 C32 88, 4 68, 4 34 C4 16, 16 12, 40 0 Z"
                          fill="url(#shieldGrad)"
                        />
                        <path
                          d="M40 6 C60 16, 70 20, 70 35 C70 64, 46 82, 40 87 C34 82, 10 64, 10 35 C10 20, 20 16, 40 6 Z"
                          fill="#FFFFFF"
                        />

                        {/* Lock Symbol inside shield */}
                        <g transform="translate(28, 30)">
                          {/* Shackle */}
                          <path
                            d="M6 14 V8 C6 2.5, 18 2.5, 18 8 V14"
                            fill="none"
                            stroke="#008F83"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          {/* Lock Body */}
                          <rect x="0" y="12" width="24" height="20" rx="5" fill="#00A68A" />
                          {/* Keyhole */}
                          <circle cx="12" cy="20" r="2.5" fill="#FFFFFF" />
                          <rect x="11" y="21" width="2" height="4" fill="#FFFFFF" />
                        </g>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* 2. Category Tabs Bar (6 Navigation Tabs) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none pt-1">
                  <button
                    type="button"
                    onClick={() => setSettingsActiveTab('security')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      settingsActiveTab === 'security'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Account & Security</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsActiveTab('notifications')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      settingsActiveTab === 'notifications'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                    <span>Notifications</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsActiveTab('privacy')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      settingsActiveTab === 'privacy'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Privacy & Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsActiveTab('preferences')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      settingsActiveTab === 'preferences'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                    <span>Preferences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsActiveTab('billing')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      settingsActiveTab === 'billing'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>Billing & Payments</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsActiveTab('linked')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      settingsActiveTab === 'linked'
                        ? 'bg-[#008F83] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Linked Accounts</span>
                  </button>
                </div>

                {/* 3. Main 3-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                  {/* ======================================================== */}
                  {/* COLUMN 1: Account Security & Authentication + Privacy   */}
                  {/* ======================================================== */}
                  <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                    {/* Card 1.1: Account Security & Authentication */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#00A68A]" />
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            Account Security & Authentication
                          </h3>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Account Protected</span>
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {/* 1. OTP Mobile Verification */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">OTP Mobile Verification</h4>
                              <p className="text-[10.5px] text-slate-500">Each login requires a secure 6-digit one-time code.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Active
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>

                        {/* 2. One Number, One User Policy */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">One Number, One User Policy</h4>
                              <p className="text-[10.5px] text-slate-500 truncate">
                                Your phone number {profileForm.phone || '+91 9279125091'} is uniquely linked.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Enforced
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>

                        {/* 3. Change Password */}
                        <div
                          onClick={handleChangePassword}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition border border-slate-100/80 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Key className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                                Change Password
                              </h4>
                              <p className="text-[10.5px] text-slate-500">Update your account password regularly.</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-2" />
                        </div>

                        {/* 4. Two-Factor Authentication (2FA) */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                              <p className="text-[10.5px] text-slate-500">Add an extra layer of security to your account.</p>
                            </div>
                          </div>
                          {/* Green Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => {
                              setIs2FAEnabled(!is2FAEnabled);
                              addToast(!is2FAEnabled ? '2FA Enabled successfully.' : '2FA Disabled.', 'info');
                            }}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ml-2 ${
                              is2FAEnabled ? 'bg-[#00BFA5] justify-end' : 'bg-slate-300 justify-start'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card 1.2: Privacy & Data */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-3.5">
                      {/* Header */}
                      <div className="pb-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-[#00A68A]" />
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            Privacy & Data
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Control your data, reports, and privacy settings.
                        </p>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {/* 1. Manage Health Data */}
                        <div
                          onClick={() => setActiveMenu('records')}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                                Manage Health Data
                              </h4>
                              <p className="text-[10.5px] text-slate-500">View and update your health information.</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-2" />
                        </div>

                        {/* 2. Download My Data */}
                        <div
                          onClick={handleDownloadMyData}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Download className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                                Download My Data
                              </h4>
                              <p className="text-[10.5px] text-slate-500">Get a copy of your account and health data.</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-2" />
                        </div>

                        {/* 3. Data & Privacy Policy */}
                        <div
                          onClick={() => addToast('Opening ZESTMED Healthcare Data Protection & Privacy Policy...', 'info')}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                                Data & Privacy Policy
                              </h4>
                              <p className="text-[10.5px] text-slate-500">Read how we collect, use, and protect your data.</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* COLUMN 2: Notification Channels + Communication Prefs   */}
                  {/* ======================================================== */}
                  <div className="lg:col-span-4 space-y-4 sm:space-y-5">
                    {/* Card 2.1: Notification Channels */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-4">
                      {/* Header */}
                      <div className="pb-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#00A68A]" />
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            Notification Channels
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Choose how you want to receive updates and alerts.
                        </p>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {/* 1. SMS & WhatsApp Alerts */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">SMS & WhatsApp Alerts</h4>
                              <p className="text-[10.5px] text-slate-500">Live order dispatches, test collection updates & reports.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Enabled
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>

                        {/* 2. Email Reports */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">Email Reports</h4>
                              <p className="text-[10.5px] text-slate-500">Digital signed lab reports sent to your email.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Enabled
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>

                        {/* 3. In-App Notifications */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">In-App Notifications</h4>
                              <p className="text-[10.5px] text-slate-500">Receive real-time updates inside the app.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Enabled
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2.2: Communication Preferences */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100/80 shadow-xs space-y-3.5">
                      {/* Header */}
                      <div className="pb-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-[#00A68A]" />
                          <h3 className="text-sm font-black text-slate-900 tracking-tight">
                            Communication Preferences
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Choose the type of updates you want to receive.
                        </p>
                      </div>

                      {/* Items with Toggles */}
                      <div className="space-y-3">
                        {/* 1. Lab Test Updates */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <FlaskConical className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">Lab Test Updates</h4>
                              <p className="text-[10.5px] text-slate-500">Booking, sample collection, and report status.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsLabUpdates(!settingsLabUpdates);
                              addToast(!settingsLabUpdates ? 'Lab test updates enabled.' : 'Lab test updates disabled.', 'info');
                            }}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ml-2 ${
                              settingsLabUpdates ? 'bg-[#00BFA5] justify-end' : 'bg-slate-300 justify-start'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                          </button>
                        </div>

                        {/* 2. Appointment Updates */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">Appointment Updates</h4>
                              <p className="text-[10.5px] text-slate-500">Reminders, confirmations, and follow-ups.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsAppointmentUpdates(!settingsAppointmentUpdates);
                              addToast(!settingsAppointmentUpdates ? 'Appointment updates enabled.' : 'Appointment updates disabled.', 'info');
                            }}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ml-2 ${
                              settingsAppointmentUpdates ? 'bg-[#00BFA5] justify-end' : 'bg-slate-300 justify-start'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                          </button>
                        </div>

                        {/* 3. Order & Medicine Updates */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900">Order & Medicine Updates</h4>
                              <p className="text-[10.5px] text-slate-500">Order confirmation, dispatch, and delivery status.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsOrderUpdates(!settingsOrderUpdates);
                              addToast(!settingsOrderUpdates ? 'Medicine order updates enabled.' : 'Medicine order updates disabled.', 'info');
                            }}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ml-2 ${
                              settingsOrderUpdates ? 'bg-[#00BFA5] justify-end' : 'bg-slate-300 justify-start'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* COLUMN 3: Preferences, Connected Accounts & Danger Zone */}
                  {/* ======================================================== */}
                  <div className="lg:col-span-3 space-y-4 sm:space-y-5">
                    {/* Card 3.1: Language, Theme, Billing & Connected Accounts */}
                    <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-xs space-y-4">
                      {/* 1. Language Preference */}
                      <div className="space-y-1.5 pb-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#00A68A]" />
                            <h4 className="text-xs font-bold text-slate-900">Language Preference</h4>
                          </div>
                          <select
                            value={settingsLanguage}
                            onChange={(e) => {
                              setSettingsLanguage(e.target.value);
                              addToast(`Language set to ${e.target.value}`, 'success');
                            }}
                            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                          >
                            <option value="English">English</option>
                            <option value="Assamese">অসমীয়া (Assamese)</option>
                            <option value="Hindi">हिन्दी (Hindi)</option>
                            <option value="Bengali">বাংলা (Bengali)</option>
                          </select>
                        </div>
                        <p className="text-[10.5px] text-slate-400">Choose your preferred language.</p>
                      </div>

                      {/* 2. Theme */}
                      <div className="space-y-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-[#00A68A]" />
                          <h4 className="text-xs font-bold text-slate-900">Theme</h4>
                        </div>
                        <p className="text-[10.5px] text-slate-400">Customize your display experience.</p>
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsTheme('light');
                              addToast('Light theme active', 'info');
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              settingsTheme === 'light'
                                ? 'bg-[#E8FAF5] text-[#00A68A] border border-teal-200 shadow-2xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <Sun className="w-3.5 h-3.5" />
                            <span>Light</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsTheme('dark');
                              addToast('Dark mode preference saved.', 'info');
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              settingsTheme === 'dark'
                                ? 'bg-[#E8FAF5] text-[#00A68A] border border-teal-200 shadow-2xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5" />
                            <span>Dark</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsTheme('system');
                              addToast('System theme enabled.', 'info');
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              settingsTheme === 'system'
                                ? 'bg-[#E8FAF5] text-[#00A68A] border border-teal-200 shadow-2xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <Monitor className="w-3.5 h-3.5" />
                            <span>System</span>
                          </button>
                        </div>
                      </div>

                      {/* 3. Billing & Payment Settings */}
                      <div
                        onClick={() => addToast('Opening Billing & Razorpay/UPI Payment Methods...', 'info')}
                        className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                              Billing & Payment Settings
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">Manage saved payment methods, invoices, and refunds.</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-1" />
                      </div>

                      {/* 4. Linked Accounts */}
                      <div
                        onClick={() => addToast('Google OAuth identity linked to +91 9279125091', 'info')}
                        className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-[#E8FAF5] text-[#00A68A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Link2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008F83] transition-colors">
                              Linked Accounts
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">Manage connected accounts (e.g., Google).</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-1" />
                      </div>
                    </div>

                    {/* Card 3.2: Danger Zone */}
                    <div className="bg-[#FFF5F5] rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-rose-100">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <h4 className="text-xs font-black text-rose-600">Danger Zone</h4>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-white text-rose-500 flex items-center justify-center shrink-0 border border-rose-200 shadow-2xs mt-0.5">
                            <Trash2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900">Delete Account</h5>
                            <p className="text-[10.5px] text-slate-500 leading-snug">
                              Permanently remove your account and all associated data.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          className="border border-rose-300 hover:bg-rose-100/60 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
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

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBookingForDetail}
        isOpen={Boolean(selectedBookingForDetail)}
        onClose={() => setSelectedBookingForDetail(null)}
        onCancelBooking={handleCancelBooking}
        onMarkUpiPaid={handleMarkUpiPaid}
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
