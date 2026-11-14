// src/components/AddDiagnosticTestModal.jsx
import React, { useState } from 'react';
import { X, Activity, DollarSign, Clock, FileText } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AddDiagnosticTestModal({ isOpen, onClose, onAddTest }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hematology',
    sampleType: 'Blood',
    fastingRequired: false,
    tat: '12-24 Hrs',
    price: 450,
    mrp: 650,
    parametersCount: 15,
    description: 'Comprehensive clinical assay performed under automated standard calibration at Guwahati Central Lab.',
    preparation: 'No special dietary restrictions. Stay well-hydrated.'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter diagnostic test name.', 'error');
      return;
    }

    const newTest = {
      id: `test-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      sampleType: formData.sampleType,
      fastingRequired: formData.fastingRequired,
      tat: formData.tat,
      price: parseFloat(formData.price) || 350,
      mrp: parseFloat(formData.mrp) || 500,
      parametersCount: parseInt(formData.parametersCount, 10) || 10,
      description: formData.description.trim(),
      preparation: formData.preparation.trim(),
      homeCollectionAvailable: true
    };

    onAddTest(newTest);
    addToast(`"${newTest.name}" added to ZESTMED Diagnostic Catalog!`, 'success');
    onClose();

    // Reset
    setFormData({
      name: '',
      category: 'Hematology',
      sampleType: 'Blood',
      fastingRequired: false,
      tat: '12-24 Hrs',
      price: 450,
      mrp: 650,
      parametersCount: 15,
      description: 'Comprehensive clinical assay performed under automated standard calibration at Guwahati Central Lab.',
      preparation: 'No special dietary restrictions. Stay well-hydrated.'
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
        <div className="flex items-center justify-between px-6 py-4 bg-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Diagnostic Lab Test</h3>
              <p className="text-[11px] text-teal-100">Catalog expansion for Assam phlebotomy collection</p>
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
            <label className="block text-slate-700 font-bold mb-1">Diagnostic Test Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Serum Ferritin & Total Iron Binding Capacity"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Organ / Diagnostic Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-800 bg-white"
              >
                <option value="Hematology">Hematology & Blood</option>
                <option value="Biochemistry">Biochemistry (Liver/Kidney/Lipid)</option>
                <option value="Endocrinology">Endocrinology & Thyroid/Diabetes</option>
                <option value="Vitamins">Vitamins & Micronutrients</option>
                <option value="Immunology">Immunology & Serology</option>
                <option value="Preventive">Preventive Health Package</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Specimen Tube Type</label>
              <select
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-800 bg-white"
              >
                <option value="Blood">EDTA Whole Blood / Serum</option>
                <option value="Serum">Plain Serum (Yellow/Red top)</option>
                <option value="Plasma">Fluoride Plasma (Grey top)</option>
                <option value="Urine">Sterile Urine Routine</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Turnaround Time (TAT)</label>
              <input
                type="text"
                required
                value={formData.tat}
                onChange={(e) => setFormData({ ...formData, tat: e.target.value })}
                placeholder="12-24 Hrs"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Selling Rate (₹) *</label>
              <input
                type="number"
                min="50"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-800 font-mono font-bold text-teal-700"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">MRP Value (₹) *</label>
              <input
                type="number"
                min="50"
                required
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Clinical Description & Indications</label>
            <textarea
              rows={2}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-800 resize-none text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="testFastingCheck"
              checked={formData.fastingRequired}
              onChange={(e) => setFastingRequired(e.target.checked)}
              className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-700 cursor-pointer"
            />
            <label htmlFor="testFastingCheck" className="text-slate-700 font-semibold cursor-pointer">
              Patient overnight fasting required (8-12 hours before morning phlebotomist visit)
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
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition shadow-sm"
            >
              Publish Test to Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
