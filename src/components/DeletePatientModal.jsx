// src/components/DeletePatientModal.jsx
import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function DeletePatientModal({ isOpen = true, onClose, patient, onConfirmDelete }) {
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !patient) return null;

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      if (onConfirmDelete) {
        await onConfirmDelete(patient.id, patient);
      }
      addToast(`Patient ${patient.name} (${patient.id}) removed from directory.`, 'info');
      onClose();
    } catch (err) {
      console.error('[DeletePatientModal] Error deleting patient:', err);
      addToast('Failed to delete patient. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-rose-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Patient Record</h3>
              <p className="text-[11px] text-rose-100">Permanent directory removal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Are you sure you want to delete this patient?</p>
              <p className="text-slate-600 leading-relaxed text-[11.5px]">
                You are about to remove <strong>{patient.name}</strong> (<span className="font-mono">{patient.id}</span>) from the registered Assam directory. This will clear their active directory indexing across all hubs.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1 text-slate-700">
            <div><span className="text-slate-400 uppercase text-[10px] font-bold">Patient Name:</span> <strong>{patient.name}</strong></div>
            <div><span className="text-slate-400 uppercase text-[10px] font-bold">Contact Phone:</span> <span className="font-mono">{patient.phone}</span></div>
            <div><span className="text-slate-400 uppercase text-[10px] font-bold">Regional City:</span> <span>{patient.city}</span></div>
            <div><span className="text-slate-400 uppercase text-[10px] font-bold">UHID:</span> <span className="font-mono font-bold text-teal-700">{patient.id}</span></div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Patient</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
