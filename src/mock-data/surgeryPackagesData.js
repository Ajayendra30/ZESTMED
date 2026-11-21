// src/mock-data/surgeryPackagesData.js
// Comprehensive Curated Daycare & Elective Surgery Packages in Guwahati, Assam

export const SURGERY_CATEGORIES = [
  'All Surgeries',
  'Laparoscopic & General',
  'Orthopedic & Joint',
  'Ophthalmology (Eye)',
  'Proctology & Laser',
  'Urology'
];

export const DETAILED_SURGERY_PACKAGES = [
  {
    id: 'surg-gallbladder',
    slug: 'gallbladder-stone-surgery',
    title: 'Gallbladder Stone Surgery (Laparoscopic Cholecystectomy)',
    shortTitle: 'Gallbladder Stone Surgery',
    subtitle: '(Laparoscopic)',
    category: 'Laparoscopic & General',
    startingPrice: 45000,
    priceFormatted: '₹45,000',
    mrp: 65000,
    discountPercent: 30,
    stay: '1 Day Hospitalization (24 Hours)',
    anesthesia: 'General Anesthesia',
    incision: 'Minimally Invasive (3-4 Micro-Ports 5-10 mm)',
    recoveryTime: '4-7 Days to Normal Routine',
    hospitalLocation: 'Downtown Hospital / Dispur Polyclinic Hub / Excelcare, Guwahati',
    image: '/surgery-pkg1-gallbladder.png',
    seniorPickUpIncluded: true,
    cashlessInsurance: '100% Cashless TPA Claim Approval in 60 Minutes (Ayushman PM-JAY & Private Insurers)',
    
    overview: 'Laparoscopic Cholecystectomy is the international gold-standard surgical treatment for symptomatic gallbladder stones, chronic cholecystitis, and gallbladder polyps. Performed under high-definition laparoscopy through 3-4 tiny keyholes, it completely eliminates gallstone pain and risks of pancreatitis or infection with minimal recovery time.',
    
    description: 'Gallbladder stones (cholelithiasis) cannot be dissolved by medication and lead to intense upper abdominal pain, bloating, jaundice, and potential pancreatitis. Laparoscopic cholecystectomy is a safe, painless procedure that completely removes the diseased gallbladder. Digestion remains fully normal post-surgery as bile flows directly from the liver into the small intestine.',
    
    procedureSteps: [
      {
        step: 1,
        title: 'Pre-Operative Assessment & Clearance',
        description: 'Complete abdominal ultrasound, liver function tests (LFT), CBC, viral markers, and ECG clearance to ensure 100% surgical safety.'
      },
      {
        step: 2,
        title: 'Micro-Incision Laparoscopic Access',
        description: 'Under gentle general anesthesia, 3 to 4 tiny 5-10 mm keyhole incisions are created in the abdomen. A high-definition surgical camera (laparoscope) magnifies the surgical field.'
      },
      {
        step: 3,
        title: 'Safe Gallbladder Dissection & Retrieval',
        description: 'The cystic duct and artery are secured with titanium clips. The gallbladder with stones is carefully separated from the liver bed and extracted in a sterile endobag with zero spill.'
      },
      {
        step: 4,
        title: 'Rapid Recovery & Same/Next-Day Discharge',
        description: 'Stitchless closure with tissue glue. Patient walks within 4-6 hours, takes light fluids by evening, and is discharged comfortably within 24 hours.'
      }
    ],

    benefits: [
      'Painless micro-keyhole incisions with virtually zero scars',
      'Minimal blood loss and ultra-low risk of wound infection',
      'Short 24-hour hospital stay; resume light desk work in 4-5 days',
      'Permanent relief from recurrent biliary colic, nausea, and indigestion',
      '100% transparent fixed package pricing with zero hidden OT or room surprises',
      'Free Senior Citizen roundtrip transport assistance within Guwahati'
    ],

    inclusions: [
      'Pre-operative diagnostic bundle (Ultrasound, LFT, CBC, PT/INR, Viral Screen)',
      'Senior Laparoscopic Surgeon and Consultant Anesthesiologist procedural fees',
      'Modular Operation Theatre (OT) charges with HD laparoscopy instrumentation',
      '1 Night Single AC / Deluxe Patient Room stay with attendant couch & meals',
      'All disposable surgical trocars, clips, sterile drapes, and OT consumables',
      'Post-operative discharge medication kit (antibiotics, painkillers, antacids)',
      'Free Senior Citizen doorstep pick-up & drop within 10km in Guwahati',
      '2 Complimentary follow-up consultations with surgeon on Day 7 and Day 14'
    ],

    surgeon: {
      name: 'Dr. Anupam Sarma',
      qualification: 'MBBS (GMC), MS (General Surgery), FMAS, FIAGES',
      role: 'Senior Consultant - General & Minimal Access Laparoscopic Surgery',
      experience: '18+ Years Clinical Experience',
      surgeriesCount: '3,800+ Laparoscopic Surgeries Performed',
      hospitalAffiliation: 'Downtown Hospital & ZESTMED Dispur Polyclinic, Guwahati',
      rating: '4.9/5 (480+ Reviews)'
    },

    recoveryGuide: {
      hospitalStay: '24 Hours (Overnight Stay)',
      walking: 'Walking with full balance on the same evening (within 4-6 hours)',
      diet: 'Clear fluids in first 12 hours, followed by soft bland khichdi/soup on Day 2, normal light home diet by Day 5',
      returnToWork: 'Desk/Office work in 4-7 days; driving in 7-10 days; gym/heavy lifting after 3-4 weeks',
      followUp: '7th Day surgical dressing review and 14th Day final dietary and clinical sign-off'
    }
  },

  {
    id: 'surg-appendix',
    slug: 'appendectomy',
    title: 'Appendectomy (Laparoscopic Appendix Surgery)',
    shortTitle: 'Appendectomy',
    subtitle: '(Appendix Surgery)',
    category: 'Laparoscopic & General',
    startingPrice: 35000,
    priceFormatted: '₹35,000',
    mrp: 50000,
    discountPercent: 30,
    stay: '1 Day Hospitalization',
    anesthesia: 'General Anesthesia',
    incision: '3 Keyhole Micro-Ports (5 mm)',
    recoveryTime: '3-5 Days to Desk Routine',
    hospitalLocation: 'Dispur Polyclinic / Downtown Hospital Hub, Guwahati',
    image: '/surgery-pkg2-appendix.png',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Priority Cashless Admission with All TPAs & Mediclaim Providers',

    overview: 'Laparoscopic Appendectomy is the safe, minimally invasive surgical procedure to remove an inflamed, infected, or ruptured appendix (acute and subacute appendicitis). Using precision micro-instruments, it permanently eliminates severe right lower abdominal pain and prevents dangerous peritonitis.',

    description: 'Appendicitis occurs when the appendix gets obstructed and inflamed, causing severe right lower quadrant pain, fever, nausea, and vomiting. If not treated quickly, an inflamed appendix can burst. Laparoscopic appendectomy safely removes the appendix through 3 tiny keyhole incisions, ensuring immediate pain relief and fast hospital discharge.',

    procedureSteps: [
      {
        step: 1,
        title: 'Emergency/Planned Evaluation',
        description: 'High-resolution abdominal ultrasound/CT, blood count (WBC), and rapid surgical pre-anesthetic fitness.'
      },
      {
        step: 2,
        title: '3-Port Laparoscopy',
        description: 'Three tiny 5 mm incisions are placed around the navel and lower abdomen. HD camera visualizes the appendix clearly.'
      },
      {
        step: 3,
        title: 'Appendix Ligation & Extraction',
        description: 'Base of the appendix is safely ligated with endo-loops and divided. The inflamed organ is retrieved in an endobag to avoid any abdominal contamination.'
      },
      {
        step: 4,
        title: 'Same/Next-Day Recovery',
        description: 'Normal bowel sounds resume within hours. Patient is eating soft food by next morning and discharged happily.'
      }
    ],

    benefits: [
      'Minimal keyhole incisions with negligible postoperative pain',
      'Eliminates the risk of appendix perforation and systemic infection',
      'Quick 24-hour discharge; resume normal routine in 3-5 days',
      'No muscle-cutting open wounds, reducing hernia risk to zero',
      'Direct cashless coverage across 35+ insurance companies'
    ],

    inclusions: [
      'Pre-op ultrasound, CBC, serum electrolytes, and anesthesia workup',
      'Surgeon, Anesthetist, and surgical assistant procedural fees',
      'Modular OT, laparoscopic tower, and harmonic/bipolar equipment usage',
      '1 Night Single AC Private Room with companion accommodation',
      'Standard surgical disposables, endoloops, and sterile kits',
      'Discharge medicine pack for 5 days',
      '2 Post-op follow-up consultations in Guwahati'
    ],

    surgeon: {
      name: 'Dr. Anupam Sarma',
      qualification: 'MBBS (GMC), MS (General Surgery), FMAS',
      role: 'Consultant Laparoscopic Surgeon',
      experience: '18+ Years Experience',
      surgeriesCount: '2,900+ Emergency & Elective Laparoscopies',
      hospitalAffiliation: 'Dispur Polyclinic & Downtown Hospital, Guwahati',
      rating: '4.9/5'
    },

    recoveryGuide: {
      hospitalStay: '24 Hours',
      walking: 'Walking comfortably within 4-6 hours post-op',
      diet: 'Clear liquids same evening, normal home cooked food from Day 2',
      returnToWork: '3-5 days for desk jobs; 2 weeks for vigorous manual exertion',
      followUp: 'Follow-up on Day 7'
    }
  },

  {
    id: 'surg-hernia',
    slug: 'hernia-repair',
    title: 'Laparoscopic Hernia Repair (Inguinal / Umbilical)',
    shortTitle: 'Hernia Repair',
    subtitle: '(Inguinal / Umbilical)',
    category: 'Laparoscopic & General',
    startingPrice: 40000,
    priceFormatted: '₹40,000',
    mrp: 58000,
    discountPercent: 31,
    stay: '1 Day Hospitalization',
    anesthesia: 'General Anesthesia',
    incision: 'Keyhole TEP / TAPP Technique (3 Micro-Ports)',
    recoveryTime: '5-7 Days Recovery',
    hospitalLocation: 'Central Polyclinic & Hospital, GS Road, Guwahati',
    image: '/surgery-pkg3-hernia.png',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Cashless Tie-up with 30+ Health Insurers & Ayushman PM-JAY',

    overview: 'Tension-free laparoscopic mesh plasty (TEP / TAPP) is the modern advanced treatment for inguinal, umbilical, and incisional hernias. By placing an anatomical composite polypropylene mesh behind the abdominal wall defect, it restores strength with virtually zero recurrence.',

    description: 'A hernia occurs when internal tissue or intestine bulges through a weak spot in the abdominal muscle wall. Left untreated, it enlarges and can cause strangulation. Laparoscopic hernia repair places a strong prosthetic mesh from the inside of the abdominal wall, eliminating tension and allowing patients to walk freely without painful groin pulling.',

    procedureSteps: [
      {
        step: 1,
        title: 'Pre-Op Ultrasound & Sizing',
        description: 'Detailed high-frequency ultrasound maps the exact defect size and anatomical landmarks.'
      },
      {
        step: 2,
        title: 'Pre-Peritoneal Laparoscopy',
        description: 'Through three 5 mm incisions, the balloon dissection safely exposes the hernia ring without entering the abdominal cavity (TEP).'
      },
      {
        step: 3,
        title: 'Defect Reduction & 3D Mesh Placement',
        description: 'Hernia contents are gently reduced. A large 3D anatomical polypropylene/composite mesh is laid flat covering all potential defect zones.'
      },
      {
        step: 4,
        title: 'Tension-Free Closure & Walking',
        description: 'Mesh incorporates naturally with surrounding tissue. Incisions closed with surgical tape. Discharged next morning.'
      }
    ],

    benefits: [
      'Tension-free repair eliminates post-operative groin pulling and ache',
      'Virtually zero recurrence rate compared to traditional open surgery',
      'Both sides (bilateral hernia) can be repaired through the same 3 tiny holes',
      'Fast recovery: driving in 5-7 days and desk work in under a week',
      'Complete senior citizen pick-up and discharge cab included'
    ],

    inclusions: [
      'Pre-op ultrasound and routine blood profile',
      'Laparoscopic TEP/TAPP mesh repair with Dual-side Prolene mesh',
      'Anesthesia and nursing care in sanitized modular OT',
      '1 Night AC Single Room stay',
      'Senior Citizen assisted pick-up & drop within 10km radius',
      'Post-procedure follow-up visits and suture check'
    ],

    surgeon: {
      name: 'Dr. Anupam Sarma',
      qualification: 'MBBS (GMC), MS (General Surgery), FMAS',
      role: 'Senior Minimal Access Hernia Specialist',
      experience: '18+ Years Experience',
      surgeriesCount: '2,400+ Hernia Mesh Plasty Surgeries',
      hospitalAffiliation: 'Central Polyclinic, GS Road & Downtown, Guwahati',
      rating: '4.9/5'
    },

    recoveryGuide: {
      hospitalStay: '24 Hours',
      walking: 'Walking same day with minimal discomfort',
      diet: 'High-fiber diet to avoid straining on stools',
      returnToWork: 'Desk work in 5-7 days; avoid lifting >10kg for 4 weeks',
      followUp: '7th day checkup'
    }
  },

  {
    id: 'surg-orthopedic',
    slug: 'orthopedic-surgery-package',
    title: 'Orthopedic Surgery Package',
    shortTitle: 'Orthopedic Surgery Package',
    subtitle: 'Knee, Hip, Shoulder, Joint Replacement',
    category: 'Orthopedic & Joint',
    startingPrice: 75000,
    priceFormatted: '₹75,000',
    mrp: 100000,
    discountPercent: 25,
    stay: '3–5 Days (Hospital Stay)',
    anesthesia: 'Spinal / Epidural Anesthesia',
    incision: 'Minimally Invasive Joint Reconstruction',
    recoveryTime: 'Walking in 48 Hours, Normal Walk in 3-4 Weeks',
    hospitalLocation: 'Dispur Ortho Care & Premier Super Specialty Hospital, Guwahati',
    image: '/surgery-orthopedic-knee.png',
    thumbImage: '/surgery-pkg-orthopedic.png',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Full Cashless Pre-Authorization with All Major Health Insurance Policies',

    overview: 'Get advanced orthopedic care for joint and bone problems with our specialized surgery package. Our expert surgeons and modern technology ensure better mobility and faster recovery.',

    description: 'Advanced orthopedic joint conditions cause cartilage erosion, bone friction, stiffness, and severe pain. Our comprehensive orthopedic surgery package provides precision joint reconstruction, modern modular OT facilities, and dedicated rehabilitation care ensuring swift recovery and enhanced long-term mobility.',

    whatsIncluded: [
      'Pre-surgery Consultation',
      'Surgery Charges',
      'Room Charges (3–5 Days)',
      'Medicines & Consumables',
      'Post-operative Care',
      'Follow-up Consultation'
    ],

    whyChooseUs: [
      {
        title: 'Experienced Orthopedic Surgeons',
        desc: 'Highly qualified, board-certified joint replacement specialists with decades of surgical expertise.'
      },
      {
        title: 'Advanced Technology',
        desc: 'High-definition robotic and computer-navigated surgical systems for sub-millimeter precision.'
      },
      {
        title: 'Shorter Hospital Stay',
        desc: 'Fast-track recovery protocols enabling accelerated discharge in 3 to 5 days.'
      },
      {
        title: 'Better Recovery Outcomes',
        desc: 'Personalized physiotherapy and continuous rehabilitation support for pain-free mobility.'
      }
    ],

    faqs: [
      {
        q: 'What is included in the orthopedic surgery package?',
        a: 'The package includes comprehensive pre-surgery evaluation, surgical procedure charges, OT consumables, 3 to 5 days room charges, routine in-hospital medications, post-operative nursing care, and follow-up consultations.'
      },
      {
        q: 'How long is the hospital stay?',
        a: 'The typical hospital stay is 3 to 5 days depending on the procedure and patient recovery progress. Our care team monitors vital milestones daily before discharge.'
      },
      {
        q: 'Is the package covered by insurance?',
        a: 'Yes, our orthopedic surgery packages are 100% eligible for cashless insurance with all leading health insurance companies and TPAs. Our dedicated insurance desk coordinates complete pre-authorization.'
      },
      {
        q: 'Can I choose my surgeon?',
        a: 'Yes, you can select and consult with your preferred senior orthopedic specialist from our accredited surgical panel for your evaluation and procedure.'
      }
    ],

    procedureSteps: [
      {
        step: 1,
        title: 'Pre-Operative Assessment & 3D Imaging',
        description: 'Complete joint x-rays, CT mapping, cardiology fitness, and routine hematology workup.'
      },
      {
        step: 2,
        title: 'Minimally Invasive Joint Reconstruction',
        description: 'Under gentle spinal anesthesia, diseased joint surfaces are precisely resurfaced and aligned.'
      },
      {
        step: 3,
        title: 'Precision Biocompatible Implant Placement',
        description: 'High-flexion titanium and cobalt-chromium components are secured with bone cement.'
      },
      {
        step: 4,
        title: 'Fast-Track In-Hospital Rehabilitation',
        description: 'Dedicated physiotherapy begins within 24-48 hours to restore mobility and weight-bearing.'
      }
    ],

    benefits: [
      'Permanent relief from chronic joint pain and structural deformity',
      'Minimally invasive approach preserving natural ligaments and muscles',
      'Walk comfortably with support within 48 hours',
      'High-durability implants with lifespan exceeding 20+ years',
      'Transparent package with zero hidden hospital costs'
    ],

    inclusions: [
      'Pre-surgery Consultation',
      'Surgery Charges',
      'Room Charges (3–5 Days)',
      'Medicines & Consumables',
      'Post-operative Care',
      'Follow-up Consultation'
    ],

    surgeon: {
      name: 'Dr. Arindam Borah, MPT (Ortho)',
      qualification: 'MBBS, MS (Orthopedics), Joint Replacement Fellow',
      role: 'Chief Joint Replacement & Orthopedic Surgeon',
      experience: '16+ Years Experience',
      surgeriesCount: '2,200+ Successful Procedures',
      hospitalAffiliation: 'Dispur Ortho Care & Premier Super Specialty Hospital, Guwahati',
      rating: '4.9/5'
    },

    recoveryGuide: {
      hospitalStay: '3–5 Days',
      walking: 'Walking with support on Day 2; independent walking in 2-3 weeks',
      diet: 'High-protein, calcium and vitamin D enriched recovery diet',
      returnToWork: 'Desk work in 3-4 weeks; driving in 4-6 weeks',
      followUp: 'First review on Day 7, stitch inspection on Day 14'
    }
  },

  {
    id: 'surg-knee',
    slug: 'knee-replacement',
    title: 'Total Knee Replacement (TKR - Fast-Track Robotic/Navigated)',
    shortTitle: 'Knee Replacement',
    subtitle: '(Total / Partial)',
    category: 'Orthopedic & Joint',
    startingPrice: 250000,
    priceFormatted: '₹2,50,000',
    mrp: 320000,
    discountPercent: 22,
    stay: '3-4 Days Hospital Stay',
    anesthesia: 'Spinal / Epidural Anesthesia with Pain-Free Block',
    incision: 'Sub-vastus Quad-Sparing Minimally Invasive Incision',
    recoveryTime: 'Walking on Day 2 with Support, Normal Walk in 3-4 Weeks',
    hospitalLocation: 'Premier Super Specialty Orthopedic Hub, GS Road, Guwahati',
    image: '/surgery-pkg4-knee.png',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Full Cashless Pre-Authorization with All Major Health Insurance Policies',

    overview: 'Total Knee Arthroplasty (TKR) with robotic navigation restores painless joint alignment, stability, and full mobility for severe knee osteoarthritis. High-flexion titanium/cobalt-chromium implants provide natural knee flexion, enabling patients to walk pain-free for 20+ years.',

    description: 'Advanced knee osteoarthritis causes cartilage erosion, bone friction, stiffness, severe bowlegs, and night pain. Fast-track knee replacement replaces the damaged joint surfaces with precision prosthetic implants. Quad-sparing surgical techniques preserve muscles, enabling patients to stand and take supported steps on Day 2.',

    procedureSteps: [
      {
        step: 1,
        title: '3D Joint CT Mapping & Planning',
        description: 'Digital 3D modeling calculates exact bone cuts, implant size, and mechanical alignment down to 0.5 mm.'
      },
      {
        step: 2,
        title: 'Quad-Sparing Surgical Approach',
        description: 'Under spinal anesthesia and regional adductor canal pain block, the knee is accessed without cutting major quadriceps muscles.'
      },
      {
        step: 3,
        title: 'US-FDA Titanium Implant Placement',
        description: 'Micro-planed bone surfaces receive premium Cobalt-Chromium / Titanium femoral and tibial components with ultra-high molecular weight polyethylene spacer.'
      },
      {
        step: 4,
        title: 'Fast-Track In-Hospital Rehab',
        description: 'Immediate continuous passive motion (CPM). Dedicated physiotherapist guides standing and walking on Day 2.'
      }
    ],

    benefits: [
      'Permanent relief from chronic knee joint pain and deformities',
      'High-flexion implant permits comfortable stair climbing and natural gait',
      'Quad-sparing fast-track rehab: walk with walker on Day 2',
      'Implant lifespan exceeding 20-25 years with high biocompatibility',
      'Free wheelchair ambulance/cab transport for senior citizens in Guwahati'
    ],

    inclusions: [
      'US-FDA approved Cobalt-Chromium / Titanium joint implant',
      'Full pre-surgery diagnostic workup + Cardiology fitness',
      'Surgeon, Anesthetist, and Assistant Surgical Fees',
      '3-4 Days Hospital Stay in Private AC Room with Companion Couch',
      'In-hospital physiotherapy rehabilitation sessions daily',
      'Complimentary Senior Citizen Wheelchair Vehicle Transport in Guwahati',
      'First 5 home physiotherapy visits included post-discharge',
      'Regular surgeon checkups for 3 months'
    ],

    surgeon: {
      name: 'Dr. Arindam Borah, MPT (Ortho)',
      qualification: 'MBBS, MS (Orthopedics), Fellowship in Joint Replacement',
      role: 'Chief Joint Replacement Surgeon',
      experience: '16+ Years Experience',
      surgeriesCount: '2,200+ Knee & Hip Replacements',
      hospitalAffiliation: 'Premier Super Specialty Orthopedic Hub, Guwahati',
      rating: '4.9/5'
    },

    recoveryGuide: {
      hospitalStay: '3-4 Days',
      walking: 'Standing and taking assisted steps on Day 2; walking with cane in 2 weeks',
      diet: 'High-protein, calcium and vitamin D enriched recovery diet',
      returnToWork: 'Desk work in 3-4 weeks; driving in 4-6 weeks',
      followUp: 'Stitch check at 2 weeks, clinical x-ray at 6 weeks'
    }
  },

  {
    id: 'surg-hip',
    slug: 'hip-replacement',
    title: 'Total Hip Replacement (THR - Ceramic/Bipolar Arthroplasty)',
    shortTitle: 'Hip Replacement',
    subtitle: '(Total Hip Surgery)',
    category: 'Orthopedic & Joint',
    startingPrice: 280000,
    priceFormatted: '₹2,80,000',
    mrp: 350000,
    discountPercent: 20,
    stay: '3-4 Days Hospital Stay',
    anesthesia: 'Combined Spinal Epidural Anesthesia',
    incision: 'Direct Anterior / Posterior Minimally Invasive Incision',
    recoveryTime: 'Full Weight-Bearing in 48 Hours',
    hospitalLocation: 'Dispur Ortho Care & Premier Specialty Hospital, Guwahati',
    image: '/surgery-pkg5-hip.png',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Cashless Approval Assistance with Comprehensive TPA Tie-ups',

    overview: 'Total Hip Arthroplasty replaces damaged femoral head and pelvic acetabulum with advanced ceramic-on-polyethylene bearings. It delivers complete relief from severe hip pain caused by avascular necrosis (AVN), osteoarthritis, or hip fractures.',

    description: 'Avascular necrosis (AVN) of the femoral head and severe hip arthritis cause excruciating groin pain, severe limp, and inability to sit or walk. Total Hip Replacement restores fluid, frictionless hip rotation, allowing patients to regain normal stride length and active lifestyle.',

    procedureSteps: [
      {
        step: 1,
        title: 'Pelvic Pelvimetry & Pre-Op Planning',
        description: 'Comprehensive digital radiographs determine leg length equality, cup inclination, and stem sizing.'
      },
      {
        step: 2,
        title: 'Minimally Invasive Joint Access',
        description: 'Soft tissue and joint capsule accessed with direct anterior or posterior approach to preserve abductor muscles.'
      },
      {
        step: 3,
        title: 'Implant Fixation',
        description: 'Porous titanium press-fit acetabular cup and femoral stem are implanted with delta ceramic head for zero wear.'
      },
      {
        step: 4,
        title: 'Post-Op Mobilization',
        description: 'Full weight-bearing mobilization initiated within 24-48 hours with physical therapy guidance.'
      }
    ],

    benefits: [
      'Immediate and complete relief from debilitating hip pain and limp',
      'Ceramic-on-polyethylene wear rate is virtually zero for 25+ years durability',
      'Equalization of leg length discrepancies',
      'Quick return to sitting, driving, and recreational walking',
      'Assisted senior citizen transport and home rehab support'
    ],

    inclusions: [
      'US-FDA Delta Ceramic and Titanium Hip Implant System',
      'Senior Orthopedic Surgeon, Anesthetist & Surgical Team Fees',
      '3-4 Days Private AC Room hospitalization with nursing care',
      'In-hospital and post-discharge physical therapy program',
      'Routine blood, cardiology, and pre-op imaging package',
      'Senior Citizen roundtrip cab transport in Guwahati',
      '6 Weeks post-op clinical follow-up visits'
    ],

    surgeon: {
      name: 'Dr. Arindam Borah, MPT (Ortho)',
      qualification: 'MBBS, MS (Orthopedics), Joint Reconstruction Fellow',
      role: 'Senior Consultant Joint Replacement & Arthroscopy',
      experience: '16+ Years Experience',
      surgeriesCount: '1,800+ Hip Replacement Procedures',
      hospitalAffiliation: 'Dispur Ortho Care & Premier Specialty Hospital, Guwahati',
      rating: '4.9/5'
    },

    recoveryGuide: {
      hospitalStay: '3-4 Days',
      walking: 'Walking with support within 48 hours; independent walking in 3 weeks',
      diet: 'High protein balanced diet for rapid tissue healing',
      returnToWork: 'Desk routine in 3-4 weeks',
      followUp: 'Clinical review at 2 weeks, 6 weeks, and 3 months'
    }
  },

  {
    id: 'surg-cataract',
    slug: 'cataract-surgery',
    title: 'Advanced Cataract Surgery (Phaco + Foldable IOL)',
    shortTitle: 'Cataract Surgery',
    subtitle: '(With Lens Implant)',
    category: 'Ophthalmology (Eye)',
    startingPrice: 25000,
    priceFormatted: '₹25,000',
    mrp: 36000,
    discountPercent: 30,
    stay: 'Daycare (Walk-in & Walk-out in 4 Hours)',
    anesthesia: 'Topical Eye Drops (Painless, No Injections)',
    incision: '2.2 mm Stitchless Micro-Coaxial Incision',
    recoveryTime: '2-3 Days to Crystal Clear Vision',
    hospitalLocation: 'Dispur Eye Center & Partner Hospitals, Guwahati',
    image: '/surgery-pkg6-cataract.png',
    seniorPickUpIncluded: true,
    cashlessInsurance: 'Covered under All Health Insurance & Ayushman / CGHS Assistance',

    overview: 'Micro-Incision Cataract Surgery (MICS - Phacoemulsification) gently dissolves cloudy eye lens using ultrasonic sound waves and implants an imported foldable hydrophobic Intraocular Lens (IOL) through a 2.2 mm micro-incision without stitches or eye patches.',

    description: 'Cataracts cause blurred vision, glare at night, faded colors, and double vision. Our stitchless Phaco surgery restores bright, crisp 20/20 vision in just 15 minutes. Performed using numbing eye drops with zero needles, patients walk in and walk out comfortably on the same day.',

    procedureSteps: [
      {
        step: 1,
        title: 'Laser Biometry & IOL Power Calculation',
        description: 'Optical biometry (IOL Master) determines exact personalized lens power for sharp distance and near vision.'
      },
      {
        step: 2,
        title: 'Topical Anesthetic Eye Drops',
        description: 'No needle injection around the eye. Eye is completely numbed with gentle anesthetic drops.'
      },
      {
        step: 3,
        title: 'Ultrasonic Phaco & Foldable IOL',
        description: 'Through a 2.2 mm micro-opening, phaco ultrasound dissolves the cloudy cataract. Foldable hydrophobic IOL unfolds inside the eye capsule.'
      },
      {
        step: 4,
        title: 'Stitchless Self-Sealing & Discharge',
        description: 'Micro-incision self-seals with natural eye pressure. Patient is discharged in 2 hours with protective eyewear.'
      }
    ],

    benefits: [
      'Painless, blade-free surgery with topical eye drops (no injections)',
      'No stitches, no bandages, no eye patch required',
      'Quick 15-minute procedure; walk out in 2 hours',
      'Restores vibrant color perception and crisp vision',
      'Free Senior Citizen AC pick-up & drop within 10km in Guwahati'
    ],

    inclusions: [
      'Pre-op optical biometry, A-scan, and specular microscopy',
      'Senior Ophthalmic Surgeon and OT fees',
      'High-grade Hydrophobic Foldable Intraocular Lens (IOL)',
      'Free Senior Citizen AC Pick-up & Drop within 10km in Guwahati',
      'Dedicated Zestmed Care Coordinator assistance',
      'Protective eye goggles and post-op medicated eye drops kit',
      '2 Post-operative checkups within 30 days'
    ],

    surgeon: {
      name: 'Dr. Hemanta Goswami',
      qualification: 'MBBS, MS (Ophthalmology), Phaco & Refractive Fellow',
      role: 'Senior Consultant Cataract & Refractive Surgeon',
      experience: '20+ Years Experience',
      surgeriesCount: '12,000+ Successful Cataract Surgeries',
      hospitalAffiliation: 'Dispur Eye Care Center & ZESTMED Hub, Guwahati',
      rating: '4.9/5'
    },

    recoveryGuide: {
      hospitalStay: 'Daycare (Discharge in 2-3 Hours)',
      walking: 'Walking and normal home activities immediately upon discharge',
      diet: 'Normal diet without any restrictions',
      returnToWork: 'Resume screen work and reading in 2-3 days; avoid splashing water in eye for 1 week',
      followUp: 'Next-day checkup and 2-week final refraction'
    }
  }
];

export const MOCK_SURGERY_PACKAGES = DETAILED_SURGERY_PACKAGES;

// Helper to look up a surgery package by id, slug, or title keyword
export function getSurgeryPackageById(idOrSlug) {
  if (!idOrSlug) return null;
  const target = String(idOrSlug).toLowerCase().trim();

  // 1. Direct match on id or slug
  const direct = DETAILED_SURGERY_PACKAGES.find(
    (p) => p.id.toLowerCase() === target || p.slug.toLowerCase() === target
  );
  if (direct) return direct;

  // 2. Partial matching (e.g. 'gallbladder', 'appendix', 'hernia', 'knee', 'hip', 'cataract')
  const partial = DETAILED_SURGERY_PACKAGES.find(
    (p) =>
      target.includes(p.slug) ||
      p.slug.includes(target) ||
      p.title.toLowerCase().includes(target) ||
      p.shortTitle.toLowerCase().includes(target)
  );
  if (partial) return partial;

  // 3. Fallback to first package if completely unknown
  return DETAILED_SURGERY_PACKAGES[0];
}
