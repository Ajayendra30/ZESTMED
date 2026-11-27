import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MOCK_DOCTORS, matchesSpecialty } from '../mock-data/doctorsData';
import { WELLNESS_PACKAGES_DATA } from '../mock-data/wellnessPackagesData';
import { getAuthenticatedUser, getAuthToken } from '../utils/authGuard';
import { isLabTestOrPackage, isWellnessPackage } from '../utils/itemClassification';

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

/**
 * Detects whether a booking, appointment, or order record is a mock/demo/sample record
 * that must be purged and excluded from genuine user and admin views.
 */
export const isDemoBooking = (item) => {
  if (!item) return false;
  const name = String(item.patientName || item.patient_name || item.customer || item.customer_name || item.name || '').trim().toLowerCase();
  const id = String(item.id || item.bookingId || item.booking_number || item.orderId || item.order_number || item.appointment_number || '').trim();
  const status = String(item.status || item.bookingStatus || item.order_status || '').trim().toLowerCase();

  if (
    name.includes('[demo') ||
    name.includes('demo') ||
    name.includes('dummy') ||
    name.includes('sample') ||
    name === 'rahul verma' ||
    name === 'priya sharma' ||
    name === 'amit verma' ||
    name === 'sneha singh' ||
    name === 'rajesh kumar'
  ) {
    return true;
  }
  if (status.includes('[demo') || (status === 'cancelled' && name.includes('[demo'))) {
    return true;
  }

  // Pre-existing test IDs created during testing/demo phases
  const knownDemoIds = new Set([
    'ASM-DX-781005-8961',
    'ZM-PHY-20261124-169',
    'ZM-DOC-50124',
    'ZM-PHY-78901',
    'ZM-DOC-9732-7390',
    'ZM-DOC-1194-1169',
    'ZM-DOC-2134-5162',
    'ZM-DOC-2338-2708',
    'ZM-PHY-76119',
    'ZM-PHY-20261124-201',
    'ZM-PHY-20261124-445',
    'ZM-PHY-20261124-377',
    'ZM20261124001',
    'bfbc70f5-3324-4d6d-a53a-38a41dd3a1e2',
    'dec8fbf8-715e-418c-930f-117e0e2c6380',
    'b7c8a82c-8aba-4da3-b8e4-384d3a52975e',
    '94d39daa-6ad5-4541-8396-7258ff7131e3',
    'adfffc0f-cddc-4eaf-8064-479e1424ca9a',
    '866a4687-75de-4be2-bc6c-6732d36f4610',
    '68a6dfc5-a53b-4db8-bcb4-8e648ece924e',
    '8ad8ab39-145d-4f1f-a022-71ab8d6bcbcd',
    'd0b67f83-21ff-4cd2-9aac-4ef02aab08d6'
  ]);
  if (knownDemoIds.has(id)) {
    return true;
  }

  if (
    /^ZM-(ORD|LAB|JOB)-781001-/.test(id) ||
    /^ZM-ORD-2026-(9045|8812)/.test(id) ||
    /^#?LB1023[1-4]/.test(id) ||
    /^#?ORD1023[1-4]/.test(id)
  ) {
    return true;
  }
  return false;
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

/**
 * Enforces database-level phone number uniqueness:
 * Checks whether the given phone is already bound to another profile id.
 */
export const checkDatabasePhoneUniqueness = async (phone, currentUserId = null) => {
  const clean = normalizePhone(phone);
  if (!clean) return { isUnique: true };

  if (isSupabaseConfigured()) {
    try {
      const query = supabase
        .from('profiles')
        .select('id, phone, full_name')
        .eq('phone', clean);

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        // If currentUserId is passed, ensure it is the same user
        if (currentUserId && data.some((p) => p.id === currentUserId)) {
          return { isUnique: true, existingProfile: data[0] };
        }
        return { isUnique: false, existingProfile: data[0] };
      }
    } catch (err) {
      console.warn('[SupabaseService] checkDatabasePhoneUniqueness error:', err);
    }
  }

  // Check local registry uniqueness
  const registry = getLocalData('zestmed_patient_registry', {});
  const existing = registry[clean];
  if (existing) {
    if (currentUserId && existing.id === currentUserId) {
      return { isUnique: true, existingProfile: existing };
    }
    return { isUnique: false, existingProfile: existing };
  }

  return { isUnique: true, existingProfile: null };
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

/**
 * Permanently deletes a patient profile from Supabase PostgreSQL and local storage.
 * Also registers the deleted identifier/phone in zestmed_deleted_patients blacklist
 * so that computeMergedPatients and live sync never resurrect the record.
 */
export const deletePatientProfile = async (identifier, phone = null) => {
  if (!identifier && !phone) return false;

  const clean = normalizePhone(phone || identifier);
  const idStr = identifier ? String(identifier).trim() : '';

  // 1. Clean localStorage caches
  try {
    // zestmed_patient_registry
    const reg = getLocalData('zestmed_patient_registry', {});
    if (clean && reg[clean]) {
      delete reg[clean];
      setLocalData('zestmed_patient_registry', reg);
    }
    if (idStr && reg[idStr]) {
      delete reg[idStr];
      setLocalData('zestmed_patient_registry', reg);
    }

    // zestmed_admin_patients
    const adminList = getLocalData('zestmed_admin_patients', []);
    const filteredAdmin = adminList.filter(
      (p) => p.id !== idStr && normalizePhone(p.phone) !== clean
    );
    setLocalData('zestmed_admin_patients', filteredAdmin);

    // zestmed_deleted_patients blacklist
    const deletedList = getLocalData('zestmed_deleted_patients', []);
    const toAdd = [idStr, clean].filter(Boolean);
    const newDeleted = Array.from(new Set([...deletedList, ...toAdd]));
    setLocalData('zestmed_deleted_patients', newDeleted);
  } catch (err) {
    console.warn('[SupabaseService] delete patient local cache error:', err);
  }

  // 2. Delete from Supabase profiles table
  if (isSupabaseConfigured()) {
    try {
      if (idStr) {
        await supabase.from('profiles').delete().eq('id', idStr);
      }
      if (clean && clean.length === 10) {
        await supabase.from('profiles').delete().eq('phone', clean);
      }
    } catch (err) {
      console.warn('[SupabaseService] delete patient from profiles exception:', err);
    }
  }

  return true;
};

export const getAllPatients = async () => {
  let deletedSet = new Set();
  try {
    const rawDel = getLocalData('zestmed_deleted_patients', []);
    if (Array.isArray(rawDel)) {
      deletedSet = new Set(rawDel.map((x) => String(x).toLowerCase().trim()));
    }
  } catch (_) {}

  const isExcluded = (p) => {
    const id = String(p.id || '').toLowerCase().trim();
    const uhid = String(p.uhid || '').toLowerCase().trim();
    const clean = normalizePhone(p.phone);
    return deletedSet.has(id) || deletedSet.has(uhid) || (clean && deletedSet.has(clean));
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.filter((p) => !isExcluded(p));
      }
    } catch (err) {
      console.warn('[SupabaseService] getAllPatients error:', err);
    }
  }

  const local = getLocalData('zestmed_admin_patients', []);
  return local.filter((p) => !isExcluded(p));
};

// ------------------------------------------------------------------------------
// 2. DOCTOR APPOINTMENTS
// ------------------------------------------------------------------------------

export const getDoctorAppointments = async (phone = null) => {
  const clean = normalizePhone(phone);

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('doctor_appointments').select('*').order('created_at', { ascending: false });
      if (clean) {
        query = query.or(`phone.eq.${clean},phone.eq.+91 ${clean},phone.eq.+91${clean}`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.filter(d => !isDemoBooking(d)).map((d) => ({
          id: d.appointment_number || d.id,
          bookingId: d.appointment_number || d.id,
          appointment_number: d.appointment_number || d.id,
          type: 'Doctor Appointment',
          category: 'doctor',
          title: d.doctor_name,
          doctor: d.doctor_name,
          doctorName: d.doctor_name,
          specialty: d.department,
          doctorSpecialty: d.department,
          hospital: 'Zestmed Polyclinic Hub, Guwahati',
          doctorHospital: 'Zestmed Polyclinic Hub, Guwahati',
          date: d.appointment_date,
          time: d.appointment_time,
          slot: `${d.appointment_date}, ${d.appointment_time}`,
          mode: d.consultation_type || 'Clinic Visit',
          fee: d.fees,
          price: d.fees,
          patientName: d.patient_name,
          phone: d.phone,
          patientPhone: d.phone,
          status: d.status || 'Confirmed',
          notes: d.notes,
          symptoms: d.notes,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('[SupabaseService] getDoctorAppointments error:', err);
    }
  }

  const all = getLocalData('patient_appointments', []).filter(a => !isDemoBooking(a));
  const doctorOnly = all.filter((a) => a.type === 'Doctor Appointment' || a.category === 'doctor' || a.doctor);
  if (clean) {
    return doctorOnly.filter((a) => normalizePhone(a.phone || a.patientPhone) === clean);
  }
  return doctorOnly;
};

export const bookDoctorAppointment = async (appointmentData) => {
  const authUser = getAuthenticatedUser() || {
    id: appointmentData.userId || 'usr_direct',
    phone: appointmentData.phone || appointmentData.patientPhone || '',
    name: appointmentData.patientName || 'Patient'
  };

  const resolvedPhone = normalizePhone(appointmentData.phone || appointmentData.patientPhone || authUser.phone || authUser.contact || '');
  const refId = appointmentData.id || appointmentData.appointment_number || `ZM-DOC-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newAppointment = {
    ...appointmentData,
    id: refId,
    bookingId: refId,
    appointment_number: refId,
    phone: resolvedPhone,
    patientPhone: resolvedPhone,
    patientName: appointmentData.patientName || authUser.name || 'Patient',
    doctorName: appointmentData.doctorName || appointmentData.doctor || appointmentData.title || 'Specialist Doctor',
    department: appointmentData.department || appointmentData.specialty || appointmentData.doctorSpecialty || 'General Medicine',
    date: appointmentData.date || appointmentData.appointment_date,
    time: appointmentData.time || appointmentData.appointment_time,
    mode: appointmentData.mode || appointmentData.consultation_type || 'Clinic Visit',
    fee: parseFloat(appointmentData.fee || appointmentData.fees || appointmentData.price || 600),
    status: appointmentData.status || 'Confirmed',
    createdAt: appointmentData.createdAt || new Date().toISOString(),
  };

  // 1. Sync to local cache (deduplicated by refId)
  const localList = getLocalData('patient_appointments', []);
  const filteredExisting = localList.filter((a) => a.id !== refId && a.bookingId !== refId && a.appointment_number !== refId);
  setLocalData('patient_appointments', [newAppointment, ...filteredExisting]);

  // 2. Sync with protected Node.js API endpoint if active
  try {
    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/bookings/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newAppointment)
      }).catch(() => {});
    }
  } catch (_) {}

  // 3. Persist directly to Supabase PostgreSQL database table
  if (isSupabaseConfigured()) {
    try {
      // Ensure date is a valid YYYY-MM-DD for PostgreSQL DATE column
      let formattedDate = new Date().toISOString().split('T')[0];
      const rawDateStr = String(newAppointment.date || newAppointment.appointment_date || '');
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDateStr)) {
        formattedDate = rawDateStr;
      } else if (rawDateStr.toLowerCase().includes('tomorrow')) {
        const tmrw = new Date();
        tmrw.setDate(tmrw.getDate() + 1);
        formattedDate = tmrw.toISOString().split('T')[0];
      } else if (rawDateStr) {
        const cleaned = rawDateStr.replace(/^today,?\s*/i, '');
        const parsed = Date.parse(cleaned);
        if (!isNaN(parsed)) {
          formattedDate = new Date(parsed).toISOString().split('T')[0];
        }
      }

      const { data, error } = await supabase
        .from('doctor_appointments')
        .insert([
          {
            appointment_number: newAppointment.appointment_number,
            patient_name: newAppointment.patientName,
            phone: resolvedPhone,
            doctor_name: newAppointment.doctorName,
            department: newAppointment.department,
            appointment_date: formattedDate,
            appointment_time: newAppointment.time || '10:00 AM',
            consultation_type: newAppointment.mode,
            fees: newAppointment.fee,
            status: newAppointment.status,
            notes: newAppointment.notes || newAppointment.symptoms || null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return { ...newAppointment, ...data };
      }
      if (error) {
        console.warn('[SupabaseService] bookDoctorAppointment insert error:', error);
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
      // Ensure existing records have correct specialization mapping
      doctors = cached.map((d) => {
        if (d.name && d.name.toLowerCase().includes('neha verma')) {
          return {
            ...d,
            specialty: 'Gynecology',
            specialization: 'Gynecology',
            department: 'Gynecology',
            designation: 'Obstetrician & Gynecologist'
          };
        }
        return d;
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
        return data.filter(d => !isDemoBooking(d));
      }
    } catch (err) {
      console.warn('[SupabaseService] getPhysioBookings error:', err);
    }
  }

  const all = getLocalData('patient_appointments', []).filter(a => !isDemoBooking(a));
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
        return data.filter(d => !isDemoBooking(d));
      }
    } catch (err) {
      console.warn('[SupabaseService] getSurgeryBookings error:', err);
    }
  }

  const all = getLocalData('patient_appointments', []).filter(a => !isDemoBooking(a));
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

export const getWellnessPackages = async (categoryFilter = null) => {
  let packages = [];

  // 1. Try fetching from Node.js backend API
  try {
    if (typeof fetch !== 'undefined') {
      const resp = await fetch('/api/packages/wellness');
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.success && Array.isArray(json.packages) && json.packages.length > 0) {
          packages = json.packages;
        }
      }
    }
  } catch (apiErr) {
    // API not directly available, proceed to Supabase
  }

  // 2. Try fetching from Supabase PostgreSQL database
  if ((!packages || packages.length === 0) && isSupabaseConfigured()) {
    try {
      // First attempt query on wellness_packages
      let { data, error } = await supabase.from('wellness_packages').select('*').order('created_at', { ascending: false });

      // If table empty or does not exist, query health_packages
      if (error || !data || data.length === 0) {
        const alt = await supabase.from('health_packages').select('*').order('created_at', { ascending: false });
        if (!alt.error && alt.data && alt.data.length > 0) {
          data = alt.data;
          error = null;
        }
      }

      if (!error && data && data.length > 0) {
        packages = data.map((pkg, idx) => {
          let parsedTests = [];
          if (Array.isArray(pkg.tests)) {
            parsedTests = pkg.tests;
          } else if (typeof pkg.parameters === 'string') {
            parsedTests = pkg.parameters.split(',').map((s) => s.trim());
          } else if (typeof pkg.description === 'string') {
            parsedTests = pkg.description.split(',').map((s) => s.trim());
          } else {
            parsedTests = ['Complete Hemogram (CBC)', 'Lipid Profile', 'Blood Sugar Fasting', 'LFT & KFT'];
          }

          return {
            id: pkg.id ? String(pkg.id) : (pkg.package_code || `well-pkg-${idx + 1}`),
            name: pkg.name || pkg.package_name || 'Wellness Health Package',
            subtitle: pkg.subtitle || pkg.description || 'Comprehensive health screening package',
            category: pkg.category || 'general',
            categoryName: pkg.category_name || (pkg.category ? (pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1) + ' Wellness') : 'General Wellness'),
            iconColor: pkg.icon_color || 'bg-blue-50 text-blue-600',
            tests: parsedTests.slice(0, 4),
            testsCount: pkg.total_tests_count || pkg.testsCount || (parsedTests.length > 4 ? parsedTests.length : 45),
            mrp: Number(pkg.price || pkg.mrp || 1999),
            price: Number(pkg.discounted_price || pkg.price || 1299),
            discount: pkg.discount || '20% OFF',
            discountPercent: Number(pkg.discount_percentage || pkg.discountPercent || 20),
            image: pkg.image || pkg.image_url || '/wellness-pkg1-heart.png',
            badge: pkg.badge || pkg.tags || 'Essential Checkup',
            includes: pkg.includes || `${pkg.total_tests_count || 45}+ Tests Included (CBC, Lipid, LFT & Blood Sugar)`,
            reportsIn: pkg.turnaround_time || pkg.reportsIn || 'Same Day (Within 12-24 Hours)',
            fasting: pkg.fasting || (pkg.fasting_required !== false ? '10-12 hrs Fasting Required' : 'No Fasting Required')
          };
        });
      }
    } catch (err) {
      console.warn('[SupabaseService] getWellnessPackages from Supabase error:', err);
    }
  }

  // 3. Resilient persistent local storage cache / verified registry
  if (!packages || packages.length === 0) {
    const cached = getLocalData('zestmed_wellness_packages_cache', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      packages = cached;
    } else {
      packages = WELLNESS_PACKAGES_DATA;
      setLocalData('zestmed_wellness_packages_cache', WELLNESS_PACKAGES_DATA);
    }
  }

  // 4. Filter by category if specified
  if (categoryFilter && categoryFilter !== 'all' && categoryFilter !== 'All') {
    const filterLower = categoryFilter.toLowerCase();
    return packages.filter((pkg) => {
      const cat = String(pkg.category || '').toLowerCase();
      const catName = String(pkg.categoryName || '').toLowerCase();
      return cat === filterLower || catName.includes(filterLower);
    });
  }

  return packages;
};

export const getWellnessBookings = async (phone = null) => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('wellness_bookings').select('*').order('created_at', { ascending: false });
      if (phone) {
        query = query.eq('phone', phone);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.filter(d => !isDemoBooking(d));
      }
    } catch (err) {
      console.warn('[SupabaseService] getWellnessBookings error:', err);
    }
  }

  const all = getLocalData('patient_appointments', []).filter(a => !isDemoBooking(a));
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
        return data.filter(d => !isDemoBooking(d));
      }
    } catch (err) {
      console.warn('[SupabaseService] getLabBookings error:', err);
    }
  }

  const all = getLocalData('zestmed_patient_lab_bookings', []).filter(b => !isDemoBooking(b));
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
  const isPkg = isWellnessPackage(bookingData);
  const newBooking = {
    ...bookingData,
    phone: resolvedPhone,
    patientPhone: resolvedPhone,
    id: bookingData.id || `ZM-${isPkg ? 'WEL' : 'LAB'}-${Date.now()}`,
    booking_number: bookingData.booking_number || `ZM-${isPkg ? 'WEL' : 'LAB'}-${Date.now()}`,
    type: isPkg ? 'Wellness Package' : (bookingData.type || 'Diagnostic Lab Test'),
    itemType: isPkg ? 'wellness' : (bookingData.itemType || 'lab'),
    serviceType: isPkg ? 'Wellness Package' : (bookingData.serviceType || 'Diagnostic Lab Test'),
    category: isPkg ? 'Wellness Package' : (bookingData.category || 'Diagnostic Test'),
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
        return data.filter(d => !isDemoBooking(d));
      }
    } catch (err) {
      console.warn('[SupabaseService] getMedicineOrders error:', err);
    }
  }

  const all = getLocalData('zestmed_patient_orders', []).filter(o => !isDemoBooking(o));
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
            patient_name: newOrder.patientName || newOrder.patient_name || 'Patient',
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
  let deletedSet = new Set();
  try {
    const rawDel = getLocalData('zestmed_deleted_executives', []);
    if (Array.isArray(rawDel)) {
      deletedSet = new Set(rawDel.map((x) => String(x).toLowerCase().trim()));
    }
  } catch (_) {}

  const isExcluded = (e) => {
    const id = String(e.id || '').toLowerCase().trim();
    const empId = String(e.employee_id || '').toLowerCase().trim();
    return deletedSet.has(id) || deletedSet.has(empId);
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('lab_executives')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.filter((e) => !isExcluded(e));
      }
    } catch (err) {
      console.warn('[SupabaseService] getLabExecutives error:', err);
    }
  }

  const local = getLocalData('zestmed_executives', []);
  return local.filter((e) => !isExcluded(e));
};

export const deleteLabExecutive = async (execId) => {
  if (!execId) return false;

  const idStr = String(execId).trim();

  try {
    const localList = getLocalData('zestmed_executives', []);
    setLocalData(
      'zestmed_executives',
      localList.filter((e) => e.id !== idStr && e.employee_id !== idStr)
    );

    const adminList = getLocalData('zestmed_admin_executives', []);
    setLocalData(
      'zestmed_admin_executives',
      adminList.filter((e) => e.id !== idStr && e.employee_id !== idStr)
    );

    const deletedList = getLocalData('zestmed_deleted_executives', []);
    const newDeleted = Array.from(new Set([...deletedList, idStr]));
    setLocalData('zestmed_deleted_executives', newDeleted);
  } catch (err) {
    console.warn('[SupabaseService] deleteLabExecutive local cache error:', err);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('lab_executives')
        .delete()
        .or(`id.eq.${idStr},employee_id.eq.${idStr}`);
    } catch (err) {
      console.warn('[SupabaseService] deleteLabExecutive Supabase error:', err);
    }
  }

  return true;
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
    if (isDemoBooking(item)) return false;

    const itemPhone = normalizePhone(item.phone || item.patientPhone || item.patient_phone || item.contact || item.contactNumber || item.customer_phone || '');
    if (cleanPhone && itemPhone) {
      return cleanPhone === itemPhone;
    }
    if (cleanPhone && !itemPhone && userName && (item.patient_name || item.patientName)) {
      const itemName = String(item.patient_name || item.patientName || '').trim().toLowerCase();
      if (itemName === userName.toLowerCase()) return true;
    }
    return false;
  };

  const allResults = [];
  const seenIds = new Set();

  // 1. Fetch from Supabase PostgreSQL tables if configured
  if (isSupabaseConfigured() && cleanPhone) {
    try {
      const [docsRes, physioRes, surgRes, wellRes, labsRes, ordersRes] = await Promise.allSettled([
        supabase.from('doctor_appointments').select('*').ilike('phone', `%${cleanPhone}%`).order('created_at', { ascending: false }),
        supabase.from('physiotherapy_bookings').select('*').ilike('phone', `%${cleanPhone}%`).order('created_at', { ascending: false }),
        supabase.from('surgery_bookings').select('*').ilike('phone', `%${cleanPhone}%`).order('created_at', { ascending: false }),
        supabase.from('wellness_bookings').select('*').ilike('phone', `%${cleanPhone}%`).order('created_at', { ascending: false }),
        supabase.from('test_bookings').select('*').ilike('phone', `%${cleanPhone}%`).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').ilike('phone', `%${cleanPhone}%`).order('created_at', { ascending: false }),
      ]);

      if (docsRes.status === 'fulfilled' && Array.isArray(docsRes.value.data)) {
          docsRes.value.data.filter(isMatchingUser).forEach((d) => {
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
          physioRes.value.data.filter(isMatchingUser).forEach((p) => {
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
          surgRes.value.data.filter(isMatchingUser).forEach((s) => {
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
          wellRes.value.data.filter(isMatchingUser).forEach((w) => {
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
          labsRes.value.data.filter(isMatchingUser).forEach((l) => {
            const bId = l.booking_number || l.id;
            if (!seenIds.has(String(bId))) {
              seenIds.add(String(bId));
              const isPkg = isWellnessPackage({
                name: l.test_name,
                title: l.test_name,
                testName: l.test_name,
                category: l.sample_type,
                type: l.sample_type,
                id: bId
              });
              allResults.push({
                id: bId,
                bookingId: bId,
                serviceType: isPkg ? 'Wellness Package' : 'Diagnostic Lab Test',
                itemType: isPkg ? 'wellness' : 'lab',
                displayType: isPkg ? 'Wellness Health Package' : 'Diagnostic Lab Test',
                serviceName: l.test_name || (isPkg ? 'Wellness Health Package' : 'Diagnostic Laboratory Test'),
                title: l.test_name || (isPkg ? 'Wellness Package' : 'Diagnostic Lab Test'),
                specimen: l.sample_type || 'Blood Sample (NABL Certified)',
                provider: l.phlebotomist || 'Bikash Das (Phlebotomist)',
                bookingDateTime: l.created_at || new Date().toISOString(),
                createdAt: l.created_at || new Date().toISOString(),
                appointmentDate: l.collection_date || 'Scheduled Date',
                appointmentTime: l.collection_slot || 'Morning Collection',
                date: l.collection_date || 'Scheduled Date',
                time: l.collection_slot || 'Morning Collection',
                mode: isPkg ? 'Home Health Checkup' : 'Home Sample Collection',
                location: l.collection_address || 'Guwahati Hub',
                collectionAddress: l.collection_address || 'Guwahati Hub',
                paymentStatus: l.payment_status || 'Paid (Online / At Collection)',
                bookingStatus: l.status || 'Confirmed',
                status: l.status || 'Confirmed',
                totalAmount: parseFloat(l.price || (isPkg ? 1299 : 499)),
                price: parseFloat(l.price || (isPkg ? 1299 : 499)),
                patientName: l.patient_name || userName || 'Self',
                phone: l.phone || rawPhone,
                source: 'database',
              });
            }
          });
        }

        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data)) {
          ordersRes.value.data.filter(isMatchingUser).forEach((o) => {
            const bId = o.order_number || o.id;
            const items = Array.isArray(o.items) ? o.items : [];
            const testItems = items.filter(it => isLabTestOrPackage(it));
            const medItems = items.filter(it => !isLabTestOrPackage(it));

            // Extract any test/package items as distinct lab bookings
            testItems.forEach((t, idx) => {
              const isPkg = isWellnessPackage(t);
              const labId = String(bId).replace('ORD', isPkg ? 'WEL' : 'LAB') + (testItems.length > 1 ? `-${idx + 1}` : '');
              if (!seenIds.has(labId)) {
                seenIds.add(labId);
                allResults.push({
                  id: labId,
                  bookingId: labId,
                  serviceType: isPkg ? 'Wellness Package' : 'Lab Test',
                  itemType: isPkg ? 'wellness' : 'lab',
                  displayType: isPkg ? 'Wellness Health Package' : 'Diagnostic Lab Test',
                  serviceName: t.name || 'Diagnostic Lab Test',
                  title: t.name || 'Diagnostic Lab Test',
                  specimen: 'Blood / Serum Sample (Barcoded)',
                  provider: 'Bikash Das (Phlebotomist)',
                  bookingDateTime: o.created_at || new Date().toISOString(),
                  createdAt: o.created_at || new Date().toISOString(),
                  appointmentDate: 'Tomorrow',
                  appointmentTime: '07:30 AM - Home Collection',
                  date: 'Tomorrow',
                  time: '07:30 AM - Home Collection',
                  mode: 'Home Sample Collection',
                  location: o.delivery_address || 'Guwahati Hub',
                  collectionAddress: o.delivery_address || 'Guwahati Hub',
                  paymentStatus: o.payment_status || o.payment_method || 'Paid (Verified)',
                  bookingStatus: o.order_status || o.status || 'Confirmed',
                  status: o.order_status || o.status || 'Confirmed',
                  totalAmount: parseFloat(t.price || 499),
                  price: parseFloat(t.price || 499),
                  patientName: o.patient_name || userName || 'Self',
                  phone: o.phone || rawPhone,
                  source: 'database_test',
                });
              }
            });

            // If genuine medicines are present, emit pure medicine order
            if (medItems.length > 0 || testItems.length === 0) {
              if (!seenIds.has(String(bId))) {
                seenIds.add(String(bId));
                const displayItems = medItems.length > 0 ? medItems : items;
                const itemNames = displayItems.length > 0
                  ? displayItems.map((i) => i.name).filter(Boolean).join(', ')
                  : 'Prescription Medicines';
                allResults.push({
                  id: bId,
                  bookingId: bId,
                  serviceType: 'Medicine Order',
                  itemType: 'medicine',
                  displayType: 'Medicine Order',
                  serviceName: itemNames,
                  title: itemNames,
                  items: displayItems,
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
            }
          });
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
      const cat = String(a?.category?.name || a?.category || a?.type || '').toLowerCase();
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
      const cat = String(l?.category?.name || l?.category || l?.type || '').toLowerCase();
      const testName = String(l?.testName || l?.name || '').toLowerCase();
      const isWellness = isWellnessPackage(l) || cat.includes('wellness') || testName.includes('wellness');
      const sType = isWellness ? 'Wellness Package' : 'Diagnostic Lab Test';
      const iType = isWellness ? 'wellness' : 'lab';
      const dType = isWellness ? 'Wellness Health Package' : 'Diagnostic Lab Test';

      allResults.push({
        id: bId,
        bookingId: bId,
        serviceType: sType,
        itemType: iType,
        displayType: dType,
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
    const items = Array.isArray(o.items) ? o.items : [];
    const testItems = items.filter(it => isLabTestOrPackage(it));
    const medItems = items.filter(it => !isLabTestOrPackage(it));

    // Extract any test items from local orders into Lab Bookings
    testItems.forEach((t, idx) => {
      const isPkg = isWellnessPackage(t);
      const labId = String(bId).replace('ORD', isPkg ? 'WEL' : 'LAB') + (testItems.length > 1 ? `-${idx + 1}` : '');
      if (!seenIds.has(labId)) {
        seenIds.add(labId);
        allResults.push({
          id: labId,
          bookingId: labId,
          serviceType: isPkg ? 'Wellness Package' : 'Lab Test',
          itemType: isPkg ? 'wellness' : 'lab',
          displayType: isPkg ? 'Wellness Health Package' : 'Diagnostic Lab Test',
          serviceName: t.name || 'Diagnostic Lab Test',
          title: t.name || 'Diagnostic Lab Test',
          specimen: 'Blood / Serum Sample (Barcoded)',
          provider: 'Bikash Das (Phlebotomist)',
          bookingDateTime: o.createdAt || (o.date ? `${o.date} ${o.time || ''}` : new Date().toISOString()),
          createdAt: o.createdAt || new Date().toISOString(),
          appointmentDate: o.date || 'Tomorrow',
          appointmentTime: '07:30 AM - Home Collection',
          date: o.date || 'Tomorrow',
          time: '07:30 AM - Home Collection',
          mode: 'Home Sample Collection',
          location: o.deliveryAddress || 'Guwahati Hub',
          collectionAddress: o.deliveryAddress || 'Guwahati Hub',
          paymentStatus: o.paymentMethod || o.payment_status || 'Paid (Verified)',
          bookingStatus: o.status || 'Confirmed',
          status: o.status || 'Confirmed',
          totalAmount: parseFloat(t.price || 499),
          price: parseFloat(t.price || 499),
          patientName: o.patientName || userName || 'Self',
          phone: o.phone || rawPhone,
          source: 'local_test',
        });
      }
    });

    // If pure medicines are present, emit pure medicine order
    if (medItems.length > 0 || testItems.length === 0) {
      if (!seenIds.has(String(bId))) {
        seenIds.add(String(bId));
        const displayItems = medItems.length > 0 ? medItems : items;
        const itemNames = displayItems.length > 0
          ? displayItems.map((i) => i.name).filter(Boolean).join(', ')
          : 'Prescription Medicines';

        allResults.push({
          id: bId,
          bookingId: bId,
          serviceType: 'Medicine Order',
          itemType: 'medicine',
          displayType: 'Medicine Order',
          serviceName: itemNames,
          title: itemNames,
          items: displayItems,
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
    }
  });

  // Filter out any mock/demo bookings and sort by booking date time descending (most recent first)
  return allResults
    .filter((item) => !isDemoBooking(item))
    .sort((a, b) => {
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
