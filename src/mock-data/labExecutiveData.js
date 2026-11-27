// src/mock-data/labExecutiveData.js
// Mock operational data for ZESTMED Lab Executive & Phlebotomist Dispatch Center
// Based at Central Diagnostic Laboratory, GS Road, Dispur, Guwahati - 781005

export const initialExecutiveProfile = {
  id: 'ZM-EXEC-AS-104',
  name: 'Bikash Das',
  role: 'Senior Phlebotomy Lead & Lab Operations Supervisor',
  hub: 'Guwahati Central Laboratory (Dispur Hub)',
  coverageZone: 'Kamrup Metropolitan, Jorhat, Dibrugarh, Silchar & Nagaon',
  contact: '+91 92791 25091',
  email: 'bikash.das@ops.zestmed.com',
  shift: 'Morning Shift (06:00 AM - 02:30 PM)',
  dutyStatus: 'On Duty (Active Shifts)',
  totalCollectionsToday: 14,
  completedCollections: 9,
  inTransitCoolers: 3,
  reportsAuthorized: 8,
  onTimeRate: '98.4%'
};

export const initialPhlebotomyJobs = [];

export const initialColdChainBoxes = [
  {
    id: 'BOX-GUW-01',
    hub: 'Dispur Central Hub, Guwahati',
    currentTemp: 4.2,
    targetMin: 2.0,
    targetMax: 8.0,
    status: 'Optimal (Cold Active)',
    sampleCount: 6,
    carrierName: 'Manab Jyoti Barua',
    batteryLevel: 92,
    lastPing: '2 mins ago',
    route: 'GS Road -> Beltola -> Dispur Central Lab'
  },
  {
    id: 'BOX-GUW-02',
    hub: 'Ulubari & Jalukbari Hub, Guwahati',
    currentTemp: 4.8,
    targetMin: 2.0,
    targetMax: 8.0,
    status: 'Optimal (Cold Active)',
    sampleCount: 4,
    carrierName: 'Rupam Kalita',
    batteryLevel: 86,
    lastPing: '4 mins ago',
    route: 'Ulubari -> Uzanbazar -> Dispur Central Lab'
  },
  {
    id: 'BOX-JOR-01',
    hub: 'Jorhat Branch Phlebotomy Center',
    currentTemp: 3.9,
    targetMin: 2.0,
    targetMax: 8.0,
    status: 'Optimal (Cold Active)',
    sampleCount: 5,
    carrierName: 'Dipankar Das',
    batteryLevel: 95,
    lastPing: '1 min ago',
    route: 'Tarajan -> Gar-Ali -> Jorhat Processing Center'
  },
  {
    id: 'BOX-DIB-01',
    hub: 'Dibrugarh Branch Diagnostics Center',
    currentTemp: 4.1,
    targetMin: 2.0,
    targetMax: 8.0,
    status: 'Optimal (Cold Active)',
    sampleCount: 3,
    carrierName: 'Ankur Borah',
    batteryLevel: 89,
    lastPing: '5 mins ago',
    route: 'Boiragimoth -> Graham Bazar -> Dibrugarh Hub'
  }
];

export const initialPhlebotomistRoster = [
  {
    id: 'ZM-PHL-AS-08',
    name: 'Manab Jyoti Barua',
    district: 'Guwahati (Kamrup Metro)',
    hub: 'Dispur Central Hub',
    phone: '+91 92791 25091',
    status: 'In Field (Active)',
    assignedVisits: 5,
    completedVisits: 4,
    vaccinationStatus: 'Triple Vaccinated (Hepatitis B & COVID)',
    kitAudit: 'Certified Vacuum Tubes, PPE, Alcohol Swabs, Barcode Printer'
  },
  {
    id: 'ZM-PHL-AS-14',
    name: 'Rupam Kalita',
    district: 'Guwahati (Kamrup Metro)',
    hub: 'Ulubari Hub',
    phone: '+91 92791 25091',
    status: 'In Field (En Route)',
    assignedVisits: 4,
    completedVisits: 2,
    vaccinationStatus: 'Triple Vaccinated (Hepatitis B & COVID)',
    kitAudit: 'Certified Vacuum Tubes, PPE, Alcohol Swabs, Tourniquet Set'
  },
  {
    id: 'ZM-PHL-JOR-03',
    name: 'Dipankar Das',
    district: 'Jorhat',
    hub: 'Jorhat City Hub',
    phone: '+91 92791 25091',
    status: 'In Transit to Lab',
    assignedVisits: 3,
    completedVisits: 2,
    vaccinationStatus: 'Fully Vaccinated',
    kitAudit: 'Cold-Chain Checked, Biohazard Sharp Container Sealed'
  },
  {
    id: 'ZM-PHL-DIB-05',
    name: 'Ankur Borah',
    district: 'Dibrugarh',
    hub: 'Dibrugarh Medical Center Hub',
    phone: '+91 92791 25091',
    status: 'Scheduled (Next 11 AM)',
    assignedVisits: 2,
    completedVisits: 1,
    vaccinationStatus: 'Fully Vaccinated',
    kitAudit: 'Vials Calibrated, Digital Barcode Scanner Synchronized'
  },
  {
    id: 'ZM-PHL-SIL-02',
    name: 'Bikram Nath',
    district: 'Silchar (Cachar)',
    hub: 'Silchar Medical Hub',
    phone: '+91 92791 25091',
    status: 'Completed Shift',
    assignedVisits: 2,
    completedVisits: 2,
    vaccinationStatus: 'Fully Vaccinated',
    kitAudit: 'All Vials Deposited at Silchar Center'
  }
];
