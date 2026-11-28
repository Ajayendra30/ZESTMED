// src/services/reviewService.js
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

export const REVIEWS_CACHE_KEY = 'zestmed_patient_reviews';

/**
 * Helper to encode review metadata into message if using inquiries fallback
 */
function encodeReviewMeta(comment, meta) {
  if (!meta || Object.keys(meta).length === 0) return comment;
  return `${comment}\n<!--ZM_REV_META:${JSON.stringify(meta)}-->`;
}

/**
 * Helper to decode review metadata
 */
function decodeReviewMeta(rawText = '') {
  let cleanComment = String(rawText || '');
  let meta = {};
  if (cleanComment.includes('<!--ZM_REV_META:')) {
    try {
      const parts = cleanComment.split('<!--ZM_REV_META:');
      const jsonStr = parts[1].split('-->')[0];
      meta = JSON.parse(jsonStr);
      cleanComment = parts[0].trim();
    } catch (_) {}
  }
  return { cleanComment, meta };
}

/**
 * Normalizes any database row (from 'reviews' table or 'inquiries' fallback) into a standard Review object
 */
export function normalizeReview(raw) {
  if (!raw) return null;
  const rawComment = raw.comment || raw.message || raw.description || '';
  const { cleanComment, meta } = decodeReviewMeta(rawComment);

  const id = raw.id || meta.id || `REV-${Date.now()}`;
  const reviewNumber = raw.review_number || meta.review_number || (typeof id === 'string' && id.startsWith('REV-') ? id : `REV-${String(id).slice(0, 6).toUpperCase()}`);
  
  const rating = Number(raw.rating || meta.rating || 5);
  const status = raw.status || meta.status || (raw.is_published ? 'Approved' : 'Pending');
  const isPublished = raw.is_published !== undefined ? Boolean(raw.is_published) : (status === 'Approved');
  const isVerified = raw.is_verified_patient !== undefined ? Boolean(raw.is_verified_patient) : true;
  
  const author = raw.patient_name || raw.patientName || raw.author || raw.name || meta.patient_name || 'Patient';
  const phone = raw.patient_phone || raw.phone || raw.patientPhone || meta.patient_phone || '';
  const email = raw.patient_email || raw.email || raw.patientEmail || meta.patient_email || '';
  const service = raw.service_name || raw.service || raw.serviceName || meta.service_name || 'Healthcare Service';
  const clinic = raw.clinic_hub || raw.clinic || meta.clinic_hub || 'Zestmed Central Lab (GS Road)';
  const officialReply = raw.admin_reply || raw.officialReply || raw.adminReply || meta.admin_reply || null;
  const replyDate = raw.reply_date || raw.replyDate || meta.reply_date || null;
  const repliedBy = raw.replied_by || raw.repliedBy || meta.replied_by || '';

  return {
    id: reviewNumber,
    rawId: raw.id,
    reviewNumber,
    author,
    phone,
    email,
    service,
    clinic,
    rating: Math.min(5, Math.max(1, rating)),
    comment: cleanComment,
    status,
    isPublished,
    verifiedPatient: isVerified,
    officialReply,
    replyDate,
    repliedBy,
    userId: raw.user_id || raw.profile_id || meta.user_id || null,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
    date: new Date(raw.created_at || raw.createdAt || Date.now()).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  };
}

/**
 * Calculates rating distribution and average metrics from genuine review rows
 */
export function calculateRatingMetrics(reviews = []) {
  const valid = (reviews || []).filter(r => r && typeof r.rating === 'number');
  const total = valid.length;
  if (total === 0) {
    return {
      total: 0,
      average: '5.0',
      recommendationRate: '100',
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  let sum = 0;
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let recommendCount = 0;

  valid.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    dist[star] = (dist[star] || 0) + 1;
    sum += r.rating;
    if (r.rating >= 4) recommendCount++;
  });

  const avg = (sum / total).toFixed(1);
  const recRate = Math.round((recommendCount / total) * 100);

  const percentages = {
    5: Math.round((dist[5] / total) * 100),
    4: Math.round((dist[4] / total) * 100),
    3: Math.round((dist[3] / total) * 100),
    2: Math.round((dist[2] / total) * 100),
    1: Math.round((dist[1] / total) * 100)
  };

  return {
    total,
    average: avg,
    recommendationRate: recRate,
    distribution: dist,
    percentages
  };
}

/**
 * Fetch all genuine reviews from Supabase PostgreSQL and/or Backend API.
 */
export async function fetchReviews(filters = {}) {
  let dbReviews = [];

  // 1. Try Backend API first (/api/reviews)
  try {
    const res = await fetch('/api/reviews');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.reviews)) {
        dbReviews = data.reviews.map(normalizeReview).filter(Boolean);
      }
    }
  } catch (_) {}

  // 2. Try direct Supabase PostgreSQL if not retrieved via API
  if (dbReviews.length === 0 && isSupabaseConfigured()) {
    try {
      // First attempt querying 'reviews' table
      const { data: revData, error: revErr } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!revErr && Array.isArray(revData) && revData.length > 0) {
        dbReviews = revData.map(normalizeReview).filter(Boolean);
      } else {
        // Fallback: check 'inquiries' table for subject='Patient Review'
        const { data: inqData } = await supabase
          .from('inquiries')
          .select('*')
          .ilike('subject', '%Review%')
          .order('created_at', { ascending: false });

        if (Array.isArray(inqData) && inqData.length > 0) {
          dbReviews = inqData.map(normalizeReview).filter(Boolean);
        }
      }
    } catch (err) {
      console.warn('[ReviewService] Supabase fetch error:', err);
    }
  }

  // 3. Load locally cached reviews
  let localReviews = [];
  try {
    const raw = localStorage.getItem(REVIEWS_CACHE_KEY);
    if (raw) {
      localReviews = JSON.parse(raw).map(normalizeReview).filter(Boolean);
    }
  } catch (_) {}

  // 4. Strict Deduplication by reviewNumber or rawId
  const uniqueMap = new Map();
  dbReviews.forEach(r => {
    uniqueMap.set(r.reviewNumber || r.id, r);
    if (r.rawId) uniqueMap.set(r.rawId, r);
  });
  localReviews.forEach(r => {
    const key = r.reviewNumber || r.id;
    if (!uniqueMap.has(key) && (!r.rawId || !uniqueMap.has(r.rawId))) {
      uniqueMap.set(key, r);
    }
  });

  const merged = Array.from(new Set(uniqueMap.values()));
  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Cache back
  try {
    localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(merged));
  } catch (_) {}

  return merged;
}

/**
 * Submit / Create a new review permanently in Supabase PostgreSQL
 */
export async function createReview(reviewData) {
  const nowIso = new Date().toISOString();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const reviewNumber = reviewData.reviewNumber || reviewData.review_number || `REV-${randomSuffix}`;

  const ratingVal = Math.min(5, Math.max(1, Number(reviewData.rating) || 5));
  const authorName = reviewData.author || reviewData.patientName || reviewData.patient_name || 'Patient';
  const authorPhone = reviewData.phone || reviewData.patientPhone || reviewData.patient_phone || '';
  const authorEmail = reviewData.email || reviewData.patientEmail || reviewData.patient_email || '';
  const serviceName = reviewData.service || reviewData.serviceName || reviewData.service_name || 'Healthcare Service';
  const clinicHub = reviewData.clinic || reviewData.clinicHub || reviewData.clinic_hub || 'Zestmed Central Hub';
  const commentText = reviewData.comment || reviewData.message || '';
  const initialStatus = reviewData.status || 'Approved';
  const isPublished = initialStatus === 'Approved';
  const userId = reviewData.userId || reviewData.user_id || reviewData.profileId || null;

  const reviewPayload = {
    review_number: reviewNumber,
    patient_name: authorName,
    patient_phone: authorPhone,
    patient_email: authorEmail,
    service_name: serviceName,
    clinic_hub: clinicHub,
    rating: ratingVal,
    comment: commentText,
    status: initialStatus,
    is_published: isPublished,
    is_verified_patient: true,
    user_id: userId,
    created_at: nowIso,
    updated_at: nowIso
  };

  let savedRecord = null;

  // 1. Try Backend API
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewPayload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.review) {
        savedRecord = data.review;
      }
    }
  } catch (_) {}

  // 2. Direct Supabase Insert if not saved via API
  if (!savedRecord && isSupabaseConfigured()) {
    try {
      // Primary: insert into 'reviews' table
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewPayload])
        .select()
        .single();

      if (!error && data) {
        savedRecord = data;
      } else {
        // Fallback: insert into 'inquiries' table with encoded metadata
        const meta = {
          review_number: reviewNumber,
          rating: ratingVal,
          service_name: serviceName,
          clinic_hub: clinicHub,
          status: initialStatus,
          is_published: isPublished,
          user_id: userId
        };
        const encoded = encodeReviewMeta(commentText, meta);

        const { data: inqData } = await supabase
          .from('inquiries')
          .insert([{
            name: authorName,
            email: authorEmail || 'patient@zestmed.in',
            phone: authorPhone,
            subject: `Patient Review: ${serviceName}`,
            message: encoded,
            is_resolved: true,
            created_at: nowIso,
            updated_at: nowIso
          }])
          .select()
          .single();

        if (inqData) {
          savedRecord = { ...reviewPayload, id: inqData.id };
        }
      }
    } catch (err) {
      console.warn('[ReviewService] Supabase insert error:', err);
    }
  }

  const normalized = normalizeReview(savedRecord || {
    id: reviewNumber,
    ...reviewPayload
  });

  // 3. Cache locally
  try {
    const raw = localStorage.getItem(REVIEWS_CACHE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const updated = [normalized, ...list.filter(r => r.id !== normalized.id && r.reviewNumber !== normalized.reviewNumber)];
    localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(updated));
  } catch (_) {}

  // 4. Broadcast events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zestmed_review_created', { detail: normalized }));
  }

  return normalized;
}

/**
 * Update Review Status (Approved, Pending, Rejected, Flagged)
 */
export async function updateReviewStatus(reviewId, newStatus) {
  if (!reviewId || !newStatus) return false;
  const isPublished = newStatus === 'Approved';
  const nowIso = new Date().toISOString();

  // 1. Try Backend API
  try {
    await fetch('/api/reviews/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, status: newStatus, isPublished })
    });
  } catch (_) {}

  // 2. Direct Supabase Update
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('reviews').select('*');
      if (typeof reviewId === 'string' && reviewId.includes('-') && reviewId.length > 20) {
        query = query.eq('id', reviewId);
      } else {
        query = query.or(`review_number.eq.${reviewId},id.eq.${reviewId}`);
      }
      const { data: rows } = await query.limit(1);

      if (rows && rows.length > 0) {
        await supabase
          .from('reviews')
          .update({
            status: newStatus,
            is_published: isPublished,
            updated_at: nowIso
          })
          .eq('id', rows[0].id);
      }
    } catch (err) {
      console.warn('[ReviewService] updateReviewStatus error:', err);
    }
  }

  // 3. Update local cache
  try {
    const raw = localStorage.getItem(REVIEWS_CACHE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map(r => {
        if (r.id === reviewId || r.reviewNumber === reviewId || r.rawId === reviewId) {
          return {
            ...r,
            status: newStatus,
            isPublished,
            updatedAt: nowIso
          };
        }
        return r;
      });
      localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(updated));
    }
  } catch (_) {}

  // 4. Broadcast events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zestmed_review_updated', { detail: { reviewId, status: newStatus } }));
  }

  return true;
}

/**
 * Send official clinic reply to a review
 */
export async function replyToReview(reviewId, { replyText, adminName = 'Super Admin (Operations)' }) {
  if (!reviewId || !replyText) return false;
  const nowIso = new Date().toISOString();

  // 1. Try Backend API
  try {
    await fetch('/api/reviews/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, replyText, adminName })
    });
  } catch (_) {}

  // 2. Direct Supabase Update
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('reviews').select('*');
      if (typeof reviewId === 'string' && reviewId.includes('-') && reviewId.length > 20) {
        query = query.eq('id', reviewId);
      } else {
        query = query.or(`review_number.eq.${reviewId},id.eq.${reviewId}`);
      }
      const { data: rows } = await query.limit(1);

      if (rows && rows.length > 0) {
        await supabase
          .from('reviews')
          .update({
            admin_reply: replyText,
            reply_date: nowIso,
            replied_by: adminName,
            updated_at: nowIso
          })
          .eq('id', rows[0].id);
      }
    } catch (err) {
      console.warn('[ReviewService] replyToReview error:', err);
    }
  }

  // 3. Update local cache
  try {
    const raw = localStorage.getItem(REVIEWS_CACHE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map(r => {
        if (r.id === reviewId || r.reviewNumber === reviewId || r.rawId === reviewId) {
          return {
            ...r,
            officialReply: replyText,
            replyDate: nowIso,
            repliedBy: adminName,
            updatedAt: nowIso
          };
        }
        return r;
      });
      localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(updated));
    }
  } catch (_) {}

  // 4. Broadcast events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('zestmed_review_updated', { 
      detail: { reviewId, officialReply: replyText } 
    }));
  }

  return true;
}

/**
 * Get reviews submitted by a specific patient
 */
export async function getPatientReviews(userOrContact) {
  if (!userOrContact) return [];
  const all = await fetchReviews();
  const phone = String(userOrContact.phone || userOrContact || '').replace(/[^0-9]/g, '');
  const email = String(userOrContact.email || '').toLowerCase().trim();
  const userId = userOrContact.id || '';

  return all.filter(r => {
    const rPhone = String(r.phone || '').replace(/[^0-9]/g, '');
    const rEmail = String(r.email || '').toLowerCase().trim();
    if (phone && rPhone && (rPhone.endsWith(phone) || phone.endsWith(rPhone))) return true;
    if (email && rEmail && rEmail === email) return true;
    if (userId && r.userId && r.userId === userId) return true;
    return false;
  });
}
