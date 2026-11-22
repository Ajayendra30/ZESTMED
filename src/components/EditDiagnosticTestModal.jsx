// src/components/EditDiagnosticTestModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Edit3, FlaskConical, DollarSign, Clock, ShieldCheck, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function EditDiagnosticTestModal({ isOpen = true, onClose, test, onSaveTest }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hematology',
    sampleType: 'Blood',
    turnaroundTime: '24 Hours',
    price: 350,
    mrp: 500,
    fastingRequired: false,
    parametersCount: 15
  });

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name || '',
        category: test.categoryName || test.category || 'Hematology',
        sampleType: test.sampleType || 'Blood',
        turnaroundTime: test.turnaroundTime || test.tat || '24 Hours',
        price: test.price || 350,
        mrp: test.mrp || (test.price ? Math.round(test.price * 1.25) : 500),
        fastingRequired: Boolean(test.fastingRequired),
        parametersCount: test.parametersCount || 10
      });
    }
  }, [test]);

  if (!isOpen || !test) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Test name cannot be empty', 'error');
      return;
    }

    const updated = {
      ...test,
      name: formData.name.trim(),
      category: formData.category,
      categoryName: formData.category,
      sampleType: formData.sampleType,
      turnaroundTime: formData.turnaroundTime,
      tat: formData.turnaroundTime,
      price: parseFloat(formData.price) || test.price,
      mrp: parseFloat(formData.mrp) || test.mrp,
      fastingRequired: formData.fastingRequired,
      parametersCount: parseInt(formData.parametersCount, 10) || test.parametersCount || 10
    };

    onSaveTest(updated);
    addToast(`"${updated.name}" updated successfully!`, 'success');
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#14B8A6] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Diagnostic Test</h3>
              <p className="text-[11px] text-teal-100">Update pricing, turnaround and requirements</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Test Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Sample Type</label>
              <input
                type="text"
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">MRP (₹)</label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Turnaround Time</label>
              <input
                type="text"
                value={formData.turnaroundTime}
                onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Parameters Count</label>
              <input
                type="number"
                value={formData.parametersCount}
                onChange={(e) => setFormData({ ...formData, parametersCount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="fastingCheckbox"
              checked={formData.fastingRequired}
              onChange={(e) => setFormData({ ...formData, fastingRequired: e.target.checked })}
              className="w-4 h-4 text-[#14B8A6] rounded focus:ring-0 cursor-pointer"
            />
            <label htmlFor="fastingCheckbox" className="text-slate-700 font-medium cursor-pointer">
              Fasting Required (8-10 Hours before sample collection)
            </label>
          </div>

          {/* Actions */}
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
