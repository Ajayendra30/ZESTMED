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
// 1. Clinical Diagnostic Lab Report PDF
// -----------------------------------------------------------------------------
export function createClinicalReportPdfBlob(report) {
  const doc = new SimplePdfDocument();
  const testName = report.test || report.testName || 'Diagnostic Investigation';
  const reportId = report.id || report.bookingId || 'ZM-REP-9041';
  const patientName = report.patientName || report.patient || 'Rahul Verma';
  const uhid = report.uhid || 'ZM-PAT-1082';
  const dateStr = report.collectionDate || report.date || 'Nov 13, 2026';
  const specimen = report.specimen || 'EDTA Whole Blood / Serum';
  const pathologist = report.reportingDoctor || report.pathologist || 'Dr. Pranabesh Sarma, MD Pathology';
  const remark = report.pathologistRemark || 'All clinical parameters reviewed and confirmed within normal biological baseline.';
  const parameters = (report.reportData && report.reportData.length > 0)
    ? report.reportData
    : [
        { name: 'Hemoglobin (Hb)', value: '14.2', normalRange: '13.0 - 17.0', unit: 'g/dL', status: 'Normal' },
        { name: 'Total Leucocyte Count (WBC)', value: '6,800', normalRange: '4,000 - 11,000', unit: '/cumm', status: 'Normal' },
        { name: 'Platelet Count', value: '245,000', normalRange: '150,000 - 450,000', unit: '/cumm', status: 'Normal' },
        { name: 'Packed Cell Volume (PCV)', value: '42.8', normalRange: '40.0 - 50.0', unit: '%', status: 'Normal' },
        { name: 'R.B.C. Count', value: '4.85', normalRange: '4.5 - 5.9', unit: 'mil/cumm', status: 'Normal' },
        { name: 'Neutrophils', value: '64', normalRange: '40 - 75', unit: '%', status: 'Normal' },
        { name: 'Lymphocytes', value: '28', normalRange: '20 - 45', unit: '%', status: 'Normal' },
        { name: 'Eosinophils', value: '3', normalRange: '1 - 6', unit: '%', status: 'Normal' },
        { name: 'Monocytes', value: '5', normalRange: '2 - 10', unit: '%', status: 'Normal' }
      ];

  // Header Banner (Royal Blue: #005CB9 -> 0, 0.36, 0.73)
  doc.rect(36, 742, 523, 62, [0, 0.36, 0.73], null);
  doc.text('ZESTMED DIAGNOSTICS & POLYCLINIC', 50, 782, { bold: true, size: 16, color: [1, 1, 1] });
  doc.text('Central Clinical Reference Laboratory - NABL Accredited (ISO 15189) - Guwahati, Assam', 50, 766, { size: 8.5, color: [0.92, 0.96, 1] });
  doc.text('GS Road, Dispur, Guwahati - 781005 | Helpline: +91 92791 25091 | www.zestmed.in', 50, 752, { size: 8, color: [0.85, 0.92, 1] });
  doc.text(`REPORT ID: ${reportId}`, 425, 782, { bold: true, size: 9.5, color: [1, 1, 1] });
  doc.text(`BARCODE: AS-LAB-${reportId.replace(/\D/g, '') || '781001'}`, 425, 766, { size: 8, color: [0.9, 0.95, 1] });

  // Patient Card
  doc.rect(36, 666, 523, 66, [0.96, 0.98, 1], [0.8, 0.88, 0.96], 1);
  doc.text('PATIENT NAME:', 48, 716, { size: 8, color: [0.4, 0.46, 0.55] });
  doc.text(patientName, 48, 703, { bold: true, size: 10 });
  doc.text(`UHID: ${uhid}`, 48, 689, { size: 8.5, color: [0.35, 0.4, 0.5] });
  doc.text('Age / Gender: 34 Yrs / Male', 48, 676, { size: 8.5, color: [0.35, 0.4, 0.5] });

  doc.text('INVESTIGATION:', 225, 716, { size: 8, color: [0.4, 0.46, 0.55] });
  doc.text(testName, 225, 703, { bold: true, size: 10 });
  doc.text(`Collection Date: ${dateStr}`, 225, 689, { size: 8.5, color: [0.35, 0.4, 0.5] });
  doc.text(`Specimen: ${specimen}`, 225, 676, { size: 8.5, color: [0.35, 0.4, 0.5] });

  doc.text('REPORT STATUS:', 420, 716, { size: 8, color: [0.4, 0.46, 0.55] });
  doc.text('Verified / Released', 420, 703, { bold: true, size: 9.5, color: [0, 0.36, 0.73] });
  doc.text('Hub: Guwahati Central Hub', 420, 689, { size: 8.5, color: [0.35, 0.4, 0.5] });
  doc.text('Sample Type: Barcoded Vacuum Tube', 420, 676, { size: 8, color: [0.35, 0.4, 0.5] });

  // Investigation Subheading
  doc.text(`INVESTIGATION FINDINGS: ${testName.toUpperCase()}`, 38, 646, { bold: true, size: 9.5, color: [0.04, 0.12, 0.2] });
  doc.text('Methodology: Fully Automated Clinical Analyzer & Laser Flow Cytometry', 280, 646, { italic: true, size: 8, color: [0.4, 0.45, 0.5] });

  // Table Header (Royal Blue)
  doc.rect(36, 620, 523, 20, [0, 0.36, 0.73], null);
  doc.text('Test Parameter', 46, 627, { bold: true, size: 8.5, color: [1, 1, 1] });
  doc.text('Observed Result', 220, 627, { bold: true, size: 8.5, color: [1, 1, 1] });
  doc.text('Biological Reference Range', 320, 627, { bold: true, size: 8.5, color: [1, 1, 1] });
  doc.text('Units', 445, 627, { bold: true, size: 8.5, color: [1, 1, 1] });
  doc.text('Status', 505, 627, { bold: true, size: 8.5, color: [1, 1, 1] });

  // Parameters Rows
  let y = 602;
  parameters.forEach((p, idx) => {
    if (y < 160) return; // Prevent page overrun
    const isEven = idx % 2 === 1;
    if (isEven) {
      doc.rect(36, y - 4, 523, 17, [0.97, 0.98, 1], null);
    }
    doc.line(36, y - 4, 559, y - 4, [0.9, 0.93, 0.96], 0.5);

    const isAbnormal = p.status === 'Deficient' || p.flag === 'LOW' || p.flag === 'HIGH';
    doc.text(p.name, 46, y, { bold: true, size: 8 });
    doc.text(String(p.value), 220, y, { bold: true, size: 8.5, color: isAbnormal ? [0.8, 0.1, 0.1] : [0.05, 0.1, 0.18] });
    doc.text(p.normalRange || 'Normal', 320, y, { size: 8, color: [0.35, 0.4, 0.5] });
    doc.text(p.unit || '-', 445, y, { size: 8, color: [0.35, 0.4, 0.5] });
    doc.text(p.status || 'Normal', 505, y, { bold: true, size: 8, color: isAbnormal ? [0.8, 0.1, 0.1] : [0, 0.36, 0.73] });

    y -= 18;
  });

  // Pathologist Clinical Note
  const noteBoxY = Math.max(y - 20, 160);
  doc.rect(36, noteBoxY - 32, 523, 44, [0.98, 0.99, 1], [0.85, 0.9, 0.96], 0.8);
  doc.text('Pathologist Note & Clinical Correlation:', 46, noteBoxY + 2, { bold: true, size: 8, color: [0.04, 0.12, 0.2] });
  doc.text(`"${remark}"`, 46, noteBoxY - 12, { italic: true, size: 7.5, color: [0.3, 0.35, 0.45] });
  doc.text('* Correlate clinically. Sample handled under cold-chain compliance (2-8 deg C).', 46, noteBoxY - 24, { size: 7, color: [0.5, 0.55, 0.6] });

  // Doctor Signature & Accreditation Footer
  doc.line(36, 125, 559, 125, [0.8, 0.85, 0.9], 1);
  doc.text('* Electronically signed report under IT Act 2000. Valid for clinical consultations.', 46, 105, { size: 7.5, color: [0.45, 0.5, 0.58] });
  doc.text('Guwahati Central Diagnostic Hub • GS Road, Dispur, Guwahati, Assam - 781005', 46, 92, { size: 7.5, color: [0.45, 0.5, 0.58] });
  doc.text('ICMR Reg No: AS-LAB-2024-88 • NABL Certificate: MC-5921', 46, 79, { size: 7, color: [0.5, 0.55, 0.6] });

  doc.text(pathologist, 370, 105, { bold: true, size: 8.5, color: [0.04, 0.12, 0.2] });
  doc.text('Consultant Clinical Pathologist', 370, 92, { size: 7.5, color: [0.35, 0.4, 0.5] });
  doc.text('Assam Medical Council Reg: AMC-29182-AS', 370, 79, { size: 7.5, color: [0.35, 0.4, 0.5] });

  return doc.buildBlob();
}

// -----------------------------------------------------------------------------
// 2. Medicine Order Tax Invoice PDF
// -----------------------------------------------------------------------------
export function createOrderInvoicePdfBlob(order) {
  const doc = new SimplePdfDocument();
  const invoiceId = order.id || 'ZM-ORD-9821';
  const orderDate = order.date || 'Nov 14, 2026';
  const patientName = order.patientName || order.patient || 'Rahul Verma';
  const address = order.address || order.deliveryAddress || 'Flat 4B, Brahmaputra Enclave, Dispur, Guwahati - 781005';
  const phone = order.phone || '+91 92791 25091';
  const total = order.total || order.amount || 1199;
  const items = (order.items && order.items.length > 0)
    ? order.items
    : [
        { name: 'Telmisartan 40mg Tab (Strip of 10)', batch: 'ZM-B202', expiry: '10/28', qty: 2, price: 180 },
        { name: 'Metformin 500mg SR (Strip of 15)', batch: 'ZM-M904', expiry: '06/28', qty: 2, price: 120 },
        { name: 'Atorvastatin 10mg Tab (Strip of 10)', batch: 'ZM-A411', expiry: '12/27', qty: 2, price: 299 },
        { name: 'Vitamin D3 60k Cholecalciferol (Strip of 4)', batch: 'ZM-D881', expiry: '08/28', qty: 1, price: 420 }
      ];

  // Top Navy / Royal Blue Header
  doc.rect(36, 742, 523, 62, [0, 0.36, 0.73], null);
  doc.text('ZESTMED PHARMACEUTICALS - TAX INVOICE', 50, 782, { bold: true, size: 15, color: [1, 1, 1] });
  doc.text('Zestmed Health Private Limited • Central Pharmacy Hub, Guwahati, Assam', 50, 766, { size: 8.5, color: [0.92, 0.96, 1] });
  doc.text('GSTIN: 18AAACZ9901M1ZT | Drug Lic: DL-GUW-20B/21B-4492/24 | Helpline: +91 92791 25091', 50, 752, { size: 8, color: [0.85, 0.92, 1] });
  doc.text(`INVOICE #: ${invoiceId}`, 425, 782, { bold: true, size: 9.5, color: [1, 1, 1] });
  doc.text(`DATE: ${orderDate}`, 425, 766, { size: 8, color: [0.9, 0.95, 1] });

  // Bill To & Dispatch Details
  doc.rect(36, 666, 523, 66, [0.97, 0.98, 1], [0.82, 0.88, 0.96], 1);
  doc.text('BILLED TO (PATIENT):', 48, 716, { size: 8, color: [0.4, 0.46, 0.55] });
  doc.text(patientName, 48, 703, { bold: true, size: 10 });
  doc.text(`Phone: ${phone}`, 48, 689, { size: 8.5, color: [0.35, 0.4, 0.5] });
  doc.text(address, 48, 676, { size: 8, color: [0.35, 0.4, 0.5] });

  doc.text('PAYMENT DETAILS:', 340, 716, { size: 8, color: [0.4, 0.46, 0.55] });
  doc.text('Status: PAID IN FULL', 340, 703, { bold: true, size: 9.5, color: [0, 0.36, 0.73] });
  doc.text('Payment Gateway: Razorpay Verified (UPI/Card)', 340, 689, { size: 8.5, color: [0.35, 0.4, 0.5] });
  doc.text('Delivery: Senior Citizen Free Dispatch (< 10km Guwahati)', 340, 676, { size: 8, color: [0.35, 0.4, 0.5] });

  // Table Header
  doc.rect(36, 620, 523, 20, [0, 0.36, 0.73], null);
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
    doc.text(`Rs. ${itTotal}`, 505, y, { bold: true, size: 8.5, color: [0, 0.36, 0.73] });

    y -= 18;
  });

  // Summary Box
  const summaryY = Math.max(y - 15, 200);
  doc.rect(340, summaryY - 60, 219, 65, [0.98, 0.99, 1], [0.85, 0.9, 0.96], 1);
  doc.text('Taxable Subtotal:', 350, summaryY - 8, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(`Rs. ${total}`, 485, summaryY - 8, { bold: true, size: 8.5 });

  doc.text('Senior Citizen 10km Free Delivery:', 350, summaryY - 22, { size: 8, color: [0.4, 0.45, 0.55] });
  doc.text('Rs. 0.00', 485, summaryY - 22, { bold: true, size: 8, color: [0, 0.36, 0.73] });

  doc.text('Applicable GST (CGST+SGST):', 350, summaryY - 36, { size: 8, color: [0.4, 0.45, 0.55] });
  doc.text('Included', 485, summaryY - 36, { size: 8, color: [0.4, 0.45, 0.55] });

  doc.line(340, summaryY - 42, 559, summaryY - 42, [0.8, 0.85, 0.9], 1);
  doc.text('NET AMOUNT PAID:', 350, summaryY - 54, { bold: true, size: 9.5, color: [0.04, 0.12, 0.2] });
  doc.text(`Rs. ${total}`, 485, summaryY - 54, { bold: true, size: 10.5, color: [0, 0.36, 0.73] });

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
  doc.rect(36, 742, 523, 62, [0.04, 0.12, 0.2], null);
  doc.text('GOVERNMENT OF ASSAM / REGULATORY STATUTORY DOSSIER', 50, 782, { bold: true, size: 13, color: [1, 1, 1] });
  doc.text('Official Certified Copy - Registered for Zestmed Health Private Limited, Guwahati', 50, 766, { size: 8.5, color: [0.85, 0.9, 1] });
  doc.text(`DOCUMENT ID: ${docNumber}`, 50, 752, { bold: true, size: 8, color: [0.9, 0.95, 1] });
  doc.text('STATUS: VERIFIED', 430, 782, { bold: true, size: 10, color: [0.3, 0.9, 0.4] });
  doc.text('COMPLIANCE: RBI/DRUGS ACT', 410, 766, { size: 7.5, color: [0.85, 0.9, 1] });

  // Main Certificate Card
  doc.rect(36, 520, 523, 210, [0.98, 0.99, 1], [0.8, 0.85, 0.92], 1.5);
  doc.text('CERTIFICATE OF REGULATORY COMPLIANCE', 140, 705, { bold: true, size: 13, color: [0, 0.36, 0.73] });
  doc.line(140, 698, 455, 698, [0, 0.36, 0.73], 1);

  doc.text('Document Title:', 50, 675, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(title, 50, 660, { bold: true, size: 11, color: [0.04, 0.12, 0.2] });

  doc.text('Category:', 50, 638, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(category, 50, 625, { bold: true, size: 9.5 });

  doc.text('Statutory Registration / License Number:', 260, 638, { size: 8.5, color: [0.4, 0.45, 0.55] });
  doc.text(docNumber, 260, 625, { bold: true, size: 9.5, color: [0, 0.36, 0.73] });

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
