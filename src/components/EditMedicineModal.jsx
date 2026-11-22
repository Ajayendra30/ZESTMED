// src/components/EditMedicineModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Pill, ShieldCheck, DollarSign, Package } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function EditMedicineModal({ isOpen = true, onClose, medicine, onSaveMedicine }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    categoryName: 'General Medicines',
    price: 50,
    mrp: 65,
    stock: 100,
    threshold: 40,
    expiry: 'Dec 2027',
    batchNo: 'B-902'
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || '',
        genericName: medicine.genericName || '',
        categoryName: medicine.categoryName || 'General Medicines',
        price: medicine.price || 50,
        mrp: medicine.mrp || (medicine.price ? Math.round(medicine.price * 1.25) : 65),
        stock: medicine.stock ?? 100,
        threshold: medicine.threshold ?? 40,
        expiry: medicine.expiry || 'Dec 2027',
        batchNo: medicine.batchNo || 'B-902'
      });
    }
  }, [medicine]);

  if (!isOpen || !medicine) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Medicine brand name is required', 'error');
      return;
    }

    const updated = {
      ...medicine,
      name: formData.name.trim(),
      genericName: formData.genericName.trim(),
      categoryName: formData.categoryName,
      price: parseFloat(formData.price) || 50,
      mrp: parseFloat(formData.mrp) || 65,
      stock: parseInt(formData.stock, 10) || 0,
      threshold: parseInt(formData.threshold, 10) || 20,
      expiry: formData.expiry.trim(),
      batchNo: formData.batchNo.trim()
    };

    onSaveMedicine(updated);
    addToast(`"${updated.name}" updated successfully!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 animate-scale-up">
        <div className="flex items-center justify-between px-6 py-4 bg-[#14B8A6] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Pharmacy Medicine</h3>
              <p className="text-[11px] text-teal-100">Ref ID: {medicine.id}</p>
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
            <label className="block text-slate-700 font-bold mb-1">Brand Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Generic Name / Composition</label>
            <input
              type="text"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Category</label>
              <select
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] bg-white text-slate-800"
              >
                <option value="General Medicines">General Medicines</option>
                <option value="Diabetes Care">Diabetes Care</option>
                <option value="Cardiac & BP">Cardiac & BP</option>
                <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Digestive Health">Digestive Health</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Batch Number</label>
              <input
                type="text"
                value={formData.batchNo}
                onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">MRP (₹)</label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Current Stock (Units)</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Safety Threshold</label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Expiry Date</label>
            <input
              type="text"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
