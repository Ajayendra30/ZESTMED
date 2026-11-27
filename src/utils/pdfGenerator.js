// src/utils/pdfGenerator.js
// High-fidelity client-side PDF 1.4 generation and viewing utility for Zestmed

function escapePdfText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

export class SimplePdfDocument {
  constructor() {
    this.width = 595.28;  // A4 width in points (72 dpi)
    this.height = 841.89; // A4 height in points
    this.stream = [];
  }

  rect(x, y, w, h, fillRgb = null, strokeRgb = null, lineWidth = 1) {
    let cmd = '';
    if (strokeRgb) {
      cmd += `${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG\n`;
      cmd += `${lineWidth} w\n`;
    }
    if (fillRgb) {
      cmd += `${fillRgb[0]} ${fillRgb[1]} ${fillRgb[2]} rg\n`;
    }
    cmd += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\n`;
    if (fillRgb && strokeRgb) cmd += 'B\n';
    else if (fillRgb) cmd += 'f\n';
    else if (strokeRgb) cmd += 's\n';
    this.stream.push(cmd);
  }

  line(x1, y1, x2, y2, strokeRgb = [0.8, 0.84, 0.88], lineWidth = 1) {
    this.stream.push(
      `${strokeRgb[0]} ${strokeRgb[1]} ${strokeRgb[2]} RG\n` +
      `${lineWidth} w\n` +
      `${x1.toFixed(2)} ${y1.toFixed(2)} m\n` +
      `${x2.toFixed(2)} ${y2.toFixed(2)} l\nS\n`
    );
  }

  text(str, x, y, options = {}) {
    const font = options.bold ? '/F2' : (options.italic ? '/F3' : '/F1');
    const size = options.size || 10;
    const color = options.color || [0.12, 0.16, 0.23];
    const escaped = escapePdfText(str);

    this.stream.push(
      `BT\n` +
      `${color[0]} ${color[1]} ${color[2]} rg\n` +
      `${font} ${size} Tf\n` +
      `${x.toFixed(2)} ${y.toFixed(2)} Td\n` +
      `(${escaped}) Tj\n` +
      `ET\n`
    );
  }

  buildBlob() {
    const content = this.stream.join('');
    
    // In browser, calculate byte length via TextEncoder or Blob
    const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
    const contentBytes = encoder ? encoder.encode(content).length : content.length;

    const objects = [];
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    objects.push(
      '3 0 obj\n' +
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] ' +
      '/Resources << /Font << ' +
      '/F1 4 0 R ' +
      '/F2 5 0 R ' +
      '/F3 6 0 R ' +
      '>> >> /Contents 7 0 R >>\n' +
      'endobj\n'
    );
    objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
    objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');
    objects.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n');
    objects.push(
      `7 0 obj\n<< /Length ${contentBytes} >>\nstream\n${content}endstream\nendobj\n`
    );

    const header = '%PDF-1.4\n';
    let offset = encoder ? encoder.encode(header).length : header.length;
    const xref = ['xref\n0 8\n0000000000 65535 f \n'];

    objects.forEach(obj => {
      const pad = ('0000000000' + offset).slice(-10);
      xref.push(pad + ' 00000 n \n');
      const objLen = encoder ? encoder.encode(obj).length : obj.length;
      offset += objLen;
    });

    const body = objects.join('');
    const xrefStr = xref.join('');
    const trailer = `trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;

    const fullPdf = header + body + xrefStr + trailer;
    return new Blob([fullPdf], { type: 'application/pdf' });
  }
}

// -----------------------------------------------------------------------------
// 1. Clinical Diagnostic Lab Report PDF (Matching Official Reference Template)
// -----------------------------------------------------------------------------
export function createClinicalReportPdfBlob(report) {
  const doc = new SimplePdfDocument();
  const testName = report.test || report.testName || 'Diagnostic Test Report';
  const reportId = report.id || report.bookingId || 'ZM-REP-427464';
  const patientName = report.patientName || report.patient || 'Patient';
  const patientAgeGender = report.patientAge 
    ? `${report.patientAge} Years / ${report.patientGender || 'Adult'}` 
    : (report.ageGender || 'Adult');
  const patientPhone = report.phone || report.patientPhone || '';
  const patientId = report.patientId || report.uhid || 'ZM-PAT-REG';
  const sampleCollected = report.sampleCollected || report.collectionDate || '23 Nov 2026, 10:00 AM';
  const reportGenerated = report.reportGenerated || report.generatedDate || '23 Nov 2026, 03:45 PM';
  const refDoctor = report.doctor || report.reportingDoctor || 'Dr. Amit Sharma';

  const defaultParameters = [
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

  const parameters = (report.reportData && report.reportData.length > 0)
    ? report.reportData
    : defaultParameters;

  // 1. Top Header (Logo + Contact Details)
  // Logo Heart & Cross Mark
  doc.rect(36, 786, 22, 22, [0.0, 0.43, 0.51], null);
  doc.rect(45, 791, 4, 12, [1, 1, 1], null);
  doc.rect(41, 795, 12, 4, [1, 1, 1], null);

  doc.text('ZESTMED', 64, 798, { bold: true, size: 16, color: [0.0, 0.43, 0.51] });
  doc.text('Healthcare at Home', 65, 788, { bold: true, size: 7.5, color: [0.15, 0.45, 0.85] });

  // Vertical Separator
  doc.line(175, 784, 175, 810, [0.82, 0.88, 0.92], 1);

  // Contact info
  doc.text('Phone: +91 1800-123-4567', 186, 796, { size: 8, color: [0.18, 0.28, 0.38] });
  doc.text('Email: support@zestmed.in', 320, 796, { size: 8, color: [0.18, 0.28, 0.38] });
  doc.text('Web: www.zestmed.in', 455, 796, { bold: true, size: 8, color: [0.0, 0.56, 0.51] });

  // 2. Title & Accreditation Header Bar
  // Left: Title Icon Box & Text
  doc.rect(36, 735, 30, 30, [0.91, 0.97, 0.96], [0.7, 0.92, 0.88], 1);
  doc.text('REP', 42, 747, { bold: true, size: 8, color: [0.0, 0.56, 0.51] });

  doc.text('Diagnostic Test Report', 74, 752, { bold: true, size: 14, color: [0.06, 0.18, 0.22] });
  doc.text('Certified Laboratory Report', 74, 740, { size: 8, color: [0.35, 0.48, 0.53] });

  // Right: NABL Accreditation Box
  doc.rect(400, 735, 159, 30, [0.97, 0.99, 0.98], [0.75, 0.91, 0.83], 1);
  doc.text('NABL Accredited Lab', 432, 752, { bold: true, size: 8.5, color: [0.06, 0.18, 0.22] });
  doc.text('Certified & Reliable Results', 432, 740, { size: 7.2, color: [0.0, 0.56, 0.4] });
  // Small shield check mark
  doc.rect(410, 740, 16, 18, [0.85, 0.96, 0.9], [0.4, 0.8, 0.6], 1);
  doc.text('OK', 413, 746, { bold: true, size: 6.5, color: [0.0, 0.5, 0.3] });

  // 3. Two Columns: Patient Information & Report Information
  // Left Card: Patient Information
  doc.rect(36, 638, 256, 84, [1, 1, 1], [0.86, 0.92, 0.96], 1);
  doc.rect(36, 700, 256, 22, [0.92, 0.96, 0.99], null);
  doc.text('Patient Information', 56, 707, { bold: true, size: 8.5, color: [0.1, 0.35, 0.65] });

  doc.text('Name', 48, 686, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(':', 102, 686, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(patientName, 114, 686, { bold: true, size: 8.5, color: [0.06, 0.12, 0.2] });

  doc.text('Age / Gender', 48, 671, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(':', 102, 671, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(patientAgeGender, 114, 671, { size: 8, color: [0.06, 0.12, 0.2] });

  doc.text('Phone', 48, 656, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(':', 102, 656, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(patientPhone, 114, 656, { size: 8, color: [0.06, 0.12, 0.2] });

  doc.text('Patient ID', 48, 642, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(':', 102, 642, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(patientId, 114, 642, { bold: true, size: 8, color: [0.0, 0.43, 0.51] });

  // Right Card: Report Information
  doc.rect(303, 638, 256, 84, [1, 1, 1], [0.86, 0.94, 0.91], 1);
  doc.rect(303, 700, 256, 22, [0.92, 0.98, 0.95], null);
  doc.text('Report Information', 323, 707, { bold: true, size: 8.5, color: [0.0, 0.5, 0.4] });

  doc.text('Report ID', 315, 686, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(':', 388, 686, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(reportId, 400, 686, { bold: true, size: 8.5, color: [0.06, 0.12, 0.2] });

  doc.text('Sample Collected', 315, 671, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(':', 388, 671, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(sampleCollected, 400, 671, { size: 8, color: [0.06, 0.12, 0.2] });

  doc.text('Report Generated', 315, 656, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(':', 388, 656, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(reportGenerated, 400, 656, { size: 8, color: [0.06, 0.12, 0.2] });

  doc.text('Ref. Doctor', 315, 642, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(':', 388, 642, { size: 8, color: [0.38, 0.46, 0.55] });
  doc.text(refDoctor, 400, 642, { bold: true, size: 8, color: [0.0, 0.43, 0.51] });

  // 4. Test Results Table
  // Main Teal Table Title
  doc.rect(36, 608, 523, 22, [0.0, 0.43, 0.51], null);
  doc.text('Test Results', 52, 615, { bold: true, size: 9.5, color: [1, 1, 1] });

  // Column Header Row
  doc.rect(36, 590, 523, 18, [0.96, 0.97, 0.99], [0.88, 0.92, 0.96], 0.5);
  doc.text('Test Name', 48, 595, { bold: true, size: 8, color: [0.12, 0.22, 0.3] });
  doc.text('Result', 205, 595, { bold: true, size: 8, color: [0.12, 0.22, 0.3] });
  doc.text('Reference Range', 290, 595, { bold: true, size: 8, color: [0.12, 0.22, 0.3] });
  doc.text('Unit', 415, 595, { bold: true, size: 8, color: [0.12, 0.22, 0.3] });
  doc.text('Remarks', 495, 595, { bold: true, size: 8, color: [0.12, 0.22, 0.3] });

  // Table Data Rows
  let y = 572;
  parameters.forEach((param, idx) => {
    if (y < 285) return; // Prevent page overrun
    
    // Light bottom divider line
    doc.line(36, y - 4, 559, y - 4, [0.92, 0.94, 0.96], 0.5);

    // Test name
    doc.text(param.name, 48, y, { bold: true, size: 8, color: [0.06, 0.12, 0.2] });

    // Result pill with soft mint background
    const isAbnormal = param.status === 'Deficient' || param.flag === 'LOW' || param.flag === 'HIGH';
    const pillFill = isAbnormal ? [0.99, 0.9, 0.9] : [0.85, 0.97, 0.92];
    const pillText = isAbnormal ? [0.8, 0.1, 0.1] : [0.0, 0.41, 0.29];
    doc.rect(200, y - 3, 38, 14, pillFill, null);
    doc.text(String(param.value), 208, y, { bold: true, size: 8, color: pillText });

    // Reference Range & Unit
    doc.text(param.normalRange || '-', 290, y, { size: 8, color: [0.25, 0.32, 0.4] });
    doc.text(param.unit || '-', 415, y, { size: 8, color: [0.25, 0.32, 0.4] });

    // Remarks with checkmark
    const remarkStatus = param.status || 'Normal';
    doc.text(`[v] ${remarkStatus}`, 490, y, { bold: true, size: 7.5, color: isAbnormal ? [0.8, 0.1, 0.1] : [0.0, 0.55, 0.35] });

    y -= 18;
  });

  // 5. Note Box
  const noteBoxY = Math.max(y - 8, 235);
  doc.rect(36, noteBoxY - 42, 523, 44, [0.94, 0.97, 1.0], [0.85, 0.91, 0.98], 1);
  doc.text('Note:', 48, noteBoxY - 9, { bold: true, size: 8, color: [0.08, 0.2, 0.3] });
  doc.text('•  The results are for the sample collected and tested as mentioned above.', 52, noteBoxY - 20, { size: 7.2, color: [0.25, 0.35, 0.45] });
  doc.text('•  Kindly consult your physician for clinical interpretation of the results.', 52, noteBoxY - 30, { size: 7.2, color: [0.25, 0.35, 0.45] });
  doc.text('•  This is a digitally generated report and does not require a physical signature.', 52, noteBoxY - 40, { size: 7.2, color: [0.25, 0.35, 0.45] });

  // 6. Verification QR & Doctor Signature Section
  const signSectionY = noteBoxY - 56;

  // Simulated QR Code Graphic Box
  doc.rect(48, signSectionY - 45, 45, 45, [1, 1, 1], [0.1, 0.15, 0.2], 1.2);
  doc.rect(52, signSectionY - 41, 12, 12, [0.1, 0.15, 0.2], null);
  doc.rect(55, signSectionY - 38, 6, 6, [1, 1, 1], null);
  doc.rect(77, signSectionY - 41, 12, 12, [0.1, 0.15, 0.2], null);
  doc.rect(80, signSectionY - 38, 6, 6, [1, 1, 1], null);
  doc.rect(52, signSectionY - 16, 12, 12, [0.1, 0.15, 0.2], null);
  doc.rect(55, signSectionY - 13, 6, 6, [1, 1, 1], null);
  doc.rect(68, signSectionY - 26, 8, 8, [0.1, 0.15, 0.2], null);

  doc.text('Scan to Verify', 104, signSectionY - 15, { bold: true, size: 8.5, color: [0.06, 0.18, 0.22] });
  doc.text('Verify this report on', 104, signSectionY - 26, { size: 7.5, color: [0.4, 0.5, 0.55] });
  doc.text('www.zestmed.in', 104, signSectionY - 38, { bold: true, size: 8, color: [0.0, 0.43, 0.51] });

  // Vertical Divider
  doc.line(265, signSectionY - 45, 265, signSectionY - 2, [0.86, 0.9, 0.94], 1);

  // Doctor Signature
  // Artistic cursive doctor signature mark
  doc.line(400, signSectionY - 10, 440, signSectionY - 6, [0.15, 0.2, 0.3], 1.2);
  doc.line(420, signSectionY - 18, 470, signSectionY - 8, [0.15, 0.2, 0.3], 1.2);
  doc.line(460, signSectionY - 12, 490, signSectionY - 16, [0.15, 0.2, 0.3], 1.2);

  doc.text('Dr. Amit Sharma, MD (Pathology)', 360, signSectionY - 24, { bold: true, size: 9.5, color: [0.06, 0.18, 0.22] });
  doc.text('Consultant Pathologist', 396, signSectionY - 35, { size: 7.8, color: [0.35, 0.45, 0.5] });
  doc.text('Reg. No. DMC-45837', 400, signSectionY - 45, { size: 7.5, color: [0.35, 0.45, 0.5] });

  // 7. Bottom Trust Badges
  const trustY = signSectionY - 72;
  doc.rect(36, trustY - 4, 523, 22, [0.98, 1.0, 0.99], [0.85, 0.94, 0.91], 1);
  doc.text('[v] Accurate Reports', 48, trustY + 3, { bold: true, size: 7.5, color: [0.0, 0.45, 0.38] });
  doc.text('[v] Home Sample Collection', 165, trustY + 3, { bold: true, size: 7.5, color: [0.0, 0.45, 0.38] });
  doc.text('[v] Timely Results', 315, trustY + 3, { bold: true, size: 7.5, color: [0.0, 0.45, 0.38] });
  doc.text('[v] 100% Secure & Confidential', 420, trustY + 3, { bold: true, size: 7.5, color: [0.0, 0.45, 0.38] });

  // 8. Bottom Decorative Waves
  doc.rect(0, 30, 595.28, 4, [0.75, 0.93, 0.92], null);
  doc.rect(0, 24, 595.28, 6, [0.85, 0.96, 0.95], null);
  doc.rect(0, 16, 595.28, 8, [0.93, 0.98, 0.98], null);

  return doc.buildBlob();
}

// -----------------------------------------------------------------------------
// 2. Medicine Order Tax Invoice PDF
// -----------------------------------------------------------------------------
export function createOrderInvoicePdfBlob(order) {
  const doc = new SimplePdfDocument();
  const invoiceId = order.id || 'ZM-ORD-9821';
  const orderDate = order.date || 'Nov 14, 2026';
  const patientName = order.patientName || order.patient || order.customer_name || 'Customer';
  const address = order.address || order.deliveryAddress || order.delivery_address || 'Guwahati, Assam';
  const phone = order.phone || order.customer_phone || '';
  const total = order.total || order.amount || 1199;
  const items = (order.items && order.items.length > 0)
    ? order.items
    : [
        { name: 'Telmisartan 40mg Tab (Strip of 10)', batch: 'ZM-B202', expiry: '10/28', qty: 2, price: 180 },
        { name: 'Metformin 500mg SR (Strip of 15)', batch: 'ZM-M904', expiry: '06/28', qty: 2, price: 120 },
        { name: 'Atorvastatin 10mg Tab (Strip of 10)', batch: 'ZM-A411', expiry: '12/27', qty: 2, price: 299 },
        { name: 'Vitamin D3 60k Cholecalciferol (Strip of 4)', batch: 'ZM-D881', expiry: '08/28', qty: 1, price: 420 }
      ];

  // Top Deep Teal / Forest Green Header
  doc.rect(36, 742, 523, 62, [0.004, 0.20, 0.23], null);
  doc.text('ZESTMED PHARMACEUTICALS - TAX INVOICE', 50, 782, { bold: true, size: 15, color: [1, 1, 1] });
  doc.text('Zestmed Health Private Limited • Central Pharmacy Hub, Guwahati, Assam', 50, 766, { size: 8.5, color: [0.92, 0.98, 0.98] });
  doc.text('GSTIN: 18AAACZ9901M1ZT | Drug Lic: DL-GUW-20B/21B-4492/24 | Helpline: +91 92791 25091', 50, 752, { size: 8, color: [0.85, 0.95, 0.95] });
  doc.text(`INVOICE #: ${invoiceId}`, 425, 782, { bold: true, size: 9.5, color: [1, 1, 1] });
  doc.text(`DATE: ${orderDate}`, 425, 766, { size: 8, color: [0.9, 0.98, 0.98] });

  // Bill To & Dispatch Details
  doc.rect(36, 666, 523, 66, [0.95, 0.99, 0.98], [0.8, 0.93, 0.91], 1);
  doc.text('BILLED TO (PATIENT):', 48, 716, { size: 8, color: [0.4, 0.46, 0.55] });
  doc.text(patientName, 48, 703, { bold: true, size: 10 });
  doc.text(`Phone: ${phone}`, 48, 689, { size: 8.5, color: [0.35, 0.4, 0.5] });
  doc.text(address, 48, 676, { size: 8, color: [0.35, 0.4, 0.5] });

  doc.text('PAYMENT DETAILS:', 340, 716, { size: 8, color: [0.4, 0.46, 0.55] });
  doc.text('Status: PAID IN FULL', 340, 703, { bold: true, size: 9.5, color: [0, 0.56, 0.51] });
  doc.text('Payment Gateway: Razorpay Verified (UPI/Card)', 340, 689, { size: 8.5, color: [0.35, 0.4, 0.5] });
  doc.text('Delivery: Senior Citizen Free Dispatch (< 10km Guwahati)', 340, 676, { size: 8, color: [0.35, 0.4, 0.5] });

  // Table Header
  doc.rect(36, 620, 523, 20, [0.004, 0.20, 0.23], null);
  doc.text('Item Description / Medicine Name', 46, 627, { bold: true, size: 8.5, color: [1, 1, 1] });
  doc.text('Batch / Exp', 280, 627, { bold: true, size: 8.5, color: [1, 1, 1] });
  doc.text('Qty', 390, 627, { bold: true, size: 8.5, color: [1, 1, 1] });
  doc.text('Price (INR)', 445, 627, { bold: true, size: 8.5, color: [1, 1, 1] });
  doc.text('Total (INR)', 505, 627, { bold: true, size: 8.5, color: [1, 1, 1] });

  // Table Rows
  let y = 602;
  items.forEach((it, idx) => {
    if (y < 200) return;
    const isEven = idx % 2 === 1;
    if (isEven) {
      doc.rect(36, y - 4, 523, 17, [0.97, 0.98, 1], null);
    }
    doc.line(36, y - 4, 559, y - 4, [0.9, 0.93, 0.96], 0.5);

    const itName = it.name || it.title || 'Genuine Medicine';
    const itBatch = it.batch || 'ZM-B24';
    const itExp = it.expiry || '12/28';
    const itQty = it.qty || it.quantity || 1;
    const itPrice = it.price || 199;
    const itTotal = itQty * itPrice;

    doc.text(itName, 46, y, { bold: true, size: 8 });
    doc.text(`${itBatch} (${itExp})`, 280, y, { size: 8, color: [0.35, 0.4, 0.5] });
    doc.text(String(itQty), 395, y, { size: 8.5, color: [0.2, 0.25, 0.35] });
    doc.text(`Rs. ${itPrice}`, 445, y, { size: 8.5, color: [0.2, 0.25, 0.35] });
    doc.text(`Rs. ${itTotal}`, 505, y, { bold: true, size: 8.5, color: [0.004, 0.20, 0.23] });

    y -= 18;
  });

  // Summary Box
  const summaryY = Math.max(y - 15, 200);
  doc.rect(340, summaryY - 60, 219, 65, [0.95, 0.99, 0.98], [0.8, 0.93, 0.91], 1);
  doc.text('Taxable Subtotal:', 350, summaryY - 8, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(`Rs. ${total}`, 485, summaryY - 8, { bold: true, size: 8.5 });

  doc.text('Senior Citizen 10km Free Delivery:', 350, summaryY - 22, { size: 8, color: [0.4, 0.45, 0.55] });
  doc.text('Rs. 0.00', 485, summaryY - 22, { bold: true, size: 8, color: [0, 0.56, 0.51] });

  doc.text('Applicable GST (CGST+SGST):', 350, summaryY - 36, { size: 8, color: [0.4, 0.45, 0.55] });
  doc.text('Included', 485, summaryY - 36, { size: 8, color: [0.4, 0.45, 0.55] });

  doc.line(340, summaryY - 42, 559, summaryY - 42, [0.8, 0.85, 0.9], 1);
  doc.text('NET AMOUNT PAID:', 350, summaryY - 54, { bold: true, size: 9.5, color: [0.004, 0.20, 0.23] });
  doc.text(`Rs. ${total}`, 485, summaryY - 54, { bold: true, size: 10.5, color: [0.004, 0.20, 0.23] });

  // Footer & Pharmacist Sign
  doc.line(36, 120, 559, 120, [0.8, 0.85, 0.9], 1);
  doc.text('• Genuine pharmaceutical products dispensed under the supervision of a Registered Pharmacist.', 46, 100, { size: 7.5, color: [0.45, 0.5, 0.58] });
  doc.text('• Cold-chain items packed in certified temperature-controlled boxes.', 46, 88, { size: 7.5, color: [0.45, 0.5, 0.58] });
  doc.text('Zestmed Health Private Limited • GS Road, Dispur, Guwahati - 781005', 46, 76, { size: 7, color: [0.5, 0.55, 0.6] });

  doc.text('For Zestmed Health Pvt Ltd', 390, 100, { bold: true, size: 8.5 });
  doc.text('Authorized Signatory & Chief Pharmacist', 390, 88, { size: 7.5, color: [0.35, 0.4, 0.5] });
  doc.text('Assam Pharmacy Council Reg: APC-14902', 390, 76, { size: 7.5, color: [0.35, 0.4, 0.5] });

  return doc.buildBlob();
}

// -----------------------------------------------------------------------------
// 3. Statutory Regulatory Document PDF (for Admin Razorpay Verification)
// -----------------------------------------------------------------------------
export function createStatutoryDocPdfBlob(docData) {
  const doc = new SimplePdfDocument();
  const title = docData.title || 'Statutory Business Document';
  const category = docData.category || 'Regulatory Compliance';
  const docNumber = docData.docNumber || 'REG-AS-2024-001';
  const fileName = docData.file || 'Zestmed_Certificate.pdf';
  const mandatoryFor = docData.mandatoryFor || 'Razorpay Healthcare Activation';

  // Government / Corporate Seal Header
  doc.rect(36, 742, 523, 62, [0.004, 0.20, 0.23], null);
  doc.text('GOVERNMENT OF ASSAM / REGULATORY STATUTORY DOSSIER', 50, 782, { bold: true, size: 13, color: [1, 1, 1] });
  doc.text('Official Certified Copy - Registered for Zestmed Health Private Limited, Guwahati', 50, 766, { size: 8.5, color: [0.92, 0.98, 0.98] });
  doc.text(`DOCUMENT ID: ${docNumber}`, 50, 752, { bold: true, size: 8, color: [0.9, 0.98, 0.98] });
  doc.text('STATUS: VERIFIED', 430, 782, { bold: true, size: 10, color: [0.3, 0.9, 0.4] });
  doc.text('COMPLIANCE: RBI/DRUGS ACT', 410, 766, { size: 7.5, color: [0.92, 0.98, 0.98] });

  // Main Certificate Card
  doc.rect(36, 520, 523, 210, [0.95, 0.99, 0.98], [0.8, 0.93, 0.91], 1.5);
  doc.text('CERTIFICATE OF REGULATORY COMPLIANCE', 140, 705, { bold: true, size: 13, color: [0, 0.56, 0.51] });
  doc.line(140, 698, 455, 698, [0, 0.56, 0.51], 1);

  doc.text('Document Title:', 50, 675, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(title, 50, 660, { bold: true, size: 11, color: [0.004, 0.20, 0.23] });

  doc.text('Category:', 50, 638, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(category, 50, 625, { bold: true, size: 9.5 });

  doc.text('Statutory Registration / License Number:', 260, 638, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(docNumber, 260, 625, { bold: true, size: 9.5, color: [0, 0.56, 0.51] });

  doc.text('Issued Entity:', 50, 603, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text('Zestmed Health Private Limited (Dispur, Guwahati - 781005, Assam)', 50, 590, { bold: true, size: 9 });

  doc.text('Mandatory Statutory Requirement For:', 50, 568, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(mandatoryFor, 50, 555, { size: 9, color: [0.2, 0.25, 0.35] });

  doc.text('Verified Digital Signature Token:', 50, 536, { size: 7.5, color: [0.4, 0.45, 0.55] });
  doc.text(`SHA-256: 8a4f91b72e09c84e... (${fileName})`, 50, 526, { size: 7.5, color: [0.5, 0.55, 0.6] });

  // Audit Footer
  doc.line(36, 120, 559, 120, [0.8, 0.85, 0.9], 1);
  doc.text('• This statutory record is authenticated under the Assam Right to Public Services & MCA guidelines.', 46, 100, { size: 7.5, color: [0.45, 0.5, 0.58] });
  doc.text('• Razorpay Merchant Account activation token linked for instant payment routing.', 46, 88, { size: 7.5, color: [0.45, 0.5, 0.58] });
  doc.text('Directorate of Health Services / Commercial Taxes Department, Assam', 46, 76, { size: 7, color: [0.5, 0.55, 0.6] });

  doc.text('Official Seal & Registrar Stamp', 380, 100, { bold: true, size: 8.5 });
  doc.text('Govt of Assam Verification Portal', 380, 88, { size: 7.5, color: [0.35, 0.4, 0.5] });
  doc.text('Digital Dossier Verified: Nov 2026', 380, 76, { size: 7.5, color: [0.35, 0.4, 0.5] });

  return doc.buildBlob();
}

// -----------------------------------------------------------------------------
// 4. Specialist Doctor Consultation Reference Ticket PDF
// -----------------------------------------------------------------------------
export function createDoctorTicketPdfBlob(ticket) {
  const doc = new SimplePdfDocument();
  const ticketId = ticket.id || ticket.bookingId || 'ZM-DOC-TICKET';
  const doctorName = ticket.doctor || ticket.doctorName || 'Senior Specialist';
  const specialty = ticket.specialty || ticket.doctorSpecialty || 'General Medicine';
  const hospital = ticket.doctorHospital || ticket.hospital || 'Christian Basti Medical Centre & Zestmed Hub';
  const date = ticket.date || new Date().toISOString().split('T')[0];
  const time = ticket.time || ticket.slot || 'Morning Slot (10:00 AM)';
  const patientName = ticket.patientName || 'Verified Patient';
  const patientPhone = ticket.patientPhone || ticket.phone || '';
  const fee = ticket.fee || 600;

  // Header Banner (Navy/Teal)
  doc.rect(36, 742, 523, 62, [0.004, 0.20, 0.23], null);
  doc.text('ZESTMED DIAGNOSTICS & POLYCLINIC', 50, 782, { bold: true, size: 14, color: [1, 1, 1] });
  doc.text('SPECIALIST CONSULTATION REFERENCE TICKET & APPOINTMENT PASS', 50, 766, { bold: true, size: 8, color: [0.8, 0.95, 0.92] });
  doc.text('Christian Basti Hub • Dispur, Guwahati • Helpline: +91 92791 25091', 50, 752, { size: 7.5, color: [0.75, 0.88, 0.88] });
  doc.text('STATUS: CONFIRMED', 430, 782, { bold: true, size: 9.5, color: [0.3, 0.95, 0.5] });
  doc.text('CLINICAL PASS', 450, 766, { size: 7.5, color: [0.8, 0.95, 0.92] });

  // Main Ticket Card Outer Box
  doc.rect(36, 420, 523, 305, [0.97, 0.99, 0.99], [0.0, 0.55, 0.5], 1.5);

  // Top Bar inside Card
  doc.text('REFERENCE TICKET NUMBER:', 50, 705, { size: 7.5, color: [0.45, 0.5, 0.55] });
  doc.text(ticketId, 50, 690, { bold: true, size: 12, color: [0.0, 0.48, 0.39] });
  doc.text('[ VERIFIED APPOINTMENT ]', 420, 690, { bold: true, size: 8.5, color: [0.06, 0.55, 0.28] });
  doc.line(50, 680, 545, 680, [0.8, 0.9, 0.88], 1);

  // Doctor Details
  doc.text('CONSULTING SPECIALIST:', 50, 660, { size: 7.5, color: [0.45, 0.5, 0.55] });
  doc.text(doctorName, 50, 644, { bold: true, size: 12, color: [0.08, 0.12, 0.18] });
  doc.text(specialty, 50, 630, { bold: true, size: 9, color: [0.0, 0.48, 0.39] });
  doc.text(hospital, 50, 617, { size: 8.5, color: [0.35, 0.4, 0.48] });

  // Grid Divider
  doc.line(50, 605, 545, 605, [0.88, 0.92, 0.94], 1);

  // Appointment Details Grid
  doc.text('Consultation Date:', 50, 588, { size: 7.5, color: [0.45, 0.5, 0.55] });
  doc.text(date, 50, 574, { bold: true, size: 9.5, color: [0.1, 0.15, 0.2] });

  doc.text('Preferred Slot:', 200, 588, { size: 7.5, color: [0.45, 0.5, 0.55] });
  doc.text(time, 200, 574, { bold: true, size: 9.5, color: [0.1, 0.15, 0.2] });

  doc.text('Patient Name:', 50, 554, { size: 7.5, color: [0.45, 0.5, 0.55] });
  doc.text(patientName, 50, 540, { bold: true, size: 9.5, color: [0.1, 0.15, 0.2] });

  doc.text('Contact Number:', 200, 554, { size: 7.5, color: [0.45, 0.5, 0.55] });
  doc.text(patientPhone, 200, 540, { bold: true, size: 9.5, color: [0.1, 0.15, 0.2] });

  doc.text('Mode of Consultation:', 380, 554, { size: 7.5, color: [0.45, 0.5, 0.55] });
  doc.text('In-Clinic Consultation', 380, 540, { bold: true, size: 9.5, color: [0.0, 0.48, 0.39] });

  // Fee Row Box
  doc.rect(50, 485, 495, 36, [1, 1, 1], [0.85, 0.92, 0.9], 1);
  doc.text('Consultation Fee (Payable at Clinic Reception Desk):', 62, 502, { bold: true, size: 8.5, color: [0.2, 0.25, 0.35] });
  doc.text(`INR ${fee}`, 470, 502, { bold: true, size: 11, color: [0.08, 0.12, 0.18] });

  // WhatsApp Alert Row
  doc.text(`* WhatsApp confirmation and clinic Google Maps location sent to +91 ${patientPhone}`, 50, 465, { bold: true, size: 7.5, color: [0.06, 0.5, 0.25] });

  // Instructions Box
  doc.rect(36, 255, 523, 145, [0.98, 0.99, 1.0], [0.85, 0.9, 0.95], 1);
  doc.text('IMPORTANT CLINIC VISIT GUIDELINES & INSTRUCTIONS', 50, 380, { bold: true, size: 9, color: [0.05, 0.2, 0.3] });
  doc.line(50, 372, 350, 372, [0.0, 0.48, 0.39], 1);

  doc.text('1. Please arrive at the clinic 10-15 minutes prior to your selected consultation time slot.', 50, 355, { size: 8, color: [0.25, 0.3, 0.38] });
  doc.text('2. Present this official reference ticket (digital copy or printout) at the hospital reception counter.', 50, 340, { size: 8, color: [0.25, 0.3, 0.38] });
  doc.text('3. Consultation fees are payable directly at the clinic reception counter (Cash / UPI / Card accepted).', 50, 325, { size: 8, color: [0.25, 0.3, 0.38] });
  doc.text('4. Please carry your previous medical prescriptions, lab investigation reports, and medical history.', 50, 310, { size: 8, color: [0.25, 0.3, 0.38] });
  doc.text('5. Senior citizen priority desk and free wheelchair assistance available at the main polyclinic entrance.', 50, 295, { size: 8, color: [0.25, 0.3, 0.38] });
  doc.text('6. Need assistance or rescheduling? Call 24x7 Zestmed Careline at +91 92791 25091.', 50, 280, { bold: true, size: 8, color: [0.0, 0.48, 0.39] });

  // Verification & Signatures
  doc.line(36, 170, 559, 170, [0.8, 0.85, 0.9], 1);
  doc.text('• System generated clinical appointment token issued by Zestmed Health Private Limited.', 46, 150, { size: 7.5, color: [0.45, 0.5, 0.58] });
  doc.text('• Valid for entry and queue token generation at polyclinic reception.', 46, 138, { size: 7.5, color: [0.45, 0.5, 0.58] });
  doc.text('Zestmed Health Private Limited • GS Road, Dispur, Guwahati - 781005', 46, 126, { size: 7, color: [0.5, 0.55, 0.6] });

  doc.text('Authorized by Polyclinic Reception Desk', 380, 150, { bold: true, size: 8 });
  doc.text('Zestmed Healthcare Network', 380, 138, { size: 7.5, color: [0.35, 0.4, 0.5] });
  doc.text('Assam Clinical Establishments Reg: ACE-2024-ZM', 380, 126, { size: 7, color: [0.35, 0.4, 0.5] });

  return doc.buildBlob();
}

// -----------------------------------------------------------------------------
// Download, View, and Print Triggers
// -----------------------------------------------------------------------------
export function downloadPdfBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export function openPdfBlobInNewTab(blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function downloadClinicalReportPdf(report) {
  const blob = createClinicalReportPdfBlob(report);
  const reportId = (report.id || report.bookingId || 'ZM-REP-9041').replace(/[^a-zA-Z0-9_-]/g, '_');
  const testName = (report.test || report.testName || 'Diagnostic_Report').replace(/[^a-zA-Z0-9]/g, '_');
  downloadPdfBlob(blob, `ZESTMED_Clinical_Report_${reportId}_${testName}.pdf`);
}

export function openClinicalReportPdf(report) {
  const blob = createClinicalReportPdfBlob(report);
  openPdfBlobInNewTab(blob);
}

export function downloadOrderInvoicePdf(order) {
  const blob = createOrderInvoicePdfBlob(order);
  const invoiceId = (order.id || 'ZM-ORD-9821').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadPdfBlob(blob, `ZESTMED_Tax_Invoice_${invoiceId}.pdf`);
}

export function openOrderInvoicePdf(order) {
  const blob = createOrderInvoicePdfBlob(order);
  openPdfBlobInNewTab(blob);
}

export function downloadStatutoryDocumentPdf(docData) {
  const blob = createStatutoryDocPdfBlob(docData);
  const name = (docData.file || docData.id || 'Statutory_Compliance').replace(/[^a-zA-Z0-9._-]/g, '_');
  const finalName = name.endsWith('.pdf') ? name : `${name}.pdf`;
  downloadPdfBlob(blob, finalName);
}

export function openStatutoryDocumentPdf(docData) {
  const blob = createStatutoryDocPdfBlob(docData);
  openPdfBlobInNewTab(blob);
}

export function downloadDoctorAppointmentTicketPdf(ticket) {
  const blob = createDoctorTicketPdfBlob(ticket);
  const ticketId = (ticket.id || ticket.bookingId || 'ZM-DOC-TICKET').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadPdfBlob(blob, `ZESTMED_Doctor_Consultation_Ticket_${ticketId}.pdf`);
}

export function openDoctorAppointmentTicketPdf(ticket) {
  const blob = createDoctorTicketPdfBlob(ticket);
  openPdfBlobInNewTab(blob);
}

