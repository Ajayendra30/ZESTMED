// src/services/labTestService.js
/**
 * ZESTMED CENTRALIZED DIAGNOSTIC LAB TEST SERVICE
 * Synchronizes lab tests between Admin Dashboard (Lab Test Management),
 * User-facing Diagnostic Portal (/lab-tests), and Supabase PostgreSQL.
 * Provides real-time cross-tab & in-page updates on Add, Edit, and Delete.
 */

import { ALL_LAB_TESTS_DATA } from '../mock-data/allLabTestsData.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

export const LAB_TESTS_STORAGE_KEY = 'zestmed_catalog_lab_tests';
export const DELETED_LAB_TESTS_KEY = 'zestmed_deleted_lab_tests';

export const LAB_TEST_CATEGORIES_MAP = {
  'Blood Tests': { slug: 'blood', slugs: ['blood'], name: 'Blood Tests' },
  'Blood': { slug: 'blood', slugs: ['blood'], name: 'Blood Tests' },
  'Hematology': { slug: 'blood', slugs: ['blood'], name: 'Blood Tests' },
  'Diabetes Tests': { slug: 'diabetes', slugs: ['diabetes'], name: 'Diabetes Tests' },
  'Diabetes': { slug: 'diabetes', slugs: ['diabetes'], name: 'Diabetes Tests' },
  'Heart Tests': { slug: 'heart', slugs: ['heart'], name: 'Heart Tests' },
  'Heart': { slug: 'heart', slugs: ['heart'], name: 'Heart Tests' },
  'Liver Tests': { slug: 'liver', slugs: ['liver'], name: 'Liver Tests' },
  'Liver': { slug: 'liver', slugs: ['liver'], name: 'Liver Tests' },
  'Kidney Tests': { slug: 'kidney', slugs: ['kidney'], name: 'Kidney Tests' },
  'Kidney': { slug: 'kidney', slugs: ['kidney'], name: 'Kidney Tests' },
  'Thyroid Tests': { slug: 'thyroid', slugs: ['thyroid', 'hormone'], name: 'Thyroid Tests' },
  'Thyroid': { slug: 'thyroid', slugs: ['thyroid', 'hormone'], name: 'Thyroid Tests' },
  'Hormone Tests': { slug: 'hormone', slugs: ['hormone'], name: 'Hormone Tests' },
  'Hormone': { slug: 'hormone', slugs: ['hormone'], name: 'Hormone Tests' },
  'Vitamin Tests': { slug: 'vitamin', slugs: ['vitamin'], name: 'Vitamin Tests' },
  'Vitamin': { slug: 'vitamin', slugs: ['vitamin'], name: 'Vitamin Tests' },
  'Allergy Tests': { slug: 'allergy', slugs: ['allergy'], name: 'Allergy Tests' },
  'Allergy': { slug: 'allergy', slugs: ['allergy'], name: 'Allergy Tests' },
  'Popular Tests': { slug: 'popular', slugs: ['popular'], name: 'Popular Tests' },
  'Popular': { slug: 'popular', slugs: ['popular'], name: 'Popular Tests' },
  'Biochemistry': { slug: 'liver', slugs: ['liver', 'kidney'], name: 'Biochemistry Tests' },
  'Immunology': { slug: 'blood', slugs: ['blood'], name: 'Immunology Tests' },
  'Preventive': { slug: 'popular', slugs: ['popular'], name: 'Preventive Tests' }
};

export function resolveLabTestCategory(categoryInput) {
  if (!categoryInput) {
    return { slug: 'blood', slugs: ['blood'], name: 'Blood Tests' };
  }

  const str = String(categoryInput).trim();
  if (LAB_TEST_CATEGORIES_MAP[str]) {
    return LAB_TEST_CATEGORIES_MAP[str];
  }

  const lower = str.toLowerCase();
  for (const [key, val] of Object.entries(LAB_TEST_CATEGORIES_MAP)) {
    if (key.toLowerCase() === lower || val.slug === lower) {
      return val;
    }
  }

  if (lower.includes('blood') || lower.includes('hema')) return LAB_TEST_CATEGORIES_MAP['Blood Tests'];
  if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('glucose')) return LAB_TEST_CATEGORIES_MAP['Diabetes Tests'];
  if (lower.includes('heart') || lower.includes('cardio') || lower.includes('lipid')) return LAB_TEST_CATEGORIES_MAP['Heart Tests'];
  if (lower.includes('liver') || lower.includes('lft') || lower.includes('hepatic')) return LAB_TEST_CATEGORIES_MAP['Liver Tests'];
  if (lower.includes('kidney') || lower.includes('kft') || lower.includes('renal')) return LAB_TEST_CATEGORIES_MAP['Kidney Tests'];
  if (lower.includes('thyroid') || lower.includes('t3') || lower.includes('t4') || lower.includes('tsh')) return LAB_TEST_CATEGORIES_MAP['Thyroid Tests'];
  if (lower.includes('hormone')) return LAB_TEST_CATEGORIES_MAP['Hormone Tests'];
  if (lower.includes('vitamin')) return LAB_TEST_CATEGORIES_MAP['Vitamin Tests'];
  if (lower.includes('allergy') || lower.includes('ige')) return LAB_TEST_CATEGORIES_MAP['Allergy Tests'];

  const generatedSlug = lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'blood';
  return {
    slug: generatedSlug,
    slugs: [generatedSlug],
    name: str.endsWith('Tests') ? str : `${str} Tests`
  };
}

/**
 * Normalizes a lab test object to guarantee all frontend properties are present and consistent
 */
export function normalizeLabTestItem(raw) {
  if (!raw) return null;

  const id = String(raw.id || `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const name = String(raw.name || raw.testName || '').trim();
  const catMeta = resolveLabTestCategory(raw.categoryName || raw.category || 'Blood Tests');

  const priceNum = parseFloat(raw.price) || 0;
  const mrpNum = parseFloat(raw.mrp) || (priceNum > 0 ? Math.round(priceNum * 1.25) : 0);
  const discountVal = raw.discountPercent !== undefined 
    ? parseFloat(raw.discountPercent) 
    : (raw.discount !== undefined 
      ? parseFloat(raw.discount) 
      : (mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 20));

  const sampleType = raw.sampleType || raw.sample || 'Blood (2–3 ml)';
  const turnaround = raw.reportTime || raw.turnaroundTime || raw.tat || '6–12 Hours';
  const fasting = raw.fastingRequired !== undefined 
    ? Boolean(raw.fastingRequired) 
    : (String(raw.preparation || '').toLowerCase().includes('fasting'));

  const imageMain = raw.image || raw.imageUrl || (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : '');
  const imagesArray = Array.isArray(raw.images) && raw.images.length > 0 
    ? raw.images 
    : (imageMain ? [imageMain] : []);

  let parameters = [];
  if (Array.isArray(raw.parameters)) {
    parameters = raw.parameters;
  } else if (typeof raw.parameters === 'string' && raw.parameters.trim()) {
    parameters = raw.parameters.split(',').map(s => s.trim()).filter(Boolean);
  } else if (raw.parametersCount) {
    parameters = [`${raw.parametersCount} Clinical Parameters included`];
  } else {
    parameters = ['Key biomarker measurements included'];
  }

  const parametersCount = raw.parametersCount || (Array.isArray(parameters) ? parameters.length : 10);

  let purpose = [];
  if (Array.isArray(raw.purpose)) {
    purpose = raw.purpose;
  } else if (typeof raw.purpose === 'string' && raw.purpose.trim()) {
    purpose = [raw.purpose.trim()];
  } else {
    purpose = ['Assesses health status and aids early diagnosis', 'Monitors clinical parameters and treatment progress'];
  }

  let preparation = [];
  if (Array.isArray(raw.preparation)) {
    preparation = raw.preparation;
  } else if (typeof raw.preparation === 'string' && raw.preparation.trim()) {
    preparation = [raw.preparation.trim()];
  } else {
    preparation = fasting ? ['Overnight 8-10 hrs fasting required', 'Stay hydrated with plain water'] : ['No special fasting required', 'Maintain normal diet and hydration'];
  }

  const sampleCollection = raw.sampleCollection || (raw.supportsLabVisit !== false ? 'Home / Lab Visit' : 'Home Collection');
  const supportsLabVisit = raw.supportsLabVisit !== undefined ? Boolean(raw.supportsLabVisit) : true;

  const categories = Array.isArray(raw.categories) && raw.categories.length > 0
    ? Array.from(new Set([...raw.categories, catMeta.slug]))
    : catMeta.slugs;

  return {
    id,
    name,
    category: catMeta.slug,
    categories,
    categoryName: catMeta.name,
    price: priceNum,
    mrp: mrpNum,
    discountPercent: discountVal,
    sampleType,
    reportTime: turnaround,
    turnaroundTime: turnaround,
    tat: turnaround,
    fastingRequired: fasting,
    parameters,
    parametersCount,
    purpose,
    preparation,
    sampleCollection,
    supportsLabVisit,
    available: raw.available || 'Mon – Sun',
    rating: parseFloat(raw.rating) || 4.8,
    reviewsCount: String(raw.reviewsCount || '1,250'),
    description: raw.description || `${name} evaluates key clinical biomarkers with NABL certified accuracy.`,
    image: imageMain,
    images: imagesArray,
    popularRank: raw.popularRank || 50,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

/**
 * Returns the unified, deduplicated list of all lab tests.
 * Integrates base catalog (212 tests from allLabTestsData.js) with dynamic local storage additions and edits.
 */
export function getSynchronizedLabTests() {
  let deletedSet = new Set();
  try {
    const rawDel = localStorage.getItem(DELETED_LAB_TESTS_KEY);
    if (rawDel) {
      const arr = JSON.parse(rawDel);
      if (Array.isArray(arr)) {
        arr.forEach(item => {
          if (item) deletedSet.add(String(item).toLowerCase().trim());
        });
      }
    }
  } catch (_) {}

  let storedItems = [];
  try {
    const rawStored = localStorage.getItem(LAB_TESTS_STORAGE_KEY);
    if (rawStored) {
      const parsed = JSON.parse(rawStored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        storedItems = parsed.map(normalizeLabTestItem).filter(Boolean);
      }
    }
  } catch (_) {}

  // Map to hold unique tests by lowercase trimmed test name
  const testMap = new Map();

  // 1. Seed base catalogue from ALL_LAB_TESTS_DATA (212 tests)
  ALL_LAB_TESTS_DATA.forEach((raw) => {
    const norm = normalizeLabTestItem(raw);
    if (!norm) return;
    const nameKey = norm.name.toLowerCase().trim();
    const idKey = norm.id.toLowerCase().trim();
    if (!deletedSet.has(nameKey) && !deletedSet.has(idKey)) {
      testMap.set(nameKey, norm);
    }
  });

  // 2. Overlay / prepend dynamic stored items (allows additions, edits, and image updates)
  storedItems.forEach((norm) => {
    if (!norm) return;
    const nameKey = norm.name.toLowerCase().trim();
    const idKey = norm.id.toLowerCase().trim();
    if (!deletedSet.has(nameKey) && !deletedSet.has(idKey)) {
      testMap.set(nameKey, norm);
    }
  });

  const merged = Array.from(testMap.values());

  // Save back normalized snapshot so all views read the identical verified list
  try {
    localStorage.setItem(LAB_TESTS_STORAGE_KEY, JSON.stringify(merged));
    // Also keep legacy key synced for compatibility
    localStorage.setItem('zestmed_diagnostic_tests', JSON.stringify(merged));
  } catch (_) {}

  return merged;
}

/**
 * Save (create or update) a diagnostic lab test record.
 * Broadcasts real-time events to all active views (Admin Dashboard & Lab Test portal).
 */
export function saveLabTest(testData) {
  if (!testData || !testData.name) {
    throw new Error('Test name is required');
  }

  const normalized = normalizeLabTestItem(testData);
  normalized.updatedAt = new Date().toISOString();

  const currentList = getSynchronizedLabTests();
  const nameKey = normalized.name.toLowerCase().trim();
  const idKey = normalized.id.toLowerCase().trim();

  // Remove matching ID or name from deleted blacklist if re-added
  try {
    const rawDel = localStorage.getItem(DELETED_LAB_TESTS_KEY);
    if (rawDel) {
      const arr = JSON.parse(rawDel);
      if (Array.isArray(arr)) {
        const cleaned = arr.filter(
          (k) => String(k).toLowerCase().trim() !== nameKey && String(k).toLowerCase().trim() !== idKey
        );
        localStorage.setItem(DELETED_LAB_TESTS_KEY, JSON.stringify(cleaned));
      }
    }
  } catch (_) {}

  const existingIndex = currentList.findIndex(
    (t) => t.id === normalized.id || t.name.toLowerCase().trim() === nameKey
  );

  let updatedList = [];
  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...normalized };
  } else {
    updatedList = [normalized, ...currentList];
  }

  // Deduplicate strictly by name
  const seenNames = new Set();
  const dedupedList = [];
  updatedList.forEach((t) => {
    const k = t.name.toLowerCase().trim();
    if (!seenNames.has(k)) {
      seenNames.add(k);
      dedupedList.push(t);
    }
  });

  try {
    localStorage.setItem(LAB_TESTS_STORAGE_KEY, JSON.stringify(dedupedList));
    localStorage.setItem('zestmed_diagnostic_tests', JSON.stringify(dedupedList));
  } catch (_) {}

  // Broadcast real-time update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zestmed_lab_tests_updated', {
      detail: { action: existingIndex >= 0 ? 'update' : 'create', test: normalized }
    }));
    window.dispatchEvent(new Event('storage'));
  }

  // Background Supabase sync if configured
  if (isSupabaseConfigured()) {
    try {
      supabase
        .from('test_catalog')
        .upsert({
          name: normalized.name,
          category: normalized.category,
          sample_type: normalized.sampleType,
          tat: normalized.turnaroundTime,
          price: normalized.price,
          mrp: normalized.mrp,
          fasting_required: normalized.fastingRequired,
          description: normalized.description,
          image_url: normalized.image && !normalized.image.startsWith('data:') ? normalized.image : null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'name' })
        .then(() => {})
        .catch(() => {});
    } catch (_) {}
  }

  return normalized;
}

/**
 * Delete a diagnostic lab test by ID or Name.
 * Broadcasts real-time events to all active views.
 */
export function deleteLabTest(idOrName) {
  if (!idOrName) return false;

  const targetStr = String(idOrName).toLowerCase().trim();
  const currentList = getSynchronizedLabTests();

  const toDelete = currentList.find(
    (t) => t.id === idOrName || t.id.toLowerCase() === targetStr || t.name.toLowerCase().trim() === targetStr
  );

  const updatedList = currentList.filter(
    (t) => t.id !== idOrName && t.id.toLowerCase() !== targetStr && t.name.toLowerCase().trim() !== targetStr
  );

  try {
    localStorage.setItem(LAB_TESTS_STORAGE_KEY, JSON.stringify(updatedList));
    localStorage.setItem('zestmed_diagnostic_tests', JSON.stringify(updatedList));

    // Record into deleted blacklist so base mock catalogue doesn't recreate it on refresh
    const rawDel = localStorage.getItem(DELETED_LAB_TESTS_KEY);
    const delList = rawDel ? JSON.parse(rawDel) : [];
    const keysToAdd = [idOrName, targetStr];
    if (toDelete?.name) keysToAdd.push(toDelete.name.toLowerCase().trim());
    if (toDelete?.id) keysToAdd.push(toDelete.id.toLowerCase().trim());
    const newDel = Array.from(new Set([...delList, ...keysToAdd]));
    localStorage.setItem(DELETED_LAB_TESTS_KEY, JSON.stringify(newDel));
  } catch (_) {}

  // Broadcast real-time update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zestmed_lab_tests_updated', {
      detail: { action: 'delete', id: idOrName, name: toDelete?.name }
    }));
    window.dispatchEvent(new Event('storage'));
  }

  // Background Supabase deletion attempt
  if (isSupabaseConfigured() && toDelete) {
    try {
      supabase
        .from('test_catalog')
        .delete()
        .ilike('name', toDelete.name)
        .then(() => {})
        .catch(() => {});
    } catch (_) {}
  }

  return true;
}
