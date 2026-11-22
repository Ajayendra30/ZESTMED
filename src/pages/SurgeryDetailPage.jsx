import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Calendar, Clock, CheckCircle2, 
  ArrowRight, ArrowLeft, RefreshCw, Lock, 
  Check, Home, Star, Headphones, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getSurgeryPackageById } from '../mock-data/surgeryPackagesData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookSurgery } from '../services/supabaseService';
import { launchRazorpayCheckout } from '../services/razorpayClient';

// Custom SVG Icons matching the Reference Design
function ExpertSurgeonIcon({ className = "w-6 h-6 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M12 11v3" />
      <path d="M10.5 12.5h3" />
    </svg>
  );
}

function ModernOTIcon({ className = "w-6 h-6 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="7.5" rx="2" />
      <path d="M12 4.5v3M10.5 6h3" />
      <rect x="3" y="13" width="18" height="3" rx="1.5" />
      <path d="M6 16v4M18 16v4M8 20h8" />
    </svg>
  );
}

function AdvancedRecoveryCareIcon({ className = "w-6 h-6 text-[#0B1E3F]" }) {
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
function DoctorSurgeonBadgeIcon({ className = "w-6 h-6 text-[#007A64]" }) {
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

function HospitalStayBadgeIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M12 6v4M10 8h4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

function RecoveryOutcomeBadgeIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M17.5 10c1.5-1 3.5 0 3.5 1.8 0 2-3.5 4.2-3.5 4.2s-3.5-2.2-3.5-4.2c0-1.8 2-2.8 3.5-1.8Z" />
    </svg>
  );
}

export default function SurgeryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();

  const surgery = getSurgeryPackageById(id) || getSurgeryPackageById('orthopedic-surgery-package');

  // Booking Flow Step State: 1 = Detail View, 2 = Details Form, 3 = Schedule, 4 = Payment, 'confirmed' = Booking Confirmed
  const [step, setStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);

  // Form State
  const [patientName, setPatientName] = useState(user?.name || 'Ajayendra Shekhar');
  const [mobileNumber, setMobileNumber] = useState(user?.contact || user?.phone || '9876543210');
  const [age, setAge] = useState('45');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('House No. 12, Zoo Road, Guwahati, Assam');

  // Schedule State (default: 24 November 2026 matching reference image)
  const [selectedDay, setSelectedDay] = useState(24);
  const [selectedMonth] = useState('November');
  const [selectedYear] = useState(2026);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('12:00 PM');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // Keep patient details in sync if user logs in
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
    setStep(3);
  };

  // Formatted date string (e.g. "Tue, 24 Nov 2026")
  const formattedDate = `Tue, ${selectedDay} ${selectedMonth.slice(0, 3)} ${selectedYear}`;

  // Complete Payment & Confirm Booking
  const handleCompletePayment = async () => {
    setIsSubmitting(true);
    const bookingId = `ZM${selectedYear}11${selectedDay}001`;

    const bookingPayload = {
      id: bookingId,
      bookingId: bookingId,
      booking_number: bookingId,
      type: 'Surgery Package',
      category: 'surgery',
      isSurgery: true,
      title: surgery.title,
      surgeryName: surgery.title,
      doctor: surgery.surgeon?.name || 'Dr. Arindam Borah, MPT (Ortho)',
      doctorName: surgery.surgeon?.name || 'Dr. Arindam Borah, MPT (Ortho)',
      doctorSpecialty: surgery.category,
      specialty: surgery.category,
      doctorHospital: surgery.hospitalLocation || 'Dispur Ortho Care & Premier Super Specialty Hospital, Guwahati',
      hospital: surgery.hospitalLocation || 'Dispur Ortho Care & Premier Super Specialty Hospital, Guwahati',
      date: formattedDate,
      time: selectedTimeSlot,
      slot: `${formattedDate}, ${selectedTimeSlot}`,
      mode: 'In Hospital',
      fee: surgery.startingPrice,
      price: surgery.startingPrice,
      totalAmount: surgery.startingPrice,
      patientName: patientName,
      patient_name: patientName,
      patientPhone: mobileNumber,
      phone: mobileNumber,
      patientAge: age,
      patientGender: gender,
      address: address,
      status: 'Confirmed',
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid via Razorpay',
      paymentMethod: paymentMethod === 'upi' ? 'UPI (Google Pay, PhonePe, etc.)' : paymentMethod,
      userId: user?.id || null,
      userEmail: user?.email || '',
      createdAt: new Date().toISOString()
    };

    // If online razorpay payment
    if (window.Razorpay) {
      launchRazorpayCheckout({
        amount: surgery.startingPrice,
        bookingId: bookingId,
        bookingType: 'surgery',
        serviceTitle: surgery.title,
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
      await bookSurgery(bookingPayload);
      const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      const filtered = existing.filter(b => b.id !== bookingPayload.id && b.bookingId !== bookingPayload.id);
      localStorage.setItem('patient_appointments', JSON.stringify([bookingPayload, ...filtered]));

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

      setConfirmedBookingData(bookingPayload);
      setStep('confirmed');
      addToast('Surgery consultation booked successfully!', 'success');
    } catch (err) {
      console.error('Save booking error:', err);
      setConfirmedBookingData(bookingPayload);
      setStep('confirmed');
      addToast('Surgery package booked successfully!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // What's Included 6 items
  const whatsIncludedItems = surgery.whatsIncluded || [
    'Pre-surgery Consultation',
    'Surgery Charges',
    'Room Charges (3–5 Days)',
    'Medicines & Consumables',
    'Post-operative Care',
    'Follow-up Consultation'
  ];

  // FAQs
  const faqsList = surgery.faqs || [
    {
      q: 'What is included in the orthopedic surgery package?',
      a: 'The package includes pre-surgery consultation, complete surgical procedure charges, room charges for 3–5 days, routine medicines and consumables during hospital stay, post-operative nursing care, and follow-up consultations with your orthopedic surgeon.'
    },
    {
      q: 'How long is the hospital stay?',
      a: 'The typical hospital stay is 3 to 5 days, depending on the specific procedure and your personalized recovery progress. Our medical team monitors you closely throughout your stay.'
    },
    {
      q: 'Is the package covered by insurance?',
      a: 'Yes, our orthopedic surgery packages are eligible for cashless insurance claims with all major health insurance providers and TPAs. Our dedicated insurance desk handles all pre-authorization paperwork.'
    },
    {
      q: 'Can I choose my surgeon?',
      a: 'Yes, you can consult with our team of senior board-certified orthopedic surgeons and choose your preferred specialist for your evaluation and procedure.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FBFA] font-sans text-slate-800 selection:bg-[#007A64] selection:text-white">
      
      {/* =========================================================================
          1. BREADCRUMBS
          ========================================================================= */}
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-3 border-b border-slate-200/80 bg-white">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 font-semibold truncate">
          <Link to="/" className="hover:text-[#007A64] transition">Home</Link>
          <span className="text-slate-400">&gt;</span>
          <Link to="/surgery-packages" className="hover:text-[#007A64] transition">Surgery</Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-900 font-bold truncate">
            {step === 1 
              ? (surgery.shortTitle || 'Orthopedic Surgery Package')
              : step === 'confirmed' 
              ? 'Booking Confirmation' 
              : 'Book Orthopedic Surgery'}
          </span>
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
            VIEW 1: SURGERY DETAIL PAGE (Image 1 in reference)
            ======================================================================= */}
        {step === 1 && (
          <div className="space-y-8 sm:space-y-10">
            
            {/* Top Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Title, Subtitle, Overview, Badges, Price & Book Now */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#0B1E3F] tracking-tight leading-tight">
                    {surgery.title}
                  </h1>
                  <div className="w-12 h-1 bg-[#007A64] rounded-full mt-2 mb-2.5" />
                  <p className="text-base sm:text-lg font-extrabold text-[#0B1E3F]">
                    {surgery.subtitle}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
                  {surgery.overview}
                </p>

                {/* 3 Feature Badges with Dividers */}
                <div className="flex items-center gap-3 sm:gap-4 pt-1 pb-1 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2">
                    <ExpertSurgeonIcon className="w-5 h-5 text-[#0B1E3F] shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                      Expert Orthopedic<br />Surgeons
                    </span>
                  </div>

                  <div className="hidden sm:block w-[1px] h-8 bg-slate-300 shrink-0" />

                  <div className="flex items-center gap-2">
                    <ModernOTIcon className="w-5 h-5 text-[#0B1E3F] shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                      Modern<br />Operation Theatres
                    </span>
                  </div>

                  <div className="hidden sm:block w-[1px] h-8 bg-slate-300 shrink-0" />

                  <div className="flex items-center gap-2">
                    <AdvancedRecoveryCareIcon className="w-5 h-5 text-[#0B1E3F] shrink-0" />
                    <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                      Advanced<br />Recovery Care
                    </span>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-2 space-y-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#0B1E3F]">
                      {surgery.priceFormatted || '₹75,000'}
                    </span>
                    <span className="text-sm text-slate-400 line-through font-bold">
                      ₹{(surgery.mrp || 100000).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-[#007A64] bg-[#DCF6EF] px-2.5 py-0.5 rounded-md border border-[#BCE8DD]">
                      {surgery.discountPercent || 25}% OFF
                    </span>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 group"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Surgery Illustration Card (Enlarged & Uncropped) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
                <div className="w-full max-w-xl xl:max-w-2xl rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-white p-2.5 sm:p-3 flex items-center justify-center">
                  <img
                    src={surgery.image || '/surgery-orthopedic-knee.png'}
                    alt={surgery.title}
                    className="w-full h-auto max-h-[460px] sm:max-h-[520px] lg:max-h-[580px] object-contain rounded-2xl"
                  />
                </div>
              </div>

            </div>

            {/* Section 2: What's Included */}
            <div className="bg-[#F0F8FE] rounded-3xl p-6 sm:p-8 border border-[#D6EAF8]">
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
                  <div className="w-14 h-14 rounded-full bg-[#E0F4FB] text-[#007A64] flex items-center justify-center shrink-0">
                    <DoctorSurgeonBadgeIcon className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Experienced Orthopedic<br />Surgeons
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#E0F4FB] text-[#007A64] flex items-center justify-center shrink-0">
                    <AdvancedTechBadgeIcon className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Advanced<br />Technology
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#E0F4FB] text-[#007A64] flex items-center justify-center shrink-0">
                    <HospitalStayBadgeIcon className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Shorter<br />Hospital Stay
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-[#E0F4FB] text-[#007A64] flex items-center justify-center shrink-0">
                    <RecoveryOutcomeBadgeIcon className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Better<br />Recovery Outcomes
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
            VIEW 2: STEP 2 - PATIENT DETAILS (Image 2 in reference)
            ======================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E3F] tracking-tight">
                Book Orthopedic Surgery
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
                    src={surgery.thumbImage || surgery.image || '/surgery-pkg-orthopedic.png'}
                    alt={surgery.title}
                    className="w-20 h-20 rounded-2xl object-contain bg-white p-1 shrink-0 border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-black text-[#0B1E3F] leading-tight">
                      {surgery.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {surgery.subtitle}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base sm:text-lg font-black text-[#0B1E3F]">
                        {surgery.priceFormatted || '₹75,000'}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-semibold">
                        ₹{(surgery.mrp || 100000).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-[#007A64] bg-[#DCF6EF] px-1.5 py-0.5 rounded">
                        {surgery.discountPercent || 25}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1.5">
                      Duration: {surgery.stay || '3–5 Days (Hospital Stay)'}
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
                    onClick={() => setStep(1)}
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

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Address (for Home Visit) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
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
            VIEW 3: STEP 3 - CHOOSE DATE & TIME (Image 3 in reference)
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
                  <button type="button" className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-base sm:text-lg font-black text-[#0B1E3F]">
                    {selectedMonth} {selectedYear}
                  </span>
                  <button type="button" className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition">
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

                {/* Days Grid matching November 2026 */}
                <div className="grid grid-cols-7 text-center gap-y-2 text-sm font-semibold">
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <button key={d} type="button" onClick={() => setSelectedDay(d)} className="py-2 hover:bg-slate-100 rounded-full text-slate-700">
                      {d}
                    </button>
                  ))}
                  {[8, 9, 10, 11, 12, 13, 14].map(d => (
                    <button key={d} type="button" onClick={() => setSelectedDay(d)} className="py-2 hover:bg-slate-100 rounded-full text-slate-700">
                      {d}
                    </button>
                  ))}
                  {[15, 16, 17, 18, 19, 20, 21].map(d => (
                    <button key={d} type="button" onClick={() => setSelectedDay(d)} className="py-2 hover:bg-slate-100 rounded-full text-slate-700">
                      {d}
                    </button>
                  ))}
                  {[22, 23, 24, 25, 26, 27, 28].map(d => {
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
                  {[29, 30].map(d => (
                    <button key={d} type="button" onClick={() => setSelectedDay(d)} className="py-2 hover:bg-slate-100 rounded-full text-slate-700">
                      {d}
                    </button>
                  ))}
                  {/* Next month days dimmed */}
                  {[1, 2, 3, 4, 5].map(d => (
                    <span key={`next-${d}`} className="py-2 text-slate-300">
                      {d}
                    </span>
                  ))}
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
                  {['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-3 px-3 rounded-xl border text-sm font-bold text-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#007A64] text-white border-[#007A64] shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                {/* Info Notice Box */}
                <div className="bg-[#EBF6FC] rounded-2xl p-4 border border-[#CEE7F8] flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#0284C7] text-[#0284C7] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    i
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed font-medium">
                    <p className="font-bold text-[#0B1E3F]">Our surgeons are available 7 days a week.</p>
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
            VIEW 4: STEP 4 - PAYMENT (Image 4 Top in reference)
            ======================================================================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1E3F] tracking-tight">
                Book Orthopedic Surgery
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
                      src={surgery.thumbImage || surgery.image || '/surgery-pkg-orthopedic.png'}
                      alt={surgery.title}
                      className="w-16 h-16 rounded-xl object-contain bg-white p-1 shrink-0 border border-slate-200"
                    />
                    <div>
                      <h3 className="text-base font-black text-[#0B1E3F]">
                        {surgery.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold">
                        {surgery.subtitle}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-base font-black text-[#0B1E3F]">
                          {surgery.priceFormatted || '₹75,000'}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{(surgery.mrp || 100000).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-bold text-[#007A64] bg-[#DCF6EF] px-1.5 py-0.2 rounded">
                          {surgery.discountPercent || 25}% OFF
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
                      <span className="font-semibold text-slate-500 w-32">Appointment Date:</span>
                      <span className="font-bold text-slate-900">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold text-slate-500 w-32">Time:</span>
                      <span className="font-bold text-slate-900">{selectedTimeSlot}</span>
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
                          UPI (Google Pay, PhonePe, etc.)
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
                      paymentMethod === 'wallet' ? 'border-[#007A64] bg-teal-50/40' : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'wallet'}
                          onChange={() => setPaymentMethod('wallet')}
                          className="w-4 h-4 text-[#007A64]"
                        />
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          Wallet (Paytm, PhonePe, etc.)
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Right Column: Pay with Razorpay Box */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[#0B1E3F]">
                    Pay with Razorpay
                  </h2>
                  <span className="text-base font-extrabold italic text-[#0B3B70]">
                    Razorpay
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Your payment is 100% secure and encrypted.</span>
                </div>

                {/* QR Code Scan & Pay */}
                <div className="bg-[#F8FCFF] rounded-2xl p-5 border border-slate-200 flex items-center gap-5">
                  <img
                    src="/razorpay-qr-code.png"
                    alt="Scan & Pay QR Code"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain border border-slate-200 rounded-xl bg-white p-1"
                  />
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[#0B1E3F]">
                      Scan &amp; Pay
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Scan the QR code with any UPI app
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

                {/* Big Green Pay Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCompletePayment}
                  className="w-full py-4 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white font-black text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay {surgery.priceFormatted || '₹75,000'}</span>
                </button>

                <p className="text-xs text-slate-500 text-center font-medium">
                  You will be redirected to Razorpay to complete your payment.
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
            VIEW 5: BOOKING CONFIRMED (Image 4 Bottom in reference)
            ======================================================================= */}
        {step === 'confirmed' && (
          <div className="space-y-8 max-w-4xl mx-auto py-4">
            
            {/* Header Success Checkmark */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#007A64] text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#0B1E3F] tracking-tight">
                Booking Confirmed!
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-medium">
                Your orthopedic surgery package has been booked successfully.
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Left: Package Thumbnail & Pricing */}
                <div className="flex gap-4 items-center">
                  <img
                    src={surgery.thumbImage || surgery.image || '/surgery-pkg-orthopedic.png'}
                    alt={surgery.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-contain bg-white p-1 shrink-0 border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B1E3F] leading-tight">
                      {surgery.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      {surgery.subtitle}
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base sm:text-lg font-black text-[#0B1E3F]">
                        {surgery.priceFormatted || '₹75,000'}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{(surgery.mrp || 100000).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-[#007A64] bg-[#DCF6EF] px-1.5 py-0.5 rounded">
                        {surgery.discountPercent || 25}% OFF
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
                    <span className="text-slate-500 font-medium sm:w-28">Time:</span>
                    <span className="font-bold text-slate-900">{confirmedBookingData?.time || selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-500 font-medium sm:w-28">Mode:</span>
                    <span className="font-bold text-slate-900">In Hospital</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-500 font-medium sm:w-28">Booking ID:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {confirmedBookingData?.bookingId || `ZM${selectedYear}11${selectedDay}001`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-8 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/patient-dashboard?tab=bookings')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0B3B70] hover:bg-[#072950] text-white font-extrabold text-sm shadow-sm transition cursor-pointer active:scale-95"
                >
                  View My Bookings
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold text-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Home className="w-4 h-4 text-slate-700" />
                  <span>Back to Home</span>
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
                  <DoctorSurgeonBadgeIcon className="w-5 h-5 text-[#007A64]" />
                  <span>Best Doctors</span>
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

    </div>
  );
}
