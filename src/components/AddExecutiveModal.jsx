// src/components/AddExecutiveModal.jsx
import React, { useState } from 'react';
import { X, UserPlus, Phone, MapPin, Activity, Thermometer, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AddExecutiveModal({ isOpen = true, onClose, onAddExecutive }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zone: 'Dispur & GS Road Hub',
    status: 'Available',
    temp: '3.8°C',
    shift: 'Morning (06:00 AM - 02:00 PM)',
    certification: 'NABL Certified Phlebotomist'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter executive full name.', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      addToast('Please enter contact mobile number.', 'error');
      return;
    }

    const newExecutive = {
      id: `ZM-EXEC-${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name.trim(),
      phone: formData.phone.startsWith('+91') ? formData.phone.trim() : `+91 ${formData.phone.trim()}`,
      zone: formData.zone,
      status: formData.status,
      temp: formData.temp || '3.8°C',
      tasksToday: 0,
      rating: '5.0 ★',
      shift: formData.shift,
      certification: formData.certification
    };

    onAddExecutive(newExecutive);
    addToast(`Phlebotomist ${newExecutive.name} (${newExecutive.id}) onboarded successfully!`, 'success');
    onClose();

    // Reset form
    setFormData({
      name: '',
      phone: '',
      zone: 'Dispur & GS Road Hub',
      status: 'Available',
      temp: '3.8°C',
      shift: 'Morning (06:00 AM - 02:00 PM)',
      certification: 'NABL Certified Phlebotomist'
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
        <div className="flex items-center justify-between px-6 py-4 bg-[#005CB9] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Lab Executive / Phlebotomist</h3>
              <p className="text-[11px] text-teal-100">Onboard home sample collection personnel across Assam</p>
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
              placeholder="e.g. Deepjyoti Kalita"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005CB9] text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mobile Contact *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 98765 00005"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005CB9] text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Operating Zone / Hub *</label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005CB9] text-slate-800 bg-white"
              >
                <option value="Dispur & GS Road Hub">Dispur & GS Road Hub</option>
                <option value="Ulubari & Paltan Bazar">Ulubari & Paltan Bazar</option>
                <option value="Jalukbari & Maligaon">Jalukbari & Maligaon</option>
                <option value="Khanapara & Beltola">Khanapara & Beltola</option>
                <option value="Six Mile & Panjabari">Six Mile & Panjabari</option>
                <option value="Chandmari & Zoo Road">Chandmari & Zoo Road</option>
                <option value="Jorhat Court Field Hub">Jorhat Court Field Hub</option>
                <option value="Dibrugarh AMC Zone">Dibrugarh AMC Zone</option>
                <option value="Silchar Town Central">Silchar Town Central</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Shift Schedule</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005CB9] text-slate-800 bg-white"
              >
                <option value="Morning (06:00 AM - 02:00 PM)">Morning (06:00 AM - 02:00 PM)</option>
                <option value="General (09:00 AM - 05:00 PM)">General (09:00 AM - 05:00 PM)</option>
                <option value="Evening (02:00 PM - 10:00 PM)">Evening (02:00 PM - 10:00 PM)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005CB9] text-slate-800 bg-white font-bold"
              >
                <option value="Available">Available</option>
                <option value="On Route">On Route</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Cold Box Telemetry</label>
              <input
                type="text"
                value={formData.temp}
                onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                placeholder="3.8°C"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005CB9] text-slate-800 font-mono text-teal-700 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Certification</label>
              <input
                type="text"
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005CB9] text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-xl border border-teal-100 text-[11px] text-teal-800">
            <ShieldCheck className="w-4 h-4 text-[#005CB9] shrink-0" />
            <span>Phlebotomist will receive automated SMS with credentials & GPS tracker app sync key.</span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#005CB9] hover:bg-[#004C99] text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Executive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
