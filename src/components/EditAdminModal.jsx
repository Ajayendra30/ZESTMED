// src/components/EditAdminModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function EditAdminModal({ isOpen = true, onClose, admin, onSaveAdmin }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    access: '',
    status: 'Active'
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        role: admin.role || '',
        access: admin.access || '',
        status: admin.status || 'Active'
      });
    }
  }, [admin]);

  if (!isOpen || !admin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    const updated = {
      ...admin,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      access: formData.access,
      status: formData.status
    };

    onSaveAdmin(updated);
    addToast(`Admin privileges for "${updated.name}" updated!`, 'success');
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
              <h3 className="text-base font-bold text-white">Edit Administrator Privileges</h3>
              <p className="text-[11px] text-teal-100">User ID: {admin.id}</p>
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Administrative Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Access Scope</label>
            <input
              type="text"
              value={formData.access}
              onChange={(e) => setFormData({ ...formData, access: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] bg-white text-slate-800"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
