// src/mock-data/patientData.js
// Mock patient health records, pharmacy orders, and diagnostic reports
// Exclusively tailored for ZESTMED Health Private Limited (Assam Operational Hub)

export const initialPatientProfile = {
  id: 'ZM-PAT-DEFAULT',
  name: 'Patient',
  age: 30,
  gender: 'Not Specified',
  bloodGroup: 'B+',
  contact: '',
  email: '',
  hub: 'Guwahati Central Laboratory (Dispur)',
  emergencyContact: {
    name: '',
    phone: ''
  },
  memberSince: '2026',
  verificationStatus: 'Active Assam Patient',
  vitals: {
    bloodPressure: { value: '120/80', unit: 'mmHg', status: 'Optimal', recordedAt: 'Today' },
    fastingBloodSugar: { value: '95', unit: 'mg/dL', status: 'Normal', recordedAt: 'Today' },
    totalCholesterol: { value: '180', unit: 'mg/dL', status: 'Desirable', recordedAt: 'Today' },
    bmi: { value: '22.0', unit: 'kg/m²', status: 'Healthy', recordedAt: 'Today' },
    hba1c: { value: '5.4', unit: '%', status: 'Non-Diabetic', recordedAt: 'Today' },
    spo2: { value: '99', unit: '%', status: 'Normal', recordedAt: 'Today' }
  }
};

export const initialPatientOrders = [];

export const initialPatientLabBookings = [];

export const initialPatientPrescriptions = [];

export const initialAssamAddresses = [];

export const initialPatientAppointments = [];
