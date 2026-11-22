// src/components/AddCategoryModal.jsx
import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AddCategoryModal({ isOpen = true, onClose, onAddCategory }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    storageTemp: 'Room Temperature (15-25°C)'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter category name', 'error');
      return;
    }

    const newCat = {
      name: formData.name.trim(),
      count: 0,
      valuation: '₹0',
      description: formData.description.trim(),
      storageTemp: formData.storageTemp
    };

    onAddCategory(newCat);
    addToast(`Category "${newCat.name}" added to pharmaceutical classifications!`, 'success');
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
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Medicine Category</h3>
              <p className="text-[11px] text-teal-100">Classify pharmaceutical inventory items</p>
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
            <label className="block text-slate-700 font-bold mb-1">Category Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dermatology & Skincare"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Description / Indications</label>
            <input
              type="text"
              placeholder="e.g. Topical creams, ointments and skin treatments"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Storage Condition</label>
            <select
              value={formData.storageTemp}
              onChange={(e) => setFormData({ ...formData, storageTemp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] bg-white text-slate-800"
            >
              <option value="Room Temperature (15-25°C)">Room Temperature (15-25°C)</option>
              <option value="Cold-Chain Refrigerated (2-8°C)">Cold-Chain Refrigerated (2-8°C)</option>
              <option value="Cool & Dry (Under 20°C)">Cool & Dry (Under 20°C)</option>
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
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
