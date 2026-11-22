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
import { initialPatientLabBookings } from '../mock-data/patientData';
import {
  getLabBookings,
  updateLabBookingStatus,
  bookLabTest
} from '../services/supabaseService';
import SampleCollectionModal from '../components/SampleCollectionModal';
import PublishReportModal from '../components/PublishReportModal';
import DigitalLabReportModal from '../components/DigitalLabReportModal';
import NewLabJobModal from '../components/NewLabJobModal';
import NotificationPopover from '../components/NotificationPopover';
import { playNotificationSound } from '../utils/notificationSound';

export default function LabDashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Navigation & Interactive State (persisted across reloads)
  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') || urlParams.get('menu');
      if (tabParam && tabParam !== 'notifications') return tabParam;
      const saved = sessionStorage.getItem('zestmed_lab_active_tab');
      return saved && saved !== 'notifications' ? saved : 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('zestmed_lab_active_tab', activeMenu);
    } catch (_) {}
  }, [activeMenu]);
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

  // Today's Schedule Data
  const [todaySchedule, setTodaySchedule] = useState([
    {
      id: '#LB10241',
      bookingId: 'ZM-LAB-781001-4402',
      time: '09:00 AM',
      patient: 'Amit Verma',
      patientName: 'Amit Verma',
      age: 34,
      gender: 'Male',
      test: 'Full Blood Count',
      testName: 'Full Blood Count',
      type: 'Home Collection',
      action: 'Collect Sample',
      status: 'Pending Collection',
      phone: '+91 92791 25091',
      address: 'House 14, Basistha Chariali, Dispur, Guwahati',
      district: 'Kamrup Metro',
      pincode: '781005',
      landmark: 'Near Dispur Secretariat',
      barcode: 'AS-BC-781005-091'
    },
    {
      id: '#LB10242',
      bookingId: 'ZM-LAB-781001-5198',
      time: '10:30 AM',
      patient: 'Priya Sharma',
      patientName: 'Priya Sharma',
      age: 29,
      gender: 'Female',
      test: 'Thyroid Profile',
      testName: 'Thyroid Profile',
      type: 'Home Collection',
      action: 'Collect Sample',
      status: 'Pending Collection',
      phone: '+91 92791 25091',
      address: 'Flat 2B, Kanaklata Path, Ulubari, Guwahati',
      district: 'Kamrup Metro',
      pincode: '781007',
      landmark: 'Behind Ulubari Flyover',
      barcode: 'AS-BC-781005-092'
    },
    {
      id: '#LB10243',
      bookingId: 'ZM-LAB-781001-6380',
      time: '12:00 PM',
      patient: 'Rajesh Kumar',
      patientName: 'Rajesh Kumar',
      age: 46,
      gender: 'Male',
      test: 'Diabetes Package',
      testName: 'Diabetes Package',
      type: 'Lab Visit',
      action: 'Check In',
      status: 'Awaiting Arrival',
      phone: '+91 92791 25091',
      address: 'Central Polyclinic Desk, Dispur Hub',
      district: 'Kamrup Metro',
      pincode: '781005',
      landmark: 'GS Road Hub',
      barcode: 'AS-BC-781005-093'
    },
    {
      id: '#LB10244',
      bookingId: 'ZM-LAB-781001-7124',
      time: '02:00 PM',
      patient: 'Sneha Singh',
      patientName: 'Sneha Singh',
      age: 38,
      gender: 'Female',
      test: 'Lipid Profile',
      testName: 'Lipid Profile',
      type: 'Home Collection',
      action: 'Collect Sample',
      status: 'Pending Collection',
      phone: '+91 92791 25091',
      address: 'Flat 201, Green View Apartment, Beltola Tiniali',
      district: 'Kamrup Metro',
      pincode: '781028',
      landmark: 'Opposite Beltola College',
      barcode: 'AS-BC-781005-094'
    },
    {
      id: '#LB10245',
      bookingId: 'ZM-LAB-781001-8091',
      time: '04:00 PM',
      patient: 'Vikram Das',
      patientName: 'Vikram Das',
      age: 52,
      gender: 'Male',
      test: 'Liver Function Test',
      testName: 'Liver Function Test',
      type: 'Lab Visit',
      action: 'Check In',
      status: 'Awaiting Arrival',
      phone: '+91 92791 25091',
      address: 'Central Polyclinic Desk, Dispur Hub',
      district: 'Kamrup Metro',
      pincode: '781005',
      landmark: 'GS Road Hub',
      barcode: 'AS-BC-781005-095'
    }
  ]);

  // Lab Notifications List matching NotificationPopover schema
  const DEFAULT_LAB_NOTIFICATIONS = [
    {
      id: 1,
      sender: 'Dispur Central Lab Dispatch',
      avatar: 'LB',
      avatarBg: 'bg-teal-50 text-[#007A64] border border-teal-200/80',
      actionText: 'new job assigned: Home Collection #LB10245',
      time: '15m ago',
      desc: 'Home Collection #LB10245 assigned for Dispur sector. Fasting blood sample required by 09:00 AM.',
      category: 'Home Sample Collection',
      status: 'Assigned',
      statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      linkType: 'assigned'
    },
    {
      id: 2,
      sender: 'Cold-Chain Sentinel Monitor',
      avatar: 'CC',
      avatarBg: 'bg-sky-50 text-sky-700 border border-sky-200/80',
      actionText: 'temp stabilized: Box CCB-01 at 3.8°C',
      time: '45m ago',
      desc: 'Smart thermal probe confirmed Box CCB-01 stabilized at 3.8°C within the 2°C–8°C clinical requirement.',
      category: 'Cold-Chain Logistics',
      status: 'Stabilized',
      statusBadge: 'bg-sky-50 text-sky-700 border border-sky-200',
      linkType: 'collection'
    },
    {
      id: 3,
      sender: 'Hematology Analyzer Lab',
      avatar: 'PA',
      avatarBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      actionText: 'sample arrived: Amit Verma (SPEC-9041)',
      time: '1h ago',
      desc: 'Sample collected from Amit Verma arrived at central lab. Mindray BC-5150 Hematology assay in progress.',
      category: 'Diagnostic Processing',
      status: 'In Assay',
      statusBadge: 'bg-teal-50 text-teal-700 border border-teal-200',
      linkType: 'processing'
    },
    {
      id: 4,
      sender: 'Clinical Pathology Desk',
      avatar: 'DR',
      avatarBg: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      actionText: 'report ready for signature: CBC #REP-9021',
      time: '2h ago',
      desc: 'Dr. N. Bora, MD (Pathology) completed analysis for Rahul Verma. Ready for digital signature & dispatch.',
      category: 'Clinical Report Verification',
      status: 'Ready to Sign',
      statusBadge: 'bg-purple-50 text-purple-700 border border-purple-200',
      linkType: 'upload-reports'
    },
    {
      id: 5,
      sender: 'Daily Field Schedule Desk',
      avatar: 'SC',
      avatarBg: 'bg-amber-50 text-amber-700 border border-amber-200/80',
      actionText: 'route optimized: 6 appointments queued',
      time: '3h ago',
      desc: 'Morning route generated for Paltan Bazar and Ulubari. 6 home sample collections scheduled.',
      category: 'Field Route & Schedule',
      status: 'Route Active',
      statusBadge: 'bg-amber-50 text-amber-700 border border-amber-200',
      linkType: 'schedule'
    }
  ];

  const [labNotifications, setLabNotifications] = useState(DEFAULT_LAB_NOTIFICATIONS);

  // Listen for real-time lab bookings & sample updates and trigger audible alert chime
  useEffect(() => {
    const handleNewLabAlert = (e) => {
      try {
        if (e?.detail?.notification && (e.detail.notification.linkType === 'lab' || e.detail.notification.category?.toLowerCase().includes('lab'))) {
          const incoming = e.detail.notification;
          const labNotifId = `lab-${incoming.id}`;
          const newNotif = {
            ...incoming,
            id: labNotifId,
            sender: 'Lab Order Dispatch',
            actionText: incoming.actionText || 'New Lab Order',
            desc: incoming.desc,
            statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          };
          setLabNotifications((prev) => {
            if (prev.some((n) => n.id === labNotifId)) return prev;
            playNotificationSound();
            return [newNotif, ...prev];
          });
          return;
        }

        const stored = JSON.parse(localStorage.getItem('zestmed_patient_lab_bookings') || '[]');
        if (stored.length > 0) {
          const latest = stored[0];
          const notifId = `lab-${latest.id || latest.bookingId || Date.now()}`;
          const newNotif = {
            id: notifId,
            sender: 'Lab Order Dispatch',
            avatar: 'LB',
            avatarBg: 'bg-teal-50 text-[#007A64] border border-teal-200/80',
            actionText: `Booking #${latest.bookingId || latest.booking_number || latest.id || 'LB-NEW'} Confirmed`,
            time: 'Just now',
            desc: `New home sample collection booking for ${latest.patientName || latest.name || 'Patient'} (${latest.phone || ''}). Specimen: ${latest.specimen || 'Blood / Serum Sample'}.`,
            category: 'Home Sample Collection',
            status: 'New Job',
            statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            linkType: 'assigned'
          };
          setLabNotifications((prev) => {
            if (prev.some((n) => n.id === notifId)) return prev;
            playNotificationSound();
            return [newNotif, ...prev];
          });
        }
      } catch (_) {}
    };

    window.addEventListener('zestmed_booking_updated', handleNewLabAlert);
    window.addEventListener('storage', handleNewLabAlert);
    window.addEventListener('zestmed_lab_updated', handleNewLabAlert);
    window.addEventListener('zestmed_new_notification', handleNewLabAlert);
    return () => {
      window.removeEventListener('zestmed_booking_updated', handleNewLabAlert);
      window.removeEventListener('storage', handleNewLabAlert);
      window.removeEventListener('zestmed_lab_updated', handleNewLabAlert);
      window.removeEventListener('zestmed_new_notification', handleNewLabAlert);
    };
  }, []);

  const handleLabNotificationClick = (item) => {
    setIsNotificationsOpen(false);
    if (item?.linkType) {
      setActiveMenu(item.linkType);
      addToast(`Navigating to ${item.category}`, 'info');
    }
  };

  const [assignedFilter, setAssignedFilter] = useState('all');
  const [barcodeInput, setBarcodeInput] = useState('AS-BC-781005-092');

  const [processingList, setProcessingList] = useState([
    { id: 'SPEC-9041', bookingId: '#LB10236', patient: 'Amit Verma', test: 'Complete Blood Count (CBC)', analyzer: 'Mindray BC-5150 Hematology', status: 'Running Assay', progress: 78, eta: '12m' },
    { id: 'SPEC-9042', bookingId: '#LB10237', patient: 'Priya Sharma', test: 'Thyroid Profile (T3, T4, TSH)', analyzer: 'Roche Cobas c311 Biochemistry', status: 'Centrifugation', progress: 45, eta: '25m' },
    { id: 'SPEC-9043', bookingId: '#LB10238', patient: 'Rajesh Kumar', test: 'Diabetes HbA1c Glycation', analyzer: 'Bio-Rad D-10 Analyzer', status: 'Verification', progress: 95, eta: '3m' },
    { id: 'SPEC-9044', bookingId: '#LB10239', patient: 'Sneha Singh', test: 'Lipid Profile Screen', analyzer: 'Roche Cobas c311 Biochemistry', status: 'Incubation', progress: 60, eta: '18m' }
  ]);

  const [pendingUploadList, setPendingUploadList] = useState([
    { id: '#LB10238', bookingId: '#LB10238', patient: 'Sneha Singh', patientName: 'Sneha Singh', test: 'Complete Blood Count (CBC)', testName: 'Complete Blood Count (CBC)', time: '10:15 AM', box: 'CCB-01' },
    { id: '#LB10237', bookingId: '#LB10237', patient: 'Amit Verma', patientName: 'Amit Verma', test: 'Lipid Profile Screen', testName: 'Lipid Profile Screen', time: '11:45 AM', box: 'CCB-02' },
    { id: '#LB10236', bookingId: '#LB10236', patient: 'Priya Sharma', patientName: 'Priya Sharma', test: 'Thyroid Profile', testName: 'Thyroid Profile', time: '12:30 PM', box: 'CCB-01' }
  ]);

  const [completedList, setCompletedList] = useState([
    { id: 'REP-9021', bookingId: 'ZM-LAB-781001-4402', patient: 'Rahul Verma', patientName: 'Rahul Verma', test: 'Complete Blood Count', testName: 'Complete Blood Count', time: '08:30 AM', pathologist: 'Dr. N. Bora, MD (Pathology)', status: 'Signed & Published' },
    { id: 'REP-9020', bookingId: 'ZM-LAB-781001-5198', patient: 'Ananya Baruah', patientName: 'Ananya Baruah', test: 'Vitamin D3 & B12 Vital Screen', testName: 'Vitamin D3 & B12 Vital Screen', time: 'Yesterday', pathologist: 'Dr. Arindam Sharma, MD', status: 'Signed & Published' },
    { id: 'REP-9019', bookingId: 'ZM-LAB-781001-6380', patient: 'Minati Shekhar', patientName: 'Minati Shekhar', test: 'Thyroid Profile Screen', testName: 'Thyroid Profile Screen', time: 'Yesterday', pathologist: 'Dr. N. Bora, MD (Pathology)', status: 'Signed & Published' },
    { id: 'REP-9018', bookingId: 'ZM-LAB-781001-7124', patient: 'Vikram Das', patientName: 'Vikram Das', test: 'Liver Function Test (LFT)', testName: 'Liver Function Test (LFT)', time: '11 Nov 2026', pathologist: 'Dr. S. Das, MD', status: 'Signed & Published' }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, text: 'Report uploaded for LB10238', time: '10:24 AM', icon: 'check' },
    { id: 2, text: 'Sample collected from Amit Verma (LB10237)', time: '09:50 AM', icon: 'check' },
    { id: 3, text: 'Test processing started for LB10236', time: '09:20 AM', icon: 'flask' },
    { id: 4, text: 'New booking assigned – LB10245', time: '08:45 AM', icon: 'calendar' }
  ]);

  // Synchronize local storage when jobs change
  useEffect(() => {
    try {
      localStorage.setItem('zestmed_lab_jobs', JSON.stringify(jobs));
    } catch (_) {}
  }, [jobs]);

  // Real-time fetching & synchronization with Supabase & localStorage
  useEffect(() => {
    let isMounted = true;
    const fetchBookings = async () => {
      try {
        const bookings = await getLabBookings();
        if (!isMounted || !bookings || bookings.length === 0) return;

        const liveItems = bookings.map((b, idx) => {
          const bId = b.booking_number || b.id || `#LB102${45 + idx}`;
          const isHome = !b.sample_type?.toLowerCase().includes('visit');
          const isCollected = ['Sample Collected', 'Cold-Chain Transit', 'Testing in Central Lab', 'Report Published', 'Report Ready', 'Collected'].includes(b.status);
          const isCheckedIn = b.status === 'Checked In';

          return {
            id: bId,
            bookingId: bId,
            patient: b.patient_name || b.patientName || 'Patient',
            patientName: b.patient_name || b.patientName || 'Patient',
            age: b.age || 35,
            gender: b.gender || 'Not Specified',
            phone: b.phone || b.patientPhone || '+91 92791 25091',
            contact: b.phone || b.patientPhone || '+91 92791 25091',
            test: b.test_name || b.testName || 'Diagnostic Investigation',
            testName: b.test_name || b.testName || 'Diagnostic Investigation',
            type: isHome ? 'Home Collection' : 'Lab Visit',
            time: b.collection_slot || b.time || '09:00 AM',
            slot: b.collection_slot || b.time || '09:00 AM',
            address: b.collection_address || b.address || 'Dispur, Guwahati',
            city: b.city || 'Guwahati',
            district: b.district || 'Kamrup Metro',
            pincode: b.pincode || '781005',
            landmark: b.landmark || 'Near Dispur Center',
            fastingRequired: b.fastingRequired || false,
            fastingVerified: isCollected,
            status: b.status || 'Pending Collection',
            action: isCollected ? 'Sample Collected' : isCheckedIn ? 'Checked In' : isHome ? 'Collect Sample' : 'Check In',
            barcode: b.barcode || `AS-BC-781005-09${idx + 1}`
          };
        });

        setTodaySchedule(prev => {
          const ids = new Set(prev.map(p => p.id));
          const newEntries = liveItems.filter(l => !ids.has(l.id));
          return [...newEntries, ...prev];
        });

        setJobs(prev => {
          const ids = new Set(prev.map(p => p.id || p.bookingId));
          const newEntries = liveItems.filter(l => !ids.has(l.id) && !ids.has(l.bookingId));
          return [...newEntries, ...prev];
        });
      } catch (err) {
        console.warn('[LabDashboard] Error loading live bookings:', err);
      }
    };

    fetchBookings();

    const handleStorageChange = (e) => {
      if (e.key === 'zestmed_patient_lab_bookings' || e.key === 'zestmed_lab_jobs') {
        fetchBookings();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Action Handlers
  const handleActionClick = (item) => {
    if (item.action === 'Collect Sample' || item.status === 'Pending Collection' || item.status === 'Scheduled') {
      setSelectedJobForCollection({
        id: item.id,
        bookingId: item.bookingId || item.id,
        patientName: item.patient || item.patientName,
        age: item.age || 32,
        gender: item.gender || 'Male',
        patientPhone: item.phone || item.contact || '+91 92791 25091',
        testName: item.test || item.testName,
        slot: item.time || item.slot,
        type: item.type,
        address: item.address || 'Basistha Chariali, Dispur, Guwahati',
        district: item.district || 'Kamrup Metro',
        pincode: item.pincode || '781005',
        landmark: item.landmark || 'Near Assam Secretariat Gate 2',
        fastingRequired: item.fastingRequired || false,
        fastingVerified: item.fastingVerified || false,
        barcode: item.barcode,
        status: item.status
      });
    } else if (item.action === 'Check In' || item.status === 'Awaiting Arrival') {
      const patientName = item.patient || item.patientName;
      setTodaySchedule((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, action: 'Checked In', status: 'Checked In' } : row))
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === item.id ? { ...j, status: 'Checked In' } : j))
      );
      updateLabBookingStatus(item.id, 'Checked In').catch(() => {});

      setRecentActivities((prev) => [
        {
          id: Date.now(),
          text: `Patient ${patientName} (${item.id}) checked in at lab`,
          time: 'Just now',
          icon: 'check'
        },
        ...prev
      ]);

      addToast(`Patient ${patientName} (${item.id}) checked in at Guwahati Central Lab.`, 'success');
    } else {
      addToast(`Current status for ${item.patient || item.patientName}: ${item.action || item.status}`, 'info');
    }
  };

  const handleConfirmCollection = (id, collectionData) => {
    const targetId = id || selectedJobForCollection?.id;
    if (!targetId) return;

    const patientName = selectedJobForCollection?.patient || selectedJobForCollection?.patientName || 'Patient';
    const testName = selectedJobForCollection?.test || selectedJobForCollection?.testName || 'Diagnostic Investigation';

    setTodaySchedule((prev) =>
      prev.map((row) =>
        row.id === targetId || row.bookingId === targetId
          ? {
              ...row,
              action: 'Sample Collected',
              status: 'Sample Collected',
              barcode: collectionData?.barcode || row.barcode,
              transitBoxId: collectionData?.transitBoxId || 'BOX-GUW-01'
            }
          : row
      )
    );

    setJobs((prev) =>
      prev.map((j) =>
        j.id === targetId || j.bookingId === targetId
          ? {
              ...j,
              status: 'Sample Collected',
              barcode: collectionData?.barcode || j.barcode,
              collectionTime: collectionData?.collectionTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              transitBoxId: collectionData?.transitBoxId || 'BOX-GUW-01'
            }
          : j
      )
    );

    // Add new specimen to analyzer processing workbench
    const newSpecimen = {
      id: collectionData?.barcode || `SPEC-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: targetId,
      patient: patientName,
      test: testName,
      analyzer: testName.toLowerCase().includes('blood') || testName.toLowerCase().includes('cbc')
        ? 'Mindray BC-5150 Hematology'
        : testName.toLowerCase().includes('thyroid') || testName.toLowerCase().includes('lipid')
        ? 'Roche Cobas c311 Biochemistry'
        : 'Bio-Rad D-10 Analyzer',
      status: 'Centrifugation & Assay',
      progress: 35,
      eta: '18m'
    };
    setProcessingList((prev) => [newSpecimen, ...prev]);

    updateLabBookingStatus(targetId, 'Sample Collected').catch(() => {});

    setRecentActivities((prev) => [
      {
        id: Date.now(),
        text: `Sample collected from ${patientName} (${targetId})`,
        time: 'Just now',
        icon: 'check'
      },
      ...prev
    ]);

    setSelectedJobForCollection(null);
    addToast(`Sample collected for ${patientName}! Barcode: ${collectionData?.barcode || 'AS-BC-OK'}`, 'success');
  };

  const handleAuthorizeResults = (proc) => {
    setProcessingList((prev) =>
      prev.map((it) => (it.id === proc.id ? { ...it, progress: 100, status: 'Ready for Report' } : it))
    );

    setPendingUploadList((prev) => {
      const exists = prev.some((p) => p.id === proc.id || p.bookingId === proc.bookingId);
      if (exists) return prev;
      return [
        {
          id: proc.bookingId || proc.id,
          bookingId: proc.bookingId || proc.id,
          patient: proc.patient,
          patientName: proc.patient,
          test: proc.test,
          testName: proc.test,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          box: 'CCB-01'
        },
        ...prev
      ];
    });

    updateLabBookingStatus(proc.bookingId || proc.id, 'Testing in Central Lab').catch(() => {});

    setRecentActivities((prev) => [
      {
        id: Date.now(),
        text: `Test processing authorized for ${proc.id}`,
        time: 'Just now',
        icon: 'flask'
      },
      ...prev
    ]);

    addToast(`Specimen ${proc.id} authorized! Added to Upload Reports desk.`, 'success');
  };

  const handlePublishReport = (id, reportData) => {
    setSelectedJobForPublish(null);
    const target = pendingUploadList.find((p) => p.id === id || p.bookingId === id) || selectedJobForPublish;
    const patientName = target?.patient || target?.patientName || 'Patient';
    const testName = target?.test || target?.testName || 'Diagnostic Investigation';

    setPendingUploadList((prev) => prev.filter((p) => p.id !== id && p.bookingId !== id));

    const newCompleted = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId: id,
      patient: patientName,
      patientName,
      test: testName,
      testName,
      time: reportData?.publishedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pathologist: reportData?.reportingDoctor || 'Dr. Pranabesh Sarma, MD Pathology (AMC-29182-AS)',
      status: 'Signed & Published',
      reportData: reportData?.findings || [],
      findings: reportData?.findings || [],
      pathologistNote: reportData?.pathologistNote
    };

    setCompletedList((prev) => [newCompleted, ...prev]);

    updateLabBookingStatus(id, 'Report Published').catch(() => {});

    try {
      const storedLabs = JSON.parse(localStorage.getItem('zestmed_patient_lab_bookings') || '[]');
      const updated = storedLabs.map((b) =>
        b.id === id || b.booking_number === id
          ? {
              ...b,
              status: 'Report Ready',
              reportData: reportData?.findings,
              reportUrl: `/reports/${id}.pdf`,
              pathologist: reportData?.reportingDoctor
            }
          : b
      );
      localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(updated));
    } catch (_) {}

    setRecentActivities((prev) => [
      {
        id: Date.now(),
        text: `Report published for ${patientName} (${id})`,
        time: 'Just now',
        icon: 'check'
      },
      ...prev
    ]);

    addToast(`Diagnostic report for ${patientName} (${id}) signed & published!`, 'success');
  };

  const handleCreateJob = async (newJob) => {
    setIsNewJobModalOpen(false);

    try {
      await bookLabTest({
        id: newJob.id,
        booking_number: newJob.bookingId || newJob.id,
        patientName: newJob.patientName,
        phone: newJob.contact,
        testName: newJob.testName,
        sampleType: newJob.category || 'Blood',
        address: `${newJob.address}, ${newJob.city} - ${newJob.pincode}`,
        date: new Date().toISOString().split('T')[0],
        time: newJob.scheduledSlot,
        price: 599,
        status: 'Scheduled',
        phlebotomist: newJob.assignedPhlebotomist?.name || 'Rohit Sharma'
      });
    } catch (_) {}

    setJobs((prev) => [newJob, ...prev]);

    const scheduleRow = {
      id: newJob.id,
      bookingId: newJob.bookingId,
      time: newJob.scheduledSlot?.split('-')?.[0]?.trim() || '08:00 AM',
      patient: newJob.patientName,
      patientName: newJob.patientName,
      age: newJob.age,
      gender: newJob.gender,
      test: newJob.testName,
      testName: newJob.testName,
      type: 'Home Collection',
      action: 'Collect Sample',
      status: 'Pending Collection',
      phone: newJob.contact,
      address: `${newJob.address}, ${newJob.city} - ${newJob.pincode}`,
      district: newJob.district,
      pincode: newJob.pincode,
      landmark: newJob.landmark,
      barcode: newJob.barcode
    };

    setTodaySchedule((prev) => [scheduleRow, ...prev]);

    setRecentActivities((prev) => [
      {
        id: Date.now(),
        text: `New booking assigned – ${newJob.id}`,
        time: 'Just now',
        icon: 'calendar'
      },
      ...prev
    ]);

    addToast(`New phlebotomy job dispatch created for ${newJob.patientName}!`, 'success');
  };

  const handleScanBarcode = () => {
    if (!barcodeInput.trim()) {
      addToast('Please enter or scan a barcode.', 'error');
      return;
    }
    const cleanCode = barcodeInput.trim();
    const matching = todaySchedule.find(
      (s) => s.barcode === cleanCode || s.id === cleanCode || s.bookingId === cleanCode
    );
    if (matching) {
      handleActionClick(matching);
      addToast(`Barcode ${cleanCode} linked to patient ${matching.patient} (${matching.test})!`, 'success');
    } else {
      const pending = todaySchedule.find((s) => s.action === 'Collect Sample');
      if (pending) {
        setTodaySchedule((prev) =>
          prev.map((s) => (s.id === pending.id ? { ...s, barcode: cleanCode } : s))
        );
        addToast(`Barcode ${cleanCode} assigned to ${pending.patient} in Cold-Chain Box CCB-01!`, 'success');
      } else {
        addToast(`Barcode ${cleanCode} verified and synchronized with Cold-Chain Box CCB-01 (3.8°C).`, 'success');
      }
    }
  };

  const handleQuickMarkCollection = () => {
    const pending = todaySchedule.find(
      (s) => s.action === 'Collect Sample' || s.status === 'Pending Collection'
    );
    if (pending) {
      handleActionClick(pending);
    } else {
      addToast('All scheduled morning collections are already marked complete!', 'info');
    }
  };

  const handleQuickUpdateStatus = () => {
    const active = processingList.find((p) => p.progress < 100);
    if (active) {
      setProcessingList((prev) =>
        prev.map((p) =>
          p.id === active.id
            ? {
                ...p,
                progress: Math.min(100, p.progress + 25),
                status: p.progress + 25 >= 100 ? 'Ready for Report' : 'Running Assay'
              }
            : p
        )
      );
      addToast(
        `Specimen ${active.id} progress updated to ${Math.min(100, active.progress + 25)}% in ${active.analyzer}`,
        'success'
      );
    } else {
      addToast('All current specimens have completed automated analyzer testing.', 'info');
    }
  };

  const handleQuickUploadReport = () => {
    const ready = pendingUploadList[0] || {
      id: '#LB10238',
      bookingId: '#LB10238',
      patientName: 'Sneha Singh',
      testName: 'Complete Blood Count (CBC)',
      collectedAt: '10:15 AM'
    };
    setSelectedJobForPublish({
      id: ready.id,
      bookingId: ready.bookingId || ready.id,
      patientName: ready.patient || ready.patientName,
      testName: ready.test || ready.testName,
      collectedAt: ready.time || '10:15 AM'
    });
  };

  const handleViewReport = (item) => {
    setSelectedJobForReportView({
      id: item.id || item.bookingId,
      bookingId: item.bookingId || item.id,
      patientName: item.patient || item.patientName,
      testName: item.test || item.testName,
      date: item.time || 'Nov 13, 2026',
      barcode: item.barcode || 'ZM-ASSAM-9021',
      status: 'Report Ready',
      reportData: item.reportData || item.findings,
      pathologist: item.pathologist
    });
  };

  // Filter Helper for real-time search
  const matchesSearch = (item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const str = [
      item.id,
      item.bookingId,
      item.patient,
      item.patientName,
      item.test,
      item.testName,
      item.address,
      item.barcode,
      item.city,
      item.phone,
      item.contact
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return str.includes(q);
  };

  // Real-time dynamic KPI metrics
  const assignedCount = jobs.length;
  const todayCount = todaySchedule.length;
  const collectedCount =
    todaySchedule.filter((j) =>
      ['Sample Collected', 'Cold-Chain Transit', 'Testing in Central Lab', 'Report Published', 'Report Ready', 'Collected'].includes(j.status)
    ).length +
    jobs.filter((j) =>
      ['Sample Collected', 'Cold-Chain Transit', 'Testing in Central Lab', 'Report Published', 'Report Ready', 'Collected'].includes(j.status)
    ).length;
  const processingCount = processingList.filter((p) => p.progress < 100).length;
  const pendingReportsCount = pendingUploadList.length;
  const completedCount = completedList.length;

  // Real-time donut chart math
  const displayCollected = Math.max(collectedCount, 8);
  const totalTasks = Math.max(1, displayCollected + processingCount + pendingReportsCount + Math.max(0, todayCount - collectedCount));
  const cCircumference = 377; // 2 * PI * 60
  const samplesDash = ((displayCollected / totalTasks) * cCircumference).toFixed(1);
  const procDash = ((processingCount / totalTasks) * cCircumference).toFixed(1);
  const reportsDash = ((pendingReportsCount / totalTasks) * cCircumference).toFixed(1);

  // Category breakdown for Assigned Tests Overview
  const bloodCount =
    jobs.filter((j) => {
      const t = (j.testName || j.test || '').toLowerCase();
      return t.includes('blood') || t.includes('cbc') || t.includes('esr') || t.includes('hemoglobin');
    }).length || 10;

  const hormoneCount =
    jobs.filter((j) => {
      const t = (j.testName || j.test || '').toLowerCase();
      return t.includes('thyroid') || t.includes('tsh') || t.includes('hormone') || t.includes('vitamin');
    }).length || 6;

  const organCount =
    jobs.filter((j) => {
      const t = (j.testName || j.test || '').toLowerCase();
      return t.includes('liver') || t.includes('lft') || t.includes('kidney') || t.includes('kft') || t.includes('creatinine');
    }).length || 4;

  const otherCount = Math.max(1, jobs.length - (bloodCount + hormoneCount + organCount)) || 8;
  const maxCategory = Math.max(bloodCount, hormoneCount, organCount, otherCount, 1);

  // Filtered lists based on search query
  const displayedSchedule = todaySchedule.filter(matchesSearch);
  const displayedAssigned = jobs
    .filter((j) => {
      if (assignedFilter === 'all') return true;
      if (assignedFilter === 'home') return j.type === 'Home Collection';
      if (assignedFilter === 'lab') return j.type === 'Lab Visit';
      return true;
    })
    .filter(matchesSearch);

  const displayedProcessing = processingList.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (p.id + ' ' + p.patient + ' ' + p.test + ' ' + p.analyzer).toLowerCase().includes(q);
  });

  const displayedUploads = pendingUploadList.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (u.id + ' ' + (u.patient || u.patientName) + ' ' + (u.test || u.testName)).toLowerCase().includes(q);
  });

  const displayedCompleted = completedList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (c.id + ' ' + (c.patient || c.patientName) + ' ' + (c.test || c.testName) + ' ' + (c.pathologist || '')).toLowerCase().includes(q);
  });

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
                setIsSidebarOpen(false);
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
                setIsSidebarOpen(false);
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
                setActiveMenu('collection');
                setIsSidebarOpen(false);
                addToast('Opening Phlebotomy Sample Collection Workbench', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'collection'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                setActiveMenu('upload-reports');
                setIsSidebarOpen(false);
                addToast('Opening Pathology Report Upload Desk', 'info');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                activeMenu === 'upload-reports'
                  ? 'bg-[#14B8A6] text-white shadow-sm'
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
                  ? 'bg-[#14B8A6] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Tests</span>
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
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition"
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

              {/* Notifications Popover matching User Dashboard System */}
              <NotificationPopover
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={labNotifications}
                onNotificationClick={handleLabNotificationClick}
              />
            </div>

            {/* User Profile Info */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition text-left"
              >
                {/* Circular Photo Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-[#14B8A6]/20 bg-slate-100 shrink-0">
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
                  {assignedCount}
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
                  {todayCount}
                </div>
              </div>
            </div>

            {/* 3. Samples Collected */}
            <div
              onClick={() => setActiveMenu('collection')}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-3.5 hover:shadow-md hover:border-teal-300 transition cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <Syringe className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium leading-none">
                  Collected
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1.5 leading-none">
                  {displayCollected}
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
                  {processingCount}
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
                  {pendingReportsCount}
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
                  {completedCount}
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. MIDDLE SECTION: TODAY'S SCHEDULE + PROGRESS & ACTIONS */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Today's Schedule (~65% width -> lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Today's Schedule ({todayCount})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu('schedule');
                    addToast(`Opening full ${todayCount} appointment roster (Assam Phlebotomy)`, 'info');
                  }}
                  className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Schedule Table Rows */}
              <div className="space-y-3 pt-1">
                {displayedSchedule.slice(0, 5).map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100 gap-2.5 sm:gap-3"
                  >
                    {/* Time Badge */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold shrink-0">
                        {row.time}
                      </div>

                      {/* Patient Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 truncate">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{row.patient || row.patientName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {row.id}
                        </div>
                      </div>
                    </div>

                    {/* Test Name */}
                    <div className="text-xs font-medium text-slate-800 min-w-0 truncate">
                      {row.test || row.testName}
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
                          className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          Collect Sample
                        </button>
                      ) : row.action === 'Check In' ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(row)}
                          className="bg-white hover:bg-teal-50 text-[#14B8A6] border border-[#14B8A6] px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                          <span>{row.action}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {displayedSchedule.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No appointments match your search criteria.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Task Progress & Quick Actions (~35% width -> lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Upper Card: Task Progress Today */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Task Progress Today
                  </h3>
                </div>

                {/* Donut Chart + Legend Side-by-Side */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
                  {/* SVG Donut Chart with center text */}
                  <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                      {/* Circle 1: Samples Collected */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#14B8A6"
                        strokeWidth="20"
                        strokeDasharray={`${samplesDash} 377`}
                        strokeDashoffset="0"
                      />
                      {/* Circle 2: Tests Processing */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#38BDF8"
                        strokeWidth="20"
                        strokeDasharray={`${procDash} 377`}
                        strokeDashoffset={`-${samplesDash}`}
                      />
                      {/* Circle 3: Reports Uploaded */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="transparent"
                        stroke="#FBBF24"
                        strokeWidth="20"
                        strokeDasharray={`${reportsDash} 377`}
                        strokeDashoffset={`-${(parseFloat(samplesDash) + parseFloat(procDash)).toFixed(1)}`}
                      />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                      <span className="text-xl font-black text-slate-900 leading-none">
                        {totalTasks}
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
                      <span className="font-bold text-slate-900 text-xs">{displayCollected}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                        <span className="text-slate-700 font-medium text-[11.5px]">Tests Processing</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">{processingCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                        <span className="text-slate-700 font-medium text-[11.5px]">Reports Uploaded</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">{pendingReportsCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C084FC]" />
                        <span className="text-slate-700 font-medium text-[11.5px]">Pending</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs">{Math.max(0, todayCount - collectedCount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Card: Quick Actions */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Quick Actions
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {/* 1. Mark Collection */}
                  <button
                    type="button"
                    onClick={handleQuickMarkCollection}
                    className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
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
                    onClick={handleQuickUpdateStatus}
                    className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
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
                    onClick={handleQuickUploadReport}
                    className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
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
                      addToast(`Viewing all ${assignedCount} assigned bookings for Assam region`, 'info');
                    }}
                    className="bg-white border border-slate-100 hover:border-[#14B8A6] hover:shadow-xs p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition group cursor-pointer"
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
                  <Activity className="w-5 h-5 text-[#14B8A6]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Activities
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(true)}
                  className="text-xs font-semibold text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Activity Items */}
              <div className="space-y-3 pt-1">
                {recentActivities.slice(0, 4).map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        act.icon === 'flask'
                          ? 'bg-blue-50 text-blue-600'
                          : act.icon === 'calendar'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {act.icon === 'flask' ? (
                          <FlaskConical className="w-4 h-4" />
                        ) : act.icon === 'calendar' ? (
                          <Calendar className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {act.text}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Assigned Tests Overview (~55% width -> lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#14B8A6]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Assigned Tests Overview
                </h3>
              </div>

              {/* Dynamic Progress Bars */}
              <div className="space-y-4 pt-1">
                {/* 1. Blood Tests */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Blood Tests</span>
                    <span className="font-bold text-slate-900 font-mono">{bloodCount}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#14B8A6] rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((bloodCount / maxCategory) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 2. Hormone Tests */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Hormone Tests</span>
                    <span className="font-bold text-slate-900 font-mono">{hormoneCount}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#38BDF8] rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((hormoneCount / maxCategory) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 3. Liver & Kidney Tests */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Liver & Kidney Tests</span>
                    <span className="font-bold text-slate-900 font-mono">{organCount}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FBBF24] rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((organCount / maxCategory) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* 4. Other Tests */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Other Tests</span>
                    <span className="font-bold text-slate-900 font-mono">{otherCount}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#A855F7] rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((otherCount / maxCategory) * 100)}%` }}
                    />
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
                    <Users className="w-6 h-6 text-[#14B8A6]" />
                    <span>Assigned Phlebotomy & Lab Bookings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {assignedCount} assigned home collections & center walk-ins across Kamrup Metro & Dispur.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewJobModalOpen(true)}
                  className="bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Job Dispatch</span>
                </button>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: `All Assigned (${assignedCount})` },
                  { id: 'home', label: 'Home Collection' },
                  { id: 'lab', label: 'Lab Visit' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAssignedFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      assignedFilter === f.id
                        ? 'bg-[#14B8A6] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Jobs List */}
              <div className="space-y-3.5">
                {displayedAssigned.map((j) => (
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
                            <h3 className="text-sm font-bold text-slate-900">{j.patient || j.patientName}</h3>
                            <span className="text-xs font-mono text-slate-400">({j.id})</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{j.test || j.testName}</p>
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
                          {j.time || j.slot || '09:00 AM'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{j.address || 'Basistha Chariali, Dispur (Guwahati)'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{j.phone || j.contact || '+91 92791 25091'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleActionClick(j)}
                          className="px-3.5 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Syringe className="w-3.5 h-3.5" />
                          <span>{j.action || (j.status === 'Sample Collected' ? 'Collected' : 'Collect Sample')}</span>
                        </button>
                        <a
                          href={`tel:${j.phone || j.contact || '+919279125091'}`}
                          onClick={() => addToast(`Dialing patient ${j.patient || j.patientName}...`, 'info')}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                          title="Call Patient"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((j.address || j.patient || 'Guwahati') + ' Assam')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => addToast(`Navigation route loaded for ${j.patient || j.patientName}.`, 'info')}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
                          title="Directions"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {displayedAssigned.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No assigned bookings match your search or filter.
                  </div>
                )}
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
                    <Calendar className="w-6 h-6 text-[#14B8A6]" />
                    <span>Today's Shift Roster & Route Schedule</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Morning Shift: 08:00 AM - 04:30 PM • Phlebotomist: Rohit Sharma (Dispur Hub)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
                    {todayCount} Appointments Scheduled
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="space-y-3">
                  {displayedSchedule.map((row, idx) => (
                    <div
                      key={row.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-100/60 text-[#14B8A6] font-black text-sm flex items-center justify-center shrink-0">
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
                            {row.patient || row.patientName} • <span className="text-slate-500 font-normal">{row.test || row.testName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleActionClick(row)}
                          className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          {row.action}
                        </button>
                      </div>
                    </div>
                  ))}
                  {displayedSchedule.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No scheduled appointments match your search criteria.
                    </div>
                  )}
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
                  <Syringe className="w-6 h-6 text-[#14B8A6]" />
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
                    <span className="text-xl font-black text-purple-900 font-mono">{displayCollected} Specimens</span>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleScanBarcode();
                      }
                    }}
                    placeholder="Scan or enter barcode (e.g. AS-BC-781005-092)"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-[#14B8A6]"
                  />
                  <button
                    type="button"
                    onClick={handleScanBarcode}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold rounded-xl transition shrink-0 cursor-pointer"
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
                        className="px-3.5 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Collect Sample
                      </button>
                    </div>
                  ))}
                  {todaySchedule.filter((r) => r.action === 'Collect Sample').length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400">
                      All scheduled field collections have been successfully completed!
                    </div>
                  )}
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
                  <Package className="w-6 h-6 text-[#14B8A6]" />
                  <span>Laboratory Testing & Analyzer Centrifugation</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Central diagnostic equipment status (Mindray BC-5150 Hematology, Roche Cobas c311 Biochemistry).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedProcessing.map((proc) => (
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
                        <span className="font-bold text-[#14B8A6]">{proc.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#14B8A6] rounded-full transition-all duration-500" style={{ width: `${proc.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Status: <strong className="text-slate-800">{proc.status}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleAuthorizeResults(proc)}
                        className="px-3 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                      >
                        Authorize Results
                      </button>
                    </div>
                  </div>
                ))}
                {displayedProcessing.length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
                    No active laboratory testing specimens match your criteria.
                  </div>
                )}
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
                  <Upload className="w-6 h-6 text-[#14B8A6]" />
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
                      {displayedUploads.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{j.id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{j.patient || j.patientName}</td>
                          <td className="py-3.5 px-4 text-slate-700">{j.test || j.testName}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{j.time || '10:15 AM'}</td>
                          <td className="py-3.5 px-4 text-teal-600 font-mono">{j.box || 'CCB-01'}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedJobForPublish({
                                  id: j.id,
                                  bookingId: j.bookingId || j.id,
                                  patientName: j.patient || j.patientName,
                                  testName: j.test || j.testName,
                                  collectedAt: j.time || '10:15 AM'
                                });
                              }}
                              className="px-3.5 py-1.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                            >
                              Fill & Publish
                            </button>
                          </td>
                        </tr>
                      ))}
                      {displayedUploads.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No diagnostic reports are pending upload. All collected specimens processed!
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
          {/* 6. COMPLETED TESTS ARCHIVE VIEW                          */}
          {/* ======================================================== */}
          {activeMenu === 'completed' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-[#14B8A6]" />
                  <span>Authorized & Published Test Reports ({completedCount})</span>
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
                      {displayedCompleted.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">{c.patient || c.patientName}</td>
                          <td className="py-3.5 px-4 text-slate-700">{c.test || c.testName}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">{c.time}</td>
                          <td className="py-3.5 px-4 text-slate-600">{c.pathologist}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewReport(c)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-[#14B8A6] hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              View PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                      {displayedCompleted.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No authorized test reports match your criteria.
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
          {/* 8. MY PROFILE VIEW                                       */}
          {/* ======================================================== */}
          {activeMenu === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <User className="w-6 h-6 text-[#14B8A6]" />
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
                  className="w-full py-2.5 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold rounded-xl text-xs transition shadow-xs"
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
          isOpen={!!selectedJobForCollection}
          job={selectedJobForCollection}
          onClose={() => setSelectedJobForCollection(null)}
          onConfirmCollection={handleConfirmCollection}
          onConfirm={handleConfirmCollection}
        />
      )}

      {/* Publish Diagnostic Report Modal */}
      {selectedJobForPublish && (
        <PublishReportModal
          isOpen={!!selectedJobForPublish}
          job={selectedJobForPublish}
          onClose={() => setSelectedJobForPublish(null)}
          onPublishReport={handlePublishReport}
          onPublish={handlePublishReport}
        />
      )}

      {/* Digital Lab Report Modal */}
      {selectedJobForReportView && (
        <DigitalLabReportModal
          isOpen={!!selectedJobForReportView}
          booking={selectedJobForReportView}
          onClose={() => setSelectedJobForReportView(null)}
        />
      )}

      {/* New Lab Job Dispatch Modal */}
      {isNewJobModalOpen && (
        <NewLabJobModal
          isOpen={isNewJobModalOpen}
          onClose={() => setIsNewJobModalOpen(false)}
          onAddJob={handleCreateJob}
          onCreateJob={handleCreateJob}
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
