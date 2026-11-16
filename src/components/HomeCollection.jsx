import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { 
  Home, Calendar, Clock, UserCheck, ShieldCheck, 
  MapPin, CheckCircle2, ArrowRight, X, PhoneCall 
} from 'lucide-react';

export default function HomeCollection() {
  const { setByPincode, currentLocation } = useLocation();
  const { addToast } = useToast();
  
  const [pin, setPin] = useState('');
  const [pinStatus, setPinStatus] = useState(null); // { available: bool, message: string }
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // Scheduling Form State
  const [scheduleData, setScheduleData] = useState({
    date: '2026-11-13',
    timeSlot: '07:00 AM - 08:00 AM',
    patientName: '',
    phone: '',
    address: '',
  });

  const handleCheckPin = (e) => {
    e.preventDefault();
    if (!pin || pin.length < 6) {
      setPinStatus({
        available: false,
        message: 'Please enter a valid 6-digit postal code.'
      });
      return;
    }

    const res = setByPincode(pin);
    if (res.success) {
      setPinStatus({
        available: true,
        message: `Fastest Home Sample Pickup is AVAILABLE for PIN ${pin}! Certified phlebotomists ready.`
      });
      addToast(`Home collection available in PIN ${pin}`, 'success');
    } else {
      setPinStatus({
        available: false,
        message: 'Zestmed Health operates exclusively across Assam (PIN codes starting with 78xxxx). Try our Assam service hubs like 781001 (Guwahati) or 786001 (Dibrugarh).'
      });
    }
  };

  const handleConfirmSchedule = (e) => {
    e.preventDefault();
    if (!scheduleData.patientName || !scheduleData.phone) {
      addToast('Please enter patient name and contact number', 'error');
      return;
    }
    setScheduledSuccess(true);
    addToast('Home Sample Collection Slot Confirmed! (Demo)', 'success');
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setScheduledSuccess(false);
  };

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-br from-[#0C4778] via-[#1677C8] to-[#004C99] text-white relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Heading & Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-light">
              <Home className="w-3.5 h-3.5" />
              <span>Doorstep Diagnostic Service</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Healthcare at Your Doorstep
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
              Skip clinic queues and crowded waiting rooms. Our certified phlebotomists visit your home across Guwahati, Dibrugarh, Silchar, and Assam districts with temperature-controlled sterile equipment for a painless, punctual collection.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-teal-light" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Qualified Professionals</h4>
                  <p className="text-xs text-white/75 mt-0.5">NABL-trained phlebotomists with PPE kits & single-use needles</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-teal-light" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Convenient Scheduling</h4>
                  <p className="text-xs text-white/75 mt-0.5">Flexible morning slots from 6:00 AM onwards for fasting tests</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-teal-light" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Cold-Chain Logistics</h4>
                  <p className="text-xs text-white/75 mt-0.5">Safe temperature-monitored sample transport for zero test degradation</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-teal-light" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Live Status Updates</h4>
                  <p className="text-xs text-white/75 mt-0.5">Real-time SMS tracking of executive arrival and lab processing</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="btn-teal py-3.5 px-7 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition"
              >
                <span>Schedule Home Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Quick PIN Code Checker Box */}
          <div className="lg:col-span-5">
            <div className="bg-white text-dark rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark">Check Doorstep Availability</h3>
                  <p className="text-xs text-muted">Instant service status for your postal code</p>
                </div>
              </div>

              <form onSubmit={handleCheckPin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Postal PIN Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 781001, 786001, 785001 (Assam)"
                      className="w-full pl-4 pr-24 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary hover:bg-[#115FA0] text-white text-xs font-bold rounded-lg transition"
                    >
                      Check
                    </button>
                  </div>
                </div>

                {/* Status Message */}
                {pinStatus && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    pinStatus.available
                      ? 'bg-blue- text-blue- border border-blue-'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {pinStatus.available ? (
                      <CheckCircle2 className="w-4 h-4 text-blue- shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{pinStatus.message}</span>
                  </div>
                )}

                {/* Currently Selected Area */}
                <div className="bg-surface p-3 rounded-xl border border-border text-xs flex items-center justify-between">
                  <span className="text-muted">Currently active:</span>
                  <span className="font-bold text-dark">{currentLocation.city}, Assam ({currentLocation.pincode})</span>
                </div>

                {/* Quick Action */}
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full btn-primary py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Technician Slot</span>
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-muted">
                <PhoneCall className="w-3.5 h-3.5 text-primary" />
                <a href="tel:+919279125091" className="hover:text-primary transition font-semibold">Call Desk: +91 92791 25091</a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Schedule Slot Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity text-dark">
          <div 
            className="bg-white rounded-3xl shadow-dropdown border border-border w-full max-w-lg overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-dark flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-brand" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark">Schedule Sample Collection</h3>
                  <p className="text-xs text-muted">Select your preferred date & time slot</p>
                </div>
              </div>
              <button
                onClick={closeScheduleModal}
                className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {scheduledSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue- text-blue- flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-xl font-bold text-dark">Home Visit Slot Reserved!</h4>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  Our certified phlebotomist has been scheduled to visit your address on{' '}
                  <strong className="text-dark">{scheduleData.date}</strong> during{' '}
                  <strong className="text-dark">{scheduleData.timeSlot}</strong>.
                </p>
                <div className="bg-blue- border border-blue- rounded-2xl p-4 text-xs text-blue- text-left space-y-1.5">
                  <div className="font-bold">Booking Details (Demo):</div>
                  <div>• Patient: {scheduleData.patientName}</div>
                  <div>• Contact: {scheduleData.phone}</div>
                  <div>• Slot: {scheduleData.timeSlot}</div>
                  <div>• Booking Reference: #HC-ZEST-{Math.floor(1000 + Math.random() * 9000)}</div>
                </div>
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="btn-primary w-full py-2.5 text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmSchedule} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-dark block mb-1">Select Date</label>
                    <input
                      type="date"
                      required
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-dark block mb-1">Morning Time Slot</label>
                    <select
                      value={scheduleData.timeSlot}
                      onChange={(e) => setScheduleData({ ...scheduleData, timeSlot: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                    >
                      <option>06:00 AM - 07:00 AM (Early Fasting)</option>
                      <option>07:00 AM - 08:00 AM</option>
                      <option>08:00 AM - 09:00 AM</option>
                      <option>09:00 AM - 10:00 AM</option>
                      <option>10:00 AM - 11:30 AM</option>
                      <option>04:00 PM - 06:00 PM (Non-Fasting)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-dark block mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={scheduleData.patientName}
                    onChange={(e) => setScheduleData({ ...scheduleData, patientName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-dark block mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={scheduleData.phone}
                    onChange={(e) => setScheduleData({ ...scheduleData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="92791 25091"
                    className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-dark block mb-1">Home / Office Address</label>
                  <textarea
                    rows={2}
                    required
                    value={scheduleData.address}
                    onChange={(e) => setScheduleData({ ...scheduleData, address: e.target.value })}
                    placeholder="Flat / House No., Street, Landmark, Area..."
                    className="w-full p-2.5 rounded-xl border border-border focus:border-primary outline-none"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-border text-[11px] text-muted">
                  Note: A technician will call 30 minutes prior to arrival to confirm directions. Sterile sealed vacutainers will be used.
                </div>

                <button
                  type="submit"
                  className="w-full btn-teal py-3 text-sm font-bold rounded-xl mt-2"
                >
                  Confirm Home Collection Appointment
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
