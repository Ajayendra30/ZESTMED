// src/components/AddMedicineModal.jsx
import React, { useState } from 'react';
import { X, Plus, Pill, ShieldCheck, DollarSign, Package } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AddMedicineModal({ isOpen, onClose, onAddMedicine }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'general',
    categoryName: 'General Medicines',
    dosageType: 'Tablet',
    manufacturer: 'Apex Healthcare Labs',
    batchNo: `APX-2026-${Math.floor(100 + Math.random() * 900)}`,
    expiry: 'Dec 2028',
    stock: 100,
    threshold: 25,
    price: 45.00,
    mrp: 60.00,
    prescriptionRequired: false,
    rackLocation: 'GUW-WH-A05'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.genericName.trim()) {
      addToast('Please enter both medicine brand name and generic composition.', 'error');
      return;
    }

    const newMed = {
      id: `med-inv-${Date.now()}`,
      name: formData.name.trim(),
      genericName: formData.genericName.trim(),
      category: formData.category,
      categoryName: formData.category === 'diabetes' ? 'Diabetes Care' 
        : formData.category === 'cardiac' ? 'Cardiac & BP'
        : formData.category === 'vitamins' ? 'Vitamins & Supplements'
        : formData.category === 'digestive' ? 'Digestive Health'
        : formData.category === 'respiratory' ? 'Cold & Respiratory'
        : formData.category === 'devices' ? 'Healthcare Devices' : 'General Medicines',
      manufacturer: formData.manufacturer.trim(),
      batchNo: formData.batchNo.trim(),
      expiry: formData.expiry.trim(),
      stock: parseInt(formData.stock, 10) || 50,
      threshold: parseInt(formData.threshold, 10) || 20,
      price: parseFloat(formData.price) || 50,
      mrp: parseFloat(formData.mrp) || 65,
      prescriptionRequired: formData.prescriptionRequired,
      rackLocation: formData.rackLocation.trim() || 'GUW-WH-A01'
    };

    onAddMedicine(newMed);
    addToast(`"${newMed.name}" added to Guwahati Central Warehouse inventory!`, 'success');
    onClose();

    // Reset
    setFormData({
      name: '',
      genericName: '',
      category: 'general',
      categoryName: 'General Medicines',
      dosageType: 'Tablet',
      manufacturer: 'Apex Healthcare Labs',
      batchNo: `APX-2026-${Math.floor(100 + Math.random() * 900)}`,
      expiry: 'Dec 2028',
      stock: 100,
      threshold: 25,
      price: 45.00,
      mrp: 60.00,
      prescriptionRequired: false,
      rackLocation: 'GUW-WH-A05'
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
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Medicine to Central Inventory</h3>
              <p className="text-[11px] text-primary-100">Guwahati Fulfillment Warehouse Catalog</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Product Brand Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Amoxicillin 500mg Capsules"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Generic / Salt Composition *</label>
              <input
                type="text"
                required
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                placeholder="e.g. Amoxicillin Trihydrate IP"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Therapeutic Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                <option value="general">General Medicines</option>
                <option value="diabetes">Diabetes Care</option>
                <option value="cardiac">Cardiac & BP</option>
                <option value="vitamins">Vitamins & Supplements</option>
                <option value="digestive">Digestive Health</option>
                <option value="respiratory">Cold & Respiratory</option>
                <option value="devices">Healthcare Devices</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Pharmaceutical Manufacturer *</label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="e.g. Cipla Ltd / Sun Pharma"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Batch Number *</label>
              <input
                type="text"
                required
                value={formData.batchNo}
                onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Expiry Date *</label>
              <input
                type="text"
                required
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                placeholder="Dec 2028"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Warehouse Rack ID</label>
              <input
                type="text"
                value={formData.rackLocation}
                onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Initial Stock *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Reorder Level *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Selling Rate (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono font-bold text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">MRP Value (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="adminRxCheck"
              checked={formData.prescriptionRequired}
              onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
            />
            <label htmlFor="adminRxCheck" className="text-slate-700 font-semibold cursor-pointer">
              Schedule H / H1 Drug (Doctor's prescription strictly mandatory for dispensing)
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
              Add to Live Catalog & Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
