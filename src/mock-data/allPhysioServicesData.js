// src/mock-data/allPhysioServicesData.js
// Complete Data for ZESTMED Physiotherapy Services, Details, and Booking Flow

export const ALL_PHYSIO_SERVICES = [
  {
    id: 'general-physiotherapy',
    title: 'General Physiotherapy',
    tagline: 'Comprehensive physical therapy for muscle pain, joint stiffness, and mobility recovery.',
    shortDesc: 'Complete diagnostic physical evaluation and customized manual therapy for daily aches and movement restrictions.',
    fullDesc: 'Our General Physiotherapy program delivers an all-inclusive clinical approach to alleviate acute or recurring pain, restore joint biomechanics, and rebuild functional movement. Every session begins with a comprehensive postural and musculoskeletal assessment by our certified physiotherapist, followed by evidence-based manual therapy, targeted therapeutic exercise routines, and advanced modalities to help you resume daily activities pain-free.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '3 - 5 Sessions Recommended',
    rating: 4.94,
    reviewCount: 380,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-back.jpg',
    category: 'Orthopedic & General',
    expert: {
      name: 'Dr. Arindam Borah, MPT (Ortho)',
      degree: 'BPT, MPT (Orthopedic Rehabilitation), MIAP',
      experience: '11+ Years Experience',
      hospital: 'ZESTMED Physiotherapy & Rehabilitation Center, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Comprehensive 1-on-1 Musculoskeletal & Biomechanical Assessment',
      'Hands-on Manual Joint Mobilization & Soft Tissue Myofascial Release',
      'Advanced Modalities (Digital TENS, Therapeutic Ultrasound, Heat Therapy)',
      'Customized Progressive Home Exercise & Strengthening Regimen',
      'Ergonomic Workstation Assessment & Postural Lifestyle Counseling',
      'Continuous Progress Tracking with Milestone-Based Re-evaluations'
    ],
    conditionsTreated: [
      'Chronic Lower Back Pain & Sciatica',
      'Cervical Spondylosis & Neck Stiffness',
      'Knee, Hip, and Shoulder Joint Aches',
      'Muscle Spasms, Strains & Tension Headaches',
      'General Mobility Limitations & Desk Ergonomic Strain',
      'Post-Physical Exertion Fatigue & Weakness'
    ],
    process: [
      { step: '01', title: 'Clinical Evaluation', desc: 'Detailed mobility screening, muscle strength testing, and pain trigger analysis.' },
      { step: '02', title: 'Targeted Therapy', desc: 'Hands-on joint decompression, soft tissue release, and electro-analgesia.' },
      { step: '03', title: 'Active Rehabilitation', desc: 'Supervised functional movement drills to restore natural range of motion.' },
      { step: '04', title: 'Preventive Regimen', desc: 'Personalized home guidance and posture maintenance to prevent recurrence.' }
    ],
    faqs: [
      { q: 'What happens during my first physiotherapy session?', a: 'Your physiotherapist will conduct a thorough 15-minute physical and range-of-motion evaluation, pinpoint pain origins, and proceed with hands-on therapy and pain-relieving modalities during the 60-minute appointment.' },
      { q: 'How many sessions will I need for full recovery?', a: 'Most patients experience marked improvement within 2 to 3 sessions. A standard treatment cycle typically ranges from 3 to 5 sessions depending on chronicity.' },
      { q: 'Is home-visit physiotherapy available in Guwahati?', a: 'Yes! Our certified physiotherapists provide doorstep home visits equipped with portable electrotherapy units across Dispur, GS Road, Zoo Road, Ulubari, and Greater Guwahati.' },
      { q: 'Are modalities like TENS and Ultrasound included in the fee?', a: 'Yes, all clinical equipment and manual therapies during the 60-minute session are completely covered in the ₹1,200 fee with zero hidden charges.' }
    ]
  },
  {
    id: 'back-neck-pain',
    title: 'Back & Neck Pain Therapy',
    tagline: 'Precision spinal decompression, disc care, and cervical-lumbar pain relief.',
    shortDesc: 'Targeted relief from chronic cervical, lumbar, and posture-related pain.',
    fullDesc: 'Specialized therapy dedicated to cervical spondylosis, lumbar disc bulge, sciatica nerve compression, and thoracic spine tension. Utilizing passive spinal traction, manual segmental mobilization, and core stabilization drills to relieve nerve pressure and eliminate burning or radiating pain.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '4 - 6 Sessions Recommended',
    rating: 4.96,
    reviewCount: 420,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-back.jpg',
    category: 'Spine & Posture',
    expert: {
      name: 'Dr. Rituraj Deka, PT',
      degree: 'BPT, MIAP, Spine Specialist & Dry Needling Certified',
      experience: '9+ Years Experience',
      hospital: 'ZESTMED Spine & Pain Rehabilitation Unit, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Gentle Manual Spinal Decompression & Traction',
      'Sciatic Nerve Gliding & Neural Mobilization',
      'Targeted Trigger Point Release for Trapezius and Lumbar Muscles',
      'Deep Core Transverse Abdominis Stabilizing Routines',
      'Ergonomic Desk & Lumbar Support Assessment'
    ],
    conditionsTreated: [
      'Sciatica & Radiating Leg Numbness',
      'Lumbar Disc Bulge (L4-L5, L5-S1)',
      'Cervical Spondylosis & Neck Rigidity',
      'Tech Neck & Forward Head Posture Strain',
      'Ankylosing Spondylitis Joint Stiffness'
    ],
    process: [
      { step: '01', title: 'Spine Alignment Check', desc: 'Precise palpation and neurological reflex tests to trace spinal nerve irritation.' },
      { step: '02', title: 'Decompression & Relief', desc: 'Gentle traction, heat therapy, and electro-myostimulation to relax tight spinal erectors.' },
      { step: '03', title: 'Core Strengthening', desc: 'Neutral-spine stabilization drills that build internal muscular support.' },
      { step: '04', title: 'Ergonomic Adaptation', desc: 'Desk posture setup, sleeping pillow adjustments, and safe lifting ergonomics.' }
    ],
    faqs: [
      { q: 'Can physiotherapy help avoid spine surgery for disc bulge?', a: 'In over 85% of lumbar disc bulge cases, structured physiotherapy and core stabilization effectively eliminate symptoms and prevent the need for surgical intervention.' },
      { q: 'Will I be given exercises to do at home?', a: 'Yes, your therapist will prescribe 3 to 4 easy, safe spinal decompression movements illustrated in our patient app.' }
    ]
  },
  {
    id: 'joint-pain-arthritis',
    title: 'Joint Pain & Arthritis Care',
    tagline: 'Advanced non-surgical cartilage preservation, joint decompression, and pain relief.',
    shortDesc: 'Specialized therapy for knee osteoarthritis, hip stiffness, and joint mobility.',
    fullDesc: 'Tailored for individuals suffering from knee osteoarthritis (OA), frozen shoulder (adhesive capsulitis), rheumatoid stiffness, and hip impingement. We employ joint traction, gentle glides, ultrasound phonophoresis, and low-impact quadricep/glute strengthening to restore fluid joint motion.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '5 - 8 Sessions Recommended',
    rating: 4.88,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-joint.jpg',
    category: 'Joint Care',
    expert: {
      name: 'Dr. Pallabi Goswami, PT',
      degree: 'BPT, MPT (Orthopedic Rehabilitation)',
      experience: '8+ Years Experience',
      hospital: 'ZESTMED Joint Restoration Clinic, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Non-Surgical Osteoarthritis Cartilage Preservation',
      'Knee Capsular Glides & Range Enhancement',
      'Frozen Shoulder Multi-Axis Stretching Protocol',
      'Therapeutic Ultrasound for Deep Synovial Relief',
      'Joint Offloading & Assistive Gait Training'
    ],
    conditionsTreated: [
      'Grade 1 to 3 Knee Osteoarthritis',
      'Frozen Shoulder (Adhesive Capsulitis)',
      'Hip Joint Bursitis & Labral Strain',
      'Rheumatoid Joint Morning Rigidity',
      'Ankle Sprains & Chronic Instability'
    ],
    process: [
      { step: '01', title: 'Joint Girth & ROM Assessment', desc: 'Goniometric joint angle measurement and fluid swelling assessment.' },
      { step: '02', title: 'Capsular Mobilization', desc: 'Gentle manual distraction to widen the joint space and stimulate synovial lubrication.' },
      { step: '03', title: 'Closed-Kinetic Drills', desc: 'Isometric quad sets, bridging, and resistance band stabilization without joint load.' },
      { step: '04', title: 'Gait Re-Education', desc: 'Balanced walking pattern correction to prevent excessive pressure on unaffected joints.' }
    ],
    faqs: [
      { q: 'Is it painful to do physiotherapy with arthritis?', a: 'No. Our therapists prioritize pain-free range of motion techniques and gentle modalities that soothe inflammation rather than aggravate it.' }
    ]
  },
  {
    id: 'sports-injury',
    title: 'Sports Injury Rehabilitation',
    tagline: 'High-performance recovery for athletes and fitness enthusiasts.',
    shortDesc: 'Rapid recovery from ligament sprains, muscle tears, and athletic conditioning.',
    fullDesc: 'Accelerated protocols for ACL/PCL tears, hamstring pulls, meniscus tears, tennis elbow, and rotator cuff strains. We combine cryo-compression, eccentric loading, plyometrics, and functional agility drills to return you to your peak sport performance safely.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '4 - 8 Sessions Recommended',
    rating: 4.95,
    reviewCount: 290,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-sports.jpg',
    category: 'Sports Medicine',
    expert: {
      name: 'Dr. Jayanta Barman, PT',
      degree: 'BPT, MPT (Sports Rehabilitation & Manual Therapy)',
      experience: '12+ Years Experience',
      hospital: 'ZESTMED Sports Medicine & Athletic Lab, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Sports Specific Return-to-Play Testing & Milestones',
      'ACL Pre-hab & Post-operative Graft Conditioning',
      'Kinesio Taping for Dynamic Muscle Stability',
      'Eccentric Tendon Loading for Chronic Tendinitis',
      'Proprioception & Reactive Balance Training'
    ],
    conditionsTreated: [
      'ACL, PCL, and Meniscus Tears',
      'Rotator Cuff Tears & Impingement',
      'Tennis Elbow & Golfer’s Elbow',
      'Ankle Inversion Sprains & Achilles Tendinitis',
      'Hamstring, Groin & Calf Muscle Strains'
    ],
    process: [
      { step: '01', title: 'Functional Sport Screen', desc: 'Isokinetic power tests, hop testing, and movement biomechanics screening.' },
      { step: '02', title: 'Inflammation Control', desc: 'Cryo-therapy, IFT, and targeted lymphatic drainage.' },
      { step: '03', title: 'Dynamic Strength', desc: 'Progressive load bearing, eccentric loading, and plyometrics.' },
      { step: '04', title: 'Return-to-Play', desc: 'Sport-specific drills, agility ladders, and re-injury prevention protocols.' }
    ],
    faqs: [
      { q: 'How soon after a sports injury should I start physiotherapy?', a: 'Within 24 to 48 hours for acute sprains once major fractures are ruled out. Early intervention prevents compensatory stiffness and accelerates tissue remodeling.' }
    ]
  },
  {
    id: 'post-surgery-rehab',
    title: 'Post-Surgery Rehabilitation',
    tagline: 'Safe, milestone-based recovery following orthopedic and general surgeries.',
    shortDesc: 'Structured recovery for joint replacements, spine surgeries, and fractures.',
    fullDesc: 'Comprehensive post-surgical rehabilitation following Total Knee Replacement (TKR), Total Hip Replacement (THR), arthroscopic ACL repairs, fracture ORIF, and spinal laminectomies. We focus on scar tissue mobilization, progressive weight-bearing, edema control, and functional independence.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '8 - 12 Sessions Recommended',
    rating: 4.97,
    reviewCount: 360,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-surgery.jpg',
    category: 'Post-Op Recovery',
    expert: {
      name: 'Dr. Debabrat Saikia, PT',
      degree: 'BPT, MPT (Neuro & Orthopedic Rehab), MIAP',
      experience: '10+ Years Experience',
      hospital: 'ZESTMED Post-Surgical Recovery Wing, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Strict Adherence to Surgeon-Prescribed Rehabilitation Protocols',
      'Continuous Passive Motion (CPM) & Swelling Management',
      'Safe Transition from Walker to Cane to Independent Walking',
      'Scar Tissue Desensitization & Cross-Fiber Friction',
      'Stair Climbing & Real-Life Functional Re-integration'
    ],
    conditionsTreated: [
      'Total Knee & Hip Arthroplasty (TKR / THR)',
      'Fracture Fixation & Plaster Cast Removal Stiffness',
      'Spine Decompression & Microdiscectomy Recovery',
      'Shoulder Hemiarthroplasty & Tendon Repair'
    ],
    process: [
      { step: '01', title: 'Surgical Protocol Alignment', desc: 'Thorough review of discharge summary and surgeon weight-bearing guidelines.' },
      { step: '02', title: 'Circulation & Swelling', desc: 'Ankle pumps, compression wrap guidance, and gentle passive ROM.' },
      { step: '03', title: 'Active Muscle Awakening', desc: 'Neuromuscular electrical stimulation (NMES) to re-engage inhibited muscles.' },
      { step: '04', title: 'Independent Mobility', desc: 'Stair training, balance drills, and unassisted walking confidence.' }
    ],
    faqs: [
      { q: 'Can the therapist come to my home right after hospital discharge?', a: 'Yes! Our home visit team specializes in bed-bound and immediate post-discharge rehabilitation to save patients from hospital travel.' }
    ]
  },
  {
    id: 'elderly-care',
    title: 'Elderly Care & Fall Prevention',
    tagline: 'Gentle, empowering geriatric physiotherapy for graceful, confident aging.',
    shortDesc: 'Gentle mobility exercises, gait retraining, and balance support for seniors.',
    fullDesc: 'Specially created for seniors facing age-related sarcopenia, balance instability, fear of falling, Parkinson’s, and generalized weakness. Our compassionate geriatric physiotherapists deliver seated or supported exercises, vestibular balance retraining, and home hazard modifications.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '6 - 10 Sessions Recommended',
    rating: 4.98,
    reviewCount: 450,
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-elderly.jpg',
    category: 'Geriatric Care',
    expert: {
      name: 'Dr. Debabrat Saikia, PT',
      degree: 'BPT, MPT, Specialist in Geriatric Care',
      experience: '10+ Years Experience',
      hospital: 'ZESTMED Senior Care Center, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Comprehensive Fall Risk & Balance Deficit Assessment',
      'Gentle Weight-Bearing & Anti-Gravity Muscle Activation',
      'Confidence Rebuilding & Safe Bed-to-Chair Transfers',
      'Parkinson’s Rhythm & Big Movement Training',
      'Home Safety Evaluation & Grab-Bar Recommendation'
    ],
    conditionsTreated: [
      'Age-Related Frailty & Sarcopenia',
      'Loss of Balance & Frequent Near-Falls',
      'Parkinson’s Disease Gait Freezing',
      'Post-Fall Fear & Bedridden Deconditioning',
      'Generalized Joint Stiffness & Reduced Walking Stamina'
    ],
    process: [
      { step: '01', title: 'Berg Balance Testing', desc: 'Standardized balance scoring and environmental hazard assessment.' },
      { step: '02', title: 'Gentle Joint Rhythms', desc: 'Seated range exercises, ankle circles, and light resistance bands.' },
      { step: '03', title: 'Gait Stabilization', desc: 'Tandem stance, stepping drills, and posture alignment.' },
      { step: '04', title: 'Daily Living Ease', desc: 'Transfer practices, bathroom safety, and stamina maintenance.' }
    ],
    faqs: [
      { q: 'Is home visit recommended for senior citizens?', a: 'Highly recommended! Familiar home surroundings reduce fall anxiety and allow the therapist to optimize real-world walking paths and chairs.' }
    ]
  },
  {
    id: 'posture-ergonomics',
    title: 'Posture & Ergonomic Correction',
    tagline: 'Undo the toll of desk work, tech neck, and spinal misalignment.',
    shortDesc: 'Correction of rounded shoulders, tech-neck, and desk-related strain.',
    fullDesc: 'Tailored for corporate professionals, students, and remote workers struggling with forward head posture, rounded shoulders, upper crossed syndrome, and chronic work fatigue. We pair myofascial chest opening with scapular retractor strengthening and comprehensive workstation ergonomic adjustments.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '3 - 5 Sessions Recommended',
    rating: 4.89,
    reviewCount: 275,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-posture.jpg',
    category: 'Spine & Posture',
    expert: {
      name: 'Dr. Pallabi Goswami, PT',
      degree: 'BPT, Ergonomic Certified Specialist',
      experience: '8+ Years Experience',
      hospital: 'ZESTMED Ergonomic & Posture Clinic, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Digital Photogrammetric Posture Analysis',
      'Pectoral & Suboccipital Muscle Release',
      'Deep Neck Flexor & Lower Trapezius Activation',
      'Individualized Workstation Ergonomic Blueprint',
      'Micro-Break Habit Counseling for Desk Workers'
    ],
    conditionsTreated: [
      'Tech Neck (Cervicogenic Headache)',
      'Rounded Shoulders & Kyphosis',
      'Upper Crossed Syndrome & Shoulder Blade Burning',
      'Thoracic Spine Stiffness & Shallow Breathing',
      'Repetitive Mouse & Keyboard Strain'
    ],
    process: [
      { step: '01', title: 'Posture Photography', desc: 'Plumb-line alignment measurement from anterior and lateral views.' },
      { step: '02', title: 'Tight Muscle Release', desc: 'Manual chest wall opening and suboccipital release.' },
      { step: '03', title: 'Scapular Re-education', desc: 'Scapular setting, chin tucks, and thoracic extension drills.' },
      { step: '04', title: 'Desk Setup Guide', desc: 'Screen height, chair lumbar support, and keyboard alignment recommendations.' }
    ],
    faqs: [
      { q: 'Can posture be corrected in adults?', a: 'Yes! Postural muscles adapt quickly to targeted strengthening and conscious ergonomic adjustments, resulting in significant pain reduction in weeks.' }
    ]
  },
  {
    id: 'neuro-rehab',
    title: 'Neurological Rehabilitation',
    tagline: 'Neuro-plasticity driven therapy for stroke, paralysis, and nerve conditions.',
    shortDesc: 'Neuro-physiotherapy for stroke recovery, Parkinson’s, paralysis, and neuropathy.',
    fullDesc: 'Intensive rehabilitation based on the Bobath and PNF (Proprioceptive Neuromuscular Facilitation) concepts for individuals recovering from ischemic/hemorrhagic stroke, hemiplegia, Bell’s palsy, Guillain-Barré syndrome (GBS), and spinal cord injuries. Focused on stimulating neuro-plasticity and functional recovery.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '10 - 20 Sessions Recommended',
    rating: 4.96,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-surgery.jpg',
    category: 'Neurological Care',
    expert: {
      name: 'Dr. Debabrat Saikia, PT',
      degree: 'BPT, MPT (Neuro-Physiotherapy), MIAP',
      experience: '10+ Years Experience',
      hospital: 'ZESTMED Neuro Rehabilitation Division, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Neuro-Plasticity Stimulation & Task-Oriented Training',
      'Spasticity Reduction via Sustained Inhibitory Stretching',
      'Functional Electrical Stimulation (FES) for Foot Drop',
      'Trunk Control, Bed Mobility & Transfer Re-education',
      'Fine Motor Hand Dexterity & Grasp Rehabilitation'
    ],
    conditionsTreated: [
      'Stroke Hemiplegia & Hemiparesis',
      'Bell’s Palsy (Facial Nerve Paralysis)',
      'Parkinson’s Disease Tremors & Rigidity',
      'Guillain-Barré Syndrome (GBS) Recovery',
      'Peripheral Neuropathy & Foot Drop'
    ],
    process: [
      { step: '01', title: 'Neurological Reflex Mapping', desc: 'Tone evaluation (Modified Ashworth Scale) and voluntary motor control check.' },
      { step: '02', title: 'Spasticity Control', desc: 'Inhibitory positioning, cryo-stimulation, and prolonged muscle elongation.' },
      { step: '03', title: 'Task-Oriented Drills', desc: 'Repetitive goal-directed movements that re-wire brain pathways.' },
      { step: '04', title: 'Caregiver Education', desc: 'Safe family-assisted transfer techniques and home positioning.' }
    ],
    faqs: [
      { q: 'Is it too late to start stroke rehabilitation after several months?', a: 'While early rehabilitation yields the quickest gains, neuro-plasticity continues throughout life. Significant functional milestones can still be achieved months after stroke.' }
    ]
  },
  {
    id: 'cardiopulmonary',
    title: 'Cardiopulmonary & Chest Therapy',
    tagline: 'Enhance lung capacity, clear bronchial airways, and rebuild cardiac stamina.',
    shortDesc: 'Breathing exercises, endurance recovery, and lung capacity improvement.',
    fullDesc: 'Dedicated pulmonary and cardiac rehabilitation for patients recovering from pneumonia, COPD, asthma, post-COVID fibrosis, or CABG heart surgeries. Combining postural drainage, chest percussions, incentive spirometry, and sub-maximal endurance training under continuous pulse-oximetry monitoring.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '4 - 8 Sessions Recommended',
    rating: 4.91,
    reviewCount: 195,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-back.jpg',
    category: 'Pulmonary & Cardiac',
    expert: {
      name: 'Dr. Arindam Borah, MPT',
      degree: 'BPT, MPT, Cardiopulmonary Certified',
      experience: '11+ Years Experience',
      hospital: 'ZESTMED Cardiopulmonary Care Center, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Active Cycle of Breathing Techniques (ACBT)',
      'Postural Drainage & Chest Wall Percussions',
      'Incentive Spirometry Guided Lung Volumetric Expansion',
      'Diaphragmatic & Pursed-Lip Breathing Drills',
      'Graded 6-Minute Walk Test Endurance Conditioning'
    ],
    conditionsTreated: [
      'Chronic Obstructive Pulmonary Disease (COPD)',
      'Post-COVID-19 Respiratory Fatigue & Fibrosis',
      'Bronchial Secretion Retention & Bronchiectasis',
      'Post-CABG Cardiac Conditioning',
      'Asthma & Shallow Hyperventilation Patterns'
    ],
    process: [
      { step: '01', title: 'Chest Auscultation', desc: 'Stethoscope lung sound analysis and baseline SpO2 monitoring.' },
      { step: '02', title: 'Airway Clearance', desc: 'Vibrations, percussions, and huffing techniques to eliminate trapped phlegm.' },
      { step: '03', title: 'Diaphragmatic Training', desc: 'Strengthening the diaphragm muscle to reduce breathless fatigue.' },
      { step: '04', title: 'Aerobic Pacing', desc: 'Monitored step and cycling training tailored to cardiovascular thresholds.' }
    ],
    faqs: [
      { q: 'Can chest physiotherapy help my chronic cough and phlegm?', a: 'Yes! ACBT and gentle chest percussion help mobilize deep bronchial mucus into the upper airway where it can be cleared easily.' }
    ]
  },
  {
    id: 'pediatric',
    title: 'Pediatric Physiotherapy',
    tagline: 'Nurturing, play-based physical therapy for children to thrive and grow strong.',
    shortDesc: 'Developmental milestone therapy for children, posture, and motor coordination.',
    fullDesc: 'Gentle, play-based physical rehabilitation for infants, toddlers, and adolescents facing delayed motor milestones (crawling/walking), congenital muscular torticollis, cerebral palsy, clubfoot rehabilitation, and developmental coordination disorder (DCD). Conducted in a comforting, child-friendly atmosphere.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '6 - 12 Sessions Recommended',
    rating: 4.95,
    reviewCount: 220,
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-sports.jpg',
    category: 'Pediatric Care',
    expert: {
      name: 'Dr. Pallabi Goswami, PT',
      degree: 'BPT, Pediatric Rehab Specialist',
      experience: '8+ Years Experience',
      hospital: 'ZESTMED Pediatric Wellness Clinic, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Play-Based Milestone Acceleration (Rolling, Sitting, Standing)',
      'Congenital Muscular Torticollis Gentle Neck Stretching',
      'Sensory-Motor Integration & Proprioceptive Drills',
      'Orthotic & Splinting Consultation',
      'Comprehensive Home Play Strategies for Parents'
    ],
    conditionsTreated: [
      'Gross Motor Developmental Delays',
      'Infant Torticollis & Plagiocephaly (Flat Head)',
      'Cerebral Palsy Spasticity & Motor Function',
      'Clubfoot Post-Casting Rehabilitation',
      'Toe Walking & Flat Feet (Pes Planus)'
    ],
    process: [
      { step: '01', title: 'Developmental Screening', desc: 'Evaluating gross motor milestones against age-standardized scales.' },
      { step: '02', title: 'Playful Therapy', desc: 'Fun balance beam, therapy ball, and obstacle courses designed for kids.' },
      { step: '03', title: 'Muscle Tone Balancing', desc: 'Inhibiting spastic reflexes while activating postural muscles.' },
      { step: '04', title: 'Parent Coaching', desc: 'Practical holding, feeding, and play postures to practice at home.' }
    ],
    faqs: [
      { q: 'Will my child cry during physiotherapy?', a: 'Our pediatric sessions are structured around joyful play, toys, and songs so children look forward to each appointment without fear.' }
    ]
  },
  {
    id: 'womens-health',
    title: 'Women’s Health & Prenatal Care',
    tagline: 'Specialized physical care for pregnancy, postpartum, and pelvic floor vitality.',
    shortDesc: 'Pelvic floor conditioning, prenatal back pain relief, and postpartum recovery.',
    fullDesc: 'Tailored specifically for women navigating prenatal joint laxity, sacroiliac (SI) joint pain during pregnancy, postpartum diastasis recti (abdominal separation), and pelvic floor weakness or stress urinary incontinence. Safe, confidential, and scientifically guided.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '4 - 6 Sessions Recommended',
    rating: 4.97,
    reviewCount: 340,
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-elderly.jpg',
    category: "Women's Health",
    expert: {
      name: 'Dr. Pallabi Goswami, PT',
      degree: 'BPT, MPT, Women’s Health Certified',
      experience: '8+ Years Experience',
      hospital: 'ZESTMED Women’s Health Unit, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Safe Trimester-Specific Prenatal Exercise Programs',
      'Diastasis Recti Abdominal Wall Rehabilitation',
      'Pelvic Floor Muscle Biofeedback & Strengthening',
      'Pregnancy Sacroiliac (SI) Joint Support & Taping',
      'Post-Cesarean & Normal Delivery Reconditioning'
    ],
    conditionsTreated: [
      'Pregnancy Low Back & Pelvic Girdle Pain (PGP)',
      'Postpartum Abdominal Muscle Separation (Diastasis Recti)',
      'Stress Urinary Incontinence & Pelvic Organ Prolapse',
      'C-Section Scar Adhesions & Core Inhibition',
      'Sciatic Nerve Pain During 2nd & 3rd Trimesters'
    ],
    process: [
      { step: '01', title: 'Private Consultation', desc: 'Detailed history, posture analysis, and diastasis recti caliper check.' },
      { step: '02', title: 'Pelvic Floor Activation', desc: 'Guided core-pelvic co-contraction and pressure regulation exercises.' },
      { step: '03', title: 'Spine & Hip Relief', desc: 'Side-lying joint mobilization and safe prenatal myofascial release.' },
      { step: '04', title: 'Postnatal Restoration', desc: 'Graded progressive exercise plan for a safe return to fitness.' }
    ],
    faqs: [
      { q: 'Is physiotherapy safe during pregnancy?', a: 'Yes! Our certified women’s health physiotherapists use trimester-safe protocols that ease labor preparation and alleviate spine pressure.' }
    ]
  },
  {
    id: 'dry-needling',
    title: 'Myofascial Trigger Point Therapy',
    tagline: 'Deep muscular knot release using clinical dry needling and cupping therapy.',
    shortDesc: 'Deep tissue therapy, cupping, and dry needling for stubborn muscular knots.',
    fullDesc: 'Targeted clinical intervention for chronic muscular knots, myofascial pain syndrome, and stubborn tension in the traps, calves, piriformis, and shoulder blades. Uses sterile filament needles to elicit a local twitch response, instantly deactivating pain points and restoring muscle elasticity.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '2 - 4 Sessions Recommended',
    rating: 4.93,
    reviewCount: 280,
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-joint.jpg',
    category: 'Advanced Modality',
    expert: {
      name: 'Dr. Rituraj Deka, PT',
      degree: 'BPT, MIAP, Dry Needling & Cupping Certified',
      experience: '9+ Years Experience',
      hospital: 'ZESTMED Advanced Myofascial Lab, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Rapid Inactivation of Painful Myofascial Trigger Points',
      'Immediate Neuromuscular Relaxation & Blood Circulation Boost',
      'Dynamic Dry Cupping for Fascial Adhesion Release',
      'Zero Medication Pain Relief with Lasting Effects',
      'Post-Needling Muscle Elongation & Mobility Integration'
    ],
    conditionsTreated: [
      'Myofascial Pain Syndrome & Fibromyalgia Knots',
      'Chronic Trapezius Spasm & Tension Migraines',
      'Piriformis Syndrome (Buttock Deep Ache)',
      'Tennis Elbow & Calf Cramp Trigger Points',
      'Iliotibial (IT) Band Tightness in Runners'
    ],
    process: [
      { step: '01', title: 'Taut Band Palpation', desc: 'Precision manual identification of hyperirritable muscular nodules.' },
      { step: '02', title: 'Sterile Needling', desc: 'Insertion of hair-thin monofilament needles to release intramuscular tension.' },
      { step: '03', title: 'Cupping & Heat', desc: 'Negative pressure decompressive cupping to flood tissue with nutrient-rich blood.' },
      { step: '04', title: 'Stretch & Restore', desc: 'Guided active elongation of the released muscle group.' }
    ],
    faqs: [
      { q: 'Is dry needling the same as acupuncture?', a: 'No. While both use sterile thin needles, dry needling is based on Western anatomical trigger points and neuromuscular biomechanics rather than traditional energy meridians.' }
    ]
  },
  {
    id: 'strength-conditioning',
    title: 'Strength & Functional Conditioning',
    tagline: 'Bridge the gap between injury rehabilitation and peak physical fitness.',
    shortDesc: 'Therapeutic resistance training to restore muscle mass, core, and stamina.',
    fullDesc: 'Tailored for individuals ready to progress beyond basic rehabilitation into high-level functional resilience. Using free weights, resistance bands, kettlebells, and functional movement patterns to build injury-proof joints, athletic stamina, and permanent muscular balance.',
    price: 1200,
    mrp: 1600,
    discount: '25% OFF',
    duration: '60 mins',
    sessionTypes: ['In-Clinic Session', 'At-Home Session'],
    recommendedSessions: '6 - 12 Sessions Recommended',
    rating: 4.94,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-posture.jpg',
    category: 'Functional Fitness',
    expert: {
      name: 'Dr. Jayanta Barman, PT',
      degree: 'BPT, MPT, Certified Strength & Conditioning Specialist (CSCS)',
      experience: '12+ Years Experience',
      hospital: 'ZESTMED Functional Performance Lab, Guwahati',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    },
    keyBenefits: [
      'Scientific 1-on-1 Movement Quality & Kinetic Chain Screen',
      'Hypertrophy & Neuromuscular Coordination Protocols',
      'Joint-Safe Multi-Planar Resistance Training',
      'Cardio-Respiratory Conditioning Without Joint Stress',
      'Long-Term Injury Prevention & Longevity Blueprint'
    ],
    conditionsTreated: [
      'Post-Rehabilitation Deconditioning & Muscle Loss',
      'Desk Worker Generalised Muscle Weakness',
      'Running Form Flaws & Kinetic Imbalances',
      'Core Hypo-mobility & Poor Lifting Mechanics',
      'Age-Related Sarcopenia in Active Adults'
    ],
    process: [
      { step: '01', title: 'Functional Movement Screen', desc: 'Evaluating squats, lunges, pushes, and pulls for subtle biomechanical leaks.' },
      { step: '02', title: 'Targeted Activation', desc: 'Isolating weak stabilizers (gluteus medius, rotator cuff, transverse abdominis).' },
      { step: '03', title: 'Compound Strength', desc: 'Progressive overload using therapeutic kettlebell and resistance band drills.' },
      { step: '04', title: 'Longevity Plan', desc: 'Personalized training manual tailored to personal fitness and work goals.' }
    ],
    faqs: [
      { q: 'Is this suitable if I have never worked out with weights before?', a: 'Absolutely. Every program is calibrated from beginner level with constant 1-on-1 supervision by your clinical physiotherapist.' }
    ]
  }
];

export function getPhysioServiceById(id) {
  if (!id) return ALL_PHYSIO_SERVICES[0];
  const normalized = id.toLowerCase().trim();
  return (
    ALL_PHYSIO_SERVICES.find(s => s.id === normalized) ||
    ALL_PHYSIO_SERVICES.find(s => s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(normalized)) ||
    ALL_PHYSIO_SERVICES[0]
  );
}
