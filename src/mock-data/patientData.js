// src/mock-data/patientData.js
// Mock patient health records, pharmacy orders, and diagnostic reports
// Exclusively tailored for ZESTMED Health Private Limited (Assam Operational Hub)

export const initialPatientProfile = {
  id: 'ZM-PAT-781001-9041',
  name: 'Ajayendra Shekhar',
  age: 34,
  gender: 'Male',
  bloodGroup: 'B+',
  contact: '+91 92791 25091',
  email: 'ajayendra.shekhar@zestmed.com',
  hub: 'Guwahati Central Laboratory (Dispur)',
  emergencyContact: {
    name: 'Meena Verma (Mother)',
    phone: '+91 92791 25091'
  },
  memberSince: 'October 2024',
  verificationStatus: 'Active Assam Patient',
  vitals: {
    bloodPressure: { value: '118/78', unit: 'mmHg', status: 'Optimal', recordedAt: '10 Nov 2026' },
    fastingBloodSugar: { value: '94', unit: 'mg/dL', status: 'Normal', recordedAt: '08 Nov 2026' },
    totalCholesterol: { value: '186', unit: 'mg/dL', status: 'Desirable', recordedAt: '08 Nov 2026' },
    bmi: { value: '22.8', unit: 'kg/m²', status: 'Healthy', recordedAt: '10 Nov 2026' },
    hba1c: { value: '5.4', unit: '%', status: 'Non-Diabetic', recordedAt: '08 Nov 2026' },
    spo2: { value: '98', unit: '%', status: 'Normal', recordedAt: 'Today, 08:30 AM' }
  }
};

export const initialPatientOrders = [];

export const initialPatientLabBookings = [];

export const initialPatientPrescriptions = [];

export const initialAssamAddresses = [
  {
    id: 'addr-1',
    label: 'Home (Dispur)',
    recipientName: 'Ajayendra Shekhar',
    phone: '+91 92791 25091',
    street: 'Flat 4B, Brahmaputra Enclave, Near Assam Secretariat, GS Road',
    city: 'Guwahati',
    district: 'Kamrup Metropolitan (Dispur)',
    state: 'Assam',
    pincode: '781005',
    isDefault: true
  },
  {
    id: 'addr-2',
    label: 'Office (Christian Basti)',
    recipientName: 'Ajayendra Shekhar',
    phone: '+91 92791 25091',
    street: 'Tech Park Tower, 3rd Floor, Christian Basti, GS Road',
    city: 'Guwahati',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    pincode: '781005',
    isDefault: false
  },
  {
    id: 'addr-3',
    label: 'Primary Residence (Panbazar)',
    recipientName: 'Biren Verma',
    phone: '+91 92791 25091',
    street: 'House No. 12, MC Road, Near Dighalipukhuri, Panbazar',
    city: 'Guwahati',
    district: 'Kamrup Metro',
    state: 'Assam',
    pincode: '781001',
    isDefault: false
  }
];

export const initialPatientAppointments = [];
