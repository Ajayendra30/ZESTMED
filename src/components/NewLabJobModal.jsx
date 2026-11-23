// src/components/NewLabJobModal.jsx
import React, { useState } from 'react';
import { X, CalendarPlus, User, MapPin, Syringe } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { DEFAULT_LOCATIONS } from '../context/LocationContext';

export default function NewLabJobModal({ isOpen = true, onClose, onAddJob, onCreateJob }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    contact: '',
    testName: 'Complete Blood Count (CBC with ESR)',
    category: 'Hematology',
    city: 'Guwahati',
    district: 'Kamrup Metropolitan',
    pincode: '781005',
    street: '',
    landmark: '',
    scheduledSlot: '07:00 AM - 08:30 AM',
    fastingRequired: true,
    assignedPhlebotomistId: 'ZM-PHL-AS-08'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.contact.trim() || !formData.street.trim()) {
      addToast('Please fill in patient name, contact, and address.', 'error');
      return;
    }

    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6 || !cleanPin.startsWith('78')) {
      addToast('Please enter a valid 6-digit Assam PIN code (starting with 78).', 'error');
      return;
    }

    const phleboMap = {
      'ZM-PHL-AS-08': { name: 'Manab Jyoti Barua', phone: '+91 92791 25091', bikePlate: 'AS-01-EE-4921' },
      'ZM-PHL-AS-14': { name: 'Rupam Kalita', phone: '+91 92791 25091', bikePlate: 'AS-01-DF-9012' },
      'ZM-PHL-JOR-03': { name: 'Dipankar Das', phone: '+91 92791 25091', bikePlate: 'AS-03-M-7714' },
      'ZM-PHL-DIB-05': { name: 'Ankur Borah', phone: '+91 92791 25091', bikePlate: 'AS-06-K-3319' }
    };

    const phlebo = phleboMap[formData.assignedPhlebotomistId] || phleboMap['ZM-PHL-AS-08'];

    const newJob = {
      id: `ZM-JOB-781001-${Math.floor(10 + Math.random() * 90)}`,
      bookingId: `ZM-LAB-${cleanPin}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: formData.patientName.trim(),
      age: parseInt(formData.age, 10) || 30,
      gender: formData.gender,
      contact: formData.contact.trim(),
      testName: formData.testName,
      testCode: 'DIAG-EXP',
      category: formData.category,
      scheduledSlot: formData.scheduledSlot,
      address: formData.street.trim(),
      city: formData.city,
      district: formData.district,
      pincode: cleanPin,
      landmark: formData.landmark.trim() || 'Assam Central Landmark',
      fastingRequired: formData.fastingRequired,
      fastingVerified: false,
      sampleTubesRequired: ['EDTA Purple Top (2.5 mL)', 'Serum Red Top (3.0 mL)'],
      barcode: null,
      status: 'Scheduled',
      assignedPhlebotomist: {
        id: formData.assignedPhlebotomistId,
        ...phlebo
      },
      collectionTime: null,
      transitBoxId: 'BOX-GUW-01',
      coolerTemp: '4.2°C',
      findings: []
    };

    const handler = onAddJob || onCreateJob;
    if (handler) {
      handler(newJob);
    }
    addToast(`Scheduled new collection job for ${newJob.patientName} (${newJob.id})!`, 'success');
    onClose();

    // Reset
    setFormData({
      patientName: '',
      age: '',
      gender: 'Male',
      contact: '',
      testName: 'Complete Blood Count (CBC with ESR)',
      category: 'Hematology',
      city: 'Guwahati',
      district: 'Kamrup Metropolitan',
      pincode: '781005',
      street: '',
      landmark: '',
      scheduledSlot: '07:00 AM - 08:30 AM',
      fastingRequired: true,
      assignedPhlebotomistId: 'ZM-PHL-AS-08'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dispatch New Phlebotomy Job</h3>
              <p className="text-[11px] text-primary-100">Same-Day Doorstep Sample Collection (Assam)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Age (Yrs) *</label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="42"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+91 92791 25091"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Diagnostic Test / Profile *</label>
            <select
              value={formData.testName}
              onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white"
            >
              <option value="Complete Blood Count (CBC with ESR)">Complete Blood Count (CBC with ESR)</option>
              <option value="Lipid Profile Comprehensive & Cardiac Risk">Lipid Profile Comprehensive & Cardiac Risk</option>
              <option value="Thyroid Profile Total (T3, T4, TSH)">Thyroid Profile Total (T3, T4, TSH)</option>
              <option value="Liver Function Test (LFT 11 Params)">Liver Function Test (LFT 11 Params)</option>
              <option value="Kidney Function Test (KFT 8 Params)">Kidney Function Test (KFT 8 Params)</option>
              <option value="Vitamin D3 & Vitamin B12 Vital Screen">Vitamin D3 & Vitamin B12 Vital Screen</option>
              <option value="Zestmed Comprehensive Full Body Checkup (72 Params)">Zestmed Comprehensive Full Body Checkup (72 Params)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assam District *</label>
              <select
                value={formData.city}
                onChange={(e) => {
                  const selCity = e.target.value;
                  const matched = DEFAULT_LOCATIONS.find(d => d.city === selCity);
                  setFormData({
                    ...formData,
                    city: selCity,
                    district: matched ? matched.district : selCity,
                    pincode: matched ? matched.pincode : formData.pincode
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                {DEFAULT_LOCATIONS.map((loc) => (
                  <option key={loc.city} value={loc.city}>
                    {loc.city} ({loc.district})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assam PIN Code (78xxxx) *</label>
              <input
                type="text"
                maxLength={6}
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Doorstep Street Address & Landmark *</label>
            <input
              type="text"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="e.g. House 5B, Zoo Road Tiniali, Guwahati"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Scheduled Morning Slot</label>
              <select
                value={formData.scheduledSlot}
                onChange={(e) => setFormData({ ...formData, scheduledSlot: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white font-mono"
              >
                <option value="06:30 AM - 08:00 AM">06:30 AM - 08:00 AM (Fasting)</option>
                <option value="07:00 AM - 08:30 AM">07:00 AM - 08:30 AM (Fasting)</option>
                <option value="08:30 AM - 10:00 AM">08:30 AM - 10:00 AM (Fasting)</option>
                <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>
                <option value="11:30 AM - 01:00 PM">11:30 AM - 01:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Assign Field Phlebotomist</label>
              <select
                value={formData.assignedPhlebotomistId}
                onChange={(e) => setFormData({ ...formData, assignedPhlebotomistId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                <option value="ZM-PHL-AS-08">Manab Jyoti Barua (Guwahati)</option>
                <option value="ZM-PHL-AS-14">Rupam Kalita (Guwahati)</option>
                <option value="ZM-PHL-JOR-03">Dipankar Das (Jorhat)</option>
                <option value="ZM-PHL-DIB-05">Ankur Borah (Dibrugarh)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="fastingReq"
              checked={formData.fastingRequired}
              onChange={(e) => setFormData({ ...formData, fastingRequired: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
            />
            <label htmlFor="fastingReq" className="text-slate-700 font-semibold cursor-pointer">
              Patient advised 10-12 hours overnight fasting for glucose/lipid profiles
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 font-bold shadow-sm"
            >
              Dispatch Job to Phlebotomist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
