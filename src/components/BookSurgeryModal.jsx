import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Scissors, ShieldCheck, CheckCircle2, MapPin, Clock, Calendar, 
  CreditCard, Car, Check, ArrowRight, Heart, Sparkles, Building2, 
  FileText, Phone, User 
} from 'lucide-react';
import { MOCK_SURGERY_PACKAGES, SURGERY_CATEGORIES } from '../mock-data/surgeryPackagesData';
import { useToast } from '../context/ToastContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { bookSurgery } from '../services/supabaseService';

export default function BookSurgeryModal({ isOpen, onClose, onOpenSeniorPickup }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { currentLocation } = useLocation();

  const [selectedCategory, setSelectedCategory] = useState('All Surgeries');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [patientForm, setPatientForm] = useState({
    name: user?.name || '',
    phone: user?.contact || user?.phone || '',
    age: user?.age || '',
    insuranceType: 'TPA Cashless Mediclaim',
    hasSeniorCitizen: true,
    preferredHospital: 'Dispur / GS Road Partner Hospital, Guwahati',
    notes: ''
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setPatientForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.contact || user.phone || '',
        age: prev.age || user.age || ''
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const filteredSurgeries = MOCK_SURGERY_PACKAGES.filter((s) => {
    if (selectedCategory === 'All Surgeries') return true;
    return s.category === selectedCategory;
  });

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setBookingConfirmed(null);
  };

  const handleConfirmConsult = (e) => {
    e.preventDefault();
    if (!patientForm.name.trim()) {
      addToast('Please enter patient name', 'error');
      return;
    }
    if (!patientForm.phone.trim() || patientForm.phone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const bookingRef = `ZM-SURG-${Math.floor(10000 + Math.random() * 90000)}`;
      const newBooking = {
        id: bookingRef,
        bookingId: bookingRef,
        type: 'Surgery Package',
        category: 'surgery',
        title: selectedPackage.title,
        surgeryName: selectedPackage.title,
        doctor: 'Dr. Anupam Sarma (Surgery Care Lead)',
        doctorName: 'Dr. Anupam Sarma (Surgery Care Lead)',
        doctorSpecialty: selectedPackage.category || 'General & Laparoscopic Surgery',
        specialty: selectedPackage.category || 'General & Laparoscopic Surgery',
        doctorHospital: patientForm.preferredHospital || 'Dispur / GS Road Partner Hospital, Guwahati',
        hospital: patientForm.preferredHospital || 'Dispur / GS Road Partner Hospital, Guwahati',
        date: 'Within 48 Hours (Pre-Op Call)',
        time: '10:00 AM',
        slot: 'Pre-Op Consultation Scheduled',
        mode: 'Hospital Consultation & Pre-Op',
        fee: selectedPackage.packagePrice || 35000,
        price: selectedPackage.packagePrice || 35000,
        patientName: patientForm.name,
        patientPhone: patientForm.phone,
        patientAge: patientForm.age,
        symptoms: `${selectedPackage.title} - ${patientForm.insuranceType}`,
        status: 'Confirmed',
        careManager: 'Dr. Anupam Sarma (Surgery Care Lead)',
        carePhone: '+91 94351 09876',
        createdAt: new Date().toISOString()
      };

      try {
        const existing = JSON.parse(localStorage.getItem('patient_appointments') || '[]');
        localStorage.setItem('patient_appointments', JSON.stringify([newBooking, ...existing]));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));

        // Save to Supabase PostgreSQL database
        bookSurgery(newBooking).catch((err) => console.warn('Supabase surgery booking error:', err));
      } catch (err) {
        console.error('Failed to save surgery booking', err);
      }

      setBookingConfirmed({
        bookingRef,
        pkg: selectedPackage,
        patient: patientForm,
        careManager: 'Dr. Anupam Sarma (Surgery Care Lead)',
        carePhone: '+91 94351 09876'
      });
      addToast(`Surgery consultation reserved for ${selectedPackage.title}!`, 'success');
    }, 900);
  };

  const handleReset = () => {
    setSelectedPackage(null);
    setBookingConfirmed(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-border w-full max-w-4xl max-h-[92vh] flex flex-col overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-teal-50 via-white to-teal-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008F83] text-white flex items-center justify-center shadow-sm shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Curated Daycare & Elective Surgery Packages
                </h3>
                <span className="text-[10px] font-bold bg-[#008F83] text-white px-2 py-0.5 rounded-full">
                  Guwahati Partner Hospitals
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Transparent fixed pricing • 100% Cashless TPA & Ayushman assistance • Free Senior Citizen Cab
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
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Surgery Consultation & Pre-Op Reserved!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Our dedicated Zestmed Care Manager has received your request. We will coordinate your free doctor consultation, diagnostic tests, and insurance pre-authorization.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-medium">Surgery Case ID</span>
                  <span className="font-mono font-bold text-[#008F83] text-sm">{bookingConfirmed.bookingRef}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Surgery Package</span>
                    <strong className="text-slate-800 text-sm">{bookingConfirmed.pkg.title}</strong>
                    <span className="text-[#008F83] block text-[11px] font-semibold">{bookingConfirmed.pkg.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Hospital Stay & Recovery</span>
                    <strong className="text-slate-800">{bookingConfirmed.pkg.stay}</strong>
                    <span className="text-slate-500 block text-[11px]">{bookingConfirmed.pkg.recoveryTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name & Phone</span>
                    <strong className="text-slate-800">{bookingConfirmed.patient.name} ({bookingConfirmed.patient.age || 'Adult'})</strong>
                    <span className="text-slate-500 block text-[11px]">{bookingConfirmed.patient.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Dedicated Care Manager</span>
                    <strong className="text-slate-800">{bookingConfirmed.careManager}</strong>
                    <span className="text-slate-500 block text-[11px]">{bookingConfirmed.carePhone}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block">All-Inclusive Package Price</span>
                    <span className="text-lg font-black text-emerald-950">₹{bookingConfirmed.pkg.packagePrice.toLocaleString('en-IN')}</span>
                    <span className="line-through text-slate-400 text-xs ml-2">₹{bookingConfirmed.pkg.mrp.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    {bookingConfirmed.pkg.cashlessInsurance}
                  </span>
                </div>

                {/* Free Senior Citizen Cab Included */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-teal-900">
                    <strong className="flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-[#008F83]" />
                      <span>Complimentary Senior Citizen Pick-up & Drop (Guwahati 10km Radius)</span>
                    </strong>
                    <p className="text-teal-700 mt-0.5">Sanitized AC transport included for surgery admission and discharge.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSeniorPickup && onOpenSeniorPickup();
                    }}
                    className="px-3 py-1.5 bg-[#008F83] text-white rounded-lg text-xs font-bold hover:bg-[#007a70] whitespace-nowrap shadow-xs"
                  >
                    View Cab Details
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    navigate('/patient-dashboard');
                  }}
                  className="flex-1 bg-white hover:bg-slate-50 text-[#008F83] border border-[#008F83] font-bold py-3 text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer"
                >
                  View in Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 bg-[#008F83] hover:bg-[#007a70] text-white font-bold py-3 text-xs sm:text-sm rounded-xl transition shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : selectedPackage ? (
            /* Selected Surgery Package Detail & Booking Form */
            <form onSubmit={handleConfirmConsult} className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="text-xs text-[#008F83] font-bold hover:underline flex items-center gap-1 mb-2"
              >
                ← Back to All Surgery Packages
              </button>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#008F83] uppercase tracking-wider">{selectedPackage.category}</span>
                    <h4 className="text-lg font-black text-slate-900">{selectedPackage.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#008F83]" />
                      <span>{selectedPackage.hospitalLocation}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-bold block">All-Inclusive Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">₹{selectedPackage.packagePrice.toLocaleString('en-IN')}</span>
                      <span className="line-through text-slate-400 text-xs">₹{selectedPackage.mrp.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedPackage.description}
                </p>

                {/* Package Inclusions */}
                <div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Package Inclusions:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedPackage.includes.map((inc, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-700 bg-white p-2 rounded-xl border border-slate-200/70">
                        <Check className="w-3.5 h-3.5 text-[#008F83] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Patient Consultation Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Book Free Pre-Surgery Evaluation:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={patientForm.name}
                      onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                      placeholder="e.g. Dhirendra Nath Deka"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Age (Yrs)</label>
                    <input
                      type="number"
                      value={patientForm.age}
                      onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                      placeholder="e.g. 62"
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
                      value={patientForm.phone}
                      onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Insurance / Payment Option</label>
                    <select
                      value={patientForm.insuranceType}
                      onChange={(e) => setPatientForm({ ...patientForm, insuranceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#008F83] outline-none bg-white font-medium"
                    >
                      <option value="TPA Cashless Mediclaim">TPA Cashless Mediclaim (Star, HDFC, Care, etc.)</option>
                      <option value="Ayushman Bharat (AB-PMJAY)">Ayushman Bharat (AB-PMJAY / Atal Amrit)</option>
                      <option value="CGHS / Central Govt">CGHS / State Govt Employee Scheme</option>
                      <option value="Direct Transparent Self-Pay">Direct Transparent Self-Pay (No Insurance)</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 pt-1">
                  <input
                    type="checkbox"
                    checked={patientForm.hasSeniorCitizen}
                    onChange={(e) => setPatientForm({ ...patientForm, hasSeniorCitizen: e.target.checked })}
                    className="w-4 h-4 text-[#008F83] rounded focus:ring-[#008F83]"
                  />
                  <span>Patient is a Senior Citizen (Include Free 10km Pick-up & Drop in Guwahati)</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#008F83] hover:bg-[#007a70] text-white font-bold py-3 text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>{isSubmitting ? 'Reserving Care Coordinator...' : 'Request Free Consultation & Cashless Pre-Approval'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Surgeries Grid */
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {SURGERY_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-[#008F83] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[52vh] overflow-y-auto pr-1">
                {filteredSurgeries.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4.5 hover:shadow-md hover:border-[#008F83]/50 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#008F83] bg-teal-50 px-2 py-0.5 rounded-md">
                          {s.category}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {s.stay}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 group-hover:text-[#008F83] transition mt-2 leading-snug">
                        {s.title}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>

                      <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#008F83] shrink-0" />
                          <span className="truncate">{s.hospitalLocation}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>{s.cashlessInsurance}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Package Cost</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-slate-900 text-base">₹{s.packagePrice.toLocaleString('en-IN')}</span>
                          <span className="line-through text-slate-400 text-xs">₹{s.mrp.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectPackage(s)}
                        className="py-2 px-4 bg-teal-50 hover:bg-[#008F83] text-[#008F83] hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <span>View Details</span>
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
