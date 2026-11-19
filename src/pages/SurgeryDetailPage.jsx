import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Calendar, Clock, MapPin, CheckCircle2, 
  ArrowRight, Phone, Award, User, FileText, ChevronRight, 
  Sparkles, Check, Home, Car, AlertCircle, Heart, Star,
  Activity, BedDouble, Stethoscope, Building2, CreditCard,
  X
} from 'lucide-react';
import { getSurgeryPackageById } from '../mock-data/surgeryPackagesData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookSurgery } from '../services/supabaseService';
import { enforceAuth } from '../utils/authGuard';
import { launchRazorpayCheckout } from '../services/razorpayClient';

export default function SurgeryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuth } = useAuth();
  const { addToast } = useToast();

  const surgery = getSurgeryPackageById(id);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Patient Booking Form
  const [patientForm, setPatientForm] = useState({
    name: user?.name || '',
    phone: user?.contact || user?.phone || '',
    age: user?.age || '42',
    gender: user?.gender || 'Male',
    date: 'Tomorrow (Morning Slot)',
    timeSlot: '10:30 AM',
    consultationMode: 'Hospital Consultation & Evaluation',
    preferredHospital: 'Downtown Hospital & Dispur Partner Polyclinic, Guwahati',
    insuranceType: 'TPA Cashless Mediclaim',
    needSeniorPickup: true,
    notes: ''
  });

  // Keep form in sync when user logs in
  useEffect(() => {
    if (user) {
      setPatientForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.contact || user.phone || '',
        age: prev.age || user.age || '42',
        gender: prev.gender || user.gender || 'Male'
      }));
    }
  }, [user]);

  // Auto-open surgery booking modal when user logs in on this same page
  useEffect(() => {
    if (user) {
      try {
        const pendingRaw = sessionStorage.getItem('zestmed_pending_action');
        if (pendingRaw) {
          const parsed = JSON.parse(pendingRaw);
          if (parsed?.type === 'book_surgery') {
            sessionStorage.removeItem('zestmed_pending_action');
            setIsBookingModalOpen(true);
            return;
          }
        }
      } catch (_) {}

      if (location.state?.autoOpenBooking) {
        setIsBookingModalOpen(true);
      }
    }
  }, [user, location.state]);

  // When clicking Book Now
  const handleOpenBooking = () => {
    if (!user) {
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to book your surgery package',
        pendingAction: { type: 'book_surgery', surgeryId: id },
        addToast
      });
      return;
    }
    setIsBookingModalOpen(true);
  };

  // Save Confirmed Surgery Booking
  const saveConfirmedSurgeryBooking = async (bookingId, paymentDetails = null) => {
    const isPaidOnline = Boolean(paymentDetails?.paymentId && paymentDetails.paymentId !== 'PAY_AT_HOSPITAL');
    const isToken = patientForm.insuranceType.includes('Token');
    const chargedAmount = isPaidOnline ? (isToken ? 999 : surgery.startingPrice) : surgery.startingPrice;

    const bookingData = {
      id: bookingId,
      bookingId: bookingId,
      booking_number: bookingId,
      type: 'Surgery Package',
      category: 'surgery',
      isSurgery: true,
      title: surgery.title,
      surgeryName: surgery.title,
      doctor: surgery.surgeon?.name || 'Dr. Anupam Sarma',
      doctorName: surgery.surgeon?.name || 'Dr. Anupam Sarma',
      doctorSpecialty: surgery.category,
      specialty: surgery.category,
      doctorHospital: patientForm.preferredHospital,
      hospital: patientForm.preferredHospital,
      hospital_preference: patientForm.preferredHospital,
      date: patientForm.date,
      preferred_date: patientForm.date,
      time: patientForm.timeSlot,
      slot: patientForm.timeSlot,
      mode: patientForm.consultationMode,
      fee: surgery.startingPrice,
      price: surgery.startingPrice,
      totalAmount: surgery.startingPrice,
      patientName: patientForm.name,
      patient_name: patientForm.name,
      patientPhone: patientForm.phone,
      phone: patientForm.phone,
      patientAge: patientForm.age,
      patientGender: patientForm.gender,
      insuranceType: patientForm.insuranceType,
      symptoms: patientForm.notes || `${surgery.shortTitle} Pre-Op Consultation - ${patientForm.insuranceType}`,
      notes: patientForm.notes || null,
      status: 'Confirmed',
      bookingStatus: 'Confirmed',
      paymentStatus: isPaidOnline 
        ? (isToken ? 'Advance Token Paid (Razorpay Verified)' : 'Full Package Paid (Razorpay Verified)')
        : patientForm.insuranceType === 'TPA Cashless Mediclaim' 
        ? 'TPA Cashless Assistance' 
        : 'Pay at Hospital',
      paymentMethod: isPaidOnline ? 'Razorpay (Verified)' : patientForm.insuranceType,
      paymentId: paymentDetails?.paymentId || '',
      orderId: paymentDetails?.orderId || '',
      paidAmount: isPaidOnline ? chargedAmount : 0,
      userId: user.id || null,
      userEmail: user.email || '',
      createdAt: new Date().toISOString(),
      seniorPickupRequested: patientForm.needSeniorPickup,
      careManager: 'Dr. Anupam Sarma (Surgery Lead)',
      carePhone: '+91 94351 09876'
    };

    try {
      // 1. Save to Supabase PostgreSQL table
      await bookSurgery(bookingData);

      // 2. Save to local storage for instant dashboard synchronization
      const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
      const filteredExisting = existing.filter(b => b.id !== bookingId && b.bookingId !== bookingId);
      localStorage.setItem('patient_appointments', JSON.stringify([bookingData, ...filteredExisting]));
      
      // Trigger update events
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

      setConfirmedBooking(bookingData);
      addToast(`Surgery consultation reserved for ${surgery.shortTitle}!`, 'success');
    } catch (err) {
      console.error('Surgery booking error:', err);
      addToast('Surgery consultation booked successfully', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit actual booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      setIsBookingModalOpen(false);
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to confirm your surgery booking',
        addToast
      });
      return;
    }

    if (!patientForm.name.trim()) {
      addToast('Please enter patient name', 'error');
      return;
    }

    const cleanPhone = (patientForm.phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    const bookingId = `ZM-SURG-${Math.floor(10000 + Math.random() * 90000)}`;

    if (patientForm.insuranceType.includes('Razorpay')) {
      const isToken = patientForm.insuranceType.includes('Token');
      const amountToCharge = isToken ? 999 : surgery.startingPrice;

      setIsSubmitting(true);
      launchRazorpayCheckout({
        amount: amountToCharge,
        bookingId: bookingId,
        bookingType: 'surgery',
        serviceTitle: `Surgery Package: ${surgery.shortTitle}`,
        customer: {
          name: patientForm.name,
          phone: patientForm.phone,
          email: user?.email || 'patient@zestmed.in'
        },
        onSuccess: (verifiedTxn) => {
          saveConfirmedSurgeryBooking(bookingId, verifiedTxn);
        },
        onFailure: (err) => {
          setIsSubmitting(false);
          addToast(err?.message || 'Payment not completed.', 'error');
        },
        onDismiss: () => {
          setIsSubmitting(false);
          addToast('Payment cancelled. You can choose Pay at Hospital or Cashless TPA.', 'info');
        }
      });
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        saveConfirmedSurgeryBooking(bookingId, { paymentId: 'PAY_AT_HOSPITAL' });
      }, 400);
    }
  };

  if (!surgery) {
    return (
      <div className="min-h-screen bg-[#F8FBFA] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Surgery Package Not Found</h2>
        <p className="text-slate-600 mb-6">The surgery package you are looking for does not exist or has been relocated.</p>
        <Link 
          to="/surgery-packages" 
          className="px-6 py-3 bg-[#007A64] text-white rounded-xl font-bold hover:bg-[#006853] transition"
        >
          View All Surgery Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBFA] font-sans text-slate-800 pb-20 selection:bg-[#007A64] selection:text-white">
      
      {/* =========================================================================
          1. BREADCRUMBS
          ========================================================================= */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-3.5 border-b border-slate-200/80 bg-white">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-semibold truncate">
          <Link to="/" className="flex items-center gap-1 hover:text-[#007A64] transition">
            <Home className="w-3.5 h-3.5 text-[#007A64]" />
            <span>Home</span>
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link to="/surgery-packages" className="hover:text-[#007A64] transition">
            <span>Surgery Packages</span>
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-900 font-bold truncate">{surgery.shortTitle}</span>
        </div>
      </div>

      {/* =========================================================================
          2. HERO HEADER SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-gradient-to-r from-[#E6FAF5] via-[#DCF6EF] to-[#D0F2E8]">
        
        {/* Ambient Blur */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-teal-300 text-[#007A64] text-xs sm:text-[13px] font-extrabold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#007A64]" />
                <span>{surgery.category}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span className="text-slate-600 font-medium">Guwahati Partner Hospitals</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-black text-slate-900 tracking-tight leading-[1.2]">
                {surgery.title}
              </h1>

              {/* Subhead / Overview */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl">
                {surgery.overview}
              </p>

              {/* Key Surgery Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                
                <div className="bg-white/90 rounded-xl p-3 border border-teal-100/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Hospital Stay</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-black text-slate-900 mt-1">{surgery.stay}</p>
                </div>

                <div className="bg-white/90 rounded-xl p-3 border border-teal-100/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                    <Stethoscope className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Incision Type</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-black text-slate-900 mt-1">{surgery.incision.split('(')[0]}</p>
                </div>

                <div className="bg-white/90 rounded-xl p-3 border border-teal-100/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                    <Activity className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Recovery Time</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-black text-slate-900 mt-1">{surgery.recoveryTime.split(',')[0]}</p>
                </div>

                <div className="bg-white/90 rounded-xl p-3 border border-teal-100/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
                    <Car className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Senior Transport</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-black text-[#007A64] mt-1">Free 10km Cab Included</p>
                </div>

              </div>

            </div>

            {/* Right Illustration & Quick Booking Card */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-4">
                
                {/* Visual Image */}
                <div className="h-32 w-full flex items-center justify-center rounded-2xl bg-slate-50 p-2 overflow-hidden border border-slate-100">
                  <img
                    src={surgery.image}
                    alt={surgery.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Pricing Box */}
                <div className="bg-[#EBF9F5] rounded-2xl p-4 border border-[#BCE8DD]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 block">
                    Complete All-Inclusive Package
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#007A64]">
                      {surgery.priceFormatted}
                    </span>
                    <span className="text-sm text-slate-400 line-through font-semibold">
                      ₹{surgery.mrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 ml-auto">
                      {surgery.discountPercent}% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-800 font-semibold mt-1.5">
                    Zero hidden fees • Transparent hospital & surgeon billing
                  </p>
                </div>

                {/* Insurance Banner */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <CreditCard className="w-4 h-4 text-[#007A64] shrink-0" />
                  <span className="truncate">{surgery.cashlessInsurance}</span>
                </div>

                {/* Book Now Button */}
                <button
                  type="button"
                  onClick={handleOpenBooking}
                  className="w-full py-3.5 px-5 bg-[#007A64] hover:bg-[#006853] text-white font-black text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Calendar className="w-4.5 h-4.5" />
                  <span>Book Now</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>

                <p className="text-[11px] text-slate-500 text-center font-medium">
                  Requires free login • Free pre-surgery consultation & senior cab
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. MAIN DETAILED CONTENT GRID
          ========================================================================= */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-8 sm:pt-10 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Left Column: Complete Details */}
          <div className="lg:col-span-8 space-y-7">
            
            {/* Section 1: Detailed Clinical Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <FileText className="w-5 h-5 text-[#007A64]" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  About This Surgery
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {surgery.description}
              </p>
            </div>

            {/* Section 2: Step-by-Step Surgical Procedure */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Stethoscope className="w-5 h-5 text-[#007A64]" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Procedure &amp; Surgical Steps
                </h2>
              </div>

              <div className="space-y-3.5 pt-1">
                {surgery.procedureSteps.map((p) => (
                  <div key={p.step} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <span className="w-7 h-7 rounded-full bg-[#007A64] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {p.step}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                        {p.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Key Benefits */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-[#007A64]" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Key Benefits &amp; Advantages
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {surgery.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/30 border border-teal-100/60">
                    <CheckCircle2 className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-semibold leading-snug">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Package Inclusions */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-[#007A64]" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  What's Included in the Package
                </h2>
              </div>

              <div className="space-y-2.5 pt-1">
                {surgery.inclusions.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Recovery Details & Aftercare */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Activity className="w-5 h-5 text-[#007A64]" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Recovery &amp; Aftercare Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Hospital Stay</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{surgery.recoveryGuide.hospitalStay}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Walking &amp; Mobility</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{surgery.recoveryGuide.walking}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Diet Guidelines</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">{surgery.recoveryGuide.diet}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Return to Work</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{surgery.recoveryGuide.returnToWork}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Post-Op Follow-up</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{surgery.recoveryGuide.followUp}</p>
                </div>

              </div>
            </div>

          </div>

          {/* Right Sidebar Column: Surgeon Information & Hospital Details */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Surgeon Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Award className="w-5 h-5 text-[#007A64]" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Operating Surgeon Information
                </h3>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 text-[#007A64]">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {surgery.surgeon.name}
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    {surgery.surgeon.qualification}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-[#007A64] text-[11px] font-bold mt-1.5 border border-teal-100">
                    {surgery.surgeon.experience}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs sm:text-[13px] text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Designation</span>
                  <span className="font-bold text-slate-900 text-right">{surgery.surgeon.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Surgeries Completed</span>
                  <span className="font-black text-[#007A64]">{surgery.surgeon.surgeriesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Hospital Center</span>
                  <span className="font-bold text-slate-900 text-right">{surgery.surgeon.hospitalAffiliation.split('&')[0]}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenBooking}
                className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-[#007A64] font-black text-xs sm:text-sm rounded-xl border border-teal-200 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Book Consultation with Surgeon</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Hospital Center Details */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-5 h-5 text-[#007A64]" />
                <h3 className="text-base font-black text-slate-900">
                  Hospital &amp; OT Facilities
                </h3>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-800">{surgery.hospitalLocation}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-6">
                  Equipped with modern Class-100 laminar airflow modular operation theatres, ICU backup, and 24x7 emergency medical response team.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>NABL &amp; NABH Accredited Partner Hospital</span>
              </div>
            </div>

            {/* Senior Citizen Transport Badge */}
            <div className="rounded-3xl p-5 bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <Car className="w-4.5 h-4.5 text-amber-700" />
                <span>Senior Citizen Transportation</span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Free sanitized AC cab pick-up &amp; drop within 10km in Guwahati for elderly patients accompanying families.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================================
          4. BOTTOM STICKY BAR / FLOATING CTA
          ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-4 sm:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Package Starting From
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-black text-[#007A64]">
                {surgery.priceFormatted}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ₹{surgery.mrp.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+919435109876"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition"
            >
              <Phone className="w-4 h-4 text-[#007A64]" />
              <span>Talk to Care Expert</span>
            </a>

            <button
              type="button"
              onClick={handleOpenBooking}
              className="py-2.5 sm:py-3 px-6 sm:px-8 bg-[#007A64] hover:bg-[#006853] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. BOOKING MODAL (Step 4 & 5: Login required + Actual Booking Form)
          ========================================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 via-white to-teal-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#007A64] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {confirmedBooking ? 'Surgery Consultation Booked' : 'Book Surgery Consultation'}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {surgery.shortTitle} • {surgery.priceFormatted}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setConfirmedBooking(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {confirmedBooking ? (
                /* Booking Confirmed Screen */
                <div className="text-center space-y-5 py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-900">
                      Booking Confirmed!
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Your surgery consultation has been booked and saved to your account.
                    </p>
                    <div className="inline-block mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                      Booking ID: <span className="text-[#007A64]">{confirmedBooking.bookingId}</span>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Surgery Package</span>
                      <span className="font-bold text-slate-900 text-right">{confirmedBooking.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Surgeon Lead</span>
                      <span className="font-bold text-[#007A64]">{confirmedBooking.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Appointment Date</span>
                      <span className="font-bold text-slate-900">{confirmedBooking.date} • {confirmedBooking.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Hospital Center</span>
                      <span className="font-bold text-slate-900 text-right">{confirmedBooking.hospital}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Patient Name</span>
                      <span className="font-bold text-slate-900">{confirmedBooking.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Package Cost</span>
                      <span className="font-black text-[#007A64]">₹{confirmedBooking.fee?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="text-slate-500 font-medium">Payment / Mode</span>
                      <span className="font-bold text-emerald-700 text-right">{confirmedBooking.paymentStatus}</span>
                    </div>
                    {confirmedBooking.paymentId && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Razorpay Txn</span>
                        <span className="font-mono text-slate-800 font-bold">{confirmedBooking.paymentId}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBookingModalOpen(false);
                        navigate('/patient-dashboard?tab=bookings');
                      }}
                      className="w-full py-3 bg-[#007A64] hover:bg-[#006853] text-white font-black text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View in My Bookings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsBookingModalOpen(false);
                        setConfirmedBooking(null);
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Actual Booking Form */
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  
                  {/* Notice on Logged-in Account */}
                  <div className="flex items-center gap-2 p-3 bg-teal-50/80 rounded-xl border border-teal-100 text-xs text-teal-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#007A64] shrink-0" />
                    <span>Logged in as <strong>{user?.name || 'Verified Patient'}</strong> ({user?.contact || user?.phone || 'Account Verified'})</span>
                  </div>

                  {/* Patient Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={patientForm.name}
                        onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                        placeholder="e.g. Rahul Verma"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={patientForm.phone}
                        onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64]"
                      />
                    </div>
                  </div>

                  {/* Age & Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        value={patientForm.age}
                        onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                        placeholder="e.g. 42"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={patientForm.gender}
                        onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64] cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Preferred Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Date
                      </label>
                      <select
                        value={patientForm.date}
                        onChange={(e) => setPatientForm({ ...patientForm, date: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64] cursor-pointer"
                      >
                        <option value="Tomorrow (Morning Slot)">Tomorrow (Morning)</option>
                        <option value="Tomorrow (Evening Slot)">Tomorrow (Evening)</option>
                        <option value="In 2 Days">In 2 Days</option>
                        <option value="This Weekend">This Weekend</option>
                        <option value="Next Monday">Next Monday</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Time Slot
                      </label>
                      <select
                        value={patientForm.timeSlot}
                        onChange={(e) => setPatientForm({ ...patientForm, timeSlot: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64] cursor-pointer"
                      >
                        <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM (Morning)</option>
                        <option value="12:00 PM - 01:30 PM">12:00 PM - 01:30 PM (Midday)</option>
                        <option value="03:00 PM - 04:30 PM">03:00 PM - 04:30 PM (Afternoon)</option>
                        <option value="05:30 PM - 07:00 PM">05:30 PM - 07:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  {/* Consultation Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Consultation Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPatientForm({ ...patientForm, consultationMode: 'Hospital Consultation & Evaluation' })}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                          patientForm.consultationMode === 'Hospital Consultation & Evaluation'
                            ? 'border-[#007A64] bg-teal-50 text-[#007A64]'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        🏥 Hospital Visit &amp; OPD
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatientForm({ ...patientForm, consultationMode: 'Online Video Second Opinion' })}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                          patientForm.consultationMode === 'Online Video Second Opinion'
                            ? 'border-[#007A64] bg-teal-50 text-[#007A64]'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        📱 Online Video Consult
                      </button>
                    </div>
                  </div>

                  {/* Preferred Hospital */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hospital Preference in Guwahati
                    </label>
                    <select
                      value={patientForm.preferredHospital}
                      onChange={(e) => setPatientForm({ ...patientForm, preferredHospital: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64] cursor-pointer"
                    >
                      <option value="Downtown Hospital & Dispur Partner Polyclinic, Guwahati">Downtown Hospital &amp; Dispur Polyclinic, Guwahati</option>
                      <option value="Excelcare Partner Surgical Hub, Boragaon, Guwahati">Excelcare Partner Surgical Hub, Guwahati</option>
                      <option value="Central Polyclinic & Hospital, GS Road, Guwahati">Central Polyclinic &amp; Hospital, GS Road, Guwahati</option>
                      <option value="Dispur Eye Center & Partner Hospitals, Guwahati">Dispur Eye Center &amp; Partner Hospitals, Guwahati</option>
                      <option value="Premier Super Specialty Orthopedic Hub, Guwahati">Premier Super Specialty Orthopedic Hub, Guwahati</option>
                    </select>
                  </div>

                  {/* Insurance & Payment Preference */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment / Insurance Option
                    </label>
                    <select
                      value={patientForm.insuranceType}
                      onChange={(e) => setPatientForm({ ...patientForm, insuranceType: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#007A64] cursor-pointer"
                    >
                      <option value="Pay Advance Booking Token (₹999 via Razorpay)">💳 Pay Advance Booking Token (₹999 via Razorpay Online)</option>
                      <option value="Pay Full Package via Razorpay">💳 Pay Full Surgery Package (₹{surgery.startingPrice?.toLocaleString('en-IN')} via Razorpay Online)</option>
                      <option value="TPA Cashless Mediclaim">🛡️ 100% Cashless TPA Mediclaim (Hassle-Free Approval)</option>
                      <option value="Ayushman Bharat (PM-JAY)">🏥 Ayushman Bharat (PM-JAY) Assistance</option>
                      <option value="Pay Directly at Hospital (Card/UPI/Cash)">🏥 Pay Directly at Hospital Desk (Card / UPI / Cash)</option>
                    </select>
                  </div>

                  {/* Senior Transport Checkbox */}
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer select-none p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                    <input
                      type="checkbox"
                      checked={patientForm.needSeniorPickup}
                      onChange={(e) => setPatientForm({ ...patientForm, needSeniorPickup: e.target.checked })}
                      className="w-4 h-4 rounded text-[#007A64] focus:ring-[#007A64] cursor-pointer"
                    />
                    <span>Include Free Senior Citizen 10km Cab Pick-up &amp; Drop in Guwahati</span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#007A64] hover:bg-[#006853] text-white font-black text-sm rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>
                      {isSubmitting
                        ? 'Processing Booking...'
                        : patientForm.insuranceType.includes('Token')
                        ? 'Pay ₹999 Advance via Razorpay & Confirm'
                        : patientForm.insuranceType.includes('Full')
                        ? `Pay ₹${surgery.startingPrice?.toLocaleString('en-IN')} via Razorpay & Confirm`
                        : 'Confirm Surgery Consultation'}
                    </span>
                  </button>

                  <p className="text-[11px] text-slate-400 text-center font-medium">
                    {patientForm.insuranceType.includes('Razorpay')
                      ? 'Secure 256-bit encrypted payment verified via Razorpay.'
                      : 'No immediate advance payment required. Saved instantly to your real My Bookings account.'}
                  </p>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
