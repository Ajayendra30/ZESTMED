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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-dropdown border border-border w-full max-w-lg max-h-[92vh] flex flex-col overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark">Upload Doctor's Prescription</h3>
              <p className="text-xs text-muted">Licensed pharmacists will review and prepare your order</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-bold text-dark">Prescription Uploaded Successfully!</h4>
            <p className="text-xs text-muted mt-2 max-w-sm mx-auto leading-relaxed">
              Our registered pharmacist is reviewing your prescription ({selectedFile?.name}). You will receive an SMS and WhatsApp notification with medicine pricing and confirmation within 15 minutes.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 text-left mt-5 space-y-1">
              <div className="font-semibold">Simulated Workflow Status:</div>
              <div>• Ticket ID: #RX-ZEST-{Math.floor(10000 + Math.random() * 90000)}</div>
              <div>• Verification Desk: In Review (Demo)</div>
              <div>• Pharmacist Call Window: 10:00 AM - 10:30 AM</div>
            </div>
            <button
              onClick={handleReset}
              className="mt-6 btn-primary w-full py-2.5 text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Upload Box */}
            <div className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center bg-primary-50/30 hover:bg-primary-50/60 transition group cursor-pointer relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-12 h-12 rounded-full bg-white shadow-xs text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-semibold text-dark">
                Drag & Drop prescription or click to browse
              </h5>
              <p className="text-xs text-muted mt-1">
                Supports JPG, PNG, or PDF formats up to 10MB
              </p>
            </div>

            {/* Attached file chip */}
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-dark truncate">{selectedFile.name}</span>
                  <span className="text-muted text-[11px] shrink-0">({selectedFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-rose-500 hover:text-rose-700 font-semibold text-xs ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSimulateSampleRx}
                  className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Or attach demo sample prescription (1-Click Test)</span>
                </button>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-border text-xs space-y-1.5">
              <span className="font-semibold text-dark block mb-1">Prescription Requirements:</span>
              <div className="flex items-center gap-2 text-muted text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Doctor's name, clinic details and medical registration number</span>
              </div>
              <div className="flex items-center gap-2 text-muted text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Patient name, age and consultation date</span>
              </div>
              <div className="flex items-center gap-2 text-muted text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Medication dosage, frequency and doctor's signature</span>
              </div>
            </div>

            {/* Patient Note */}
            <div>
              <label className="text-xs font-semibold text-dark block mb-1">
                Additional Instructions for Pharmacist (Optional)
              </label>
              <textarea
                rows={2}
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                placeholder="e.g. Please deliver for 30 days dosage, call between 2-4 PM..."
                className="w-full p-2.5 text-xs rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-2.5 text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-75"
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

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-brand" />
              <span>100% Confidential & Handled Under Healthcare Privacy Standards</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
