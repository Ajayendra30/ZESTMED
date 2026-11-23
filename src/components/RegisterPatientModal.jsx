// src/components/RegisterPatientModal.jsx
import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, MapPin, Heart, ShieldCheck, Calendar, Activity } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { saveRegisteredPatient } from '../utils/patientRegistry';

export default function RegisterPatientModal({ isOpen = true, onClose, onRegisterPatient }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'B+',
    city: 'Guwahati (Panbazar)',
    address: '',
    emergencyContact: '',
    medicalNotes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter patient full legal name.', 'error');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      addToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    const newPatient = {
      id: `ZM-PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name.trim(),
      phone: formData.phone.startsWith('+91') ? formData.phone.trim() : `+91 ${formData.phone.trim()}`,
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.') || 'patient'}@gmail.com`,
      age: parseInt(formData.age, 10) || 32,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      city: formData.city,
      address: formData.address.trim() || `${formData.city}, Assam`,
      bookingsCount: 0,
      ordersCount: 0,
      status: 'Active',
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    saveRegisteredPatient(newPatient.phone, newPatient.name, newPatient);
    onRegisterPatient(newPatient);
    addToast(`Patient registered! UHID: ${newPatient.id} (${newPatient.name})`, 'success');
    onClose();

    // Reset
    setFormData({
      name: '',
      phone: '',
      email: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'B+',
      city: 'Guwahati (Panbazar)',
      address: '',
      emergencyContact: '',
      medicalNotes: ''
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
        <div className="flex items-center justify-between px-6 py-4 bg-[#14B8A6] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register New Patient</h3>
              <p className="text-[11px] text-teal-100">Create electronic health record (EHR) & UHID</p>
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
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Age (Years) *</label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="32"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 bg-white font-bold"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">City / Region *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 bg-white font-medium"
              >
                <option value="Guwahati (Panbazar)">Guwahati (Panbazar)</option>
                <option value="Guwahati (Dispur)">Guwahati (Dispur)</option>
                <option value="Dibrugarh (AMC Road)">Dibrugarh (AMC Road)</option>
                <option value="Jorhat (Court Field)">Jorhat (Court Field)</option>
                <option value="Silchar (Tarapur)">Silchar (Tarapur)</option>
                <option value="Tezpur (Tribeni)">Tezpur (Tribeni)</option>
                <option value="Nagaon (Haibargaon)">Nagaon (Haibargaon)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Locality / Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House No., Street name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Known Allergies / Pre-existing Conditions</label>
            <input
              type="text"
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              placeholder="e.g. Penicillin allergy, Type 2 Diabetes"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Register & Issue UHID</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
