// src/mock-data/doctorsData.js
// Verified Specialist Doctors in Guwahati & North-East Polyclinic Hubs

export const DOCTOR_SPECIALTIES = [
  'All Specialties',
  'General Physician',
  'Cardiology',
  'Orthopedics',
  'Gynecology',
  'Pediatrics',
  'Dermatology',
  'ENT',
  'Gastroenterology',
  'Neurology',
  'Pulmonology'
];

export const MOCK_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Amit Sharma',
    degree: 'MBBS, MD (Internal Medicine)',
    specialty: 'General Physician',
    specialization: 'General Physician',
    department: 'General Physician',
    designation: 'Senior Consultant Physician',
    experience: '10+ Yrs Experience',
    hospital: 'Zestmed Polyclinic & Diagnostic Hub, GS Road',
    rating: '★ 4.8 (1,240+ reviews)',
    ratingScore: 4.8,
    reviewsCount: '1,240+',
    fee: 600,
    nextSlot: 'Today, 04:30 PM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: '/doctor-amit-sharma.jpg',
    bio: 'Senior Consultant Physician specializing in internal medicine, chronic disease management, and adult preventive care.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Neha Verma',
    degree: 'MBBS, MS (Obstetrics & Gynecology)',
    specialty: 'Gynecology',
    specialization: 'Gynecology',
    department: 'Gynecology',
    designation: 'Obstetrician & Gynecologist',
    experience: '12+ Yrs Experience',
    hospital: 'Zestmed Polyclinic & Maternal Care Center',
    rating: '★ 4.9 (980+ reviews)',
    ratingScore: 4.9,
    reviewsCount: '980+',
    fee: 750,
    nextSlot: 'Today, 05:30 PM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: '/doctor-neha-verma.jpg',
    bio: 'Renowned Obstetrician & Gynecologist specializing in high-risk pregnancies, hormonal health, and reproductive wellness.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Rohan Das',
    degree: 'MBBS, MS (Orthopedics)',
    specialty: 'Orthopedics',
    specialization: 'Orthopedics',
    department: 'Orthopedics',
    designation: 'Orthopedic Surgeon',
    experience: '8+ Yrs Experience',
    hospital: 'Zestmed Advanced Orthopedic & Joint Care Unit',
    rating: '★ 4.8 (760+ reviews)',
    ratingScore: 4.8,
    reviewsCount: '760+',
    fee: 700,
    nextSlot: 'Tomorrow, 11:00 AM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: '/doctor-rohan-das.jpg',
    bio: 'Orthopedic Surgeon with extensive expertise in arthroscopic surgery, joint replacement, and sports trauma management.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Bhabesh Chandra Deka',
    degree: 'MBBS, MD, DM (Cardiology)',
    specialty: 'Cardiology',
    specialization: 'Cardiology',
    department: 'Cardiology',
    designation: 'Senior Interventional Cardiologist',
    experience: '20+ Yrs Experience',
    hospital: 'Dispur Polyclinic & Zestmed Cardiology Wing',
    rating: '★ 4.95 (580+ reviews)',
    ratingScore: 4.95,
    reviewsCount: '580+',
    fee: 900,
    nextSlot: 'Tomorrow, 11:30 AM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
    bio: 'Pioneering interventional cardiologist with over two decades of clinical experience in cardiac diagnostics and preventive audits.'
  },
  {
    id: 'doc-5',
    name: 'Dr. Manjit Gogoi',
    degree: 'MBBS, MD (Pediatrics), DCH',
    specialty: 'Pediatrics',
    specialization: 'Pediatrics',
    department: 'Pediatrics',
    designation: 'Consultant Pediatrician',
    experience: '12+ Yrs Experience',
    hospital: 'Zestmed Pediatric & Child Care Clinic',
    rating: '★ 4.9 (460+ reviews)',
    ratingScore: 4.9,
    reviewsCount: '460+',
    fee: 650,
    nextSlot: 'Today, 05:00 PM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    bio: 'Compassionate child healthcare specialist handling neonatology, pediatric allergies, and developmental assessments.'
  },
  {
    id: 'doc-6',
    name: 'Dr. Ananya Baruah',
    degree: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    specialty: 'Dermatology',
    specialization: 'Dermatology',
    department: 'Dermatology',
    designation: 'Consultant Dermatologist',
    experience: '9+ Yrs Experience',
    hospital: 'Zestmed Derma & Aesthetics Clinic',
    rating: '★ 4.85 (510+ reviews)',
    ratingScore: 4.85,
    reviewsCount: '510+',
    fee: 650,
    nextSlot: 'Today, 06:15 PM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    bio: 'Expert dermatologist specializing in clinical trichology, allergic dermatoses, acne management, and medical aesthetics.'
  },
  {
    id: 'doc-7',
    name: 'Dr. Pranab Sarma',
    degree: 'MBBS, MS (ENT), DLO',
    specialty: 'ENT',
    specialization: 'ENT',
    department: 'ENT',
    designation: 'Senior Consultant ENT Surgeon',
    experience: '15+ Yrs Experience',
    hospital: 'Christian Basti Medical Centre & Zestmed Hub',
    rating: '★ 4.8 (390+ reviews)',
    ratingScore: 4.8,
    reviewsCount: '390+',
    fee: 600,
    nextSlot: 'Tomorrow, 10:30 AM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: 'https://images.unsplash.com/photo-1594824813508-2022797e8ec9?auto=format&fit=crop&w=400&q=80',
    bio: 'Ear, Nose & Throat surgeon specializing in endoscopic sinus care, vertigo management, and audiology rehabilitation.'
  },
  {
    id: 'doc-8',
    name: 'Dr. Debabrata Hazarika',
    degree: 'MBBS, MD, DM (Gastroenterology)',
    specialty: 'Gastroenterology',
    specialization: 'Gastroenterology',
    department: 'Gastroenterology',
    designation: 'Consultant Gastroenterologist',
    experience: '14+ Yrs Experience',
    hospital: 'Zestmed Digestive Health & Liver Sciences',
    rating: '★ 4.9 (430+ reviews)',
    ratingScore: 4.9,
    reviewsCount: '430+',
    fee: 850,
    nextSlot: 'Tomorrow, 03:00 PM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    bio: 'Senior consultant gastroenterologist with advanced focus on hepatobiliary disorders, IBD, and therapeutic endoscopy.'
  },
  {
    id: 'doc-9',
    name: 'Dr. Himangshu Bora',
    degree: 'MBBS, MD, DM (Neurology)',
    specialty: 'Neurology',
    specialization: 'Neurology',
    department: 'Neurology',
    designation: 'Senior Consultant Neurologist',
    experience: '16+ Yrs Experience',
    hospital: 'Dispur Neuro Care & Zestmed Specialty Clinic',
    rating: '★ 4.9 (310+ reviews)',
    ratingScore: 4.9,
    reviewsCount: '310+',
    fee: 900,
    nextSlot: 'Wednesday, 04:00 PM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    bio: 'Neurologist specializing in stroke management, epilepsy, neuropathy, and movement disorder therapeutics.'
  },
  {
    id: 'doc-10',
    name: 'Dr. Sunita Goswami',
    degree: 'MBBS, MD (Pulmonary Medicine), FCCP',
    specialty: 'Pulmonology',
    specialization: 'Pulmonology',
    department: 'Pulmonology',
    designation: 'Consultant Pulmonologist',
    experience: '11+ Yrs Experience',
    hospital: 'Zestmed Chest & Respiratory Institute',
    rating: '★ 4.85 (340+ reviews)',
    ratingScore: 4.85,
    reviewsCount: '340+',
    fee: 700,
    nextSlot: 'Today, 06:45 PM',
    modes: ['Clinic Visit', 'Online Consultation'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    bio: 'Chest physician and pulmonologist specializing in asthma, allergic airway diseases, sleep apnea, and post-viral recovery.'
  }
];

/**
 * Normalizes and checks if a doctor matches a specialty filter query or category.
 * Accurately handles synonyms, stems (e.g. Gynecology <-> Gynecologist), and departments.
 */
export const matchesSpecialty = (doctor, filter) => {
  if (!filter || filter === 'All' || filter === 'All Specialties') return true;
  if (!doctor) return false;

  const f = filter.toLowerCase().trim();
  const dSpecialty = (doctor.specialty || '').toLowerCase();
  const dDept = (doctor.department || '').toLowerCase();
  const dSpecialization = (doctor.specialization || '').toLowerCase();
  const dDegree = (doctor.degree || '').toLowerCase();
  const dDesignation = (doctor.designation || '').toLowerCase();
  const dBio = (doctor.bio || '').toLowerCase();

  // Direct exact or substring matches
  if (
    dSpecialty === f ||
    dDept === f ||
    dSpecialization === f ||
    dSpecialty.includes(f) ||
    f.includes(dSpecialty) ||
    dDept.includes(f) ||
    dSpecialization.includes(f)
  ) {
    return true;
  }

  // Gynecology mappings: gynecology, gynecologist, gynae, obstetrics
  if (f.includes('gyne') || f.includes('gynae')) {
    return (
      dSpecialty.includes('gynec') ||
      dSpecialty.includes('gynae') ||
      dDept.includes('gynec') ||
      dDept.includes('gynae') ||
      dSpecialization.includes('gynec') ||
      dSpecialization.includes('gynae') ||
      dDegree.includes('gynec') ||
      dDegree.includes('obstetrics') ||
      dDesignation.includes('gynec') ||
      dBio.includes('gynec') ||
      dBio.includes('obstetric')
    );
  }

  // Orthopedics mappings: orthopedics, orthopedic surgeon, ortho
  if (f.includes('ortho')) {
    return (
      dSpecialty.includes('ortho') ||
      dDept.includes('ortho') ||
      dSpecialization.includes('ortho') ||
      dDegree.includes('ortho') ||
      dDesignation.includes('ortho')
    );
  }

  // Cardiology
  if (f.includes('cardio')) {
    return (
      dSpecialty.includes('cardio') ||
      dDept.includes('cardio') ||
      dSpecialization.includes('cardio') ||
      dDegree.includes('cardio')
    );
  }

  // General Physician
  if (f.includes('physician') || f.includes('general')) {
    return (
      dSpecialty.includes('physician') ||
      dSpecialty.includes('general') ||
      dDept.includes('general') ||
      dDegree.includes('medicine')
    );
  }

  // Pediatrics
  if (f.includes('pedia')) {
    return (
      dSpecialty.includes('pedia') ||
      dDept.includes('pedia') ||
      dSpecialization.includes('pedia')
    );
  }

  // Dermatology
  if (f.includes('derma')) {
    return (
      dSpecialty.includes('derma') ||
      dDept.includes('derma') ||
      dSpecialization.includes('derma')
    );
  }

  // ENT
  if (f === 'ent' || f.includes('ear') || f.includes('throat')) {
    return (
      dSpecialty.includes('ent') ||
      dDept.includes('ent') ||
      dDegree.includes('ent') ||
      dDegree.includes('dlo')
    );
  }

  // Gastroenterology
  if (f.includes('gastro')) {
    return (
      dSpecialty.includes('gastro') ||
      dDept.includes('gastro') ||
      dSpecialization.includes('gastro')
    );
  }

  // Neurology
  if (f.includes('neuro')) {
    return (
      dSpecialty.includes('neuro') ||
      dDept.includes('neuro') ||
      dSpecialization.includes('neuro')
    );
  }

  // Pulmonology
  if (f.includes('pulmo') || f.includes('chest') || f.includes('respiratory')) {
    return (
      dSpecialty.includes('pulmo') ||
      dDept.includes('pulmo') ||
      dSpecialization.includes('pulmo') ||
      dDegree.includes('pulmonary')
    );
  }

  return false;
};
