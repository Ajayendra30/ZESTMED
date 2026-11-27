// src/components/admin/ReportsManagementView.jsx
import React, { useState } from 'react';
import { 
  FileCheck, Search, Filter, Download, Eye, UploadCloud, 
  CheckCircle2, Clock, AlertCircle, FileText, Share2, Plus, 
  Printer, ArrowUpRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { openClinicalReportPdf } from '../../utils/pdfGenerator';

export default function ReportsManagementView({
  diagnosticLabBookings = [],
  onOpenDigitalReport,
  onUpdateReportStatus
}) {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedBookingForUpload, setSelectedBookingForUpload] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const filteredReports = diagnosticLabBookings.filter(b => {
    const isReady = b.status?.includes('Complete') || b.status?.includes('Verified') || b.reportUrl;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'ready' && isReady) ||
      (statusFilter === 'processing' && !isReady && !b.status?.includes('Pending')) ||
      (statusFilter === 'pending' && b.status?.includes('Pending'));

    const q = searchQuery.toLowerCase().trim();
    const patientName = (b.patientName || b.patient_name || '').toLowerCase();
    const testName = (b.testName || b.test_name || '').toLowerCase();
    const bookingRef = (b.id || b.booking_number || '').toLowerCase();

    return matchesStatus && (!q || patientName.includes(q) || testName.includes(q) || bookingRef.includes(q));
  });

  const handleDownloadPdf = (booking) => {
    try {
      openClinicalReportPdf(booking);
      addToast(`Opening verified diagnostic report for ${booking.patientName || booking.patient_name}`, 'success');
    } catch (_) {
      addToast('Could not open clinical PDF report', 'error');
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookingForUpload) {
      addToast('Please select a patient booking to attach the report', 'error');
      return;
    }
    if (!uploadedFileName) {
      addToast('Please choose a laboratory PDF report file to upload', 'error');
      return;
    }

    if (onUpdateReportStatus) {
      onUpdateReportStatus(selectedBookingForUpload.id, 'Verified & Ready', `/reports/${uploadedFileName}`);
    }
    addToast(`Laboratory report attached successfully for #${selectedBookingForUpload.id || selectedBookingForUpload.booking_number}`, 'success');
    setIsUploadModalOpen(false);
    setSelectedBookingForUpload(null);
    setUploadedFileName('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <FileCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Reports Management
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              {diagnosticLabBookings.length} Total Reports
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish, review, digitize, and distribute NABL-accredited laboratory pathology test reports to patients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="px-3.5 py-2 text-xs font-bold text-white bg-[#007A64] hover:bg-[#006852] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Lab Report (PDF)</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Verified & Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {diagnosticLabBookings.filter(b => b.status?.includes('Complete') || b.status?.includes('Verified')).length || 4}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">100% Pathologist Signed</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Under Laboratory Testing</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {diagnosticLabBookings.filter(b => !b.status?.includes('Complete') && !b.status?.includes('Pending')).length || 2}
          </div>
          <span className="text-[10px] text-amber-600 font-bold">In-Transit / Biochemistry Auto-Analyzer</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Pending Sample Collection</span>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {diagnosticLabBookings.filter(b => b.status?.includes('Pending')).length || 1}
          </div>
          <span className="text-[10px] text-blue-600 font-bold">Home Phlebotomy Dispatched</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Report Statuses</option>
            <option value="ready">Verified & Ready</option>
            <option value="processing">In Analysis</option>
            <option value="pending">Pending Collection</option>
          </select>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report ID, patient, test..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Report / Booking Ref</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Pathology Test</th>
                <th className="py-3 px-4">Sample Details</th>
                <th className="py-3 px-4">Collection Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No diagnostic reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((b) => {
                  const isReady = b.status?.includes('Complete') || b.status?.includes('Verified') || b.reportUrl;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{b.id || b.booking_number}</span>
                        <span className="text-[10px] text-teal-700 font-semibold">NABL Accredited</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.patientName || b.patient_name || 'Patient'}</div>
                        <div className="text-[10px] text-slate-400">{b.phone || b.patientPhone || 'Guwahati'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{b.testName || b.test_name || 'Complete Blood Count (CBC)'}</div>
                        <div className="text-[10px] text-slate-400">Barcode: {b.barcode || `ZM-BC-${Math.floor(1000 + Math.random() * 9000)}`}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {b.sampleType || 'Whole Blood (EDTA)'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div>{b.collectionDate || b.date || 'Today'}</div>
                        <span className="text-[10px] text-slate-400">{b.collectionSlot || b.time || 'Morning Slot'}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isReady ? 'Ready & Verified' : 'Under Testing'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {onOpenDigitalReport && (
                            <button
                              type="button"
                              onClick={() => onOpenDigitalReport(b)}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="View Laboratory Values"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(b)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                            title="Download Clinical PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Lab Report Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <UploadCloud className="w-5 h-5" />
                </span>
                <h3 className="font-black text-slate-900 text-base">Upload Official Lab Report (PDF)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Patient Diagnostic Booking *</label>
                <select
                  required
                  value={selectedBookingForUpload?.id || ''}
                  onChange={(e) => {
                    const found = diagnosticLabBookings.find(b => b.id === e.target.value);
                    setSelectedBookingForUpload(found || null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none"
                >
                  <option value="">-- Choose Test Booking --</option>
                  {diagnosticLabBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id || b.booking_number} - {b.patientName || b.patient_name} ({b.testName || b.test_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Signatory Pathologist</label>
                <input
                  type="text"
                  readOnly
                  value="Dr. N. Bora, MBBS, MD (Pathology) - Lead Histopathologist"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Laboratory Report Document (PDF) *</label>
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => setUploadedFileName(e.target.files[0]?.name || '')}
                  className="w-full px-3 py-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-700 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 cursor-pointer"
                />
                {uploadedFileName && (
                  <span className="text-[11px] text-teal-700 font-bold block mt-1">
                    Selected file: {uploadedFileName}
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Confirm & Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
