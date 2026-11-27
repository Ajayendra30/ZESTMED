// src/utils/reportGenerator.js
// Generates official clinical diagnostic report data, downloadable report documents, and sharing handlers
import { downloadClinicalReportPdf, openClinicalReportPdf } from './pdfGenerator';

export { downloadClinicalReportPdf, openClinicalReportPdf };

export const getDiagnosticParameters = (testName = '') => {
  const lower = testName.toLowerCase();

  if (lower.includes('cbc') || lower.includes('blood count') || lower.includes('hemogram')) {
    return [
      { name: 'Hemoglobin (Hb)', value: '14.2', normalRange: '13.0 - 17.0', unit: 'g/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Total Leucocyte Count (WBC)', value: '6,800', normalRange: '4,000 - 11,000', unit: '/cumm', status: 'Normal', flag: 'NORMAL' },
      { name: 'Platelet Count', value: '245,000', normalRange: '150,000 - 450,000', unit: '/cumm', status: 'Normal', flag: 'NORMAL' },
      { name: 'Packed Cell Volume (PCV)', value: '42.8', normalRange: '40.0 - 50.0', unit: '%', status: 'Normal', flag: 'NORMAL' },
      { name: 'R.B.C. Count', value: '4.85', normalRange: '4.5 - 5.9', unit: 'mil/cumm', status: 'Normal', flag: 'NORMAL' },
      { name: 'Mean Corpuscular Volume (MCV)', value: '88.2', normalRange: '80.0 - 100.0', unit: 'fL', status: 'Normal', flag: 'NORMAL' },
      { name: 'MCH', value: '29.3', normalRange: '27.0 - 32.0', unit: 'pg', status: 'Normal', flag: 'NORMAL' },
      { name: 'MCHC', value: '33.2', normalRange: '31.5 - 34.5', unit: 'g/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Neutrophils', value: '64', normalRange: '40 - 75', unit: '%', status: 'Normal', flag: 'NORMAL' },
      { name: 'Lymphocytes', value: '28', normalRange: '20 - 45', unit: '%', status: 'Normal', flag: 'NORMAL' },
      { name: 'Eosinophils', value: '3', normalRange: '1 - 6', unit: '%', status: 'Normal', flag: 'NORMAL' },
      { name: 'Monocytes', value: '5', normalRange: '2 - 10', unit: '%', status: 'Normal', flag: 'NORMAL' }
    ];
  }

  if (lower.includes('lipid') || lower.includes('cholesterol')) {
    return [
      { name: 'Total Cholesterol', value: '174', normalRange: '< 200', unit: 'mg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'HDL Cholesterol (Good)', value: '48.5', normalRange: '> 40.0', unit: 'mg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'LDL Cholesterol (Calculated)', value: '98.2', normalRange: '< 100.0', unit: 'mg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Triglycerides', value: '136', normalRange: '< 150', unit: 'mg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'VLDL Cholesterol', value: '27.3', normalRange: '< 30.0', unit: 'mg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Total Chol / HDL Ratio', value: '3.58', normalRange: '3.30 - 4.40', unit: 'Ratio', status: 'Normal', flag: 'NORMAL' }
    ];
  }

  if (lower.includes('liver') || lower.includes('lft')) {
    return [
      { name: 'Total Bilirubin', value: '0.82', normalRange: '0.2 - 1.2', unit: 'mg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Direct Bilirubin', value: '0.20', normalRange: '0.0 - 0.3', unit: 'mg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Indirect Bilirubin', value: '0.62', normalRange: '0.1 - 0.9', unit: 'mg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'SGOT (AST)', value: '24', normalRange: '10 - 40', unit: 'U/L', status: 'Normal', flag: 'NORMAL' },
      { name: 'SGPT (ALT)', value: '28', normalRange: '7 - 56', unit: 'U/L', status: 'Normal', flag: 'NORMAL' },
      { name: 'Alkaline Phosphatase (ALP)', value: '86', normalRange: '44 - 147', unit: 'U/L', status: 'Normal', flag: 'NORMAL' },
      { name: 'Total Protein', value: '7.3', normalRange: '6.0 - 8.3', unit: 'g/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Serum Albumin', value: '4.4', normalRange: '3.5 - 5.2', unit: 'g/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'A:G Ratio', value: '1.51', normalRange: '1.2 - 2.2', unit: 'Ratio', status: 'Normal', flag: 'NORMAL' }
    ];
  }

  if (lower.includes('thyroid') || lower.includes('tsh') || lower.includes('t3')) {
    return [
      { name: 'Total Triiodothyronine (T3)', value: '1.20', normalRange: '0.80 - 2.00', unit: 'ng/mL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Total Thyroxine (T4)', value: '8.4', normalRange: '5.1 - 14.1', unit: 'μg/dL', status: 'Normal', flag: 'NORMAL' },
      { name: 'Thyroid Stimulating Hormone (TSH)', value: '2.14', normalRange: '0.35 - 4.94', unit: 'μIU/mL', status: 'Normal', flag: 'NORMAL' }
    ];
  }

  // Generic fallback clinical parameters
  return [
    { name: 'Primary Clinical Assay', value: 'Optimal', normalRange: 'Biological Baseline', unit: 'Index', status: 'Normal', flag: 'NORMAL' },
    { name: 'Control Calibrator Ref', value: 'Passed', normalRange: 'Calibrated', unit: 'Standard', status: 'Normal', flag: 'NORMAL' },
    { name: 'Automated Analyzer QC', value: 'Level 1 & 2 In Range', normalRange: '99.8% Confidence', unit: 'QC', status: 'Normal', flag: 'NORMAL' }
  ];
};

export const getMockReportDetails = (testName, dateStr, reportId, pathologist, patientInfo = {}) => {
  const parameters = getDiagnosticParameters(testName);
  return {
    id: reportId || 'ZM-REP-9041',
    bookingId: reportId || 'ZM-REP-9041',
    testName: testName,
    patientName: patientInfo.name || patientInfo.patientName || 'Patient',
    uhid: patientInfo.uhid || patientInfo.id || 'ZM-PAT-REG',
    collectionDate: dateStr || 'Nov 07, 2026',
    date: dateStr || 'Nov 07, 2026',
    specimen: String(testName || '').toLowerCase().includes('urine') ? 'Sterile Midstream Urine' : 'EDTA Whole Blood / Serum',
    reportingDoctor: pathologist || 'Dr. N. Bora, MD (Pathology)',
    pathologistRemark: 'All clinical parameters reviewed and confirmed within normal biological baseline. No acute abnormalities observed under automated instrumentation.',
    reportData: parameters,
    phlebotomist: { name: 'Bikash Das (Assam Central Hub)' },
    status: 'Report Ready'
  };
};

export const downloadClinicalReport = (report) => {
  downloadClinicalReportPdf(report);
};

export const shareClinicalReport = async (report, addToast) => {
  const testName = report.test || report.testName || 'Diagnostic Investigation';
  const reportId = report.id || report.bookingId || 'ZM-REP-9041';
  const shareUrl = `${window.location.origin}/patient-dashboard?report=${reportId}`;
  const shareText = `Official Diagnostic Lab Report for ${testName} (${reportId}) - ZESTMED Central Reference Laboratory, Guwahati.`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `ZESTMED Report - ${testName}`,
        text: shareText,
        url: shareUrl,
      });
      if (addToast) addToast('Report shared successfully!', 'success');
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    if (addToast) addToast('Secure doctor viewing link copied to clipboard!', 'info');
  } catch {
    if (addToast) addToast(`Report viewing link: ${shareUrl}`, 'info');
  }
};
