import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, ArrowRight, Video, Search, Stethoscope, 
  MapPin, ChevronDown, ShieldCheck, Clock, CreditCard, 
  Star, CheckCircle2, User, Phone, X, Award, AlertCircle,
  CalendarCheck, FileText, Sparkles, Heart, Activity
} from 'lucide-react';
import { MOCK_DOCTORS, DOCTOR_SPECIALTIES } from '../mock-data/doctorsData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

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

export default function DoctorAppointmentPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search card form states
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Active filters and views
  const [activeSpecialtyFilter, setActiveSpecialtyFilter] = useState('All');
  const [showAllDoctors, setShowAllDoctors] = useState(false);

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [consultationMode, setConsultationMode] = useState('Clinic Visit');
  const [appointmentSlotDate, setAppointmentSlotDate] = useState('Today');
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('04:30 PM');
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

  // Filtered doctors list based on user search or specialty pills
  const displayedDoctors = useMemo(() => {
    let list = MOCK_DOCTORS;

    if (activeSpecialtyFilter !== 'All') {
      list = list.filter((doc) => 
        doc.specialty.toLowerCase().includes(activeSpecialtyFilter.toLowerCase())
      );
    }

    if (!showAllDoctors && activeSpecialtyFilter === 'All') {
      return list.slice(0, 3);
    }

    return list;
  }, [activeSpecialtyFilter, showAllDoctors]);

  // Open booking modal
  const handleOpenBooking = (doctor = null, mode = 'Clinic Visit') => {
    const docToBook = doctor || MOCK_DOCTORS[0];
    setBookingDoctor(docToBook);
    setConsultationMode(mode);
    setConfirmedBooking(null);
    setIsBookingModalOpen(true);
  };

  // Submit search from "Find a Doctor" widget
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedSpecialty) {
      setActiveSpecialtyFilter(selectedSpecialty);
      addToast(`Filtered doctors for ${selectedSpecialty}`, 'info');
    } else {
      addToast('Showing all top specialist doctors', 'info');
      setActiveSpecialtyFilter('All');
      setShowAllDoctors(true);
    }

    // Smooth scroll to top doctors
    const doctorsSection = document.getElementById('top-doctors-section');
    if (doctorsSection) {
      doctorsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Confirm and save appointment
  const handleConfirmAppointment = (e) => {
    e.preventDefault();
    if (!patientForm.name.trim()) {
      addToast('Please enter the patient name', 'error');
      return;
    }
    if (!patientForm.phone.trim() || patientForm.phone.replace(/\D/g, '').length < 10) {
      addToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const apptId = `ZM-DOC-${Math.floor(10000 + Math.random() * 90000)}`;
      const newBooking = {
        id: apptId,
        bookingId: apptId,
        doctor: bookingDoctor?.name || 'Dr. Amit Sharma',
        doctorSpecialty: bookingDoctor?.specialty || 'General Physician',
        doctorDegree: bookingDoctor?.degree || 'MBBS, MD',
        doctorHospital: bookingDoctor?.hospital || 'Zestmed Polyclinic Hub',
        date: appointmentSlotDate === 'Today' ? 'Today, ' + new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : appointmentSlotDate,
        time: appointmentTimeSlot,
        mode: consultationMode,
        fee: bookingDoctor?.fee || 600,
        patientName: patientForm.name,
        patientPhone: patientForm.phone,
        patientAge: patientForm.age,
        patientGender: patientForm.gender,
        symptoms: patientForm.symptoms || 'General Checkup & Consultation',
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        freeCab: Boolean(parseInt(patientForm.age, 10) >= 60 || patientForm.freeSeniorCab)
      };

      // Save to localStorage so it shows up in Patient Dashboard
      try {
        const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
        localStorage.setItem('patient_appointments', JSON.stringify([newBooking, ...existing]));
      } catch (err) {
        console.error('Failed to sync appointment with storage', err);
      }

      setConfirmedBooking(newBooking);
      addToast(`Appointment scheduled with ${bookingDoctor?.name}!`, 'success');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans select-none">
      
      {/* Main Container */}
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. HERO BANNER (Matches Reference Image media_1794858959908_ef45bd13.jpg) */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200/90 shadow-sm min-h-[300px] sm:min-h-[320px] lg:min-h-[340px] flex items-center">
          
          {/* Background Image: Crystal-clear photo of the doctors in hospital corridor */}
          <div 
            className="absolute inset-0 bg-no-repeat bg-cover pointer-events-none"
            style={{
              backgroundImage: `url('/doctor-hero-bg.jpg')`,
              backgroundPosition: '55% 26%',
            }}
          />

          {/* Left Fade Overlay: Keeps text 100% crisp, contrasty, and readable */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 34%, rgba(255,255,255,0.7) 46%, rgba(255,255,255,0.1) 58%, rgba(255,255,255,0) 70%)'
            }}
          />

          {/* Mobile responsive backdrop tint */}
          <div className="lg:hidden absolute inset-0 bg-white/80 pointer-events-none" />

          {/* Content Grid */}
          <div className="relative z-10 w-full px-5 sm:px-8 lg:px-10 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Heading, Subtitle & Action Buttons */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-3 sm:space-y-4">
              
              {/* Doctor Appointment Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E6F7F2] text-[#007A64] border border-[#BCE8DD] text-xs font-bold shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
                <span>Doctor Appointment</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black text-[#0F1E36] leading-[1.18] tracking-tight">
                Book Doctor Appointment<br />
                <span className="font-extrabold text-[#0F1E36]">with </span>
                <span className="text-[#007A64] font-black">Trusted Specialists</span>
              </h1>

              {/* Subheading text */}
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
                Consult experienced and verified doctors across<br className="hidden sm:inline" />
                multiple specialties, online or at the clinic.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenBooking(null, 'Clinic Visit')}
                  className="bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenBooking(null, 'Online Consultation')}
                  className="bg-white hover:bg-slate-50 text-[#0F1E36] border border-slate-300 font-bold text-xs sm:text-sm px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Video className="w-4 h-4 text-[#007A64]" />
                  <span>Online Consultation</span>
                </button>
              </div>
            </div>

            {/* Spacer for doctors visual in the background */}
            <div className="hidden lg:block lg:col-span-2 xl:col-span-3" />

            {/* Right Column: Floating White "Find a Doctor" Card */}
            <div className="lg:col-span-4 xl:col-span-4 flex justify-end">
              <div className="w-full max-w-[340px] bg-white rounded-[24px] shadow-xl border border-slate-100 p-5 sm:p-6 space-y-3">
                
                {/* Card Title */}
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-5 h-5 text-[#007A64] stroke-[2.4]" />
                  <h3 className="text-lg font-black text-[#0F1E36] tracking-tight">
                    Find a Doctor
                  </h3>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSearchSubmit} className="space-y-2.5">
                  
                  {/* Field 1: Select Speciality */}
                  <div className="relative">
                    <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs font-semibold hover:border-[#007A64] transition">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Stethoscope className="w-4 h-4 text-[#007A64] shrink-0" />
                        <select
                          value={selectedSpecialty}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs truncate"
                        >
                          <option value="">Select Speciality</option>
                          {DOCTOR_SPECIALTIES.filter(s => s !== 'All Specialties').map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Field 2: Select Location */}
                  <div className="relative">
                    <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs font-semibold hover:border-[#007A64] transition">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MapPin className="w-4 h-4 text-[#007A64] shrink-0" />
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs truncate"
                        >
                          <option value="">Select Location</option>
                          <option value="Guwahati - GS Road Hub">Guwahati - GS Road Hub</option>
                          <option value="Dispur Polyclinic">Dispur Polyclinic</option>
                          <option value="Panbazar Medical Hub">Panbazar Medical Hub</option>
                          <option value="Jorhat Center">Jorhat Center</option>
                          <option value="Silpukhuri Polyclinic">Silpukhuri Polyclinic</option>
                          <option value="Ulubari Child & Family Care">Ulubari Child & Family Care</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Field 3: Preferred Date */}
                  <div className="relative">
                    <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs font-semibold hover:border-[#007A64] transition">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Calendar className="w-4 h-4 text-[#007A64] shrink-0" />
                        <select
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs truncate"
                        >
                          <option value="">Preferred Date</option>
                          <option value="Today">Today ({new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})</option>
                          <option value="Tomorrow">Tomorrow</option>
                          <option value="This Weekend">This Weekend</option>
                          <option value="Next Week">Next Week</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-1 bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Search Doctors</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. FEATURE BADGES BAR (5 Items Strip matching Reference Image)           */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs py-4 px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 first:pt-0 sm:first:pl-0 pl-1 sm:pl-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50/90 text-[#007A64] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#007A64]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#0F1E36] leading-tight">Verified Doctors</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Qualified & experienced</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50/90 text-[#007A64] flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5 text-[#007A64]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#0F1E36] leading-tight">Easy Booking</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Quick & hassle-free</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50/90 text-[#007A64] flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-[#007A64]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#0F1E36] leading-tight">Online Consultation</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Consult from home</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50/90 text-[#007A64] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#007A64]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#0F1E36] leading-tight">Flexible Slots</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Choose a time that suits you</p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50/90 text-[#007A64] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-[#007A64]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-[#0F1E36] leading-tight">Secure & Easy Payment</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Multiple payment options</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. BROWSE BY SPECIALTY (10 Medical Specialties matching Reference)       */}
        {/* ========================================================================= */}
        <section className="space-y-3.5">
          
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
              className="text-[#007A64] hover:text-[#005c4b] font-bold text-xs sm:text-sm flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View All Specialties</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 10 Specialty Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 sm:gap-3">
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
                  className={`bg-white rounded-2xl border p-3.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group min-h-[108px] select-none ${
                    isSelected
                      ? 'border-[#007A64] ring-2 ring-[#007A64]/20 shadow-md bg-teal-50/20 scale-102'
                      : 'border-slate-200/80 hover:border-teal-200 hover:shadow-md shadow-2xs hover:scale-102'
                  }`}
                >
                  {/* Clean Vector Icon */}
                  <div className="h-9 w-9 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <IconComp className={`w-7 h-7 ${spec.color}`} />
                  </div>

                  {/* Title Label */}
                  <span className={`text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 transition-colors ${
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
        {/* 4. TOP DOCTORS SECTION (Exact Cards matching Reference Image)            */}
        {/* ========================================================================= */}
        <section id="top-doctors-section" className="space-y-3.5 pt-1">
          
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-[#0F1E36] tracking-tight">
                Top Doctors
              </h2>
              {activeSpecialtyFilter !== 'All' && (
                <span className="text-xs font-bold bg-[#DCFCE7] text-[#047857] px-2.5 py-0.5 rounded-full border border-teal-200">
                  {activeSpecialtyFilter}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAllDoctors(!showAllDoctors);
                setActiveSpecialtyFilter('All');
              }}
              className="text-[#007A64] hover:text-[#005c4b] font-bold text-xs sm:text-sm flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>{showAllDoctors ? 'Show Top 3 Doctors' : 'View All Doctors'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Doctors Grid: Displays Dr. Amit Sharma, Dr. Neha Verma, Dr. Rohan Das */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {displayedDoctors.map((doc) => {
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    
                    {/* Doctor Avatar */}
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-2xs bg-slate-50 relative">
                      {doc.spritePosition ? (
                        <div 
                          className="w-full h-full bg-no-repeat"
                          style={{
                            backgroundImage: `url('/doctor-page-reference.jpg')`,
                            backgroundPosition: doc.id === 'doc-1' ? '6.8% 90%' : doc.id === 'doc-2' ? '38.2% 90%' : '69.5% 90%',
                            backgroundSize: '1350%',
                          }}
                          title={doc.name}
                        />
                      ) : (
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>

                    {/* Doctor Details */}
                    <div className="min-w-0 flex-1">
                      
                      {/* Name & Experience Badge in Top Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm sm:text-base font-extrabold text-[#0F1E36] group-hover:text-[#007A64] transition-colors leading-tight">
                            {doc.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            {doc.specialty}
                          </p>
                        </div>

                        {/* Experience Badge matching reference pill */}
                        <div className="shrink-0 text-center px-2 py-0.5 rounded-lg bg-[#E6F4F1] text-[#007A64] border border-teal-200/50 leading-none">
                          <p className="text-[11px] font-black">{doc.experience.split(' ')[0]}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Experience</p>
                        </div>
                      </div>

                      {/* Qualification */}
                      <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                        {doc.degree}
                      </p>

                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{doc.ratingScore || '4.8'}</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          ({doc.reviewsCount || '1,000+'} reviews)
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Bottom Action Bar: Fee & Book Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-slate-500 font-medium">Consultation Fee</span>
                      <p className="text-sm font-black text-[#0F1E36]">₹{doc.fee || 600}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBooking(doc, 'Clinic Visit')}
                      className="bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      Book Appointment
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </section>

      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE APPOINTMENT BOOKING MODAL                                  */}
      {/* ========================================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-y-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/70 to-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#007A64] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0F1E36]">
                    {confirmedBooking ? 'Appointment Confirmed!' : 'Book Doctor Appointment'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {confirmedBooking ? 'Your slot is secured. Summary below.' : 'Verified Specialists at Zestmed Polyclinic Hub'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Confirmation View or Booking Form */}
            {confirmedBooking ? (
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

                {/* Appointment Pass Details */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Doctor</span>
                    <span className="font-bold text-[#0F1E36]">{confirmedBooking.doctor} ({confirmedBooking.doctorSpecialty})</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Date & Slot</span>
                    <span className="font-bold text-[#0F1E36]">{confirmedBooking.date} at {confirmedBooking.time}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Consultation Mode</span>
                    <span className="font-bold text-[#007A64]">{confirmedBooking.mode}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Patient Name</span>
                    <span className="font-bold text-[#0F1E36]">{confirmedBooking.patientName} ({confirmedBooking.patientAge}y, {confirmedBooking.patientGender})</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Contact Number</span>
                    <span className="font-mono font-bold text-[#0F1E36]">+91 {confirmedBooking.patientPhone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Location</span>
                    <span className="font-semibold text-slate-800">Zestmed Central Clinic, GS Road, Guwahati</span>
                  </div>
                  {confirmedBooking.freeCab && (
                    <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 font-bold text-xs flex items-center gap-2">
                      <span>🚗 Complimentary AC Cab Pick-up registered for Senior Citizen</span>
                    </div>
                  )}
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      navigate('/patient-dashboard');
                    }}
                    className="w-full sm:flex-1 py-3 bg-[#007A64] hover:bg-[#006852] text-white font-bold rounded-xl text-sm shadow-md transition text-center cursor-pointer"
                  >
                    View in Patient Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedBooking(null);
                      setIsBookingModalOpen(false);
                    }}
                    className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-sm transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>

              </div>
            ) : (
              <form onSubmit={handleConfirmAppointment} className="p-6 space-y-5">
                
                {/* Doctor Selection / Summary */}
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-teal-200 flex items-center justify-center font-bold text-sm text-[#007A64] shadow-2xs">
                      <Stethoscope className="w-6 h-6 text-[#007A64]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-[#0F1E36]">
                        {bookingDoctor?.name || 'Dr. Amit Sharma'}
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold">
                        {bookingDoctor?.specialty} • {bookingDoctor?.degree}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {bookingDoctor?.experience} • Fee: <span className="font-bold text-[#0F1E36]">₹{bookingDoctor?.fee || 600}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <select
                      value={bookingDoctor?.id}
                      onChange={(e) => {
                        const doc = MOCK_DOCTORS.find(d => d.id === e.target.value);
                        if (doc) setBookingDoctor(doc);
                      }}
                      className="text-xs font-bold text-[#007A64] bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                    >
                      {MOCK_DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Consultation Mode Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConsultationMode('Clinic Visit')}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        consultationMode === 'Clinic Visit'
                          ? 'border-[#007A64] bg-[#007A64] text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>In-Clinic Visit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationMode('Online Consultation')}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                        consultationMode === 'Online Consultation'
                          ? 'border-[#007A64] bg-[#007A64] text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video Online</span>
                    </button>
                  </div>
                </div>

                {/* Date & Time Slot Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Date
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Today', 'Tomorrow', 'Day After'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setAppointmentSlotDate(d)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                            appointmentSlotDate === d
                              ? 'bg-teal-50 border-[#007A64] text-[#007A64]'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Select Time Slot
                    </label>
                    <select
                      value={appointmentTimeSlot}
                      onChange={(e) => setAppointmentTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-[#007A64] cursor-pointer"
                    >
                      <option value="10:00 AM">Morning: 10:00 AM</option>
                      <option value="11:30 AM">Morning: 11:30 AM</option>
                      <option value="02:00 PM">Afternoon: 02:00 PM</option>
                      <option value="04:30 PM">Evening: 04:30 PM (Recommended)</option>
                      <option value="06:00 PM">Evening: 06:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Patient Information Form */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patient Details
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Patient Full Name *"
                        value={patientForm.name}
                        onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#007A64]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Mobile Number (10 digits) *"
                        value={patientForm.phone}
                        onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#007A64]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="Age"
                        value={patientForm.age}
                        onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-[#007A64]"
                      />
                    </div>
                    <div>
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
                    <input
                      type="text"
                      placeholder="Symptoms or reason for consultation (e.g. Fever, Knee pain, General checkup)"
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

                {/* Submit Confirmation Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total Consultation Fee</p>
                    <p className="text-lg font-black text-[#0F1E36]">₹{bookingDoctor?.fee || 600}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3.5 bg-[#007A64] hover:bg-[#006852] disabled:bg-slate-300 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Securing Slot...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Appointment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
