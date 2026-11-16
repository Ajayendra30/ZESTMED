// src/components/EditExecutiveModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Edit3, UserCheck, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function EditExecutiveModal({ isOpen = true, onClose, executive, onSaveExecutive }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zone: 'Dispur & GS Road Hub',
    status: 'Available',
    temp: '3.8°C',
    tasksToday: 0
  });

  useEffect(() => {
    if (executive) {
      setFormData({
        name: executive.name || '',
        phone: executive.phone || '',
        zone: executive.zone || 'Dispur & GS Road Hub',
        status: executive.status || 'Available',
        temp: executive.temp || '3.8°C',
        tasksToday: executive.tasksToday ?? 0
      });
    }
  }, [executive]);

  if (!isOpen || !executive) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Executive name is required.', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      addToast('Phone number is required.', 'error');
      return;
    }

    const updated = {
      ...executive,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      zone: formData.zone,
      status: formData.status,
      temp: formData.temp,
      tasksToday: parseInt(formData.tasksToday, 10) || 0
    };

    onSaveExecutive(updated);
    addToast(`Executive ${updated.name} (${updated.id}) updated successfully!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-[#14B8A6] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Executive / Phlebotomist</h3>
              <p className="text-[11px] text-teal-100 font-mono">ID: {executive.id}</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Executive Name *</label>
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
              <label className="block text-slate-700 font-bold mb-1">Assigned Zone *</label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 bg-white"
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 bg-white font-bold"
              >
                <option value="Available">Available</option>
                <option value="On Route">On Route</option>
                <option value="Active">Active</option>
                <option value="Sample Collected">Sample Collected</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Cold Box Temp</label>
              <input
                type="text"
                value={formData.temp}
                onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono text-teal-700 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tasks Today</label>
              <input
                type="number"
                min="0"
                value={formData.tasksToday}
                onChange={(e) => setFormData({ ...formData, tasksToday: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-bold"
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
