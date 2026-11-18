// src/utils/patientRegistry.js
// Central Registered Patients Directory for ZESTMED

export const DEFAULT_REGISTERED_PATIENTS = [
  {
    id: 'ZM-PAT-101',
    name: 'Rahul Verma',
    phone: '9279125091',
    email: 'rahul.verma@demo.zestmed.com',
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
    name: 'Tinku Kalita',
    phone: '9864012345',
    aliases: ['9876500000', '9876543211', '9999999999', '9123456789', '9864000001', '9864000000'],
    email: 'tinku.kalita@gmail.com',
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

export function getRegisteredPatient(phone) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone) return null;

  try {
    // 1. Check local patient registry map
    const storedRegistry = localStorage.getItem('zestmed_patient_registry');
    if (storedRegistry) {
      const registryMap = JSON.parse(storedRegistry);
      if (registryMap && registryMap[cleanPhone] && registryMap[cleanPhone].name && registryMap[cleanPhone].name !== 'Verified Patient') {
        return registryMap[cleanPhone];
      }
    }

    // 2. Check admin patients list in localStorage
    const adminSaved = localStorage.getItem('zestmed_admin_patients');
    if (adminSaved) {
      const adminPatients = JSON.parse(adminSaved);
      if (Array.isArray(adminPatients)) {
        const found = adminPatients.find(p => normalizePhone(p.phone) === cleanPhone && p.name && p.name !== 'Verified Patient');
        if (found) return found;
      }
    }

    // 3. Check saved patient profile in localStorage
    const savedProfile = localStorage.getItem('zestmed_patient_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile && normalizePhone(profile.phone) === cleanPhone && profile.name && profile.name !== 'Verified Patient') {
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
  if (!cleanPhone || !name || name === 'Verified Patient') return null;

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

    return patientRecord;
  } catch (e) {
    console.error('Error saving to patient registry:', e);
    return null;
  }
}
