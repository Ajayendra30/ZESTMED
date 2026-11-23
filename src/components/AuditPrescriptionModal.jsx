// src/components/AuditPrescriptionModal.jsx
import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, FileText, Check, ShieldCheck, 
  User, Building, Download, ExternalLink, Eye, AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { downloadPrescriptionFile } from '../services/prescriptionService';

export default function AuditPrescriptionModal({ isOpen, onClose, rx, onApprove, onReject }) {
  const { addToast } = useToast();
  const [pharmacistRemarks, setPharmacistRemarks] = useState(
    rx?.pharmacistNotes || 'Verified against medical practitioner registry. Dosages and duration clinically verified.'
  );
  const [rejectReason, setRejectReason] = useState(
    'Prescription document illegible or incomplete. Please re-upload with clear doctor stamp and signature.'
  );
  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen || !rx) return null;

  const fileUrl = rx.fileUrl || rx.imagePreview || rx.file_url;
  const fileName = rx.fileName || rx.file_name || `${rx.id}_document`;
  const isPdf = Boolean(
    rx.fileType?.includes('pdf') ||
    rx.fileName?.toLowerCase().endsWith('.pdf') ||
    (typeof fileUrl === 'string' && (fileUrl.startsWith('data:application/pdf') || fileUrl.toLowerCase().includes('.pdf')))
  );

  const handleDownload = () => {
    downloadPrescriptionFile(rx);
    addToast('Downloading prescription document...', 'info');
  };

  const handleOpenDocument = () => {
    if (fileUrl) {
      if (fileUrl.startsWith('data:')) {
        const win = window.open();
        if (win) {
          if (isPdf) {
            win.document.write(`<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
          } else {
            win.document.write(`<img src="${fileUrl}" style="max-width:100%; display:block; margin:auto;" />`);
          }
        }
      } else {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleApprove = () => {
    if (onApprove) onApprove(rx.id, pharmacistRemarks);
    addToast(`Prescription ${rx.id} approved by Chief Pharmacist! Medicines queued for fulfillment.`, 'success');
    onClose();
  };

  const handleReject = () => {
    if (onReject) onReject(rx.id, rejectReason);
    addToast(`Prescription ${rx.id} rejected. Notification sent to patient.`, 'info');
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
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Chief Pharmacist Prescription Audit</h3>
              <p className="text-[11px] text-teal-400">
                Audit Reference: {rx.id} • Patient: {rx.patient || rx.patientName || 'Verified Patient'}
              </p>
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
            {/* Left: Genuine Prescription Document Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block">
                  Uploaded Prescription Document
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleOpenDocument}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Open Document in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-[#008F83] hover:bg-[#007A70] text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Download Genuine Prescription File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/4] flex items-center justify-center group shadow-xs">
                {fileUrl ? (
                  isPdf ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm mb-1 max-w-xs truncate">
                        {fileName}
                      </h5>
                      <p className="text-slate-500 text-xs mb-4">
                        {rx.fileSize || 'PDF Document'} • Uploaded by Patient
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenDocument}
                          className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Full PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="px-3.5 py-2 bg-[#008F83] text-white rounded-xl text-xs font-bold hover:bg-[#007A70] transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={fileUrl}
                      alt="Prescription Document Scan"
                      className="w-full h-full object-contain bg-white group-hover:scale-105 transition duration-300"
                    />
                  )
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p>No document scan attached</p>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900/80 to-transparent text-white text-[11px] flex justify-between items-center">
                  <span>Uploaded: {rx.uploadedAt || rx.date || 'Recent'}</span>
                  <span className="font-mono bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px]">
                    {isPdf ? 'PDF' : 'Genuine Scan'}
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
                      <User className="w-4 h-4 text-[#008F83]" />
                      {rx.doctor || rx.doctorName || 'Registered Medical Practitioner'}
                    </h4>
                    <p className="text-slate-600 font-medium">{rx.clinicName || rx.hospital || 'Guwahati Health Center'}</p>
                    <p className="text-[11px] font-mono text-[#008F83] font-bold mt-0.5">
                      Reg No: {rx.doctorRegNo || 'Pending Verification'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    String(rx.status).toLowerCase().includes('approved')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : String(rx.status).toLowerCase().includes('reject')
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {rx.status || 'Pending Audit'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1 text-slate-600">
                  <div>Patient: <span className="font-bold text-slate-800">{rx.patient || rx.patientName || 'Patient'}</span></div>
                  <div>Contact: <span className="font-mono text-slate-800">{rx.phone || rx.patientPhone || 'Not Provided'}</span></div>
                  <div>Date of Upload: <span className="font-semibold text-slate-800">{rx.uploadedAt || rx.date || 'Today'}</span></div>
                  <div>File Name: <span className="font-mono text-slate-800">{fileName}</span></div>
                </div>
              </div>

              {/* Patient Note */}
              {(rx.notes || rx.patientNote) && (
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/80 text-teal-950">
                  <span className="font-bold block mb-0.5 text-[#008F83]">Patient Note:</span>
                  <p className="text-[11.5px] leading-relaxed text-slate-700">{rx.notes || rx.patientNote}</p>
                </div>
              )}

              {/* Identified / Prescribed Medications */}
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Prescribed Medications ({Array.isArray(rx.medicines) ? rx.medicines.length : (rx.items ? 1 : 0)})
                </span>
                <div className="space-y-2">
                  {Array.isArray(rx.medicines) && rx.medicines.length > 0 ? (
                    rx.medicines.map((med, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                        <div>
                          <div className="font-bold text-slate-900">{med.name}</div>
                          <div className="text-[10.5px] text-slate-500">{med.dosage || 'As directed'} {med.duration ? `• ${med.duration}` : ''}</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="font-bold text-slate-900">{rx.items || 'Prescription Items (Full Course)'}</div>
                        <div className="text-[10.5px] text-slate-500">Document submitted for pharmacist medicine mapping</div>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Pending Mapping
                      </span>
                    </div>
                  )}
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#008F83] text-slate-800 text-xs resize-none"
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
                className="btn-secondary text-xs py-2 px-4 font-bold text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
              >
                Reject Prescription
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
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
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                Back to Review
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
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
