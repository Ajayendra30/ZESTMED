// src/components/EditPatientModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Edit3, ShieldCheck, UserCheck, Phone, MapPin, Activity } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function EditPatientModal({ isOpen = true, onClose, patient, onSavePatient }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'Guwahati (Panbazar)',
    status: 'Active',
    bookingsCount: 0,
    ordersCount: 0
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        phone: patient.phone || '',
        city: patient.city || 'Guwahati (Panbazar)',
        status: patient.status || 'Active',
        bookingsCount: patient.bookingsCount ?? 0,
        ordersCount: patient.ordersCount ?? 0
      });
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Patient name is required.', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      addToast('Contact phone number is required.', 'error');
      return;
    }

    const updated = {
      ...patient,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      city: formData.city,
      status: formData.status,
      bookingsCount: parseInt(formData.bookingsCount, 10) || 0,
      ordersCount: parseInt(formData.ordersCount, 10) || 0
    };

    onSavePatient(updated);
    addToast(`Patient ${updated.name} (${updated.id}) updated successfully!`, 'success');
    onClose();
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
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Patient Record</h3>
              <p className="text-[11px] text-teal-100 font-mono">UHID: {patient.id}</p>
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
            <label className="block text-slate-700 font-bold mb-1">Patient Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Regional City *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 bg-white"
              >
                <option value="Guwahati (Panbazar)">Guwahati (Panbazar)</option>
                <option value="Guwahati (Dispur)">Guwahati (Dispur)</option>
                <option value="Guwahati (Ulubari)">Guwahati (Ulubari)</option>
                <option value="Jorhat Central">Jorhat Central</option>
                <option value="Dibrugarh City">Dibrugarh City</option>
                <option value="Silchar Town">Silchar Town</option>
                <option value="Tezpur (Tribeni)">Tezpur (Tribeni)</option>
                <option value="Nagaon (Haibargaon)">Nagaon (Haibargaon)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 bg-white font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Lab Bookings</label>
              <input
                type="number"
                min="0"
                value={formData.bookingsCount}
                onChange={(e) => setFormData({ ...formData, bookingsCount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-bold text-teal-700"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Medicine Orders</label>
              <input
                type="number"
                min="0"
                value={formData.ordersCount}
                onChange={(e) => setFormData({ ...formData, ordersCount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-bold text-sky-700"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
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
              <UserCheck className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
