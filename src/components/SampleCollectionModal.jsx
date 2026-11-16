// src/components/SampleCollectionModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, Thermometer, ShieldCheck, AlertCircle, Syringe } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SampleCollectionModal({ isOpen, onClose, job, onConfirmCollection }) {
  const { addToast } = useToast();
  const [fastingConfirmed, setFastingConfirmed] = useState(job?.fastingVerified || false);
  const [barcode, setBarcode] = useState(job?.barcode || `AS-BC-${job?.pincode || '781001'}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedBox, setSelectedBox] = useState(job?.transitBoxId || 'BOX-GUW-01');
  const [phleboNotes, setPhleboNotes] = useState('Clean venipuncture, vacuum vacutainer filled without hemolysis. Inverted 8 times.');

  if (!isOpen || !job) return null;

  const handleGenerateBarcode = () => {
    const randomCode = `AS-BC-${job.pincode}-${Math.floor(1000 + Math.random() * 9000)}`;
    setBarcode(randomCode);
    addToast(`Barcode ${randomCode} generated and assigned.`, 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (job.fastingRequired && !fastingConfirmed) {
      addToast('Patient must confirm fasting adherence before sample collection.', 'error');
      return;
    }

    if (!barcode.trim()) {
      addToast('Please assign or scan a valid specimen barcode.', 'error');
      return;
    }

    onConfirmCollection(job.id, {
      barcode: barcode.trim(),
      fastingVerified: fastingConfirmed,
      transitBoxId: selectedBox,
      notes: phleboNotes,
      collectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    addToast(`Sample collected for ${job.patientName}! Barcode: ${barcode}`, 'success');
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
        <div className="flex items-center justify-between px-6 py-4 bg-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Syringe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Phlebotomy Sample Collection</h3>
              <p className="text-[11px] text-teal-100">Job Reference: {job.id}</p>
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
          {/* Patient Details Snapshot */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{job.patientName}</span>
              <span className="text-[11px] font-mono text-slate-500">{job.age} Yrs / {job.gender}</span>
            </div>
            <p className="text-slate-600 font-semibold">{job.testName}</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {job.address}, {job.city} - {job.pincode} ({job.landmark})
            </p>
          </div>

          {/* Fasting Verification */}
          {job.fastingRequired ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Overnight Fasting Required (10-12 Hours)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fastingCheck"
                  checked={fastingConfirmed}
                  onChange={(e) => setFastingConfirmed(e.target.checked)}
                  className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-700 cursor-pointer"
                />
                <label htmlFor="fastingCheck" className="text-amber-900 font-semibold cursor-pointer">
                  Patient confirmed strictly fasting (no tea/breakfast; only water ingested).
                </label>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Non-fasting test. Sample can be collected at current appointment slot.</span>
            </div>
          )}

          {/* Vacutainers List */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Specimen Vacutainer Vials Required ({job.sampleTubesRequired?.length || 1})
            </label>
            <div className="space-y-1.5">
              {job.sampleTubesRequired?.map((tube, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-slate-800">{tube}</span>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Aseptic Vacuum Checked
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Barcode Scanner & Assignment */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-bold">
                Specimen Tube Barcode ID *
              </label>
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="text-primary font-bold text-[11px] hover:underline"
              >
                Auto-Generate Barcode
              </button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value.toUpperCase())}
                  placeholder="e.g. AS-BC-781001-9041"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-slate-800 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Cold-Chain Cooler Assignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Cold-Chain Cooler Box</label>
              <select
                value={selectedBox}
                onChange={(e) => setSelectedBox(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-slate-800 bg-white font-mono"
              >
                <option value="BOX-GUW-01">BOX-GUW-01 (4.2°C)</option>
                <option value="BOX-GUW-02">BOX-GUW-02 (4.8°C)</option>
                <option value="BOX-JOR-01">BOX-JOR-01 (3.9°C)</option>
                <option value="BOX-DIB-01">BOX-DIB-01 (4.1°C)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Current Specimen Temp</label>
              <div className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 flex items-center justify-between">
                <span>4.2°C (Optimal)</span>
                <Thermometer className="w-4 h-4 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Phlebotomist Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Field Phlebotomy Notes</label>
            <input
              type="text"
              value={phleboNotes}
              onChange={(e) => setPhleboNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-slate-800"
            />
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
              Confirm Sample Drawn & Staged
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
