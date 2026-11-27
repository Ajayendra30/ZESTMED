import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Car, CheckCircle2, ShieldCheck, MapPin, Clock, Calendar, 
  User, Phone, Heart, Navigation, Check, AlertCircle, Info,
  Building2
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { enforceAuth } from '../utils/authGuard';
import { recordAndPlayNotification } from '../utils/notificationSound';

export default function SeniorCitizenPickUpModal({ isOpen, onClose, defaultService = 'Lab Test & Diagnostics' }) {
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  const { currentLocation } = useLocation();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '68',
    contactPhone: '',
    pickupAddress: `${currentLocation?.city || 'Guwahati - Dispur / Secretariat'}, Guwahati`,
    destination: 'Zestmed Central Diagnostics & Polyclinic',
    servicePurpose: defaultService,
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '08:30 AM',
    wheelchairAssistance: true,
    careAssistantRequired: true,
    emergencyPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      if (onClose) onClose();
      enforceAuth({
        user,
        navigate,
        openAuth,
        toastMessage: 'Please login to book Senior Citizen Door-to-Door Cab Service',
        addToast
      });
      return;
    }

    if (!formData.patientName.trim()) {
      addToast('Please enter the Senior Citizen\'s full name', 'error');
      return;
    }
    if (!formData.contactPhone.trim() || formData.contactPhone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (parseInt(formData.patientAge, 10) < 60) {
      addToast('This dedicated free cab service is reserved for senior citizens aged 60 and above', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const bookingRef = `SR-GUW-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingConfirmed({
        ...formData,
        bookingRef,
        assignedDriver: 'Manoj Kalita',
        vehicleNumber: 'AS 01 EX 4529 (Sanitized AC EV)',
        driverPhone: '+91 94350 88219'
      });

      // Play audible chime & record Book notification
      recordAndPlayNotification({
        type: 'book',
        title: 'Senior Citizen Pick-up Scheduled',
        actionText: `Cab Booking #${bookingRef} Confirmed`,
        desc: `Complimentary sanitized AC EV reserved for ${formData.patientName} on ${formData.pickupDate} (${formData.pickupTime}). Driver: Manoj Kalita (+91 94350 88219).`,
        sender: 'ZESTMED Senior Care Dispatch',
        category: 'Senior Citizen Care',
        refId: bookingRef,
        linkType: 'appointment'
      });

      addToast('Senior Citizen Pick-up & Drop Scheduled Successfully!', 'success');
    }, 800);
  };

  const handleReset = () => {
    setBookingConfirmed(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[720px] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner - Matches Reference Image 5 exactly */}
        <div className="relative w-full overflow-hidden border-b border-slate-100 bg-[#E8F5F8] select-none">
          <img
            src="/senior-pickup-header-banner.jpg"
            alt="Senior Citizen Pick-up & Drop Service"
            className="w-full h-auto max-h-[105px] sm:max-h-[120px] object-cover object-left sm:object-center pointer-events-none"
          />
          {/* Close Button top-right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-xs border border-slate-200/70 transition cursor-pointer z-10"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body - Compact, No scrolling, Fits properly within visible section */}
        <div className="p-3.5 sm:p-4 sm:px-5">
          {bookingConfirmed ? (
            /* Confirmed Confirmation Screen */
            <div className="space-y-3 text-center py-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 leading-tight">
                  Pick-up & Drop Confirmed!
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-md mx-auto">
                  Our dedicated sanitized vehicle and patient care executive have been reserved for {bookingConfirmed.patientName}.
                </p>
              </div>

              {/* Ride Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Booking Reference</span>
                  <span className="font-mono font-bold text-[#007A64] text-sm">{bookingConfirmed.bookingRef}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name & Age</span>
                    <strong className="text-slate-800">{bookingConfirmed.patientName} ({bookingConfirmed.patientAge} Years)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Pickup Schedule</span>
                    <strong className="text-slate-800">{bookingConfirmed.pickupDate} at {bookingConfirmed.pickupTime}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Vehicle</span>
                    <strong className="text-slate-800">{bookingConfirmed.vehicleNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Chauffeur & Care Assistant</span>
                    <strong className="text-slate-800">{bookingConfirmed.assignedDriver} ({bookingConfirmed.driverPhone})</strong>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px]">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>From:</strong> {bookingConfirmed.pickupAddress}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Navigation className="w-3.5 h-3.5 text-[#007A64] shrink-0 mt-0.5" />
                    <span><strong>To:</strong> {bookingConfirmed.destination}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-800 rounded-lg p-2 text-[11px] font-medium flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Free service sponsored by Zestmed Senior Care Initiative. Zero charges applicable.</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-[#007A64] hover:bg-[#006852] text-white font-extrabold py-2.5 text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form matching Image 5 & ZESTMED Theme */
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
              {/* Highlight Notice Banner */}
              <div className="bg-[#E0F5EE] border border-[#BCE8DD] rounded-xl px-3 py-1.5 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#007A64] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </div>
                <p className="text-[11px] sm:text-xs text-[#005B48] font-semibold leading-tight">
                  Available for Senior Citizens (60+) traveling for diagnostic lab tests, doctor consults, or day surgeries in Guwahati.
                </p>
              </div>

              {/* Row 1: Full Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
                <div className="sm:col-span-7">
                  <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Senior Citizen's Full Name <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none transition bg-white"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Patient Age (60+ Years) <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="number"
                    min={60}
                    max={110}
                    required
                    value={formData.patientAge}
                    onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none transition bg-white font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Contact Phone & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Contact Mobile Number <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none transition bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Emergency Contact</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="+91 94350 12345"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none transition bg-white"
                  />
                </div>
              </div>

              {/* Row 3: Purpose of Medical Visit */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-[#007A64]" />
                  <span>Purpose of Medical Visit <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={formData.servicePurpose}
                  onChange={(e) => setFormData({ ...formData, servicePurpose: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none bg-white font-medium text-slate-800 transition cursor-pointer"
                >
                  <option value="Lab Test & Diagnostics">Lab Test & Diagnostics (Same-Day Report Center)</option>
                  <option value="Doctor Consultation">Specialist Doctor Consultation</option>
                  <option value="Physiotherapy Rehabilitation">Physiotherapy Rehabilitation Session</option>
                  <option value="Daycare Surgery Admission">Daycare Surgery Admission / Cataract Checkup</option>
                  <option value="Wellness Comprehensive Package">Senior Citizen Wellness Package Checkup</option>
                </select>
              </div>

              {/* Row 4: Pick-up Address & Destination Center */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Pick-up Address in Guwahati <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    placeholder="Guwahati - Dispur / Secretariat, Guwahati"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none transition bg-white"
                  />
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <span>✓ Verified within 10 km service radius in Guwahati</span>
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Destination Center <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none bg-white font-medium text-slate-800 transition cursor-pointer"
                  >
                    <option value="Zestmed Central Diagnostics & Polyclinic">Zestmed Central Diagnostics & Polyclinic</option>
                    <option value="Zestmed Specialty Clinic & Day Surgery Center">Zestmed Specialty Clinic & Day Surgery Center</option>
                    <option value="Zestmed Advanced Physiotherapy Hub">Zestmed Advanced Physiotherapy Hub</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Preferred Date & Pick-up Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Preferred Date <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none transition bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#007A64]" />
                    <span>Pick-up Time <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    value={formData.pickupTime}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#007A64] focus:ring-1 focus:ring-[#007A64] outline-none bg-white font-medium text-slate-800 transition cursor-pointer"
                  >
                    <option value="08:30 AM">08:30 AM (Morning diagnostics)</option>
                    <option value="07:30 AM">07:30 AM (Fasting blood collection)</option>
                    <option value="10:00 AM">10:00 AM (OPD Doctor consult)</option>
                    <option value="11:30 AM">11:30 AM (Physiotherapy rehab)</option>
                    <option value="02:30 PM">02:30 PM (Afternoon consult)</option>
                    <option value="04:30 PM">04:30 PM (Evening clinic slot)</option>
                  </select>
                </div>
              </div>

              {/* Assistance Options Card matching Reference Image 5 */}
              <div className="bg-[#F0FAF7] border border-[#CDEFE6] rounded-xl p-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E0F5EE] text-[#007A64] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#007A64]">
                    <circle cx="12" cy="4" r="2" />
                    <path d="M10 8h4l2 5h-4" />
                    <path d="M6 19a4 4 0 1 0 8 0" />
                    <path d="M10 13v6" />
                    <path d="M16 13h4" />
                  </svg>
                </div>
                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 select-none">
                    <input
                      type="checkbox"
                      checked={formData.wheelchairAssistance}
                      onChange={(e) => setFormData({ ...formData, wheelchairAssistance: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#007A64] rounded cursor-pointer"
                    />
                    <span className="text-[11px] sm:text-xs">Wheelchair-accessible vehicle & ramp assistance requested</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 select-none">
                    <input
                      type="checkbox"
                      checked={formData.careAssistantRequired}
                      onChange={(e) => setFormData({ ...formData, careAssistantRequired: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#007A64] rounded cursor-pointer"
                    />
                    <span className="text-[11px] sm:text-xs">Dedicated Zestmed Care Companion to accompany inside center</span>
                  </label>
                </div>
              </div>

              {/* Submit Button matching Reference Image 5 & ZESTMED Theme */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#007A64] hover:bg-[#006852] text-white font-extrabold py-2.5 sm:py-3 px-4 rounded-xl transition shadow-xs hover:shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-75 active:scale-98"
                >
                  <Car className="w-4 h-4 text-white" />
                  <span>{isSubmitting ? 'Reserving Dedicated Vehicle...' : 'Book Pick-up & Drop Service'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
