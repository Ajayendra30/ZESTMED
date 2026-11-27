// src/components/admin/BookingsManagementView.jsx
import React, { useState, useMemo } from 'react';
import { 
  Calendar, Search, Filter, Download, Stethoscope, FlaskConical, 
  Activity, Scissors, Heart, CheckCircle2, Clock, XCircle, 
  ChevronRight, Phone, ExternalLink, RefreshCw, Eye
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function BookingsManagementView({
  doctorAppointments = [],
  physioAppointments = [],
  surgeryBookings = [],
  diagnosticLabBookings = [],
  wellnessBookings = [],
  onUpdateStatus,
  onViewBooking
}) {
  const { addToast } = useToast();
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize and aggregate all bookings across the 5 streams
  const allBookings = useMemo(() => {
    const list = [];

    // 1. Doctor Appointments
    doctorAppointments.forEach(item => {
      list.push({
        id: item.bookingId || item.id || `DOC-${item.appointment_number}`,
        rawId: item.rawId || item.id,
        bookingRef: item.bookingId || item.appointment_number || item.id,
        serviceType: 'doctor',
        serviceTitle: 'Doctor Appointment',
        serviceIcon: Stethoscope,
        serviceBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        details: item.doctor || item.doctorName || 'Specialist Consult',
        subDetails: item.specialty || item.department || 'Clinical Medicine',
        date: item.date || item.appointment_date || 'Today',
        time: item.time || item.appointment_time || item.slot || '10:00 AM',
        amount: item.fee || item.fees || item.price || 600,
        status: item.status || 'Confirmed',
        facility: item.hospital || item.clinic || 'Dispur Hub',
        raw: item
      });
    });

    // 2. Physiotherapy
    physioAppointments.forEach(item => {
      list.push({
        id: item.bookingId || item.id || `PHY-${item.booking_number}`,
        rawId: item.rawId || item.id,
        bookingRef: item.bookingId || item.booking_number || item.id,
        serviceType: 'physio',
        serviceTitle: 'Physiotherapy',
        serviceIcon: Activity,
        serviceBadgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        details: item.condition || item.specialty || 'Rehabilitation',
        subDetails: item.serviceType || item.mode || 'Home Visit',
        date: item.date || item.booking_date || 'Today',
        time: item.time || item.preferred_slot || '11:00 AM',
        amount: item.fee || item.fees || item.price || 799,
        status: item.status || 'Confirmed',
        facility: item.address || 'Guwahati Service Area',
        raw: item
      });
    });

    // 3. Surgery Packages
    surgeryBookings.forEach(item => {
      list.push({
        id: item.bookingId || item.id || `SUR-${item.booking_number}`,
        rawId: item.rawId || item.id,
        bookingRef: item.bookingId || item.booking_number || item.id,
        serviceType: 'surgery',
        serviceTitle: 'Surgery Package',
        serviceIcon: Scissors,
        serviceBadgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        details: item.surgeryName || item.surgery_name || 'Surgical Procedure',
        subDetails: item.hospitalPreference || 'Zestmed Day Surgery Hub',
        date: item.date || item.preferred_date || 'Scheduled',
        time: item.time || '09:00 AM',
        amount: item.amount || item.price || 35000,
        status: item.status || 'Consultation Scheduled',
        facility: item.hospital || 'Daycare Center',
        raw: item
      });
    });

    // 4. Lab Tests
    diagnosticLabBookings.forEach(item => {
      list.push({
        id: item.bookingId || item.id || `LAB-${item.booking_number}`,
        rawId: item.rawId || item.id,
        bookingRef: item.bookingId || item.booking_number || item.id,
        serviceType: 'lab',
        serviceTitle: 'Diagnostic Lab Test',
        serviceIcon: FlaskConical,
        serviceBadgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        details: item.testName || item.test_name || 'Pathology Test',
        subDetails: `Sample: ${item.sampleType || 'Blood'}`,
        date: item.collectionDate || item.date || 'Today',
        time: item.collectionSlot || item.time || '08:00 AM',
        amount: item.amount || item.price || 799,
        status: item.status || 'Pending Collection',
        facility: item.address || 'Home Collection (Guwahati)',
        raw: item
      });
    });

    // 5. Wellness Packages
    wellnessBookings.forEach(item => {
      list.push({
        id: item.bookingId || item.id || `WEL-${item.booking_number}`,
        rawId: item.rawId || item.id,
        bookingRef: item.bookingId || item.booking_number || item.id,
        serviceType: 'wellness',
        serviceTitle: 'Wellness Package',
        serviceIcon: Heart,
        serviceBadgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        patientName: item.patientName || item.patient_name || 'Patient',
        patientPhone: item.patientPhone || item.phone || '',
        details: item.packageName || item.package_name || 'Comprehensive Health Package',
        subDetails: 'Preventive Full Body Profile',
        date: item.date || item.booking_date || 'Today',
        time: item.time || item.preferred_slot || '08:30 AM',
        amount: item.amount || item.price || 1999,
        status: item.status || 'Confirmed',
        facility: item.address || 'Dispur Hub / Home Visit',
        raw: item
      });
    });

    return list.sort((a, b) => (b.bookingRef || '').localeCompare(a.bookingRef || ''));
  }, [doctorAppointments, physioAppointments, surgeryBookings, diagnosticLabBookings, wellnessBookings]);

  // Filtered dataset
  const filteredBookings = useMemo(() => {
    return allBookings.filter(item => {
      const matchesService = serviceFilter === 'all' || item.serviceType === serviceFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'confirmed' && (item.status.includes('Confirmed') || item.status.includes('Scheduled'))) ||
        (statusFilter === 'completed' && item.status.includes('Completed')) ||
        (statusFilter === 'pending' && (item.status.includes('Pending') || item.status.includes('Processing')));
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.patientName.toLowerCase().includes(q) ||
        item.patientPhone.toLowerCase().includes(q) ||
        item.bookingRef.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q);

      return matchesService && matchesStatus && matchesSearch;
    });
  }, [allBookings, serviceFilter, statusFilter, searchQuery]);

  // Export to CSV
  const handleExportCsv = () => {
    try {
      const headers = ['Booking Ref', 'Service', 'Patient Name', 'Phone', 'Details', 'Date', 'Time', 'Amount', 'Status'];
      const rows = filteredBookings.map(b => [
        b.bookingRef,
        b.serviceTitle,
        b.patientName,
        b.patientPhone,
        b.details,
        b.date,
        b.time,
        b.amount,
        b.status
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Zestmed_Master_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Master Bookings exported successfully!', 'success');
    } catch (_) {
      addToast('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Bookings Management
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              {allBookings.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unified operations console managing all Doctor, Lab, Physiotherapy, Surgery, and Wellness appointments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => setServiceFilter('doctor')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'doctor' ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/20' : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Doctors</span>
            <span className="text-[10px] font-mono text-slate-400">Consults</span>
          </div>
          <div className="text-lg font-black text-slate-900">{doctorAppointments.length}</div>
        </div>

        <div 
          onClick={() => setServiceFilter('lab')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'lab' ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-400/20' : 'bg-white border-slate-200/80 hover:border-teal-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-teal-600" /> Lab Tests</span>
            <span className="text-[10px] font-mono text-slate-400">Pathology</span>
          </div>
          <div className="text-lg font-black text-slate-900">{diagnosticLabBookings.length}</div>
        </div>

        <div 
          onClick={() => setServiceFilter('physio')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'physio' ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/20' : 'bg-white border-slate-200/80 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-purple-600" /> Physio</span>
            <span className="text-[10px] font-mono text-slate-400">Rehab</span>
          </div>
          <div className="text-lg font-black text-slate-900">{physioAppointments.length}</div>
        </div>

        <div 
          onClick={() => setServiceFilter('surgery')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'surgery' ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/20' : 'bg-white border-slate-200/80 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-rose-600" /> Surgeries</span>
            <span className="text-[10px] font-mono text-slate-400">Daycare</span>
          </div>
          <div className="text-lg font-black text-slate-900">{surgeryBookings.length}</div>
        </div>

        <div 
          onClick={() => setServiceFilter('wellness')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            serviceFilter === 'wellness' ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20' : 'bg-white border-slate-200/80 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-amber-600" /> Wellness</span>
            <span className="text-[10px] font-mono text-slate-400">Packages</span>
          </div>
          <div className="text-lg font-black text-slate-900">{wellnessBookings.length}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Service Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'doctor', label: 'Doctors' },
            { id: 'lab', label: 'Lab Tests' },
            { id: 'physio', label: 'Physiotherapy' },
            { id: 'surgery', label: 'Surgeries' },
            { id: 'wellness', label: 'Wellness' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setServiceFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                serviceFilter === tab.id
                  ? 'bg-[#007A64] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Pills & Search */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-teal-600"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed / Scheduled</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, phone, booking ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Clinical Specifics</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Fee / Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const ServiceIcon = b.serviceIcon;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{b.bookingRef}</span>
                        <span className="text-[10px] text-slate-400">{b.facility}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.serviceBadgeClass}`}>
                          <ServiceIcon className="w-3 h-3" />
                          <span>{b.serviceTitle}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.patientName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          <span>{b.patientPhone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="truncate font-semibold text-slate-800">{b.details}</div>
                        <div className="text-[10px] text-slate-500 truncate">{b.subDetails}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-900 font-medium">{b.date}</div>
                        <div className="text-[11px] text-teal-700 font-mono font-bold">{b.time}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900">₹{b.amount}</div>
                        <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          b.status.includes('Confirmed') || b.status.includes('Completed')
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {onViewBooking && (
                            <button
                              type="button"
                              onClick={() => onViewBooking(b.raw, b.serviceType)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <a
                            href={`tel:${b.patientPhone}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            title="Call Patient"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
