// src/utils/reportGenerator.js
// Generates official clinical diagnostic report data, downloadable report documents, and sharing handlers

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

export const getMockReportDetails = (testName, dateStr, reportId, pathologist) => {
  const parameters = getDiagnosticParameters(testName);
  return {
    id: reportId || 'ZM-REP-9041',
    bookingId: reportId || 'ZM-REP-9041',
    testName: testName,
    patientName: 'Rahul Verma',
    uhid: 'ZM-PAT-1082',
    collectionDate: dateStr || 'Nov 07, 2026',
    date: dateStr || 'Nov 07, 2026',
    specimen: testName.toLowerCase().includes('urine') ? 'Sterile Midstream Urine' : 'EDTA Whole Blood / Serum',
    reportingDoctor: pathologist || 'Dr. N. Bora, MD (Pathology)',
    pathologistRemark: 'All clinical parameters reviewed and confirmed within normal biological baseline. No acute abnormalities observed under automated instrumentation.',
    reportData: parameters,
    phlebotomist: { name: 'Bikash Das (Assam Central Hub)' },
    status: 'Report Ready'
  };
};

export const downloadClinicalReport = (report) => {
  const testName = report.test || report.testName || 'Diagnostic Investigation';
  const reportId = report.id || report.bookingId || 'ZM-REP-9041';
  const patientName = report.patientName || 'Rahul Verma';
  const uhid = report.uhid || 'ZM-PAT-1082';
  const dateStr = report.collectionDate || report.date || 'Nov 07, 2026';
  const specimen = report.specimen || 'EDTA Whole Blood / Serum';
  const pathologist = report.reportingDoctor || report.pathologist || 'Dr. N. Bora, MD (Pathology)';
  const remark = report.pathologistRemark || 'All parameters evaluated under automated standard calibration.';
  const parameters = report.reportData && report.reportData.length > 0 ? report.reportData : getDiagnosticParameters(testName);

  const rowsHtml = parameters.map((row) => {
    const isAbnormal = row.status === 'Deficient' || row.flag === 'LOW' || row.flag === 'HIGH';
    return `
      <tr style="${isAbnormal ? 'background-color: #fef2f2;' : ''}">
        <td style="padding: 10px 14px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${row.name}</td>
        <td style="padding: 10px 14px; text-align: center; font-weight: 700; color: ${isAbnormal ? '#b91c1c' : '#0f172a'}; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${row.value}</td>
        <td style="padding: 10px 14px; text-align: center; color: #64748b; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${row.normalRange}</td>
        <td style="padding: 10px 14px; text-align: center; color: #64748b; border-bottom: 1px solid #e2e8f0;">${row.unit}</td>
        <td style="padding: 10px 14px; text-align: right; border-bottom: 1px solid #e2e8f0;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${isAbnormal ? '#fee2e2' : '#dcfce7'}; color: ${isAbnormal ? '#991b1b' : '#166534'};">
            ${row.status || 'Normal'}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZESTMED Diagnostic Report - ${reportId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px; color: #1e293b; background: #ffffff; }
    .container { max-width: 820px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #0f766e; padding-bottom: 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand-title { font-size: 22px; font-weight: 900; color: #0f766e; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #475569; margin-top: 3px; font-weight: 500; }
    .badge { display: inline-block; background: #ccfbf1; color: #0f766e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; border: 1px solid #99f6e4; }
    .patient-card { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px; }
    .patient-card div span { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
    .patient-card div strong { font-size: 12px; color: #0f172a; }
    .investigation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .investigation-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 12px; }
    th { background: #0f766e; color: #ffffff; padding: 10px 14px; text-align: left; font-weight: 700; }
    .remarks { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 24px; font-size: 11.5px; color: #334155; }
    .footer { border-top: 2px solid #e2e8f0; padding-top: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
    .disclaimer { font-size: 10.5px; color: #64748b; max-width: 480px; line-height: 1.5; }
    .sign-box { text-align: right; }
    .sign-title { font-size: 12px; font-weight: 800; color: #0f172a; }
    .sign-sub { font-size: 10.5px; color: #64748b; }
    @media print {
      body { padding: 0; background: none; }
      .container { border: none; box-shadow: none; padding: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand-title">ZESTMED DIAGNOSTICS & POLYCLINIC</div>
        <div class="brand-sub">Central Clinical Reference Laboratory • NABL Accredited (ISO 15189:2022) • ICMR Approved</div>
        <div class="brand-sub">G.S. Road, Dispur, Guwahati, Assam - 781005 • Helpline: 1800-890-ZEST / +91 92791 25091</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">OFFICIAL CLINICAL REPORT</span>
        <div style="font-family: monospace; font-size: 11px; color: #475569; margin-top: 6px; font-weight: 700;">REPORT ID: ${reportId}</div>
        <div style="font-family: monospace; font-size: 10px; color: #94a3b8;">BARCODE: AS-LAB-${reportId.replace(/\D/g, '') || '781001'}</div>
      </div>
    </div>

    <div class="patient-card">
      <div><span>Patient Name</span><strong>${patientName}</strong></div>
      <div><span>UHID / Patient ID</span><strong>${uhid}</strong></div>
      <div><span>Age / Gender</span><strong>34 Yrs / Male</strong></div>
      <div><span>Collection Date</span><strong>${dateStr}</strong></div>
      <div><span>Specimen Type</span><strong>${specimen}</strong></div>
      <div><span>Collection Hub</span><strong>Guwahati Central Lab, Assam</strong></div>
    </div>

    <div class="investigation-header">
      <div class="investigation-title">Investigation: ${testName}</div>
      <div style="font-size: 11px; color: #64748b;">Methodology: Fully Automated Clinical Analyzer</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Test Parameter</th>
          <th style="text-align: center;">Observed Result</th>
          <th style="text-align: center;">Biological Reference</th>
          <th style="text-align: center;">Units</th>
          <th style="text-align: right;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="remarks">
      <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Pathologist Note & Clinical Interpretation:</strong>
      <em>"${remark}"</em>
    </div>

    <div class="footer">
      <div class="disclaimer">
        <p>• Verified against standard automated clinical calibration with daily internal quality controls.</p>
        <p>• This digital pathology report is electronically signed and legally valid under IT Act 2000 & Digital Health Standards.</p>
      </div>
      <div class="sign-box">
        <div style="font-family: cursive; font-size: 16px; color: #0f766e; font-weight: 700; margin-bottom: 4px;">${pathologist.split(',')[0]}</div>
        <div class="sign-title">${pathologist}</div>
        <div class="sign-sub">Consultant Clinical Pathologist</div>
        <div class="sign-sub" style="font-family: monospace;">Reg: AMC-29182-AS (Assam Medical Council)</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ZESTMED_Report_${(reportId).replace(/[^a-zA-Z0-9_-]/g, '_')}_${testName.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
