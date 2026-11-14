import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  X, UploadCloud, FileText, CheckCircle2, AlertCircle, 
  ShieldCheck, Camera, ArrowRight 
} from 'lucide-react';

export default function PrescriptionUploadModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientNote, setPatientNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        preview: URL.createObjectURL(file)
      });
    }
  };

  const handleSimulateSampleRx = () => {
    setSelectedFile({
      name: 'Sample_Dr_Kulkarni_Prescription.pdf',
      size: '1.24 MB',
      preview: null
    });
    addToast('Demo prescription sample attached', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('Please upload or attach a prescription first', 'error');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      addToast('Prescription submitted for Pharmacist Verification! (Demo)', 'success');
    }, 1200);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSelectedFile(null);
    setPatientNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-dropdown border border-border w-[95%] max-w-md sm:max-w-lg max-h-[92vh] flex flex-col overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact on mobile */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 text-[#008F83] border border-teal-100 flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 text-[#008F83]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-dark truncate">Upload Doctor's Prescription</h3>
              <p className="text-[10.5px] sm:text-xs text-muted truncate">Licensed pharmacists will review and prepare order</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 -mr-1 rounded-lg text-muted hover:text-dark hover:bg-slate-200 transition shrink-0"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-5 sm:p-7 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 sm:w-9 sm:h-9" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-dark">Prescription Uploaded Successfully!</h4>
            <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
              Our registered pharmacist is reviewing your prescription ({selectedFile?.name}). You will receive an SMS and WhatsApp notification with medicine pricing and confirmation within 15 minutes.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 text-left mt-4 space-y-1">
              <div className="font-semibold">Simulated Workflow Status:</div>
              <div>• Ticket ID: #RX-ZEST-{Math.floor(10000 + Math.random() * 90000)}</div>
              <div>• Verification Desk: In Review (Demo)</div>
              <div>• Pharmacist Call Window: 10:00 AM - 10:30 AM</div>
            </div>
            <button
              onClick={handleReset}
              className="mt-5 btn-primary w-full py-2.5 text-xs sm:text-sm font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            {/* Upload Box - Compact on mobile */}
            <div className="border-2 border-dashed border-[#008F83]/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center bg-teal-50/30 hover:bg-teal-50/60 transition group cursor-pointer relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white shadow-xs text-[#008F83] border border-teal-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Camera className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-[#008F83]" />
              </div>
              <h5 className="text-xs sm:text-sm font-bold text-dark">
                Drag & Drop prescription or click to browse
              </h5>
              <p className="text-[10px] sm:text-xs text-muted mt-0.5">
                Supports JPG, PNG, or PDF formats up to 10MB
              </p>
            </div>

            {/* Attached file chip */}
            {selectedFile ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-[#008F83] shrink-0" />
                  <span className="font-semibold text-dark truncate">{selectedFile.name}</span>
                  <span className="text-muted text-[10px] shrink-0">({selectedFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-rose-500 hover:text-rose-700 font-bold text-xs ml-2 shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex justify-center -mt-1">
                <button
                  type="button"
                  onClick={handleSimulateSampleRx}
                  className="text-[11px] sm:text-xs text-[#008F83] font-semibold hover:underline inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Attach demo sample prescription (1-Click Test)</span>
                </button>
              </div>
            )}

            {/* Guidelines - Compact & clean on mobile */}
            <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-border text-xs space-y-1">
              <span className="font-bold text-slate-800 text-[11px] block">Prescription Requirements:</span>
              <div className="flex items-center gap-1.5 text-slate-600 text-[10.5px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Doctor's name, clinic & medical registration number</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 text-[10.5px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Patient name, age and consultation date</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 text-[10.5px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Medication dosage, frequency & signature</span>
              </div>
            </div>

            {/* Patient Note */}
            <div>
              <label className="text-[11px] sm:text-xs font-semibold text-dark block mb-1">
                Instructions for Pharmacist (Optional)
              </label>
              <textarea
                rows={1}
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                placeholder="e.g. Deliver 30 days dosage, call between 2-4 PM..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-border focus:border-[#008F83] focus:ring-2 focus:ring-[#008F83]/15 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#008F83] hover:bg-[#007A70] text-white py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-75 shadow-xs"
            >
              {isSubmitting ? (
                <span>Submitting Prescription...</span>
              ) : (
                <>
                  <span>Submit Prescription</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-muted text-center pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>100% Confidential • Healthcare Privacy Compliant</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
