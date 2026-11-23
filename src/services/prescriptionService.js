// src/services/prescriptionService.js
/**
 * ZESTMED REAL PRESCRIPTION MANAGEMENT SERVICE
 * Handles genuine prescription file uploads (PDF, JPG, PNG up to 10MB),
 * Supabase Storage persistence, Supabase PostgreSQL database integration,
 * resilient local/backend sync, and Admin audit workflow.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { normalizePhone } from './supabaseService';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validate a prescription file before upload
 */
export const validatePrescriptionFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Please select a file to upload.' };
  }

  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const mimeType = (file.type || '').toLowerCase();

  const isExtensionValid = ALLOWED_EXTENSIONS.includes(extension);
  const isMimeValid = ALLOWED_MIME_TYPES.includes(mimeType) || isExtensionValid;

  if (!isMimeValid) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a PDF, JPG, or PNG document.'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB.`
    };
  }

  return { valid: true };
};

/**
 * Convert a File object to base64 Data URL for offline resilience & direct embedding
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload genuine prescription file to Supabase Storage with graceful fallback
 */
export const uploadPrescriptionFileToSupabase = async (file, prescriptionId) => {
  if (!file) return null;

  const extension = (file.name.split('.').pop() || 'pdf').toLowerCase();
  const safeFilename = `${prescriptionId}_${Date.now()}.${extension}`;
  const filePath = `prescriptions/${safeFilename}`;

  // 1. Try Supabase Storage bucket 'prescriptions' if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/octet-stream'
        });

      if (!error && data?.path) {
        const { data: urlData } = supabase.storage
          .from('prescriptions')
          .getPublicUrl(data.path);

        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn('[PrescriptionService] Supabase Storage upload error (falling back to Data URL):', storageErr);
    }
  }

  // 2. Fallback: Convert to persistent Base64 Data URL
  try {
    const dataUrl = await fileToDataUrl(file);
    return dataUrl;
  } catch (err) {
    console.error('[PrescriptionService] Error creating file data URL:', err);
    return null;
  }
};

/**
 * Save new genuine prescription to Supabase PostgreSQL Database + Backend + LocalStorage
 */
export const savePrescription = async ({ file, user, patientNote = '', manualData = {} }) => {
  const rxId = manualData.id || `ZM-RX-${Date.now().toString().slice(-6)}`;
  const cleanPhone = normalizePhone(user?.phone || user?.contact || manualData.phone || '');
  const patientName = user?.name || manualData.patientName || 'Verified Patient';
  const userEmail = user?.email || manualData.userEmail || '';
  const userId = user?.id || manualData.userId || '';

  // 1. Upload or encode genuine file
  let fileUrl = manualData.fileUrl || null;
  if (file) {
    fileUrl = await uploadPrescriptionFileToSupabase(file, rxId);
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const prescriptionRecord = {
    id: rxId,
    prescription_id: rxId,
    user_id: userId,
    userId: userId,
    patient_name: patientName,
    patientName: patientName,
    phone: cleanPhone,
    patientPhone: cleanPhone,
    user_email: userEmail,
    userEmail: userEmail,
    file_name: file ? file.name : (manualData.fileName || 'prescription_document.pdf'),
    fileName: file ? file.name : (manualData.fileName || 'prescription_document.pdf'),
    file_size: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : (manualData.fileSize || '1.0 MB'),
    fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : (manualData.fileSize || '1.0 MB'),
    file_type: file ? file.type : (manualData.fileType || 'application/pdf'),
    fileType: file ? file.type : (manualData.fileType || 'application/pdf'),
    file_url: fileUrl,
    fileUrl: fileUrl,
    imagePreview: fileUrl,
    notes: patientNote || manualData.notes || '',
    patientNote: patientNote || manualData.notes || '',
    status: 'Pending',
    statusLabel: 'Pending Chief Pharmacist Audit',
    doctor_name: manualData.doctorName || 'Registered Medical Practitioner',
    doctorName: manualData.doctorName || 'Registered Medical Practitioner',
    clinic_name: manualData.clinicName || 'Guwahati Health Center',
    clinicName: manualData.clinicName || 'Guwahati Health Center',
    specialty: manualData.specialty || 'General Medicine',
    hospital: manualData.hospital || 'Assam Health Desk, Guwahati',
    doctor_reg_no: manualData.regNumber || 'Pending Verification',
    doctorRegNo: manualData.regNumber || 'Pending Verification',
    regNumber: manualData.regNumber || 'Pending Verification',
    dateOfIssue: formattedDate,
    expiryDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    medicines: manualData.medicines || [],
    pharmacistNotes: '',
    uploadedAt: `${formattedDate}, ${formattedTime}`,
    createdAt: now.toISOString(),
    created_at: now.toISOString(),
    updatedAt: now.toISOString()
  };

  // 2. Persist to Supabase Database table 'prescriptions' if configured
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('prescriptions').insert([{
        id: rxId,
        user_id: userId || null,
        patient_name: patientName,
        phone: cleanPhone,
        email: userEmail,
        file_url: fileUrl,
        file_name: prescriptionRecord.fileName,
        file_size: prescriptionRecord.fileSize,
        file_type: prescriptionRecord.fileType,
        notes: patientNote,
        status: 'Pending',
        doctor_name: prescriptionRecord.doctorName,
        created_at: now.toISOString()
      }]);
      if (error) {
        console.warn('[PrescriptionService] Supabase DB insert notice:', error.message);
      }
    } catch (dbErr) {
      console.warn('[PrescriptionService] Supabase DB error:', dbErr);
    }
  }

  // 3. Persist to backend server API
  try {
    await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionRecord)
    });
  } catch (_) {}

  // 4. Update local storage stores with real records
  try {
    // A. Patient prescriptions
    const patientRxList = JSON.parse(localStorage.getItem('zestmed_patient_prescriptions') || '[]');
    const filteredPatient = Array.isArray(patientRxList) ? patientRxList.filter(p => p.id !== rxId) : [];
    localStorage.setItem('zestmed_patient_prescriptions', JSON.stringify([prescriptionRecord, ...filteredPatient]));

    // B. Admin prescriptions queue
    const adminRxList = JSON.parse(localStorage.getItem('zestmed_prescriptions') || '[]');
    const filteredAdmin = Array.isArray(adminRxList) ? adminRxList.filter(p => p.id !== rxId) : [];
    localStorage.setItem('zestmed_prescriptions', JSON.stringify([prescriptionRecord, ...filteredAdmin]));

    // Dispatch global events for instant reactive UI updates
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zestmed_prescription_updated', { detail: prescriptionRecord }));
  } catch (err) {
    console.error('[PrescriptionService] Error writing to localStorage:', err);
  }

  return prescriptionRecord;
};

/**
 * Fetch prescriptions for current logged-in user
 */
export const getUserPrescriptions = async (user) => {
  if (!user) return [];

  const cleanPhone = normalizePhone(user.phone || user.contact || '');
  const userId = user.id || '';
  const userEmail = (user.email || '').trim().toLowerCase();

  const isMatch = (item) => {
    if (!item) return false;
    const itemPhone = normalizePhone(item.phone || item.patientPhone || '');
    if (cleanPhone && itemPhone && cleanPhone === itemPhone) return true;
    if (userId && (item.userId || item.user_id) && String(userId) === String(item.userId || item.user_id)) return true;
    if (userEmail && (item.userEmail || item.email)) {
      if (String(item.userEmail || item.email).trim().toLowerCase() === userEmail) return true;
    }
    return false;
  };

  const resultsMap = new Map();

  // 1. Fetch from Supabase PostgreSQL table if configured
  if (isSupabaseConfigured()) {
    try {
      const filters = [];
      if (cleanPhone) filters.push(`phone.ilike.%${cleanPhone}%`);
      if (userId) filters.push(`user_id.eq.${userId}`);
      if (userEmail) filters.push(`email.eq.${userEmail}`);

      if (filters.length > 0) {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('*')
          .or(filters.join(','))
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          data.forEach(item => {
            const rxId = item.id;
            resultsMap.set(String(rxId), {
              id: rxId,
              prescription_id: rxId,
              patientName: item.patient_name || user.name,
              phone: item.phone,
              userEmail: item.email,
              fileUrl: item.file_url,
              imagePreview: item.file_url,
              fileName: item.file_name || 'Prescription_Document.pdf',
              fileSize: item.file_size || '1.0 MB',
              fileType: item.file_type || 'application/pdf',
              status: item.status || 'Pending',
              doctorName: item.doctor_name || 'Registered Medical Practitioner',
              clinicName: item.clinic_name || 'Guwahati Health Center',
              specialty: item.specialty || 'General Medicine',
              hospital: item.hospital || 'Assam Health Desk, Guwahati',
              notes: item.notes || '',
              pharmacistNotes: item.pharmacist_notes || '',
              uploadedAt: item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently Uploaded',
              dateOfIssue: item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
              expiryDate: item.expiry_date || 'Standard Validity (6 Months)',
              medicines: Array.isArray(item.medicines) ? item.medicines : []
            });
          });
        }
      }
    } catch (err) {
      console.warn('[PrescriptionService] Supabase fetch error:', err);
    }
  }

  // 2. Fetch from backend server API
  try {
    const res = await fetch(`/api/prescriptions?phone=${cleanPhone || ''}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.filter(isMatch).forEach(item => {
          resultsMap.set(String(item.id), item);
        });
      }
    }
  } catch (_) {}

  // 3. Merge with local storage
  try {
    const local = JSON.parse(localStorage.getItem('zestmed_patient_prescriptions') || '[]');
    if (Array.isArray(local)) {
      local.filter(isMatch).forEach(item => {
        // Strip out any legacy demo records
        if (!item.id?.includes('Sample') && !item.fileName?.includes('Sample_Dr_Kulkarni')) {
          if (!resultsMap.has(String(item.id))) {
            resultsMap.set(String(item.id), item);
          }
        }
      });
    }
  } catch (_) {}

  return Array.from(resultsMap.values()).sort((a, b) => {
    return new Date(b.createdAt || b.uploadedAt || 0).getTime() - new Date(a.createdAt || a.uploadedAt || 0).getTime();
  });
};

/**
 * Fetch all prescriptions for Chief Pharmacist / Admin
 */
export const getAllPrescriptions = async () => {
  const resultsMap = new Map();

  // 1. Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        data.forEach(item => {
          resultsMap.set(String(item.id), {
            id: item.id,
            prescription_id: item.id,
            patient: item.patient_name || 'Patient',
            patientName: item.patient_name || 'Patient',
            phone: item.phone || '',
            userEmail: item.email || '',
            fileUrl: item.file_url,
            imagePreview: item.file_url,
            fileName: item.file_name || 'Prescription_Document.pdf',
            fileSize: item.file_size || '1.0 MB',
            fileType: item.file_type || 'application/pdf',
            status: item.status || 'Pending',
            doctor: item.doctor_name || 'Registered Medical Practitioner',
            doctorName: item.doctor_name || 'Registered Medical Practitioner',
            clinicName: item.clinic_name || 'Guwahati Health Center',
            specialty: item.specialty || 'General Medicine',
            hospital: item.hospital || 'Assam Health Desk, Guwahati',
            doctorRegNo: item.doctor_reg_no || 'Pending Verification',
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
            uploadedAt: item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
            notes: item.notes || '',
            patientNote: item.notes || '',
            pharmacistNotes: item.pharmacist_notes || '',
            items: item.items || 'Prescribed Medicines (Pending Audit)',
            medicines: Array.isArray(item.medicines) ? item.medicines : []
          });
        });
      }
    } catch (err) {
      console.warn('[PrescriptionService] Admin Supabase fetch error:', err);
    }
  }

  // 2. Try backend API
  try {
    const res = await fetch('/api/prescriptions');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach(item => {
          resultsMap.set(String(item.id), item);
        });
      }
    }
  } catch (_) {}

  // 3. Merge with localStorage zestmed_prescriptions (ignoring dummy records)
  try {
    const local = JSON.parse(localStorage.getItem('zestmed_prescriptions') || '[]');
    if (Array.isArray(local)) {
      local.forEach(item => {
        // Exclude dummy records RX-9821, RX-9822, RX-9823
        const isDummy = item.id === 'RX-9821' || item.id === 'RX-9822' || item.id === 'RX-9823' || item.fileName?.includes('Sample_Dr_Kulkarni');
        if (!isDummy && !resultsMap.has(String(item.id))) {
          resultsMap.set(String(item.id), item);
        }
      });
    }
  } catch (_) {}

  return Array.from(resultsMap.values()).sort((a, b) => {
    return new Date(b.createdAt || b.uploadedAt || 0).getTime() - new Date(a.createdAt || a.uploadedAt || 0).getTime();
  });
};

/**
 * Update prescription status (Approve / Reject) by Admin
 */
export const updatePrescriptionStatus = async (prescriptionId, status, pharmacistNotes = '', medicines = []) => {
  const now = new Date().toISOString();

  // 1. Update in Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('prescriptions')
        .update({
          status,
          pharmacist_notes: pharmacistNotes,
          updated_at: now
        })
        .eq('id', prescriptionId);
    } catch (err) {
      console.warn('[PrescriptionService] Error updating Supabase status:', err);
    }
  }

  // 2. Update via backend API
  try {
    await fetch('/api/prescriptions/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: prescriptionId,
        status,
        pharmacistNotes,
        medicines
      })
    });
  } catch (_) {}

  // 3. Update in local storage stores
  const updateList = (storageKey) => {
    try {
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(items)) {
        const updated = items.map(item => {
          if (String(item.id) === String(prescriptionId)) {
            return {
              ...item,
              status,
              statusLabel: status === 'Approved' ? 'Approved & Verified' : status === 'Rejected' ? 'Rejected' : 'In Review',
              pharmacistNotes,
              remarks: pharmacistNotes,
              medicines: medicines.length > 0 ? medicines : item.medicines,
              updatedAt: now
            };
          }
          return item;
        });
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    } catch (_) {}
  };

  updateList('zestmed_patient_prescriptions');
  updateList('zestmed_prescriptions');

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('zestmed_prescription_updated', {
    detail: { id: prescriptionId, status, pharmacistNotes }
  }));

  return { success: true };
};

/**
 * Delete prescription
 */
export const deletePrescription = async (prescriptionId) => {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('prescriptions').delete().eq('id', prescriptionId);
    } catch (_) {}
  }

  try {
    await fetch(`/api/prescriptions/${prescriptionId}`, { method: 'DELETE' });
  } catch (_) {}

  const deleteFromList = (storageKey) => {
    try {
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(items)) {
        const updated = items.filter(it => String(it.id) !== String(prescriptionId));
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    } catch (_) {}
  };

  deleteFromList('zestmed_patient_prescriptions');
  deleteFromList('zestmed_prescriptions');

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('zestmed_prescription_updated'));
  return { success: true };
};

/**
 * Download genuine prescription file
 */
export const downloadPrescriptionFile = (prescription) => {
  if (!prescription) return;
  const fileUrl = prescription.fileUrl || prescription.imagePreview || prescription.file_url;
  const fileName = prescription.fileName || prescription.file_name || `${prescription.id}_document.pdf`;

  if (!fileUrl) {
    alert('Document file URL is not available.');
    return;
  }

  // If it's a data URL, create a download anchor
  if (fileUrl.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    // If it's an external or Supabase URL, open in new tab or download
    const a = document.createElement('a');
    a.href = fileUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
