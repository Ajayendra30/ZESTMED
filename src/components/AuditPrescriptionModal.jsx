// src/components/AuditPrescriptionModal.jsx
import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Check, ShieldCheck, User, Building } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AuditPrescriptionModal({ isOpen, onClose, rx, onApprove, onReject }) {
  const { addToast } = useToast();
  const [pharmacistRemarks, setPharmacistRemarks] = useState(rx?.pharmacistNotes || 'Verified against Assam Medical Council registry. Dosages and duration clinically verified.');
  const [rejectReason, setRejectReason] = useState('Prescription image illegible. Please re-upload with clear doctor stamp and signature.');
  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen || !rx) return null;

  const handleApprove = () => {
    onApprove(rx.id, pharmacistRemarks);
    addToast(`Prescription ${rx.id} approved by Chief Pharmacist! Medicines queued for packing.`, 'success');
    onClose();
  };

  const handleReject = () => {
    onReject(rx.id, rejectReason);
    addToast(`Prescription ${rx.id} rejected. Patient notified.`, 'info');
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
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Chief Pharmacist Prescription Audit</h3>
              <p className="text-[11px] text-teal-400">Audit Reference: {rx.id} • Patient: {rx.patientName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs text-dark">
          {/* Two Columns: Document Scan Preview + Medical Clinical Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Prescription Scan View */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
                Uploaded Prescription Document
              </span>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/4] flex items-center justify-center group shadow-xs">
                <img
                  src={rx.imagePreview}
                  alt="Prescription Document Scan"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900/80 to-transparent text-white text-[11px] flex justify-between items-center">
                  <span>Uploaded {rx.uploadedAt}</span>
                  <span className="font-mono bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px]">
                    200 DPI Scan
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Extracted Clinical & Doctor Details */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" />
                      {rx.doctorName}
                    </h4>
                    <p className="text-slate-600 font-medium">{rx.clinicName}</p>
                    <p className="text-[11px] font-mono text-primary font-bold mt-0.5">
                      Reg No: {rx.doctorRegNo}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {rx.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1 text-slate-600">
                  <div>Patient: <span className="font-bold text-slate-800">{rx.patientName}</span> ({rx.patientAge} Y)</div>
                  <div>Contact: <span className="font-mono text-slate-800">{rx.patientPhone}</span></div>
                  <div>District: <span className="font-semibold text-slate-800">{rx.district}</span></div>
                  <div>Diagnosis: <span className="font-semibold text-slate-800">{rx.diagnosedCondition}</span></div>
                </div>
              </div>

              {/* Identified Medications */}
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Extracted Prescribed Medications ({rx.extractedMedications?.length || 0})
                </span>
                <div className="space-y-2">
                  {rx.extractedMedications?.map((med, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-bold text-slate-900">{med.name}</div>
                        <div className="text-[10.5px] text-slate-500">{med.dosage} • Duration: {med.duration}</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        In Guwahati Warehouse
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pharmacist Remarks */}
              {!isRejecting ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Chief Pharmacist Clinical Verification Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={pharmacistRemarks}
                    onChange={(e) => setPharmacistRemarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 text-xs resize-none"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <label className="block text-rose-900 font-bold">
                    Rejection Reason (Communicated to Patient)
                  </label>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 focus:outline-none focus:border-rose-500 text-rose-950 text-xs resize-none bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Legal Compliance Banner */}
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-2.5 text-[11px] text-teal-900 font-semibold">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
            <span>
              Mandatory Schedule H/H1 clinical dispensing audit in compliance with Assam State Drug Control Administration & Pharmacy Act, 1948.
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          {!isRejecting ? (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="btn-secondary text-xs py-2 px-4 font-bold text-rose-600 hover:bg-rose-50 border-rose-200"
              >
                Reject Prescription
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Approve for Dispensing</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Back to Review
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
              >
                Confirm Rejection
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
