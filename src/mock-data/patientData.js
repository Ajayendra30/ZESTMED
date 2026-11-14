// src/mock-data/patientData.js
// Mock patient health records, pharmacy orders, diagnostic reports, and family profiles
// Exclusively tailored for ZESTMED Health Private Limited (Assam Operational Hub)

export const initialPatientProfile = {
  id: 'ZM-PAT-781001-9041',
  name: 'Rahul Verma',
  age: 34,
  gender: 'Male',
  bloodGroup: 'B+',
  contact: '+91 92791 25091',
  email: 'rahul.verma@demo.zestmed.com',
  hub: 'Guwahati Central Laboratory (Dispur)',
  emergencyContact: {
    name: 'Meena Verma (Mother)',
    phone: '+91 92791 25091'
  },
  memberSince: 'October 2024',
  verificationStatus: 'Verified Assam Patient',
  vitals: {
    bloodPressure: { value: '118/78', unit: 'mmHg', status: 'Optimal', recordedAt: '10 Nov 2026' },
    fastingBloodSugar: { value: '94', unit: 'mg/dL', status: 'Normal', recordedAt: '08 Nov 2026' },
    totalCholesterol: { value: '186', unit: 'mg/dL', status: 'Desirable', recordedAt: '08 Nov 2026' },
    bmi: { value: '22.8', unit: 'kg/m²', status: 'Healthy', recordedAt: '10 Nov 2026' },
    hba1c: { value: '5.4', unit: '%', status: 'Non-Diabetic', recordedAt: '08 Nov 2026' },
    spo2: { value: '98', unit: '%', status: 'Normal', recordedAt: 'Today, 08:30 AM' }
  }
};

export const initialPatientOrders = [
  {
    id: 'ZM-ORD-2026-9045',
    date: '12 Nov 2026',
    time: '09:15 AM',
    status: 'Out for Delivery',
    hub: 'Dispur Express Delivery Hub, Guwahati',
    deliveryAddress: 'Flat 4B, Brahmaputra Enclave, GS Road, Dispur, Guwahati - 781005',
    paymentMethod: 'UPI (Prepaid - Verified)',
    totalAmount: 980,
    mrpTotal: 1250,
    savings: 270,
    deliveryFee: 0,
    trackingSteps: [
      { title: 'Order Placed & Confirmed', time: '12 Nov, 09:15 AM', completed: true },
      { title: 'Verified by Registered Pharmacist (Guwahati)', time: '12 Nov, 10:30 AM', completed: true },
      { title: 'Cold-pack Packaging & Dispatched', time: '12 Nov, 11:45 AM', completed: true },
      { title: 'Out for Delivery (Rider: Bikash Kalita)', time: '12 Nov, 01:20 PM', completed: true, current: true },
      { title: 'Delivered at Doorstep', time: 'Estimated by 04:30 PM', completed: false }
    ],
    items: [
      {
        id: 'med-dia-1',
        name: 'Metformin 500mg SR Tablet',
        manufacturer: 'USV Pvt Ltd',
        dosage: '10 Tablets Strip (Strip of 10)',
        quantity: 3,
        price: 45,
        mrp: 60
      },
      {
        id: 'med-card-2',
        name: 'Rosuvastatin 10mg Tablets',
        manufacturer: 'Sun Pharma',
        dosage: 'Strip of 10 Tablets',
        quantity: 2,
        price: 195,
        mrp: 260
      },
      {
        id: 'med-dev-1',
        name: 'Accu-Chek Active 50 Test Strips',
        manufacturer: 'Roche Diagnostics',
        dosage: 'Box of 50 Strips',
        quantity: 1,
        price: 980,
        mrp: 1199
      }
    ]
  },
  {
    id: 'ZM-ORD-2026-8812',
    date: '02 Nov 2026',
    time: '11:40 AM',
    status: 'Delivered',
    hub: 'Guwahati Central Hub, Assam',
    deliveryAddress: 'Flat 4B, Brahmaputra Enclave, GS Road, Dispur, Guwahati - 781005',
    paymentMethod: 'Cash on Delivery',
    totalAmount: 485,
    mrpTotal: 620,
    savings: 135,
    deliveryFee: 0,
    trackingSteps: [
      { title: 'Order Placed', time: '02 Nov, 11:40 AM', completed: true },
      { title: 'Pharmacist Verification', time: '02 Nov, 12:10 PM', completed: true },
      { title: 'Dispatched from Hub', time: '02 Nov, 02:00 PM', completed: true },
      { title: 'Out for Delivery', time: '02 Nov, 03:30 PM', completed: true },
      { title: 'Delivered Successfully', time: '02 Nov, 04:45 PM', completed: true, current: true }
    ],
    items: [
      {
        id: 'med-gen-1',
        name: 'Paracetamol 650mg Fast-Release',
        manufacturer: 'Micro Labs',
        dosage: 'Strip of 15 Tablets',
        quantity: 2,
        price: 32,
        mrp: 42
      },
      {
        id: 'med-vit-1',
        name: 'Vitamin C 500mg + Zinc Chewable',
        manufacturer: 'Abbott Healthcare',
        dosage: 'Bottle of 30 Chewable Tablets',
        quantity: 2,
        price: 105,
        mrp: 140
      },
      {
        id: 'med-gen-3',
        name: 'Pantoprazole 40mg Gastro-Resistant',
        manufacturer: 'Alkem Laboratories',
        dosage: 'Strip of 15 Tablets',
        quantity: 1,
        price: 115,
        mrp: 155
      }
    ]
  },
  {
    id: 'ZM-ORD-2026-7201',
    date: '18 Oct 2026',
    time: '04:15 PM',
    status: 'Delivered',
    hub: 'Jorhat Branch Hub, Assam',
    deliveryAddress: 'House 12, RKB Path, Tarajan, Jorhat - 785001',
    paymentMethod: 'Net Banking (Demo)',
    totalAmount: 340,
    mrpTotal: 430,
    savings: 90,
    deliveryFee: 0,
    trackingSteps: [
      { title: 'Order Placed', time: '18 Oct, 04:15 PM', completed: true },
      { title: 'Pharmacist Check', time: '18 Oct, 05:00 PM', completed: true },
      { title: 'Dispatched', time: '19 Oct, 09:30 AM', completed: true },
      { title: 'Delivered', time: '19 Oct, 01:20 PM', completed: true, current: true }
    ],
    items: [
      {
        id: 'med-gen-2',
        name: 'Cetirizine 10mg Anti-Allergy',
        manufacturer: 'Cipla Ltd',
        dosage: 'Strip of 10 Tablets',
        quantity: 3,
        price: 24,
        mrp: 35
      },
      {
        id: 'med-vit-2',
        name: 'Vitamin D3 60,000 IU Softgels',
        manufacturer: 'Cadila Pharma',
        dosage: 'Strip of 4 Capsules',
        quantity: 2,
        price: 120,
        mrp: 160
      }
    ]
  }
];

export const initialPatientLabBookings = [
  {
    id: 'ZM-LAB-781001-4402',
    testName: 'Complete Blood Count (CBC with ESR)',
    testCode: 'CBC-28P',
    category: 'Hematology',
    bookedDate: '07 Nov 2026',
    collectionDate: '08 Nov 2026, 07:30 AM',
    patientName: 'Rahul Verma (Self)',
    status: 'Report Published',
    specimen: 'EDTA Whole Blood (2.5 mL)',
    collectionAddress: 'GS Road, Dispur, Guwahati - 781005',
    phlebotomist: {
      name: 'Manab Jyoti Barua',
      id: 'ZM-PHL-AS-08',
      phone: '+91 92791 25091',
      vaccinated: true
    },
    reportingDoctor: 'Dr. Pranabesh Sarma, MD Pathology (Reg No. AMC-29182-AS)',
    price: 350,
    parametersSummary: '28 Parameters tested • All within standard biological reference range',
    hasAbnormal: false,
    reportData: [
      { name: 'Hemoglobin', value: '14.8', unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'Normal' },
      { name: 'Total Leukocyte Count (TLC)', value: '7,200', unit: '/cumm', normalRange: '4,000 - 11,000', status: 'Normal' },
      { name: 'Platelet Count', value: '2.45', unit: 'Lakh/cumm', normalRange: '1.50 - 4.50', status: 'Normal' },
      { name: 'RBC Count', value: '4.92', unit: 'mil/cumm', normalRange: '4.50 - 5.50', status: 'Normal' },
      { name: 'Packed Cell Volume (PCV)', value: '43.5', unit: '%', normalRange: '40.0 - 50.0', status: 'Normal' },
      { name: 'Mean Corpuscular Volume (MCV)', value: '88.4', unit: 'fL', normalRange: '83.0 - 101.0', status: 'Normal' },
      { name: 'ESR (Westergren Method)', value: '8', unit: 'mm/hr', normalRange: '0 - 15', status: 'Normal' },
      { name: 'Neutrophils', value: '62', unit: '%', normalRange: '40 - 75', status: 'Normal' },
      { name: 'Lymphocytes', value: '30', unit: '%', normalRange: '20 - 45', status: 'Normal' },
      { name: 'Eosinophils', value: '4', unit: '%', normalRange: '1 - 6', status: 'Normal' },
      { name: 'Monocytes', value: '4', unit: '%', normalRange: '2 - 10', status: 'Normal' }
    ],
    pathologistRemark: 'Hemogram profile is completely normal. No cytopenia or atypical cells observed.'
  },
  {
    id: 'ZM-LAB-781001-5198',
    testName: 'Vitamin D3 & Vitamin B12 Vital Screen',
    testCode: 'VIT-D-B12',
    category: 'Vitamins & Metabolism',
    bookedDate: '01 Nov 2026',
    collectionDate: '02 Nov 2026, 08:00 AM',
    patientName: 'Rahul Verma (Self)',
    status: 'Report Published',
    specimen: 'Serum (3.0 mL)',
    collectionAddress: 'GS Road, Dispur, Guwahati - 781005',
    phlebotomist: {
      name: 'Rupam Kalita',
      id: 'ZM-PHL-AS-14',
      phone: '+91 92791 25091',
      vaccinated: true
    },
    reportingDoctor: 'Dr. Manas Barman, MD Clinical Biochemistry (AMC-34011-AS)',
    price: 1150,
    parametersSummary: '2 Parameters tested • 1 Value flagged below reference range (Vitamin D)',
    hasAbnormal: true,
    reportData: [
      { name: '25-OH Vitamin D (Total)', value: '16.4', unit: 'ng/mL', normalRange: '30.0 - 100.0', status: 'Deficient', flag: 'LOW' },
      { name: 'Vitamin B12 (Cyanocobalamin)', value: '410', unit: 'pg/mL', normalRange: '211 - 911', status: 'Normal', flag: 'NORMAL' }
    ],
    pathologistRemark: 'Serum 25-OH Vitamin D shows moderate deficiency (<20 ng/mL). Clinical consultation with physician for oral cholecalciferol supplementation is advised.'
  },
  {
    id: 'ZM-LAB-781001-6380',
    testName: 'Zestmed Comprehensive Full Body Checkup (72 Parameters)',
    testCode: 'PKG-FULLBODY-PRO',
    category: 'Preventive Health Package',
    bookedDate: '11 Nov 2026',
    collectionDate: 'Tomorrow, 07:00 AM - 08:30 AM',
    patientName: 'Biren Verma (Father - 64 Yrs)',
    status: 'Phlebotomist Assigned',
    specimen: 'Blood (Fasting 10-12 hrs) & Urine Routine',
    collectionAddress: 'House 12, RKB Path, Tarajan, Jorhat - 785001',
    phlebotomist: {
      name: 'Dipankar Das',
      id: 'ZM-PHL-JOR-03',
      phone: '+91 92791 25091',
      vaccinated: true
    },
    reportingDoctor: 'Dr. Pranabesh Sarma, MD Pathology',
    price: 1899,
    parametersSummary: 'Includes CBC, HbA1c, Lipid Profile, LFT, KFT, Thyroid & Urine Routine',
    hasAbnormal: false,
    reportData: null,
    pathologistRemark: 'Scheduled for doorstep phlebotomy collection in Jorhat. Fasting instructions communicated.'
  }
];

export const initialPatientPrescriptions = [
  {
    id: 'ZM-RX-2026-302',
    doctorName: 'Dr. Arindam Sharma',
    specialty: 'Cardiologist & Physician',
    hospital: 'Dispur Super Specialty Hospital, Guwahati',
    regNumber: 'AMC-49102-AS',
    dateOfIssue: '01 Nov 2026',
    expiryDate: '01 May 2027',
    status: 'Active & Verified',
    patientName: 'Rahul Verma',
    notes: 'Long-term maintenance therapy for blood pressure management. Review after 6 months.',
    medicines: [
      {
        name: 'Telmisartan 40mg Tablet',
        dosage: '1 tablet once daily after breakfast',
        duration: '90 Days',
        availableInStore: true,
        catalogId: 'med-card-1',
        price: 85
      },
      {
        name: 'Rosuvastatin 10mg Tablet',
        dosage: '1 tablet at bedtime',
        duration: '90 Days',
        availableInStore: true,
        catalogId: 'med-card-2',
        price: 195
      }
    ]
  },
  {
    id: 'ZM-RX-2026-194',
    doctorName: 'Dr. Nibedita Hazarika',
    specialty: 'Consultant Diabetologist & Endocrinologist',
    hospital: 'Guwahati Diabetes & Endocrine Care, Ulubari',
    regNumber: 'AMC-38914-AS',
    dateOfIssue: '15 Oct 2026',
    expiryDate: '15 Apr 2027',
    status: 'Active & Verified',
    patientName: 'Biren Verma (Father)',
    notes: 'Glycemic control therapy. Regular fasting sugar monitoring recommended.',
    medicines: [
      {
        name: 'Metformin 500mg SR Tablet',
        dosage: '1 tablet twice daily after meals',
        duration: '60 Days',
        availableInStore: true,
        catalogId: 'med-dia-1',
        price: 45
      },
      {
        name: 'Glimepiride 1mg Tablet',
        dosage: '1 tablet before breakfast',
        duration: '60 Days',
        availableInStore: true,
        catalogId: 'med-dia-2',
        price: 65
      }
    ]
  },
  {
    id: 'ZM-RX-2026-088',
    doctorName: 'Dr. Gautam Bora',
    specialty: 'Pulmonologist & Chest Specialist',
    hospital: 'Jorhat Medical Center, Jorhat',
    regNumber: 'AMC-21804-AS',
    dateOfIssue: '10 Aug 2026',
    expiryDate: '10 Sep 2026',
    status: 'Expired / Completed',
    patientName: 'Rahul Verma',
    notes: 'Short course for acute seasonal bronchitis and allergic cough.',
    medicines: [
      {
        name: 'Cetirizine 10mg Anti-Allergy',
        dosage: '1 tablet at night for 10 days',
        duration: '10 Days',
        availableInStore: true,
        catalogId: 'med-gen-2',
        price: 24
      }
    ]
  }
];

export const initialFamilyMembers = [
  {
    id: 'fam-1',
    name: 'Rahul Verma',
    relation: 'Self',
    age: 34,
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: 'None reported',
    conditions: 'Mild Hypertension (controlled)',
    isPrimary: true
  },
  {
    id: 'fam-2',
    name: 'Priya Verma',
    relation: 'Spouse',
    age: 32,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: 'Penicillin (Allergic rash)',
    conditions: 'None',
    isPrimary: false
  },
  {
    id: 'fam-3',
    name: 'Biren Verma',
    relation: 'Father',
    age: 64,
    gender: 'Male',
    bloodGroup: 'A+',
    allergies: 'Sulfa Drugs',
    conditions: 'Type 2 Diabetes, Mild Osteoarthritis',
    isPrimary: false
  },
  {
    id: 'fam-4',
    name: 'Meena Verma',
    relation: 'Mother',
    age: 60,
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: 'None reported',
    conditions: 'Primary Hypothyroidism',
    isPrimary: false
  }
];

export const initialAssamAddresses = [
  {
    id: 'addr-1',
    label: 'Home (Dispur)',
    recipientName: 'Rahul Verma',
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
    recipientName: 'Rahul Verma',
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
    label: 'Parents Residence (Jorhat)',
    recipientName: 'Biren Verma',
    phone: '+91 92791 25091',
    street: 'House No. 12, RKB Path, Near Tarajan Chariali',
    city: 'Jorhat',
    district: 'Jorhat',
    state: 'Assam',
    pincode: '785001',
    isDefault: false
  }
];
