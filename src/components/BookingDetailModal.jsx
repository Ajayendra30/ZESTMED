import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, Phone, User, CheckCircle2, 
  AlertCircle, Stethoscope, Activity, Scissors, Package, 
  FlaskConical, ShoppingCart, Copy, Check, ShieldCheck, 
  CreditCard, FileText, Download, AlertTriangle, ArrowRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function BookingDetailModal({ booking, isOpen, onClose, onCancelBooking, onMarkUpiPaid }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  if (!isOpen || !booking) return null;

  const handleCopyId = (e) => {
    e.stopPropagation();
    const idToCopy = booking.bookingId || booking.id || '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      addToast(`Booking ID ${idToCopy} copied to clipboard!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isDoctor = booking.itemType === 'doctor';
  const isPhysio = booking.itemType === 'physiotherapy';
  const isSurgery = booking.itemType === 'surgery';
  const isWellness = booking.itemType === 'wellness';
  const isMedicine = booking.itemType === 'medicine';
  const isLab = booking.itemType === 'lab' || (!isDoctor && !isPhysio && !isSurgery && !isWellness && !isMedicine);

  const IconComp = isDoctor
    ? Stethoscope
    : isPhysio
    ? Activity
    : isSurgery
    ? Scissors
    : isWellness
    ? Package
    : isMedicine
    ? ShoppingCart
    : FlaskConical;

  const badgeTheme = isDoctor
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : isPhysio
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isSurgery
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : isWellness
    ? 'bg-teal-50 text-teal-700 border-teal-200'
    : isMedicine
    ? 'bg-sky-50 text-sky-700 border-sky-200'
    : 'bg-teal-50 text-teal-700 border-teal-200';

  const statusLower = (booking.bookingStatus || booking.status || 'Confirmed').toLowerCase();
  const isCancelled = statusLower.includes('cancel');
  const isCompleted = statusLower.includes('complete') || statusLower.includes('deliver') || statusLower.includes('report');
  const isPending = statusLower.includes('pending') || statusLower.includes('process');

  const statusBadge = isCancelled
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isCompleted
    ? 'bg-purple-50 text-purple-700 border-purple-200'
    : isPending
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const formattedBookingDateTime = booking.bookingDateTime
    ? new Date(booking.bookingDateTime).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : booking.createdAt
    ? new Date(booking.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recently Booked';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/70 via-slate-50/50 to-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${badgeTheme}`}>
              <IconComp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#0F1E36]">
                  {booking.serviceType || 'Booking Details'}
                </h3>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
                  {booking.bookingStatus || booking.status || 'Confirmed'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-mono font-bold text-slate-500">
                  ID: {booking.bookingId || booking.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-slate-400 hover:text-[#007A64] transition p-0.5 rounded cursor-pointer"
                  title="Copy Booking ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Main Service Card */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Service Booked
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#0F1E36] leading-snug">
                  {booking.serviceName || booking.title}
                </h4>
                {booking.department && (
                  <p className="text-xs font-bold text-[#007A64] mt-0.5">
                    Specialty / Department: {booking.department}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Total Amount
                </span>
                <p className="text-lg sm:text-xl font-black text-[#0F1E36]">
                  ₹{Number(booking.totalAmount || booking.price || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Provider or Doctor Info */}
            {booking.provider && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs font-medium text-slate-600">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {isDoctor ? 'Doctor' : isPhysio ? 'Therapist' : isSurgery ? 'Lead Surgeon' : isLab ? 'Phlebotomist' : 'Provider'}: <strong className="text-slate-800">{booking.provider}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* 1. Appointment / Service Date */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
                Appointment Date
              </span>
              <p className="text-sm font-extrabold text-[#0F1E36]">
                {booking.appointmentDate || booking.date || 'Scheduled Date'}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {booking.appointmentTime || booking.time || 'Standard Slot'}
              </p>
            </div>

            {/* 2. Service / Consultation Mode */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#007A64]" />
                Service Mode & Location
              </span>
              <p className="text-sm font-extrabold text-[#0F1E36]">
                {booking.mode || 'Clinic Visit / Home Collection'}
              </p>
              <p className="text-xs text-slate-500 font-medium truncate">
                {booking.location || booking.collectionAddress || booking.deliveryAddress || booking.hospital || 'Guwahati Hub'}
              </p>
            </div>

            {/* 3. Booking Placed Timestamp */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#007A64]" />
                Booking Date & Time
              </span>
              <p className="text-sm font-extrabold text-[#0F1E36]">
                {formattedBookingDateTime}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Recorded in ZESTMED Database
              </p>
            </div>

            {/* 4. Payment Status */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#007A64]" />
                Payment & Transaction Details
              </span>
              <p className="text-sm font-extrabold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{booking.paymentStatus || 'Paid (Verified)'}</span>
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Amount: ₹{Number(booking.totalAmount || booking.price || 0).toLocaleString('en-IN')}
              </p>
              {(booking.paymentId || booking.razorpayPaymentId || booking.razorpay_payment_id) && (
                <div className="pt-1.5 mt-1.5 border-t border-slate-100 space-y-0.5 text-[11px] font-mono">
                  <div className="text-slate-600">
                    <span className="text-slate-400 font-sans font-medium">Razorpay Payment ID: </span>
                    <strong className="text-teal-700">{booking.paymentId || booking.razorpayPaymentId || booking.razorpay_payment_id}</strong>
                  </div>
                  {(booking.orderId || booking.razorpayOrderId || booking.razorpay_order_id) && (
                    <div className="text-slate-600">
                      <span className="text-slate-400 font-sans font-medium">Order ID: </span>
                      <strong className="text-slate-700">{booking.orderId || booking.razorpayOrderId || booking.razorpay_order_id}</strong>
                    </div>
                  )}
                </div>
              )}

              {((booking.paymentStatus || '').toLowerCase().includes('clinic') || (booking.paymentStatus || '').toLowerCase().includes('post-session') || (booking.paymentStatus || '').toLowerCase().includes('collection')) && !isCancelled && (
                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">Paid via UPI / Razorpay?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onMarkUpiPaid) onMarkUpiPaid(booking);
                      onClose();
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify as Paid (UPI)</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Patient / Beneficiary Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#007A64]" />
              Patient Information
            </h5>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-extrabold text-slate-900 text-sm">
                  {(!booking.patientName || booking.patientName === 'Rahul Verma') ? 'Self' : booking.patientName}
                </p>
                <p className="text-slate-500 font-medium mt-0.5">
                  Phone: <strong className="text-slate-700">{booking.phone || booking.patientPhone || 'Not Specified'}</strong>
                </p>
              </div>
            </div>

            {booking.notes && (
              <div className="pt-2 mt-2 border-t border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Notes / Symptoms:</span> {booking.notes}
              </div>
            )}
          </div>

          {/* Medicine Items List if Order */}
          {isMedicine && Array.isArray(booking.items) && booking.items.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-[#007A64]" />
                Prescription Items ({booking.items.length})
              </h5>
              <div className="divide-y divide-slate-100">
                {booking.items.map((item, idx) => (
                  <div key={item.id || idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-400">{item.dosage || 'Standard Pack'} • Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="font-extrabold text-slate-800">
                      ₹{item.price ? item.price * (item.quantity || 1) : '--'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation Box for Cancellation */}
          {isConfirmingCancel && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-black text-rose-900 text-sm">Cancel this booking?</h6>
                  <p className="text-rose-700 mt-0.5">
                    Are you sure you want to cancel this booking? If you made an online prepayment, your refund will be credited to your original payment method within 3–5 working days.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirmingCancel(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmingCancel(false);
                    onCancelBooking && onCancelBooking(booking.bookingId || booking.id);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold transition shadow-xs"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div>
            {!isCancelled && !isCompleted && !isConfirmingCancel && (
              <button
                type="button"
                onClick={() => setIsConfirmingCancel(true)}
                className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition cursor-pointer"
              >
                Cancel Booking
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                addToast('Connecting to ZESTMED 24/7 Patient Care Desk: +91 92791 25091 (Guwahati)', 'info');
              }}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Need Help?
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white text-xs font-extrabold transition shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
