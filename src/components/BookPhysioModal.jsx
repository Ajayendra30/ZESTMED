import React, { useState } from 'react';
import { 
  X, Activity, Star, Calendar, Clock, MapPin, Home, 
  CheckCircle2, ShieldCheck, User, Phone, Check, 
  ArrowRight, Heart, Sparkles, Car 
} from 'lucide-react';
import { MOCK_PHYSIOTHERAPISTS, PHYSIO_CONDITIONS } from '../mock-data/physioData';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';

export default function BookPhysioModal({ isOpen, onClose, onOpenSeniorPickup }) {
  const { addToast } = useToast();
  const { currentLocation } = useLocation();

  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [selectedPhysio, setSelectedPhysio] = useState(null);
  const [serviceType, setServiceType] = useState('Home Visit');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionSlot, setSessionSlot] = useState('10:00 AM - 11:00 AM');
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    phone: '',
    age: '',
    address: `${currentLocation?.city || 'Dispur'}, Guwahati`,
    conditionNotes: ''
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredPhysios = MOCK_PHYSIOTHERAPISTS.filter((p) => {
    if (selectedCondition === 'All Conditions') return true;
    return p.specialty.toLowerCase().includes(selectedCondition.toLowerCase()) || 
      selectedCondition.toLowerCase().includes(p.specialty.toLowerCase());
  });

  const handleSelectPhysio = (p) => {
    setSelectedPhysio(p);
    setBookingConfirmed(null);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!patientDetails.name.trim()) {
      addToast('Please enter patient name', 'error');
      return;
    }
    if (!patientDetails.phone.trim() || patientDetails.phone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const bookingRef = `ZM-PT-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingConfirmed({
        bookingRef,
        physio: selectedPhysio,
        serviceType,
        date: sessionDate,
        slot: sessionSlot,
        patient: patientDetails,
        fee: selectedPhysio.sessionFee
      });
      addToast(`Physiotherapy session scheduled with ${selectedPhysio.name}!`, 'success');
    }, 800);
  };

  const handleReset = () => {
    setSelectedPhysio(null);
    setBookingConfirmed(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-3xl max-h-[92vh] flex flex-col overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-teal-50 to-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008F83] text-white flex items-center justify-center shadow-sm shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Book Licensed Physiotherapist
                </h3>
                <span className="text-[10px] font-bold bg-[#008F83] text-white px-2 py-0.5 rounded-full">
                  Home Visit in Guwahati
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Senior citizen mobility, post-op rehab, and pain therapy at your doorstep
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

        {/* Modal Body */}
        <div className="p-6">
          {bookingConfirmed ? (
            /* Confirmed View */
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Physiotherapy Session Confirmed!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  {bookingConfirmed.physio.name} has been assigned for your session in Guwahati. Portable clinical equipment will be brought to your location.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-medium">Booking ID</span>
                  <span className="font-mono font-bold text-[#008F83] text-sm">{bookingConfirmed.bookingRef}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Physiotherapist</span>
                    <strong className="text-slate-800">{bookingConfirmed.physio.name}</strong>
                    <span className="text-slate-500 block text-[11px]">{bookingConfirmed.physio.degree}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Service Mode & Slot</span>
                    <strong className="text-slate-800">{bookingConfirmed.date} • {bookingConfirmed.slot}</strong>
                    <span className="text-[#008F83] block text-[11px] font-semibold">{bookingConfirmed.serviceType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name & Phone</span>
                    <strong className="text-slate-800">{bookingConfirmed.patient.name} ({bookingConfirmed.patient.age || 'Adult'})</strong>
                    <span className="text-slate-500 block text-[11px]">{bookingConfirmed.patient.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Service Address</span>
                    <strong className="text-slate-800">{bookingConfirmed.patient.address}</strong>
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 text-[11px] text-teal-800">
                  <strong>Equipment Provided:</strong> {bookingConfirmed.physio.equipmentProvided}
                </div>

                <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Session Fee</span>
                    <span className="text-base font-black text-slate-900">₹{bookingConfirmed.fee}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                    Pay Post Session / Online UPI Active
                  </span>
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
          ) : selectedPhysio ? (
            /* Selected Physio Booking Form */
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedPhysio(null)}
                className="text-xs text-[#008F83] font-bold hover:underline flex items-center gap-1 mb-2"
              >
                ← Back to Physiotherapists List
              </button>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={selectedPhysio.avatar}
                  alt={selectedPhysio.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{selectedPhysio.name}</h4>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                      {selectedPhysio.specialty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{selectedPhysio.degree} • {selectedPhysio.experience}</p>
                  <p className="text-xs text-slate-700 mt-1">
                    <strong>Guwahati Hubs:</strong> {selectedPhysio.locations}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-bold text-amber-600">{selectedPhysio.rating}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-black text-slate-900">₹{selectedPhysio.sessionFee} / Session</span>
                  </div>
                </div>
              </div>

              {/* Service Type Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Session Location Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setServiceType('Home Visit')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      serviceType === 'Home Visit'
                        ? 'border-[#008F83] bg-teal-50 text-[#008F83]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Home Visit (Anywhere in Guwahati)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceType('Clinic Rehab')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      serviceType === 'Clinic Rehab'
                        ? 'border-[#008F83] bg-teal-50 text-[#008F83]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Zestmed Advanced Rehab Clinic</span>
                  </button>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Preferred Time Slot *</label>
                  <select
                    value={sessionSlot}
                    onChange={(e) => setSessionSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none bg-white font-medium"
                  >
                    <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM (Early Morning)</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Morning)</option>
                    <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM (Afternoon)</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM (Evening)</option>
                    <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM (Late Evening)</option>
                  </select>
                </div>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientDetails.name}
                    onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                    placeholder="e.g. Minati Goswami"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Age (Yrs)</label>
                  <input
                    type="number"
                    value={patientDetails.age}
                    onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                    placeholder="e.g. 64"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Contact Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={patientDetails.phone}
                    onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Home Visit Address in Guwahati *</label>
                  <input
                    type="text"
                    required
                    value={patientDetails.address}
                    onChange={(e) => setPatientDetails({ ...patientDetails, address: e.target.value })}
                    placeholder="e.g. Flat 3A, Dispur, Guwahati"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Medical Condition / Surgery Background</label>
                <input
                  type="text"
                  value={patientDetails.conditionNotes}
                  onChange={(e) => setPatientDetails({ ...patientDetails, conditionNotes: e.target.value })}
                  placeholder="e.g. Total knee replacement recovery, stroke balance training, sciatica"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#008F83] hover:bg-[#007a70] text-white font-bold py-3 text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>{isSubmitting ? 'Assigning Physiotherapist...' : `Confirm Session Booking • ₹${selectedPhysio.sessionFee}`}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Physiotherapist List */
            <div className="space-y-4">
              {/* Condition Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {PHYSIO_CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedCondition === cond
                        ? 'bg-[#008F83] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredPhysios.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:shadow-md hover:border-[#008F83]/50 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-13 h-13 rounded-2xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#008F83] transition truncate">
                            {p.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-[#008F83] block truncate">
                            {p.specialty}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {p.degree} • {p.experience}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {p.bio}
                      </p>

                      <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#008F83] shrink-0" />
                        <span className="truncate">Service Hubs: {p.locations}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Session Fee</span>
                        <span className="font-black text-slate-900 text-sm">₹{p.sessionFee}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectPhysio(p)}
                        className="py-1.5 px-4 bg-teal-50 hover:bg-[#008F83] text-[#008F83] hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <span>Book Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
