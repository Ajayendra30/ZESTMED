// src/components/ViewPatientModal.jsx
import React from 'react';
import { X, User, Phone, MapPin, CheckCircle2, FlaskConical, ShoppingCart, ShieldCheck, Edit3 } from 'lucide-react';

export default function ViewPatientModal({ isOpen = true, onClose, patient, onEdit }) {
  if (!isOpen || !patient) return null;

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
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Patient Record</h3>
              <p className="text-[11px] text-teal-400 font-mono">UHID: {patient.id}</p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Header Card */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#005CB9] font-black text-lg flex items-center justify-center">
                {patient.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{patient.name}</h4>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">{patient.phone}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
              {patient.status || 'Active'}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Assam City / District</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#005CB9]" />
                {patient.city}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Registration Status</span>
              <span className="font-semibold text-blue-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Verified Citizen Record
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Lab Test Bookings</span>
              <span className="font-bold text-teal-700 text-sm flex items-center gap-1">
                <FlaskConical className="w-3.5 h-3.5" />
                {patient.bookingsCount || 0} Bookings
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Medicine Orders</span>
              <span className="font-bold text-sky-700 text-sm flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5" />
                {patient.ordersCount || 0} Orders
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-teal-900 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#005CB9] shrink-0" />
            <span>Health ID is synchronized with Assam Central Health Registry & Electronic Health Records (EHR).</span>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 flex justify-between items-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(patient);
              }}
              className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#005CB9] font-bold text-xs transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Patient</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
