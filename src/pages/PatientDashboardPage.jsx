// src/pages/PatientDashboardPage.jsx
// Redesigned to match the exact ZESTMED Patient / User Dashboard specification pixel-for-pixel
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSubdomainUrl } from '../utils/subdomain';
import { saveRegisteredPatient } from '../utils/patientRegistry';
import { 
  updateDoctorAppointmentStatus, 
  updateLabBookingStatus, 
  updateOrderStatus,
  updateBookingPaymentStatus,
  getUserBookings 
} from '../services/supabaseService';
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
  CreditCard
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
import AuthModal from '../components/AuthModal';
import { getMockReportDetails, downloadClinicalReport, shareClinicalReport } from '../utils/reportGenerator';

export default function PatientDashboardPage({ onOpenPrescriptionModal }) {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, openAuth, loginWithGoogle, updateUser } = useAuth();
  const { totalItemsCount, cartCount, openCart } = useCart();
  const { addToast } = useToast();

  // Navigation State
  const [activeMenu, setActiveMenu] = useState('bookings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [healthTipIndex, setHealthTipIndex] = useState(0);

  // Real Database Bookings for Logged-In User
  const [userBookings, setUserBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState(null);

  // Patient Real-Time Notifications (persisted with Buy & Book alerts)
  const [patientNotifications, setPatientNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('zestmed_patient_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map((p) => p.id));
          return [...parsed, ...DEFAULT_NOTIFICATIONS.filter((d) => !ids.has(d.id))];
        }
      }
      return DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  // Listen for new patient notifications & bookings and trigger audible alert chime
  useEffect(() => {
    const handleNewPatientAlert = (e) => {
      try {
        // 1. Direct notification in event detail
        if (e?.detail?.notification) {
          const incoming = e.detail.notification;
          setPatientNotifications((prev) => {
            if (prev.some((n) => n.id === incoming.id)) return prev;
            playNotificationSound();
            return [incoming, ...prev];
          });
          return;
        }

        // 2. Load from zestmed_patient_notifications
        const storedNotifs = JSON.parse(localStorage.getItem('zestmed_patient_notifications') || '[]');
        if (storedNotifs.length > 0) {
          const latest = storedNotifs[0];
          setPatientNotifications((prev) => {
            if (prev.some((n) => n.id === latest.id)) return prev;
            playNotificationSound();
            return [latest, ...prev];
          });
          return;
        }

        // 3. Check medicine orders (BUY)
        const storedOrders = JSON.parse(localStorage.getItem('zestmed_patient_orders') || '[]');
        if (storedOrders.length > 0) {
          const latest = storedOrders[0];
          const notifId = `pat-ord-${latest.id || latest.orderId || Date.now()}`;
          const newNotif = {
            id: notifId,
            sender: 'ZESTMED Express Pharmacy',
            avatar: 'ZM',
            avatarBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
            actionText: `Order #${latest.id || latest.orderId} Confirmed`,
            time: 'Just now',
            desc: `Your order for ${Array.isArray(latest.items) ? latest.items.length : 1} medicine item(s) has been placed successfully.`,
            category: 'Medicine Order',
            status: 'Confirmed',
            statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            linkType: 'order',
            notifType: 'buy'
          };
          setPatientNotifications((prev) => {
            if (prev.some((n) => n.id === notifId)) return prev;
            playNotificationSound();
            return [newNotif, ...prev];
          });
        }

        // 4. Check lab bookings (BOOK)
        const storedLabs = JSON.parse(localStorage.getItem('zestmed_patient_lab_bookings') || '[]');
        if (storedLabs.length > 0) {
          const latest = storedLabs[0];
          const notifId = `pat-lab-${latest.id || latest.bookingId || Date.now()}`;
          const newNotif = {
            id: notifId,
            sender: 'Dispur Central Pathology Lab',
            avatar: 'LB',
            avatarBg: 'bg-teal-50 text-[#007A64] border border-teal-200/80',
            actionText: `Booking #${latest.bookingId || latest.id} Confirmed`,
            time: 'Just now',
            desc: `Home collection confirmed for ${latest.testName || latest.name || 'Diagnostic Test'}.`,
            category: 'Diagnostic Lab Test',
            status: 'Confirmed',
            statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            linkType: 'lab',
            notifType: 'book'
          };
          setPatientNotifications((prev) => {
            if (prev.some((n) => n.id === notifId)) return prev;
            playNotificationSound();
            return [newNotif, ...prev];
          });
        }

        // 5. Check appointments (BOOK)
        const stored = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
        if (stored.length > 0) {
          const latest = stored[0];
          const notifId = `pat-${latest.id || latest.bookingId || Date.now()}`;
          const newNotif = {
            id: notifId,
            sender: latest.doctor || latest.doctorName || latest.therapist || 'ZESTMED Healthcare Desk',
            avatar: 'ZM',
            avatarBg: 'bg-teal-50 text-[#007A64] border border-teal-200/80',
            actionText: `Booking #${latest.bookingId || latest.booking_number || latest.id || 'ZM-NEW'} Confirmed`,
            time: 'Just now',
            desc: `Your ${latest.type || latest.title || 'appointment'} scheduled for ${latest.date || 'upcoming date'} (${latest.time || latest.slot || ''}) is confirmed.`,
            category: latest.category || 'Consultation & Care',
            status: 'Confirmed',
            statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            linkType: latest.category === 'lab' ? 'lab' : 'appointment',
            notifType: 'book'
          };
          setPatientNotifications((prev) => {
            if (prev.some((n) => n.id === notifId)) return prev;
            playNotificationSound();
            return [newNotif, ...prev];
          });
        }
      } catch (_) {}
    };

    window.addEventListener('zestmed_booking_updated', handleNewPatientAlert);
    window.addEventListener('storage', handleNewPatientAlert);
    window.addEventListener('zestmed_new_notification', handleNewPatientAlert);
    return () => {
      window.removeEventListener('zestmed_booking_updated', handleNewPatientAlert);
      window.removeEventListener('storage', handleNewPatientAlert);
      window.removeEventListener('zestmed_new_notification', handleNewPatientAlert);
    };
  }, []);

  // Modals State
  const [selectedReportBooking, setSelectedReportBooking] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isPrescriptionUploadModalOpen, setIsPrescriptionUploadModalOpen] = useState(false);

  // Enforce mandatory authentication on Patient Dashboard route
  useEffect(() => {
    if (!user) {
      addToast('Please login to access your patient dashboard and bookings', 'info');
      navigate('/login?returnUrl=/patient-dashboard', { replace: true });
    }
  }, [user, navigate, addToast]);

  // Check URL query to open prescription vault if requested
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('open') === 'prescription' || params.get('tab') === 'prescription') {
      setActiveMenu('prescription');
      setIsPrescriptionUploadModalOpen(true);
    }
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

  // Persistent User Data (for local fallback views)
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
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('patient_appointments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time synchronization across app actions
  useEffect(() => {
    const handleSyncStorage = () => {
      try {
        const savedOrders = localStorage.getItem('zestmed_patient_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));

        const savedLab = localStorage.getItem('zestmed_patient_lab_bookings');
        if (savedLab) setLabBookings(JSON.parse(savedLab));

        const savedAppts = localStorage.getItem('patient_appointments');
        if (savedAppts) setAppointments(JSON.parse(savedAppts));
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
  }, []);

  // Sanitize orders so wellness packages and lab tests never contaminate medicine orders
  useEffect(() => {
    try {
      const rawOrders = JSON.parse(localStorage.getItem('zestmed_patient_orders') || '[]');
      if (Array.isArray(rawOrders) && rawOrders.length > 0) {
        const isNonMedicine = (o) => {
          if (!Array.isArray(o.items) || o.items.length === 0) return false;
          return o.items.every(it => {
            const n = (it.name || '').toLowerCase();
            const t = (it.type || it.itemType || '').toLowerCase();
            const c = (it.category || '').toLowerCase();
            return (
              t === 'package' || t === 'test' ||
              c.includes('wellness') || c.includes('package') || c.includes('diagnostic') ||
              n.includes('wellness') || n.includes('package') || n.includes('screening') || n.includes('test')
            );
          });
        };

        const packageOrders = rawOrders.filter(isNonMedicine);
        const medicineOrders = rawOrders.filter(o => !isNonMedicine(o));

        if (packageOrders.length > 0) {
          const existingLabs = JSON.parse(localStorage.getItem('zestmed_patient_lab_bookings') || '[]');
          const migratedBookings = packageOrders.flatMap(po => {
            return (po.items || []).map((it, idx) => ({
              id: po.id ? po.id.replace('ORD', 'WEL') : `ZM-WEL-${Date.now()}-${idx}`,
              bookingId: po.order_number ? po.order_number.replace('ORD', 'WEL') : (po.id || `ZM-WEL-${Date.now()}`),
              type: 'Wellness Package',
              testName: it.name,
              category: 'Wellness Package',
              bookedDate: po.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              date: po.date || 'Tomorrow',
              time: po.time || '08:00 AM - Home Collection',
              patientName: po.patientName || 'Self',
              phone: po.phone || '',
              status: po.status || 'Confirmed',
              price: po.totalAmount || it.price,
              totalAmount: po.totalAmount || it.price,
              collectionAddress: po.deliveryAddress || 'Guwahati, Assam',
              paymentMethod: po.paymentMethod || 'Razorpay (UPI - Verified)'
            }));
          });

          const labMap = new Map();
          [...migratedBookings, ...existingLabs].forEach(item => {
            const key = item.bookingId || item.id;
            if (key) labMap.set(key, item);
          });
          const updatedLabs = Array.from(labMap.values());

          localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(updatedLabs));
          localStorage.setItem('zestmed_patient_orders', JSON.stringify(medicineOrders));
          setOrders(medicineOrders.length > 0 ? medicineOrders : initialPatientOrders);
          setLabBookings(updatedLabs);
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
        }
      }
    } catch (e) {
      console.warn('Error sanitizing orders:', e);
    }
  }, []);

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
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');
  const [profileForm, setProfileForm] = useState(() => {
    let saved = null;
    try {
      const stored = localStorage.getItem('zestmed_patient_profile');
      if (stored) saved = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const currentName = (user?.name && user.name !== 'Verified Patient') 
      ? user.name 
      : (saved?.name && saved.name !== 'Verified Patient') 
      ? saved.name 
      : 'Rahul Verma';
    return {
      name: currentName,
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

  useEffect(() => {
    if (user?.name && user.name !== 'Verified Patient') {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name,
        phone: user.contact || user.phone || prev.phone,
        email: user.email || prev.email,
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
    return (orders || []).map((o) => {
      const itemNames = Array.isArray(o.items) && o.items.length > 0
        ? o.items.map((it) => it.name).filter(Boolean).join(', ')
        : 'Prescription Medicines';
      return {
        id: o.id || o.order_number,
        bookingId: o.id || o.order_number,
        serviceType: 'Medicine Order',
        itemType: 'medicine',
        displayType: 'Medicine Order',
        serviceName: itemNames,
        title: itemNames,
        items: o.items || [],
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
        bookingStatus: o.status || o.order_status || 'Out for Delivery',
        status: o.status || o.order_status || 'Out for Delivery',
        totalAmount: parseFloat(o.totalAmount || o.total || 0),
        price: parseFloat(o.totalAmount || o.total || 0),
        patientName: o.patientName || (user?.name || 'Self'),
        phone: o.phone || (user?.phone || user?.contact || ''),
        source: 'orders',
        rawOrder: o
      };
    });
  }, [orders, user]);

  // Combined real user bookings (Database/Synced + Local persistent medicine orders)
  const allUserBookings = useMemo(() => {
    const map = new Map();
    (userBookings || []).forEach((b) => {
      const key = String(b.bookingId || b.id);
      map.set(key, b);
    });
    (formattedMedicineBookings || []).forEach((mb) => {
      const key = String(mb.bookingId || mb.id);
      if (!map.has(key)) {
        map.set(key, mb);
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.bookingDateTime || a.createdAt || 0).getTime();
      const timeB = new Date(b.bookingDateTime || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [userBookings, formattedMedicineBookings]);

  // Filtered Real User Bookings for My Bookings View
  const filteredUserBookings = useMemo(() => {
    return allUserBookings.filter((b) => {
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
      const st = (b.bookingStatus || b.status || '').toLowerCase();
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

  // Harmonized combined bookings across all 6 patient actions
  const combinedBookings = useMemo(() => {
    const labs = labBookings.map((b) => {
      const isWellness = (b.category || '').toLowerCase().includes('wellness') || (b.type || '').toLowerCase().includes('wellness');
      return {
        ...b,
        id: b.id || b.bookingId,
        bookingId: b.bookingId || b.id,
        itemType: isWellness ? 'wellness' : 'lab',
        displayType: isWellness ? 'Wellness Package' : 'Diagnostic Lab Test',
        title: b.testName || b.name || 'Diagnostic Test',
        date: b.date || b.bookedDate || 'Nov 18, 2026',
        time: b.time || '10:00 AM',
        mode: b.collectionAddress ? 'Home Collection' : (b.mode || 'Home Collection'),
        location: b.collectionAddress || 'Guwahati Hub',
        provider: b.labExecutive || b.phlebotomist?.name || 'Bikash Das (Phlebotomist)',
        price: b.price || 499,
        status: b.status || 'Confirmed'
      };
    });

    const appts = appointments.map((a) => {
      const cat = (a.category || a.type || '').toLowerCase();
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
    return combinedBookings.filter((b) => {
      // Category filter
      if (serviceCategoryFilter !== 'all') {
        if (serviceCategoryFilter === 'lab' && b.itemType !== 'lab') return false;
        if (serviceCategoryFilter === 'doctor' && b.itemType !== 'doctor') return false;
        if (serviceCategoryFilter === 'physiotherapy' && b.itemType !== 'physiotherapy') return false;
        if (serviceCategoryFilter === 'wellness' && b.itemType !== 'wellness') return false;
        if (serviceCategoryFilter === 'surgery' && b.itemType !== 'surgery') return false;
      }

      // Status filter
      if (bookingFilter === 'confirmed') {
        return (b.status || '').toLowerCase().includes('confirm') || (b.status || '').toLowerCase().includes('schedule');
      }
      if (bookingFilter === 'report-ready') {
        return (b.status || '').toLowerCase().includes('report') || (b.status || '').toLowerCase().includes('publish');
      }
      if (bookingFilter === 'completed') {
        return (b.status || '').toLowerCase().includes('complete');
      }
      if (bookingFilter === 'cancelled') {
        return (b.status || '').toLowerCase().includes('cancel');
      }

      return true;
    });
  }, [combinedBookings, serviceCategoryFilter, bookingFilter]);

  const upcomingCount = useMemo(() => {
    return userBookings.filter(
      (b) => !(b.bookingStatus || b.status || '').toLowerCase().includes('cancel') && !(b.bookingStatus || b.status || '').toLowerCase().includes('complete')
    ).length;
  }, [userBookings]);

  const upcomingList = useMemo(() => {
    return userBookings
      .filter((b) => !(b.bookingStatus || b.status || '').toLowerCase().includes('cancel') && !(b.bookingStatus || b.status || '').toLowerCase().includes('complete'))
      .slice(0, 3);
  }, [userBookings]);

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

            {/* My Bookings */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu('bookings');
                setServiceCategoryFilter('all');
                setIsSidebarOpen(false);
                addToast('Viewing My Bookings', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'bookings'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
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
              <UploadCloud className={`w-4 h-4 ${activeMenu === 'prescription' ? 'text-[#14B8A6]' : ''}`} />
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
                setActiveMenu('notifications');
                setIsSidebarOpen(false);
                addToast('Viewing real-time medical & appointment alerts', 'info');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                activeMenu === 'notifications'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition"
              />
            </div>
          </div>

          {/* Right: Cart, Notification Bell & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Notifications Popover matching Reference Images (Dark UI with Settings) */}
              <NotificationPopover
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={patientNotifications}
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
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#14B8A6]/20 bg-slate-100 shrink-0">
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
          {/* 3. HERO GREETING BANNER WITH STETHOSCOPE GRAPHIC         */}
          {/* ======================================================== */}
          <div className="relative rounded-2xl p-4 sm:p-6 overflow-hidden border border-[#D5EAEF] bg-gradient-to-r from-[#EEF7F9] via-[#E8F4F6] to-[#DBEFF3] shadow-xs">
            <div className="relative z-10 max-w-xl">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B2238] tracking-tight flex items-center gap-2">
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
                  {combinedBookings.length}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                  <span>View All →</span>
                </div>
              </div>
            </div>

            {/* Card 2: Upcoming Appointments */}
            <div
              onClick={() => setActiveMenu('bookings')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Upcoming
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {upcomingCount}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                  <span>Scheduled →</span>
                </div>
              </div>
            </div>

            {/* Card 3: Medicine Orders */}
            <div
              onClick={() => {
                setActiveMenu('bookings');
                setServiceCategoryFilter('medicine');
                addToast('Viewing Medicine Orders in My Bookings', 'info');
              }}
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
                  {allUserBookings.filter(b => b.itemType === 'medicine').length}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-sky-600 mt-0.5 flex items-center gap-0.5">
                  <span>Track in Bookings →</span>
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

              {/* Dynamically Rendered Patient Appointments */}
              <div className="space-y-3 pt-1">
                {upcomingList.length > 0 ? (
                  upcomingList.map((item, idx) => {
                    const isBlue = item.itemType === 'doctor' || item.itemType === 'surgery' || idx % 2 === 1;
                    const dateParts = String(item.date || 'Nov 18').replace(/,/g, '').split(' ');
                    const monthText = dateParts.find(p => isNaN(p) && p.length >= 3) || 'Nov';
                    const dayText = dateParts.find(p => !isNaN(p)) || String(15 + idx * 3);

                    return (
                      <div
                        key={item.id || item.bookingId || idx}
                        onClick={() => setActiveMenu('bookings')}
                        className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100 gap-2 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                          {/* Date box */}
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                              isBlue
                                ? 'bg-[#EFF6FF] border-blue-100 text-[#2563EB]'
                                : 'bg-[#E8F8F5] border-emerald-100 text-[#00A884]'
                            }`}
                          >
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none">
                              {monthText.slice(0, 3)}
                            </span>
                            <span className="text-base sm:text-lg font-black leading-none mt-0.5 sm:mt-1">
                              {dayText}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#14B8A6] transition">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {item.time} • {item.mode || item.displayType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shrink-0 ${
                            isBlue
                              ? 'bg-blue-50 text-blue-600 border border-blue-200/80'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                          }`}
                        >
                          {item.status || 'Confirmed'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="font-semibold text-slate-700">No upcoming appointments scheduled</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Book a doctor, lab test, physiotherapy, or wellness checkup anytime.</p>
                  </div>
                )}
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
                    setActiveMenu('prescription');
                    setIsPrescriptionUploadModalOpen(true);
                    addToast('Opening Doctor\'s Prescription Upload Vault', 'info');
                  }}
                  className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    Upload Prescription
                  </span>
                </button>

                {/* 4. View My Reports */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('reports');
                    addToast('Viewing Diagnostic Reports', 'info');
                  }}
                  className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 sm:p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    View My Reports
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
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('medicine');
                    addToast('Viewing Medicine Orders in My Bookings', 'info');
                  }}
                  className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View in Bookings</span>
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
            </>
          )}

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
                  { id: 'doctor', label: `Doctor Appointments (${allUserBookings.filter(b => b.itemType === 'doctor').length})` },
                  { id: 'surgery', label: `Surgery Packages (${allUserBookings.filter(b => b.itemType === 'surgery').length})` },
                  { id: 'medicine', label: `Medicine Orders (${allUserBookings.filter(b => b.itemType === 'medicine').length})` },
                  { id: 'lab', label: `Lab Tests (${allUserBookings.filter(b => b.itemType === 'lab').length})` },
                  { id: 'physiotherapy', label: `Physiotherapy (${allUserBookings.filter(b => b.itemType === 'physiotherapy').length})` },
                  { id: 'wellness', label: `Wellness Packages (${allUserBookings.filter(b => b.itemType === 'wellness').length})` }
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
                      ? 'bg-teal-50 text-teal-600'
                      : isMedicine
                      ? 'bg-sky-50 text-sky-600'
                      : 'bg-teal-50 text-teal-600';

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

                    const statusLower = (b.bookingStatus || b.status || 'Confirmed').toLowerCase();
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
                                  {b.serviceName || b.title}
                                </h3>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 text-[#007A64] border border-teal-200">
                                  {b.serviceType || b.displayType}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-700">
                                  ID: {b.bookingId || b.id}
                                </span>
                                <span className="text-slate-400 font-sans">
                                  • Patient: <strong className="text-slate-700">{b.patientName || 'Self'}</strong>
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
                                (b.paymentStatus || '').toLowerCase().includes('clinic') || (b.paymentStatus || '').toLowerCase().includes('post-session')
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50/80 text-emerald-800 border border-emerald-200'
                              }`}>
                                {b.paymentStatus || 'Paid (Verified)'}
                              </span>
                              {((b.paymentStatus || '').toLowerCase().includes('clinic') || (b.paymentStatus || '').toLowerCase().includes('post-session') || (b.paymentStatus || '').toLowerCase().includes('collection')) && !isCancelled && (
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
                        ? `There are no bookings recorded under your verified account (${user.phone || user.contact || user.email || user.name || 'Current User'}). Only your own real bookings will be displayed here.`
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
                            <span className="font-mono text-xs font-bold text-[#14B8A6]">{rx.id}</span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{rx.doctorName}</h4>
                            <p className="text-[11px] text-slate-500">{rx.specialty} • {rx.hospital}</p>
                          </div>
                          <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                            rx.status.toLowerCase().includes('verified')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                          className="px-3.5 py-1.5 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
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
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                        {rep.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                      <span>Pathologist: <strong className="text-slate-700">{rep.pathologist}</strong></span>
                      <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenReportModal(rep.test, rep.date, rep.id, rep.pathologist)}
                        className="px-3.5 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
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
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Bell className="w-6 h-6 text-[#14B8A6]" />
                    <span>Notification Center</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Real-time clinical alerts for diagnostic reports, doctor appointments, and prescription pharmacy orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('All notifications marked as read', 'success')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mark All as Read</span>
                </button>
              </div>

              {/* Exact Dark Notification Card & Settings matching Reference Images */}
              <NotificationPopover
                inline={true}
                isOpen={true}
                onClose={() => {}}
                notifications={patientNotifications}
                onNotificationClick={(n) => {
                  if (n.linkType === 'lab') {
                    setActiveMenu('reports');
                    addToast('Navigating to Diagnostic Lab Reports', 'info');
                  } else if (n.linkType === 'order') {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('medicine');
                    addToast('Navigating to Medicine Orders in My Bookings', 'info');
                  } else if (n.linkType === 'doctor') {
                    setActiveMenu('bookings');
                    setServiceCategoryFilter('doctor');
                    addToast('Navigating to Doctor Appointments in My Bookings', 'info');
                  } else if (n.linkType === 'rx') {
                    setActiveMenu('prescription');
                    addToast('Navigating to Prescription Vault', 'info');
                  }
                }}
              />
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
