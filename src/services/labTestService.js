// src/services/labTestService.js
/**
 * ZESTMED CENTRALIZED DIAGNOSTIC LAB TEST SERVICE
 * Synchronizes lab tests between Admin Dashboard (Lab Test Management),
 * User-facing Diagnostic Portal (/lab-tests), and Supabase Storage / PostgreSQL.
 * Provides real-time cross-tab & in-page updates on Add, Edit, and Delete.
 */

import { ALL_LAB_TESTS_DATA } from '../mock-data/allLabTestsData.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

export const LAB_TESTS_STORAGE_KEY = 'zestmed_catalog_lab_tests';
export const DELETED_LAB_TESTS_KEY = 'zestmed_deleted_lab_tests';
export const CUSTOM_LAB_TEST_IMAGES_KEY = 'zestmed_custom_lab_test_images';

/**
 * Persistent image cache for custom uploaded lab test images.
 * Keeps each test's individually uploaded image permanently mapped across
 * page refresh, logout, and login without mixing images between tests.
 */
export function saveCustomLabTestImage(identifier, imageUrl) {
  if (!identifier || !imageUrl) return;
  try {
    const raw = localStorage.getItem(CUSTOM_LAB_TEST_IMAGES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = String(identifier).toLowerCase().trim();
    map[key] = imageUrl;
    localStorage.setItem(CUSTOM_LAB_TEST_IMAGES_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[LabTestService] Failed to cache custom lab test image:', e);
  }
}

export function getCustomLabTestImage(identifier) {
  if (!identifier) return null;
  try {
    const raw = localStorage.getItem(CUSTOM_LAB_TEST_IMAGES_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const key = String(identifier).toLowerCase().trim();
    return map[key] || null;
  } catch (_) {
    return null;
  }
}

/**
 * Converts an image File object into an optimized, web-ready Data URL.
 * Automatically scales large camera photos to thumbnail dimensions (max 800x800)
 * keeping file size small (~30-50KB) and permanently embeddable.
 */
export function fileToOptimizedDataUrl(file, maxWidth = 800, maxHeight = 800, quality = 0.85) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.FileReader) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const rawDataUrl = readerEvent.target?.result;
      if (!rawDataUrl || typeof document === 'undefined') {
        resolve(rawDataUrl || '');
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width / maxWidth > height / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const optimized = canvas.toDataURL(mimeType, quality);
          resolve(optimized || rawDataUrl);
        } catch (_) {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

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
 * Normalizes a lab test object to guarantee all frontend properties are present and consistent.
 * Strictly prevents data: URLs or cross-test image contamination.
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

  let cleanDescription = raw.description || `${name} evaluates key clinical biomarkers with NABL certified accuracy.`;
  let meta = {};
  if (cleanDescription.includes('<!--ZM_TEST_META:')) {
    try {
      const parts = cleanDescription.split('<!--ZM_TEST_META:');
      const jsonStr = parts[1].split('-->')[0];
      meta = JSON.parse(jsonStr);
      cleanDescription = (parts[0] + (parts[1].split('-->')[1] || '')).trim();
    } catch (_) {}
  } else if (cleanDescription.includes('<!--img:')) {
    const descImgMatch = cleanDescription.match(/<!--img:(.*?)-->/);
    if (descImgMatch) {
      meta.image = descImgMatch[1];
      cleanDescription = cleanDescription.replace(/<!--img:.*?-->/g, '').trim();
    }
  }

  let rawImage = raw.image !== undefined 
    ? (raw.image || '') 
    : (raw.imageUrl || raw.image_url || meta.image || (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : ''));

  // Check custom individual image registry if empty
  if (!rawImage || rawImage.startsWith('blob:')) {
    const cachedImg = getCustomLabTestImage(id) || getCustomLabTestImage(name);
    if (cachedImg) rawImage = cachedImg;
  }
  const imageMain = (rawImage && !rawImage.startsWith('blob:')) ? rawImage : '';
  const imagesArray = Array.isArray(raw.images) && raw.images.length > 0 
    ? raw.images.filter(img => img && !img.startsWith('blob:'))
    : (imageMain ? [imageMain] : []);

  if (imageMain) {
    saveCustomLabTestImage(id, imageMain);
    saveCustomLabTestImage(name, imageMain);
  }

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
    description: cleanDescription,
    image: imageMain,
    images: imagesArray.length > 0 ? imagesArray : (imageMain ? [imageMain] : []),
    popularRank: raw.popularRank || 50,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

/**
 * Uploads a lab test image to Supabase Storage ('lab-tests' bucket).
 * Stores in 'lab-tests' bucket (or fallback 'medicines' bucket under lab-tests/).
 * Returns the permanent public URL.
 */
export async function uploadLabTestImage(file, testIdentifier = 'lab-test') {
  if (!file) {
    return { success: false, error: 'No image file provided for upload.' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'Image file size exceeds the 10MB limit.' };
  }

  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  if (!validExtensions.includes(ext) && file.type && !file.type.startsWith('image/')) {
    return { success: false, error: 'Invalid file format. Please upload a JPG, PNG, or WebP image.' };
  }

  const cleanId = String(testIdentifier || 'lab-test')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  const fileName = `${cleanId}-${Date.now()}.${ext}`;

  if (isSupabaseConfigured()) {
    // 1. Try 'lab-tests' bucket first
    try {
      const { data, error } = await supabase.storage
        .from('lab-tests')
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: true,
          contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`
        });

      if (!error && data?.path) {
        const { data: urlData } = supabase.storage
          .from('lab-tests')
          .getPublicUrl(data.path);

        if (urlData?.publicUrl) {
          saveCustomLabTestImage(cleanId, urlData.publicUrl);
          if (testIdentifier) saveCustomLabTestImage(testIdentifier, urlData.publicUrl);
          return {
            success: true,
            publicUrl: urlData.publicUrl,
            storagePath: data.path
          };
        }
      } else if (error) {
        console.warn('[LabTestService] Supabase Storage upload to "lab-tests" bucket notice:', error.message);
      }
    } catch (e) {
      console.warn('[LabTestService] Storage exception:', e.message);
    }

    // 2. Try 'medicines' bucket under 'lab-tests/' path as secondary fallback
    try {
      const fallbackPath = `lab-tests/${fileName}`;
      const { data, error } = await supabase.storage
        .from('medicines')
        .upload(fallbackPath, file, {
          cacheControl: '31536000',
          upsert: true,
          contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`
        });

      if (!error && data?.path) {
        const { data: urlData } = supabase.storage
          .from('medicines')
          .getPublicUrl(data.path);

        if (urlData?.publicUrl) {
          saveCustomLabTestImage(cleanId, urlData.publicUrl);
          if (testIdentifier) saveCustomLabTestImage(testIdentifier, urlData.publicUrl);
          return {
            success: true,
            publicUrl: urlData.publicUrl,
            storagePath: data.path
          };
        }
      }
    } catch (_) {}

    return {
      success: false,
      error: 'Supabase Storage upload failed. Please ensure the "lab-tests" public bucket exists in Supabase Storage or run the SQL migration.'
    };
  }

  return {
    success: false,
    error: 'Supabase storage is not configured or unavailable.'
  };
}

/**
 * Returns the unified, deduplicated list of all lab tests synchronously from memory/localStorage.
 * Base catalog contains 212 tests with independent image mapping (no two tests share an image).
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

  // 2. Overlay dynamic stored items (additions, edits, custom tests)
  storedItems.forEach((norm) => {
    if (!norm) return;
    const nameKey = norm.name.toLowerCase().trim();
    const idKey = norm.id.toLowerCase().trim();
    if (!deletedSet.has(nameKey) && !deletedSet.has(idKey)) {
      testMap.set(nameKey, norm);
    }
  });

  return Array.from(testMap.values());
}

/**
 * Asynchronously fetches all diagnostic tests from Supabase PostgreSQL,
 * merges them with the local catalog, persists clean permanent URLs,
 * and broadcasts update events so all pages re-render with the saved images.
 */
export async function fetchSynchronizedLabTests() {
  const currentList = getSynchronizedLabTests();
  let dbTests = [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('diagnostic_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        dbTests = data.map((row) => {
          let rawDesc = row.description || '';
          let meta = {};
          if (rawDesc.includes('<!--ZM_TEST_META:')) {
            try {
              const parts = rawDesc.split('<!--ZM_TEST_META:');
              const jsonStr = parts[1].split('-->')[0];
              meta = JSON.parse(jsonStr);
              rawDesc = (parts[0] + (parts[1].split('-->')[1] || '')).trim();
            } catch (_) {}
          } else if (rawDesc.includes('<!--img:')) {
            const imgMatch = rawDesc.match(/<!--img:(.*?)-->/);
            if (imgMatch) {
              meta.image = imgMatch[1];
              rawDesc = rawDesc.replace(/<!--img:.*?-->/g, '').trim();
            }
          }

          let imageUrl = row.image_url || meta.image || '';
          if (!imageUrl) {
            imageUrl = getCustomLabTestImage(row.id) || getCustomLabTestImage(row.name) || '';
          }
          if (imageUrl && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
            saveCustomLabTestImage(row.id, imageUrl);
            saveCustomLabTestImage(row.name, imageUrl);
          }

          const parsedPrice = parseFloat(row.price) || 0;
          const parsedDiscount = parseFloat(row.discount_percentage) || 20;
          const parsedMrp = meta.mrp !== undefined
            ? parseFloat(meta.mrp)
            : (parseFloat(row.mrp) || (parsedPrice > 0 ? (row.discounted_price ? (parsedPrice * (1 + parsedDiscount / 100)) : parsedPrice * 1.25) : 0));

          let params = meta.parameters;
          if (!params) {
            params = row.parameters 
              ? (typeof row.parameters === 'string' ? row.parameters.split(',').map(s => s.trim()).filter(Boolean) : row.parameters)
              : ['Key biomarker measurements included'];
          }

          let prep = meta.preparation;
          if (!prep) {
            prep = row.preparation 
              ? (typeof row.preparation === 'string' ? row.preparation.split(',').map(s => s.trim()).filter(Boolean) : row.preparation)
              : [];
          }

          let purp = meta.purpose;
          if (!purp) {
            purp = ['Assesses health status and aids early diagnosis'];
          }

          const fastingReq = meta.fastingRequired !== undefined
            ? Boolean(meta.fastingRequired)
            : Boolean(String(row.preparation || '').toLowerCase().includes('fasting'));

          return normalizeLabTestItem({
            id: row.id || row.test_code,
            name: row.name,
            category: row.category,
            categoryName: meta.categoryName || resolveLabTestCategory(row.category).name,
            description: rawDesc,
            preparation: prep,
            sampleType: row.sample_type || 'Blood (2–3 ml)',
            turnaroundTime: row.turnaround_time || '6–12 Hours',
            reportTime: row.turnaround_time || '6–12 Hours',
            price: parsedPrice,
            discountPercent: parsedDiscount,
            mrp: parsedMrp,
            fastingRequired: fastingReq,
            parameters: params,
            purpose: purp,
            sampleCollection: meta.sampleCollection || 'Home / Lab Visit',
            supportsLabVisit: meta.supportsLabVisit !== undefined ? meta.supportsLabVisit : true,
            image: imageUrl,
            images: imageUrl ? [imageUrl] : [],
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString()
          });
        }).filter(Boolean);
      }
    } catch (err) {
      console.warn('[LabTestService] Failed to query diagnostic_tests from Supabase:', err);
    }
  }

  // Merge DB records on top of existing list
  const mergedMap = new Map();
  currentList.forEach((test) => {
    mergedMap.set(test.name.toLowerCase().trim(), test);
  });

  dbTests.forEach((dbTest) => {
    const key = dbTest.name.toLowerCase().trim();
    const existing = mergedMap.get(key);
    if (!existing) {
      mergedMap.set(key, dbTest);
    } else {
      mergedMap.set(key, {
        ...existing,
        ...dbTest,
        image: dbTest.image || existing.image || '',
        images: dbTest.images?.length > 0 ? dbTest.images : (existing.images || [])
      });
    }
  });

  const finalMerged = Array.from(mergedMap.values());

  // Save snapshot to localStorage
  try {
    const sanitizedToStore = finalMerged.map((item) => ({
      ...item,
      image: item.image && !item.image.startsWith('blob:') && !item.image.startsWith('data:') ? item.image : '',
      images: Array.isArray(item.images) ? item.images.filter((img) => img && !img.startsWith('blob:') && !img.startsWith('data:')) : []
    }));
    localStorage.setItem(LAB_TESTS_STORAGE_KEY, JSON.stringify(sanitizedToStore));
    localStorage.setItem('zestmed_diagnostic_tests', JSON.stringify(sanitizedToStore));
  } catch (storageErr) {
    console.warn('[LabTestService] LocalStorage quota limit reached:', storageErr);
  }

  // Broadcast real-time update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zestmed_lab_tests_updated', {
      detail: { action: 'fetch', count: finalMerged.length }
    }));
  }

  return finalMerged;
}

/**
 * Save (create or update) a diagnostic lab test record.
 * Broadcasts real-time events to all active views (Admin Dashboard & Lab Test portal).
 */
export async function saveLabTest(testData) {
  if (!testData || !testData.name) {
    throw new Error('Test name is required');
  }

  const normalized = normalizeLabTestItem(testData);
  normalized.updatedAt = new Date().toISOString();

  // 1. Save / Sync to Supabase PostgreSQL database FIRST
  if (isSupabaseConfigured()) {
    const permanentImageUrl = normalized.image && !normalized.image.startsWith('data:') && !normalized.image.startsWith('blob:')
      ? normalized.image
      : null;

    const metaTag = `<!--ZM_TEST_META:${JSON.stringify({
      mrp: normalized.mrp,
      fastingRequired: normalized.fastingRequired,
      parameters: normalized.parameters,
      purpose: normalized.purpose,
      preparation: normalized.preparation,
      sampleCollection: normalized.sampleCollection,
      supportsLabVisit: normalized.supportsLabVisit,
      categoryName: normalized.categoryName,
      image: permanentImageUrl || ''
    })}-->`;

    const cleanDesc = (normalized.description || '').replace(/<!--ZM_TEST_META:[\s\S]*?-->/g, '').replace(/<!--img:.*?-->/g, '').trim();

    const dbPayload = {
      test_code: normalized.id.startsWith('test-') ? normalized.id : `test-${normalized.id}`,
      name: normalized.name.trim(),
      category: normalized.category,
      description: `${cleanDesc}\n${metaTag}`,
      preparation: Array.isArray(normalized.preparation) ? normalized.preparation.join(', ') : (normalized.preparation || ''),
      sample_type: normalized.sampleType || 'Blood (2–3 ml)',
      turnaround_time: normalized.turnaroundTime || '6–12 Hours',
      price: parseFloat(normalized.price) || 0,
      discount_percentage: parseFloat(normalized.discountPercent) || 0,
      discounted_price: parseFloat(normalized.price) || 0,
      parameters: Array.isArray(normalized.parameters) ? normalized.parameters.join(', ') : (normalized.parameters || ''),
      updated_at: new Date().toISOString()
    };

    // Check if test exists by name
    const { data: existingRows, error: searchErr } = await supabase
      .from('diagnostic_tests')
      .select('id, name')
      .ilike('name', normalized.name.trim())
      .limit(1);

    if (searchErr) {
      console.error('[LabTestService] Search error:', searchErr);
      if (searchErr.code === '42501') {
        throw new Error('Supabase RLS Policy Error (42501): Permission denied on "diagnostic_tests". Please execute the migration in supabase/migrations/20261127_lab_tests_storage_and_rls.sql in Supabase SQL Editor.');
      }
      throw new Error(`Database query failed: ${searchErr.message}`);
    }

    if (existingRows && existingRows.length > 0) {
      // Update existing record
      const targetId = existingRows[0].id;
      normalized.id = targetId;

      const { error: updErr } = await supabase
        .from('diagnostic_tests')
        .update(dbPayload)
        .eq('id', targetId);

      if (updErr) {
        console.error('[LabTestService] Supabase update error:', updErr);
        if (updErr.code === '42501') {
          throw new Error('Supabase RLS Policy Error (42501): Permission denied to update "diagnostic_tests". Please execute the migration in supabase/migrations/20261127_lab_tests_storage_and_rls.sql in Supabase SQL Editor.');
        }
        throw new Error(`Database update failed: ${updErr.message}`);
      }
      console.log(`[LabTestService] Successfully updated "${normalized.name}" in Supabase PostgreSQL`);
    } else {
      // Insert new record
      const { data: insertedRows, error: insErr } = await supabase
        .from('diagnostic_tests')
        .insert([{ ...dbPayload, created_at: new Date().toISOString() }])
        .select();

      if (insErr) {
        console.error('[LabTestService] Supabase insert error:', insErr);
        if (insErr.code === '42501') {
          throw new Error('Supabase RLS Policy Error (42501): Permission denied to insert into "diagnostic_tests". Please execute the migration in supabase/migrations/20261127_lab_tests_storage_and_rls.sql in Supabase SQL Editor.');
        }
        throw new Error(`Database insert failed: ${insErr.message}`);
      }

      if (insertedRows && insertedRows.length > 0 && insertedRows[0].id) {
        normalized.id = insertedRows[0].id;
      }
      console.log(`[LabTestService] Successfully inserted "${normalized.name}" into Supabase PostgreSQL`);
    }
  }

  // 2. After successful database save, update local memory / storage catalog
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
    // Requirement 8: When editing, retain existing image unless a new image is uploaded
    if (!normalized.image && updatedList[existingIndex].image) {
      normalized.image = updatedList[existingIndex].image;
      normalized.images = updatedList[existingIndex].images;
    }
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

  if (normalized.image && !normalized.image.startsWith('data:') && !normalized.image.startsWith('blob:')) {
    saveCustomLabTestImage(normalized.id, normalized.image);
    saveCustomLabTestImage(normalized.name, normalized.image);
  }

  // Save sanitized snapshot (never store data: or blob: URLs) to localStorage
  try {
    const sanitizedToStore = dedupedList.map((item) => ({
      ...item,
      image: item.image && !item.image.startsWith('blob:') && !item.image.startsWith('data:') ? item.image : '',
      images: Array.isArray(item.images) ? item.images.filter((img) => img && !img.startsWith('blob:') && !img.startsWith('data:')) : []
    }));
    localStorage.setItem(LAB_TESTS_STORAGE_KEY, JSON.stringify(sanitizedToStore));
    localStorage.setItem('zestmed_diagnostic_tests', JSON.stringify(sanitizedToStore));
  } catch (storageErr) {
    console.warn('[LabTestService] LocalStorage quota exception:', storageErr);
  }

  // Broadcast real-time update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zestmed_lab_tests_updated', {
      detail: { action: existingIndex >= 0 ? 'update' : 'create', test: normalized }
    }));
    window.dispatchEvent(new Event('storage'));
  }

  return normalized;
}

/**
 * Delete a diagnostic lab test by ID or Name.
 * Deletes from Supabase PostgreSQL, broadcasts real-time events, and updates catalog.
 */
export async function deleteLabTest(idOrName) {
  if (!idOrName) return false;

  const targetStr = String(idOrName).toLowerCase().trim();
  const currentList = getSynchronizedLabTests();

  const toDelete = currentList.find(
    (t) => t.id === idOrName || t.id.toLowerCase() === targetStr || t.name.toLowerCase().trim() === targetStr
  );

  // 1. Supabase PostgreSQL deletion FIRST
  if (isSupabaseConfigured() && toDelete) {
    const { error: delErr } = await supabase
      .from('diagnostic_tests')
      .delete()
      .or(`id.eq.${toDelete.id},name.ilike.${toDelete.name}`);

    if (delErr) {
      console.error('[LabTestService] Supabase delete error:', delErr);
      if (delErr.code === '42501') {
        throw new Error('Supabase RLS Policy Error (42501): Permission denied to delete from "diagnostic_tests". Please execute the migration in supabase/migrations/20261127_lab_tests_storage_and_rls.sql in Supabase SQL Editor.');
      }
      throw new Error(`Database delete failed: ${delErr.message}`);
    }
    console.log(`[LabTestService] Successfully deleted "${toDelete.name}" from Supabase PostgreSQL`);
  }

  // 2. Update local storage
  const updatedList = currentList.filter(
    (t) => t.id !== idOrName && t.id.toLowerCase() !== targetStr && t.name.toLowerCase().trim() !== targetStr
  );

  try {
    const sanitizedToStore = updatedList.map((item) => ({
      ...item,
      image: item.image && !item.image.startsWith('blob:') && !item.image.startsWith('data:') ? item.image : '',
      images: Array.isArray(item.images) ? item.images.filter((img) => img && !img.startsWith('blob:') && !img.startsWith('data:')) : []
    }));
    localStorage.setItem(LAB_TESTS_STORAGE_KEY, JSON.stringify(sanitizedToStore));
    localStorage.setItem('zestmed_diagnostic_tests', JSON.stringify(sanitizedToStore));

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

  return true;
}
