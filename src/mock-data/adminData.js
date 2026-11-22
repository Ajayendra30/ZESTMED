// src/mock-data/adminData.js
// Mock administrative data for ZESTMED Health Private Limited
// Central Administration & Operations Control Tower (Dispur, Guwahati - 781005, Assam)

export const initialAdminProfile = {
  id: 'ZM-ADM-AS-01',
  name: 'Dr. Arindam Sharma',
  role: 'Chief Medical & Operations Director (Super Admin)',
  organization: 'Zestmed Health Private Limited',
  hq: 'GS Road, Dispur, Guwahati, Assam - 781005',
  email: 'arindam.sharma@zestmed.com',
  contact: '+91 92791 25091',
  drugLicenseNo: 'AS-KAM-DL-88421 / 88422',
  gstin: '18AAACZ9901M1ZT',
  kpis: {
    monthlyRevenue: 482450,
    revenueGrowth: '+18.4%',
    medicinesDispensed: 2410,
    testsConducted: 1840,
    registeredPatients: 8920,
    pendingPrescriptionAudit: 3,
    activePhlebotomists: 18,
    activeDeliveryRiders: 24,
    assamHubsOnline: 8
  }
};

export const initialInventoryMedicines = [
  {
    id: 'med-inv-1',
    name: 'Paracetamol 650mg Fast-Release Tablets',
    genericName: 'Paracetamol IP',
    category: 'general',
    categoryName: 'General Medicines',
    manufacturer: 'Apex Healthcare Labs',
    batchNo: 'APX-2026-B81',
    expiry: 'Dec 2027',
    stock: 420,
    threshold: 50,
    price: 32.50,
    mrp: 42.00,
    prescriptionRequired: false,
    rackLocation: 'GUW-WH-A01'
  },
  {
    id: 'med-inv-2',
    name: 'Metformin Hydrochloride 500mg SR Tablets',
    genericName: 'Metformin HCL Extended Release',
    category: 'diabetes',
    categoryName: 'Diabetes Care',
    manufacturer: 'USV Pvt Ltd',
    batchNo: 'USV-26-901',
    expiry: 'Aug 2027',
    stock: 18, // Low stock demo!
    threshold: 40,
    price: 45.00,
    mrp: 60.00,
    prescriptionRequired: true,
    rackLocation: 'GUW-WH-D04'
  },
  {
    id: 'med-inv-3',
    name: 'Rosuvastatin 10mg Film-Coated Tablets',
    genericName: 'Rosuvastatin Calcium',
    category: 'cardiac',
    categoryName: 'Cardiac & BP',
    manufacturer: 'Sun Pharma',
    batchNo: 'SUN-26-442',
    expiry: 'Nov 2027',
    stock: 145,
    threshold: 30,
    price: 195.00,
    mrp: 260.00,
    prescriptionRequired: true,
    rackLocation: 'GUW-WH-C02'
  },
  {
    id: 'med-inv-4',
    name: 'Telmisartan 40mg Blood Pressure Tablets',
    genericName: 'Telmisartan IP',
    category: 'cardiac',
    categoryName: 'Cardiac & BP',
    manufacturer: 'Glenmark Pharmaceuticals',
    batchNo: 'GLN-26-118',
    expiry: 'Jan 2028',
    stock: 210,
    threshold: 35,
    price: 85.00,
    mrp: 115.00,
    prescriptionRequired: true,
    rackLocation: 'GUW-WH-C01'
  },
  {
    id: 'med-inv-5',
    name: 'Vitamin D3 60,000 IU Softgel Capsules',
    genericName: 'Cholecalciferol IP',
    category: 'vitamins',
    categoryName: 'Vitamins & Supplements',
    manufacturer: 'Cadila Pharma',
    batchNo: 'CAD-26-559',
    expiry: 'Oct 2027',
    stock: 310,
    threshold: 50,
    price: 120.00,
    mrp: 160.00,
    prescriptionRequired: false,
    rackLocation: 'GUW-WH-V03'
  },
  {
    id: 'med-inv-6',
    name: 'Pantoprazole 40mg Gastro-Resistant Tablets',
    genericName: 'Pantoprazole Sodium',
    category: 'digestive',
    categoryName: 'Digestive Health',
    manufacturer: 'Alkem Laboratories',
    batchNo: 'ALK-26-302',
    expiry: 'Sep 2027',
    stock: 165,
    threshold: 40,
    price: 115.00,
    mrp: 155.00,
    prescriptionRequired: false,
    rackLocation: 'GUW-WH-G02'
  },
  {
    id: 'med-inv-7',
    name: 'Cetirizine 10mg Anti-Allergy Tablets',
    genericName: 'Cetirizine Hydrochloride',
    category: 'respiratory',
    categoryName: 'Cold & Respiratory',
    manufacturer: 'Cipla Ltd',
    batchNo: 'CIP-26-771',
    expiry: 'Jun 2028',
    stock: 380,
    threshold: 50,
    price: 24.00,
    mrp: 35.00,
    prescriptionRequired: false,
    rackLocation: 'GUW-WH-R01'
  },
  {
    id: 'med-inv-8',
    name: 'Accu-Chek Active 50 Blood Glucose Test Strips',
    genericName: 'Blood Glucose Test Strips',
    category: 'devices',
    categoryName: 'Healthcare Devices',
    manufacturer: 'Roche Diagnostics',
    batchNo: 'RCH-26-092',
    expiry: 'May 2027',
    stock: 6, // Critical Low!
    threshold: 20,
    price: 980.00,
    mrp: 1199.00,
    prescriptionRequired: false,
    rackLocation: 'GUW-WH-DEV1'
  }
];

export const initialPendingPrescriptions = [
  {
    id: 'ZM-RX-2026-441',
    patientName: 'Sunita Goswami',
    patientPhone: '+91 92791 25091',
    patientAge: 48,
    district: 'Guwahati (Kamrup Metro)',
    address: 'Flat 3B, Brahmaputra Heights, Jalukbari',
    uploadedAt: 'Today, 09:40 AM',
    doctorName: 'Dr. Debabrata Kalita',
    doctorRegNo: 'AMC-41029-AS',
    clinicName: 'Gauhati Medical College & Hospital (GMCH)',
    status: 'Pending Pharmacist Review', // Pending Pharmacist Review | Approved & Verified | Rejected
    imagePreview: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    diagnosedCondition: 'Type 2 Diabetes Mellitus with Mild Hypertension',
    extractedMedications: [
      { name: 'Metformin 500mg SR Tablets', dosage: '1 tab BD after meals', duration: '60 days', matchedCatalogId: 'med-inv-2', inStock: true },
      { name: 'Telmisartan 40mg Tablets', dosage: '1 tab OD morning', duration: '60 days', matchedCatalogId: 'med-inv-4', inStock: true }
    ],
    pharmacistNotes: 'Awaiting signature verification against Assam Medical Council registry.'
  },
  {
    id: 'ZM-RX-2026-442',
    patientName: 'Manabjyoti Barman',
    patientPhone: '+91 92791 25091',
    patientAge: 55,
    district: 'Jorhat',
    address: 'House 8, AT Road, Near Jorhat Stadium',
    uploadedAt: 'Today, 10:15 AM',
    doctorName: 'Dr. Gautam Bora',
    doctorRegNo: 'AMC-21804-AS',
    clinicName: 'Jorhat Medical Center',
    status: 'Pending Pharmacist Review',
    imagePreview: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    diagnosedCondition: 'Bronchial Asthma & Acute Allergic Rhinitis',
    extractedMedications: [
      { name: 'Cetirizine 10mg Tablets', dosage: '1 tab HS for 15 days', duration: '15 days', matchedCatalogId: 'med-inv-7', inStock: true },
      { name: 'Pantoprazole 40mg Tablets', dosage: '1 tab OD before breakfast', duration: '15 days', matchedCatalogId: 'med-inv-6', inStock: true }
    ],
    pharmacistNotes: 'Clear doctor handwriting. Ready for instant digital approval.'
  },
  {
    id: 'ZM-RX-2026-443',
    patientName: 'Kaveri Phukan',
    patientPhone: '+91 92791 25091',
    patientAge: 38,
    district: 'Dibrugarh',
    address: 'Boiragimoth Road, Near AMC Gate',
    uploadedAt: 'Today, 11:05 AM',
    doctorName: 'Dr. Bhabesh Sarma',
    doctorRegNo: 'AMC-30911-AS',
    clinicName: 'Assam Medical College, Dibrugarh',
    status: 'Pending Pharmacist Review',
    imagePreview: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    diagnosedCondition: 'Severe Osteopenia & Hypovitaminosis D',
    extractedMedications: [
      { name: 'Vitamin D3 60,000 IU Softgels', dosage: '1 cap once weekly for 8 weeks', duration: '8 weeks', matchedCatalogId: 'med-inv-5', inStock: true }
    ],
    pharmacistNotes: 'Review required for high-dose Cholecalciferol regimen.'
  }
];

export const initialAssamHubs = [
  {
    id: 'hub-guw',
    district: 'Kamrup Metropolitan (Guwahati)',
    hqArea: 'GS Road, Dispur (Central Fulfillment Warehouse & LIMS Lab)',
    pincodesServed: '781001 – 781039',
    serviceStatus: 'Fully Operational',
    deliveryType: 'Express 4-Hour Delivery Active',
    activePhlebotomists: 8,
    activeRiders: 12,
    todayOrders: 142,
    avgPhleboResponse: '14 Mins'
  },
  {
    id: 'hub-jor',
    district: 'Jorhat',
    hqArea: 'Tarajan Chariali, Gar-Ali Regional Center',
    pincodesServed: '785001 – 785025',
    serviceStatus: 'Fully Operational',
    deliveryType: 'Same-Day Delivery Active',
    activePhlebotomists: 3,
    activeRiders: 4,
    todayOrders: 38,
    avgPhleboResponse: '22 Mins'
  },
  {
    id: 'hub-dib',
    district: 'Dibrugarh',
    hqArea: 'Boiragimoth, Near AMC Hospital Road',
    pincodesServed: '786001 – 786010',
    serviceStatus: 'Fully Operational',
    deliveryType: 'Same-Day Delivery Active',
    activePhlebotomists: 3,
    activeRiders: 3,
    todayOrders: 32,
    avgPhleboResponse: '25 Mins'
  },
  {
    id: 'hub-sil',
    district: 'Silchar (Cachar)',
    hqArea: 'Hospital Road, Silchar Medical Hub',
    pincodesServed: '788001 – 788015',
    serviceStatus: 'Fully Operational',
    deliveryType: 'Same-Day Delivery Active',
    activePhlebotomists: 2,
    activeRiders: 3,
    todayOrders: 24,
    avgPhleboResponse: '28 Mins'
  },
  {
    id: 'hub-nag',
    district: 'Nagaon',
    hqArea: 'Haibargaon, AT Road Center',
    pincodesServed: '782001 – 782008',
    serviceStatus: 'Fully Operational',
    deliveryType: 'Next-Day / Scheduled Delivery',
    activePhlebotomists: 1,
    activeRiders: 1,
    todayOrders: 14,
    avgPhleboResponse: '35 Mins'
  },
  {
    id: 'hub-tez',
    district: 'Tezpur (Sonitpur)',
    hqArea: 'Tribeni Complex, Mission Chariali',
    pincodesServed: '784001 – 784005',
    serviceStatus: 'Fully Operational',
    deliveryType: 'Next-Day / Scheduled Delivery',
    activePhlebotomists: 1,
    activeRiders: 1,
    todayOrders: 11,
    avgPhleboResponse: '30 Mins'
  }
];

export const initialPlatformAuditLogs = [
  { id: 'LOG-8812', timestamp: '12 Nov, 01:25 PM', event: 'Prescription Approved', actor: 'Chief Pharmacist (Guwahati)', details: 'ZM-RX-2026-302 approved for patient Ajayendra Shekhar.' },
  { id: 'LOG-8811', timestamp: '12 Nov, 12:40 PM', event: 'Cold-Chain Delivery Ingestion', actor: 'LIMS Central Ingestion', details: 'BOX-GUW-01 arrived at Dispur Central Lab with 6 EDTA specimens at 4.2°C.' },
  { id: 'LOG-8810', timestamp: '12 Nov, 11:15 AM', event: 'Inventory Stock Alert', actor: 'Automated ERP', details: 'Accu-Chek 50 Strips dipped below reorder threshold (6 units remaining).' },
  { id: 'LOG-8809', timestamp: '12 Nov, 09:30 AM', event: 'Diagnostic Report Published', actor: 'Dr. Pranabesh Sarma (MD)', details: 'CBC hemogram report published for booking ZM-LAB-781001-4402.' },
  { id: 'LOG-8808', timestamp: '12 Nov, 08:00 AM', event: 'Phlebotomist Shift Rollout', actor: 'Dispur Dispatch Lead', details: 'Morning shift deployed across Kamrup Metro, Jorhat, Dibrugarh & Silchar.' }
];
