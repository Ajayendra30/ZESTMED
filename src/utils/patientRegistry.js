// src/utils/patientRegistry.js
// Central Registered Patients Directory for ZESTMED with Supabase PostgreSQL Sync
import { savePatientProfile, isDemoBooking } from '../services/supabaseService';

export const DEFAULT_REGISTERED_PATIENTS = [];

export function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function purgeRahulVermaFromStorage() {
  try {
    // 1. Clean zestmed_user in sessionStorage and purge from localStorage
    localStorage.removeItem('zestmed_user');
    localStorage.removeItem('zestmed_auth_session');

    const storedUser = sessionStorage.getItem('zestmed_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      const uPhone = normalizePhone(u?.phone || u?.contact || '');
      if (
        u?.name === 'Rahul Verma' || 
        u?.name === 'Ajayendra Shekhar' ||
        uPhone === '9279125091' ||
        (u?.email && (u.email.includes('rahul.verma') || u.email.includes('ajayendra')))
      ) {
        sessionStorage.removeItem('zestmed_user');
      }
    }

    // 2. Clean zestmed_patient_profile
    const storedProfile = localStorage.getItem('zestmed_patient_profile');
    if (storedProfile) {
      const p = JSON.parse(storedProfile);
      const pPhone = normalizePhone(p?.phone || p?.contact || '');
      if (
        p?.name === 'Rahul Verma' || 
        p?.name === 'Ajayendra Shekhar' ||
        pPhone === '9279125091' ||
        (p?.email && (p.email.includes('rahul.verma') || p.email.includes('ajayendra')))
      ) {
        localStorage.removeItem('zestmed_patient_profile');
      }
    }

    // 3. Clean zestmed_patient_registry
    const storedReg = localStorage.getItem('zestmed_patient_registry');
    if (storedReg) {
      const reg = JSON.parse(storedReg);
      let changed = false;
      Object.keys(reg).forEach((k) => {
        const itemPhone = normalizePhone(reg[k]?.phone || reg[k]?.contact || k);
        if (
          reg[k]?.name === 'Rahul Verma' || 
          reg[k]?.name === 'Ajayendra Shekhar' ||
          itemPhone === '9279125091' ||
          (reg[k]?.email && (reg[k].email.includes('rahul.verma') || reg[k].email.includes('ajayendra')))
        ) {
          delete reg[k];
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('zestmed_patient_registry', JSON.stringify(reg));
      }
    }

    // 4. Clean zestmed_admin_patients
    const storedAdmin = localStorage.getItem('zestmed_admin_patients');
    if (storedAdmin) {
      const list = JSON.parse(storedAdmin);
      if (Array.isArray(list)) {
        const filtered = list.filter((pat) => {
          const patPhone = normalizePhone(pat?.phone || pat?.contact || '');
          return (
            pat?.name !== 'Rahul Verma' &&
            pat?.name !== 'Ajayendra Shekhar' &&
            patPhone !== '9279125091'
          );
        });
        localStorage.setItem('zestmed_admin_patients', JSON.stringify(filtered));
      }
    }

    // 5. Add 9279125091 to persistent zestmed_deleted_patients blacklist
    try {
      const deletedSaved = localStorage.getItem('zestmed_deleted_patients');
      const deletedList = deletedSaved ? JSON.parse(deletedSaved) : [];
      if (!deletedList.includes('9279125091')) {
        deletedList.push('9279125091');
        localStorage.setItem('zestmed_deleted_patients', JSON.stringify(deletedList));
      }
    } catch (_) {}

    // Resolve current active logged-in user name
    let activeName = '';
    try {
      const u = JSON.parse(sessionStorage.getItem('zestmed_user') || '{}');
      if (u?.name && u.name !== 'Verified Patient' && u.name !== 'Rahul Verma' && u.name !== 'Ajayendra Shekhar') {
        activeName = u.name;
      }
    } catch (_) {}
    const fallbackName = activeName || 'Self';

    // 6. Clean zestmed_patient_notifications
    const storedNotifs = localStorage.getItem('zestmed_patient_notifications');
    if (storedNotifs && (storedNotifs.includes('Rahul Verma') || storedNotifs.includes('Ajayendra Shekhar'))) {
      localStorage.setItem(
        'zestmed_patient_notifications', 
        storedNotifs.replace(/Rahul Verma/gi, 'Patient').replace(/Ajayendra Shekhar/gi, 'Patient')
      );
    }

    // 7. Clean patient_appointments and remove demo mock entries
    const storedAppts = localStorage.getItem('patient_appointments');
    if (storedAppts) {
      try {
        let apptList = JSON.parse(storedAppts);
        if (Array.isArray(apptList)) {
          apptList = apptList.filter(a => !isDemoBooking(a));
          localStorage.setItem('patient_appointments', JSON.stringify(apptList));
        }
      } catch (_) {}
    }

    // 8. Clean zestmed_patient_orders and remove demo mock entries
    const storedOrders = localStorage.getItem('zestmed_patient_orders');
    if (storedOrders) {
      try {
        let ordList = JSON.parse(storedOrders);
        if (Array.isArray(ordList)) {
          ordList = ordList.filter(o => !isDemoBooking(o));
          localStorage.setItem('zestmed_patient_orders', JSON.stringify(ordList));
        }
      } catch (_) {}
    }

    // 9. Clean zestmed_patient_lab_bookings & ensure wellness packages are correctly classified
    const storedLabs = localStorage.getItem('zestmed_patient_lab_bookings');
    if (storedLabs) {
      try {
        const parsed = JSON.parse(storedLabs);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(b => !isDemoBooking(b)).map(b => {
            const name = (b.testName || b.name || '').toLowerCase();
            if (name.includes('wellness') || name.includes('health package')) {
              if (b.type !== 'Wellness Package' || b.itemType !== 'wellness') {
                return {
                  ...b,
                  type: 'Wellness Package',
                  itemType: 'wellness',
                  serviceType: 'Wellness Package',
                  displayType: 'Wellness Health Package',
                  category: 'Wellness Package'
                };
              }
            }
            return b;
          });
          localStorage.setItem('zestmed_patient_lab_bookings', JSON.stringify(cleaned));
        }
      } catch (_) {}
    }
  } catch (_) {}
}

// Automatically purge any stale Rahul Verma entries on initial script execution
if (typeof window !== 'undefined') {
  purgeRahulVermaFromStorage();
}

export function getRegisteredPatient(phone) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone === '9279125091') return null;

  try {
    const deletedRaw = localStorage.getItem('zestmed_deleted_patients');
    if (deletedRaw) {
      const deletedList = JSON.parse(deletedRaw);
      if (Array.isArray(deletedList) && (deletedList.includes(cleanPhone) || deletedList.includes('9279125091'))) {
        return null;
      }
    }
  } catch (_) {}

  try {
    // 1. Check local patient registry map
    const storedRegistry = localStorage.getItem('zestmed_patient_registry');
    if (storedRegistry) {
      const registryMap = JSON.parse(storedRegistry);
      if (
        registryMap &&
        registryMap[cleanPhone] &&
        registryMap[cleanPhone].name &&
        registryMap[cleanPhone].name !== 'Verified Patient' &&
        registryMap[cleanPhone].name !== 'Rahul Verma' &&
        registryMap[cleanPhone].name !== 'Ajayendra Shekhar'
      ) {
        return registryMap[cleanPhone];
      }
    }

    // 2. Check admin patients list in localStorage
    const adminSaved = localStorage.getItem('zestmed_admin_patients');
    if (adminSaved) {
      const adminPatients = JSON.parse(adminSaved);
      if (Array.isArray(adminPatients)) {
        const found = adminPatients.find(
          p =>
            normalizePhone(p.phone) === cleanPhone &&
            p.name &&
            p.name !== 'Verified Patient' &&
            p.name !== 'Rahul Verma' &&
            p.name !== 'Ajayendra Shekhar'
        );
        if (found) return found;
      }
    }

    // 3. Check saved patient profile in localStorage
    const savedProfile = localStorage.getItem('zestmed_patient_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (
        profile &&
        normalizePhone(profile.phone) === cleanPhone &&
        profile.name &&
        profile.name !== 'Verified Patient' &&
        profile.name !== 'Rahul Verma' &&
        profile.name !== 'Ajayendra Shekhar'
      ) {
        return profile;
      }
    }
  } catch (e) {
    console.error('Error reading patient registry:', e);
  }

  // 4. Check default registered patients list
  for (const patient of DEFAULT_REGISTERED_PATIENTS) {
    if (normalizePhone(patient.phone) === cleanPhone) {
      return patient;
    }
    if (Array.isArray(patient.aliases) && patient.aliases.some(alias => normalizePhone(alias) === cleanPhone)) {
      return patient;
    }
  }

  return null;
}

/**
 * Validates "One Number, One User" uniqueness.
 * Prevents multiple user accounts from being created using the same phone number.
 */
export function checkPhoneUniqueness(phone, currentUserId = null) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) return { isUnique: true };

  const existing = getRegisteredPatient(cleanPhone);
  if (existing) {
    if (currentUserId && (existing.id === currentUserId || existing.cleanPhone === cleanPhone)) {
      return { isUnique: true, existingUser: existing };
    }
    return { isUnique: false, existingUser: existing };
  }

  return { isUnique: true, existingUser: null };
}

export function saveRegisteredPatient(phone, name, extraData = {}) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || !name || name === 'Verified Patient' || name === 'Rahul Verma' || name === 'Ajayendra Shekhar' || cleanPhone === '9279125091') return null;

  try {
    // 1. Update patient registry map
    let registryMap = {};
    const stored = localStorage.getItem('zestmed_patient_registry');
    if (stored) {
      try { registryMap = JSON.parse(stored) || {}; } catch {}
    }

    const existingRecord = registryMap[cleanPhone] || {};
    const stableId = extraData.id || existingRecord.id || `ZM-PAT-${cleanPhone.slice(-4)}`;
    const stableUhid = extraData.uhid || existingRecord.uhid || stableId;

    const patientRecord = {
      ...existingRecord,
      ...extraData,
      id: stableId,
      uhid: stableUhid,
      name: name.trim(),
      phone: `+91 ${cleanPhone}`,
      cleanPhone,
      email: extraData.email || existingRecord.email || `${name.toLowerCase().replace(/\s+/g, '.')}@patient.zestmed.com`,
      city: extraData.city || existingRecord.city || 'Guwahati, Assam',
      age: extraData.age || existingRecord.age || 32,
      gender: extraData.gender || existingRecord.gender || 'Male',
      bloodGroup: extraData.bloodGroup || existingRecord.bloodGroup || 'B+',
      emergencyContact: extraData.emergencyContact || existingRecord.emergencyContact || '',
      registeredAt: existingRecord.registeredAt || extraData.registeredAt || 'Nov 2026',
      updatedAt: new Date().toISOString()
    };

    registryMap[cleanPhone] = patientRecord;
    localStorage.setItem('zestmed_patient_registry', JSON.stringify(registryMap));

    // 2. Also keep admin patients list synchronized without creating duplicates
    const adminSaved = localStorage.getItem('zestmed_admin_patients');
    let adminPatients = [];
    if (adminSaved) {
      try { adminPatients = JSON.parse(adminSaved) || []; } catch {}
    }
    const existingIndex = adminPatients.findIndex(p => normalizePhone(p.phone) === cleanPhone);
    if (existingIndex >= 0) {
      adminPatients[existingIndex] = {
        ...adminPatients[existingIndex],
        id: patientRecord.id,
        name: patientRecord.name,
        phone: patientRecord.phone,
        city: patientRecord.city
      };
    } else {
      adminPatients.push({
        id: patientRecord.id,
        name: patientRecord.name,
        phone: patientRecord.phone,
        city: patientRecord.city,
        bookingsCount: 0,
        ordersCount: 0,
        status: 'Active'
      });
    }
    localStorage.setItem('zestmed_admin_patients', JSON.stringify(adminPatients));

    // 3. Persist patient profile to Supabase PostgreSQL in background
    try {
      savePatientProfile({
        phone: cleanPhone,
        name: patientRecord.name,
        email: patientRecord.email,
        age: patientRecord.age,
        gender: patientRecord.gender,
        blood_group: patientRecord.bloodGroup,
        city: patientRecord.city
      });
    } catch (dbErr) {
      console.warn('Background Supabase profile sync warning:', dbErr);
    }

    return patientRecord;
  } catch (e) {
    console.error('Error saving to patient registry:', e);
    return null;
  }
}

/**
 * Removes a patient from all local registry tables and records their identifier/phone
 * in the persistent zestmed_deleted_patients blacklist.
 */
export function deleteRegisteredPatient(identifier, phone = null) {
  const clean = normalizePhone(phone || identifier);
  const idStr = identifier ? String(identifier).trim() : '';

  try {
    // 1. Clean zestmed_patient_registry
    const stored = localStorage.getItem('zestmed_patient_registry');
    if (stored) {
      const reg = JSON.parse(stored);
      if (clean && reg[clean]) delete reg[clean];
      if (idStr && reg[idStr]) delete reg[idStr];
      localStorage.setItem('zestmed_patient_registry', JSON.stringify(reg));
    }

    // 2. Clean zestmed_admin_patients
    const adminSaved = localStorage.getItem('zestmed_admin_patients');
    if (adminSaved) {
      const adminPatients = JSON.parse(adminSaved);
      if (Array.isArray(adminPatients)) {
        const filtered = adminPatients.filter(
          (p) => p.id !== idStr && normalizePhone(p.phone) !== clean
        );
        localStorage.setItem('zestmed_admin_patients', JSON.stringify(filtered));
      }
    }

    // 3. Clean zestmed_patient_profile if it matches deleted patient
    const profileSaved = localStorage.getItem('zestmed_patient_profile');
    if (profileSaved) {
      const prof = JSON.parse(profileSaved);
      if (prof && (prof.id === idStr || normalizePhone(prof.phone) === clean)) {
        localStorage.removeItem('zestmed_patient_profile');
      }
    }

    // 4. Record into zestmed_deleted_patients blacklist
    const deletedSaved = localStorage.getItem('zestmed_deleted_patients');
    const deletedList = deletedSaved ? JSON.parse(deletedSaved) : [];
    const toAdd = [idStr, clean].filter(Boolean);
    const newDeleted = Array.from(new Set([...deletedList, ...toAdd]));
    localStorage.setItem('zestmed_deleted_patients', JSON.stringify(newDeleted));
  } catch (e) {
    console.error('Error deleting from patient registry:', e);
  }
}
