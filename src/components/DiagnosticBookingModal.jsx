import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLocation, DEFAULT_LOCATIONS } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { bookLabTest, bookWellness } from '../services/supabaseService';
import { enforceAuth } from '../utils/authGuard';
import { isWellnessPackage } from '../utils/itemClassification';
import { launchRazorpayCheckout } from '../services/razorpayClient';
import { recordAndPlayNotification } from '../utils/notificationSound';
import { 
  X, Calendar, Clock, MapPin, User, CheckCircle2, 
  FlaskConical, ShieldCheck, ArrowRight, ArrowLeft, 
  Droplets, AlertCircle, CreditCard, Banknote, Lock 
} from 'lucide-react';

export default function DiagnosticBookingModal({ item, type = 'diagnostic', onClose }) {
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { currentLocation } = useLocation();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [paymentMode, setPaymentMode] = useState('razorpay'); // 'razorpay' or 'collection'
  const [verifiedPaymentData, setVerifiedPaymentData] = useState(null);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(user?.age || '');
  const [patientGender, setPatientGender] = useState(user?.gender || 'Male');
  const [contactNumber, setContactNumber] = useState(user?.contact || user?.phone || '');
  const [district, setDistrict] = useState(currentLocation.city || 'Guwahati');
  const [pincode, setPincode] = useState(currentLocation.pincode || '781001');
  const [address, setAddress] = useState(user?.address || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('07:00 AM - 08:00 AM (Fasting)');

  useEffect(() => {
    if (user) {
      if (!contactNumber && (user.contact || user.phone)) setContactNumber(user.contact || user.phone);
      if (!patientAge && user.age) setPatientAge(user.age);
      if (!address && user.address) setAddress(user.address);
    }
  }, [user]);

  if (!item) return null;

  const timeSlots = [
    '06:00 AM - 07:00 AM (Early Fasting)',
    '07:00 AM - 08:00 AM (Fasting)',
    '08:00 AM - 09:00 AM (Fasting)',
    '09:00 AM - 10:30 AM (Regular)',
    '04:00 PM - 06:00 PM (Evening Non-Fasting)',
  ];

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!patientName.trim() || !contactNumber || contactNumber.length < 10) {
      addToast('Please enter complete patient name and 10-digit mobile number', 'error');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      addToast('Please provide your complete address in Assam', 'error');
      return;
    }
    setStep(3);
  };

  const saveCompletedBooking = async (generatedRef, paymentDetails = null) => {
    const isPkg = isWellnessPackage(item);
    const pid = paymentDetails?.paymentId || paymentDetails?.razorpay_payment_id || paymentDetails?.transaction_id || paymentDetails?.id;
    const isPaidOnline = Boolean(paymentDetails && pid && pid !== 'PAY_ON_COLLECTION');
    const newLabBooking = {
      id: generatedRef,
      bookingId: generatedRef,
      booking_number: generatedRef,
      type: isPkg ? 'Wellness Package' : 'Diagnostic Lab Test',
      itemType: isPkg ? 'wellness' : 'lab',
      serviceType: isPkg ? 'Wellness Package' : 'Diagnostic Lab Test',
      displayType: isPkg ? 'Wellness Health Package' : 'Diagnostic Lab Test',
      category: isPkg ? 'Wellness Package' : (item.category || 'Diagnostic Test'),
      testName: item.name,
      testCode: item.testCode || (isPkg ? 'WEL-PKG' : `DX-${Math.floor(100 + Math.random() * 900)}`),
      bookedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      collectionDate: `${selectedDate}, ${selectedSlot.split(' ')[0]} ${selectedSlot.split(' ')[1] || 'AM'}`,
      date: selectedDate,
      time: selectedSlot,
      patientName: `${patientName || user?.name || 'Self'} (${patientGender}, ${patientAge ? patientAge + 'y' : 'Adult'})`,
      phone: contactNumber || user?.phone || user?.contact || '',
      patientPhone: contactNumber || user?.phone || user?.contact || '',
      userId: user?.id || null,
      userEmail: user?.email || '',
      status: 'Confirmed',
      paymentStatus: isPaidOnline ? 'Paid (UPI / Razorpay Verified)' : 'Pay on Collection',
      paymentMethod: isPaidOnline ? (paymentDetails?.paymentMethod || 'Razorpay (UPI - Verified)') : 'Pay on Sample Collection',
      paymentId: pid && pid !== 'PAY_ON_COLLECTION' ? pid : '',
      orderId: paymentDetails?.orderId || paymentDetails?.razorpay_order_id || '',
      specimen: item.specimen || 'Blood / Serum Sample (NABL Barcoded)',
      collectionAddress: `${address || 'GS Road'}, ${district}, Assam - ${pincode}`,
      phlebotomist: {
        name: 'Bikash Das',
        id: 'ZM-PHL-AS-14',
        phone: '+91 92791 25091',
        vaccinated: true
      },
      reportingDoctor: 'Dr. Pranabesh Sarma, MD Pathology (Reg No. AMC-29182-AS)',
      price: item.price || 499,
      totalAmount: item.price || 499,
      parametersSummary: `${item.name} - Home Sample Collection Booked`,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('zestmed_patient_lab_bookings') || '[]');
      const filtered = existing.filter(b => b.id !== generatedRef && b.bookingId !== generatedRef);
      localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify([newLabBooking, ...filtered]));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

      // Play audible notification chime & record Book notification
      try {
        recordAndPlayNotification({
          type: 'book',
          title: isPkg ? 'Wellness Package Confirmed' : 'Diagnostic Test Confirmed',
          actionText: `Booking #${generatedRef} Confirmed`,
          desc: `Home collection confirmed for ${item.name}.`,
          sender: isPkg ? 'Zestmed Preventive Health Team' : 'Dispur Central Pathology Lab',
          category: isPkg ? 'Wellness Package' : 'Diagnostic Lab Test',
          refId: generatedRef,
          linkType: isPkg ? 'wellness' : 'lab',
          phone: newLabBooking.phone,
          patientPhone: newLabBooking.phone,
          patientName: newLabBooking.patientName
        });
      } catch (notifyErr) {
        console.warn('Audio/Notification record ignored:', notifyErr);
      }

      // Save to Supabase PostgreSQL database
      if (isPkg) {
        await bookWellness(newLabBooking);
      } else {
        await bookLabTest(newLabBooking);
      }
    } catch (err) {
      console.warn('Failed to sync lab booking with database:', err);
    }

    setBookingRef(generatedRef);
    setVerifiedPaymentData(paymentDetails);
    setIsSubmitting(false);
    setStep(4);
    addToast('Diagnostic appointment confirmed successfully!', 'success');
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!user) {
      if (onClose) onClose();
      enforceAuth({
        user,
        navigate,
        openAuth,
        toastMessage: 'Please login to book a lab test',
        addToast
      });
      return;
    }

    const generatedRef = `ASM-DX-${pincode}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (paymentMode === 'razorpay') {
      setIsSubmitting(true);
      launchRazorpayCheckout({
        amount: item.price || 499,
        bookingId: generatedRef,
        bookingType: 'lab_test',
        serviceTitle: item.name,
        customer: {
          name: patientName || user?.name || 'Patient',
          phone: contactNumber || user?.phone || '',
          email: user?.email || 'patient@zestmed.in'
        },
        onSuccess: (verifiedTxn) => {
          saveCompletedBooking(generatedRef, verifiedTxn);
        },
        onFailure: (err) => {
          setIsSubmitting(false);
          addToast(err?.message || 'Razorpay payment was not completed.', 'error');
        },
        onDismiss: () => {
          setIsSubmitting(false);
          addToast('Payment cancelled. You can change payment method to Pay on Collection.', 'info');
        }
      });
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        saveCompletedBooking(generatedRef, { paymentId: 'PAY_ON_COLLECTION' });
      }, 400);
    }
  };

  const handleClose = () => {
    setStep(1);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-dropdown border border-border w-full max-w-lg overflow-hidden animate-scale-up max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-brand flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-teal-brand" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark">Schedule Lab Appointment</h3>
              <p className="text-xs text-muted">Doorstep sample collection across Assam</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Test Summary Strip */}
        <div className="bg-primary-50/70 border-b border-primary/20 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="truncate pr-2">
            <span className="font-semibold text-dark truncate block">{item.name}</span>
            <span className="text-[11px] text-primary">
              {item.parametersCount ? `${item.parametersCount} Parameters Included` : `${item.testsCount} Tests Package`}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-dark">₹{item.price.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-600 block font-semibold">Free Pickup</span>
          </div>
        </div>

        {/* Step Progress Indicators */}
        {step < 4 && (
          <div className="px-6 pt-3 pb-1 border-b border-border/60 flex items-center justify-between text-[11px] text-muted">
            <span className={step >= 1 ? 'font-bold text-primary' : ''}>1. Patient Details</span>
            <span>→</span>
            <span className={step >= 2 ? 'font-bold text-primary' : ''}>2. Assam Address</span>
            <span>→</span>
            <span className={step >= 3 ? 'font-bold text-primary' : ''}>3. Date & Slot</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-dark block mb-1">Patient Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-dark block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-dark block mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-dark block mb-1">Mobile Contact (for SMS Reports)</label>
                <div className="relative">
                  <span className="text-muted absolute left-3 top-1/2 -translate-y-1/2 font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="92791 25091"
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Continue to Address</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-dark block mb-1">Assam District</label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    const match = DEFAULT_LOCATIONS.find(l => l.city === e.target.value);
                    if (match) setPincode(match.pincode);
                  }}
                  className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                >
                  {DEFAULT_LOCATIONS.map((loc) => (
                    <option key={loc.pincode} value={loc.city}>
                      {loc.city} ({loc.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-dark block mb-1">Postal PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none font-bold text-dark"
                />
              </div>

              <div>
                <label className="font-semibold text-dark block mb-1">Home / Office Address</label>
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat No., Road / Lane, Landmark..."
                  className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <span>Select Date & Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-dark block mb-1">Preferred Sample Collection Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-dark block mb-1">Morning Collection Slot</label>
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <label
                      key={slot}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                        selectedSlot === slot
                          ? 'border-primary bg-primary-50 text-primary font-bold'
                          : 'border-border hover:bg-surface text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot}</span>
                      </div>
                      <input
                        type="radio"
                        name="slot"
                        checked={selectedSlot === slot}
                        onChange={() => setSelectedSlot(slot)}
                        className="text-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-dark block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setPaymentMode('razorpay')}
                    className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-1 text-left ${
                      paymentMode === 'razorpay'
                        ? 'border-[#007A64] bg-[#E6F7F2]/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#007A64] flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Online</span>
                      </span>
                      <span className="text-[9px] bg-[#007A64] text-white px-1 rounded font-bold">Razorpay</span>
                    </div>
                    <div className="text-[11px] text-slate-500">UPI, Cards, NetBanking</div>
                  </div>

                  <div
                    onClick={() => setPaymentMode('collection')}
                    className={`p-2.5 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-1 text-left ${
                      paymentMode === 'collection'
                        ? 'border-[#007A64] bg-[#E6F7F2]/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Pay on Visit</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Cash / UPI on collection</div>
                  </div>
                </div>
              </div>

              {item.fastingRequired && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Fasting Advisory:</strong> This diagnostic test requires 10-12 hours of overnight fasting. Only plain water is permitted before morning blood collection.
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span>Processing with Razorpay...</span>
                  ) : paymentMode === 'razorpay' ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pay ₹{item.price.toFixed(2)} via Razorpay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Confirm Booking (Pay on Visit)</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-bold text-dark">Appointment Confirmed!</h4>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-dark">{patientName}</strong>! Your doorstep sample collection appointment has been registered in our Assam diagnostic queue.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 text-left space-y-1.5">
                <div className="font-bold border-b border-emerald-200/60 pb-1 flex justify-between">
                  <span>Assam Booking Slip</span>
                  <span className="text-[10px] text-emerald-700">{bookingRef}</span>
                </div>
                <div>• Service: <strong>{item.name}</strong></div>
                <div>• Patient: {patientName} ({patientAge} Yrs, {patientGender})</div>
                <div>• Date & Slot: <strong>{selectedDate} • {selectedSlot}</strong></div>
                <div>• Location: {district}, Assam ({pincode})</div>
                <div>• Address: {address}</div>
                <div>
                  • Payment Status: {' '}
                  <strong className={verifiedPaymentData?.paymentId && verifiedPaymentData.paymentId !== 'PAY_ON_COLLECTION' ? 'text-emerald-700' : 'text-amber-800'}>
                    {verifiedPaymentData?.paymentId && verifiedPaymentData.paymentId !== 'PAY_ON_COLLECTION' 
                      ? `Paid via Razorpay (ID: ${verifiedPaymentData.paymentId})` 
                      : `Pay on Collection (₹${item.price.toFixed(2)})`}
                  </strong>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-border text-[11px] text-slate-600 text-left space-y-1">
                <div className="font-semibold text-dark">Phlebotomist Preparation:</div>
                <div>• A certified phlebotomist from our {district} service hub will arrive with sterile sealed needles.</div>
                <div>• You will receive SMS live arrival tracking 30 minutes before arrival.</div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    navigate('/patient-dashboard');
                  }}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 text-[#008F83] border border-[#008F83] rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  View in Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 btn-primary py-2.5 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close & View In Cart
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-border bg-surface flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-brand" />
            <span>NABL Standards Demo Protocol</span>
          </div>
          <span>Digital Reports within 24h</span>
        </div>
      </div>
    </div>
  );
}
