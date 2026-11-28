// src/components/admin/BookingsManagementView.jsx
import React, { useState, useMemo } from 'react';
import { 
  Calendar, Search, Filter, Download, Stethoscope, FlaskConical, 
  Activity, Scissors, Heart, Package, CheckCircle2, Clock, XCircle, 
  ChevronRight, ChevronLeft, Phone, ExternalLink, RefreshCw, Eye, 
  AlertCircle, ArrowUpDown, User, MapPin, CreditCard, X, ChevronDown, Check
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function BookingsManagementView({
  doctorAppointments = [],
  physioAppointments = [],
  surgeryBookings = [],
  diagnosticLabBookings = [],
  wellnessBookings = [],
  medicineOrders = [],
  onUpdateStatus,
  onViewBooking,
  onRefresh,
  isLoading = false
}) {
  const { addToast } = useToast();
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper to parse dates into timestamp for sorting & date filtering
  const parseBookingDate = (dateStr, createdAtStr) => {
    if (createdAtStr) {
      const t = new Date(createdAtStr).getTime();
      if (!isNaN(t)) return t;
    }
    if (!dateStr) return 0;
    if (dateStr === 'Today') return Date.now();
    if (dateStr === 'Yesterday') return Date.now() - 86400000;
    const parsed = new Date(dateStr).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // 1. Normalize and aggregate all bookings across all 6 services with strict deduplication
  const allBookings = useMemo(() => {
    const list = [];
    const seenRefs = new Set();

    const addUnique = (booking) => {
      const key = String(booking.bookingRef || booking.id || '').toLowerCase().trim();
      if (!key || seenRefs.has(key)) return;
      seenRefs.add(key);
      list.push(booking);
    };

    // 1. Doctor Consultations
    (doctorAppointments || []).forEach(item => {
      const ref = item.bookingId || item.appointment_number || item.id || `DOC-${Date.now()}`;
      addUnique({
        id: item.id || ref,
        rawId: item.rawId || item.id,
        bookingRef: ref,
        serviceType: 'doctor',
        serviceTitle: 'Doctor Consult',
        serviceIcon: Stethoscope,
        serviceBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        uhid: item.uhid || item.profile_id || '',
        details: item.doctor || item.doctorName || item.title || 'Specialist Consult',
        subDetails: item.specialty || item.department || item.doctorSpecialty || 'Clinical Medicine',
        date: item.date || item.appointment_date || 'Today',
        time: item.time || item.appointment_time || item.slot || '10:00 AM',
        amount: Number(item.fee || item.fees || item.price || 600),
        status: item.status || 'Confirmed',
        paymentStatus: item.paymentStatus || item.payment_status || 'Paid Online',
        paymentMethod: item.paymentMethod || 'Online / UPI',
        facility: item.hospital || item.clinic || 'Dispur Polyclinic Hub',
        createdAt: item.createdAt || item.created_at || item.date || '',
        timestamp: parseBookingDate(item.date, item.createdAt || item.created_at),
        raw: item
      });
    });

    // 2. Physiotherapy Sessions
    (physioAppointments || []).forEach(item => {
      const ref = item.bookingId || item.booking_number || item.id || `PHY-${Date.now()}`;
      addUnique({
        id: item.id || ref,
        rawId: item.rawId || item.id,
        bookingRef: ref,
        serviceType: 'physio',
        serviceTitle: 'Physiotherapy',
        serviceIcon: Activity,
        serviceBadgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        uhid: item.uhid || item.profile_id || '',
        details: item.condition || item.specialty || item.title || 'Physical Rehabilitation',
        subDetails: item.serviceType || item.mode || 'Home Visit Session',
        date: item.date || item.booking_date || item.session_date || 'Today',
        time: item.time || item.preferred_slot || item.session_time || '11:00 AM',
        amount: Number(item.fee || item.fees || item.price || 799),
        status: item.status || 'Confirmed',
        paymentStatus: item.paymentStatus || item.payment_status || 'Paid Online',
        paymentMethod: item.paymentMethod || 'Online / UPI',
        facility: item.address || 'Guwahati Home Visit Hub',
        createdAt: item.createdAt || item.created_at || item.date || '',
        timestamp: parseBookingDate(item.date, item.createdAt || item.created_at),
        raw: item
      });
    });

    // 3. Surgery Packages
    (surgeryBookings || []).forEach(item => {
      const ref = item.bookingId || item.booking_number || item.id || `SUR-${Date.now()}`;
      addUnique({
        id: item.id || ref,
        rawId: item.rawId || item.id,
        bookingRef: ref,
        serviceType: 'surgery',
        serviceTitle: 'Surgery Package',
        serviceIcon: Scissors,
        serviceBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        uhid: item.uhid || item.profile_id || '',
        details: item.surgeryName || item.surgery_name || item.title || 'Surgical Procedure',
        subDetails: item.hospitalPreference || item.hospital || 'Dispur Partner Hospital',
        date: item.date || item.preferred_date || 'Scheduled',
        time: item.time || item.slot || '09:00 AM',
        amount: Number(item.amount || item.fee || item.price || item.estimated_cost || 35000),
        status: item.status || 'Confirmed',
        paymentStatus: item.paymentStatus || item.insurance_status || 'TPA Cashless / Covered',
        paymentMethod: item.paymentMethod || 'Ayushman Bharat / TPA',
        facility: item.hospital || 'Daycare Surgical Center',
        createdAt: item.createdAt || item.created_at || item.preferred_date || '',
        timestamp: parseBookingDate(item.date, item.createdAt || item.created_at),
        raw: item
      });
    });

    // 4. Diagnostic Lab Tests
    (diagnosticLabBookings || []).forEach(item => {
      const ref = item.bookingId || item.booking_number || item.id || `LAB-${Date.now()}`;
      addUnique({
        id: item.id || ref,
        rawId: item.rawId || item.id,
        bookingRef: ref,
        serviceType: 'lab',
        serviceTitle: 'Diagnostic Lab',
        serviceIcon: FlaskConical,
        serviceBadgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        uhid: item.uhid || item.profile_id || '',
        details: item.testName || item.test_name || 'Clinical Investigation',
        subDetails: item.specimen || (item.sampleType ? `Sample: ${item.sampleType}` : 'Blood / Serum Sample'),
        date: item.collectionDate || item.collection_date || item.date || 'Today',
        time: item.collectionSlot || item.collection_slot || item.time || '08:00 AM',
        amount: Number(item.price || item.total_price || item.amount || 499),
        status: item.status || 'Pending Collection',
        paymentStatus: item.paymentStatus || item.payment_status || 'Paid Online',
        paymentMethod: item.paymentMethod || 'Online / Card',
        facility: item.collectionAddress || item.address || 'Guwahati Home Collection',
        createdAt: item.createdAt || item.created_at || item.collectionDate || '',
        timestamp: parseBookingDate(item.collectionDate || item.date, item.createdAt || item.created_at),
        raw: item
      });
    });

    // 5. Wellness Health Packages
    (wellnessBookings || []).forEach(item => {
      const ref = item.bookingId || item.booking_number || item.id || `WEL-${Date.now()}`;
      addUnique({
        id: item.id || ref,
        rawId: item.rawId || item.id,
        bookingRef: ref,
        serviceType: 'wellness',
        serviceTitle: 'Wellness Package',
        serviceIcon: Heart,
        serviceBadgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        uhid: item.uhid || item.profile_id || '',
        details: item.packageName || item.package_name || item.testName || 'Comprehensive Health Package',
        subDetails: item.testCode ? `Code: ${item.testCode}` : 'Full Body Preventive Profile',
        date: item.booking_date || item.collectionDate || item.date || 'Today',
        time: item.time_slot || item.time || item.preferred_slot || '08:30 AM',
        amount: Number(item.total_amount || item.price || item.amount || 1999),
        status: item.status || 'Confirmed',
        paymentStatus: item.paymentStatus || item.payment_status || 'Paid Online',
        paymentMethod: item.paymentMethod || 'Online / UPI',
        facility: item.collectionAddress || item.address || 'Home Collection Hub',
        createdAt: item.createdAt || item.created_at || item.booking_date || '',
        timestamp: parseBookingDate(item.date, item.createdAt || item.created_at),
        raw: item
      });
    });

    // 6. Pharmacy Medicine Orders
    (medicineOrders || []).forEach(item => {
      const ref = item.orderId || item.order_number || item.id || `ORD-${Date.now()}`;
      const rawPayment = String(item.paymentMethod || item.payment_method || item.payment || 'UPI Paid');
      const isCod = rawPayment.toLowerCase().includes('cash') || rawPayment.toLowerCase().includes('cod');
      
      addUnique({
        id: item.id || ref,
        rawId: item.rawId || item.id,
        bookingRef: ref,
        serviceType: 'order',
        serviceTitle: 'Medicine Order',
        serviceIcon: Package,
        serviceBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        patientName: item.customer || item.customer_name || item.patientName || 'Customer',
        patientPhone: item.phone || item.customer_phone || item.patientPhone || '',
        uhid: item.uhid || item.profile_id || '',
        details: item.items || item.medicineName || 'Prescription Pharmaceuticals',
        subDetails: item.deliveryAddress || item.address || 'Guwahati Doorstep Delivery',
        date: item.date || item.order_date || 'Today',
        time: item.time || item.order_time || '10:00 AM',
        amount: Number(item.total || item.total_amount || item.amount || 0),
        status: item.status || item.order_status || 'Processing',
        paymentStatus: isCod ? 'Cash on Delivery' : 'Paid Online',
        paymentMethod: rawPayment,
        facility: item.deliveryAddress || 'Guwahati Express Delivery',
        createdAt: item.createdAt || item.created_at || item.order_date || '',
        timestamp: parseBookingDate(item.date, item.createdAt || item.created_at),
        raw: item
      });
    });

    return list;
  }, [doctorAppointments, physioAppointments, surgeryBookings, diagnosticLabBookings, wellnessBookings, medicineOrders]);

  // 2. Filter & Search Logic
  const filteredBookings = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    return allBookings.filter(item => {
      // Service filter
      if (serviceFilter !== 'all' && item.serviceType !== serviceFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const s = (item.status || '').toLowerCase();
        if (statusFilter === 'confirmed' && !(s.includes('confirm') || s.includes('schedule') || s.includes('admit'))) return false;
        if (statusFilter === 'pending' && !(s.includes('pending') || s.includes('process') || s.includes('progress') || s.includes('collect') || s.includes('verified') || s.includes('dispatch'))) return false;
        if (statusFilter === 'completed' && !(s.includes('complet') || s.includes('deliver') || s.includes('publish') || s.includes('ready') || s.includes('discharg'))) return false;
        if (statusFilter === 'cancelled' && !s.includes('cancel')) return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        const p = (item.paymentStatus || '').toLowerCase();
        if (paymentFilter === 'paid' && !(p.includes('paid') || p.includes('cashless') || p.includes('covered') || p.includes('upi') || p.includes('card'))) return false;
        if (paymentFilter === 'pending' && !p.includes('pending')) return false;
        if (paymentFilter === 'cod' && !(p.includes('cash') || p.includes('cod'))) return false;
      }

      // Date filter
      if (dateFilter !== 'all' && item.timestamp > 0) {
        const diff = now - item.timestamp;
        if (dateFilter === 'today' && diff > oneDayMs * 1.5) return false;
        if (dateFilter === 'week' && diff > sevenDaysMs) return false;
        if (dateFilter === 'month' && diff > thirtyDaysMs) return false;
      }

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const pName = (item.patientName || '').toLowerCase();
        const pPhone = (item.patientPhone || '').toLowerCase();
        const bRef = (item.bookingRef || '').toLowerCase();
        const bDet = (item.details || '').toLowerCase();
        const bSub = (item.subDetails || '').toLowerCase();
        const sTitle = (item.serviceTitle || '').toLowerCase();
        const stat = (item.status || '').toLowerCase();
        const pay = (item.paymentStatus || '').toLowerCase();

        const match = pName.includes(q) ||
          pPhone.includes(q) ||
          bRef.includes(q) ||
          bDet.includes(q) ||
          bSub.includes(q) ||
          sTitle.includes(q) ||
          stat.includes(q) ||
          pay.includes(q);

        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.timestamp || 0) - (a.timestamp || 0);
      if (sortBy === 'oldest') return (a.timestamp || 0) - (b.timestamp || 0);
      if (sortBy === 'amount-high') return (b.amount || 0) - (a.amount || 0);
      if (sortBy === 'amount-low') return (a.amount || 0) - (b.amount || 0);
      if (sortBy === 'patient') return (a.patientName || '').localeCompare(b.patientName || '');
      return 0;
    });
  }, [allBookings, serviceFilter, statusFilter, paymentFilter, dateFilter, sortBy, searchQuery]);

  // 3. Pagination calculations
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  // Status cycling / updating
  const handleStatusChange = async (booking, newStatus) => {
    if (!newStatus || !onUpdateStatus) return;
    setUpdatingId(booking.id || booking.bookingRef);
    try {
      await onUpdateStatus(booking, newStatus);
      if (selectedBookingForModal && (selectedBookingForModal.id === booking.id || selectedBookingForModal.bookingRef === booking.bookingRef)) {
        setSelectedBookingForModal(prev => ({ ...prev, status: newStatus }));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Manual refresh action
  const handleTriggerRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      addToast('Live bookings synchronized with database!', 'success');
    } catch (err) {
      addToast('Failed to refresh bookings: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    try {
      const headers = [
        'Booking Ref', 
        'Service Type', 
        'Patient Name', 
        'Contact Phone', 
        'Clinical Details', 
        'Schedule Date', 
        'Slot/Time', 
        'Amount (INR)', 
        'Payment Status', 
        'Payment Method', 
        'Booking Status'
      ];
      const rows = filteredBookings.map(b => [
        b.bookingRef,
        b.serviceTitle,
        b.patientName,
        b.patientPhone,
        b.details.replace(/"/g, '""'),
        b.date,
        b.time,
        b.amount,
        b.paymentStatus,
        b.paymentMethod,
        b.status
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Zestmed_Master_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast(`Exported ${filteredBookings.length} booking records to CSV!`, 'success');
    } catch (_) {
      addToast('Failed to export CSV', 'error');
    }
  };

  // Status badge styling helper
  const getStatusBadgeClass = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('confirm') || s.includes('complet') || s.includes('publish') || s.includes('deliver') || s.includes('discharg')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('pending') || s.includes('collect') || s.includes('process') || s.includes('progress') || s.includes('schedul') || s.includes('admit')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('cancel')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Payment badge styling helper
  const getPaymentBadgeClass = (paymentStatus = '') => {
    const p = paymentStatus.toLowerCase();
    if (p.includes('paid') || p.includes('cashless') || p.includes('covered')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (p.includes('cod') || p.includes('cash on')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-[#00A68A]">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Bookings Management
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              {allBookings.length} Total
            </span>
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Syncing database...</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unified operations console managing all Doctor Consultations, Lab Tests, Wellness, Surgeries, Physiotherapy, and Medicine Orders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleTriggerRefresh}
            disabled={isRefreshing || isLoading}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoading ? 'animate-spin text-[#00A68A]' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Grid (7 Services + Total) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* All Bookings */}
        <div 
          onClick={() => { setServiceFilter('all'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'all' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-400" /> All Services
            </span>
          </div>
          <div className={`text-lg font-black ${serviceFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>
            {allBookings.length}
          </div>
        </div>

        {/* Doctor Appointments */}
        <div 
          onClick={() => { setServiceFilter('doctor'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'doctor' 
              ? 'bg-blue-500 text-white border-blue-500 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Stethoscope className={`w-3.5 h-3.5 ${serviceFilter === 'doctor' ? 'text-white' : 'text-blue-600'}`} /> Doctors
            </span>
          </div>
          <div className={`text-lg font-black ${serviceFilter === 'doctor' ? 'text-white' : 'text-slate-900'}`}>
            {doctorAppointments.length}
          </div>
        </div>

        {/* Diagnostic Lab Tests */}
        <div 
          onClick={() => { setServiceFilter('lab'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'lab' 
              ? 'bg-teal-600 text-white border-teal-600 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-teal-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <FlaskConical className={`w-3.5 h-3.5 ${serviceFilter === 'lab' ? 'text-white' : 'text-teal-600'}`} /> Lab Tests
            </span>
          </div>
          <div className={`text-lg font-black ${serviceFilter === 'lab' ? 'text-white' : 'text-slate-900'}`}>
            {diagnosticLabBookings.length}
          </div>
        </div>

        {/* Wellness Packages */}
        <div 
          onClick={() => { setServiceFilter('wellness'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'wellness' 
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Heart className={`w-3.5 h-3.5 ${serviceFilter === 'wellness' ? 'text-white' : 'text-amber-600'}`} /> Wellness
            </span>
          </div>
          <div className={`text-lg font-black ${serviceFilter === 'wellness' ? 'text-white' : 'text-slate-900'}`}>
            {wellnessBookings.length}
          </div>
        </div>

        {/* Surgery Packages */}
        <div 
          onClick={() => { setServiceFilter('surgery'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'surgery' 
              ? 'bg-rose-500 text-white border-rose-500 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Scissors className={`w-3.5 h-3.5 ${serviceFilter === 'surgery' ? 'text-white' : 'text-rose-600'}`} /> Surgeries
            </span>
          </div>
          <div className={`text-lg font-black ${serviceFilter === 'surgery' ? 'text-white' : 'text-slate-900'}`}>
            {surgeryBookings.length}
          </div>
        </div>

        {/* Physiotherapy */}
        <div 
          onClick={() => { setServiceFilter('physio'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'physio' 
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Activity className={`w-3.5 h-3.5 ${serviceFilter === 'physio' ? 'text-white' : 'text-purple-600'}`} /> Physio
            </span>
          </div>
          <div className={`text-lg font-black ${serviceFilter === 'physio' ? 'text-white' : 'text-slate-900'}`}>
            {physioAppointments.length}
          </div>
        </div>

        {/* Medicine Orders */}
        <div 
          onClick={() => { setServiceFilter('order'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'order' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
              : 'bg-white border-slate-200/80 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Package className={`w-3.5 h-3.5 ${serviceFilter === 'order' ? 'text-white' : 'text-emerald-600'}`} /> Medicines
            </span>
          </div>
          <div className={`text-lg font-black ${serviceFilter === 'order' ? 'text-white' : 'text-slate-900'}`}>
            {medicineOrders.length}
          </div>
        </div>
      </div>

      {/* Filter, Search & Controls Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs space-y-3">
        {/* Service Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Services', count: allBookings.length },
            { id: 'doctor', label: 'Doctors', count: doctorAppointments.length },
            { id: 'lab', label: 'Lab Tests', count: diagnosticLabBookings.length },
            { id: 'wellness', label: 'Wellness Packages', count: wellnessBookings.length },
            { id: 'surgery', label: 'Surgeries', count: surgeryBookings.length },
            { id: 'physio', label: 'Physiotherapy', count: physioAppointments.length },
            { id: 'order', label: 'Medicine Orders', count: medicineOrders.length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setServiceFilter(tab.id); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                serviceFilter === tab.id
                  ? 'bg-[#007A64] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                serviceFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Dropdowns & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search patient, phone, booking ID, service..."
              className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Booking Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="all">All Booking Statuses</option>
              <option value="confirmed">Confirmed / Scheduled</option>
              <option value="pending">Pending / In Progress</option>
              <option value="completed">Completed / Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Dropdown */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid (Online / UPI / TPA)</option>
              <option value="pending">Payment Pending</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
              <option value="patient">Patient Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Service Specifics</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Amount & Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading && paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#00A68A] mb-2" />
                    <p className="font-semibold text-slate-700">Fetching live bookings from Supabase database...</p>
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200/80">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">No bookings found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {searchQuery || serviceFilter !== 'all' || statusFilter !== 'all' || paymentFilter !== 'all'
                        ? 'Try clearing or relaxing your current filters to view more records.'
                        : 'No bookings recorded in the system yet.'}
                    </p>
                    {(searchQuery || serviceFilter !== 'all' || statusFilter !== 'all' || paymentFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setServiceFilter('all');
                          setStatusFilter('all');
                          setPaymentFilter('all');
                          setDateFilter('all');
                          setSearchQuery('');
                          setCurrentPage(1);
                        }}
                        className="mt-3 px-4 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => {
                  const ServiceIcon = b.serviceIcon || Calendar;
                  const isUpdating = updatingId === (b.id || b.bookingRef);

                  return (
                    <tr key={b.id || b.bookingRef} className="hover:bg-slate-50/80 transition group">
                      {/* 1. Booking Ref */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-black text-slate-900 block tracking-tight">
                          {b.bookingRef}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[140px]" title={b.facility}>
                          {b.facility}
                        </span>
                      </td>

                      {/* 2. Service Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${b.serviceBadgeClass}`}>
                          <ServiceIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{b.serviceTitle}</span>
                        </span>
                      </td>

                      {/* 3. Patient Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.patientName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          <span>{b.patientPhone || 'No Phone'}</span>
                        </div>
                        {b.uhid && (
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                            UHID: {String(b.uhid).slice(0, 10)}...
                          </div>
                        )}
                      </td>

                      {/* 4. Clinical / Service Specifics */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="truncate font-bold text-slate-800" title={b.details}>
                          {b.details}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5" title={b.subDetails}>
                          {b.subDetails}
                        </div>
                      </td>

                      {/* 5. Schedule */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-900 font-semibold">{b.date}</div>
                        <div className="text-[11px] text-teal-700 font-mono font-bold mt-0.5">
                          {b.time}
                        </div>
                      </td>

                      {/* 6. Amount & Payment */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-black text-slate-900">
                          ₹{Number(b.amount || 0).toLocaleString('en-IN')}
                        </div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded-full border ${getPaymentBadgeClass(b.paymentStatus)}`}>
                          {b.paymentStatus}
                        </span>
                      </td>

                      {/* 7. Status & Inline Status Selector */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={b.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(b, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer appearance-none pr-6 ${getStatusBadgeClass(b.status)}`}
                          >
                            <option value={b.status}>{b.status}</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="Report Published">Report Published</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                        {isUpdating && (
                          <span className="block text-[10px] text-teal-600 mt-0.5 animate-pulse">Saving...</span>
                        )}
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Booking Details Modal */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewBooking) {
                                onViewBooking(b.raw, b.serviceType);
                              } else {
                                setSelectedBookingForModal(b);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                            title="View Booking Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Phone Call */}
                          {b.patientPhone && (
                            <a
                              href={`tel:${b.patientPhone}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              title={`Call Patient: ${b.patientPhone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="font-bold text-slate-900">{startIndex + 1}</strong> to{' '}
                <strong className="font-bold text-slate-900">{Math.min(startIndex + pageSize, totalItems)}</strong> of{' '}
                <strong className="font-bold text-slate-900">{totalItems}</strong> bookings
              </span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-2 py-0.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && safeCurrentPage > 3) {
                    pageNum = safeCurrentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                        safeCurrentPage === pageNum
                          ? 'bg-[#007A64] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Internal Detailed Booking Modal (Fallback or Direct View) */}
      {selectedBookingForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-white/10 text-teal-400">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {selectedBookingForModal.serviceTitle}
                  </h3>
                  <p className="text-xs text-teal-400 font-mono mt-0.5">
                    Ref ID: {selectedBookingForModal.bookingRef}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForModal(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* Patient Banner */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient</span>
                  <h4 className="text-sm font-bold text-slate-900">{selectedBookingForModal.patientName}</h4>
                  <p className="text-slate-500 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{selectedBookingForModal.patientPhone || 'No contact provided'}</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedBookingForModal.status)}`}>
                  {selectedBookingForModal.status}
                </span>
              </div>

              {/* Booking Specifics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Spec</span>
                  <div className="font-bold text-slate-900 mt-1 truncate">{selectedBookingForModal.details}</div>
                  <div className="text-[10px] text-slate-500 truncate">{selectedBookingForModal.subDetails}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schedule</span>
                  <div className="font-bold text-slate-900 mt-1">{selectedBookingForModal.date}</div>
                  <div className="text-[10px] text-teal-700 font-mono font-bold">{selectedBookingForModal.time}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Amount</span>
                  <div className="font-black text-slate-900 text-sm font-mono mt-1">
                    ₹{Number(selectedBookingForModal.amount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500">{selectedBookingForModal.paymentStatus}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Facility / Hub</span>
                  <div className="font-bold text-slate-900 mt-1 truncate">{selectedBookingForModal.facility}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedBookingForModal.paymentMethod}</div>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-2">
                <label className="text-[11px] font-bold text-teal-900 block">
                  Update Booking Status
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBookingForModal.status}
                    onChange={(e) => handleStatusChange(selectedBookingForModal, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-teal-200 text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                  >
                    <option value="Confirmed">Confirmed / Scheduled</option>
                    <option value="In Progress">In Progress / Processing</option>
                    <option value="Sample Collected">Sample Collected</option>
                    <option value="Report Published">Report Published</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {selectedBookingForModal.patientPhone ? (
                <a
                  href={`tel:${selectedBookingForModal.patientPhone}`}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Patient</span>
                </a>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedBookingForModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
