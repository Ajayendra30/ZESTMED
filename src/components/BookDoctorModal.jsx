import React, { useState } from 'react';
import { 
  X, Stethoscope, Star, Calendar, Clock, MapPin, 
  Video, CheckCircle2, ShieldCheck, User, Phone, 
  Search, ArrowRight, Heart, Filter 
} from 'lucide-react';
import { MOCK_DOCTORS, DOCTOR_SPECIALTIES } from '../mock-data/doctorsData';
import { useToast } from '../context/ToastContext';

export default function BookDoctorModal({ isOpen, onClose, onOpenSeniorPickup }) {
  const { addToast } = useToast();
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [consultMode, setConsultMode] = useState('Clinic Visit');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    phone: '',
    age: '',
    symptoms: ''
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredDoctors = MOCK_DOCTORS.filter((doc) => {
    const matchSpecialty = selectedSpecialty === 'All Specialties' || doc.specialty === selectedSpecialty;
    const matchQuery = !searchDoctor.trim() || 
      doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) || 
      doc.specialty.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchDoctor.toLowerCase());
    return matchSpecialty && matchQuery;
  });

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setSelectedSlot(doc.nextSlot);
    setBookingConfirmed(null);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!patientDetails.name.trim()) {
      addToast('Please enter the patient name', 'error');
      return;
    }
    if (!patientDetails.phone.trim() || patientDetails.phone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const apptId = `ZM-DOC-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingConfirmed({
        apptId,
        doctor: selectedDoctor,
        mode: consultMode,
        slot: selectedSlot,
        patient: patientDetails,
        fee: selectedDoctor.fee
      });
      addToast(`Appointment scheduled with ${selectedDoctor.name}!`, 'success');
    }, 800);
  };

  const handleReset = () => {
    setSelectedDoctor(null);
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
            <div className="w-10 h-10 rounded-2xl bg-[#005CB9] text-white flex items-center justify-center shadow-sm shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Book Doctor Consultation
                </h3>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  Guwahati Top Specialists
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Verified physicians & specialists across Guwahati • Clinic Visit & Online Consult
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
            /* Confirmed Screen */
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Consultation Confirmed!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Your appointment with {bookingConfirmed.doctor.name} has been booked. A confirmation SMS & WhatsApp reminder have been sent.
                </p>
              </div>

              {/* Appointment Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-medium">Appointment ID</span>
                  <span className="font-mono font-bold text-[#005CB9] text-sm">{bookingConfirmed.apptId}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Doctor</span>
                    <strong className="text-slate-800">{bookingConfirmed.doctor.name}</strong>
                    <span className="text-slate-500 block text-[11px]">{bookingConfirmed.doctor.specialty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Slot & Mode</span>
                    <strong className="text-slate-800">{bookingConfirmed.slot}</strong>
                    <span className="text-[#005CB9] block text-[11px] font-semibold">{bookingConfirmed.mode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient</span>
                    <strong className="text-slate-800">{bookingConfirmed.patient.name} ({bookingConfirmed.patient.age || 'Adult'})</strong>
                    <span className="text-slate-500 block text-[11px]">{bookingConfirmed.patient.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Clinic Location / Center</span>
                    <strong className="text-slate-800">{bookingConfirmed.doctor.hospital}</strong>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Consultation Fee</span>
                    <span className="text-base font-black text-slate-900">₹{bookingConfirmed.fee}</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[11px]">
                    Pay at Clinic / Razorpay Active
                  </span>
                </div>

                {/* Free Senior Citizen Cab CTA */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-teal-900">
                    <strong>Need transport for a Senior Citizen?</strong>
                    <p className="text-teal-700">Free round-trip pick-up & drop within 10km in Guwahati.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSeniorPickup && onOpenSeniorPickup();
                    }}
                    className="px-3 py-1.5 bg-[#005CB9] text-white rounded-lg text-xs font-bold hover:bg-[#004C99] whitespace-nowrap shadow-xs"
                  >
                    Book Free Cab
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-[#005CB9] hover:bg-[#004C99] text-white font-bold py-3 text-sm rounded-xl transition shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : selectedDoctor ? (
            /* Selected Doctor Detail & Booking Form */
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="text-xs text-[#005CB9] font-bold hover:underline flex items-center gap-1 mb-2"
              >
                ← Back to All Doctors
              </button>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={selectedDoctor.avatar}
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{selectedDoctor.name}</h4>
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                      {selectedDoctor.specialty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{selectedDoctor.degree} • {selectedDoctor.experience}</p>
                  <p className="text-xs text-slate-700 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#005CB9]" />
                    <span>{selectedDoctor.hospital}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-bold text-amber-600">{selectedDoctor.rating}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-black text-slate-900">₹{selectedDoctor.fee} Consultation Fee</span>
                  </div>
                </div>
              </div>

              {/* Select Mode */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Select Consultation Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultMode('Clinic Visit')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      consultMode === 'Clinic Visit'
                        ? 'border-[#005CB9] bg-teal-50 text-[#005CB9]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>In-Person Clinic Visit (Guwahati)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultMode('Video Consult')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      consultMode === 'Video Consult'
                        ? 'border-[#005CB9] bg-teal-50 text-[#005CB9]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Instant Video Consultation</span>
                  </button>
                </div>
              </div>

              {/* Slot Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">Available Appointment Slot</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {['Today, 04:30 PM', 'Today, 05:45 PM', 'Tomorrow, 10:30 AM', 'Tomorrow, 02:00 PM', 'Tomorrow, 06:15 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-xl border text-center transition font-semibold ${
                        selectedSlot === slot
                          ? 'border-[#005CB9] bg-[#005CB9] text-white'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
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
                    placeholder="e.g. Bipul Sharma"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#005CB9] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Age (Yrs)</label>
                  <input
                    type="number"
                    value={patientDetails.age}
                    onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#005CB9] outline-none"
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
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#005CB9] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Primary Health Concern / Symptoms</label>
                  <input
                    type="text"
                    value={patientDetails.symptoms}
                    onChange={(e) => setPatientDetails({ ...patientDetails, symptoms: e.target.value })}
                    placeholder="e.g. Fever, chest heaviness, joint pain"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#005CB9] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#005CB9] hover:bg-[#004C99] text-white font-bold py-3 text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirming Appointment...' : `Confirm Booking • ₹${selectedDoctor.fee}`}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Doctors Directory List */
            <div className="space-y-4">
              {/* Search & Specialties Filters */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchDoctor}
                    onChange={(e) => setSearchDoctor(e.target.value)}
                    placeholder="Search doctor by name, specialty, or hospital in Guwahati..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#005CB9] outline-none"
                  />
                </div>

                {/* Specialties Pill Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {DOCTOR_SPECIALTIES.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        selectedSpecialty === spec
                          ? 'bg-[#005CB9] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:shadow-md hover:border-[#005CB9]/50 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-13 h-13 rounded-2xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#005CB9] transition truncate">
                            {doc.name}
                          </h4>
                          <span className="text-[11px] font-semibold text-[#005CB9] block truncate">
                            {doc.specialty}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {doc.degree}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1 truncate text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{doc.hospital}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                            Next: {doc.nextSlot}
                          </span>
                          <span className="font-black text-slate-900">
                            ₹{doc.fee}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectDoctor(doc)}
                      className="mt-3 w-full py-2 bg-teal-50 hover:bg-[#005CB9] text-[#005CB9] hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Book Consultation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
