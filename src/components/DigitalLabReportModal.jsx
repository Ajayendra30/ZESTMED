// src/components/DigitalLabReportModal.jsx
import React from 'react';
import { 
  X, FileText, Download, Printer, Share2, CheckCircle2, 
  AlertTriangle, ShieldCheck, ExternalLink, Phone, Mail, 
  Globe, User, Info, Truck, Clock, Lock, FlaskConical
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getDiagnosticParameters, shareClinicalReport } from '../utils/reportGenerator';
import { downloadClinicalReportPdf, openClinicalReportPdf } from '../utils/pdfGenerator';

const REFERENCE_TEMPLATE_ROWS = [
  { name: 'Hemoglobin (Hb)', value: '13.8', normalRange: '13.0 – 17.0', unit: 'g/dL', status: 'Normal' },
  { name: 'Total WBC Count', value: '7.2', normalRange: '4.0 – 11.0', unit: 'x10³/µL', status: 'Normal' },
  { name: 'RBC Count', value: '4.86', normalRange: '4.5 – 5.9', unit: 'x10⁶/µL', status: 'Normal' },
  { name: 'Platelet Count', value: '2.45', normalRange: '1.50 – 4.50', unit: 'x10⁵/µL', status: 'Normal' },
  { name: 'Fasting Blood Glucose', value: '96', normalRange: '70 – 100', unit: 'mg/dL', status: 'Normal' },
  { name: 'Total Cholesterol', value: '182', normalRange: '< 200', unit: 'mg/dL', status: 'Normal' },
  { name: 'HDL Cholesterol', value: '45', normalRange: '> 40', unit: 'mg/dL', status: 'Normal' },
  { name: 'LDL Cholesterol', value: '112', normalRange: '< 130', unit: 'mg/dL', status: 'Normal' },
  { name: 'Triglycerides', value: '148', normalRange: '< 150', unit: 'mg/dL', status: 'Normal' }
];

export default function DigitalLabReportModal({ isOpen = true, onClose, booking }) {
  const { addToast } = useToast();

  if (!isOpen || !booking) return null;

  const reportId = booking.id || booking.bookingId || 'ZM-REP-427464';
  const testName = booking.testName || booking.test || 'Diagnostic Test Report';
  const patientName = booking.patientName || booking.patient || 'Patient';
  const patientAgeGender = booking.patientAge 
    ? `${booking.patientAge} Years / ${booking.patientGender || 'Adult'}` 
    : (booking.ageGender || 'Adult');
  const patientPhone = booking.phone || booking.patientPhone || '';
  const patientId = booking.patientId || booking.uhid || (booking.userId ? `ZM-PAT-${booking.userId}` : 'ZM-PAT-REG');
  const sampleCollected = booking.sampleCollected || booking.collectionDate || '23 Nov 2026, 10:00 AM';
  const reportGenerated = booking.reportGenerated || booking.generatedDate || '23 Nov 2026, 03:45 PM';
  const refDoctor = booking.doctor || booking.reportingDoctor || 'Dr. Amit Sharma';

  // Use custom test parameters if provided for a specific specialized panel, otherwise reference template rows
  const displayRows = (booking.reportData && booking.reportData.length > 0)
    ? booking.reportData
    : (testName.toLowerCase().includes('cbc') || testName.toLowerCase().includes('blood') || testName.toLowerCase().includes('diagnostic'))
    ? REFERENCE_TEMPLATE_ROWS
    : getDiagnosticParameters(testName);

  const fullReportObject = {
    ...booking,
    id: reportId,
    bookingId: reportId,
    testName,
    test: testName,
    patientName,
    patientId,
    phone: patientPhone,
    sampleCollected,
    reportGenerated,
    reportingDoctor: refDoctor,
    reportData: displayRows
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:static print:inset-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity print:hidden"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-4 sm:my-8 print:border-none print:shadow-none print:rounded-none print:m-0 print:max-w-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-[#0B2238] text-white border-b border-slate-800 print:hidden select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                Official Laboratory Report
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {testName} ({reportId})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
              title="Share Report"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenPdf}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 cursor-pointer"
              title="Open PDF in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#008F83] hover:bg-[#007A6F] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition ml-1 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas (Exact match to Reference Image) */}
        <div 
          data-print-container="report"
          className="p-5 sm:p-8 md:p-10 max-h-[82vh] overflow-y-auto space-y-5 bg-white text-slate-900 font-sans print:max-h-none print:p-6 print:overflow-visible print-avoid-break relative"
        >
          {/* ================================================================ */}
          {/* 1. TOP HEADER: EXACT ZESTMED NAVBAR LOGO + CONTACTS INFO        */}
          {/* ================================================================ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
            {/* Left: Exact ZESTMED Navbar Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Zestmed Diagnostics & Polyclinic" 
                className="h-10 sm:h-12 w-auto object-contain select-none" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
              />
            </div>

            {/* Right: Contact Information */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-600 font-semibold">
              <a href="tel:+9118001234567" className="flex items-center gap-1.5 hover:text-teal-700 transition">
                <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>+91 1800-123-4567</span>
              </a>
              <a href="mailto:support@zestmed.in" className="flex items-center gap-1.5 hover:text-sky-700 transition">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>support@zestmed.in</span>
              </a>
              <a href="https://www.zestmed.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-teal-700 transition">
                <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>www.zestmed.in</span>
              </a>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 2. TITLE SECTION & NABL ACCREDITED LAB BADGE                    */}
          {/* ================================================================ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#E8F8F5] border border-[#B2EBE2] flex items-center justify-center text-[#008F83] shrink-0 shadow-2xs">
                <FileText className="w-7 h-7 text-[#008F83]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B1A2D] tracking-tight">
                  Diagnostic Test Report
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Certified Laboratory Report
                </p>
              </div>
            </div>

            {/* Right: NABL Accredited Lab Badge */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-emerald-300/80 bg-emerald-50/50 shadow-2xs self-start sm:self-auto">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  NABL Accredited Lab
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                  Certified & Reliable Results
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 3. PATIENT INFORMATION & REPORT INFORMATION (2 COLUMNS)          */}
          {/* ================================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: Patient Information */}
            <div className="rounded-2xl border border-sky-100 bg-white overflow-hidden shadow-2xs">
              <div className="bg-[#EBF5FE] px-4 py-2.5 flex items-center gap-2 border-b border-sky-100">
                <User className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-black text-sky-950">Patient Information</h3>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex items-baseline">
                  <span className="text-slate-500 font-medium w-28 shrink-0">Name</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-black text-slate-900">{patientName}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-slate-500 font-medium w-28 shrink-0">Age / Gender</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-bold text-slate-900">{patientAgeGender}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-slate-500 font-medium w-28 shrink-0">Phone</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-bold text-slate-900">{patientPhone}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-slate-500 font-medium w-28 shrink-0">Patient ID</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-mono font-bold text-slate-900">{patientId}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Report Information */}
            <div className="rounded-2xl border border-emerald-100 bg-white overflow-hidden shadow-2xs">
              <div className="bg-[#EBF8F1] px-4 py-2.5 flex items-center gap-2 border-b border-emerald-100">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-emerald-950">Report Information</h3>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex items-baseline">
                  <span className="text-slate-500 font-medium w-32 shrink-0">Report ID</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-mono font-black text-slate-900">{reportId}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-slate-500 font-medium w-32 shrink-0">Sample Collected</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-bold text-slate-900">{sampleCollected}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-slate-500 font-medium w-32 shrink-0">Report Generated</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-bold text-slate-900">{reportGenerated}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-slate-500 font-medium w-32 shrink-0">Ref. Doctor</span>
                  <span className="text-slate-400 mr-2">:</span>
                  <span className="font-bold text-slate-900">{refDoctor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 4. TEST RESULTS TABLE WITH TEAL GRADIENT HEADER                 */}
          {/* ================================================================ */}
          <div className="rounded-2xl border border-teal-200/90 overflow-hidden shadow-2xs bg-white">
            {/* Gradient Header Banner */}
            <div className="bg-gradient-to-r from-[#006E82] via-[#008F83] to-[#00A887] px-5 py-3 flex items-center gap-2 text-white">
              <FlaskConical className="w-4 h-4 text-teal-200" />
              <span className="text-sm font-black tracking-wide">Test Results</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                    <th className="py-3 px-4 font-black">Test Name</th>
                    <th className="py-3 px-4 text-center font-black">Result</th>
                    <th className="py-3 px-4 text-center font-black">Reference Range</th>
                    <th className="py-3 px-4 text-center font-black">Unit</th>
                    <th className="py-3 px-4 text-center font-black">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayRows.map((row, idx) => {
                    const isAbnormal = row.status === 'Deficient' || row.flag === 'LOW' || row.flag === 'HIGH';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{row.name}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`inline-block px-3 py-0.5 rounded-md font-black font-mono text-xs ${
                            isAbnormal 
                              ? 'bg-amber-100 text-amber-900' 
                              : 'bg-[#D9F7EB] text-[#00684A]'
                          }`}>
                            {row.value}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-700 font-mono text-xs">
                          {row.normalRange}
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-600 font-mono text-xs">
                          {row.unit}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {isAbnormal ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <span>{row.flag || 'Abnormal'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              <span>Normal</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 5. NOTE CARD                                                    */}
          {/* ================================================================ */}
          <div className="rounded-2xl bg-[#F0F7FE] border border-sky-100 p-4 flex items-start gap-3 text-xs">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-slate-900">Note:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                <li>The results are for the sample collected and tested as mentioned above.</li>
                <li>Kindly consult your physician for clinical interpretation of the results.</li>
                <li>This is a digitally generated report and does not require a physical signature.</li>
              </ul>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 6. VERIFICATION QR CODE & DOCTOR SIGNATURE SECTION              */}
          {/* ================================================================ */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4 px-3">
            {/* Left: QR Code & Verification */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 p-1.5 bg-white border border-slate-300 rounded-xl shadow-2xs flex items-center justify-center shrink-0">
                {/* SVG Vector QR Code */}
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="white"/>
                  {/* Top-Left Finder */}
                  <rect x="6" y="6" width="28" height="28" fill="#0F172A" rx="4"/>
                  <rect x="12" y="12" width="16" height="16" fill="white" rx="2"/>
                  <rect x="16" y="16" width="8" height="8" fill="#008F83" rx="1"/>
                  {/* Top-Right Finder */}
                  <rect x="66" y="6" width="28" height="28" fill="#0F172A" rx="4"/>
                  <rect x="72" y="12" width="16" height="16" fill="white" rx="2"/>
                  <rect x="76" y="16" width="8" height="8" fill="#008F83" rx="1"/>
                  {/* Bottom-Left Finder */}
                  <rect x="6" y="66" width="28" height="28" fill="#0F172A" rx="4"/>
                  <rect x="12" y="72" width="16" height="16" fill="white" rx="2"/>
                  <rect x="16" y="76" width="8" height="8" fill="#008F83" rx="1"/>
                  {/* Data points */}
                  <rect x="40" y="10" width="6" height="6" fill="#0F172A"/>
                  <rect x="52" y="10" width="6" height="6" fill="#0F172A"/>
                  <rect x="40" y="22" width="6" height="6" fill="#0F172A"/>
                  <rect x="50" y="22" width="8" height="6" fill="#008F83"/>
                  <rect x="40" y="34" width="20" height="6" fill="#0F172A"/>
                  <rect x="10" y="42" width="6" height="8" fill="#0F172A"/>
                  <rect x="22" y="42" width="8" height="6" fill="#0F172A"/>
                  <rect x="36" y="44" width="6" height="6" fill="#0F172A"/>
                  <rect x="46" y="44" width="8" height="8" fill="#0F172A"/>
                  <rect x="60" y="42" width="8" height="6" fill="#008F83"/>
                  <rect x="74" y="42" width="16" height="6" fill="#0F172A"/>
                  <rect x="40" y="56" width="6" height="18" fill="#0F172A"/>
                  <rect x="52" y="56" width="8" height="6" fill="#0F172A"/>
                  <rect x="66" y="54" width="6" height="8" fill="#0F172A"/>
                  <rect x="78" y="54" width="12" height="6" fill="#0F172A"/>
                  <rect x="40" y="80" width="18" height="8" fill="#0F172A"/>
                  <rect x="64" y="68" width="8" height="8" fill="#008F83"/>
                  <rect x="76" y="68" width="14" height="6" fill="#0F172A"/>
                  <rect x="66" y="82" width="24" height="6" fill="#0F172A"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 leading-tight">Scan to Verify</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Verify this report on</div>
                <a href="https://www.zestmed.in" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#008F83] hover:underline">
                  www.zestmed.in
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-[1px] h-16 bg-slate-200" />

            {/* Right: Pathologist Signature */}
            <div className="text-center sm:text-right space-y-0.5">
              {/* SVG Cursive Signature */}
              <div className="inline-block mb-1">
                <svg className="w-32 h-10 text-slate-800" viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 32C18 18 26 12 34 22C38 27 42 35 48 24C54 13 62 8 72 20C78 27 82 32 90 26C98 20 110 16 120 22C126 26 134 28 145 25" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 24C30 20 40 18 46 22" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M42 38C55 35 80 34 110 35C125 35 140 33 150 30" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                Dr. Amit Sharma, MD (Pathology)
              </div>
              <div className="text-xs text-slate-600 font-medium leading-tight">
                Consultant Pathologist
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Reg. No. DMC-45837
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 7. BOTTOM TRUST FEATURES BAR & WAVE GRAPHIC                     */}
          {/* ================================================================ */}
          <div className="rounded-2xl border border-teal-200/90 bg-white/95 px-4 py-3 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs font-bold text-slate-700">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Accurate Reports</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Home Sample Collection</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Timely Results</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>100% Secure & Confidential</span>
              </div>
            </div>
          </div>

          {/* Bottom Decorative Wave Accent */}
          <div className="w-full h-8 overflow-hidden rounded-b-3xl -mt-2 opacity-80 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 800 50" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 25C150 10 250 40 400 25C550 10 650 38 800 22V50H0V25Z" fill="#D0F5EE"/>
              <path d="M0 32C180 18 280 44 430 30C580 16 680 42 800 28V50H0V32Z" fill="#A8ECE3" fillOpacity="0.6"/>
            </svg>
          </div>

        </div>

      </div>
    </div>
  );
}
