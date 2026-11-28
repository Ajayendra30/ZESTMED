// src/services/supportService.js
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

export const SUPPORT_TICKETS_CACHE_KEY = 'zestmed_support_tickets';

/**
 * Helper to encode structured metadata into message if extended columns are absent in older schemas.
 */
function encodeTicketMessage(cleanMessage, meta) {
  if (!meta || Object.keys(meta).length === 0) return cleanMessage;
  return `${cleanMessage}\n<!--ZM_TKT_META:${JSON.stringify(meta)}-->`;
}

/**
 * Helper to decode structured metadata from message.
 */
function decodeTicketMessage(rawMessage = '') {
  let cleanMessage = String(rawMessage || '');
  let meta = {};
  if (cleanMessage.includes('<!--ZM_TKT_META:')) {
    try {
      const parts = cleanMessage.split('<!--ZM_TKT_META:');
      const jsonStr = parts[1].split('-->')[0];
      meta = JSON.parse(jsonStr);
      cleanMessage = parts[0].trim();
    } catch (_) {}
  }
  return { cleanMessage, meta };
}

/**
 * Normalizes a raw inquiry/ticket row from database into a standardized ticket object.
 */
export function normalizeSupportTicket(raw) {
  if (!raw) return null;
  const { cleanMessage, meta } = decodeTicketMessage(raw.message || raw.description || '');

  const id = raw.id || meta.id || `ZM-SUP-${Date.now()}`;
  const ticketRef = raw.ticket_number || meta.ticket_number || (typeof id === 'string' && id.startsWith('ZM-') ? id : `ZM-SUP-${String(id).slice(0, 6).toUpperCase()}`);
  
  const status = raw.status || meta.status || (raw.is_resolved ? 'Resolved' : 'Open');
  const priority = raw.priority || meta.priority || raw.urgency || meta.urgency || 'Normal';
  const category = raw.category || meta.category || raw.subject_category || 'General Support';
  const adminResponse = raw.admin_response || meta.admin_response || '';
  const responseDate = raw.response_date || meta.response_date || null;
  const respondedBy = raw.responded_by || meta.responded_by || '';

  return {
    id: ticketRef,
    rawId: raw.id,
    ticketRef,
    patientName: raw.name || raw.patient_name || raw.patientName || 'Patient',
    email: raw.email || raw.patient_email || '',
    phone: raw.phone || raw.patient_phone || '',
    subject: raw.subject || 'Support Assistance Request',
    category,
    message: cleanMessage,
    description: cleanMessage,
    priority,
    status,
    isResolved: status === 'Resolved' || status === 'Closed' || Boolean(raw.is_resolved),
    adminResponse,
    responseDate,
    respondedBy,
    profileId: raw.profile_id || meta.profile_id || null,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString()
  };
}

/**
 * Submit / Create a new support ticket or patient complaint.
 * Saves permanently in Supabase PostgreSQL ('inquiries' table) and broadcasts sync events.
 */
export async function createSupportTicket(ticketData) {
  const nowIso = new Date().toISOString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketRef = ticketData.ticketRef || ticketData.ticket_number || `ZM-SUP-${randomSuffix}`;

  const cleanSubject = ticketData.subject || 'Patient Support Request';
  const cleanCategory = ticketData.category || 'General Support';
  const cleanPriority = ticketData.priority || ticketData.urgency || 'Normal';
  const cleanMessage = ticketData.message || ticketData.description || '';
  const patientName = ticketData.patientName || ticketData.name || 'Patient';
  const patientEmail = ticketData.email || '';
  const patientPhone = ticketData.phone || '';
  const profileId = ticketData.profileId || ticketData.profile_id || null;

  const metaPayload = {
    ticket_number: ticketRef,
    status: 'Open',
    priority: cleanPriority,
    category: cleanCategory,
    profile_id: profileId,
    admin_response: '',
    response_date: null
  };

  const encodedMessage = encodeTicketMessage(cleanMessage, metaPayload);

  let savedRecord = null;

  // 1. Try Backend API first (/api/support)
  try {
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketRef,
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        subject: cleanSubject,
        category: cleanCategory,
        priority: cleanPriority,
        message: cleanMessage,
        status: 'Open'
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ticket) {
        savedRecord = data.ticket;
      }
    }
  } catch (_) {}

  // 2. Supabase PostgreSQL insert
  if (isSupabaseConfigured()) {
    try {
      // Primary insert with all columns
      const insertPayload = {
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        subject: cleanSubject,
        message: encodedMessage,
        is_resolved: false,
        created_at: nowIso,
        updated_at: nowIso
      };

      // If database has native columns, also provide them directly
      const extendedPayload = {
        ...insertPayload,
        ticket_number: ticketRef,
        status: 'Open',
        category: cleanCategory,
        priority: cleanPriority
      };

      const { data, error } = await supabase
        .from('inquiries')
        .insert([extendedPayload])
        .select()
        .single();

      if (!error && data) {
        savedRecord = data;
      } else if (error) {
        // Fallback: try inserting standard baseline columns if custom columns were rejected by schema
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from('inquiries')
          .insert([insertPayload])
          .select()
          .single();

        if (!fallbackErr && fallbackData) {
          savedRecord = fallbackData;
        } else {
          console.warn('[SupportService] Supabase insert warning:', fallbackErr || error);
        }
      }
    } catch (dbErr) {
      console.warn('[SupportService] Database insert error:', dbErr);
    }
  }

  // 2. Normalize final object
  const normalized = normalizeSupportTicket(savedRecord || {
    id: ticketRef,
    ticket_number: ticketRef,
    name: patientName,
    email: patientEmail,
    phone: patientPhone,
    subject: cleanSubject,
    message: encodedMessage,
    is_resolved: false,
    created_at: nowIso,
    updated_at: nowIso
  });

  // 3. Update local cache
  try {
    const rawLocal = localStorage.getItem(SUPPORT_TICKETS_CACHE_KEY);
    const list = rawLocal ? JSON.parse(rawLocal) : [];
    const updated = [normalized, ...list.filter(t => t.id !== normalized.id && t.ticketRef !== normalized.ticketRef)];
    localStorage.setItem(SUPPORT_TICKETS_CACHE_KEY, JSON.stringify(updated));
  } catch (_) {}

  // 4. Broadcast events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zestmed_support_ticket_created', { detail: normalized }));
  }

  return normalized;
}

/**
 * Fetch all genuine support tickets from Supabase PostgreSQL.
 * Deduplicates and updates the local cache.
 */
export async function fetchSupportTickets() {
  let genuineTickets = [];

  // 1. Try Backend API first (/api/support)
  try {
    const res = await fetch('/api/support');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.tickets) && data.tickets.length > 0) {
        genuineTickets = data.tickets.map(normalizeSupportTicket).filter(Boolean);
      }
    }
  } catch (_) {}

  // 2. Try direct Supabase if not loaded via API or to sync live rows
  if (genuineTickets.length === 0 && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        genuineTickets = data.map(normalizeSupportTicket).filter(Boolean);
      }
    } catch (err) {
      console.warn('[SupportService] fetchSupportTickets error:', err);
    }
  }

  // Merge with locally stored tickets submitted in the current session
  let localTickets = [];
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_CACHE_KEY);
    if (raw) {
      localTickets = JSON.parse(raw).map(normalizeSupportTicket).filter(Boolean);
    }
  } catch (_) {}

  // Strict deduplication by ticketRef or rawId
  const uniqueMap = new Map();
  genuineTickets.forEach(t => {
    uniqueMap.set(t.ticketRef || t.id, t);
    if (t.rawId) uniqueMap.set(t.rawId, t);
  });
  localTickets.forEach(t => {
    const key = t.ticketRef || t.id;
    if (!uniqueMap.has(key) && (!t.rawId || !uniqueMap.has(t.rawId))) {
      uniqueMap.set(key, t);
    }
  });

  const merged = Array.from(new Set(uniqueMap.values()));
  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Keep local cache fresh
  try {
    localStorage.setItem(SUPPORT_TICKETS_CACHE_KEY, JSON.stringify(merged));
  } catch (_) {}

  return merged;
}

/**
 * Update the status of a support ticket (Open, In Progress, Resolved, Closed).
 * Saves permanently in Supabase PostgreSQL and updates local cache.
 */
export async function updateSupportTicketStatus(ticketId, nextStatus) {
  if (!ticketId || !nextStatus) return false;
  const isResolved = nextStatus === 'Resolved' || nextStatus === 'Closed';
  const nowIso = new Date().toISOString();

  // 1. Backend API update
  try {
    await fetch('/api/support/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, status: nextStatus })
    });
  } catch (_) {}

  // 2. Database update
  if (isSupabaseConfigured()) {
    try {
      // First fetch current record to preserve message metadata
      let query = supabase.from('inquiries').select('*');
      if (typeof ticketId === 'string' && ticketId.includes('-') && ticketId.length > 20) {
        query = query.eq('id', ticketId);
      } else {
        query = query.or(`ticket_number.eq.${ticketId},id.eq.${ticketId}`);
      }
      const { data: existingRows } = await query.limit(1);

      if (existingRows && existingRows.length > 0) {
        const row = existingRows[0];
        const { cleanMessage, meta } = decodeTicketMessage(row.message);
        meta.status = nextStatus;
        meta.is_resolved = isResolved;
        const updatedMessage = encodeTicketMessage(cleanMessage, meta);

        // Update with both native and embedded fields
        const updatePayload = {
          status: nextStatus,
          is_resolved: isResolved,
          message: updatedMessage,
          updated_at: nowIso
        };

        const { error: updErr } = await supabase
          .from('inquiries')
          .update(updatePayload)
          .eq('id', row.id);

        if (updErr) {
          // If native column 'status' does not exist in schema, update without it
          await supabase
            .from('inquiries')
            .update({
              is_resolved: isResolved,
              message: updatedMessage,
              updated_at: nowIso
            })
            .eq('id', row.id);
        }
      }
    } catch (err) {
      console.warn('[SupportService] updateSupportTicketStatus error:', err);
    }
  }

  // 2. Update local cache
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_CACHE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map(t => {
        if (t.id === ticketId || t.ticketRef === ticketId || t.rawId === ticketId) {
          return {
            ...t,
            status: nextStatus,
            isResolved,
            updatedAt: nowIso
          };
        }
        return t;
      });
      localStorage.setItem(SUPPORT_TICKETS_CACHE_KEY, JSON.stringify(updated));
    }
  } catch (_) {}

  // 3. Broadcast events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zestmed_ticket_updated', { detail: { ticketId, status: nextStatus } }));
  }

  return true;
}

/**
 * Write and send an administrative resolution response to a patient ticket.
 * Saves permanently in Supabase PostgreSQL and marks ticket status.
 */
export async function respondToSupportTicket(ticketId, { replyMessage, adminName = 'Zestmed Support Team', newStatus = 'Resolved' }) {
  if (!ticketId || !replyMessage) return false;
  const nowIso = new Date().toISOString();
  const isResolved = newStatus === 'Resolved' || newStatus === 'Closed';

  // 1. Try Backend API
  try {
    await fetch('/api/support/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, reply: replyMessage, respondedBy: adminName, status: newStatus })
    });
  } catch (_) {}

  // 2. Supabase update
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('inquiries').select('*');
      if (typeof ticketId === 'string' && ticketId.includes('-') && ticketId.length > 20) {
        query = query.eq('id', ticketId);
      } else {
        query = query.or(`ticket_number.eq.${ticketId},id.eq.${ticketId}`);
      }
      const { data: existingRows } = await query.limit(1);

      if (existingRows && existingRows.length > 0) {
        const row = existingRows[0];
        const { cleanMessage, meta } = decodeTicketMessage(row.message);
        meta.admin_response = replyMessage;
        meta.response_date = nowIso;
        meta.responded_by = adminName;
        meta.status = newStatus;
        meta.is_resolved = isResolved;
        const updatedMessage = encodeTicketMessage(cleanMessage, meta);

        const updatePayload = {
          admin_response: replyMessage,
          response_date: nowIso,
          responded_by: adminName,
          status: newStatus,
          is_resolved: isResolved,
          message: updatedMessage,
          updated_at: nowIso
        };

        const { error: updErr } = await supabase
          .from('inquiries')
          .update(updatePayload)
          .eq('id', row.id);

        if (updErr) {
          // Fallback if custom columns don't exist
          await supabase
            .from('inquiries')
            .update({
              is_resolved: isResolved,
              message: updatedMessage,
              updated_at: nowIso
            })
            .eq('id', row.id);
        }
      }
    } catch (err) {
      console.warn('[SupportService] respondToSupportTicket error:', err);
    }
  }

  // 2. Update local cache
  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_CACHE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map(t => {
        if (t.id === ticketId || t.ticketRef === ticketId || t.rawId === ticketId) {
          return {
            ...t,
            adminResponse: replyMessage,
            responseDate: nowIso,
            respondedBy: adminName,
            status: newStatus,
            isResolved,
            updatedAt: nowIso
          };
        }
        return t;
      });
      localStorage.setItem(SUPPORT_TICKETS_CACHE_KEY, JSON.stringify(updated));
    }
  } catch (_) {}

  // 3. Broadcast events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zestmed_ticket_updated', { 
      detail: { ticketId, status: newStatus, adminResponse: replyMessage } 
    }));
  }

  return true;
}

/**
 * Fetch tickets submitted by a specific patient (matching phone or email or profile_id).
 * Allows patients to view their tickets and read admin resolution responses.
 */
export async function getPatientSupportTickets(userOrContact) {
  if (!userOrContact) return [];
  const all = await fetchSupportTickets();
  const phone = String(userOrContact.phone || userOrContact || '').replace(/[^0-9]/g, '');
  const email = String(userOrContact.email || '').toLowerCase().trim();
  const profileId = userOrContact.id || '';

  return all.filter(t => {
    const tPhone = String(t.phone || '').replace(/[^0-9]/g, '');
    const tEmail = String(t.email || '').toLowerCase().trim();
    if (phone && tPhone && (tPhone.endsWith(phone) || phone.endsWith(tPhone))) return true;
    if (email && tEmail && tEmail === email) return true;
    if (profileId && t.profileId && t.profileId === profileId) return true;
    return false;
  });
}

/**
 * Permanently delete a support ticket from database and local cache.
 */
export async function deleteSupportTicket(ticketId) {
  if (!ticketId) return false;
  try {
    await fetch(`/api/support/${ticketId}`, { method: 'DELETE' });
  } catch (_) {}

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('inquiries');
      if (typeof ticketId === 'string' && ticketId.includes('-') && ticketId.length > 20) {
        await query.delete().eq('id', ticketId);
      } else {
        await query.delete().or(`ticket_number.eq.${ticketId},id.eq.${ticketId}`);
      }
    } catch (_) {}
  }

  try {
    const raw = localStorage.getItem(SUPPORT_TICKETS_CACHE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const filtered = list.filter(t => t.id !== ticketId && t.ticketRef !== ticketId && t.rawId !== ticketId);
      localStorage.setItem(SUPPORT_TICKETS_CACHE_KEY, JSON.stringify(filtered));
    }
  } catch (_) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
  return true;
}
