// src/components/AddAdminModal.jsx
import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, Mail, Lock, Key } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AddAdminModal({ isOpen = true, onClose, onAddAdmin }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Diagnostic Center Supervisor',
    access: 'Lab & Diagnostic Approvals',
    status: 'Active'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter administrator name', 'error');
      return;
    }
    if (!formData.email.trim()) {
      addToast('Please enter administrator email', 'error');
      return;
    }

    const newAdmin = {
      id: `ADM-${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      access: formData.access,
      status: formData.status
    };

    onAddAdmin(newAdmin);
    addToast(`Administrative user "${newAdmin.name}" (${newAdmin.id}) provisioned successfully!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 animate-scale-up">
        <div className="flex items-center justify-between px-6 py-4 bg-[#14B8A6] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Administrative Staff</h3>
              <p className="text-[11px] text-teal-100">Provision security role & dashboard privileges</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Official Email Address *</label>
            <input
              type="email"
              required
              placeholder="rupjyoti@zestmed.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Administrative Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] bg-white text-slate-800"
            >
              <option value="Hospital Operations Lead">Hospital Operations Lead</option>
              <option value="Chief Pharmacist Lead">Chief Pharmacist Lead</option>
              <option value="Chief of Pathology & Diagnostics">Chief of Pathology & Diagnostics</option>
              <option value="Diagnostic Center Supervisor">Diagnostic Center Supervisor</option>
              <option value="Clinical Care Coordinator">Clinical Care Coordinator</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Access Scope</label>
            <input
              type="text"
              value={formData.access}
              onChange={(e) => setFormData({ ...formData, access: e.target.value })}
              placeholder="e.g. Lab, Diagnostics & Phlebotomy"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold transition shadow-xs cursor-pointer"
            >
              Provision Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
