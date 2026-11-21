import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_DOCTORS, matchesSpecialty } from '../mock-data/doctorsData';
import { getAuthenticatedUser, getAuthToken } from '../utils/authGuard';

/**
 * ==============================================================================
 * ZESTMED SUPABASE POSTGRESQL DATABASE SERVICE
 * ==============================================================================
 * Connects the frontend application directly to Supabase PostgreSQL database tables.
 * Provides resilient data operations with local caching and offline fallback.
 * ==============================================================================
 */

// Helper to normalize 10-digit phone number
export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

// Helper to safely read from localStorage
const getLocalData = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`[SupabaseService] Error reading local key "${key}":`, err);
    return fallback;
  }
};

// Helper to safely write to localStorage
const setLocalData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[SupabaseService] Error writing local key "${key}":`, err);
  }
};

// ------------------------------------------------------------------------------
// 1. PATIENT PROFILES
// ------------------------------------------------------------------------------

export const getPatientProfile = async (phone) => {
  if (!phone) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] profiles fetch error, using local fallback:', err);
    }
  }

  // Local fallback
  const registry = getLocalData('zestmed_patient_registry', {});
  return registry[phone] || null;
};

export const savePatientProfile = async (profileData) => {
  if (!profileData || !profileData.phone) return null;

  // Always update local cache
  const registry = getLocalData('zestmed_patient_registry', {});
  registry[profileData.phone] = {
    ...registry[profileData.phone],
    ...profileData,
    updated_at: new Date().toISOString(),
  };
  setLocalData('zestmed_patient_registry', registry);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            phone: profileData.phone,
            full_name: profileData.name || profileData.full_name,
            email: profileData.email || null,
            age: profileData.age ? parseInt(profileData.age, 10) : null,
            gender: profileData.gender || null,
            blood_group: profileData.blood_group || null,
            address: profileData.address || null,
            city: profileData.city || 'Guwahati',
            state: profileData.state || 'Assam',
            pincode: profileData.pincode || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'phone' }
        )
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] save profile to Supabase failed:', err);
    }
  }

  return registry[profileData.phone];
};

export const getAllPatients = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] getAllPatients error:', err);
    }
  }

  return getLocalData('zestmed_admin_patients', []);
};

// ------------------------------------------------------------------------------
// 2. DOCTOR APPOINTMENTS
// ------------------------------------------------------------------------------

export const getDoctorAppointments = async (phone = null) => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('doctor_appointments').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', phone);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] getDoctorAppointments error:', err);
    }
  }

  const all = getLocalData('patient_appointments', []);
  const doctorOnly = all.filter((a) => !a.isPhysio && !a.isSurgery && !a.isWellness);
  if (phone) {
    return doctorOnly.filter((a) => a.phone === phone);
  }
  return doctorOnly;
};

export const bookDoctorAppointment = async (appointmentData) => {
  const authUser = getAuthenticatedUser();
  if (!authUser) {
    throw new Error('AUTHENTICATION_REQUIRED: Mandatory login is required before booking a doctor appointment.');
  }

  // Sync with protected Node.js API endpoint
  try {
    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/bookings/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(appointmentData)
      }).catch(() => {});
    }
  } catch (_) {}

  const localList = getLocalData('patient_appointments', []);
  const resolvedPhone = appointmentData.phone || appointmentData.patientPhone || '';
  const newAppointment = {
    ...appointmentData,
    phone: resolvedPhone,
    patientPhone: resolvedPhone,
    id: appointmentData.id || `DOC-${Date.now()}`,
    appointment_number: appointmentData.appointment_number || `DOC-${Date.now()}`,
    created_at: appointmentData.createdAt || new Date().toISOString(),
    status: appointmentData.status || 'Confirmed',
  };

  setLocalData('patient_appointments', [newAppointment, ...localList]);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('doctor_appointments')
        .insert([
          {
            appointment_number: newAppointment.appointment_number,
            patient_name: newAppointment.patientName || newAppointment.patient_name,
            phone: resolvedPhone,
            doctor_name: newAppointment.doctorName || newAppointment.doctor_name,
            department: newAppointment.department || newAppointment.specialty || 'General Medicine',
            appointment_date: newAppointment.date || newAppointment.appointment_date,
            appointment_time: newAppointment.time || newAppointment.appointment_time,
            consultation_type: newAppointment.type || newAppointment.mode || 'Clinic Visit',
            fees: parseFloat(newAppointment.fees || newAppointment.fee || 500),
            status: newAppointment.status,
            notes: newAppointment.notes || newAppointment.symptoms || null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] bookDoctorAppointment to Supabase error:', err);
    }
  }

  return newAppointment;
};

export const updateDoctorAppointmentStatus = async (id, status) => {
  // Update local
  const all = getLocalData('patient_appointments', []);
  const updated = all.map((a) => (a.id === id || a.appointment_number === id ? { ...a, status } : a));
  setLocalData('patient_appointments', updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('doctor_appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},appointment_number.eq.${id}`);
    } catch (err) {
      console.warn('[SupabaseService] updateDoctorAppointmentStatus error:', err);
    }
  }

  return true;
};

// ------------------------------------------------------------------------------
// 2B. VERIFIED SPECIALIST DOCTORS (DATABASE + CACHED REGISTRY)
// ------------------------------------------------------------------------------

export const getDoctors = async (specialtyFilter = null) => {
  let doctors = [];

  // 1. Fetch from Supabase PostgreSQL database if available
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('doctors').select('*');
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        doctors = data.map((d) => ({
          id: d.id ? String(d.id) : `doc-${d.doctor_id || Math.random()}`,
          name: d.name || d.full_name || d.doctor_name,
          degree: d.degree || d.qualification || 'MBBS',
          specialty: d.specialty || d.department || d.specialization || 'General Physician',
          specialization: d.specialization || d.specialty || d.department,
          department: d.department || d.specialty,
          designation: d.designation || d.specialty,
          experience: d.experience ? (String(d.experience).includes('Yr') ? d.experience : `${d.experience}+ Yrs Experience`) : '10+ Yrs Experience',
          hospital: d.hospital || d.clinic || 'Zestmed Polyclinic Hub',
          rating: d.rating || '★ 4.9 (900+ reviews)',
          ratingScore: d.rating_score || d.ratingScore || 4.9,
          reviewsCount: d.reviews_count || d.reviewsCount || '900+',
          fee: d.fee || d.consultation_fee || d.fees || 600,
          nextSlot: d.next_slot || d.nextSlot || 'Today, 04:30 PM',
          modes: d.modes || (Array.isArray(d.consultation_modes) ? d.consultation_modes : ['Clinic Visit', 'Online Consultation']),
          avatar: d.avatar || d.image_url || '/doctor-amit-sharma.jpg',
          bio: d.bio || ''
        }));
      }
    } catch (err) {
      console.warn('[SupabaseService] getDoctors from Supabase error:', err);
    }
  }

  // 2. Resilient local fallback / cached verified registry
  if (!doctors || doctors.length === 0) {
    const cached = getLocalData('zestmed_doctors_cache', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      // Merge with verified doctor registry to guarantee 100% complete attributes
      doctors = cached.map((d) => {
        const base = MOCK_DOCTORS.find(m => m.id === d.id || m.name.toLowerCase() === (d.name || '').toLowerCase()) || {};
        return {
          ...base,
          ...d,
          designation: d.designation || base.designation || `Senior Consultant • ${d.specialty || base.specialty}`,
          experience: d.experience || base.experience || '10+ Yrs Experience',
          fee: d.fee || base.fee || 600,
          hospital: d.hospital || base.hospital || 'Zestmed Polyclinic & Diagnostic Hub, GS Road',
          bio: d.bio || base.bio || '',
          nextSlot: d.nextSlot || base.nextSlot || 'Today, 04:30 PM'
        };
      });
    } else {
      doctors = MOCK_DOCTORS;
      setLocalData('zestmed_doctors_cache', MOCK_DOCTORS);
    }
  }

  // 3. Filter by specialty if specified
  if (specialtyFilter && specialtyFilter !== 'All' && specialtyFilter !== 'All Specialties') {
    return doctors.filter((doc) => matchesSpecialty(doc, specialtyFilter));
  }

  return doctors;
};

export const getDoctorById = async (id) => {
  const allDocs = await getDoctors();
  return allDocs.find((d) => String(d.id) === String(id)) || null;
};

// ------------------------------------------------------------------------------
// 3. PHYSIOTHERAPY BOOKINGS
// ------------------------------------------------------------------------------

export const getPhysioBookings = async (phone = null) => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('physiotherapy_bookings').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', phone);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] getPhysioBookings error:', err);
    }
  }

  const all = getLocalData('patient_appointments', []);
  const physioOnly = all.filter((a) => a.isPhysio);
  if (phone) {
    return physioOnly.filter((a) => a.phone === phone);
  }
  return physioOnly;
};

export const bookPhysiotherapy = async (physioData) => {
  const authUser = getAuthenticatedUser();
  if (!authUser) {
    throw new Error('AUTHENTICATION_REQUIRED: Mandatory login is required before booking a physiotherapy session.');
  }

  // Sync with protected Node.js API endpoint
  try {
    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/bookings/physiotherapy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(physioData)
      }).catch(() => {});
    }
  } catch (_) {}

  const localList = getLocalData('patient_appointments', []);
  const resolvedPhone = physioData.phone || physioData.patientPhone || physioData.mobileNumber || '';
  const newBooking = {
    ...physioData,
    phone: resolvedPhone,
    patientPhone: resolvedPhone,
    isPhysio: true,
    id: physioData.id || `PHY-${Date.now()}`,
    booking_number: physioData.booking_number || `PHY-${Date.now()}`,
    created_at: physioData.createdAt || new Date().toISOString(),
    status: physioData.status || 'Confirmed',
  };

  setLocalData('patient_appointments', [newBooking, ...localList]);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('physiotherapy_bookings')
        .insert([
          {
            booking_number: newBooking.booking_number,
            patient_name: newBooking.patientName || newBooking.patient_name,
            phone: resolvedPhone,
            condition: newBooking.condition || newBooking.serviceName || newBooking.specialty || 'Physiotherapy Session',
            service_type: newBooking.service_type || newBooking.mode || 'Home Visit',
            booking_date: newBooking.date || newBooking.booking_date,
            preferred_slot: newBooking.time || newBooking.preferred_slot,
            fees: parseFloat(newBooking.fees || newBooking.price || newBooking.fee || 799),
            address: newBooking.address || null,
            status: newBooking.status,
            notes: newBooking.notes || newBooking.symptoms || null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] bookPhysiotherapy to Supabase error:', err);
    }
  }

  return newBooking;
};

export const updatePhysioStatus = async (id, status) => {
  const all = getLocalData('patient_appointments', []);
  const updated = all.map((a) => (a.id === id || a.booking_number === id ? { ...a, status } : a));
  setLocalData('patient_appointments', updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('physiotherapy_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},booking_number.eq.${id}`);
    } catch (err) {
      console.warn('[SupabaseService] updatePhysioStatus error:', err);
    }
  }

  return true;
};

// ------------------------------------------------------------------------------
// 4. SURGERY PACKAGES
// ------------------------------------------------------------------------------

export const getSurgeryBookings = async (phone = null) => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('surgery_bookings').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', phone);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] getSurgeryBookings error:', err);
    }
  }

  const all = getLocalData('patient_appointments', []);
  const surgeryOnly = all.filter((a) => a.isSurgery);
  if (phone) {
    return surgeryOnly.filter((a) => a.phone === phone);
  }
  return surgeryOnly;
};

export const bookSurgery = async (surgeryData) => {
  const authUser = getAuthenticatedUser();
  if (!authUser) {
    throw new Error('AUTHENTICATION_REQUIRED: Mandatory login is required before booking a surgery package.');
  }

  // Sync with protected Node.js API endpoint
  try {
    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/bookings/surgery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(surgeryData)
      }).catch(() => {});
    }
  } catch (_) {}

  const localList = getLocalData('patient_appointments', []);
  const resolvedPhone = surgeryData.phone || surgeryData.patientPhone || '';
  const newBooking = {
    ...surgeryData,
    phone: resolvedPhone,
    patientPhone: resolvedPhone,
    isSurgery: true,
    id: surgeryData.id || `SUR-${Date.now()}`,
    booking_number: surgeryData.booking_number || `SUR-${Date.now()}`,
    created_at: surgeryData.createdAt || new Date().toISOString(),
    status: surgeryData.status || 'Consultation Scheduled',
  };

  setLocalData('patient_appointments', [newBooking, ...localList]);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('surgery_bookings')
        .insert([
          {
            booking_number: newBooking.booking_number,
            patient_name: newBooking.patientName || newBooking.patient_name,
            phone: resolvedPhone,
            surgery_name: newBooking.doctorName || newBooking.surgery_name || newBooking.title,
            hospital_preference: newBooking.hospital_preference || newBooking.hospital || 'ZestMed SuperSpecialty Center',
            preferred_date: newBooking.date || newBooking.preferred_date,
            price: parseFloat(newBooking.fees || newBooking.price || 0),
            status: newBooking.status,
            notes: newBooking.notes || newBooking.symptoms || null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] bookSurgery to Supabase error:', err);
    }
  }

  return newBooking;
};

export const updateSurgeryStatus = async (id, status) => {
  const all = getLocalData('patient_appointments', []);
  const updated = all.map((a) => (a.id === id || a.booking_number === id ? { ...a, status } : a));
  setLocalData('patient_appointments', updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('surgery_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},booking_number.eq.${id}`);
    } catch (err) {
      console.warn('[SupabaseService] updateSurgeryStatus error:', err);
    }
  }

  return true;
};

// ------------------------------------------------------------------------------
// 5. WELLNESS PACKAGES
// ------------------------------------------------------------------------------

export const getWellnessBookings = async (phone = null) => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('wellness_bookings').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', phone);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] getWellnessBookings error:', err);
    }
  }

  const all = getLocalData('patient_appointments', []);
  const wellnessOnly = all.filter((a) => a.isWellness);
  if (phone) {
    return wellnessOnly.filter((a) => a.phone === phone);
  }
  return wellnessOnly;
};

export const bookWellness = async (wellnessData) => {
  const authUser = getAuthenticatedUser();
  if (!authUser) {
    throw new Error('AUTHENTICATION_REQUIRED: Mandatory login is required before booking a wellness package.');
  }

  // Sync with protected Node.js API endpoint
  try {
    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/bookings/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(wellnessData)
      }).catch(() => {});
    }
  } catch (_) {}

  const localList = getLocalData('patient_appointments', []);
  const resolvedPhone = wellnessData.phone || wellnessData.patientPhone || '';
  const newBooking = {
    ...wellnessData,
    phone: resolvedPhone,
    patientPhone: resolvedPhone,
    isWellness: true,
    id: wellnessData.id || `WEL-${Date.now()}`,
    booking_number: wellnessData.booking_number || `WEL-${Date.now()}`,
    created_at: wellnessData.createdAt || new Date().toISOString(),
    status: wellnessData.status || 'Confirmed',
  };

  setLocalData('patient_appointments', [newBooking, ...localList]);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('wellness_bookings')
        .insert([
          {
            booking_number: newBooking.booking_number,
            patient_name: newBooking.patientName || newBooking.patient_name,
            phone: resolvedPhone,
            package_name: newBooking.doctorName || newBooking.package_name || newBooking.title,
            booking_date: newBooking.date || newBooking.booking_date,
            preferred_slot: newBooking.time || newBooking.preferred_slot || 'Morning (09:00 AM)',
            price: parseFloat(newBooking.fees || newBooking.price || 0),
            status: newBooking.status,
            notes: newBooking.notes || null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] bookWellness to Supabase error:', err);
    }
  }

  return newBooking;
};

export const updateWellnessStatus = async (id, status) => {
  const all = getLocalData('patient_appointments', []);
  const updated = all.map((a) => (a.id === id || a.booking_number === id ? { ...a, status } : a));
  setLocalData('patient_appointments', updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('wellness_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},booking_number.eq.${id}`);
    } catch (err) {
      console.warn('[SupabaseService] updateWellnessStatus error:', err);
    }
  }

  return true;
};

// ------------------------------------------------------------------------------
// 6. DIAGNOSTIC / LAB BOOKINGS
// ------------------------------------------------------------------------------

export const getLabBookings = async (phone = null) => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('test_bookings').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', phone);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] getLabBookings error:', err);
    }
  }

  const all = getLocalData('zestmed_patient_lab_bookings', []);
  if (phone) {
    return all.filter((b) => b.phone === phone);
  }
  return all;
};

export const bookLabTest = async (bookingData) => {
  const authUser = getAuthenticatedUser();
  if (!authUser) {
    throw new Error('AUTHENTICATION_REQUIRED: Mandatory login is required before booking a diagnostic lab test.');
  }

  // Sync with protected Node.js API endpoint
  try {
    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/bookings/lab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bookingData)
      }).catch(() => {});
    }
  } catch (_) {}

  const localList = getLocalData('zestmed_patient_lab_bookings', []);
  const resolvedPhone = bookingData.phone || bookingData.patientPhone || bookingData.contactNumber || '';
  const newBooking = {
    ...bookingData,
    phone: resolvedPhone,
    patientPhone: resolvedPhone,
    id: bookingData.id || `LAB-${Date.now()}`,
    booking_number: bookingData.booking_number || `LAB-${Date.now()}`,
    created_at: bookingData.createdAt || new Date().toISOString(),
    status: bookingData.status || 'Pending Collection',
  };

  setLocalData('zestmed_patient_lab_bookings', [newBooking, ...localList]);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('test_bookings')
        .insert([
          {
            booking_number: newBooking.booking_number,
            patient_name: newBooking.patientName || newBooking.patient_name,
            phone: resolvedPhone,
            test_name: newBooking.testName || newBooking.test_name,
            sample_type: newBooking.sampleType || newBooking.sample_type || 'Blood',
            collection_address: newBooking.address || newBooking.collectionAddress || newBooking.collection_address || 'Guwahati',
            collection_date: newBooking.date || newBooking.collection_date,
            collection_slot: newBooking.time || newBooking.timeSlot || newBooking.collection_slot || '08:00 AM - 10:00 AM',
            price: parseFloat(newBooking.price || 0),
            status: newBooking.status,
            phlebotomist: newBooking.phlebotomist?.name || newBooking.phlebotomist || 'Rajib Barman',
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] bookLabTest to Supabase error:', err);
    }
  }

  return newBooking;
};

export const updateLabBookingStatus = async (id, status) => {
  const all = getLocalData('zestmed_patient_lab_bookings', []);
  const updated = all.map((b) => (b.id === id || b.booking_number === id ? { ...b, status } : b));
  setLocalData('zestmed_patient_lab_bookings', updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('test_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},booking_number.eq.${id}`);
    } catch (err) {
      console.warn('[SupabaseService] updateLabBookingStatus error:', err);
    }
  }

  return true;
};

// ------------------------------------------------------------------------------
// 7. MEDICINE ORDERS
// ------------------------------------------------------------------------------

export const getMedicineOrders = async (phone = null) => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', phone);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] getMedicineOrders error:', err);
    }
  }

  const all = getLocalData('zestmed_patient_orders', []);
  if (phone) {
    return all.filter((o) => o.phone === phone);
  }
  return all;
};

export const placeMedicineOrder = async (orderData) => {
  const authUser = getAuthenticatedUser();
  if (!authUser) {
    throw new Error('AUTHENTICATION_REQUIRED: Mandatory login is required before placing a medicine order.');
  }

  // Sync with protected Node.js API endpoint
  try {
    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/orders/medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderData)
      }).catch(() => {});
    }
  } catch (_) {}

  const localList = getLocalData('zestmed_patient_orders', []);
  const resolvedPhone = orderData.phone || orderData.patientPhone || '';
  const newOrder = {
    ...orderData,
    phone: resolvedPhone,
    patientPhone: resolvedPhone,
    id: orderData.id || `ORD-${Date.now()}`,
    order_number: orderData.order_number || `ORD-${Date.now()}`,
    created_at: orderData.createdAt || new Date().toISOString(),
    status: orderData.status || 'Processing',
  };

  setLocalData('zestmed_patient_orders', [newOrder, ...localList]);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            order_number: newOrder.order_number,
            patient_name: newOrder.patientName || newOrder.patient_name || 'Verified Patient',
            phone: resolvedPhone,
            delivery_address: newOrder.deliveryAddress || newOrder.delivery_address || 'Guwahati, Assam',
            subtotal: parseFloat(newOrder.subtotal || newOrder.total || 0),
            discount: parseFloat(newOrder.discount || 0),
            delivery_fee: parseFloat(newOrder.deliveryFee || 0),
            total_amount: parseFloat(newOrder.total || newOrder.total_amount || 0),
            payment_status: newOrder.paymentStatus || newOrder.paymentMethod || 'Paid (COD)',
            payment_method: newOrder.paymentMethod || 'Cash on Delivery',
            order_status: newOrder.status,
            items: newOrder.items || [],
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] placeMedicineOrder to Supabase error:', err);
    }
  }

  return newOrder;
};

export const updateOrderStatus = async (id, status) => {
  const all = getLocalData('zestmed_patient_orders', []);
  const updated = all.map((o) => (o.id === id || o.order_number === id ? { ...o, status } : o));
  setLocalData('zestmed_patient_orders', updated);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('orders')
        .update({ order_status: status, updated_at: new Date().toISOString() })
        .or(`id.eq.${id},order_number.eq.${id}`);
    } catch (err) {
      console.warn('[SupabaseService] updateOrderStatus error:', err);
    }
  }

  return true;
};

// ------------------------------------------------------------------------------
// 8. LAB EXECUTIVES
// ------------------------------------------------------------------------------

export const getLabExecutives = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('lab_executives')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] getLabExecutives error:', err);
    }
  }

  return getLocalData('zestmed_executives', []);
};

export const addLabExecutive = async (execData) => {
  const localList = getLocalData('zestmed_executives', []);
  const newExec = {
    ...execData,
    id: execData.id || `LE-${Date.now()}`,
    employee_id: execData.employee_id || `LE-${Math.floor(1000 + Math.random() * 9000)}`,
    created_at: new Date().toISOString(),
  };

  setLocalData('zestmed_executives', [newExec, ...localList]);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('lab_executives')
        .insert([
          {
            employee_id: newExec.employee_id,
            full_name: newExec.full_name || newExec.name,
            phone: newExec.phone,
            hub_city: newExec.hub_city || 'Guwahati',
            operating_zone: newExec.operating_zone || 'Dispur Hub',
            vehicle_number: newExec.vehicle_number || 'AS-01',
            cold_box_telemetry: newExec.cold_box_telemetry || '3.8°C',
            certification: newExec.certification || 'NABL Certified Phlebotomist',
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] addLabExecutive error:', err);
    }
  }

  return newExec;
};

// ------------------------------------------------------------------------------
// 9. INQUIRIES & CONTACT
// ------------------------------------------------------------------------------

export const submitInquiry = async (inquiryData) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('inquiries').insert([inquiryData]).select().single();
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[SupabaseService] submitInquiry error:', err);
    }
  }

  const list = getLocalData('zestmed_inquiries', []);
  const newInq = { ...inquiryData, id: `INQ-${Date.now()}`, created_at: new Date().toISOString() };
  setLocalData('zestmed_inquiries', [newInq, ...list]);
  return newInq;
};

// ------------------------------------------------------------------------------
// 10. UNIFIED USER BOOKINGS (Fetch Real Database Records for Logged-In User)
// ------------------------------------------------------------------------------

export const getUserBookings = async (user) => {
  if (!user) return [];

  const rawPhone = user.phone || user.contact || '';
  const cleanPhone = normalizePhone(rawPhone);
  const userName = (user.name || '').trim();
  const userId = user.id || '';
  const userEmail = (user.email || '').trim().toLowerCase();

  const isMatchingUser = (item) => {
    if (!item) return false;
    const itemPhone = normalizePhone(item.phone || item.patientPhone || item.patient_phone || item.contact || item.contactNumber || '');
    if (cleanPhone && itemPhone && cleanPhone === itemPhone) return true;
    if (userId && item.userId && userId === item.userId) return true;
    if (userName && userName !== 'Verified Patient' && !userName.startsWith('Patient') && userName !== 'Self') {
      const itemPatientName = (item.patientName || item.patient_name || item.name || '').toLowerCase();
      if (itemPatientName.includes(userName.toLowerCase())) return true;
    }
    if (userEmail && item.userEmail && item.userEmail.toLowerCase() === userEmail) return true;
    return false;
  };

  const allResults = [];
  const seenIds = new Set();

  // 1. Fetch from Supabase PostgreSQL tables if configured
  if (isSupabaseConfigured()) {
    try {
      const phoneFilter = cleanPhone ? `phone.ilike.%${cleanPhone}%` : null;
      const nameFilter = (userName && userName !== 'Verified Patient' && !userName.startsWith('Patient') && userName !== 'Self')
        ? `patient_name.ilike.%${userName}%`
        : null;

      const filterClause = [phoneFilter, nameFilter].filter(Boolean).join(',');

      if (filterClause) {
        const [docsRes, physioRes, surgRes, wellRes, labsRes, ordersRes] = await Promise.allSettled([
          supabase.from('doctor_appointments').select('*').or(filterClause).order('created_at', { ascending: false }),
          supabase.from('physiotherapy_bookings').select('*').or(filterClause).order('created_at', { ascending: false }),
          supabase.from('surgery_bookings').select('*').or(filterClause).order('created_at', { ascending: false }),
          supabase.from('wellness_bookings').select('*').or(filterClause).order('created_at', { ascending: false }),
          supabase.from('test_bookings').select('*').or(filterClause).order('created_at', { ascending: false }),
          supabase.from('orders').select('*').or(filterClause).order('created_at', { ascending: false }),
        ]);

        if (docsRes.status === 'fulfilled' && Array.isArray(docsRes.value.data)) {
          docsRes.value.data.forEach((d) => {
            const bId = d.appointment_number || d.id;
            if (!seenIds.has(String(bId))) {
              seenIds.add(String(bId));
              allResults.push({
                id: bId,
                bookingId: bId,
                serviceType: 'Doctor Appointment',
                itemType: 'doctor',
                displayType: 'Doctor Appointment',
                serviceName: d.doctor_name ? `${d.doctor_name}${d.department ? ` (${d.department})` : ''}` : 'Doctor Consultation',
                title: d.doctor_name || 'Doctor Appointment',
                provider: d.doctor_name,
                department: d.department,
                bookingDateTime: d.created_at || new Date().toISOString(),
                createdAt: d.created_at || new Date().toISOString(),
                appointmentDate: d.appointment_date || 'Scheduled Date',
                appointmentTime: d.appointment_time || 'Clinic Slot',
                date: d.appointment_date || 'Scheduled Date',
                time: d.appointment_time || 'Clinic Slot',
                mode: d.consultation_type || 'Clinic Visit',
                paymentStatus: d.payment_status || 'Paid (Online / At Clinic)',
                bookingStatus: d.status || 'Confirmed',
                status: d.status || 'Confirmed',
                totalAmount: parseFloat(d.fees || 600),
                price: parseFloat(d.fees || 600),
                patientName: d.patient_name || userName || 'Self',
                phone: d.phone || rawPhone,
                notes: d.notes,
                source: 'database',
              });
            }
          });
        }

        if (physioRes.status === 'fulfilled' && Array.isArray(physioRes.value.data)) {
          physioRes.value.data.forEach((p) => {
            const bId = p.booking_number || p.id;
            if (!seenIds.has(String(bId))) {
              seenIds.add(String(bId));
              allResults.push({
                id: bId,
                bookingId: bId,
                serviceType: 'Physiotherapy',
                itemType: 'physiotherapy',
                displayType: 'Physiotherapy Session',
                serviceName: p.condition || 'Physiotherapy Rehabilitation',
                title: p.condition || 'Physiotherapy Session',
                provider: 'Certified Clinical Physiotherapist',
                bookingDateTime: p.created_at || new Date().toISOString(),
                createdAt: p.created_at || new Date().toISOString(),
                appointmentDate: p.booking_date || 'Scheduled Date',
                appointmentTime: p.preferred_slot || 'Session Slot',
                date: p.booking_date || 'Scheduled Date',
                time: p.preferred_slot || 'Session Slot',
                mode: p.service_type || 'Home / Clinic Visit',
                location: p.address || 'Guwahati Center',
                paymentStatus: p.payment_status || 'Paid (Online / At Clinic)',
                bookingStatus: p.status || 'Confirmed',
                status: p.status || 'Confirmed',
                totalAmount: parseFloat(p.fees || 850),
                price: parseFloat(p.fees || 850),
                patientName: p.patient_name || userName || 'Self',
                phone: p.phone || rawPhone,
                notes: p.notes,
                source: 'database',
              });
            }
          });
        }

        if (surgRes.status === 'fulfilled' && Array.isArray(surgRes.value.data)) {
          surgRes.value.data.forEach((s) => {
            const bId = s.booking_number || s.id;
            if (!seenIds.has(String(bId))) {
              seenIds.add(String(bId));
              allResults.push({
                id: bId,
                bookingId: bId,
                serviceType: 'Surgery Package',
                itemType: 'surgery',
                displayType: 'Surgery Package Evaluation',
                serviceName: s.surgery_name || 'Surgery Consultation Package',
                title: s.surgery_name || 'Surgery Package',
                provider: 'Senior Surgeon & Care Lead',
                bookingDateTime: s.created_at || new Date().toISOString(),
                createdAt: s.created_at || new Date().toISOString(),
                appointmentDate: s.preferred_date || 'Consultation Date',
                appointmentTime: 'Hospital Evaluation Slot',
                date: s.preferred_date || 'Consultation Date',
                time: 'Hospital Evaluation Slot',
                mode: 'Hospital Visit',
                location: s.hospital_preference || 'ZestMed SuperSpecialty Center',
                hospital: s.hospital_preference || 'ZestMed SuperSpecialty Center',
                paymentStatus: s.payment_status || 'Consultation Reserved',
                bookingStatus: s.status || 'Confirmed',
                status: s.status || 'Confirmed',
                totalAmount: parseFloat(s.price || 0),
                price: parseFloat(s.price || 0),
                patientName: s.patient_name || userName || 'Self',
                phone: s.phone || rawPhone,
                notes: s.notes,
                source: 'database',
              });
            }
          });
        }

        if (wellRes.status === 'fulfilled' && Array.isArray(wellRes.value.data)) {
          wellRes.value.data.forEach((w) => {
            const bId = w.booking_number || w.id;
            if (!seenIds.has(String(bId))) {
              seenIds.add(String(bId));
              allResults.push({
                id: bId,
                bookingId: bId,
                serviceType: 'Wellness Package',
                itemType: 'wellness',
                displayType: 'Wellness Health Package',
                serviceName: w.package_name || 'Wellness Health Package',
                title: w.package_name || 'Wellness Package',
                provider: 'Preventive Health Diagnostics Team',
                bookingDateTime: w.created_at || new Date().toISOString(),
                createdAt: w.created_at || new Date().toISOString(),
                appointmentDate: w.booking_date || 'Scheduled Date',
                appointmentTime: w.preferred_slot || 'Morning Slot',
                date: w.booking_date || 'Scheduled Date',
                time: w.preferred_slot || 'Morning Slot',
                mode: 'Home Health Checkup',
                paymentStatus: w.payment_status || 'Paid (Verified)',
                bookingStatus: w.status || 'Confirmed',
                status: w.status || 'Confirmed',
                totalAmount: parseFloat(w.price || 0),
                price: parseFloat(w.price || 0),
                patientName: w.patient_name || userName || 'Self',
                phone: w.phone || rawPhone,
                notes: w.notes,
                source: 'database',
              });
            }
          });
        }

        if (labsRes.status === 'fulfilled' && Array.isArray(labsRes.value.data)) {
          labsRes.value.data.forEach((l) => {
            const bId = l.booking_number || l.id;
            if (!seenIds.has(String(bId))) {
              seenIds.add(String(bId));
              allResults.push({
                id: bId,
                bookingId: bId,
                serviceType: 'Lab Test',
                itemType: 'lab',
                displayType: 'Diagnostic Lab Test',
                serviceName: l.test_name || 'Diagnostic Laboratory Test',
                title: l.test_name || 'Diagnostic Lab Test',
                specimen: l.sample_type || 'Blood Sample (NABL Certified)',
                provider: l.phlebotomist || 'Bikash Das (Phlebotomist)',
                bookingDateTime: l.created_at || new Date().toISOString(),
                createdAt: l.created_at || new Date().toISOString(),
                appointmentDate: l.collection_date || 'Scheduled Date',
                appointmentTime: l.collection_slot || 'Morning Collection',
                date: l.collection_date || 'Scheduled Date',
                time: l.collection_slot || 'Morning Collection',
                mode: 'Home Sample Collection',
                location: l.collection_address || 'Guwahati Hub',
                collectionAddress: l.collection_address || 'Guwahati Hub',
                paymentStatus: l.payment_status || 'Paid (Online / At Collection)',
                bookingStatus: l.status || 'Confirmed',
                status: l.status || 'Confirmed',
                totalAmount: parseFloat(l.price || 499),
                price: parseFloat(l.price || 499),
                patientName: l.patient_name || userName || 'Self',
                phone: l.phone || rawPhone,
                source: 'database',
              });
            }
          });
        }

        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data)) {
          ordersRes.value.data.forEach((o) => {
            const bId = o.order_number || o.id;
            if (!seenIds.has(String(bId))) {
              seenIds.add(String(bId));
              const itemNames = Array.isArray(o.items) && o.items.length > 0
                ? o.items.map((i) => i.name).filter(Boolean).join(', ')
                : 'Prescription Medicines';
              const isWellness = itemNames.toLowerCase().includes('wellness') || itemNames.toLowerCase().includes('package');
              allResults.push({
                id: bId,
                bookingId: bId,
                serviceType: isWellness ? 'Wellness Package' : 'Medicine Order',
                itemType: isWellness ? 'wellness' : 'medicine',
                displayType: isWellness ? 'Wellness Health Package' : 'Pharmacy Medicine Order',
                serviceName: itemNames,
                title: itemNames,
                items: o.items || [],
                provider: 'Zestmed Certified Pharma Hub',
                bookingDateTime: o.created_at || new Date().toISOString(),
                createdAt: o.created_at || new Date().toISOString(),
                appointmentDate: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
                appointmentTime: 'Express Delivery Hub',
                date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
                time: 'Doorstep Delivery',
                mode: 'Express Home Delivery',
                location: o.delivery_address || 'Guwahati, Assam',
                deliveryAddress: o.delivery_address || 'Guwahati, Assam',
                paymentStatus: o.payment_status || o.payment_method || 'Paid (COD / Online)',
                bookingStatus: o.order_status || o.status || 'Processing',
                status: o.order_status || o.status || 'Processing',
                totalAmount: parseFloat(o.total_amount || 0),
                price: parseFloat(o.total_amount || 0),
                patientName: o.patient_name || userName || 'Self',
                phone: o.phone || rawPhone,
                source: 'database',
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('[SupabaseService] getUserBookings Supabase query error:', err);
    }
  }

  // 2. Fetch and merge user-specific persistent records from local storage
  const localTransactions = getLocalData('zestmed_payment_transactions', []);
  const localAppts = getLocalData('patient_appointments', []).filter(isMatchingUser);
  const localLabs = getLocalData('zestmed_patient_lab_bookings', []).filter(isMatchingUser);
  const localOrders = getLocalData('zestmed_patient_orders', []).filter(isMatchingUser);

  localAppts.forEach((a) => {
    const bId = a.bookingId || a.id;
    if (!seenIds.has(String(bId))) {
      seenIds.add(String(bId));
      const cat = (a.category || a.type || '').toLowerCase();
      let sType = 'Doctor Appointment';
      let iType = 'doctor';
      if (a.isPhysio || cat.includes('physio')) {
        sType = 'Physiotherapy';
        iType = 'physiotherapy';
      } else if (a.isSurgery || cat.includes('surgery')) {
        sType = 'Surgery Package';
        iType = 'surgery';
      } else if (a.isWellness || cat.includes('wellness')) {
        sType = 'Wellness Package';
        iType = 'wellness';
      }

      // Check payment ledger in case appointment was paid via UPI / Razorpay
      const matchedTxn = localTransactions.find(t => 
        (t.booking_id && String(t.booking_id) === String(bId)) ||
        (t.bookingId && String(t.bookingId) === String(bId)) ||
        (a.paymentId && t.razorpay_payment_id && t.razorpay_payment_id === a.paymentId)
      );

      let resolvedPaymentStatus = a.paymentStatus || 'Paid (Verified)';
      let resolvedPaymentMethod = a.paymentMethod || 'Pay at Clinic Desk';

      if (matchedTxn && (matchedTxn.payment_status === 'Success' || matchedTxn.status === 'Success')) {
        resolvedPaymentStatus = 'Paid (UPI / Razorpay Verified)';
        resolvedPaymentMethod = matchedTxn.payment_method || 'Razorpay (UPI - Verified)';
      } else if (a.paymentId && a.paymentId !== 'PAY_AT_CLINIC' && a.paymentId !== 'clinic') {
        resolvedPaymentStatus = 'Paid (UPI / Razorpay Verified)';
        resolvedPaymentMethod = a.paymentMethod && !a.paymentMethod.includes('Clinic') ? a.paymentMethod : 'Razorpay (UPI - Verified)';
      }

      allResults.push({
        id: bId,
        bookingId: bId,
        serviceType: sType,
        itemType: iType,
        displayType: sType,
        serviceName: a.title || a.doctorName || a.specialty || sType,
        title: a.title || a.doctorName || sType,
        provider: a.doctor || a.doctorName || a.therapist || a.careManager,
        department: a.specialty || a.department,
        bookingDateTime: a.createdAt || new Date().toISOString(),
        createdAt: a.createdAt || new Date().toISOString(),
        appointmentDate: a.date || 'Scheduled Date',
        appointmentTime: a.time || a.slot || 'Standard Slot',
        date: a.date || 'Scheduled Date',
        time: a.time || a.slot || 'Standard Slot',
        mode: a.mode || (iType === 'doctor' ? 'Clinic Visit' : 'Home / Clinic Visit'),
        location: a.hospital || a.location || 'Zestmed Center, Guwahati',
        hospital: a.hospital,
        paymentStatus: resolvedPaymentStatus,
        paymentMethod: resolvedPaymentMethod,
        paymentId: a.paymentId || matchedTxn?.razorpay_payment_id || matchedTxn?.paymentId || '',
        orderId: a.orderId || matchedTxn?.razorpay_order_id || matchedTxn?.orderId || '',
        bookingStatus: a.status || 'Confirmed',
        status: a.status || 'Confirmed',
        totalAmount: parseFloat(a.price || a.fee || a.fees || 0),
        price: parseFloat(a.price || a.fee || a.fees || 0),
        patientName: a.patientName || userName || 'Self',
        phone: a.patientPhone || a.phone || rawPhone,
        notes: a.symptoms || a.notes,
        source: 'local',
      });
    }
  });

  localLabs.forEach((l) => {
    const bId = l.bookingId || l.id;
    if (!seenIds.has(String(bId))) {
      seenIds.add(String(bId));
      const isWellness = (l.category || l.type || '').toLowerCase().includes('wellness');
      const sType = isWellness ? 'Wellness Package' : 'Lab Test';
      const iType = isWellness ? 'wellness' : 'lab';

      allResults.push({
        id: bId,
        bookingId: bId,
        serviceType: sType,
        itemType: iType,
        displayType: sType,
        serviceName: l.testName || l.name || sType,
        title: l.testName || l.name || sType,
        specimen: l.specimen || 'Blood / Serum Sample (Barcoded)',
        provider: l.phlebotomist?.name || l.phlebotomist || 'Bikash Das (Phlebotomist)',
        bookingDateTime: l.createdAt || l.bookedDate || new Date().toISOString(),
        createdAt: l.createdAt || l.bookedDate || new Date().toISOString(),
        appointmentDate: l.date || l.collectionDate || 'Scheduled Date',
        appointmentTime: l.time || 'Morning Sample Collection',
        date: l.date || l.collectionDate || 'Scheduled Date',
        time: l.time || 'Morning Sample Collection',
        mode: l.collectionAddress ? 'Home Sample Collection' : 'Lab Visit',
        location: l.collectionAddress || 'Guwahati Hub',
        collectionAddress: l.collectionAddress || 'Guwahati Hub',
        paymentStatus: l.paymentStatus || 'Paid (Verified)',
        bookingStatus: l.status || 'Confirmed',
        status: l.status || 'Confirmed',
        totalAmount: parseFloat(l.price || 499),
        price: parseFloat(l.price || 499),
        patientName: l.patientName || userName || 'Self',
        phone: l.phone || l.patientPhone || rawPhone,
        reportData: l.reportData,
        source: 'local',
      });
    }
  });

  localOrders.forEach((o) => {
    const bId = o.id || o.order_number;
    if (!seenIds.has(String(bId))) {
      seenIds.add(String(bId));
      const itemNames = Array.isArray(o.items) && o.items.length > 0
        ? o.items.map((i) => i.name).filter(Boolean).join(', ')
        : 'Prescription Medicines';
      const isWellness = itemNames.toLowerCase().includes('wellness') || itemNames.toLowerCase().includes('package');

      allResults.push({
        id: bId,
        bookingId: bId,
        serviceType: isWellness ? 'Wellness Package' : 'Medicine Order',
        itemType: isWellness ? 'wellness' : 'medicine',
        displayType: isWellness ? 'Wellness Health Package' : 'Medicine Order',
        serviceName: itemNames,
        title: itemNames,
        items: o.items || [],
        provider: 'Zestmed Certified Pharmacy Hub',
        bookingDateTime: o.createdAt || (o.date ? `${o.date} ${o.time || ''}` : new Date().toISOString()),
        createdAt: o.createdAt || new Date().toISOString(),
        appointmentDate: o.date || 'Today',
        appointmentTime: o.time || 'Express Delivery',
        date: o.date || 'Today',
        time: o.time || 'Express Delivery',
        mode: 'Doorstep Delivery',
        location: o.deliveryAddress || 'Guwahati, Assam',
        deliveryAddress: o.deliveryAddress || 'Guwahati, Assam',
        paymentStatus: o.paymentMethod || o.payment_status || 'Paid (Verified)',
        bookingStatus: o.status || o.order_status || 'Processing',
        status: o.status || o.order_status || 'Processing',
        totalAmount: parseFloat(o.totalAmount || o.total || 0),
        price: parseFloat(o.totalAmount || o.total || 0),
        patientName: o.patientName || userName || 'Self',
        phone: o.phone || rawPhone,
        source: 'local',
      });
    }
  });

  // Sort by booking date time descending (most recent first)
  return allResults.sort((a, b) => {
    const timeA = new Date(a.bookingDateTime || a.createdAt || 0).getTime();
    const timeB = new Date(b.bookingDateTime || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
};

// ------------------------------------------------------------------------------
// 8. RAZORPAY PAYMENT TRANSACTIONS & BOOKING LINKAGE
// ------------------------------------------------------------------------------

export const savePaymentTransaction = async (paymentData) => {
  if (!paymentData) return null;

  const user = getAuthenticatedUser();
  const paymentId = paymentData.paymentId || paymentData.razorpay_payment_id || `pay_${Date.now()}`;
  const orderId = paymentData.orderId || paymentData.razorpay_order_id || `order_${Date.now()}`;
  const paymentMethod = paymentData.paymentMethod || 'Razorpay (UPI - Verified)';
  const paymentStatus = paymentData.payment_status || paymentData.status || 'Success';

  const transactionRecord = {
    id: paymentData.transactionId || `txn_${Date.now()}`,
    transaction_id: paymentData.transactionId || `txn_${Date.now()}`,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: paymentData.signature || paymentData.razorpay_signature || '',
    paymentId,
    orderId,
    amount: Number(paymentData.amount) || 0,
    currency: paymentData.currency || 'INR',
    payment_status: paymentStatus,
    booking_id: paymentData.bookingId || '',
    bookingId: paymentData.bookingId || '',
    booking_type: paymentData.bookingType || 'general',
    customer_name: paymentData.customerName || user?.name || 'Patient',
    customer_phone: paymentData.customerPhone || user?.phone || user?.contact || '',
    payment_method: paymentMethod,
    created_at: new Date().toISOString()
  };

  // 1. Save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('payments').insert([transactionRecord]);
    } catch (err) {
      console.warn('[SupabaseService] savePaymentTransaction error:', err);
    }
  }

  // 2. Local resilient ledger
  const transactions = getLocalData('zestmed_payment_transactions', []);
  transactions.unshift(transactionRecord);
  setLocalData('zestmed_payment_transactions', transactions);

  // 3. Update the corresponding booking's payment status
  await updateBookingPaymentStatus(
    paymentData.bookingId,
    paymentData.bookingType,
    {
      paymentStatus: 'Paid (UPI / Razorpay Verified)',
      paymentMethod,
      paymentId,
      orderId,
      transactionId: transactionRecord.id
    }
  );

  return transactionRecord;
};

export const updateBookingPaymentStatus = async (bookingId, bookingType, paymentDetails = {}) => {
  if (!bookingId) return false;

  const paymentId = paymentDetails.paymentId || paymentDetails.razorpay_payment_id || '';
  const orderId = paymentDetails.orderId || paymentDetails.razorpay_order_id || '';
  const paymentMethod = paymentDetails.paymentMethod || 'Razorpay (UPI - Verified)';
  const paymentStatus = paymentDetails.paymentStatus || 'Paid (UPI / Razorpay Verified)';

  const updateFields = {
    payment_status: paymentStatus,
    payment_id: paymentId,
    payment_method: paymentMethod
  };

  // 1. Supabase update
  if (isSupabaseConfigured()) {
    try {
      let table = 'orders';
      let idCol = 'order_number';
      if (bookingType === 'doctor') { table = 'doctor_appointments'; idCol = 'appointment_number'; }
      else if (bookingType === 'surgery') { table = 'surgery_bookings'; idCol = 'booking_number'; }
      else if (bookingType === 'physio') { table = 'physiotherapy_bookings'; idCol = 'booking_number'; }
      else if (bookingType === 'lab_test') { table = 'test_bookings'; idCol = 'booking_number'; }
      else if (bookingType === 'wellness') { table = 'wellness_bookings'; idCol = 'booking_number'; }

      await supabase.from(table).update(updateFields).eq(idCol, bookingId);
    } catch (err) {
      console.warn('[SupabaseService] updateBookingPaymentStatus error:', err);
    }
  }

  // 2. Local cache updates across all registries including patient appointments
  const registries = [
    'patient_appointments',
    'zestmed_patient_lab_bookings',
    'zestmed_doctor_appointments',
    'zestmed_physio_appointments',
    'zestmed_surgery_bookings',
    'zestmed_wellness_bookings',
    'zestmed_lab_test_bookings',
    'zestmed_medicine_orders',
    'zestmed_patient_orders'
  ];

  registries.forEach(key => {
    const list = getLocalData(key, []);
    let modified = false;
    const updatedList = list.map(item => {
      const bId = String(item.id || item.bookingId || item.appointment_number || item.orderNumber || item.booking_number || '');
      if (bId === String(bookingId)) {
        modified = true;
        return {
          ...item,
          paymentStatus,
          paymentMethod,
          paymentId: paymentId || item.paymentId,
          orderId: orderId || item.orderId
        };
      }
      return item;
    });
    if (modified) {
      setLocalData(key, updatedList);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zestmed_booking_updated'));
  }

  return true;
};

export const getPaymentTransactions = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (_) {}
  }

  return getLocalData('zestmed_payment_transactions', []);
};
