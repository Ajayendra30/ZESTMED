// src/components/DigitalLabReportModal.jsx
import React from 'react';
import { X, FileText, Download, Printer, Share2, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getDiagnosticParameters, shareClinicalReport } from '../utils/reportGenerator';
import { downloadClinicalReportPdf, openClinicalReportPdf } from '../utils/pdfGenerator';

export default function DigitalLabReportModal({ isOpen = true, onClose, booking }) {
  const { addToast } = useToast();

  if (!isOpen || !booking) return null;

  const reportId = booking.id || booking.bookingId || 'ZM-REP-9041';
  const testName = booking.testName || booking.test || 'Diagnostic Investigation';
  const sampleBarcode = booking.barcode || `AS-LAB-${reportId.replace(/\D/g, '') || '781001'}`;
  const reportRows = (booking.reportData && booking.reportData.length > 0)
    ? booking.reportData
    : getDiagnosticParameters(testName);

  const fullReportObject = {
    ...booking,
    id: reportId,
    bookingId: reportId,
    testName,
    test: testName,
    barcode: sampleBarcode,
    reportData: reportRows
  };

  const handleDownload = () => {
    downloadClinicalReportPdf(fullReportObject);
    addToast(`Clinical Diagnostic PDF downloaded for ${testName} (${reportId}).`, 'success');
  };

  const handleOpenPdf = () => {
    openClinicalReportPdf(fullReportObject);
    addToast('Opening official signed PDF in a new tab...', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    shareClinicalReport(fullReportObject, addToast);
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
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Official Clinical Lab Report
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {testName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Share Report"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 shadow-sm"
              title="Open PDF in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#008F83] hover:bg-[#007A6F] text-white text-xs font-bold transition shadow-sm"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6 text-dark font-sans">
          {/* Diagnostic Laboratory Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-primary/20 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Zestmed Diagnostics & Polyclinic" className="h-8 sm:h-9 w-auto object-contain" />
                <span className="text-[11px] font-bold text-[#008F83] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  CENTRAL DIAGNOSTICS
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Zestmed Health Private Limited • Central Reference Laboratory
              </p>
              <p className="text-[11px] text-slate-500">
                GS Road, Dispur, Guwahati, Assam - 781005 • Helpline: +91 92791 25091
              </p>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <div className="text-xs font-mono font-bold text-slate-800">
                Report No: <span className="text-[#008F83]">{reportId}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Sample Barcode: {sampleBarcode}
              </div>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                NABL Guidelines Referenced
              </div>
            </div>
          </div>

          {/* Patient & Sample Details Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="block text-[10.5px] font-semibold text-slate-500 uppercase">Patient Name</span>
              <span className="font-bold text-slate-900">{booking.patientName || 'Ajayendra Shekhar'}</span>
            </div>
            <div>
              <span className="block text-[10.5px] font-semibold text-slate-500 uppercase">Age / Gender</span>
              <span className="font-bold text-slate-900">34 Yrs / Male</span>
            </div>
            <div>
              <span className="block text-[10.5px] font-semibold text-slate-500 uppercase">Collection Date</span>
              <span className="font-bold text-slate-900">{booking.collectionDate}</span>
            </div>
            <div>
              <span className="block text-[10.5px] font-semibold text-slate-500 uppercase">Specimen</span>
              <span className="font-bold text-slate-900">{booking.specimen || 'EDTA Whole Blood'}</span>
            </div>
            <div>
              <span className="block text-[10.5px] font-semibold text-slate-500 uppercase">Collection District</span>
              <span className="font-bold text-slate-900">Guwahati, Assam</span>
            </div>
            <div>
              <span className="block text-[10.5px] font-semibold text-slate-500 uppercase">Phlebotomist</span>
              <span className="font-bold text-slate-900">{booking.phlebotomist?.name || 'Assam Dispatch'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[10.5px] font-semibold text-slate-500 uppercase">Reporting Doctor</span>
              <span className="font-bold text-slate-900">{booking.reportingDoctor || 'Dr. Pranabesh Sarma, MD Pathology'}</span>
            </div>
          </div>

          {/* Results Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Investigation Results ({testName})
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                Methodology: Automated Photometry & Cell Counter
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-4">Test Parameter</th>
                    <th className="py-2.5 px-4 text-center">Observed Result</th>
                    <th className="py-2.5 px-4 text-center">Biological Reference</th>
                    <th className="py-2.5 px-4 text-center">Units</th>
                    <th className="py-2.5 px-4 text-right">Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportRows && reportRows.length > 0 ? (
                    reportRows.map((row, idx) => {
                      const isAbnormal = row.status === 'Deficient' || row.flag === 'LOW' || row.flag === 'HIGH';
                      return (
                        <tr key={idx} className={isAbnormal ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">
                            {row.name}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold font-mono">
                            <span className={isAbnormal ? 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-black' : 'text-slate-900'}>
                              {row.value}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center text-slate-600 font-mono text-[11.5px]">
                            {row.normalRange}
                          </td>
                          <td className="py-2.5 px-4 text-center text-slate-500 text-[11px]">
                            {row.unit}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            {isAbnormal ? (
                              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                {row.flag || 'Low'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                        Diagnostic report undergoing lab verification. Phlebotomy sample safely logged at Guwahati Central Hub.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pathologist Remark & Clinical Disclaimer */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Pathologist Note & Clinical Correlation:</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "{booking.pathologistRemark || 'All parameters reviewed and validated under certified automated clinical instrumentation.'}"
            </p>
          </div>

          {/* Signatures & Accreditation Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 text-[11px] text-slate-500">
              <p>• This is a computer-verified diagnostic lab report generated for demonstration purposes.</p>
              <p>• Tested at ZESTMED Central Diagnostic Hub, GS Road, Dispur, Guwahati - 781005.</p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="font-script text-lg text-primary font-bold italic tracking-wide">
                Dr. Pranabesh Sarma
              </div>
              <div className="text-xs font-bold text-slate-900">Dr. Pranabesh Sarma, MD Pathology</div>
              <div className="text-[10.5px] text-slate-500 font-mono">Assam Medical Council Reg: AMC-29182-AS</div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Report authenticated with ZESTMED Assam Central LIMS
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-5 font-semibold"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
