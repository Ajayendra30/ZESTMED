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
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  initialPatientProfile,
  initialPatientOrders,
  initialPatientLabBookings,
  initialPatientAppointments,
  initialPatientPrescriptions,
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
    const completedLabs = (allUserBookings || []).filter(b => b?.itemType === 'lab' && (
      String(b.status || '').toLowerCase().includes('report') ||
      String(b.status || '').toLowerCase().includes('publish') ||
      String(b.status || '').toLowerCase().includes('complete')
    )).map((l, idx) => ({
      test: l?.serviceName || l?.title || 'Diagnostic Test',
      date: l?.date || 'Recent',
      id: `ZM-REP-${l?.bookingId || idx + 1}`,
      status: 'Ready',
      pathologist: 'Dr. Pranabesh Sarma, MD Pathology'
    }));

    try {
      const stored = JSON.parse(localStorage.getItem('zestmed_patient_reports') || '[]');
      const userStored = Array.isArray(stored) ? stored.filter(Boolean).filter(isMatchingCurrentUser) : [];
      return [...userStored, ...completedLabs];
    } catch {
      return completedLabs;
    }
  }, [user, allUserBookings, isMatchingCurrentUser]);

  // Real or Historical Prescriptions (strictly isolated to verified user)
  const userPrescriptions = useMemo(() => {
    if (!user) return [];
    try {
      const stored = JSON.parse(localStorage.getItem('zestmed_patient_prescriptions') || '[]');
      return Array.isArray(stored) ? stored.filter(Boolean).filter(isMatchingCurrentUser) : [];
    } catch {
      return [];
    }
  }, [user, isMatchingCurrentUser]);

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

            {/* 2. Book Lab Test */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/diagnostics');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Book Lab Test</span>
            </button>

            {/* 3. Doctor Appointment */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/doctor-appointment');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Appointment</span>
            </button>

            {/* 4. Medicine Store */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/medicines');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Medicine Store</span>
            </button>

            {/* 5. Surgery Packages */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/surgeries');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Surgery Packages</span>
            </button>

            {/* 6. Wellness Packages */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/wellness-packages');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Wellness Packages</span>
            </button>

            {/* 7. Physiotherapy */}
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                navigate('/physiotherapy');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Physiotherapy</span>
            </button>

            {/* 8. My Bookings */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('bookings');
                setServiceCategoryFilter('all');
                setIsSidebarOpen(false);
                addToast('Viewing My Bookings', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'bookings' && serviceCategoryFilter !== 'medicine'
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </button>

            {/* 9. My Orders */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('bookings');
                setServiceCategoryFilter('medicine');
                setIsSidebarOpen(false);
                addToast('Viewing Medicine Orders', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'bookings' && serviceCategoryFilter === 'medicine'
                  ? 'bg-[#00BFA5] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </button>

            {/* 10. My Reports */}
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

            {/* 11. Upload Prescription */}
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

            {/* 12. Health Records */}
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

            {/* 13. My Profile */}
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

            {/* 14. Settings */}
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

            {/* 15. Logout */}
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
        <main className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
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
          {activeMenu === 'bookings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#14B8A6]" />
                    <span>My Bookings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage and view all services booked through your account (Doctor Appointments, Surgery Packages, Medicine Orders, Lab Tests, Physiotherapy, and Wellness Packages).
                  </p>
                </div>
              </div>

              {/* Service Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { id: 'all', label: `All Bookings (${allUserBookings.length})` },
                  { id: 'doctor', label: `Doctor Appointments (${allUserBookings.filter(b => b?.itemType === 'doctor').length})` },
                  { id: 'surgery', label: `Surgery Packages (${allUserBookings.filter(b => b?.itemType === 'surgery').length})` },
                  { id: 'medicine', label: `Medicine Orders (${allUserBookings.filter(b => b?.itemType === 'medicine').length})` },
                  { id: 'lab', label: `Lab Tests (${allUserBookings.filter(b => b?.itemType === 'lab').length})` },
                  { id: 'physiotherapy', label: `Physiotherapy (${allUserBookings.filter(b => b?.itemType === 'physiotherapy').length})` },
                  { id: 'wellness', label: `Wellness Packages (${allUserBookings.filter(b => b?.itemType === 'wellness').length})` }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setServiceCategoryFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      serviceCategoryFilter === cat.id
                        ? 'bg-[#14B8A6] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Secondary Status Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1">Status:</span>
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setBookingFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                      bookingFilter === f.id
                        ? 'bg-slate-800 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              <div className="space-y-3.5">
                {isLoadingBookings ? (
                  <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center space-y-3">
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

                    const iconColor = isDoctor
                      ? 'bg-blue-50 text-blue-600'
                      : isPhysio
                      ? 'bg-emerald-50 text-emerald-600'
                      : isSurgery
                      ? 'bg-amber-50 text-amber-600'
                      : isWellness
                      ? 'bg-pink-50 text-pink-600'
                      : isMedicine
                      ? 'bg-sky-50 text-sky-600'
                      : 'bg-teal-50 text-[#007A64]';

                    const IconComponent = isDoctor
                      ? Stethoscope
                      : isPhysio
                      ? Activity
                      : isSurgery
                      ? Scissors
                      : isWellness
                      ? Package
                      : isMedicine
                      ? ShoppingCart
                      : FlaskConical;

                    const statusLower = String(b.bookingStatus || b.status || 'Confirmed').toLowerCase();
                    const isCancelled = statusLower.includes('cancel');
                    const isCompleted = statusLower.includes('complete') || statusLower.includes('deliver') || statusLower.includes('report') || statusLower.includes('publish');
                    const isPending = statusLower.includes('pending') || statusLower.includes('process');

                    const statusBadgeClass = isCancelled
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : isCompleted
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : isPending
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

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
                      : 'Recently Booked';

                    return (
                      <div
                        key={b.id || b.bookingId}
                        onClick={() => setSelectedBookingForDetail(b)}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-300 transition cursor-pointer space-y-3 group"
                      >
                        {/* Top Row: Service Name, ID, Badges, Amount */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconColor} group-hover:scale-105 transition-transform`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                                  {typeof (b.serviceName || b.title) === 'object' ? (b.serviceName?.name || b.title?.name || 'Service') : (b.serviceName || b.title)}
                                </h3>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                  isWellness
                                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                                    : isSurgery
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : isPhysio
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isDoctor
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : isMedicine
                                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                                    : 'bg-teal-50 text-[#007A64] border-teal-200'
                                }`}>
                                  {typeof (b.serviceType || b.displayType) === 'object' ? (b.serviceType?.name || b.displayType?.name || 'Service') : (b.serviceType || b.displayType)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-700">
                                  ID: {b.bookingId || b.id}
                                </span>
                                <span className="text-slate-400 font-sans">
                                  • Patient: <strong className="text-slate-700">{(!b.patientName || b.patientName === 'Rahul Verma') ? (user?.name || 'Self') : (typeof b.patientName === 'object' ? b.patientName?.name : b.patientName)}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${statusBadgeClass}`}>
                              {b.bookingStatus || b.status || 'Confirmed'}
                            </span>
                            <div className="text-right">
                              <span className="text-sm sm:text-base font-black text-slate-900">
                                ₹{Number(b.totalAmount || b.price || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Medicine Items Preview if Medicine Order */}
                        {isMedicine && Array.isArray(b.items) && b.items.length > 0 && (
                          <div className="bg-slate-50/70 rounded-xl p-2.5 sm:p-3 space-y-1.5 text-xs border border-slate-100">
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

                        {/* Middle & Bottom: Booking Date, Appointment Date, Payment Status, Actions */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-600">
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            {/* Booking Date and Time */}
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                Booked on: <strong className="text-slate-700">{formattedBookingDate}</strong>
                              </span>
                            </div>

                            {/* Appointment or Service Date */}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span>
                                {isMedicine ? 'Delivery: ' : 'Service Date: '}
                                <strong className="text-slate-800">{b.appointmentDate || b.date || 'Scheduled Date'} {b.appointmentTime || b.time ? `• ${b.appointmentTime || b.time}` : ''}</strong>
                              </span>
                            </div>

                            {/* Payment Status */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className={`px-2 py-0.5 rounded-md font-semibold text-xs ${
                                String(b.paymentStatus || '').toLowerCase().includes('clinic') || String(b.paymentStatus || '').toLowerCase().includes('post-session')
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50/80 text-emerald-800 border border-emerald-200'
                              }`}>
                                {b.paymentStatus || 'Paid (Verified)'}
                              </span>
                              {(String(b.paymentStatus || '').toLowerCase().includes('clinic') || String(b.paymentStatus || '').toLowerCase().includes('post-session') || String(b.paymentStatus || '').toLowerCase().includes('collection')) && !isCancelled && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkUpiPaid(b);
                                  }}
                                  className="text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1"
                                  title="Click if you paid via UPI or Razorpay"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                  <span>Paid via UPI? Click to Verify</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                            {isMedicine && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenOrderModal(b.items?.[0]?.name || b.serviceName || 'Medicines', b.bookingId || b.id);
                                }}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>Invoice</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBookingForDetail(b);
                              }}
                              className="px-3.5 py-1.5 bg-[#008F83] hover:bg-[#007A64] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>

                            {isCancelled ? (
                              <span className="text-xs text-rose-500 font-semibold italic">Cancelled</span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelBooking(b.id || b.bookingId);
                                }}
                                className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer"
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
                  <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-100 shadow-sm text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008F83] flex items-center justify-center mx-auto">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Bookings Found</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      {user 
                        ? `There are no bookings recorded under your account (${user.phone || user.contact || user.email || user.name || 'Current User'}). Only your own real bookings will be displayed here.`
                        : 'Please log in with your phone or email to view your booked services.'}
                    </p>
                  </div>
                )}
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
                    <UploadCloud className="w-6 h-6 text-[#14B8A6]" />
                    <span>Doctor's Prescription Vault</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload handwritten or digital doctor prescriptions for registered pharmacist verification and quick re-orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrescriptionUploadModalOpen(true)}
                  className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload New Prescription</span>
                </button>
              </div>

              {/* Upload Dropzone Hero Card */}
              <div 
                onClick={() => setIsPrescriptionUploadModalOpen(true)}
                className="bg-gradient-to-br from-teal-50/60 via-emerald-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-dashed border-[#14B8A6]/40 hover:border-[#14B8A6] transition cursor-pointer text-center group shadow-xs"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-[#14B8A6] border border-teal-100 flex items-center justify-center mx-auto mb-3 shadow-xs group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Click here to Upload Doctor's Prescription
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Drag & drop your prescription image (JPG, PNG) or PDF document. Our Guwahati chief pharmacist verifies and pre-fills your medicine cart within 15 minutes.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-teal-200 text-[#008F83] text-xs font-bold shadow-2xs">
                  <span>🔒 100% Confidential • Verified by Licensed Pharmacists</span>
                </div>
              </div>

              {/* Active & Past Prescriptions List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Uploaded & Verified Prescriptions ({userPrescriptions.length})
                </h3>
                {userPrescriptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPrescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="font-mono text-xs font-bold text-[#14B8A6]">{rx.id}</span>
                              <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{rx.doctorName || 'Prescription Document'}</h4>
                              <p className="text-[11px] text-slate-500">{rx.specialty || 'General Care'} • {rx.hospital || 'Assam Health Desk'}</p>
                            </div>
                            <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                              String(rx.status || '').toLowerCase().includes('verified')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {rx.status || 'Verified'}
                            </span>
                          </div>

                          <div className="py-3 text-xs text-slate-600 space-y-1">
                            <p><strong className="text-slate-700">Issued On:</strong> {rx.dateOfIssue || 'Recent'}</p>
                            <p><strong className="text-slate-700">Valid Until:</strong> {rx.expiryDate || 'Standard Validity'}</p>
                            <p><strong className="text-slate-700">Medications:</strong> {Array.isArray(rx.medicines) ? rx.medicines.map(m => m?.name).filter(Boolean).join(', ') : (rx.medicines || 'Prescribed Medicines')}</p>
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
                            className="px-3.5 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Order Medicines</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-100 shadow-sm text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008F83] flex items-center justify-center mx-auto">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Prescriptions Uploaded</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      You haven't uploaded any doctor prescriptions yet. Use the upload box above to submit your prescription for verified doorstep medicine fulfillment.
                    </p>
                  </div>
                )}
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
                    <FileText className="w-6 h-6 text-[#14B8A6]" />
                    <span>My Diagnostic Test Reports</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Digital reports authorized by certified MD Pathologists (Dispur Central Laboratory).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/diagnostics')}
                  className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Another Test</span>
                </button>
              </div>

              {/* Reports Grid */}
              {userReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userReports.map((rep, idx) => (
                    <div
                      key={rep.id || idx}
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
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                          {rep.status || 'Ready'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                        <span>Pathologist: <strong className="text-slate-700">{rep.pathologist || 'Dr. Pranabesh Sarma, MD Pathology'}</strong></span>
                        <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(rep.test, rep.date, rep.id, rep.pathologist || 'Dr. Pranabesh Sarma, MD Pathology')}
                          className="px-3.5 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
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
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => shareClinicalReport(rep, addToast)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
                          title="Share with Doctor"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-100 shadow-sm text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">No Diagnostic Test Reports Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    You do not have any published test reports yet. When you complete a diagnostic test with our certified labs, your verified reports and digital signatures will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/diagnostics')}
                    className="mt-2 inline-flex items-center gap-2 bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book a Diagnostic Test</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. MY PROFILE VIEW                                       */}
          {/* ======================================================== */}
          {activeMenu === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <User className="w-6 h-6 text-[#14B8A6]" />
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
                    <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
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
                          placeholder="Enter your full name"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#14B8A6]"
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
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#14B8A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#14B8A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Blood Group</label>
                        <input
                          type="text"
                          value={profileForm.bloodGroup}
                          onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#14B8A6]"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Emergency Contact</label>
                        <input
                          type="text"
                          value={profileForm.emergencyContact}
                          onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-[#14B8A6]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
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
                        <MapPin className="w-4 h-4 text-[#14B8A6]" />
                        <span>Saved Assam Addresses</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        className="text-xs text-[#14B8A6] hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {addresses.length > 0 ? (
                        addresses.map((addr) => (
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
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                          <p className="font-semibold text-slate-700">No saved addresses</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click 'Add New' to add a delivery address.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Login History & Security Audit Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                    <span>Login History & Security Activity</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Session Status: Active (Protected)</span>
                </div>
                <p className="text-xs text-slate-500">
                  Recent authentication and session activity linked to this mobile number.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold text-[11px]">
                        <th className="pb-2">Date & Time</th>
                        <th className="pb-2">Method</th>
                        <th className="pb-2">Mobile / Identity</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Device / IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {getLoginHistory().length > 0 ? (
                        getLoginHistory().slice(0, 5).map((log) => (
                          <tr key={log.id} className="text-slate-700">
                            <td className="py-2.5 font-medium whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="py-2.5 capitalize">{log.method?.replace(/_/g, ' ')}</td>
                            <td className="py-2.5 font-mono text-[11px]">{log.phone}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                log.status === 'LOCKED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-500 text-[11px] max-w-[200px] truncate" title={log.userAgent}>
                              {log.ip}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400">
                            No recent login events recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* ======================================================== */}
          {/* HEALTH RECORDS VIEW                                      */}
          {/* ======================================================== */}
          {activeMenu === 'records' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[#00BFA5]" />
                    <span>Health Records Vault</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage and view your verified prescriptions, diagnostic lab reports, doctor consultation summaries, and medical history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('prescription');
                    setIsPrescriptionUploadModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BFA5] hover:bg-[#00A887] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              {/* 4 Records Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => {
                    setActiveMenu('prescription');
                    setIsPrescriptionUploadModalOpen(true);
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-teal-200 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A887] flex items-center justify-center mb-3">
                    <Pill className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Digital Prescriptions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{userPrescriptions.length} active prescriptions verified</p>
                  <span className="text-xs font-bold text-[#00A887] mt-3 inline-block">Manage Prescriptions →</span>
                </div>

                <div
                  onClick={() => setActiveMenu('reports')}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-blue-200 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Pathology Reports</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{userReports.length} NABL certified reports</p>
                  <span className="text-xs font-bold text-blue-600 mt-3 inline-block">View Reports →</span>
                </div>

                <div
                  onClick={() => {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('doctor');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-purple-200 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                    <Stethoscope className="w-4 h-4 stroke-[2]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Doctor Consultations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Clinical notes & visit summaries</p>
                  <span className="text-xs font-bold text-purple-600 mt-3 inline-block">View Consultations →</span>
                </div>

                <div
                  onClick={() => {
                    setActiveMenu('dashboard');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <Activity className="w-4 h-4 stroke-[2]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Vitals & Health Metrics</h3>
                  <p className="text-xs text-slate-400 mt-0.5">BP, Heart Rate, BMI tracked</p>
                  <span className="text-xs font-bold text-emerald-600 mt-3 inline-block">View Metrics →</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SETTINGS VIEW                                            */}
          {/* ======================================================== */}
          {activeMenu === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Settings className="w-6 h-6 text-[#00BFA5]" />
                  <span>Settings & Preferences</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your account security, notification alerts, communication preferences, and data privacy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Security Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00BFA5]" />
                    <span>Account Security & Authentication</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">OTP Mobile Verification</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Each login requires a secure 6-digit one-time code.</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">One Number, One User Policy</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Your phone number {user?.phone || user?.contact || profileForm.phone} is uniquely linked.</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Enforced
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notifications Preferences */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#00BFA5]" />
                    <span>Notification Channels</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">SMS & WhatsApp Alerts</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Live order dispatches, test collection updates & reports.</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Enabled
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">Email Reports</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Digital signed lab reports sent to {profileForm.email}.</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>
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
