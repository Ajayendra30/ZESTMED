// src/components/PrescriptionDetailModal.jsx
import React from 'react';
import { X, FileText, CheckCircle2, ShoppingBag, ShieldCheck, Calendar, User, Building, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { medicines } from '../mock-data/medicines';

export default function PrescriptionDetailModal({ isOpen, onClose, prescription }) {
  const { addToast } = useToast();
  const { addToCart, openCart } = useCart();

  if (!isOpen || !prescription) return null;

  const isExpired = prescription.status.toLowerCase().includes('expired');

  const handleReorder = () => {
    let addedCount = 0;
    prescription.medicines.forEach(rxMed => {
      // Find matching product in catalog
      const match = medicines.find(m => m.id === rxMed.catalogId || m.name.toLowerCase().includes(rxMed.name.toLowerCase().split(' ')[0]));
      if (match) {
        addToCart(match, 1);
        addedCount++;
      } else {
        // Fallback product object
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
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-400">
                Verified Prescription Vault
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
                  <User className="w-4 h-4 text-primary" />
                  {prescription.doctorName}
                </h4>
                <p className="text-slate-600 font-medium">{prescription.specialty}</p>
                <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {prescription.hospital}
                </p>
              </div>

              <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                isExpired 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {isExpired ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {prescription.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>Medical Reg No: <span className="font-mono font-bold text-slate-800">{prescription.regNumber}</span></div>
              <div>Patient: <span className="font-bold text-slate-800">{prescription.patientName}</span></div>
              <div>Date Issued: <span className="font-semibold text-slate-800">{prescription.dateOfIssue}</span></div>
              <div>Valid Until: <span className="font-semibold text-slate-800">{prescription.expiryDate}</span></div>
            </div>
          </div>

          {/* Clinical Prescription Notes */}
          {prescription.notes && (
            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 text-amber-900">
              <span className="font-bold block mb-0.5">Physician Advice & Regimen:</span>
              <p className="text-[11.5px] leading-relaxed text-amber-800">{prescription.notes}</p>
            </div>
          )}

          {/* Prescribed Medicines List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center justify-between">
              <span>Prescribed Medications ({prescription.medicines?.length || 0})</span>
              <span className="text-[10.5px] font-normal text-slate-500">Available at Zestmed Assam Pharmacy</span>
            </h4>

            <div className="space-y-2">
              {prescription.medicines?.map((med, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 transition flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs">{med.name}</div>
                    <div className="text-[11px] text-slate-600 font-medium">Dosage: {med.dosage}</div>
                    <div className="text-[10px] text-slate-400">Duration: {med.duration}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block font-black text-primary font-mono text-xs">₹{med.price}</span>
                    <span className="inline-block text-[9.5px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      In Stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

          {!isExpired ? (
            <button
              type="button"
              onClick={handleReorder}
              className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>1-Click Reorder Prescribed Medicines</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed"
            >
              Prescription Expired (Consult Doctor)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
