import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, ArrowRight, Video, Search, Stethoscope, 
  MapPin, ChevronDown, ShieldCheck, Clock, CreditCard, 
  Star, CheckCircle2, User, Phone, X, Award, AlertCircle,
  CalendarCheck, FileText, Sparkles, Heart, Activity,
  ChevronLeft, ChevronRight, UserCheck, Banknote, Lock,
  PhoneCall, MessageSquare, GraduationCap, BadgeCheck
} from 'lucide-react';
import { MOCK_DOCTORS, DOCTOR_SPECIALTIES, matchesSpecialty } from '../mock-data/doctorsData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { bookDoctorAppointment, getDoctors } from '../services/supabaseService';
import { enforceAuth } from '../utils/authGuard';
import { launchRazorpayCheckout } from '../services/razorpayClient';
import DoctorHero from '../components/DoctorHero';

// =========================================================================
// Pixel-accurate Medical Specialty SVG Icons matching Reference Image
// =========================================================================

function StethoscopeIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
      <path d="M9 12.5v3.5a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-1.5" />
      <circle cx="18" cy="10" r="2.5" />
      <circle cx="4.5" cy="3" r="1.5" />
      <circle cx="13.5" cy="3" r="1.5" />
    </svg>
  );
}

function CardiologyIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
      <path d="M3 13h4l2 -4l3 7l2 -4h4" />
    </svg>
  );
}

function OrthopedicsIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3c-1.5 0-2.5 1-2.5 2.5 0 1.2.7 2 1.8 2.3L8 12l-.7 4.2c-1.1.3-1.8 1.1-1.8 2.3 0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5c0-.8-.4-1.5-1-1.9L10 12l.5-4.6c-.6-.4-1-1.1-1-1.9C9.5 4 8.5 3 8 3z" />
      <path d="M16 3c-1.5 0-2.5 1-2.5 2.5 0 .8.4 1.5 1 1.9l.5 4.6-.5 4.6c-.6.4-1 1.1-1 1.9 0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5c0-1.2-.7-2-1.8-2.3L16 12l.7-4.2c1.1-.3 1.8-1.1 1.8-2.3C18.5 4 17.5 3 16 3z" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function GynecologyIcon({ className = "w-7 h-7 text-[#E11D48]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21v-8" />
      <path d="M9 17h6" />
      <circle cx="12" cy="7.5" r="4.5" />
      <path d="M7.5 7.5c-2.5 0-4.5-2-4.5-4.5h2" />
      <path d="M16.5 7.5c2.5 0 4.5-2 4.5-4.5h-2" />
    </svg>
  );
}

function PediatricsIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="13" r="8" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" />
      <path d="M9.5 16c.8.8 1.6 1.2 2.5 1.2s1.7-.4 2.5-1.2" />
      <path d="M12 5c-1-2 1-3 1.5-1.5.5-1 2-1 1.5 1" />
      <circle cx="4" cy="13" r="1" />
      <circle cx="20" cy="13" r="1" />
    </svg>
  );
}

function DermatologyIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v10" />
      <path d="M12 12c-1.5 1.5-2 3-2 5 0 2 1.5 3 2 3s2-1 2-3c0-2-.5-3.5-2-5z" />
      <path d="M4 14c2.5 0 3.5 1 5 1s2.5-1 5-1 3.5 1 5 1" />
      <path d="M4 18c2.5 0 3.5 1 5 1s2.5-1 5-1 3.5 1 5 1" />
    </svg>
  );
}

function EntIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 13c0-4 2.5-8 7-8s6 3 6 7c0 3-1.5 5-3.5 6.5C14.5 20 13 22 10 22c-2.5 0-4-2-4-4.5" />
      <path d="M10 11.5c.5-1.5 1.5-2.5 3-2.5 1.5 0 2.5 1 2.5 2.5 0 1.5-1.2 2.5-2.5 3.5" />
    </svg>
  );
}

function GastroenterologyIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 3v4c0 1.5-1 2.5-2.5 2.5C5.5 9.5 4 12 4 15c0 4 3 6.5 7 6.5 4.5 0 8-3.5 8-8 0-3-1.5-5.5-4-6.5V3" />
      <path d="M15 13.5c-.5 1-1.5 1.5-3 1.5" />
    </svg>
  );
}

function NeurologyIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.5 4a3.5 3.5 0 0 0-3.5 3.5c0 .4.1.8.2 1.2A3 3 0 0 0 4 11.5c0 1 .5 1.9 1.3 2.5A3 3 0 0 0 5 16.5c0 1.4.9 2.5 2.2 2.9A3 3 0 0 0 10 21h2" />
      <path d="M14.5 4a3.5 3.5 0 0 1 3.5 3.5c0 .4-.1.8-.2 1.2a3 3 0 0 1 2.2 2.8c0 1-.5 1.9-1.3 2.5a3 3 0 0 1 .3 2.5c0 1.4-.9 2.5-2.2 2.9a3 3 0 0 1-2.8 1.6h-2" />
      <line x1="12" y1="4" x2="12" y2="21" />
      <path d="M8 8h1.5" />
      <path d="M14.5 8H16" />
      <path d="M7 13h2" />
      <path d="M15 13h2" />
      <path d="M8.5 17.5h1" />
      <path d="M14.5 17.5h1" />
    </svg>
  );
}

function PulmonologyIcon({ className = "w-7 h-7 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v9" />
      <path d="M12 9l-4 3" />
      <path d="M12 9l4 3" />
      <path d="M11 12.5C7 13 4 16 4 19.5c0 1.5 1.5 2.5 3.5 2.5 3.5 0 4.5-3 4.5-5.5v-4z" />
      <path d="M13 12.5C17 13 20 16 20 19.5c0 1.5-1.5 2.5-3.5 2.5-3.5 0-4.5-3-4.5-5.5v-4z" />
    </svg>
  );
}

// 10 Specialties matching the reference image exactly
const SPECIALTY_LIST = [
  { id: 'gen', name: 'General Physician', icon: StethoscopeIcon, color: 'text-[#007A64]' },
  { id: 'cardio', name: 'Cardiology', icon: CardiologyIcon, color: 'text-[#007A64]' },
  { id: 'ortho', name: 'Orthopedics', icon: OrthopedicsIcon, color: 'text-[#007A64]' },
  { id: 'gynae', name: 'Gynecology', icon: GynecologyIcon, color: 'text-[#E11D48]' },
  { id: 'pedia', name: 'Pediatrics', icon: PediatricsIcon, color: 'text-[#007A64]' },
  { id: 'derma', name: 'Dermatology', icon: DermatologyIcon, color: 'text-[#007A64]' },
  { id: 'ent', name: 'ENT', icon: EntIcon, color: 'text-[#007A64]' },
  { id: 'gastro', name: 'Gastroenterology', icon: GastroenterologyIcon, color: 'text-[#007A64]' },
  { id: 'neuro', name: 'Neurology', icon: NeurologyIcon, color: 'text-[#007A64]' },
  { id: 'pulmo', name: 'Pulmonology', icon: PulmonologyIcon, color: 'text-[#007A64]' },
];

// Helper functions matching Reference Card Layout
function getDoctorQualifications(doc) {
  if (doc?.qualifications && Array.isArray(doc.qualifications) && doc.qualifications.length > 0) {
    return doc.qualifications;
  }
  if (!doc?.degree) return ['MBBS', 'MD'];
  const parts = doc.degree.split(/,\s*(?=[A-Z])/).map(p => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [doc.degree];
}

function getDoctorSpecialityFocus(doc) {
  if (doc?.specialityFocus && Array.isArray(doc.specialityFocus) && doc.specialityFocus.length > 0) {
    return doc.specialityFocus;
  }
  const spec = (doc?.specialty || '').toLowerCase();
  if (spec.includes('general') || spec.includes('physician')) {
    return ['Internal Medicine', 'Preventive Care'];
  }
  if (spec.includes('cardio')) {
    return ['Interventional Cardiology', 'Cardiac Audit'];
  }
  if (spec.includes('ortho')) {
    return ['Joint Replacement', 'Arthroscopy'];
  }
  if (spec.includes('gyne') || spec.includes('gynae') || spec.includes('obstetric')) {
    return ['High-Risk Pregnancy', 'Maternal Health'];
  }
  if (spec.includes('pedia')) {
    return ['Neonatal Care', 'Child Wellness'];
  }
  if (spec.includes('derma')) {
    return ['Clinical Dermatology', 'Trichology'];
  }
  if (spec.includes('ent')) {
    return ['Endoscopic Sinus', 'Otology'];
  }
  if (spec.includes('gastro')) {
    return ['Digestive Health', 'Therapeutic Endoscopy'];
  }
  if (spec.includes('neuro')) {
    return ['Stroke Management', 'Neuro Therapeutics'];
  }
  if (spec.includes('pulmo') || spec.includes('chest')) {
    return ['Asthma & COPD', 'Chest Medicine'];
  }
  if (spec.includes('dental') || spec.includes('dentist')) {
    return ['Periodontics', 'Conservative Dentistry'];
  }
  return [doc?.specialty || 'Clinical Specialist', 'Consultation'];
}

export default function DoctorAppointmentPage() {
  const { addToast } = useToast();
  const { user, openAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Search card form states (NE Health Hub style)
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Active filters, expandable profiles and views
  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState('All');
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);

  // Doctors catalog state fetched from database
  const [doctorsList, setDoctorsList] = useState(MOCK_DOCTORS);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Modal Tabs & User Appointments History
  const [modalTab, setModalTab] = useState('schedule'); // 'schedule' | 'my-appointments'
  const [patientAppointments, setPatientAppointments] = useState([]);

  // Load user's booked appointments from localStorage
  const loadAppointments = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      const filtered = (stored || []).filter(item => 
        item.type === 'Doctor Appointment' || item.category === 'doctor' || item.doctor
      );
      setPatientAppointments(filtered);
    } catch {
      setPatientAppointments([]);
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
  }, []);

  // Cancel an appointment
  const handleCancelAppointment = (id) => {
    try {
      const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      const updated = existing.map(item => (item.id === id || item.bookingId === id) ? { ...item, status: 'Cancelled' } : item);
      localStorage.setItem('patient_appointments', JSON.stringify(updated));
      loadAppointments();
      addToast('Appointment cancelled successfully', 'info');
    } catch {
      addToast('Unable to cancel appointment', 'error');
    }
  };

  // Load doctors from database on component mount
  useEffect(() => {
    let isMounted = true;
    async function loadDoctors() {
      try {
        setIsLoadingDoctors(true);
        const docs = await getDoctors();
        if (isMounted && docs && docs.length > 0) {
          setDoctorsList(docs);
        }
      } catch (err) {
        console.warn('Error fetching doctors from database:', err);
      } finally {
        if (isMounted) setIsLoadingDoctors(false);
      }
    }
    loadDoctors();
    return () => { isMounted = false; };
  }, []);

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [consultationMode, setConsultationMode] = useState('Clinic Visit');
  const [appointmentSlotDate, setAppointmentSlotDate] = useState('Today');
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('04:30 PM');
  const [paymentMode, setPaymentMode] = useState('online'); // 'online' (Razorpay) or 'clinic'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const [patientForm, setPatientForm] = useState({
    name: user?.name || 'Rahul Verma',
    phone: user?.contact || user?.phone || '9279125091',
    age: user?.age || '34',
    gender: user?.gender || 'Male',
    symptoms: '',
    freeSeniorCab: false
  });

  useEffect(() => {
    if (user?.name && user.name !== 'Verified Patient') {
      setPatientForm((prev) => ({
        ...prev,
        name: user.name,
        phone: user.contact || user.phone || prev.phone,
        age: user.age || prev.age,
        gender: user.gender || prev.gender
      }));
    }
  }, [user]);

  // Filtered doctors list based on user search, doctor selection, or specialty pills
  const displayedDoctors = useMemo(() => {
    let list = doctorsList;

    if (activeSpecialtyFilter !== 'All') {
      list = list.filter((doc) => matchesSpecialty(doc, activeSpecialtyFilter));
    }

    if (selectedDoctor) {
      list = list.filter((doc) => doc.name.toLowerCase().includes(selectedDoctor.toLowerCase()));
    }

    if (!showAllDoctors && activeSpecialtyFilter === 'All' && !selectedDoctor) {
      return list.slice(0, 6);
    }

    return list;
  }, [doctorsList, activeSpecialtyFilter, selectedDoctor, showAllDoctors]);

  // Auto-redirect to doctor booking page when user logs in with pending action
  useEffect(() => {
    if (user) {
      try {
        const pendingRaw = sessionStorage.getItem('zestmed_pending_action');
        if (pendingRaw) {
          const parsed = JSON.parse(pendingRaw);
          if (parsed?.type === 'book_doctor') {
            sessionStorage.removeItem('zestmed_pending_action');
            navigate('/book-doctor', {
              state: {
                doctor: parsed.doctor || displayedDoctors[0] || doctorsList[0],
                mode: parsed.mode || 'Clinic Visit',
                specialty: (parsed.doctor || displayedDoctors[0] || doctorsList[0])?.specialty
              }
            });
          }
        }
      } catch (_) {}
    }
  }, [user, location.state, doctorsList, displayedDoctors, navigate]);

  // Open booking page (Matching user requirement)
  const handleOpenBooking = (doctor = null, mode = 'Clinic Visit') => {
    const docToBook = doctor || (displayedDoctors.length > 0 ? displayedDoctors[0] : (doctorsList[0] || MOCK_DOCTORS[0]));

    navigate('/book-doctor', {
      state: {
        doctor: docToBook,
        mode,
        specialty: docToBook?.specialty
      }
    });
  };

  // Submit search from "Find a Doctor" widget
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedDoctor) {
      const found = doctorsList.find(d => d.name.toLowerCase().includes(selectedDoctor.toLowerCase()));
      if (found) {
        setActiveSpecialtyFilter(found.specialty || 'All');
        setShowAllDoctors(true);
        addToast(`Found ${found.name}`, 'success');
      } else {
        setShowAllDoctors(true);
      }
    } else if (selectedSpecialty) {
      setActiveSpecialtyFilter(selectedSpecialty);
      addToast(`Filtered doctors for ${selectedSpecialty}`, 'info');
      setShowAllDoctors(true);
    } else {
      addToast('Showing all specialist doctors', 'info');
      setActiveSpecialtyFilter('All');
      setShowAllDoctors(true);
    }

    // Smooth scroll to top doctors
    const doctorsSection = document.getElementById('top-doctors-section');
    if (doctorsSection) {
      doctorsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Save Doctor Appointment to DB & local state
  const saveConfirmedDoctorAppointment = async (apptId, paymentDetails = null) => {
    const pid = paymentDetails?.paymentId || paymentDetails?.razorpay_payment_id || paymentDetails?.transaction_id || paymentDetails?.id;
    const isPaidOnline = Boolean(
      paymentDetails &&
      pid &&
      pid !== 'PAY_AT_CLINIC' &&
      pid !== 'clinic'
    );
    const newBooking = {
      id: apptId,
      bookingId: apptId,
      appointment_number: apptId,
      type: 'Doctor Appointment',
      category: 'doctor',
      title: bookingDoctor?.name || 'Dr. Amit Sharma',
      doctor: bookingDoctor?.name || 'Dr. Amit Sharma',
      doctorName: bookingDoctor?.name || 'Dr. Amit Sharma',
      doctorSpecialty: bookingDoctor?.specialty || 'General Physician',
      specialty: bookingDoctor?.specialty || 'General Physician',
      doctorDegree: bookingDoctor?.degree || 'MBBS, MD',
      doctorHospital: bookingDoctor?.hospital || 'Zestmed Polyclinic Hub',
      hospital: bookingDoctor?.hospital || 'Zestmed Polyclinic Hub',
      date: appointmentSlotDate === 'Today' ? 'Today, ' + new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : appointmentSlotDate,
      time: appointmentTimeSlot,
      slot: `${appointmentSlotDate}, ${appointmentTimeSlot}`,
      mode: consultationMode,
      fee: bookingDoctor?.fee || 600,
      price: bookingDoctor?.fee || 600,
      patientName: patientForm.name,
      patientPhone: patientForm.phone,
      phone: patientForm.phone,
      userId: user?.id || null,
      userEmail: user?.email || '',
      patientAge: patientForm.age,
      patientGender: patientForm.gender,
      symptoms: patientForm.symptoms || 'General Checkup & Consultation',
      status: 'Confirmed',
      paymentStatus: isPaidOnline ? 'Paid (UPI / Razorpay Verified)' : 'Pay at Clinic',
      paymentMethod: isPaidOnline ? (paymentDetails?.paymentMethod || 'Razorpay (UPI - Verified)') : 'Pay at Clinic Desk',
      paymentId: pid && pid !== 'PAY_AT_CLINIC' ? pid : '',
      orderId: paymentDetails?.orderId || paymentDetails?.razorpay_order_id || '',
      createdAt: new Date().toISOString(),
      freeCab: Boolean(parseInt(patientForm.age, 10) >= 60 || patientForm.freeSeniorCab)
    };

    // Save to localStorage so it shows up in Patient Dashboard
    try {
      const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      localStorage.setItem('patient_appointments', JSON.stringify([newBooking, ...existing]));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

      // Save to Supabase PostgreSQL database
      await bookDoctorAppointment(newBooking);
    } catch (err) {
      console.error('Failed to sync appointment with storage', err);
    }

    setConfirmedBooking(newBooking);
    setIsSubmitting(false);
    addToast(`Appointment scheduled with ${bookingDoctor?.name}!`, 'success');
  };

  // Confirm and save appointment
  const handleConfirmAppointment = (e) => {
    e.preventDefault();
    if (!user) {
      setIsBookingModalOpen(false);
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to confirm your doctor appointment',
        addToast
      });
      return;
    }

    if (!patientForm.name.trim()) {
      addToast('Please enter the patient name', 'error');
      return;
    }
    if (!patientForm.phone.trim() || patientForm.phone.replace(/\D/g, '').length < 10) {
      addToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    const apptId = `ZM-DOC-${Math.floor(10000 + Math.random() * 90000)}`;

    if (paymentMode === 'online') {
      setIsSubmitting(true);
      launchRazorpayCheckout({
        amount: bookingDoctor?.fee || 600,
        bookingId: apptId,
        bookingType: 'doctor',
        serviceTitle: `Doctor Consultation: ${bookingDoctor?.name || 'Doctor Appointment'}`,
        customer: {
          name: patientForm.name,
          phone: patientForm.phone,
          email: user?.email || 'patient@zestmed.in'
        },
        onSuccess: (verifiedTxn) => {
          saveConfirmedDoctorAppointment(apptId, verifiedTxn);
        },
        onFailure: (err) => {
          setIsSubmitting(false);
          addToast(err?.message || 'Payment not completed.', 'error');
        },
        onDismiss: () => {
          setIsSubmitting(false);
          addToast('Payment cancelled. You can choose Pay at Clinic.', 'info');
        }
      });
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        saveConfirmedDoctorAppointment(apptId, { paymentId: 'PAY_AT_CLINIC' });
      }, 400);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER - Full-Width Edge to Edge (No Outer Card Box)              */}
      {/* ========================================================================= */}
      <DoctorHero
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        specialties={DOCTOR_SPECIALTIES}
        doctors={doctorsList}
        onSearchSubmit={handleSearchSubmit}
        onBookAppointment={handleOpenBooking}
        onOnlineConsultation={handleOpenBooking}
      />

      {/* Main Container matching Zestmed Standard for remaining sections */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-5 sm:pt-6 pb-12 space-y-7 sm:space-y-8">

        {/* ========================================================================= */}
        {/* 2. FEATURE BADGES BAR (5 Items Strip matching Reference Image)           */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs py-5 sm:py-6 px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 first:pt-0 sm:first:pl-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <ShieldCheck className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F1E36] leading-tight">Verified Doctors</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Qualified & experienced</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <CalendarCheck className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F1E36] leading-tight">Easy Booking</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Quick & hassle-free</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <Video className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F1E36] leading-tight">Online Consultation</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Consult from home</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <Clock className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F1E36] leading-tight">Flexible Slots</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Choose a time that suits you</p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-center gap-3.5 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <CreditCard className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F1E36] leading-tight">Secure & Easy Payment</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Multiple payment options</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. BROWSE BY SPECIALTY (10 Medical Specialties matching Reference)       */}
        {/* ========================================================================= */}
        <section className="space-y-3.5 sm:space-y-4">
          
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight">
              Browse by Specialty
            </h2>
            <button
              type="button"
              onClick={() => {
                setActiveSpecialtyFilter('All');
                setShowAllDoctors(true);
              }}
              className="text-[#007A64] hover:text-[#005c4b] font-extrabold text-xs sm:text-sm flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View All Specialties</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 10 Specialty Cards Grid - Compact sizing with no cut-off text */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5 lg:gap-3">
            {SPECIALTY_LIST.map((spec) => {
              const IconComp = spec.icon;
              const isSelected = activeSpecialtyFilter.toLowerCase() === spec.name.toLowerCase();

              return (
                <div
                  key={spec.id}
                  onClick={() => {
                    if (isSelected) {
                      setActiveSpecialtyFilter('All');
                    } else {
                      setActiveSpecialtyFilter(spec.name);
                    }
                  }}
                  className={`bg-white rounded-xl sm:rounded-2xl border px-1.5 py-2.5 sm:px-2 sm:py-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group min-h-[92px] sm:min-h-[102px] select-none overflow-hidden ${
                    isSelected
                      ? 'border-[#007A64] ring-2 ring-[#007A64]/20 shadow-md bg-teal-50/20 scale-102'
                      : 'border-slate-200/80 hover:border-teal-200 hover:shadow-md shadow-2xs hover:scale-102'
                  }`}
                >
                  {/* Clean Vector Icon - Sized slightly smaller */}
                  <div className="h-7 sm:h-8 w-7 sm:w-8 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shrink-0">
                    <IconComp className={`w-5.5 h-5.5 sm:w-6 sm:h-6 ${spec.color}`} />
                  </div>

                  {/* Title Label - Balanced font size & tracking so 'Gastroenterology' is never cut off */}
                  <span className={`text-[10px] sm:text-[11px] xl:text-[11.5px] font-bold leading-tight tracking-tight transition-colors w-full px-0.5 text-center break-words hyphens-auto ${
                    isSelected ? 'text-[#007A64] font-black' : 'text-slate-800 group-hover:text-[#007A64]'
                  }`}>
                    {spec.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. MEET OUR SPECIALIST DOCTORS (NE Health Hub Architecture & Design)     */}
        {/* ========================================================================= */}
        <section id="top-doctors-section" className="space-y-5 pt-2">
          
          {/* Section Header matching NE Health Hub Structure */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {/* Eyebrow Pill Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F3ED] text-[#007A64] border border-[#BCE8DD] text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2">
                <Stethoscope className="w-3.5 h-3.5 text-[#007A64]" />
                <span>SENIOR SPECIALISTS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F1E36] tracking-tight">
                Meet Our Specialist Doctors
              </h2>
              <div className="w-16 h-1 bg-[#007A64] rounded-full mt-2.5 mb-2" />
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                Consult experienced, accredited medical specialists and senior consultants across Guwahati and the North-East.
              </p>
              {activeSpecialtyFilter !== 'All' && (
                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#007A64] border border-teal-200 text-xs font-bold">
                  <span>Showing: <strong>{activeSpecialtyFilter}</strong></span>
                  <button
                    type="button"
                    onClick={() => setActiveSpecialtyFilter('All')}
                    className="text-[#007A64] hover:text-slate-700 font-black ml-1 text-sm cursor-pointer"
                    title="Clear filter"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAllDoctors(!showAllDoctors);
                  if (activeSpecialtyFilter !== 'All') setActiveSpecialtyFilter('All');
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#007A64] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition cursor-pointer"
              >
                <span>{showAllDoctors ? 'Show Top 6 Doctors' : `View All Doctors (${doctorsList.length})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Doctors Grid matching NE Health Hub Card Architecture */}
          {displayedDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-8 sm:p-12 text-center space-y-3">
              <div className="w-14 h-14 bg-teal-50 text-[#007A64] rounded-2xl flex items-center justify-center mx-auto">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-[#0F1E36]">No Doctors Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                No doctors currently match "{activeSpecialtyFilter}". You can explore all our verified specialists below.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveSpecialtyFilter('All');
                  setSelectedDoctor('');
                  setShowAllDoctors(true);
                }}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white text-xs sm:text-sm font-bold shadow-2xs hover:shadow-md transition cursor-pointer"
              >
                <span>View All Specialists</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {displayedDoctors.map((doc) => {
                const isExpanded = expandedDoctorId === doc.id;
                const qualifications = getDoctorQualifications(doc);
                const focusAreas = getDoctorSpecialityFocus(doc);

                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                  >
                    {/* 1. Doctor Portrait Photo matching Reference Image 1 & 2 */}
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100 select-none">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/contact-doctor.png';
                        }}
                      />
                    </div>

                    {/* 2. Doctor Information Body matching Reference Image 1 & 2 */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3.5">
                        
                        {/* Specialty / Department in bold uppercase teal */}
                        <div>
                          <p className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-[#007A64] mb-1">
                            {doc.specialty || 'SPECIALIST CONSULTANT'}
                          </p>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                            {doc.name}
                          </h3>
                          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                            {doc.designation || 'Senior Consultant'}
                          </p>
                        </div>

                        {/* QUALIFICATION Section with Graduation Cap icon */}
                        <div className="flex items-start gap-3 pt-1">
                          <div className="w-8 h-8 rounded-full bg-[#E6F4F1] text-[#007A64] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <GraduationCap className="w-4 h-4 text-[#007A64]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                              QUALIFICATION
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {qualifications.map((q, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold"
                                >
                                  {q}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* SPECIALITY FOCUS Section with BadgeCheck icon */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <BadgeCheck className="w-4 h-4 text-[#4F46E5]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                              SPECIALITY FOCUS
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {focusAreas.map((f, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#007A64] text-xs font-bold"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Section matching Reference Image 2 */}
                        {isExpanded && (
                          <div className="space-y-3 pt-2 text-xs animate-in fade-in duration-200">
                            {/* Doctor Bio Box */}
                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                              {doc.bio || 'Senior medical consultant specializing in comprehensive patient care, accurate clinical diagnoses, and specialized therapeutic management.'}
                            </div>

                            {/* AVAILABLE DAYS with Calendar icon and day pills */}
                            <div className="rounded-xl border border-teal-200/90 bg-teal-50/20 p-3.5 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#007A64]">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>AVAILABLE DAYS</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                  <span
                                    key={day}
                                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs"
                                  >
                                    {day}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* 3. Card Action Footer matching Reference Image 1 & 2 */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        {/* View Profile v / Hide Details ^ button */}
                        <button
                          type="button"
                          onClick={() => setExpandedDoctorId(isExpanded ? null : doc.id)}
                          className="px-3.5 sm:px-4 py-2.5 rounded-xl border border-[#007A64] hover:bg-teal-50/60 text-[#007A64] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Profile'}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Book Slot filled button -> opens the new booking page */}
                        <button
                          type="button"
                          onClick={() => handleOpenBooking(doc, 'Clinic Visit')}
                          className="flex-1 px-4 sm:px-5 py-2.5 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition cursor-pointer active:scale-95"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book Slot</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* NE Health Hub Style: Direct Hotline & WhatsApp Booking Strip */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 rounded-2xl border border-teal-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#007A64] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-[#0F1E36]">
                  Need Assistance Finding the Right Doctor?
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Speak directly with our clinical care coordinators or chat on WhatsApp for priority doctor appointment booking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <a
                href="tel:+919279125091"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#007A64] border border-teal-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <PhoneCall className="w-4 h-4 text-[#007A64]" />
                <span>Call +91 9279125091</span>
              </a>
              <a
                href="https://wa.me/919279125091?text=Hi%2C%20I%20would%20like%20to%20book%20a%20doctor%20appointment%20at%20ZESTMED"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Booking</span>
              </a>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 5. HOW TO BOOK A DOCTOR APPOINTMENT? (Matches Reference Image)            */}
        {/* ========================================================================= */}
        <section className="rounded-[28px] bg-gradient-to-r from-[#F0FAF7] via-[#F4FBF9] to-[#EAF7F4] border border-[#D5EFE8] p-6 sm:p-7 lg:p-8 relative overflow-hidden shadow-2xs">
          
          <h2 className="text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight mb-5 sm:mb-6">
            How to Book a Doctor Appointment?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
            
            {/* Left: 4-Step Interactive Flow - Balanced Typography & Proportions */}
            <div className="lg:col-span-10 grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 xl:gap-6 items-start">
              
              {/* Step 1 */}
              <div className="flex flex-col items-start relative text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center mb-2.5 shadow-2xs">
                  1
                </div>
                <div className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-start mb-2 text-[#007A64]">
                  <Search className="w-6 sm:w-7 h-6 sm:h-7 text-[#007A64] stroke-[2.2]" />
                </div>
                <h4 className="text-sm sm:text-base font-black text-[#0F1E36] leading-snug whitespace-nowrap">
                  Search Doctor
                </h4>
                <p className="text-xs sm:text-[12px] xl:text-[13px] text-slate-500 font-medium mt-1 leading-relaxed whitespace-nowrap">
                  Find by specialty, location or name
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-start relative text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center mb-2.5 shadow-2xs">
                  2
                </div>
                <div className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-start mb-2 text-[#007A64]">
                  <Calendar className="w-6 sm:w-7 h-6 sm:h-7 text-[#007A64] stroke-[2.2]" />
                </div>
                <h4 className="text-sm sm:text-base font-black text-[#0F1E36] leading-snug whitespace-nowrap">
                  Select Date & Time
                </h4>
                <p className="text-xs sm:text-[12px] xl:text-[13px] text-slate-500 font-medium mt-1 leading-relaxed whitespace-nowrap">
                  Choose a convenient slot
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-start relative text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center mb-2.5 shadow-2xs">
                  3
                </div>
                <div className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-start mb-2 text-[#007A64]">
                  <UserCheck className="w-6 sm:w-7 h-6 sm:h-7 text-[#007A64] stroke-[2.2]" />
                </div>
                <h4 className="text-sm sm:text-base font-black text-[#0F1E36] leading-snug whitespace-nowrap">
                  Book Appointment
                </h4>
                <p className="text-xs sm:text-[12px] xl:text-[13px] text-slate-500 font-medium mt-1 leading-relaxed whitespace-nowrap">
                  Confirm your details and book
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-start relative text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center mb-2.5 shadow-2xs">
                  4
                </div>
                <div className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-start mb-2 text-[#007A64]">
                  <CheckCircle2 className="w-6 sm:w-7 h-6 sm:h-7 text-[#007A64] stroke-[2.2]" />
                </div>
                <h4 className="text-sm sm:text-base font-black text-[#0F1E36] leading-snug whitespace-nowrap">
                  Get Confirmation
                </h4>
                <p className="text-xs sm:text-[12px] xl:text-[13px] text-slate-500 font-medium mt-1 leading-relaxed whitespace-nowrap">
                  Receive instant booking confirmation
                </p>
              </div>

            </div>

            {/* Right: Desk Calendar 3D Graphic - Balanced & Aligned */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <div className="relative w-28 sm:w-32 lg:w-36 h-28 sm:h-32 lg:h-36 flex items-center justify-center">
                {/* Ambient glow behind calendar */}
                <div className="absolute inset-0 bg-teal-300/30 rounded-full blur-2xl pointer-events-none" />
                
                {/* Illustrated 3D Desk Calendar SVG */}
                <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-xl select-none" fill="none">
                  {/* Calendar Base Drop Shadow / Stand */}
                  <rect x="25" y="45" width="150" height="120" rx="18" fill="#FFFFFF" stroke="#D5EFE8" strokeWidth="2.5" />
                  
                  {/* Top Binder Header Band */}
                  <path d="M25 60 C25 48, 25 48, 38 48 L162 48 C175 48, 175 48, 175 60 L175 72 L25 72 Z" fill="#007A64" />
                  
                  {/* Binder Ring 1 */}
                  <rect x="52" y="36" width="10" height="24" rx="5" fill="#005B4E" stroke="#FFFFFF" strokeWidth="2" />
                  
                  {/* Binder Ring 2 */}
                  <rect x="138" y="36" width="10" height="24" rx="5" fill="#005B4E" stroke="#FFFFFF" strokeWidth="2" />
                  
                  {/* Calendar Sheet Grid Dots */}
                  <g fill="#CBD5E1">
                    <circle cx="50" cy="90" r="4.5" />
                    <circle cx="75" cy="90" r="4.5" />
                    <circle cx="100" cy="90" r="4.5" />
                    <circle cx="125" cy="90" r="4.5" />
                    <circle cx="150" cy="90" r="4.5" />
                    
                    <circle cx="50" cy="112" r="4.5" />
                    <circle cx="75" cy="112" r="4.5" />
                    <circle cx="100" cy="112" r="4.5" />
                    <circle cx="125" cy="112" r="4.5" />
                    
                    <circle cx="50" cy="134" r="4.5" />
                    <circle cx="75" cy="134" r="4.5" />
                    <circle cx="100" cy="134" r="4.5" />
                  </g>
                  
                  {/* Large Green Checkmark Badge on Calendar */}
                  <circle cx="146" cy="126" r="24" fill="#007A64" stroke="#FFFFFF" strokeWidth="3" />
                  <path d="M137 126 L143 132 L155 120" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* 6. WHY CHOOSE ZESTMED? (4 Cards matching Reference Image)                */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1E36] tracking-tight">
            Why Choose ZESTMED?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[155px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F1E36] leading-tight">Verified Specialists</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Experienced &amp; trusted doctors</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[155px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <Video className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F1E36] leading-tight">Online &amp; On-site Consultation</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Choose what suits you</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[155px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F1E36] leading-tight">Quick &amp; Easy Booking</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Book in just a few clicks</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[155px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <CreditCard className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F1E36] leading-tight">Secure Payments</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Multiple payment options</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. WHAT OUR PATIENTS SAY (Testimonials with Carousel Controls)           */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F1E36] tracking-tight">
              What Our Patients Say
            </h2>

            {/* Carousel Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                aria-label="Previous Testimonial"
                className="w-9 h-9 rounded-full border border-slate-200 hover:border-[#007A64] hover:bg-teal-50 text-slate-600 hover:text-[#007A64] flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                type="button" 
                aria-label="Next Testimonial"
                className="w-9 h-9 rounded-full border border-slate-200 hover:border-[#007A64] hover:bg-teal-50 text-slate-600 hover:text-[#007A64] flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" 
                    alt="Ankit Kumar"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0F1E36]">Ankit Kumar</h4>
                  <div className="flex items-center gap-0.5 mt-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Very easy to book an appointment. The doctor was highly professional and explained everything clearly."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" 
                    alt="Priya Sharma"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0F1E36]">Priya Sharma</h4>
                  <div className="flex items-center gap-0.5 mt-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Great experience! I booked an online consultation and got the guidance I needed without visiting the clinic."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" 
                    alt="Rohit Das"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0F1E36]">Rohit Das</h4>
                  <div className="flex items-center gap-0.5 mt-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "Zestmed makes it so convenient to find and consult the right doctor. Highly recommended!"
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. BOTTOM CTA BANNER (Consult with Expert Doctors Today!)                */}
        {/* ========================================================================= */}
        <section className="rounded-[28px] bg-gradient-to-r from-[#006A57] via-[#007A64] to-[#008970] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-md flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Ambient background blur elements */}
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 top-0 w-48 h-48 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text */}
          <div className="relative z-10 space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-tight">
              Consult with Expert Doctors Today!
            </h2>
            <p className="text-sm sm:text-base text-[#D1FAE5] font-medium leading-relaxed max-w-lg">
              Book your appointment now and take the first step towards better health.
            </p>
          </div>

          {/* Right Action Button & Medical Clipboard Illustration */}
          <div className="relative z-10 flex items-center gap-6 shrink-0">
            
            <button
              type="button"
              onClick={() => handleOpenBooking(null, 'Clinic Visit')}
              className="bg-white hover:bg-slate-50 text-[#007A64] font-black text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Calendar className="w-5 h-5 text-[#007A64]" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-5 h-5 text-[#007A64]" />
            </button>

            {/* Illustrated Medical Clipboard with Green Cross & Stethoscope */}
            <div className="hidden sm:block w-24 h-24 relative select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none">
                {/* Clipboard Board */}
                <rect x="25" y="16" width="54" height="74" rx="8" fill="#FFFFFF" stroke="#D1FAE5" strokeWidth="2" />
                
                {/* Clipboard Top Clip */}
                <rect x="38" y="10" width="28" height="12" rx="4" fill="#005B4E" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="52" cy="14" r="2.5" fill="#FFFFFF" />
                
                {/* Green Cross on Board */}
                <rect x="47" y="32" width="10" height="26" rx="2" fill="#007A64" />
                <rect x="39" y="40" width="26" height="10" rx="2" fill="#007A64" />
                
                {/* Clipboard Document Lines */}
                <rect x="36" y="66" width="32" height="3" rx="1.5" fill="#CBD5E1" />
                <rect x="36" y="73" width="22" height="3" rx="1.5" fill="#CBD5E1" />
                
                {/* Stethoscope Curving Around Board */}
                <path d="M78 84 C78 92, 22 92, 22 66 C22 50, 20 40, 16 34" stroke="#004D40" strokeWidth="3" strokeLinecap="round" />
                <circle cx="16" cy="32" r="4.5" fill="#007A64" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>
            </div>

          </div>

        </section>

      </div>

      {/* ========================================================================= */}
      {/* 9. INTERACTIVE APPOINTMENT BOOKING MODAL                                  */}
      {/* ========================================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-y-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header with NE Health Hub Style Tabs */}
            <div className="px-4 sm:px-6 pt-4 pb-0 border-b border-slate-100 bg-gradient-to-r from-teal-50/70 to-white sticky top-0 z-10">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-[#007A64] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-[#007A64]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0F1E36]">
                      {confirmedBooking ? 'Appointment Confirmed!' : 'Clinical Consultation Scheduler'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {confirmedBooking ? 'Your slot is secured. Summary below.' : 'Verified Specialists at Zestmed Polyclinic Hub'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setConfirmedBooking(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* NE Health Hub Tabs: Schedule Appointment vs My Appointments */}
              {!confirmedBooking && (
                <div className="flex items-center gap-4 text-xs font-bold border-t border-slate-100/80 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalTab('schedule')}
                    className={`pb-2.5 border-b-2 font-black transition cursor-pointer flex items-center gap-1.5 ${
                      modalTab === 'schedule'
                        ? 'border-[#007A64] text-[#007A64]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Appointment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      loadAppointments();
                      setModalTab('my-appointments');
                    }}
                    className={`pb-2.5 border-b-2 font-black transition cursor-pointer flex items-center gap-1.5 ${
                      modalTab === 'my-appointments'
                        ? 'border-[#007A64] text-[#007A64]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>My Appointments ({patientAppointments.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body: My Appointments Tab View */}
            {modalTab === 'my-appointments' && !confirmedBooking ? (
              <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[#0F1E36]">
                    Your Scheduled Consultations
                  </h4>
                  <button
                    type="button"
                    onClick={() => setModalTab('schedule')}
                    className="text-xs font-bold text-[#007A64] hover:underline"
                  >
                    + Book New Slot
                  </button>
                </div>

                {patientAppointments.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
                    <h5 className="text-sm font-bold text-slate-700">No Appointments Booked Yet</h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      You haven't scheduled any doctor consultations yet. Select a doctor to book your slot in seconds.
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalTab('schedule')}
                      className="mt-2 px-5 py-2.5 bg-[#007A64] hover:bg-[#006852] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                    >
                      Book An Appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientAppointments.map((appt) => (
                      <div key={appt.id || appt.bookingId} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 block">{appt.id || appt.bookingId}</span>
                            <h5 className="text-sm font-black text-[#0F1E36]">{appt.doctor || appt.doctorName || appt.title}</h5>
                            <p className="text-xs text-[#007A64] font-bold">{appt.specialty || appt.doctorSpecialty}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            appt.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {appt.status || 'Confirmed'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Slot Date & Time</span>
                            <span className="font-bold text-slate-800">{appt.date} • {appt.time}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Mode</span>
                            <span className="font-bold text-slate-800">{appt.mode}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Patient</span>
                            <span className="font-bold text-slate-800">{appt.patientName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Payment</span>
                            <span className="font-bold text-slate-800">{appt.paymentStatus || (appt.paymentId ? 'Paid' : 'Pay at Clinic')}</span>
                          </div>
                        </div>

                        {appt.status !== 'Cancelled' && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleCancelAppointment(appt.id || appt.bookingId)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
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
            ) : confirmedBooking ? (
              <div className="p-6 space-y-6">
                
                {/* Success Card */}
                <div className="p-5 rounded-2xl bg-[#DCFCE7]/70 border border-[#86EFAC] text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-[#0F1E36]">
                    Appointment Successfully Scheduled!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Appointment ID: <span className="font-mono font-bold text-[#0F1E36]">{confirmedBooking.id}</span>
                  </p>
                </div>

                {/* Details Breakdown */}
                <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Doctor</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.doctor} ({confirmedBooking.doctorSpecialty})</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Date & Slot</span>
                    <span className="font-bold text-[#007A64]">{confirmedBooking.date} • {confirmedBooking.time}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Mode</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.mode}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Patient</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.patientName} ({confirmedBooking.patientAge} Yrs, {confirmedBooking.patientGender})</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.patientPhone}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-sm font-extrabold text-[#0F1E36]">
                    <span>Consultation Fee</span>
                    {confirmedBooking.paymentId ? (
                      <div className="text-right">
                        <span className="text-emerald-700 font-bold block">₹{confirmedBooking.fee} (Paid via Razorpay)</span>
                        <span className="text-[10px] text-slate-500 font-mono block">Txn: {confirmedBooking.paymentId}</span>
                      </div>
                    ) : (
                      <span className="text-[#007A64]">₹{confirmedBooking.fee} (Pay at Clinic)</span>
                    )}
                  </div>

                  {confirmedBooking.freeCab && (
                    <div className="mt-2 p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-[11px] font-bold flex items-center gap-2">
                      <span>🚗</span>
                      <span>Complimentary Senior Citizen Pick-up & Drop within 10km (Guwahati) Confirmed</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      navigate('/patient-dashboard');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    View in Patient Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white text-xs font-bold transition shadow-xs"
                  >
                    Done
                  </button>
                </div>

              </div>
            ) : (
              <form onSubmit={handleConfirmAppointment} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                
                {/* Doctor Selection Pill */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img 
                        src={bookingDoctor?.avatar || '/doctor-amit-sharma.jpg'} 
                        alt={bookingDoctor?.name}
                        className="w-full h-full object-cover object-top" 
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#0F1E36]">{bookingDoctor?.name || 'Dr. Amit Sharma'}</h4>
                      <p className="text-xs text-slate-600 font-medium">{bookingDoctor?.specialty} • {bookingDoctor?.degree}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee</span>
                    <span className="text-sm font-black text-[#007A64]">₹{bookingDoctor?.fee || 600}</span>
                  </div>
                </div>

                {/* Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Consultation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConsultationMode('Clinic Visit')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        consultationMode === 'Clinic Visit'
                          ? 'border-[#007A64] bg-teal-50/50 text-[#007A64] shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 text-[#007A64]" />
                      <span>Clinic Visit (Guwahati Hub)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationMode('Online Consultation')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        consultationMode === 'Online Consultation'
                          ? 'border-[#007A64] bg-teal-50/50 text-[#007A64] shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Video className="w-4 h-4 text-[#007A64]" />
                      <span>Online Video Consult</span>
                    </button>
                  </div>
                </div>

                {/* Slot Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Date
                    </label>
                    <select
                      value={appointmentSlotDate}
                      onChange={(e) => setAppointmentSlotDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#007A64]"
                    >
                      <option value="Today">Today ({new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="Nov 18, 2026">Nov 18, 2026</option>
                      <option value="Nov 19, 2026">Nov 19, 2026</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Time Slot
                    </label>
                    <select
                      value={appointmentTimeSlot}
                      onChange={(e) => setAppointmentTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#007A64]"
                    >
                      <option value="10:30 AM">10:30 AM (Morning)</option>
                      <option value="11:30 AM">11:30 AM (Morning)</option>
                      <option value="04:30 PM">04:30 PM (Evening)</option>
                      <option value="05:30 PM">05:30 PM (Evening)</option>
                      <option value="06:30 PM">06:30 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                {/* Patient Information Form */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patient Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={patientForm.name}
                        onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#007A64]"
                        placeholder="e.g. Rahul Verma"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Phone Number (10 digits) *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={patientForm.phone}
                        onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#007A64]"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={patientForm.age}
                        onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#007A64]"
                        placeholder="34"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Gender
                      </label>
                      <select
                        value={patientForm.gender}
                        onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#007A64]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Reason for Consultation / Symptoms (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mild fever, persistent cough, knee joint stiffness"
                      value={patientForm.symptoms}
                      onChange={(e) => setPatientForm({ ...patientForm, symptoms: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#007A64]"
                    />
                  </div>

                  {/* Free Senior Citizen Cab Perks */}
                  {parseInt(patientForm.age, 10) >= 60 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🚗</span>
                        <span className="font-bold">Eligible for Free Senior Citizen AC Cab Pick-up within 10km (Guwahati)</span>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        FREE
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('online')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        paymentMode === 'online'
                          ? 'border-[#007A64] bg-teal-50/80 text-[#007A64] ring-1 ring-[#007A64]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#007A64]" />
                        <div className="text-left">
                          <span className="block font-bold">Pay Online (Razorpay)</span>
                          <span className="text-[10px] text-slate-500 font-normal">UPI, Cards, NetBanking</span>
                        </div>
                      </div>
                      {paymentMode === 'online' && <CheckCircle2 className="w-4 h-4 text-[#007A64]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('clinic')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        paymentMode === 'clinic'
                          ? 'border-[#007A64] bg-teal-50/80 text-[#007A64] ring-1 ring-[#007A64]'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <div className="text-left">
                          <span className="block font-bold">Pay at Clinic</span>
                          <span className="text-[10px] text-slate-500 font-normal">Cash / UPI during visit</span>
                        </div>
                      </div>
                      {paymentMode === 'clinic' && <CheckCircle2 className="w-4 h-4 text-[#007A64]" />}
                    </button>
                  </div>
                </div>

                {/* Submit Confirmation Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Consultation Fee</p>
                    <p className="text-lg font-black text-[#0F1E36]">₹{bookingDoctor?.fee || 600}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white text-xs sm:text-sm font-bold transition shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Processing Payment...</span>
                      ) : paymentMode === 'online' ? (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay ₹{bookingDoctor?.fee || 600} & Confirm</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Appointment</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
