// src/pages/PhysiotherapyBookingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Home, ArrowLeft, ArrowRight, 
  CreditCard, ShieldCheck, CheckCircle2, User, Phone, 
  Activity, Info, ClipboardList, Check, Lock, ChevronDown, 
  Banknote, Download, FileText 
} from 'lucide-react';
import { getPhysioServiceById, ALL_PHYSIO_SERVICES } from '../mock-data/allPhysioServicesData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation as useGeoLocation } from '../context/LocationContext';
import { launchRazorpayCheckout } from '../services/razorpayClient';
import { bookPhysiotherapy } from '../services/supabaseService';

export default function PhysiotherapyBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { currentLocation } = useGeoLocation();

  // Selected Service
  const [selectedServiceId, setSelectedServiceId] = useState(id || 'general-physiotherapy');
  const service = getPhysioServiceById(selectedServiceId);

  // Stepper state: 1 = Book Session, 2 = Patient Details, 3 = Review & Pay, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Booking Details state (matching shared reference design)
  const [sessionType, setSessionType] = useState('In-Clinic Session'); // 'In-Clinic Session' | 'At-Home Session'
  const [preferredDate, setPreferredDate] = useState('2026-11-24');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [conditionNotes, setConditionNotes] = useState('');

  // Step 2: Patient Details state
  const [patientName, setPatientName] = useState(user?.name || 'Ajayendra Shekhar');
  const [mobileNumber, setMobileNumber] = useState(user?.contact || user?.phone || '9876543210');
  const [age, setAge] = useState(user?.age || '45');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState(user?.address || 'House No. 12, Zoo Road, Guwahati, Assam');

  // Step 3: Payment method
  const [paymentMode, setPaymentMode] = useState('online'); // 'online' | 'clinic'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, id]);

  // Keep patient details in sync if auth loads
  useEffect(() => {
    if (user) {
      if (user.name && user.name !== 'Verified Patient') setPatientName(user.name);
      if (user.contact || user.phone) setMobileNumber(user.contact || user.phone);
    }
  }, [user]);

  // Format date display (e.g. "Tue, 24 Nov 2026")
  const formatDateDisplay = (dateString) => {
    try {
      const d = new Date(dateString + 'T00:00:00');
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (_) {
      return 'Tue, 24 Nov 2026';
    }
  };

  // Step 1 Proceed
  const handleProceedFromStep1 = (e) => {
    e?.preventDefault();
    setCurrentStep(2);
  };

  // Step 2 Proceed
  const handleProceedFromStep2 = (e) => {
    e?.preventDefault();
    if (!patientName.trim()) {
      addToast('Please enter patient full name', 'error');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setCurrentStep(3);
  };

  // Step 3 Final Booking & Payment
  const handleFinalPayment = async () => {
    const bookingId = `ZM-PHY-${Math.floor(10000 + Math.random() * 90000)}`;

    const createBookingRecord = async (paymentDetails = null) => {
      const pid = paymentDetails?.paymentId || paymentDetails?.razorpay_payment_id || paymentDetails?.id;
      const isPaidOnline = Boolean(paymentDetails && pid && pid !== 'PAY_POST_SESSION');

      const record = {
        id: bookingId,
        bookingId: bookingId,
        booking_number: bookingId,
        type: 'Physiotherapy',
        category: 'physiotherapy',
        title: service.title,
        doctor: service.expert?.name || 'Dr. Arindam Borah, MPT (Ortho)',
        doctorName: service.expert?.name || 'Dr. Arindam Borah, MPT (Ortho)',
        doctorSpecialty: service.title,
        specialty: service.title,
        doctorDegree: service.expert?.degree || 'BPT, MPT, Certified Clinical PT',
        doctorHospital: service.expert?.hospital || 'ZESTMED Physiotherapy & Rehabilitation Center, Guwahati',
        hospital: service.expert?.hospital || 'ZESTMED Physiotherapy & Rehabilitation Center, Guwahati',
        date: formatDateDisplay(preferredDate),
        time: preferredTimeSlot,
        slot: `${formatDateDisplay(preferredDate)}, ${preferredTimeSlot}`,
        mode: sessionType,
        sessionType: sessionType,
        fee: service.price,
        price: service.price,
        totalAmount: service.price,
        patientName: patientName,
        patientPhone: mobileNumber,
        phone: mobileNumber,
        patientAge: age,
        patientGender: gender,
        patientAddress: sessionType === 'At-Home Session' ? address : 'ZESTMED Center, Zoo Road, Guwahati',
        symptoms: conditionNotes ? `${service.title} - ${conditionNotes}` : service.title,
        status: 'Confirmed',
        paymentStatus: isPaidOnline ? 'Paid (UPI / Razorpay Verified)' : 'Pay Post-Session',
        paymentMethod: isPaidOnline ? (paymentDetails?.paymentMethod || 'Razorpay (UPI - Verified)') : 'Pay Post-Session (Cash/UPI)',
        paymentId: pid && pid !== 'PAY_POST_SESSION' ? pid : '',
        orderId: paymentDetails?.orderId || '',
        createdAt: new Date().toISOString(),
      };

      try {
        const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
        localStorage.setItem('patient_appointments', JSON.stringify([record, ...existing]));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

        await bookPhysiotherapy(record);
      } catch (err) {
        console.error('Error saving booking', err);
      }

      setConfirmedBooking(record);
      setIsSubmitting(false);
      setCurrentStep(4);
      addToast(`Physiotherapy session booked successfully! ID: ${bookingId}`, 'success');
    };

    if (paymentMode === 'online') {
      setIsSubmitting(true);
      launchRazorpayCheckout({
        amount: service.price,
        bookingId: bookingId,
        bookingType: 'physiotherapy',
        serviceTitle: `Physiotherapy: ${service.title} (${sessionType})`,
        customer: {
          name: patientName,
          phone: mobileNumber,
          email: user?.email || 'patient@zestmed.in'
        },
        onSuccess: (verifiedTxn) => {
          createBookingRecord(verifiedTxn);
        },
        onFailure: (err) => {
          setIsSubmitting(false);
          addToast(err?.message || 'Payment not completed.', 'error');
        },
        onDismiss: () => {
          setIsSubmitting(false);
          addToast('Payment cancelled. You can choose Pay Post-Session.', 'info');
        }
      });
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        createBookingRecord({ paymentId: 'PAY_POST_SESSION' });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5FD]/60 font-sans pb-20 select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP PROGRESS STEPPER (Matching exact reference image)                 */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200/80 py-5 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            
            {/* Step 1: Book Session */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
                  currentStep === 1 
                    ? 'bg-[#1E60D5] text-white shadow-xs' 
                    : currentStep > 1 
                    ? 'bg-[#007A64] text-white' 
                    : 'bg-slate-100 text-slate-500 border border-slate-300'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
              </div>
              <span className={`text-xs sm:text-sm font-bold mt-2 whitespace-nowrap ${currentStep === 1 ? 'text-[#1E60D5]' : currentStep > 1 ? 'text-[#007A64]' : 'text-slate-500'}`}>
                Book Session
              </span>
            </div>

            {/* Connecting Line 1-2 */}
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 -mt-5 transition-colors ${currentStep > 1 ? 'bg-[#007A64]' : 'bg-slate-200'}`} />

            {/* Step 2: Patient Details */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
                  currentStep === 2 
                    ? 'bg-[#1E60D5] text-white shadow-xs' 
                    : currentStep > 2 
                    ? 'bg-[#007A64] text-white' 
                    : 'bg-slate-100 text-slate-500 border border-slate-300'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <span className={`text-xs sm:text-sm font-bold mt-2 whitespace-nowrap ${currentStep === 2 ? 'text-[#1E60D5]' : currentStep > 2 ? 'text-[#007A64]' : 'text-slate-500'}`}>
                Patient Details
              </span>
            </div>

            {/* Connecting Line 2-3 */}
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 -mt-5 transition-colors ${currentStep > 2 ? 'bg-[#007A64]' : 'bg-slate-200'}`} />

            {/* Step 3: Review & Pay */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
                  currentStep === 3 
                    ? 'bg-[#1E60D5] text-white shadow-xs' 
                    : currentStep > 3 
                    ? 'bg-[#007A64] text-white' 
                    : 'bg-slate-100 text-slate-500 border border-slate-300'
                }`}
              >
                {currentStep > 3 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
              </div>
              <span className={`text-xs sm:text-sm font-bold mt-2 whitespace-nowrap ${currentStep === 3 ? 'text-[#1E60D5]' : currentStep > 3 ? 'text-[#007A64]' : 'text-slate-500'}`}>
                Review &amp; Pay
              </span>
            </div>

            {/* Connecting Line 3-4 */}
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 -mt-5 transition-colors ${currentStep > 3 ? 'bg-[#007A64]' : 'bg-slate-200'}`} />

            {/* Step 4: Confirmation */}
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-colors ${
                  currentStep === 4 
                    ? 'bg-[#007A64] text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-500 border border-slate-300'
                }`}
              >
                4
              </div>
              <span className={`text-xs sm:text-sm font-bold mt-2 whitespace-nowrap ${currentStep === 4 ? 'text-[#007A64]' : 'text-slate-500'}`}>
                Confirmation
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ========================================================================= */}
        {/* STEP 1: BOOK SESSION (Exact layout & design of shared reference image)   */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Booking Details Card */}
            <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-blue-100/90 shadow-2xs space-y-6">
              
              {/* Card Header with Calendar Icon */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E60D5] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  Booking Details
                </h2>
              </div>

              {/* Form Grid */}
              <div className="space-y-5">
                
                {/* Row 1: Select Service & Select Session Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Select Service Dropdown */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                      Select Service <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#1E60D5] transition shadow-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <Activity className="w-4 h-4 text-[#1E60D5] shrink-0" />
                          <select
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            className="w-full bg-transparent outline-none text-xs sm:text-sm font-bold text-slate-800 cursor-pointer appearance-none pr-6"
                          >
                            {ALL_PHYSIO_SERVICES.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Select Session Type Pill Toggles */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                      Select Session Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSessionType('In-Clinic Session')}
                        className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                          sessionType === 'In-Clinic Session'
                            ? 'border-[#1E60D5] bg-blue-50/70 text-[#1E60D5] shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <MapPin className="w-4 h-4 shrink-0 text-[#1E60D5]" />
                        <span>In-Clinic Session</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSessionType('At-Home Session')}
                        className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                          sessionType === 'At-Home Session'
                            ? 'border-[#1E60D5] bg-blue-50/70 text-[#1E60D5] shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Home className="w-4 h-4 shrink-0 text-[#1E60D5]" />
                        <span>At-Home Session</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Row 2: Preferred Date & Preferred Time Slot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Preferred Date */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#1E60D5] transition shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-[#1E60D5] shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-slate-800">
                            {formatDateDisplay(preferredDate)}
                          </span>
                        </div>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Preferred Time Slot */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                      Preferred Time Slot <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#1E60D5] transition shadow-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <Clock className="w-4 h-4 text-[#1E60D5] shrink-0" />
                          <select
                            value={preferredTimeSlot}
                            onChange={(e) => setPreferredTimeSlot(e.target.value)}
                            className="w-full bg-transparent outline-none text-xs sm:text-sm font-bold text-slate-800 cursor-pointer appearance-none pr-6"
                          >
                            <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                            <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                            <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                            <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                            <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                            <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                            <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                            <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                            <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                          </select>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Row 3: Reason / Condition (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-800">
                      Reason / Condition <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      maxLength={250}
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                      placeholder="e.g., back pain, post-surgery rehab, sports injury, etc."
                      className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#1E60D5] transition resize-none placeholder:text-slate-400"
                    />
                    <span className="absolute bottom-2.5 right-3 text-[11px] font-semibold text-slate-400">
                      {conditionNotes.length}/250
                    </span>
                  </div>
                </div>

                {/* Info Disclaimer Banner */}
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs sm:text-[13px] text-slate-700 font-medium">
                  <Info className="w-4.5 h-4.5 text-[#1E60D5] shrink-0" />
                  <span>A physiotherapy expert will be assigned to you based on your condition and availability.</span>
                </div>

              </div>

            </div>

            {/* Right Column: Booking Summary Card (Exact match) */}
            <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-blue-100/90 shadow-2xs space-y-5">
              
              {/* Header */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <ClipboardList className="w-5 h-5 text-[#1E60D5]" />
                <h3 className="text-lg sm:text-xl font-black text-[#0F172A]">
                  Booking Summary
                </h3>
              </div>

              {/* Service Preview Card */}
              <div className="flex items-start gap-3.5">
                <img
                  src={service.image}
                  onError={(e) => { e.currentTarget.src = service.fallback; }}
                  alt={service.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
                />
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-black text-[#0F172A] leading-snug truncate">
                    {service.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#1E60D5] shrink-0" />
                    <span>{sessionType}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#1E60D5] shrink-0" />
                    <span>{formatDateDisplay(preferredDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#1E60D5] shrink-0" />
                    <span>{preferredTimeSlot} (60 mins)</span>
                  </div>
                </div>
              </div>

              {/* Divider & Price Breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
                  <span>Session Fee</span>
                  <span className="font-bold text-slate-900">₹{service.price.toLocaleString('en-IN')}</span>
                </div>

                {/* Highlighted Total Box */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 text-slate-900 border border-blue-100">
                  <span className="text-sm font-bold">Total Payable</span>
                  <span className="text-lg font-black text-[#1E60D5]">
                    ₹{service.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleProceedFromStep1}
                  className="w-full bg-[#1E60D5] hover:bg-[#1850B5] text-white font-bold text-sm sm:text-base py-3.5 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CreditCard className="w-4.5 h-4.5" />
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/physiotherapy')}
                  className="w-full bg-white hover:bg-slate-50 text-[#1E60D5] border-2 border-[#1E60D5] font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Physiotherapy</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PATIENT DETAILS                                                  */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-blue-100/90 shadow-2xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E60D5] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  Patient Information
                </h2>
              </div>

              <form onSubmit={handleProceedFromStep2} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ajayendra Shekhar"
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-[#1E60D5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-[#1E60D5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-[#1E60D5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Gender
                    </label>
                    <div className="flex items-center gap-4 pt-2">
                      {['Male', 'Female', 'Other'].map(g => (
                        <label key={g} className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === g}
                            onChange={() => setGender(g)}
                            className="accent-[#1E60D5]"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {sessionType === 'At-Home Session' ? 'Home Visit Address in Guwahati *' : 'Preferred Center / Landmark'}
                  </label>
                  <textarea
                    rows={2}
                    required={sessionType === 'At-Home Session'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Flat No, Street, Landmark, Area in Guwahati"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-[#1E60D5] resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#1E60D5] text-white font-bold text-xs sm:text-sm hover:bg-[#1850B5] transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Proceed to Review &amp; Pay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Summary Preview */}
            <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-6 border border-blue-100/90 shadow-2xs space-y-4">
              <h3 className="text-base font-black text-[#0F172A] border-b border-slate-100 pb-2">
                Booking Snapshot
              </h3>
              <div className="space-y-2 text-xs font-medium text-slate-600">
                <p><strong>Service:</strong> {service.title}</p>
                <p><strong>Mode:</strong> {sessionType}</p>
                <p><strong>Date &amp; Slot:</strong> {formatDateDisplay(preferredDate)} • {preferredTimeSlot}</p>
                <p className="text-[#1E60D5] font-black text-sm pt-2 border-t border-slate-100">
                  Payable: ₹{service.price}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: REVIEW & PAY                                                     */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-blue-100/90 shadow-2xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E60D5] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  Choose Payment Method
                </h2>
              </div>

              {/* Review Overview */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{patientName} ({mobileNumber})</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-[#1E60D5]">{service.title} ({sessionType})</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Schedule:</span>
                  <span className="font-bold text-slate-900">{formatDateDisplay(preferredDate)} at {preferredTimeSlot}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-slate-900 truncate max-w-xs">{address}</span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('online')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      paymentMode === 'online'
                        ? 'border-[#1E60D5] bg-blue-50/70 ring-1 ring-[#1E60D5]'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <CreditCard className="w-5 h-5 text-[#1E60D5]" />
                      {paymentMode === 'online' && <CheckCircle2 className="w-5 h-5 text-[#1E60D5]" />}
                    </div>
                    <h4 className="text-sm font-black text-[#0F172A]">Pay Online (Razorpay)</h4>
                    <p className="text-xs text-slate-500 font-medium">Instant UPI, Google Pay, PhonePe, Cards, NetBanking</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('clinic')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      paymentMode === 'clinic'
                        ? 'border-[#007A64] bg-teal-50/70 ring-1 ring-[#007A64]'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      {paymentMode === 'clinic' && <CheckCircle2 className="w-5 h-5 text-emerald-600]" />}
                    </div>
                    <h4 className="text-sm font-black text-[#0F172A]">Pay Post-Session</h4>
                    <p className="text-xs text-slate-500 font-medium">Pay via Cash / UPI to the physiotherapist after treatment</p>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalPayment}
                  className="px-6 sm:px-8 py-3 rounded-xl bg-[#1E60D5] hover:bg-[#1850B5] text-white font-black text-sm sm:text-base transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : paymentMode === 'online' ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{service.price} via Razorpay &amp; Confirm</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Booking • ₹{service.price} Post-Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Summary */}
            <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-6 border border-blue-100/90 shadow-2xs space-y-4">
              <h3 className="text-base font-black text-[#0F172A] border-b border-slate-100 pb-2">
                Order Total
              </h3>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>Standard Session Fee</span>
                <span>₹{service.price}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-emerald-600">
                <span>Special Discount</span>
                <span>-₹400 (Applied)</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-slate-900 border border-blue-100 flex items-center justify-between font-black text-base">
                <span>Total Amount</span>
                <span className="text-[#1E60D5]">₹{service.price}</span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: CONFIRMATION RECEIPT                                             */}
        {/* ========================================================================= */}
        {currentStep === 4 && confirmedBooking && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                Physiotherapy Session Confirmed!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Your appointment has been confirmed with ZESTMED Physiotherapy Team.
              </p>
              <div className="inline-block px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                Booking ID: {confirmedBooking.id}
              </div>
            </div>

            {/* Receipt Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Service</span>
                <span className="font-bold text-[#1E60D5]">{confirmedBooking.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Session Mode</span>
                <span className="font-bold text-slate-900">{confirmedBooking.mode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Date &amp; Slot</span>
                <span className="font-bold text-slate-900">{confirmedBooking.date} • {confirmedBooking.time}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Patient</span>
                <span className="font-bold text-slate-900">{confirmedBooking.patientName} ({confirmedBooking.patientPhone})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Therapist / Center</span>
                <span className="font-bold text-slate-900 text-right">{confirmedBooking.hospital}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-[#0F172A]">
                <span>Total Fee</span>
                <span className="text-emerald-700 font-bold">₹{confirmedBooking.fee} ({confirmedBooking.paymentStatus})</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/patient-dashboard')}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition cursor-pointer text-center"
              >
                View in Patient Dashboard
              </button>

              <button
                type="button"
                onClick={() => navigate('/physiotherapy')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1E60D5] hover:bg-[#1850B5] text-white font-bold text-xs sm:text-sm transition cursor-pointer text-center shadow-xs"
              >
                Back to Physiotherapy
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
