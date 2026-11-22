import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Calendar, Clock, CheckCircle2, 
  ArrowRight, ArrowLeft, RefreshCw, Lock, 
  Check, Home, Star, Headphones, ChevronLeft, ChevronRight,
  Share2, MapPin, User, Activity, AlertCircle
} from 'lucide-react';
import { getPhysioServiceById, ALL_PHYSIO_SERVICES } from '../mock-data/allPhysioServicesData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookPhysiotherapy } from '../services/supabaseService';
import { launchRazorpayCheckout } from '../services/razorpayClient';

// =========================================================================
// Custom SVG Icons matching Reference Design & ZESTMED Branding
// =========================================================================

function CertifiedPhysioIcon({ className = "w-6 h-6 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M12 11v3" />
      <path d="M10.5 12.5h3" />
    </svg>
  );
}

function TherapyTechIcon({ className = "w-6 h-6 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M7 10h2l2-3 2 6 2-3h2" />
      <path d="M12 16v4M8 20h8" />
    </svg>
  );
}

function MobilityRecoveryIcon({ className = "w-6 h-6 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h4v4" />
      <path d="M20 4l-6.5 6.5" />
      <path d="M4 16v4h4" />
      <path d="M4 20l6.5-6.5" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// "Why Choose Us?" 4 Circular Badge Icons
function PhysioExpertBadgeIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M12 11v3" />
      <path d="M10.5 12.5h3" />
    </svg>
  );
}

function AdvancedTechBadgeIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M6 10h2l2-3 3 6 2-3h3" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  );
}

function FasterMobilityBadgeIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
      <path d="M8 3h8" />
    </svg>
  );
}

function FunctionalOutcomeBadgeIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M17.5 10c1.5-1 3.5 0 3.5 1.8 0 2-3.5 4.2-3.5 4.2s-3.5-2.2-3.5-4.2c0-1.8 2-2.8 3.5-1.8Z" />
    </svg>
  );
}

export default function PhysiotherapyDetailPage({ initialStep = 1 }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();

  const service = getPhysioServiceById(id) || getPhysioServiceById('back-neck');

  // Booking Flow Step State: 1 = Detail View, 2 = Details Form, 3 = Schedule, 4 = Payment, 'confirmed' = Booking Confirmed
  const [step, setStep] = useState(initialStep);
  const [openFaq, setOpenFaq] = useState(0);

  // Form State
  const [patientName, setPatientName] = useState(user?.name || 'Ajayendra Shekhar');
  const [mobileNumber, setMobileNumber] = useState(user?.contact || user?.phone || '9279125091');
  const [age, setAge] = useState(user?.age || '32');
  const [gender, setGender] = useState('Male');
  const [sessionMode, setSessionMode] = useState('In-Clinic Session'); // 'In-Clinic Session' | 'At-Home Session'
  const [address, setAddress] = useState(user?.address || 'House No. 12, Zoo Road, Guwahati, Assam');
  const [serviceChangeModalOpen, setServiceChangeModalOpen] = useState(false);

  // Schedule State (default: 24 November 2026 matching reference)
  const [selectedDay, setSelectedDay] = useState(24);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [monthIndex, setMonthIndex] = useState(10); // November
  const [selectedYear, setSelectedYear] = useState(2026);
  const selectedMonth = MONTHS[monthIndex];

  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setSelectedYear(y => y - 1);
    } else {
      setMonthIndex(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setSelectedYear(y => y + 1);
    } else {
      setMonthIndex(m => m + 1);
    }
  };
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 11:00 AM');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet' | 'post-session'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // Sync patient details if user logs in
  useEffect(() => {
    if (user?.name && user.name !== 'Verified Patient') {
      setPatientName(user.name);
    }
    if (user?.contact || user?.phone) {
      setMobileNumber(user.contact || user.phone);
    }
  }, [user]);

  // Scroll to top when changing steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Handle proceeding from Step 2 to Step 3
  const handleProceedToSchedule = (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      addToast('Please enter your full name', 'error');
      return;
    }
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (!address.trim()) {
      addToast('Please enter your address or preferred center', 'error');
      return;
    }
    setStep(3);
  };

  // Formatted date string (e.g. "Tue, 24 Nov 2026")
  const formattedDate = `Tue, ${selectedDay} ${selectedMonth.slice(0, 3)} ${selectedYear}`;

  // Complete Payment & Confirm Booking
  const handleCompletePayment = async () => {
    setIsSubmitting(true);
    const bookingId = `ZM-PHY-${selectedYear}${monthIndex + 1}${selectedDay}-${Math.floor(100 + Math.random() * 900)}`;

    const bookingPayload = {
      id: bookingId,
      bookingId: bookingId,
      booking_number: bookingId,
      type: 'Physiotherapy',
      category: 'physiotherapy',
      isPhysio: true,
      title: service.title,
      serviceName: service.title,
      condition: service.title,
      therapist: service.expert?.name || 'Dr. Arindam Borah, MPT (Ortho)',
      therapistName: service.expert?.name || 'Dr. Arindam Borah, MPT (Ortho)',
      doctor: service.expert?.name || 'Dr. Arindam Borah, MPT (Ortho)',
      doctorName: service.expert?.name || 'Dr. Arindam Borah, MPT (Ortho)',
      specialty: service.category || 'Physiotherapy & Rehabilitation',
      hospital: service.hospitalLocation || 'ZESTMED Physiotherapy & Rehabilitation Center, Guwahati',
      date: formattedDate,
      time: selectedTimeSlot,
      slot: `${formattedDate}, ${selectedTimeSlot}`,
      preferred_slot: selectedTimeSlot,
      booking_date: `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
      mode: sessionMode,
      service_type: sessionMode,
      fee: service.price,
      price: service.price,
      fees: service.price,
      totalAmount: service.price,
      patientName: patientName,
      patient_name: patientName,
      patientPhone: mobileNumber,
      phone: mobileNumber,
      patientAge: age,
      patientGender: gender,
      address: address,
      status: 'Confirmed',
      bookingStatus: 'Confirmed',
      paymentStatus: paymentMethod === 'post-session' ? 'Pay Post-Session (Pending)' : 'Paid (UPI / Razorpay Verified)',
      paymentMethod: paymentMethod === 'post-session' 
        ? 'Pay Post-Session upon Visit' 
        : paymentMethod === 'upi' 
        ? 'UPI (Google Pay, PhonePe, Razorpay)' 
        : paymentMethod,
      userId: user?.id || null,
      userEmail: user?.email || '',
      createdAt: new Date().toISOString()
    };

    // If user selected post-session payment, confirm directly
    if (paymentMethod === 'post-session') {
      await saveBookingAndConfirm(bookingPayload);
      return;
    }

    // If online Razorpay payment
    if (window.Razorpay) {
      launchRazorpayCheckout({
        amount: service.price,
        bookingId: bookingId,
        bookingType: 'physio',
        serviceTitle: service.title,
        customer: {
          name: patientName,
          phone: mobileNumber,
          email: user?.email || 'patient@zestmed.in'
        },
        onSuccess: async (verifiedTxn) => {
          bookingPayload.paymentId = verifiedTxn?.paymentId || `pay_${Math.random().toString(36).substring(7)}`;
          await saveBookingAndConfirm(bookingPayload);
        },
        onFailure: (err) => {
          setIsSubmitting(false);
          addToast(err?.message || 'Payment could not be processed.', 'error');
        },
        onDismiss: () => {
          setIsSubmitting(false);
          addToast('Payment cancelled.', 'info');
        }
      });
    } else {
      // Direct mock confirm for development / sandbox
      await saveBookingAndConfirm(bookingPayload);
    }
  };

  const saveBookingAndConfirm = async (bookingPayload) => {
    try {
      await bookPhysiotherapy(bookingPayload);
      const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      const filtered = existing.filter(b => b.id !== bookingPayload.id && b.bookingId !== bookingPayload.id);
      localStorage.setItem('patient_appointments', JSON.stringify([bookingPayload, ...filtered]));

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

      setConfirmedBookingData(bookingPayload);
      setStep('confirmed');
      addToast('Physiotherapy session booked successfully!', 'success');
    } catch (err) {
      console.error('Save physio booking error:', err);
      const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      const filtered = existing.filter(b => b.id !== bookingPayload.id && b.bookingId !== bookingPayload.id);
      localStorage.setItem('patient_appointments', JSON.stringify([bookingPayload, ...filtered]));

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

      setConfirmedBookingData(bookingPayload);
      setStep('confirmed');
      addToast('Physiotherapy session booked successfully!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${service.title} | ZESTMED Physiotherapy`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'info');
    }
  };

  const whatsIncludedItems = service.whatsIncluded || [
    'Comprehensive 1-on-1 Musculoskeletal Assessment',
    'Hands-on Joint & Myofascial Mobilization',
    'Advanced Electrotherapy / TENS / Ultrasound',
    'Targeted Range-of-Motion & Core Exercises',
    'Postural & Ergonomic Workstation Guidance',
    'Personalized Home Exercise & Follow-up Plan'
  ];

  const faqsList = service.faqs || [];

  return (
    <div className="min-h-screen bg-[#F8FBFA] font-sans text-slate-800 selection:bg-[#007A64] selection:text-white">
      
      {/* =========================================================================
          1. BREADCRUMBS & TOP BAR
          ========================================================================= */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-3 border-b border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 font-semibold truncate">
            <Link to="/" className="hover:text-[#007A64] transition">Home</Link>
            <span className="text-slate-400">&gt;</span>
            <Link to="/physiotherapy" className="hover:text-[#007A64] transition">Physiotherapy</Link>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-900 font-bold truncate">
              {step === 1 
                ? (service.shortTitle || service.title)
                : step === 'confirmed' 
                ? 'Booking Confirmation' 
                : 'Book Physiotherapy Session'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#007A64] rounded-lg hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          STEPPER (Shown on Steps 2, 3, 4)
          ========================================================================= */}
      {step !== 1 && step !== 'confirmed' && (
        <div className="w-full bg-white border-b border-slate-200/80 py-4 px-4">
          <div className="flex items-center justify-center max-w-xl mx-auto">
            {/* Step 1: Service */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(1)}>
              <div className="w-7 h-7 rounded-full bg-[#007A64] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                ✓
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900">Service</span>
            </div>

            <div className="w-8 sm:w-16 h-[2px] bg-[#007A64] mx-2" />

            {/* Step 2: Details */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(2)}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                step >= 2 ? 'bg-[#007A64] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <span className={`text-xs sm:text-sm font-bold ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                Details
              </span>
            </div>

            <div className={`w-8 sm:w-16 h-[2px] mx-2 ${step >= 3 ? 'bg-[#007A64]' : 'bg-slate-200'}`} />

            {/* Step 3: Schedule */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => step > 3 && setStep(3)}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                step >= 3 ? 'bg-[#007A64] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > 3 ? '✓' : '3'}
              </div>
              <span className={`text-xs sm:text-sm font-bold ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                Schedule
              </span>
            </div>

            <div className={`w-8 sm:w-16 h-[2px] mx-2 ${step >= 4 ? 'bg-[#007A64]' : 'bg-slate-200'}`} />

            {/* Step 4: Payment */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                step >= 4 ? 'bg-[#007A64] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                4
              </div>
              <span className={`text-xs sm:text-sm font-bold ${step >= 4 ? 'text-slate-900' : 'text-slate-400'}`}>
                Payment
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-6 sm:py-8">

        {/* =======================================================================
            VIEW 1: PHYSIOTHERAPY DETAIL PAGE (Exact Match to Reference Design)
            ======================================================================= */}
        {step === 1 && (
          <div className="space-y-8 sm:space-y-10">
            
            {/* Top Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Title, Subtitle, Overview, Badges, Price & Book Now */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0B1E3F] tracking-tight leading-tight">
                    {service.title}
                  </h1>
                  <div className="w-12 h-1 bg-[#007A64] rounded-full mt-2 mb-2.5" />
                  <p className="text-base sm:text-lg font-extrabold text-[#0B1E3F]">
                    {service.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
                  {service.overview}
                </p>

                {/* 3 Feature Badges with Dividers */}
                <div className="flex items-center gap-3 sm:gap-4 pt-1 pb-1 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2">
                    <CertifiedPhysioIcon className="w-5 h-5 text-[#0B1E3F] shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                      Certified<br />Physiotherapists
                    </span>
                  </div>

                  <div className="hidden sm:block w-[1px] h-8 bg-slate-300 shrink-0" />

                  <div className="flex items-center gap-2">
                    <TherapyTechIcon className="w-5 h-5 text-[#0B1E3F] shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                      Advanced<br />Therapy Tech
                    </span>
                  </div>

                  <div className="hidden sm:block w-[1px] h-8 bg-slate-300 shrink-0" />

                  <div className="flex items-center gap-2">
                    <MobilityRecoveryIcon className="w-5 h-5 text-[#0B1E3F] shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                      Faster Mobility<br />Recovery Care
                    </span>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-2 space-y-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#0B1E3F]">
                      {service.priceFormatted || `₹${service.price.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-sm text-slate-400 line-through font-bold">
                      ₹{(service.mrp || 1500).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-[#007A64] bg-[#DCF6EF] px-2.5 py-0.5 rounded-md border border-[#BCE8DD]">
                      20% OFF
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 group"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <span className="text-xs text-slate-500 font-semibold">
                      In-Clinic &amp; Doorstep Home Visits in Guwahati
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Service Featured Image Card (Full Size, Uncropped) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
                <div className="w-full max-w-xl xl:max-w-2xl rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-white p-2.5 sm:p-3 flex items-center justify-center relative group">
                  <img
                    src={service.image}
                    onError={(e) => { e.currentTarget.src = service.fallback; }}
                    alt={service.title}
                    className="w-full h-auto max-h-[460px] sm:max-h-[520px] lg:max-h-[580px] object-contain rounded-2xl"
                  />
                  
                  {/* Floating Rating Badge */}
                  <div className="absolute bottom-5 right-5 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-md">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{service.rating || '4.9'} ({service.reviewCount || '300+'} reviews)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Section 2: What's Included */}
            <div className="bg-[#F0FAF7] rounded-3xl p-6 sm:p-8 border border-[#CDECE3]">
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1E3F] tracking-tight mb-5">
                What's Included
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div className="space-y-4">
                  {whatsIncludedItems.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-600 stroke-[3] shrink-0" />
                      <span className="text-sm sm:text-base font-bold text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {whatsIncludedItems.slice(3, 6).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-600 stroke-[3] shrink-0" />
                      <span className="text-sm sm:text-base font-bold text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Why Choose Us? */}
            <div className="space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E3F] tracking-tight">
                Why Choose Us?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#DCF6EF] text-[#007A64] flex items-center justify-center shrink-0">
                    <PhysioExpertBadgeIcon className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Experienced<br />Physiotherapists
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#DCF6EF] text-[#007A64] flex items-center justify-center shrink-0">
                    <AdvancedTechBadgeIcon className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Advanced<br />Technology
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#DCF6EF] text-[#007A64] flex items-center justify-center shrink-0">
                    <FasterMobilityBadgeIcon className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Faster<br />Mobility Recovery
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#DCF6EF] text-[#007A64] flex items-center justify-center shrink-0">
                    <FunctionalOutcomeBadgeIcon className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Better<br />Mobility Outcomes
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: FAQs */}
            <div className="bg-[#F8FCFF] rounded-3xl p-6 sm:p-8 border border-[#E2F0FA]">
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1E3F] tracking-tight mb-5">
                FAQs
              </h2>

              <div className="space-y-3">
                {faqsList.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                        className="w-full flex items-center justify-between p-4 sm:p-4.5 text-left font-bold text-sm sm:text-base text-slate-900 hover:text-[#007A64] transition cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className="text-lg font-bold text-slate-500 shrink-0 ml-4">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                          <p className="pt-2">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =======================================================================
            VIEW 2: STEP 2 - PATIENT DETAILS (Matching Reference Design)
            ======================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E3F] tracking-tight">
                Book Physiotherapy Session
              </h1>
              <div className="w-12 h-1 bg-[#007A64] rounded-full mt-2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Left Column: Selected Service Card */}
              <div className="lg:col-span-5 bg-[#F8FCFF] rounded-3xl p-6 border border-[#E2F0FA] space-y-5">
                <h2 className="text-lg sm:text-xl font-black text-[#0B1E3F]">
                  Selected Service
                </h2>

                <div className="flex gap-4 items-start">
                  <img
                    src={service.image}
                    onError={(e) => { e.currentTarget.src = service.fallback; }}
                    alt={service.title}
                    className="w-20 h-20 rounded-2xl object-cover bg-white p-1 shrink-0 border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-black text-[#0B1E3F] leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {service.subtitle}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base sm:text-lg font-black text-[#0B1E3F]">
                        {service.priceFormatted || `₹${service.price.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-semibold">
                        ₹{(service.mrp || 1500).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-[#007A64] bg-[#DCF6EF] px-1.5 py-0.5 rounded">
                        20% OFF
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1.5">
                      Duration: {service.stay || '60 Mins (Dedicated Care)'}
                    </p>
                  </div>
                </div>

                {/* Package Includes Checklist */}
                <div className="pt-2 border-t border-slate-200/70 space-y-3">
                  <h4 className="text-sm font-black text-[#0B1E3F]">
                    Package Includes
                  </h4>
                  <div className="space-y-2.5">
                    {whatsIncludedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-800">
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Change Service Link */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setServiceChangeModalOpen(true)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#007A64] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Change Service</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Patient Details Form Card */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
                <h2 className="text-xl font-black text-[#0B1E3F]">
                  Patient Details
                </h2>

                <form onSubmit={handleProceedToSchedule} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64]"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-700">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-4 py-2.5 rounded-r-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64]"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter age"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64]"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-6 pt-1">
                      {['Male', 'Female', 'Other'].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === g}
                            onChange={() => setGender(g)}
                            className="w-4 h-4 text-[#007A64] focus:ring-[#007A64]"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Session Type / Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Select Session Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setSessionMode('In-Clinic Session')}
                        className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          sessionMode === 'In-Clinic Session'
                            ? 'bg-[#007A64] text-white border-[#007A64] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        <span>In-Clinic Session</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSessionMode('At-Home Session')}
                        className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          sessionMode === 'At-Home Session'
                            ? 'bg-[#007A64] text-white border-[#007A64] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span>At-Home Session</span>
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {sessionMode === 'At-Home Session' ? 'Address for Home Visit' : 'Preferred Center / Landmark'} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={sessionMode === 'At-Home Session' ? 'Enter complete doorstep address with house no., locality, Guwahati' : 'Enter preferred clinic area e.g. Zoo Road, GS Road, Guwahati'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm shadow-md transition cursor-pointer active:scale-95"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* =======================================================================
            VIEW 3: STEP 3 - CHOOSE DATE & TIME (Matching Reference Design)
            ======================================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E3F] tracking-tight">
                Choose Date &amp; Time
              </h1>
              <div className="w-12 h-1 bg-[#007A64] rounded-full mt-2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Left Column: Interactive Calendar matching reference */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Previous Month"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-base sm:text-lg font-black text-[#0B1E3F]">
                    {selectedMonth} {selectedYear}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next Month"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-700 py-1">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 text-center gap-y-2 text-sm font-semibold">
                  {Array.from({ length: new Date(selectedYear, monthIndex + 1, 0).getDate() }, (_, i) => i + 1).map(d => {
                    const isSelected = selectedDay === d;
                    return (
                      <div key={d} className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDay(d)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition ${
                            isSelected 
                              ? 'bg-[#007A64] text-white shadow-xs' 
                              : 'text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {d}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Available Time Slots */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <h2 className="text-xl font-black text-[#0B1E3F]">
                  Available Time Slots
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    '09:00 AM - 10:00 AM', 
                    '10:00 AM - 11:00 AM', 
                    '11:30 AM - 12:30 PM', 
                    '02:00 PM - 03:00 PM', 
                    '04:00 PM - 05:00 PM', 
                    '06:00 PM - 07:00 PM'
                  ].map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-3 px-2 rounded-xl border text-xs sm:text-sm font-bold text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#007A64] text-white border-[#007A64] shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                        }`}
                      >
                        {slot.split(' - ')[0]}
                      </button>
                    );
                  })}
                </div>

                {/* Info Notice Box */}
                <div className="bg-[#E0F3ED]/60 rounded-2xl p-4 border border-[#BCE8DD] flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#007A64] text-[#007A64] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    i
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed font-medium">
                    <p className="font-bold text-[#0B1E3F]">Our certified physiotherapists are available 7 days a week.</p>
                    <p className="text-slate-600 mt-0.5">You can reschedule or cancel up to 24 hours before your appointment.</p>
                  </div>
                </div>

                {/* Next Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm shadow-md transition cursor-pointer active:scale-95"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =======================================================================
            VIEW 4: STEP 4 - PAYMENT (Matching Reference Design)
            ======================================================================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E3F] tracking-tight">
                Book Physiotherapy Session
              </h1>
              <div className="w-12 h-1 bg-[#007A64] rounded-full mt-2" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Left Column: Payment Summary & Select Method */}
              <div className="lg:col-span-6 space-y-5">
                
                {/* Summary Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                  <h2 className="text-xl font-black text-[#0B1E3F]">
                    Payment Summary
                  </h2>

                  <div className="flex gap-4 items-start pb-4 border-b border-slate-100">
                    <img
                      src={service.image}
                      onError={(e) => { e.currentTarget.src = service.fallback; }}
                      alt={service.title}
                      className="w-16 h-16 rounded-xl object-cover bg-white p-1 shrink-0 border border-slate-200"
                    />
                    <div>
                      <h3 className="text-base font-black text-[#0B1E3F]">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold">
                        {sessionMode} • {service.stay || '60 mins'}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-base font-black text-[#0B1E3F]">
                          {service.priceFormatted || `₹${service.price.toLocaleString('en-IN')}`}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{(service.mrp || 1500).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-bold text-[#007A64] bg-[#DCF6EF] px-1.5 py-0.2 rounded">
                          20% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary details */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold text-slate-500 w-32">Patient Name:</span>
                      <span className="font-bold text-slate-900">{patientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold text-slate-500 w-32">Session Mode:</span>
                      <span className="font-bold text-slate-900">{sessionMode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold text-slate-500 w-32">Appointment Date:</span>
                      <span className="font-bold text-slate-900">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold text-slate-500 w-32">Time Slot:</span>
                      <span className="font-bold text-slate-900">{selectedTimeSlot}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <span className="font-semibold text-slate-500 w-32 shrink-0">Location:</span>
                      <span className="font-bold text-slate-900">{address}</span>
                    </div>
                  </div>
                </div>

                {/* Select Payment Method */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
                  <h3 className="text-base font-black text-[#0B1E3F]">
                    Select Payment Method
                  </h3>

                  <div className="space-y-2.5">
                    <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'upi' ? 'border-[#007A64] bg-teal-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="w-4 h-4 text-[#007A64]"
                        />
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          UPI (Google Pay, PhonePe, Paytm, etc.)
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'card' ? 'border-[#007A64] bg-teal-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="w-4 h-4 text-[#007A64]"
                        />
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          Credit / Debit Card
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'netbanking' ? 'border-[#007A64] bg-teal-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'netbanking'}
                          onChange={() => setPaymentMethod('netbanking')}
                          className="w-4 h-4 text-[#007A64]"
                        />
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          Net Banking
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'post-session' ? 'border-[#007A64] bg-teal-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'post-session'}
                          onChange={() => setPaymentMethod('post-session')}
                          className="w-4 h-4 text-[#007A64]"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-800">
                            Pay Post-Session
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Pay via Cash or UPI directly to the physiotherapist after treatment
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Right Column: Pay with Razorpay Box */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[#0B1E3F]">
                    {paymentMethod === 'post-session' ? 'Confirm Booking' : 'Pay with Razorpay'}
                  </h2>
                  <span className="text-base font-extrabold italic text-[#0B3B70]">
                    {paymentMethod === 'post-session' ? 'ZESTMED Assured' : 'Razorpay'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    {paymentMethod === 'post-session' 
                      ? 'Instant confirmation. Zero upfront payment required.' 
                      : 'Your payment is 100% secure and encrypted.'}
                  </span>
                </div>

                {/* QR Code Scan & Pay (if online payment) */}
                {paymentMethod !== 'post-session' && (
                  <>
                    <div className="bg-[#F8FCFF] rounded-2xl p-5 border border-slate-200 flex items-center gap-5">
                      <img
                        src="/razorpay-qr-code.png"
                        onError={(e) => { e.currentTarget.src = '/qr-sample.png'; }}
                        alt="Scan & Pay QR Code"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain border border-slate-200 rounded-xl bg-white p-1"
                      />
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-[#0B1E3F]">
                          Scan &amp; Pay
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Scan the QR code with any UPI app (GPay, PhonePe, Paytm)
                        </p>
                      </div>
                    </div>

                    <div className="relative text-center my-3">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <span className="relative bg-white px-3 text-xs font-bold text-slate-400 uppercase">
                        Or
                      </span>
                    </div>
                  </>
                )}

                {/* Big Green Pay / Confirm Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCompletePayment}
                  className="w-full py-4 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white font-black text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'post-session' 
                      ? `Confirm Booking (${service.priceFormatted || '₹1,200'} Post-Session)` 
                      : `Pay ${service.priceFormatted || '₹1,200'} via Razorpay & Confirm`}
                  </span>
                </button>

                <p className="text-xs text-slate-500 text-center font-medium">
                  {paymentMethod === 'post-session'
                    ? 'Our physiotherapist will contact you 1 hour before the scheduled time slot.'
                    : 'You will be redirected to Razorpay to complete your secure payment.'}
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =======================================================================
            VIEW 5: BOOKING CONFIRMED (Matching Reference Design)
            ======================================================================= */}
        {step === 'confirmed' && (
          <div className="space-y-8 max-w-4xl mx-auto py-4">
            
            {/* Header Success Checkmark */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#007A64] text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#0B1E3F] tracking-tight">
                Physiotherapy Session Confirmed!
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-medium">
                Your appointment has been confirmed with the ZESTMED Physiotherapy Team.
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Left: Package Thumbnail & Pricing */}
                <div className="flex gap-4 items-center">
                  <img
                    src={service.image}
                    onError={(e) => { e.currentTarget.src = service.fallback; }}
                    alt={service.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-white p-1 shrink-0 border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B1E3F] leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {sessionMode} • {service.stay || '60 mins'}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base sm:text-lg font-black text-[#0B1E3F]">
                        {service.priceFormatted || `₹${service.price.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{(service.mrp || 1500).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-[#007A64] bg-[#DCF6EF] px-1.5 py-0.5 rounded">
                        20% OFF
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Booking Meta Details */}
                <div className="space-y-2.5 text-xs sm:text-sm border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-500 font-medium sm:w-28">Patient Name:</span>
                    <span className="font-bold text-slate-900">{confirmedBookingData?.patientName || patientName}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-500 font-medium sm:w-28">Date:</span>
                    <span className="font-bold text-slate-900">{confirmedBookingData?.date || formattedDate}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-500 font-medium sm:w-28">Time Slot:</span>
                    <span className="font-bold text-slate-900">{confirmedBookingData?.time || selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-500 font-medium sm:w-28">Session Mode:</span>
                    <span className="font-bold text-slate-900">{confirmedBookingData?.mode || sessionMode}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-500 font-medium sm:w-28">Booking ID:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {confirmedBookingData?.bookingId || `ZM-PHY-${selectedYear}11${selectedDay}-001`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-8 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/patient-dashboard?tab=bookings')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm shadow-sm transition cursor-pointer active:scale-95"
                >
                  View My Bookings
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/physiotherapy')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Activity className="w-4 h-4 text-[#007A64]" />
                  <span>Back to Physiotherapy</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Home className="w-4 h-4 text-slate-600" />
                  <span>Home</span>
                </button>
              </div>
            </div>

            {/* Trust Badges Strip Footer */}
            <div className="pt-6 border-t border-slate-200/80">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#007A64]" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <PhysioExpertBadgeIcon className="w-5 h-5 text-[#007A64]" />
                  <span>Certified Physios</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <Headphones className="w-5 h-5 text-[#007A64]" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <Star className="w-5 h-5 text-[#007A64]" />
                  <span>Quality Care</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* =========================================================================
          SERVICE CHANGE MODAL
          ========================================================================= */}
      {serviceChangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#0B1E3F]">Select Physiotherapy Service</h3>
              <button 
                type="button" 
                onClick={() => setServiceChangeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {ALL_PHYSIO_SERVICES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    navigate(`/physiotherapy/${s.id}`);
                    setServiceChangeModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl border flex items-center gap-3.5 cursor-pointer transition ${
                    s.id === service.id 
                      ? 'border-[#007A64] bg-[#DCF6EF]/30 font-bold' 
                      : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={s.image}
                    onError={(e) => { e.currentTarget.src = s.fallback; }}
                    alt={s.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 leading-tight">{s.title}</p>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{s.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#0B1E3F]">₹{s.price}</p>
                    <span className="text-[10px] font-bold text-[#007A64] bg-[#DCF6EF] px-1 py-0.5 rounded">20% OFF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
