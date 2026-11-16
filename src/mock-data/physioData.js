// src/mock-data/physioData.js
// Licensed Physiotherapists in Guwahati, Assam (Home Visits & Clinic Rehab)

export const PHYSIO_CONDITIONS = [
  'All Conditions',
  'Senior Citizen Mobility & Balance',
  'Post-Surgery Rehabilitation',
  'Back & Spine Pain Relief',
  'Knee & Joint Arthritis',
  'Stroke & Neuro Rehab',
  'Sports Injury & Frozen Shoulder'
];

export const MOCK_PHYSIOTHERAPISTS = [
  {
    id: 'physio-1',
    name: 'Dr. Debabrat Saikia, PT',
    degree: 'BPT, MPT (Neuro-Physiotherapy), MIAP',
    specialty: 'Senior Citizen Mobility & Balance',
    experience: '10+ Years Experience',
    serviceType: 'Home Visit & Clinic',
    locations: 'Dispur, GS Road, Panbazar, Khanapara',
    rating: '4.9 ★ (210+ sessions)',
    sessionFee: 750,
    equipmentProvided: 'Portable Ultrasound, TENS machine, balance pads',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    bio: 'Specialist in geriatric physiotherapy, stroke neuro-rehabilitation, fall prevention for elderly citizens, and Parkinson’s gait training.'
  },
  {
    id: 'physio-2',
    name: 'Dr. Pallabi Goswami, PT',
    degree: 'BPT, MPT (Orthopedic Rehabilitation)',
    specialty: 'Knee & Joint Arthritis',
    experience: '8+ Years Experience',
    serviceType: 'Home Visit & Clinic',
    locations: 'Ulubari, Paltan Bazar, Chandmari, Zoo Road',
    rating: '4.88 ★ (180+ sessions)',
    sessionFee: 700,
    equipmentProvided: 'TheraBands, IFT unit, mobilization belts',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    bio: 'Expert in non-surgical osteoarthritis knee rehabilitation, manual therapy for spondylosis, and postural correction.'
  },
  {
    id: 'physio-3',
    name: 'Dr. Jayanta Barman, PT',
    degree: 'BPT, MPT (Sports Rehabilitation & Manual Therapy)',
    specialty: 'Post-Surgery Rehabilitation',
    experience: '12+ Years Experience',
    serviceType: 'Home Visit & Clinic',
    locations: 'Jalukbari, Maligaon, Bharalumukh, Shantipur',
    rating: '4.95 ★ (290+ sessions)',
    sessionFee: 800,
    equipmentProvided: 'EMS muscle stimulator, cryo-compression kit',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    bio: 'Rehabilitation lead for post-knee replacement (TKR), post-hip fracture recovery, and ACL ligament repair.'
  },
  {
    id: 'physio-4',
    name: 'Dr. Rituraj Deka, PT',
    degree: 'BPT, MIAP, Dry Needling Certified',
    specialty: 'Back & Spine Pain Relief',
    experience: '9+ Years Experience',
    serviceType: 'Home Visit in Guwahati',
    locations: 'Six Mile, Panjabari, Hatigaon, Bhetapara',
    rating: '4.85 ★ (150+ sessions)',
    sessionFee: 700,
    equipmentProvided: 'Spine traction belt, heat therapy, trigger point needles',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    bio: 'Specialist in disc bulge decompression, sciatica, chronic lower back pain, and ergonomic neck rehabilitation.'
  }
];
