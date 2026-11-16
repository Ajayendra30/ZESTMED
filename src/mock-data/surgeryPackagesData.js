// src/mock-data/surgeryPackagesData.js
// Curated Daycare & Elective Surgery Packages in Guwahati, Assam

export const SURGERY_CATEGORIES = [
  'All Surgeries',
  'Ophthalmology (Eye)',
  'Laparoscopic & General',
  'Orthopedic & Joint',
  'Proctology & Laser',
  'Urology'
];

export const MOCK_SURGERY_PACKAGES = [
  {
    id: 'surg-cataract',
    title: 'Advanced Cataract Surgery (Phaco + Foldable IOL)',
    category: 'Ophthalmology (Eye)',
    stay: 'Daycare (Walk-in & Walk-out in 4 Hours)',
    packagePrice: 18500,
    mrp: 26000,
    discountPercent: 28,
    hospitalLocation: 'Dispur Eye Center & Partner Hospitals, Guwahati',
    recoveryTime: '2-3 Days Normal Vision',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'All TPA & Ayushman / CGHS Assistance Available',
    includes: [
      'Pre-operative biometry and A-scan measurement',
      'Advanced stitchless micro-incision Phacoemulsification',
      'High-grade Hydrophobic Foldable Intraocular Lens (IOL)',
      'Free Senior Citizen AC Pick-up & Drop within 10km in Guwahati',
      'Dedicated Zestmed Care Coordinator assistance',
      '2 Post-operative checkups & protective eye kit'
    ],
    description: 'Painless, blade-free cataract procedure using ultrasonic micro-incision phaco technology. Perfect clarity restored with zero stitch requirement.'
  },
  {
    id: 'surg-gallbladder',
    title: 'Laparoscopic Cholecystectomy (Gallbladder Removal)',
    category: 'Laparoscopic & General',
    stay: '1 Day Hospitalization',
    packagePrice: 42000,
    mrp: 60000,
    discountPercent: 30,
    hospitalLocation: 'Downtown Hospital / Excelcare Partner Hub, Guwahati',
    recoveryTime: '4-7 Days to Desk Work',
    seniorPickUpIncluded: true,
    cashlessInsurance: '100% Cashless TPA Approval in 60 Mins',
    includes: [
      'Standard pre-anesthetic diagnostic workup at Guwahati Central Lab',
      'Minimally invasive 4-port laparoscopic procedure by Senior Surgeon',
      'Single-room AC stay with companion fooding',
      'Free Senior Citizen Roundtrip Transport within 10km in Guwahati',
      'Post-op medication kit and diet consultation'
    ],
    description: 'Gold standard minimally invasive surgery for symptomatic gallstones. Small keyhole incisions ensure negligible scarring and speedy return home.'
  },
  {
    id: 'surg-hernia',
    title: 'Laparoscopic Inguinal / Umbilical Hernia Repair',
    category: 'Laparoscopic & General',
    stay: '1 Day Hospitalization',
    packagePrice: 38000,
    mrp: 52000,
    discountPercent: 27,
    hospitalLocation: 'Central Polyclinic & Hospital, GS Road, Guwahati',
    recoveryTime: '5-7 Days Recovery',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Cashless Tie-up with 30+ Health Insurers',
    includes: [
      'Pre-op ultrasound and routine blood profile',
      'Laparoscopic TEP/TAPP mesh repair with Dual-side Prolene mesh',
      'Anesthesia and nursing care in sanitized modular OT',
      'Senior Citizen assisted pick-up & drop within 10km radius',
      'Post-procedure follow-up visits and suture removal'
    ],
    description: 'Tension-free repair of abdominal wall hernia with modern polypropylene mesh. Extremely low recurrence rate and minimal discomfort.'
  },
  {
    id: 'surg-piles-laser',
    title: 'Laser Hemorrhoidoplasty (Piles / Fissure Laser Treatment)',
    category: 'Proctology & Laser',
    stay: 'Daycare (Discharge in 6-8 Hours)',
    packagePrice: 29500,
    mrp: 42000,
    discountPercent: 30,
    hospitalLocation: 'Zestmed Daycare Surgical Wing, Panbazar, Guwahati',
    recoveryTime: '24-48 Hours Return to Routine',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Approved for Daycare Insurance Claims',
    includes: [
      'Pre-procedure proctoscopy and routine coagulation screen',
      '1470nm Diode laser radial fiber ablation (No cut, No open wound)',
      'Free Senior Citizen door-to-door transport within 10km in Guwahati',
      'Post-op stool softeners and sitz bath kit',
      '1 Month complimentary surgeon tele-consultations'
    ],
    description: 'Advanced German laser energy seals enlarged hemorrhoidal blood vessels without surgical cutting. Zero bleeding, minimal pain, and rapid healing.'
  },
  {
    id: 'surg-knee-replacement',
    title: 'Total Knee Replacement (TKR - Fast-Track Robotic/Navigated)',
    category: 'Orthopedic & Joint',
    stay: '3-4 Days Hospital Stay',
    packagePrice: 125000,
    mrp: 175000,
    discountPercent: 28,
    hospitalLocation: 'Premier Super Specialty Orthopedic Hub, Guwahati',
    recoveryTime: 'Walking on Day 2 with Support',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Full Cashless Pre-Authorization Assistance',
    includes: [
      'US-FDA approved Cobalt-Chromium / Titanium joint implant',
      'Full pre-surgery diagnostic workup + Cardiology fitness',
      '3 In-hospital physiotherapy rehabilitation sessions',
      'Complimentary Senior Citizen Wheelchair Vehicle Transport in Guwahati',
      'Dedicated personal care manager from admission to discharge',
      'First 5 home physiotherapy visits included'
    ],
    description: 'Restore painless movement and independence for severe knee osteoarthritis. Robotic navigation ensures sub-millimeter precision alignment.'
  },
  {
    id: 'surg-kidney-stone',
    title: 'Laser RIRS / PCNL (Kidney Stone Removal)',
    category: 'Urology',
    stay: '1 Day Hospitalization',
    packagePrice: 45000,
    mrp: 62000,
    discountPercent: 27,
    hospitalLocation: 'Dispur Urology Care Hospital, Guwahati',
    recoveryTime: '3-4 Days Recovery',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Covered under Standard & Corporate Mediclaim',
    includes: [
      'Pre-op non-contrast CT KUB scan and renal function testing',
      'Flexible Ureteroscopy (RIRS) with Holmium laser stone dusting',
      'DJ stent placement and subsequent safe removal',
      'Senior Citizen transport assistance within 10km Guwahati',
      'Stone analysis report & preventive nephrology plan'
    ],
    description: 'No surgical incision. Laser fiber reaches through natural urinary tract to dust kidney and ureter stones into sand-like particles for painless passage.'
  }
];
