/**
 * Universal Item Classifier for Zestmed Healthcare
 * Accurately determines if an item is a Diagnostic Lab Test, Wellness Package, or Medicine
 */

export function isLabTestOrPackage(item) {
  if (!item) return false;

  const type = String(item.type || item.itemType || '').toLowerCase().trim();
  const cat = String(item.category || item.categoryName || '').toLowerCase().trim();
  const name = String(item.name || item.title || item.testName || '').toLowerCase().trim();
  const id = String(item.id || item.itemId || item.testCode || '').toLowerCase().trim();

  // 1. Explicit Lab/Diagnostic/Package Types
  if (['test', 'diagnostic', 'lab', 'package', 'wellness', 'screening', 'pathology'].includes(type)) {
    return true;
  }

  // 2. Explicit Medicine Types
  if (['medicine', 'pharma', 'pharmacy', 'drug'].includes(type)) {
    return false;
  }

  // 3. ID Prefixes
  if (id.startsWith('test-') || id.startsWith('pkg-') || id.startsWith('lab-') || id.startsWith('dx-') || id.startsWith('wel-')) {
    return true;
  }
  if (id.startsWith('med-') || id.startsWith('drg-')) {
    return false;
  }

  // 4. Diagnostic Categories
  const diagnosticCategories = [
    'diagnostic', 'diagnostic test', 'lab test', 'health package', 'wellness', 'package', 'screening',
    'pathology', 'biochemistry', 'hematology', 'microbiology', 'radiology', 'imaging',
    'liver', 'kidney', 'lipid', 'thyroid', 'diabetes', 'fever', 'bone', 'cardiac', 'urine', 'vitamin', 'blood'
  ];
  if (diagnosticCategories.some(c => cat === c || cat.includes(c))) {
    return true;
  }

  // 5. Test/Package specific attributes
  if (
    Array.isArray(item.tests) ||
    Array.isArray(item.parameters) ||
    Boolean(item.turnaroundTime) ||
    Boolean(item.testCode) ||
    Boolean(item.specimen) ||
    Boolean(item.fastingRequired) ||
    Boolean(item.sampleType)
  ) {
    return true;
  }

  // 6. Keywords in Name
  const testKeywords = [
    'test', 'profile', 'screening', 'package', 'panel',
    'lft', 'kft', 'cbc', 'lipid', 'thyroid', 'hba1c', 'hemoglobin', 'urine routine',
    'blood sugar', 'biopsy', 'culture', 'ultrasound', 'x-ray', 'ct scan', 'mri scan', 'ecg'
  ];
  if (testKeywords.some(kw => name.includes(kw))) {
    return true;
  }

  return false;
}

export function isWellnessPackage(item) {
  if (!item) return false;

  const type = String(item.type || item.itemType || item.serviceType || item.displayType || '').toLowerCase().trim();
  const cat = String(item.category || item.categoryName || '').toLowerCase().trim();
  const name = String(item.name || item.title || item.testName || item.serviceName || item.test_name || item.package_name || '').toLowerCase().trim();
  const id = String(item.id || item.itemId || item.testCode || item.bookingId || item.booking_number || '').toLowerCase().trim();

  // 1. Explicitly avoid matching pure surgery packages
  if (cat.includes('surgery') || type.includes('surgery') || name.includes('surgery') || id.startsWith('surg-')) {
    return false;
  }

  // 2. Explicitly avoid matching doctor consultations
  if (type === 'doctor' || cat.includes('doctor') || cat.includes('consultation')) {
    return false;
  }

  // 3. Explicitly avoid matching pure physiotherapy
  if (type.includes('physio') || cat.includes('physio') || name.includes('physio')) {
    return false;
  }

  // 4. Explicitly avoid matching pure medicines
  if (['medicine', 'pharma', 'pharmacy', 'drug'].includes(type) || id.startsWith('med-') || id.startsWith('drg-')) {
    return false;
  }

  // 5. Positive matches for wellness packages
  return (
    type === 'package' || type === 'wellness' || type.includes('wellness') ||
    cat.includes('wellness') || cat.includes('health package') || cat.includes('preventive package') ||
    name.includes('wellness') || name.includes('health package') || name.includes('screening package') ||
    name.includes('checkup package') || name.includes('citizen package') || name.includes('full body') ||
    name.includes('heart screen') || name.includes('urological health') ||
    id.startsWith('pkg-') || id.startsWith('wel-') || id.includes('-wel-') || id.includes('wel')
  );
}

export function isMedicineItem(item) {
  return !isLabTestOrPackage(item);
}
