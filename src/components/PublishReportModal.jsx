// src/components/PublishReportModal.jsx
import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Check, UploadCloud, Paperclip } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function PublishReportModal({ isOpen = true, onClose, job, onPublishReport, onPublish }) {
  const { addToast } = useToast();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState('');

  // Initial parameters based on test type
  const getInitialParameters = () => {
    if (job?.testName?.includes('CBC')) {
      return [
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'Normal' },
        { name: 'Total Leukocyte Count (TLC)', value: '7,100', unit: '/cumm', normalRange: '4,000 - 11,000', status: 'Normal' },
        { name: 'Platelet Count', value: '2.30', unit: 'Lakh/cumm', normalRange: '1.50 - 4.50', status: 'Normal' },
        { name: 'RBC Count', value: '4.85', unit: 'mil/cumm', normalRange: '4.50 - 5.50', status: 'Normal' },
        { name: 'ESR (Westergren)', value: '9', unit: 'mm/hr', normalRange: '0 - 15', status: 'Normal' }
      ];
    } else if (job?.testName?.includes('Vitamin')) {
      return [
        { name: '25-OH Vitamin D (Total)', value: '22.4', unit: 'ng/mL', normalRange: '30.0 - 100.0', status: 'Deficient' },
        { name: 'Vitamin B12 (Cyanocobalamin)', value: '385', unit: 'pg/mL', normalRange: '211 - 911', status: 'Normal' }
      ];
    } else if (job?.testName?.includes('Lipid')) {
      return [
        { name: 'Total Cholesterol', value: '182', unit: 'mg/dL', normalRange: '< 200', status: 'Normal' },
        { name: 'Triglycerides', value: '145', unit: 'mg/dL', normalRange: '< 150', status: 'Normal' },
        { name: 'HDL Cholesterol (Good)', value: '48', unit: 'mg/dL', normalRange: '> 40', status: 'Normal' },
        { name: 'LDL Cholesterol (Calculated)', value: '105', unit: 'mg/dL', normalRange: '< 100', status: 'Normal' }
      ];
    } else if (job?.testName?.includes('HbA1c') || job?.testName?.includes('Diabetes')) {
      return [
        { name: 'HbA1c Glycated Hemoglobin', value: '5.8', unit: '%', normalRange: '< 5.7', status: 'Normal' },
        { name: 'Estimated Average Glucose (eAG)', value: '120', unit: 'mg/dL', normalRange: '70 - 140', status: 'Normal' }
      ];
    } else {
      return [
        { name: 'Serum Bilirubin (Total)', value: '0.8', unit: 'mg/dL', normalRange: '0.2 - 1.2', status: 'Normal' },
        { name: 'SGOT / AST', value: '28', unit: 'U/L', normalRange: '< 40', status: 'Normal' },
        { name: 'SGPT / ALT', value: '31', unit: 'U/L', normalRange: '< 45', status: 'Normal' },
        { name: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', normalRange: '0.7 - 1.3', status: 'Normal' }
      ];
    }
  };

  const [parameters, setParameters] = useState(getInitialParameters);
  const [pathologistNote, setPathologistNote] = useState('All biological parameters tested on calibrated automated analyzers. Values clinically validated.');
  const [pathologistConfirmed, setPathologistConfirmed] = useState(true);

  if (!isOpen || !job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      addToast('Report file size must be less than 15MB', 'error');
      return;
    }
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result);
      addToast(`Attached diagnostic report file: ${file.name}`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleParamChange = (index, newValue) => {
    setParameters(prev => prev.map((p, idx) => {
      if (idx === index) {
        return { ...p, value: newValue };
      }
      return p;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pathologistConfirmed) {
      addToast('Pathologist verification sign-off is required to publish official report.', 'error');
      return;
    }

    const handler = onPublishReport || onPublish;
    if (handler) {
      handler(job.id, {
        findings: parameters,
        pathologistNote,
        reportingDoctor: 'Dr. Pranabesh Sarma, MD Pathology (AMC-29182-AS)',
        publishedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reportUrl: fileDataUrl || job.reportUrl || '',
        reportFileName: uploadedFile?.name || ''
      });
    }

    addToast(`Clinical Diagnostic Report published for ${job.patientName} (${job.id})!`, 'success');
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
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Authorize & Publish Clinical Lab Report</h3>
              <p className="text-[11px] text-primary-100">Guwahati Central Reference Lab • Barcode: {job.barcode || 'AS-BC-PENDING'}</p>
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Patient Header */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 text-sm block">{job.patientName}</span>
              <span className="text-[11px] text-slate-500 font-medium">
                {job.age} Yrs / {job.gender} • Test: {job.testName}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Specimen Barcode</span>
              <span className="font-mono font-bold text-primary text-xs">{job.barcode || 'AS-BC-781001-9041'}</span>
            </div>
          </div>

          {/* Upload Diagnostic Report Document (PDF / Scan) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-teal-600" />
                <span>Upload Signed Diagnostic Report File (PDF, Scanned Lab Copy)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Optional (Auto-signed PDF generated if omitted)</span>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-white transition hover:bg-teal-50/20">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Paperclip className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">
                  {uploadedFile ? uploadedFile.name : 'Click to browse official laboratory PDF / Scan (Max 15MB)'}
                </span>
              </label>
              {uploadedFile && (
                <button
                  type="button"
                  onClick={() => { setUploadedFile(null); setFileDataUrl(''); }}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {uploadedFile && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>File attached successfully ({(uploadedFile.size / 1024).toFixed(1)} KB). This document will be accessible to the patient upon publishing.</span>
              </p>
            )}
          </div>

          {/* Clinical Findings Inputs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Analyzed Biomarker Readings ({parameters.length} Parameters)
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-2 px-3">Parameter Name</th>
                    <th className="py-2 px-3 text-center">Observed Value</th>
                    <th className="py-2 px-3 text-center">Ref Interval</th>
                    <th className="py-2 px-3 text-center">Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parameters.map((param, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {param.name}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="text"
                          required
                          value={param.value}
                          onChange={(e) => handleParamChange(idx, e.target.value)}
                          className="w-24 text-center py-1 px-2 rounded-lg border border-slate-300 font-bold font-mono focus:outline-none focus:border-primary text-slate-900 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {param.normalRange}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400 text-[10.5px]">
                        {param.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pathologist Remarks */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Pathologist Diagnostic Review & Clinical Correlation
            </label>
            <textarea
              rows={2}
              required
              value={pathologistNote}
              onChange={(e) => setPathologistNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 text-xs resize-none"
            />
          </div>

          {/* Pathologist Sign-Off Checkbox */}
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="pathologistSign"
              checked={pathologistConfirmed}
              onChange={(e) => setPathologistConfirmed(e.target.checked)}
              className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-700 cursor-pointer mt-0.5"
            />
            <label htmlFor="pathologistSign" className="text-teal-900 font-semibold cursor-pointer text-xs leading-relaxed">
              Digitally signed and authorized by <span className="font-bold">Dr. Pranabesh Sarma, MD Pathology</span> (Assam Medical Council Reg No: AMC-29182-AS). This report will become immediately visible in the Patient Portal and dispatched via WhatsApp/SMS.
            </label>
          </div>

          {/* Actions */}
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
              className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Publish Official Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
