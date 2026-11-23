import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Car, CheckCircle2, ShieldCheck, MapPin, Clock, Calendar, 
  User, Phone, Heart, Navigation, Check, AlertCircle, Info 
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
    pickupAddress: `${currentLocation?.city || 'GS Road, Dispur'}, Guwahati`,
    destination: 'Zestmed Central Diagnostics & Polyclinic Hub (GS Road, Guwahati)',
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
    }, 900);
  };

  const handleReset = () => {
    setBookingConfirmed(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-2xl max-h-[92vh] flex flex-col overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008F83] text-white flex items-center justify-center shadow-sm shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Senior Citizen Pick-up & Drop Service
                </h3>
                <span className="text-[10px] font-bold bg-[#008F83] text-white px-2 py-0.5 rounded-full">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Guaranteed within 10 km radius in Guwahati, Assam • Age 60+
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {bookingConfirmed ? (
            /* Confirmed Confirmation Screen */
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Pick-up & Drop Confirmed!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Our dedicated sanitized vehicle and patient care executive have been reserved for {bookingConfirmed.patientName}.
                </p>
              </div>

              {/* Ride Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-medium">Booking Reference</span>
                  <span className="font-mono font-bold text-[#008F83] text-sm">{bookingConfirmed.bookingRef}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="border-t border-slate-200 pt-2.5 space-y-1">
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>From:</strong> {bookingConfirmed.pickupAddress}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <Navigation className="w-4 h-4 text-[#008F83] shrink-0 mt-0.5" />
                    <span><strong>To:</strong> {bookingConfirmed.destination}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-800 rounded-xl p-2.5 text-[11px] font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free service sponsored by Zestmed Senior Care Initiative. Zero charges applicable.</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-[#008F83] hover:bg-[#007a70] text-white font-bold py-3 text-sm rounded-xl transition shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Highlight Banner */}
              <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border border-teal-200 rounded-2xl p-3.5 flex items-center gap-3">
                <Heart className="w-6 h-6 text-[#008F83] fill-[#008F83] shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-700 font-medium leading-relaxed">Available for Senior Citizens (60+) traveling for diagnostic lab tests, doctor consults, or day surgeries in Guwahati.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Senior Citizen's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Patient Age (60+ Years) *</label>
                  <input
                    type="number"
                    min={60}
                    max={110}
                    required
                    value={formData.patientAge}
                    onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Contact Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Emergency Contact</label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="+91 94350 12345"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Purpose of Medical Visit</label>
                <select
                  value={formData.servicePurpose}
                  onChange={(e) => setFormData({ ...formData, servicePurpose: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none bg-white font-medium"
                >
                  <option value="Lab Test & Diagnostics">Lab Test & Diagnostics (Same-Day Report Center)</option>
                  <option value="Doctor Consultation">Specialist Doctor Consultation</option>
                  <option value="Physiotherapy Rehabilitation">Physiotherapy Rehabilitation Session</option>
                  <option value="Daycare Surgery Admission">Daycare Surgery Admission / Cataract Checkup</option>
                  <option value="Wellness Comprehensive Package">Senior Citizen Wellness Package Checkup</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Pick-up Address in Guwahati *</label>
                  <input
                    type="text"
                    required
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    placeholder="e.g. House 14, Rajgarh Road, Guwahati"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    ✓ Verified within 10 km service radius in Guwahati
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Destination Center</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Pick-up Time *</label>
                  <select
                    value={formData.pickupTime}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none bg-white font-medium"
                  >
                    <option value="07:30 AM">07:30 AM (Fasting blood collection)</option>
                    <option value="08:30 AM">08:30 AM (Morning diagnostics)</option>
                    <option value="10:00 AM">10:00 AM (OPD Doctor consult)</option>
                    <option value="11:30 AM">11:30 AM (Physiotherapy rehab)</option>
                    <option value="02:30 PM">02:30 PM (Afternoon consult)</option>
                    <option value="04:30 PM">04:30 PM (Evening clinic slot)</option>
                  </select>
                </div>
              </div>

              {/* Assistance Options */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.wheelchairAssistance}
                    onChange={(e) => setFormData({ ...formData, wheelchairAssistance: e.target.checked })}
                    className="w-4 h-4 text-[#008F83] rounded focus:ring-[#008F83]"
                  />
                  <span>Wheelchair-accessible vehicle & ramp assistance requested</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.careAssistantRequired}
                    onChange={(e) => setFormData({ ...formData, careAssistantRequired: e.target.checked })}
                    className="w-4 h-4 text-[#008F83] rounded focus:ring-[#008F83]"
                  />
                  <span>Dedicated Zestmed Care Companion to accompany inside center</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#008F83] hover:bg-[#007a70] text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-75"
                >
                  <Car className="w-4 h-4" />
                  <span>{isSubmitting ? 'Reserving Dedicated Vehicle...' : 'Book Free Pick-up & Drop Service'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
