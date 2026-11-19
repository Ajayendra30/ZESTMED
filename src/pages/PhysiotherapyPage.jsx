import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, ArrowRight, Phone, User, Clock, Activity, 
  ShieldCheck, CheckCircle2, ChevronRight, Star, Heart,
  Award, Sparkles, FileText, Target, Home as HomeIcon,
  Stethoscope, Users, X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { bookPhysiotherapy } from '../services/supabaseService';

// =========================================================================
// Custom Medical Vector Icons matching Reference Design
// =========================================================================

function SpineIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v20" />
      <path d="M8 5h8" />
      <path d="M7 9h10" />
      <path d="M6 13h12" />
      <path d="M7 17h10" />
      <path d="M8 21h8" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="9" r="1.5" fill="currentColor" />
      <circle cx="12" cy="13" r="1.5" fill="currentColor" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
      <circle cx="12" cy="21" r="1.5" fill="currentColor" />
    </svg>
  );
}

function NeckIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="5" r="3" />
      <path d="M9 10v4c0 1.5-1 2.5-3 3" />
      <path d="M15 10v4c0 1.5 1 2.5 3 3" />
      <path d="M10 13h4" />
      <path d="M10 16h4" />
    </svg>
  );
}

function KneeJointIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3c-1.5 0-2.5 1-2.5 2.5 0 1.2.7 2 1.8 2.3L8 12l-.7 4.2c-1.1.3-1.8 1.1-1.8 2.3 0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5c0-.8-.4-1.5-1-1.9L10 12l.5-4.6c-.6-.4-1-1.1-1-1.9C9.5 4 8.5 3 8 3z" />
      <path d="M16 3c-1.5 0-2.5 1-2.5 2.5 0 .8.4 1.5 1 1.9l.5 4.6-.5 4.6c-.6.4-1 1.1-1 1.9 0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5c0-1.2-.7-2-1.8-2.3L16 12l.7-4.2c1.1-.3 1.8-1.1 1.8-2.3C18.5 4 17.5 3 16 3z" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function ShoulderIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 19v-4c0-2 2-4 4-5l3-2" />
      <path d="M18 19v-4c0-2-2-4-4-5l-3-2" />
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="7" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

function SportsInjuryIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="17" cy="4" r="2" />
      <path d="M15 7l-4 3-3-2-4 2" />
      <path d="M11 10l-2 5 4 4" />
      <path d="M14 13l3 2 4-2" />
    </svg>
  );
}

function PostSurgeryIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v20" />
      <path d="M9 5h6" />
      <path d="M8 9h8" />
      <path d="M7 13h10" />
      <path d="M8 17h8" />
      <path d="M9 21h6" />
    </svg>
  );
}

function ElderlyCareIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="5" r="2" />
      <path d="M9 7v6l3 3" />
      <path d="M6 11l3-1 3 2" />
      <path d="M8 17v4" />
      <path d="M15 11v10" strokeWidth="2.2" />
      <path d="M13 11h4" />
    </svg>
  );
}

function PostureIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v14" />
      <path d="M9 10c1.5-1 4.5-1 6 0" />
      <path d="M9 15c1.5 1 4.5 1 6 0" />
    </svg>
  );
}

// 6 Core Services data with fallback images
const PHYSIO_SERVICES = [
  {
    id: 'back-neck',
    title: 'Back & Neck Pain Therapy',
    desc: 'Relief from chronic and posture-related pain.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-back.jpg',
    icon: SpineIcon,
  },
  {
    id: 'joint-pain',
    title: 'Joint Pain Management',
    desc: 'Treatment for knee, shoulder and joint issues.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-joint.jpg',
    icon: KneeJointIcon,
  },
  {
    id: 'sports-injury',
    title: 'Sports Injury Rehabilitation',
    desc: 'Recover safely and return to active life.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-sports.jpg',
    icon: SportsInjuryIcon,
  },
  {
    id: 'post-surgery',
    title: 'Post-Surgery Rehabilitation',
    desc: 'Regain strength, mobility and independence.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-surgery.jpg',
    icon: PostSurgeryIcon,
  },
  {
    id: 'elderly-care',
    title: 'Elderly Care Physiotherapy',
    desc: 'Improve mobility, balance and daily living activities.',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-elderly.jpg',
    icon: ElderlyCareIcon,
  },
  {
    id: 'posture-correction',
    title: 'Posture Correction',
    desc: 'Fix poor posture and prevent future pain.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-posture.jpg',
    icon: PostureIcon,
  },
];

// 8 Conditions data
const CONDITIONS_LIST = [
  { id: 'c1', name: 'Back Pain', icon: SpineIcon },
  { id: 'c2', name: 'Neck Pain', icon: NeckIcon },
  { id: 'c3', name: 'Knee Pain', icon: KneeJointIcon },
  { id: 'c4', name: 'Shoulder Pain', icon: ShoulderIcon },
  { id: 'c5', name: 'Sports Injuries', icon: SportsInjuryIcon },
  { id: 'c6', name: 'Post-Surgery Recovery', icon: PostSurgeryIcon },
  { id: 'c7', name: 'Age-Related Mobility Issues', icon: ElderlyCareIcon },
  { id: 'c8', name: 'Posture Problems', icon: PostureIcon },
];

export default function PhysiotherapyPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Booking Form States
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Rahul Verma',
    mobileNumber: user?.contact || user?.phone || '9279125091',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '11:00 AM - 01:00 PM',
    selectedService: 'Back & Neck Pain Therapy',
  });

  useEffect(() => {
    if (user?.name && user.name !== 'Verified Patient') {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name,
        mobileNumber: user.contact || user.phone || prev.mobileNumber
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Smooth scroll helper to form
  const scrollToForm = (serviceTitle = null) => {
    if (serviceTitle) {
      setFormData(prev => ({ ...prev, selectedService: serviceTitle }));
    }
    const formElement = document.getElementById('physio-booking-form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Form Submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      addToast('Please enter your full name', 'error');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.replace(/\D/g, '').length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const apptId = `ZM-PHY-${Math.floor(10000 + Math.random() * 90000)}`;
      const newBooking = {
        id: apptId,
        bookingId: apptId,
        type: 'Physiotherapy',
        category: 'physiotherapy',
        title: 'Dr. Arindam Borah, MPT (Ortho)',
        doctor: 'Dr. Arindam Borah, MPT (Ortho)',
        doctorName: 'Dr. Arindam Borah, MPT (Ortho)',
        doctorSpecialty: formData.selectedService,
        specialty: formData.selectedService,
        doctorDegree: 'BPT, MPT, Certified Clinical Physiotherapist',
        doctorHospital: 'Zestmed Physiotherapy & Rehabilitation Center, Guwahati',
        hospital: 'Zestmed Physiotherapy & Rehabilitation Center, Guwahati',
        date: formData.preferredDate,
        time: formData.preferredTime,
        slot: `${formData.preferredDate}, ${formData.preferredTime}`,
        mode: 'Home & Clinic Session',
        fee: 850,
        price: 850,
        patientName: formData.fullName,
        patientPhone: formData.mobileNumber,
        phone: formData.mobileNumber,
        userId: user?.id || null,
        userEmail: user?.email || '',
        symptoms: `${formData.selectedService} - Specialized rehabilitation session`,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      };

      // Persist to localStorage so it syncs with Patient Dashboard
      try {
        const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
        localStorage.setItem('patient_appointments', JSON.stringify([newBooking, ...existing]));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

        // Save to Supabase PostgreSQL database
        bookPhysiotherapy(newBooking).catch((err) => console.warn('Supabase physio booking error:', err));
      } catch (err) {
        console.error('Failed to save booking to storage', err);
      }

      setConfirmedBooking(newBooking);
      addToast(`Physiotherapy session scheduled successfully! (ID: ${apptId})`, 'success');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER - Full-Width Edge to Edge (Exact Crisp Background & Cutout)  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-[#E2F4F8] min-h-[360px] sm:min-h-[390px] lg:min-h-[420px] xl:min-h-[450px] flex items-stretch">
        
        {/* Full-Width Background Image with Smooth, Subtle Ambient Light Aura */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/physio-hero-bg.jpg"
            alt="ZESTMED Physiotherapy Clinic Background"
            className="w-full h-full object-cover object-[right_bottom]"
          />
          {/* Smooth, subtle ambient blur effects matching medical theme without blurring the imagery */}
          <div className="absolute -top-24 left-[10%] w-[380px] h-[380px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-[15%] w-[420px] h-[420px] bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />
          {/* Subtle soft gradient on the left behind text for enhanced readability and natural visual depth */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[50%] lg:w-[44%] bg-gradient-to-r from-[#E2F4F8]/75 via-[#E2F4F8]/35 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-8 pt-8 sm:pt-10 lg:pt-6 pb-0">
          
          {/* Left Column: Heading, Subtitle & Action Buttons */}
          <div className="w-full lg:w-[480px] xl:w-[520px] 2xl:w-[560px] shrink-0 space-y-4 sm:space-y-4.5 self-center py-4 lg:py-8 z-20">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#E6F7F2] text-[#007A64] border border-[#BCE8DD] text-xs sm:text-sm font-extrabold shadow-2xs">
              <Activity className="w-4 h-4 text-[#007A64]" />
              <span>Physiotherapy & Rehabilitation</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-black text-[#0F172A] leading-[1.18] tracking-tight">
              Expert Physiotherapy<br />
              Care for a <span className="text-[#007A64]">Healthier,</span><br />
              <span className="text-[#007A64]">More Active Life</span>
            </h1>

            {/* Subheading text */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg">
              Personalized physiotherapy treatment for pain relief, injury recovery and overall mobility improvement.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToForm()}
                className="bg-[#007A64] hover:bg-[#006852] text-white font-black text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center gap-2.5 group cursor-pointer active:scale-95 min-h-[48px]"
              >
                <Calendar className="w-5 h-5" />
                <span>Book a Session</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => scrollToForm()}
                className="bg-white hover:bg-slate-50 text-[#0F172A] border-2 border-slate-300 font-black text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 min-h-[48px]"
              >
                <Stethoscope className="w-5 h-5 text-[#007A64]" />
                <span>Consult a Physiotherapist</span>
              </button>
            </div>
          </div>

          {/* Right Column: Transparent Cutout of Physiotherapist & Patient placed prominently on the right */}
          <div className="w-full lg:flex-1 flex justify-center lg:justify-center xl:justify-center items-end self-end pointer-events-none select-none z-20 -mb-[1px]">
            <img
              src="/physio-hero-therapist.png"
              alt="Physiotherapist treating patient"
              className="h-[280px] sm:h-[330px] md:h-[370px] lg:h-[400px] xl:h-[440px] 2xl:h-[470px] w-auto max-w-full object-contain object-bottom drop-shadow-md select-none"
            />
          </div>

          {/* Right spacer for 2xl / ultra-wide screens to keep clinic table and spine shelf visible on right */}
          <div className="hidden 2xl:block w-[140px] shrink-0 pointer-events-none" />

        </div>
      </section>

      {/* Main Container matching Zestmed Standard for remaining sections */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-5 sm:pt-6 pb-12 space-y-8 sm:space-y-10">

        {/* ========================================================================= */}
        {/* 2. FEATURE HIGHLIGHTS (4 Items Bar matching Reference Image)              */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs py-5 sm:py-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 first:pt-0 sm:first:pl-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <User className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">Certified Physiotherapists</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Experienced & qualified professionals</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <HomeIcon className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">Personalized Treatment Plans</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Care tailored to your needs</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <ShieldCheck className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">Pain Relief & Recovery</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Evidence-based therapy for faster healing</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <Activity className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">Better Mobility & Strength</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Improve movement, posture and daily life</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SERVICES (Left) + APPOINTMENT BOOKING FORM (Right)                     */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Our Physiotherapy Services (6 Cards in 3x2 Grid) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Our Physiotherapy Services
              </h2>
              <button
                type="button"
                onClick={() => scrollToForm()}
                className="text-[#007A64] hover:text-[#005c4b] font-extrabold text-sm sm:text-base flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* 6 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5 sm:gap-5">
              {PHYSIO_SERVICES.map((srv) => {
                const IconComp = srv.icon;
                const isSelected = formData.selectedService === srv.title;

                return (
                  <div
                    key={srv.id}
                    onClick={() => scrollToForm(srv.title)}
                    className={`bg-white rounded-2xl border p-4 sm:p-4.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group select-none ${
                      isSelected
                        ? 'border-[#007A64] ring-2 ring-[#007A64]/20'
                        : 'border-slate-200/90 hover:border-teal-200'
                    }`}
                  >
                    <div>
                      {/* Image Thumbnail with Floating Badge */}
                      <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={srv.image}
                          onError={(e) => { e.currentTarget.src = srv.fallback; }}
                          alt={srv.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Circular Icon Overlay */}
                        <div className="absolute bottom-2.5 left-2.5 w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-white text-[#007A64] shadow-md flex items-center justify-center border border-teal-100">
                          <IconComp className="w-5 sm:w-5.5 h-5 sm:h-5.5 text-[#007A64]" />
                        </div>
                      </div>

                      {/* Card Content */}
                      <h3 className="text-base sm:text-lg font-black text-[#0F172A] mt-3.5 group-hover:text-[#007A64] transition-colors leading-snug">
                        {srv.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                        {srv.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-black text-[#007A64]">
                      <span>Book Session</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Appointment Booking Form Card */}
          <div className="lg:col-span-4" id="physio-booking-form-card">
            <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-4.5 sticky top-24">
              
              {/* Form Title & Icon */}
              <div className="flex items-start gap-3.5 border-b border-slate-100 pb-3.5">
                <div className="shrink-0 flex items-center justify-center text-[#007A64] pt-0.5">
                  <Calendar className="w-7 h-7 text-[#007A64]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0F172A] leading-tight">
                    Book a Physiotherapy Session
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Schedule your session with our expert physiotherapist.
                  </p>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                
                {/* 1. Full Name */}
                <div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-sm font-semibold focus-within:border-[#007A64] focus-within:ring-1 focus-within:ring-[#007A64] transition">
                    <User className="w-4.5 h-4.5 text-[#007A64] shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-transparent outline-none text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-sm font-semibold focus-within:border-[#007A64] focus-within:ring-1 focus-within:ring-[#007A64] transition">
                    <Phone className="w-4.5 h-4.5 text-[#007A64] shrink-0" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Mobile Number"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full bg-transparent outline-none text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* 3. Preferred Date */}
                <div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-sm font-semibold focus-within:border-[#007A64] focus-within:ring-1 focus-within:ring-[#007A64] transition">
                    <Calendar className="w-4.5 h-4.5 text-[#007A64] shrink-0" />
                    <input
                      type="date"
                      required
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full bg-transparent outline-none text-slate-900 text-xs sm:text-sm font-medium cursor-pointer"
                    />
                  </div>
                </div>

                {/* 4. Preferred Time */}
                <div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-sm font-semibold focus-within:border-[#007A64] focus-within:ring-1 focus-within:ring-[#007A64] transition">
                    <Clock className="w-4.5 h-4.5 text-[#007A64] shrink-0" />
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full bg-transparent outline-none text-slate-900 text-xs sm:text-sm font-medium cursor-pointer"
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                      <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Midday)</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                      <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                {/* 5. Select Service */}
                <div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-sm font-semibold focus-within:border-[#007A64] focus-within:ring-1 focus-within:ring-[#007A64] transition">
                    <Activity className="w-4.5 h-4.5 text-[#007A64] shrink-0" />
                    <select
                      value={formData.selectedService}
                      onChange={(e) => setFormData({ ...formData, selectedService: e.target.value })}
                      className="w-full bg-transparent outline-none text-slate-900 text-xs sm:text-sm font-medium cursor-pointer"
                    >
                      {PHYSIO_SERVICES.map(s => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2.5 bg-[#007A64] hover:bg-[#006852] text-white font-black text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Scheduling Session...</span>
                  ) : (
                    <>
                      <span>Book Appointment</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-400 text-center mt-1">
                  Guwahati Certified Physiotherapists • Home & Clinic Visits
                </p>
              </form>

            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 4. WHY CHOOSE ZESTMED FOR PHYSIOTHERAPY? (5 Cards)                        */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Why Choose ZESTMED for Physiotherapy?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4.5">
            
            {/* 1. Expert & Certified Team */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <Award className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">Expert & Certified Team</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Trained and experienced physiotherapists</p>
              </div>
            </div>

            {/* 2. Personalized Care */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <FileText className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">Personalized Care</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Condition-specific treatment plans</p>
              </div>
            </div>

            {/* 3. Evidence-Based Approach */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <Target className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">Evidence-Based Approach</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Proven and safe therapy methods</p>
              </div>
            </div>

            {/* 4. Modern Equipment */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">Modern Equipment</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Advanced tools for effective rehabilitation</p>
              </div>
            </div>

            {/* 5. Holistic Recovery */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <Heart className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">Holistic Recovery</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">Pain relief, mobility & long-term wellness</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CONDITIONS WE TREAT (8 Cards in One Row)                              */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Conditions We Treat
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
            {CONDITIONS_LIST.map((cond) => {
              const IconComp = cond.icon;
              return (
                <div
                  key={cond.id}
                  onClick={() => scrollToForm(cond.name)}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-4.5 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-md hover:border-teal-300 hover:scale-102 transition-all cursor-pointer group min-h-[115px] sm:min-h-[125px] select-none"
                >
                  <div className="h-10 w-10 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <IconComp className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-[#007A64] transition-colors leading-tight">
                    {cond.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. OUR TREATMENT PROCESS (4 Steps matching Surgery Process Design)        */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Our Treatment Process
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 relative hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-2xs">
                  1
                </span>
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Assessment
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  Detailed evaluation of your condition
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 relative hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-2xs">
                  2
                </span>
                <Target className="w-7 h-7 sm:w-8 sm:h-8 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Personalized Plan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  A customized therapy plan for you
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 relative hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-2xs">
                  3
                </span>
                <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Therapy Sessions
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  Guided sessions with expert care
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 relative hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-2xs">
                  4
                </span>
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Progress &amp; Recovery
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">
                  Track improvement and get long-term support
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* 7. OUR IMPACT IN NUMBERS                                                  */}
        {/* ========================================================================= */}
        <section className="rounded-[28px] bg-white border border-slate-200/90 p-7 sm:p-9 lg:p-11 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Image: Physiotherapist helping elderly patient */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[420px] rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80"
                  onError={(e) => { e.currentTarget.src = '/physio-impact-raw.jpg'; }}
                  alt="Physiotherapy session with elderly patient"
                  className="w-full h-auto max-h-[260px] object-cover object-center select-none"
                />
              </div>
            </div>

            {/* Right: Heading & 4 Stats Counters */}
            <div className="lg:col-span-7 space-y-7">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
                Our Impact in Numbers
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                
                {/* Stat 1 */}
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                    <Users className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] leading-tight">5,000+</p>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold">Happy Patients</p>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                    <Calendar className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] leading-tight">15+</p>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold">Expert Physiotherapists</p>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                    <Activity className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] leading-tight">98%</p>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold">Recovery Rate</p>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                    <Star className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F172A] leading-tight">4.9/5</p>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold">Patient Satisfaction</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. RECOVERY CTA BANNER (Start Your Recovery Today!)                        */}
        {/* ========================================================================= */}
        <section className="rounded-[28px] bg-gradient-to-r from-[#006A57] via-[#007A64] to-[#008970] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-md flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Ambient background blur elements */}
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 top-0 w-48 h-48 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text */}
          <div className="relative z-10 space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-tight">
              Start Your Recovery Today!
            </h2>
            <p className="text-sm sm:text-base text-[#D1FAE5] font-medium leading-relaxed max-w-lg">
              Book a physiotherapy session with our expert team and get back to an active, pain-free life.
            </p>
          </div>

          {/* Right Action Button & Medical Clipboard Illustration */}
          <div className="relative z-10 flex items-center gap-6 shrink-0">
            
            <button
              type="button"
              onClick={() => scrollToForm()}
              className="bg-white hover:bg-slate-50 text-[#007A64] font-black text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Calendar className="w-5 h-5 text-[#007A64]" />
              <span>Book a Session Now</span>
              <ArrowRight className="w-5 h-5 text-[#007A64]" />
            </button>

            {/* Illustrated Medical Clipboard with Green Checkmarks & Red Heart with Pulse */}
            <div className="hidden sm:block w-24 h-24 relative select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none">
                {/* Clipboard Board */}
                <rect x="25" y="16" width="54" height="74" rx="8" fill="#FFFFFF" stroke="#D1FAE5" strokeWidth="2" />
                
                {/* Clipboard Top Clip */}
                <rect x="38" y="10" width="28" height="12" rx="4" fill="#005B4E" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="52" cy="14" r="2.5" fill="#FFFFFF" />
                
                {/* Green Checkmarks on Document */}
                <path d="M36 34 L40 38 L48 30" stroke="#007A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="52" y1="34" x2="70" y2="34" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                
                <path d="M36 48 L40 52 L48 44" stroke="#007A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="52" y1="48" x2="70" y2="48" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                
                <path d="M36 62 L40 66 L48 58" stroke="#007A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="52" y1="62" x2="70" y2="62" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Red Heart with ECG line on bottom-right of clipboard */}
                <g transform="translate(62, 58) scale(0.9)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
                  <path d="M6 10 h3 l2 -3 l3 6 l2 -3 h3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              </svg>
            </div>

          </div>

        </section>

      </div>

      {/* ========================================================================= */}
      {/* 9. CONFIRMATION MODAL                                                     */}
      {/* ========================================================================= */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 flex items-center justify-center text-[#16A34A]">
                  <CheckCircle2 className="w-7 h-7 text-[#16A34A]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F172A]">Physiotherapy Session Confirmed!</h3>
                  <p className="text-xs text-slate-500">Booking ID: <span className="font-mono font-bold text-[#0F172A]">{confirmedBooking.id}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Service</span>
                <span className="font-bold text-[#007A64]">{confirmedBooking.doctorSpecialty}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Date & Slot</span>
                <span className="font-bold text-slate-900">{confirmedBooking.date} • {confirmedBooking.time}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Patient</span>
                <span className="font-bold text-slate-900">{confirmedBooking.patientName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Mobile Number</span>
                <span className="font-bold text-slate-900">{confirmedBooking.patientPhone}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm font-extrabold text-[#0F172A]">
                <span>Session Fee</span>
                <span className="text-[#007A64]">₹{confirmedBooking.fee} (Pay post session)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null);
                  navigate('/patient-dashboard');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                View in Patient Dashboard
              </button>
              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white text-xs font-bold transition shadow-xs"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
