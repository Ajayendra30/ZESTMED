// src/components/PrescriptionDetailModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, FileText, CheckCircle2, ShoppingBag, ShieldCheck, 
  Calendar, User, Building, AlertCircle, Download, ExternalLink, Eye
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { medicines } from '../mock-data/medicines';
import { downloadPrescriptionFile } from '../services/prescriptionService';

export default function PrescriptionDetailModal({ isOpen = true, onClose, prescription }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { addToCart, openCart } = useCart();

  if (!isOpen || !prescription) return null;

  const statusLower = String(prescription.status || '').toLowerCase();
  const isExpired = statusLower.includes('expired');
  const isApproved = statusLower.includes('approved') || statusLower.includes('verified');
  const isRejected = statusLower.includes('rejected');

  const fileUrl = prescription.fileUrl || prescription.imagePreview || prescription.file_url;
  const fileName = prescription.fileName || prescription.file_name || `${prescription.id}_document`;
  const isPdf = Boolean(
    prescription.fileType?.includes('pdf') ||
    prescription.fileName?.toLowerCase().endsWith('.pdf') ||
    (typeof fileUrl === 'string' && (fileUrl.startsWith('data:application/pdf') || fileUrl.toLowerCase().includes('.pdf')))
  );

  const handleDownload = () => {
    downloadPrescriptionFile(prescription);
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

  const handleReorder = () => {
    if (!prescription.medicines || prescription.medicines.length === 0) {
      addToast('No specific medications listed for automated re-order.', 'info');
      return;
    }

    let addedCount = 0;
    prescription.medicines.forEach(rxMed => {
      const match = medicines.find(m => m.id === rxMed.catalogId || m.name.toLowerCase().includes(rxMed.name.toLowerCase().split(' ')[0]));
      if (match) {
        addToCart(match, 1);
        addedCount++;
      } else {
        addToCart({
          id: rxMed.catalogId || `custom-${Date.now()}`,
          name: rxMed.name,
          category: 'Prescription Medicine',
          price: rxMed.price || 95,
          mrp: Math.round((rxMed.price || 95) * 1.25),
          prescriptionRequired: true,
          inStock: true,
          manufacturer: 'Verified Pharma'
        }, 1);
        addedCount++;
      }
    });

    addToast(`Added ${addedCount} prescribed medication(s) to your cart!`, 'success');
    onClose();
    setTimeout(() => {
      openCart();
    }, 300);
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
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#008F83]/20 text-[#00BFA5] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#00BFA5]">
                Prescription Vault
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {prescription.id}
              </h3>
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

        {/* Content */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto space-y-5 text-xs text-dark">
          {/* Doctor & Hospital Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#008F83]" />
                  {prescription.doctorName || 'Registered Medical Practitioner'}
                </h4>
                <p className="text-slate-600 font-medium">{prescription.specialty || 'General Medicine'}</p>
                <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {prescription.hospital || prescription.clinicName || 'Assam Health Desk, Guwahati'}
                </p>
              </div>

              <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                isApproved 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : isRejected
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isApproved && <CheckCircle2 className="w-3 h-3" />}
                {isRejected && <AlertCircle className="w-3 h-3" />}
                {!isApproved && !isRejected && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                {prescription.status || 'Pending Audit'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>Registration No: <span className="font-mono font-bold text-slate-800">{prescription.regNumber || prescription.doctorRegNo || 'Pending Verification'}</span></div>
              <div>Patient: <span className="font-bold text-slate-800">{prescription.patientName || 'Verified Patient'}</span></div>
              <div>Date Uploaded: <span className="font-semibold text-slate-800">{prescription.uploadedAt || prescription.dateOfIssue || 'Recent'}</span></div>
              <div>Valid Until: <span className="font-semibold text-slate-800">{prescription.expiryDate || 'Standard Validity (6 Months)'}</span></div>
            </div>
          </div>

          {/* Genuine Document Attachment Preview Card */}
          {fileUrl && (
            <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-teal-200 flex items-center justify-center text-[#008F83] shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs truncate max-w-[240px] sm:max-w-xs">
                      {fileName}
                    </h5>
                    <p className="text-[10.5px] text-slate-500">
                      {prescription.fileSize || 'Prescription Document'} • {isPdf ? 'PDF Format' : 'Image Format'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleOpenDocument}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition flex items-center gap-1 cursor-pointer"
                    title="View Document"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#008F83]" />
                    <span className="text-[11px] font-bold">View</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 rounded-xl bg-[#008F83] hover:bg-[#007A70] text-white shadow-2xs transition flex items-center gap-1 cursor-pointer"
                    title="Download Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">Download</span>
                  </button>
                </div>
              </div>

              {/* Inline image thumbnail if image */}
              {!isPdf && typeof fileUrl === 'string' && (
                <div className="rounded-xl overflow-hidden border border-teal-100 bg-white max-h-48 flex items-center justify-center">
                  <img 
                    src={fileUrl} 
                    alt="Prescription Scan" 
                    className="max-h-48 object-contain w-auto mx-auto" 
                  />
                </div>
              )}
            </div>
          )}

          {/* Patient / Pharmacist Notes */}
          {(prescription.notes || prescription.patientNote || prescription.pharmacistNotes) && (
            <div className="space-y-2">
              {(prescription.notes || prescription.patientNote) && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                  <span className="font-bold block mb-0.5 text-slate-700">Patient Note:</span>
                  <p className="text-[11.5px] leading-relaxed text-slate-600">{prescription.notes || prescription.patientNote}</p>
                </div>
              )}
              {prescription.pharmacistNotes && (
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 text-emerald-950">
                  <span className="font-bold block mb-0.5 text-emerald-900">Chief Pharmacist Remarks:</span>
                  <p className="text-[11.5px] leading-relaxed text-emerald-800">{prescription.pharmacistNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Prescribed Medicines List if any */}
          {Array.isArray(prescription.medicines) && prescription.medicines.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Prescribed Medications ({prescription.medicines.length})</span>
                <span className="text-[10.5px] font-normal text-slate-500">Fulfilled by ZESTMED Guwahati Hub</span>
              </h4>

              <div className="space-y-2">
                {prescription.medicines.map((med, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#008F83]/40 transition flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 text-xs">{med.name}</div>
                      <div className="text-[11px] text-slate-600 font-medium">Dosage: {med.dosage}</div>
                      {med.duration && <div className="text-[10px] text-slate-400">Duration: {med.duration}</div>}
                    </div>

                    <div className="text-right shrink-0">
                      {med.price && <span className="block font-black text-[#008F83] font-mono text-xs">₹{med.price}</span>}
                      <span className="inline-block text-[9.5px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        In Stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Verification Footer */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Prescription audited by ZESTMED Chief Registered Pharmacist at Guwahati Fulfillment Center.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-4 font-semibold"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {fileUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </button>
            )}

            {isApproved && Array.isArray(prescription.medicines) && prescription.medicines.length > 0 && (
              <button
                type="button"
                onClick={handleReorder}
                className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Order Prescribed Medicines</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
