import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Calendar, ArrowRight, Video, Stethoscope, 
  MapPin, ChevronDown, ShieldCheck, Clock, 
  CheckCircle2, User, Phone, Mail, FileText, 
  CalendarCheck, Bookmark, ArrowLeft, Printer, 
  MessageSquare, AlertCircle, Building2
} from 'lucide-react';
import { MOCK_DOCTORS, DOCTOR_SPECIALTIES, matchesSpecialty } from '../mock-data/doctorsData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { bookDoctorAppointment, getDoctorAppointments, getDoctors, updateDoctorAppointmentStatus, normalizePhone } from '../services/supabaseService';
import { enforceAuth } from '../utils/authGuard';
import { recordAndPlayNotification } from '../utils/notificationSound';

export default function BookDoctorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, openAuth } = useAuth();
  const { addToast } = useToast();

  // Active top tab: 'new' | 'my-appointments'
  const [activeTab, setActiveTab] = useState('new');

  // Doctors list from database/mock
  const [doctorsList, setDoctorsList] = useState(MOCK_DOCTORS);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Load doctors from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadDocs() {
      try {
        setIsLoadingDoctors(true);
        const docs = await getDoctors();
        if (isMounted && docs && docs.length > 0) {
          setDoctorsList(docs);
        }
      } catch (err) {
        console.warn('Error fetching doctors on booking page:', err);
      } finally {
        if (isMounted) setIsLoadingDoctors(false);
      }
    }
    loadDocs();
    return () => { isMounted = false; };
  }, []);

  // Determine initial doctor & specialty from navigation state or search params
  const initialDoctor = useMemo(() => {
    if (location.state?.doctor) return location.state.doctor;
    const queryDocId = searchParams.get('doctor') || searchParams.get('doctorId');
    if (queryDocId) {
      const found = doctorsList.find(d => d.id === queryDocId || d.name.toLowerCase().includes(queryDocId.toLowerCase()));
      if (found) return found;
    }
    return doctorsList[0] || MOCK_DOCTORS[0];
  }, [location.state, searchParams, doctorsList]);

  // Form states matching Reference Image
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    location.state?.specialty || initialDoctor?.specialty || 'General Physician'
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctor?.id || 'doc-1');
  const [consultationDate, setConsultationDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [preferredSlot, setPreferredSlot] = useState('10:00 AM - Morning Slot');
  const [consultationMode, setConsultationMode] = useState(location.state?.mode || 'Clinic Visit');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.contact || user?.phone || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  // Patient appointments state
  const [patientAppointments, setPatientAppointments] = useState([]);

  // Load booked appointments (strictly for currently authenticated user, with real backend sync)
  const loadAppointments = async () => {
    if (!user) {
      setPatientAppointments([]);
      return;
    }

    const cleanUserPhone = normalizePhone(user.phone || user.contact || patientPhone || '');

    let dbAppts = [];
    // 1. Fetch real appointments from Supabase backend
    try {
      dbAppts = await getDoctorAppointments(cleanUserPhone);
    } catch (err) {
      console.warn('Backend doctor appointments fetch error:', err);
    }

    // 2. Local fallback strictly filtered by user & merge with DB
    try {
      const stored = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      const filtered = (stored || []).filter(item => {
        const isDoc = item.type === 'Doctor Appointment' || item.category === 'doctor' || item.doctor;
        if (!isDoc) return false;
        const itemPhone = normalizePhone(item.phone || item.patientPhone || item.contact || '');
        if (cleanUserPhone && itemPhone) {
          return cleanUserPhone === itemPhone;
        }
        if (user.id && (item.userId || item.user_id)) {
          return String(user.id) === String(item.userId || item.user_id);
        }
        return false;
      });

      const combined = Array.isArray(dbAppts) ? [...dbAppts] : [];
      const seenIds = new Set(combined.map(a => String(a.id || a.bookingId || a.appointment_number)));
      filtered.forEach(loc => {
        const id = String(loc.id || loc.bookingId || loc.appointment_number);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          combined.push(loc);
        }
      });
      setPatientAppointments(combined);
    } catch {
      setPatientAppointments(Array.isArray(dbAppts) ? dbAppts : []);
    }
  };

  useEffect(() => {
    loadAppointments();
    window.addEventListener('storage', loadAppointments);
    window.addEventListener('zestmed_booking_updated', loadAppointments);
    return () => {
      window.removeEventListener('storage', loadAppointments);
      window.removeEventListener('zestmed_booking_updated', loadAppointments);
    };
  }, [user]);

  // Sync user info if authenticated
  useEffect(() => {
    if (user) {
      setPatientName(prev => prev || user.name || '');
      setPatientPhone(prev => prev || user.contact || user.phone || '');
      setPatientEmail(prev => prev || user.email || '');
    }
  }, [user]);

  // Handle pending action after login
  useEffect(() => {
    if (user) {
      try {
        const pendingRaw = sessionStorage.getItem('zestmed_pending_action');
        if (pendingRaw) {
          const parsed = JSON.parse(pendingRaw);
          if (parsed?.type === 'book_doctor') {
            sessionStorage.removeItem('zestmed_pending_action');
            if (parsed.doctor) {
              setSelectedSpecialty(parsed.doctor.specialty || selectedSpecialty);
              setSelectedDoctorId(parsed.doctor.id);
            }
            if (parsed.formData) {
              if (parsed.formData.date) setConsultationDate(parsed.formData.date);
              if (parsed.formData.slot) setPreferredSlot(parsed.formData.slot);
              if (parsed.formData.name) setPatientName(parsed.formData.name);
              if (parsed.formData.phone) setPatientPhone(parsed.formData.phone);
              if (parsed.formData.email) setPatientEmail(parsed.formData.email);
              if (parsed.formData.notes) setMedicalNotes(parsed.formData.notes);
            }
          }
        }
      } catch (_) {}
    }
  }, [user, selectedSpecialty]);

  // Unique list of specialties
  const allSpecialties = useMemo(() => {
    const specs = new Set();
    DOCTOR_SPECIALTIES.forEach(s => {
      if (s !== 'All Specialties') specs.add(s);
    });
    doctorsList.forEach(d => {
      if (d.specialty) specs.add(d.specialty);
    });
    return Array.from(specs);
  }, [doctorsList]);

  // Filter doctors according to chosen specialty
  const doctorsForDropdown = useMemo(() => {
    if (!selectedSpecialty || selectedSpecialty === 'All Specialties') {
      return doctorsList;
    }
    const filtered = doctorsList.filter(d => matchesSpecialty(d, selectedSpecialty));
    return filtered.length > 0 ? filtered : doctorsList;
  }, [doctorsList, selectedSpecialty]);

  // Currently chosen doctor object
  const chosenDoctor = useMemo(() => {
    return doctorsList.find(d => d.id === selectedDoctorId) || doctorsForDropdown[0] || doctorsList[0] || MOCK_DOCTORS[0];
  }, [doctorsList, selectedDoctorId, doctorsForDropdown]);

  // When specialty changes, auto-select first doctor of that specialty
  const handleSpecialtyChange = (newSpecialty) => {
    setSelectedSpecialty(newSpecialty);
    const matchingDocs = doctorsList.filter(d => matchesSpecialty(d, newSpecialty));
    if (matchingDocs.length > 0) {
      setSelectedDoctorId(matchingDocs[0].id);
    }
  };

  // When doctor is selected, update selectedDoctorId & keep specialty in sync
  const handleDoctorSelect = (docId) => {
    setSelectedDoctorId(docId);
    const doc = doctorsList.find(d => d.id === docId);
    if (doc && doc.specialty && doc.specialty !== selectedSpecialty) {
      setSelectedSpecialty(doc.specialty);
    }
  };

  // Cancel an appointment
  const handleCancelAppointment = async (id) => {
    try {
      const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      const updated = existing.map(item => 
        (item.id === id || item.bookingId === id || item.appointment_number === id) ? { ...item, status: 'Cancelled' } : item
      );
      localStorage.setItem('patient_appointments', JSON.stringify(updated));
      await updateDoctorAppointmentStatus(id, 'Cancelled');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
      loadAppointments();
      addToast('Appointment cancelled successfully', 'info');
    } catch {
      addToast('Unable to cancel appointment', 'error');
    }
  };

  // Form submit handler
  const handleConfirmAppointment = async (e) => {
    e.preventDefault();

    if (!patientName.trim()) {
      addToast('Please enter patient full name', 'warning');
      return;
    }

    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      addToast('Please enter a valid 10-digit phone number', 'warning');
      return;
    }

    if (!consultationDate) {
      addToast('Please select a consultation date', 'warning');
      return;
    }

    if (!preferredSlot) {
      addToast('Please choose a preferred time slot', 'warning');
      return;
    }

    // Require authentication
    if (!user) {
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to confirm your doctor appointment',
        pendingAction: {
          type: 'book_doctor',
          doctor: chosenDoctor,
          formData: {
            specialty: selectedSpecialty,
            doctorId: selectedDoctorId,
            date: consultationDate,
            slot: preferredSlot,
            name: patientName,
            phone: patientPhone,
            email: patientEmail,
            notes: medicalNotes
          }
        },
        addToast
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const refNumber = `ZM-DOC-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newBooking = {
        id: refNumber,
        bookingId: refNumber,
        appointment_number: refNumber,
        type: 'Doctor Appointment',
        category: 'doctor',
        title: chosenDoctor.name,
        doctor: chosenDoctor.name,
        doctorName: chosenDoctor.name,
        doctorSpecialty: chosenDoctor.specialty,
        specialty: chosenDoctor.specialty,
        doctorDegree: chosenDoctor.degree || 'MBBS, MD',
        doctorHospital: chosenDoctor.hospital || 'Zestmed Polyclinic Hub, Guwahati',
        hospital: chosenDoctor.hospital || 'Zestmed Polyclinic Hub, Guwahati',
        doctorAvatar: chosenDoctor.avatar,
        date: consultationDate,
        time: preferredSlot,
        slot: `${consultationDate}, ${preferredSlot}`,
        mode: consultationMode,
        fee: chosenDoctor.fee || 600,
        price: chosenDoctor.fee || 600,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        phone: patientPhone.trim(),
        email: patientEmail.trim(),
        userId: user?.id || null,
        userEmail: user?.email || patientEmail.trim(),
        symptoms: medicalNotes.trim() || 'General Specialist Consultation',
        status: 'Confirmed',
        paymentStatus: 'Pay at Hospital Reception',
        paymentMethod: 'Hospital Reception Desk (Zero Upfront)',
        createdAt: new Date().toISOString()
      };

      // 1. Persist to Supabase Database & local storage
      let savedBooking = newBooking;
      try {
        const dbResult = await bookDoctorAppointment(newBooking);
        if (dbResult) savedBooking = dbResult;
      } catch (dbErr) {
        console.warn('Supabase booking sync warning:', dbErr);
      }

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

      // 2. Play audible chime & record Book notification
      try {
        recordAndPlayNotification({
          type: 'book',
          title: 'Doctor Appointment Confirmed',
          actionText: `Appointment #${refNumber} Confirmed`,
          desc: `Consultation confirmed with ${chosenDoctor.name} (${chosenDoctor.specialty}) for ${consultationDate} (${preferredSlot}).`,
          sender: chosenDoctor.name,
          category: 'Doctor Consultation',
          refId: refNumber,
          linkType: 'appointment'
        });
      } catch (notifErr) {
        console.warn('Notification sound/record warning:', notifErr);
      }

      setConfirmedTicket(savedBooking || newBooking);
      loadAppointments();
      addToast(`Appointment scheduled with ${chosenDoctor.name}!`, 'success');
    } catch (err) {
      console.error('Failed to book appointment:', err);
      addToast('Unable to complete booking. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/doctor-appointment"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-[#007A64] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Specialists</span>
          </Link>
        </div>

        {/* Header Section matching Reference Image */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6F4F1] text-[#007A64] border border-teal-200/60 text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
            <span>CLINICAL CONSULTATION SCHEDULER</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Book Specialist Appointment
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Schedule your consultation with senior specialists at Guwahati. Receive instant digital reference ticket and WhatsApp confirmation.
          </p>

          {/* Accent Line */}
          <div className="w-12 h-1 bg-[#007A64] rounded-full mx-auto mt-3" />
        </div>

        {/* Top Tab Bar: New Appointment vs My Appointments */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('new');
                setConfirmedTicket(null);
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-[#0F1E36] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>New Appointment</span>
            </button>

            <button
              type="button"
              onClick={() => {
                loadAppointments();
                setActiveTab('my-appointments');
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'my-appointments'
                  ? 'bg-[#0F1E36] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>My Appointments ({patientAppointments.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: NEW APPOINTMENT FORM                                               */}
        {/* ========================================================================= */}
        {activeTab === 'new' && (
          <div>
            {!confirmedTicket ? (
              /* Booking Form Card matching Image 3 & Image 4 */
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleConfirmAppointment} className="space-y-6">

                  {/* Row 1: 1. SELECT SPECIALTY & 2. SELECT DOCTOR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* 1. SELECT SPECIALTY */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        <Stethoscope className="w-3.5 h-3.5 text-[#007A64]" />
                        <span>1. SELECT SPECIALTY</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedSpecialty}
                          onChange={(e) => handleSpecialtyChange(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:bg-white appearance-none cursor-pointer pr-10 transition"
                        >
                          {allSpecialties.map((spec) => (
                            <option key={spec} value={spec}>
                              {spec}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* 2. SELECT DOCTOR * */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        <User className="w-3.5 h-3.5 text-[#007A64]" />
                        <span>2. SELECT DOCTOR *</span>
                      </label>
                      <div className="relative">
                        <select
                          value={chosenDoctor?.id || selectedDoctorId}
                          onChange={(e) => handleDoctorSelect(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:bg-white appearance-none cursor-pointer pr-10 transition"
                          required
                        >
                          {doctorsForDropdown.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name} ({doc.specialty})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                  </div>

                  {/* CHOSEN SPECIALIST CARD matching reference layout */}
                  {chosenDoctor && (
                    <div className="bg-[#EBF7F5] border border-teal-200/90 rounded-2xl p-4 sm:p-4.5 flex items-center gap-4 transition-all">
                      <img
                        src={chosenDoctor.avatar}
                        alt={chosenDoctor.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover object-top border-2 border-white shadow-xs shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/contact-doctor.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#007A64] block">
                          CHOSEN SPECIALIST
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                          {chosenDoctor.name}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {chosenDoctor.designation || 'Consultant'} • {chosenDoctor.specialty}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs font-bold text-[#007A64]">
                          <span>Fee: ₹{chosenDoctor.fee || 600}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">Slot: {chosenDoctor.nextSlot || 'Today, 04:30 PM'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Row 2: 3. CONSULTATION DATE & 4. PREFERRED SLOT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* 3. CONSULTATION DATE * */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
                        <span>3. CONSULTATION DATE *</span>
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={consultationDate}
                        onChange={(e) => setConsultationDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:bg-white cursor-pointer transition"
                        required
                      />
                    </div>

                    {/* 4. PREFERRED SLOT * */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        <Clock className="w-3.5 h-3.5 text-[#007A64]" />
                        <span>4. PREFERRED SLOT *</span>
                      </label>
                      <div className="relative">
                        <select
                          value={preferredSlot}
                          onChange={(e) => setPreferredSlot(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:bg-white appearance-none cursor-pointer pr-10 transition"
                          required
                        >
                          <option value="">-- Choose Slot --</option>
                          <option value="10:00 AM - Morning Slot">10:00 AM (Morning Slot)</option>
                          <option value="11:30 AM - Morning Slot">11:30 AM (Morning Slot)</option>
                          <option value="02:30 PM - Afternoon Slot">02:30 PM (Afternoon Slot)</option>
                          <option value="04:30 PM - Evening Slot">04:30 PM (Evening Slot)</option>
                          <option value="06:00 PM - Evening Slot">06:00 PM (Evening Slot)</option>
                          <option value="07:15 PM - Evening Slot">07:15 PM (Evening Slot)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                  </div>

                  {/* Row 3: 5. PATIENT FULL NAME & 6. PHONE NUMBER */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* 5. PATIENT FULL NAME * */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        <User className="w-3.5 h-3.5 text-[#007A64]" />
                        <span>5. PATIENT FULL NAME *</span>
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Animesh Sarma"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:bg-white transition"
                        required
                      />
                    </div>

                    {/* 6. PHONE NUMBER * */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        <Phone className="w-3.5 h-3.5 text-[#007A64]" />
                        <span>6. PHONE NUMBER *</span>
                      </label>
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:bg-white transition"
                        required
                      />
                    </div>

                  </div>

                  {/* 7. EMAIL ADDRESS (OPTIONAL) */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      <Mail className="w-3.5 h-3.5 text-[#007A64]" />
                      <span>7. EMAIL ADDRESS (OPTIONAL)</span>
                    </label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:bg-white transition"
                    />
                  </div>

                  {/* 8. HEALTH ISSUE / MEDICAL NOTES (OPTIONAL) */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      <FileText className="w-3.5 h-3.5 text-[#007A64]" />
                      <span>8. HEALTH ISSUE / MEDICAL NOTES (OPTIONAL)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="Briefly describe health concerns, symptoms, or prior medical reports..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007A64] focus:bg-white resize-none transition"
                    />
                  </div>

                  {/* Mode of Consultation */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                      CONSULTATION MODE:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConsultationMode('Clinic Visit')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          consultationMode === 'Clinic Visit'
                            ? 'bg-[#007A64] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Clinic Visit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsultationMode('Online Video Consultation')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          consultationMode === 'Online Video Consultation'
                            ? 'bg-[#007A64] text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Video Consult</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-[#007A64] hover:bg-[#006852] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    <span>{isSubmitting ? 'GENERATING TICKET...' : 'CONFIRM & GENERATE REFERENCE TICKET'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Trust Footer Note */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium text-center pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>No upfront payment required. Pay directly at hospital reception during visit.</span>
                  </div>

                </form>
              </div>
            ) : (
              /* Success Digital Reference Ticket Display */
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto space-y-6 animate-in fade-in">
                
                {/* Header Badge */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Appointment Confirmed!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Your digital consultation reference ticket has been generated.
                  </p>
                </div>

                {/* Digital Ticket Card */}
                <div className="rounded-2xl border-2 border-dashed border-teal-300 bg-gradient-to-b from-[#EBF7F5] to-white p-5 sm:p-6 relative overflow-hidden space-y-4">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-teal-200/70 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        REFERENCE TICKET NUMBER
                      </span>
                      <span className="text-lg sm:text-xl font-mono font-black text-[#007A64]">
                        {confirmedTicket.id}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                      Confirmed
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={confirmedTicket.doctorAvatar || '/contact-doctor.png'}
                      alt={confirmedTicket.doctor}
                      className="w-14 h-14 rounded-xl object-cover object-top border border-teal-200 shadow-2xs"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/contact-doctor.png';
                      }}
                    />
                    <div>
                      <h4 className="text-base font-black text-slate-900 leading-tight">
                        {confirmedTicket.doctor}
                      </h4>
                      <p className="text-xs text-[#007A64] font-bold mt-0.5">
                        {confirmedTicket.specialty}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {confirmedTicket.doctorHospital}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-medium block">Consultation Date</span>
                      <span className="font-bold text-slate-800">{confirmedTicket.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Preferred Slot</span>
                      <span className="font-bold text-slate-800">{confirmedTicket.time}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Patient Name</span>
                      <span className="font-bold text-slate-800">{confirmedTicket.patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Contact Number</span>
                      <span className="font-bold text-slate-800">{confirmedTicket.patientPhone}</span>
                    </div>
                  </div>

                  {/* Payment Note */}
                  <div className="p-3 bg-white rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Consultation Fee (Pay at Clinic):</span>
                    <span className="font-black text-slate-900 text-sm">₹{confirmedTicket.fee}</span>
                  </div>

                  {/* WhatsApp Notice */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp confirmation & clinic location sent to {confirmedTicket.patientPhone}</span>
                  </div>

                </div>

                {/* Ticket Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loadAppointments();
                      setActiveTab('my-appointments');
                    }}
                    className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#007A64] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>View Appointments</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmedTicket(null)}
                    className="px-4 py-3 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Book Another</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY APPOINTMENTS HISTORY                                            */}
        {/* ========================================================================= */}
        {activeTab === 'my-appointments' && (
          <div className="space-y-4">
            {patientAppointments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center space-y-3">
                <div className="w-14 h-14 bg-teal-50 text-[#007A64] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No Appointments Scheduled</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  You haven't scheduled any doctor appointments yet. Choose a specialist to get your reference ticket.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book Doctor Appointment</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientAppointments.map((appt) => (
                  <div
                    key={appt.id || appt.bookingId}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-mono font-bold text-[#007A64]">
                          {appt.id || appt.bookingId}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                          appt.status === 'Cancelled'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {appt.status || 'Confirmed'}
                        </span>
                      </div>

                      <div className="pt-3">
                        <h4 className="text-base font-black text-slate-900">
                          {appt.doctor || appt.doctorName || appt.title}
                        </h4>
                        <p className="text-xs text-[#007A64] font-bold">
                          {appt.specialty || appt.doctorSpecialty || 'Specialist'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {appt.hospital || appt.doctorHospital || 'Zestmed Polyclinic Hub'}
                        </p>
                      </div>

                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500">Date & Slot:</span>
                          <span className="font-bold">{appt.date || appt.slot} {appt.time ? `• ${appt.time}` : ''}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500">Patient:</span>
                          <span className="font-bold">{appt.patientName || 'Patient'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500">Mode:</span>
                          <span className="font-bold">{appt.mode || 'Clinic Visit'}</span>
                        </div>
                      </div>
                    </div>

                    {appt.status !== 'Cancelled' && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(appt.id || appt.bookingId)}
                          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
