import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * ==============================================================================
 * ZESTMED SUPABASE POSTGRESQL DATABASE SERVICE
 * ==============================================================================
 * Connects the frontend application directly to Supabase PostgreSQL database tables.
 * Provides resilient data operations with local caching and offline fallback.
 * ==============================================================================
 */

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
  const localList = getLocalData('patient_appointments', []);
  const newAppointment = {
    ...appointmentData,
    id: appointmentData.id || `DOC-${Date.now()}`,
    appointment_number: appointmentData.appointment_number || `DOC-${Date.now()}`,
    created_at: new Date().toISOString(),
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
            phone: newAppointment.phone || '',
            doctor_name: newAppointment.doctorName || newAppointment.doctor_name,
            department: newAppointment.department || 'General Medicine',
            appointment_date: newAppointment.date || newAppointment.appointment_date,
            appointment_time: newAppointment.time || newAppointment.appointment_time,
            consultation_type: newAppointment.type || newAppointment.consultation_type || 'Clinic Visit',
            fees: parseFloat(newAppointment.fees || 500),
            status: newAppointment.status,
            notes: newAppointment.notes || null,
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
  const localList = getLocalData('patient_appointments', []);
  const newBooking = {
    ...physioData,
    isPhysio: true,
    id: physioData.id || `PHY-${Date.now()}`,
    booking_number: physioData.booking_number || `PHY-${Date.now()}`,
    created_at: new Date().toISOString(),
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
            phone: newBooking.phone || '',
            condition: newBooking.condition || newBooking.serviceName || 'Physiotherapy Session',
            service_type: newBooking.service_type || 'Home Visit',
            booking_date: newBooking.date || newBooking.booking_date,
            preferred_slot: newBooking.time || newBooking.preferred_slot,
            fees: parseFloat(newBooking.fees || newBooking.price || 799),
            address: newBooking.address || null,
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
  const localList = getLocalData('patient_appointments', []);
  const newBooking = {
    ...surgeryData,
    isSurgery: true,
    id: surgeryData.id || `SUR-${Date.now()}`,
    booking_number: surgeryData.booking_number || `SUR-${Date.now()}`,
    created_at: new Date().toISOString(),
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
            phone: newBooking.phone || '',
            surgery_name: newBooking.doctorName || newBooking.surgery_name,
            hospital_preference: newBooking.hospital_preference || 'ZestMed SuperSpecialty Center',
            preferred_date: newBooking.date || newBooking.preferred_date,
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
  const localList = getLocalData('patient_appointments', []);
  const newBooking = {
    ...wellnessData,
    isWellness: true,
    id: wellnessData.id || `WEL-${Date.now()}`,
    booking_number: wellnessData.booking_number || `WEL-${Date.now()}`,
    created_at: new Date().toISOString(),
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
            phone: newBooking.phone || '',
            package_name: newBooking.doctorName || newBooking.package_name,
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
  const localList = getLocalData('zestmed_patient_lab_bookings', []);
  const newBooking = {
    ...bookingData,
    id: bookingData.id || `LAB-${Date.now()}`,
    booking_number: bookingData.booking_number || `LAB-${Date.now()}`,
    created_at: new Date().toISOString(),
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
            phone: newBooking.phone || '',
            test_name: newBooking.testName || newBooking.test_name,
            sample_type: newBooking.sampleType || newBooking.sample_type || 'Blood',
            collection_address: newBooking.address || newBooking.collection_address || 'Guwahati',
            collection_date: newBooking.date || newBooking.collection_date,
            collection_slot: newBooking.timeSlot || newBooking.collection_slot || '08:00 AM - 10:00 AM',
            price: parseFloat(newBooking.price || 0),
            status: newBooking.status,
            phlebotomist: newBooking.phlebotomist || 'Rajib Barman',
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
  const localList = getLocalData('zestmed_patient_orders', []);
  const newOrder = {
    ...orderData,
    id: orderData.id || `ORD-${Date.now()}`,
    order_number: orderData.order_number || `ORD-${Date.now()}`,
    created_at: new Date().toISOString(),
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
            phone: newOrder.phone || '',
            delivery_address: newOrder.deliveryAddress || newOrder.delivery_address || 'Guwahati, Assam',
            subtotal: parseFloat(newOrder.subtotal || newOrder.total || 0),
            discount: parseFloat(newOrder.discount || 0),
            delivery_fee: parseFloat(newOrder.deliveryFee || 0),
            total_amount: parseFloat(newOrder.total || newOrder.total_amount || 0),
            payment_status: newOrder.paymentStatus || 'Paid (COD)',
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
