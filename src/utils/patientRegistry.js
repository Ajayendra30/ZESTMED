// src/utils/patientRegistry.js
// Central Registered Patients Directory for ZESTMED with Supabase PostgreSQL Sync
import { savePatientProfile } from '../services/supabaseService';

export const DEFAULT_REGISTERED_PATIENTS = [
  {
    id: 'ZM-PAT-101',
    name: 'Ajayendra Shekhar',
    phone: '9279125091',
    email: 'ajayendra.shekhar@zestmed.com',
    city: 'Guwahati (Dispur)',
    age: 34,
    gender: 'Male',
    bloodGroup: 'B+',
    registeredAt: 'Oct 2024'
  },
  {
    id: 'ZM-PAT-102',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh.kumar@gmail.com',
    city: 'Guwahati (Ulubari)',
    age: 42,
    gender: 'Male',
    bloodGroup: 'O+',
    registeredAt: 'Nov 2024'
  },
  {
    id: 'ZM-PAT-103',
    name: 'Priya Sharma',
    phone: '9435012345',
    email: 'priya.sharma@gmail.com',
    city: 'Guwahati (Chandmari)',
    age: 29,
    gender: 'Female',
    bloodGroup: 'A+',
    registeredAt: 'Jan 2025'
  },
  {
    id: 'ZM-PAT-104',
    name: 'Amit Verma',
    phone: '9706098765',
    email: 'amit.verma@gmail.com',
    city: 'Guwahati (Jalukbari)',
    age: 38,
    gender: 'Male',
    bloodGroup: 'B+',
    registeredAt: 'Feb 2025'
  },
  {
    id: 'ZM-PAT-105',
    name: 'Sneha Singh',
    phone: '9127054321',
    email: 'sneha.singh@gmail.com',
    city: 'Guwahati (Khanapara)',
    age: 31,
    gender: 'Female',
    bloodGroup: 'AB+',
    registeredAt: 'Mar 2025'
  },
  {
    id: 'ZM-PAT-106',
    name: 'Deepjyoti Kalita',
    phone: '9864012345',
    email: 'deepjyoti.kalita@gmail.com',
    city: 'Guwahati (Panbazar)',
    age: 28,
    gender: 'Male',
    bloodGroup: 'O+',
    registeredAt: 'May 2025'
  }
];

export function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function purgeRahulVermaFromStorage() {
  try {
    // If not logged in, ensure no stale profiles remain in localStorage
    const storedUser = localStorage.getItem('zestmed_user');
    if (!storedUser) {
      localStorage.removeItem('zestmed_patient_profile');
      localStorage.removeItem('patient_profile');
    }

    // 1. Clean zestmed_user
    if (storedUser) {
      const u = JSON.parse(storedUser);
      if (u?.name === 'Rahul Verma' || (u?.email && u.email.includes('rahul.verma'))) {
        u.name = 'Ajayendra Shekhar';
        u.email = u.email ? u.email.replace(/rahul\.verma/gi, 'ajayendra.shekhar') : 'ajayendra.shekhar@zestmed.com';
        localStorage.setItem('zestmed_user', JSON.stringify(u));
      }
    }

    // 2. Clean zestmed_patient_profile
    const storedProfile = localStorage.getItem('zestmed_patient_profile');
    if (storedProfile) {
      const p = JSON.parse(storedProfile);
      if (p?.name === 'Rahul Verma' || (p?.email && p.email.includes('rahul.verma'))) {
        p.name = 'Ajayendra Shekhar';
        p.email = p.email ? p.email.replace(/rahul\.verma/gi, 'ajayendra.shekhar') : 'ajayendra.shekhar@zestmed.com';
        localStorage.setItem('zestmed_patient_profile', JSON.stringify(p));
      }
    }

    // 3. Clean zestmed_patient_registry
    const storedReg = localStorage.getItem('zestmed_patient_registry');
    if (storedReg) {
      const reg = JSON.parse(storedReg);
      let changed = false;
      Object.keys(reg).forEach((k) => {
        if (reg[k]?.name === 'Rahul Verma' || (reg[k]?.email && reg[k].email.includes('rahul.verma'))) {
          reg[k].name = 'Ajayendra Shekhar';
          reg[k].email = 'ajayendra.shekhar@zestmed.com';
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
        let changed = false;
        list.forEach((pat) => {
          if (pat?.name === 'Rahul Verma' || (pat?.email && pat.email.includes('rahul.verma'))) {
            pat.name = 'Ajayendra Shekhar';
            pat.email = 'ajayendra.shekhar@zestmed.com';
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('zestmed_admin_patients', JSON.stringify(list));
        }
      }
    }

    // Resolve current active logged-in user name
    let activeName = '';
    try {
      const u = JSON.parse(localStorage.getItem('zestmed_user') || '{}');
      if (u?.name && u.name !== 'Verified Patient' && u.name !== 'Rahul Verma') {
        activeName = u.name;
      }
    } catch (_) {}
    const fallbackName = activeName || 'Self';

    // 5. Clean zestmed_patient_notifications
    const storedNotifs = localStorage.getItem('zestmed_patient_notifications');
    if (storedNotifs && storedNotifs.includes('Rahul Verma')) {
      localStorage.setItem('zestmed_patient_notifications', storedNotifs.replace(/Rahul Verma/gi, 'Ajayendra Shekhar'));
    }

    // 6. Clean patient_appointments
    const storedAppts = localStorage.getItem('patient_appointments');
    if (storedAppts && storedAppts.includes('Rahul Verma')) {
      localStorage.setItem('patient_appointments', storedAppts.replace(/Rahul Verma/gi, 'Ajayendra Shekhar'));
    }

    // 7. Clean zestmed_patient_orders
    const storedOrders = localStorage.getItem('zestmed_patient_orders');
    if (storedOrders && storedOrders.includes('Rahul Verma')) {
      localStorage.setItem('zestmed_patient_orders', storedOrders.replace(/Rahul Verma/gi, 'Ajayendra Shekhar'));
    }

    // 8. Clean zestmed_patient_lab_bookings
    const storedLabs = localStorage.getItem('zestmed_patient_lab_bookings');
    if (storedLabs && storedLabs.includes('Rahul Verma')) {
      localStorage.setItem('zestmed_patient_lab_bookings', storedLabs.replace(/Rahul Verma/gi, 'Ajayendra Shekhar'));
    }
  } catch (_) {}
}

// Automatically purge any stale Rahul Verma entries on initial script execution
if (typeof window !== 'undefined') {
  purgeRahulVermaFromStorage();
}

export function getRegisteredPatient(phone) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) return null;

  try {
    // 1. Check local patient registry map
    const storedRegistry = localStorage.getItem('zestmed_patient_registry');
    if (storedRegistry) {
      const registryMap = JSON.parse(storedRegistry);
      if (registryMap && registryMap[cleanPhone] && registryMap[cleanPhone].name && registryMap[cleanPhone].name !== 'Verified Patient' && registryMap[cleanPhone].name !== 'Rahul Verma') {
        return registryMap[cleanPhone];
      }
    }

    // 2. Check admin patients list in localStorage
    const adminSaved = localStorage.getItem('zestmed_admin_patients');
    if (adminSaved) {
      const adminPatients = JSON.parse(adminSaved);
      if (Array.isArray(adminPatients)) {
        const found = adminPatients.find(p => normalizePhone(p.phone) === cleanPhone && p.name && p.name !== 'Verified Patient' && p.name !== 'Rahul Verma');
        if (found) return found;
      }
    }

    // 3. Check saved patient profile in localStorage
    const savedProfile = localStorage.getItem('zestmed_patient_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile && normalizePhone(profile.phone) === cleanPhone && profile.name && profile.name !== 'Verified Patient' && profile.name !== 'Rahul Verma') {
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

export function saveRegisteredPatient(phone, name, extraData = {}) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || !name || name === 'Verified Patient' || name === 'Rahul Verma') return null;

  try {
    // 1. Update patient registry map
    let registryMap = {};
    const stored = localStorage.getItem('zestmed_patient_registry');
    if (stored) {
      try { registryMap = JSON.parse(stored) || {}; } catch {}
    }

    const patientRecord = {
      id: extraData.id || registryMap[cleanPhone]?.id || `ZM-PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      phone: `+91 ${cleanPhone}`,
      cleanPhone,
      email: extraData.email || `${name.toLowerCase().replace(/\s+/g, '.')}@patient.zestmed.com`,
      city: extraData.city || 'Guwahati, Assam',
      age: extraData.age || 32,
      gender: extraData.gender || 'Male',
      bloodGroup: extraData.bloodGroup || 'B+',
      registeredAt: extraData.registeredAt || 'Nov 2026',
      ...extraData
    };

    registryMap[cleanPhone] = patientRecord;
    localStorage.setItem('zestmed_patient_registry', JSON.stringify(registryMap));

    // 2. Also keep admin patients list synchronized
    const adminSaved = localStorage.getItem('zestmed_admin_patients');
    let adminPatients = [];
    if (adminSaved) {
      try { adminPatients = JSON.parse(adminSaved) || []; } catch {}
    }
    const existingIndex = adminPatients.findIndex(p => normalizePhone(p.phone) === cleanPhone);
    if (existingIndex >= 0) {
      adminPatients[existingIndex] = { ...adminPatients[existingIndex], name: patientRecord.name };
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
