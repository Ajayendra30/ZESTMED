// src/services/medicineService.js
/**
 * ZESTMED CENTRALIZED MEDICINE CATALOG SERVICE
 * Synchronizes medicines between Admin Dashboard (Medicine Management),
 * User-facing Medicine Store (/medicines), and Supabase Storage / PostgreSQL.
 * Provides real-time cross-tab & in-page updates on Add, Edit, and Delete.
 */

import { ALL_MEDICINES_DATA } from '../mock-data/allMedicinesData.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

export const MEDICINES_STORAGE_KEY = 'zestmed_inventory_medicines';
export const DELETED_MEDICINES_KEY = 'zestmed_deleted_medicines';
export const CUSTOM_MEDICINE_IMAGES_KEY = 'zestmed_custom_medicine_images';

/**
 * Persistent storage for custom uploaded medicine images.
 * Keeps uploaded images permanently stored across page refresh, logout, and login
 * even if Supabase Storage bucket is not available or restricted.
 */
export function saveCustomMedicineImage(identifier, imageUrl) {
  if (!identifier || !imageUrl) return;
  try {
    const raw = localStorage.getItem(CUSTOM_MEDICINE_IMAGES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = String(identifier).toLowerCase().trim();
    map[key] = imageUrl;
    localStorage.setItem(CUSTOM_MEDICINE_IMAGES_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[MedicineService] Failed to cache custom medicine image:', e);
  }
}

export function getCustomMedicineImage(identifier) {
  if (!identifier) return null;
  try {
    const raw = localStorage.getItem(CUSTOM_MEDICINE_IMAGES_KEY);
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
 * Automatically resizes large camera photos to thumbnail dimensions (max 800x800)
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

export const MEDICINE_CATEGORIES_MAP = {
  'General Medicines': { slug: 'general', slugs: ['general'], name: 'General Medicines' },
  'Pain Relief & Fever': { slug: 'pain', slugs: ['pain', 'fever'], name: 'Pain Relief & Fever' },
  'Pain Relief': { slug: 'pain', slugs: ['pain'], name: 'Pain Relief' },
  'Fever': { slug: 'fever', slugs: ['fever', 'pain'], name: 'Fever' },
  'Diabetes Care': { slug: 'diabetes', slugs: ['diabetes'], name: 'Diabetes Care' },
  'Diabetes': { slug: 'diabetes', slugs: ['diabetes'], name: 'Diabetes' },
  'Cardiac & BP': { slug: 'heart', slugs: ['heart'], name: 'Cardiac & BP' },
  'Heart Care': { slug: 'heart', slugs: ['heart'], name: 'Heart Care' },
  'Vitamins & Supplements': { slug: 'vitamins', slugs: ['vitamins'], name: 'Vitamins & Supplements' },
  'Antibiotics': { slug: 'antibiotics', slugs: ['antibiotics'], name: 'Antibiotics' },
  'Digestive Health': { slug: 'digestive', slugs: ['digestive'], name: 'Digestive Health' },
  'Digestive Care': { slug: 'digestive', slugs: ['digestive'], name: 'Digestive Care' },
  'Skin Care': { slug: 'skin', slugs: ['skin'], name: 'Skin Care' },
  'Respiratory Care': { slug: 'respiratory', slugs: ['respiratory'], name: 'Respiratory Care' }
};

export function resolveCategoryMetadata(categoryInput) {
  if (!categoryInput) {
    return { slug: 'general', slugs: ['general'], name: 'General Medicines' };
  }

  const str = String(categoryInput).trim();
  if (MEDICINE_CATEGORIES_MAP[str]) {
    return MEDICINE_CATEGORIES_MAP[str];
  }

  // Check lowercase match
  const lower = str.toLowerCase();
  for (const [key, val] of Object.entries(MEDICINE_CATEGORIES_MAP)) {
    if (key.toLowerCase() === lower || val.slug === lower) {
      return val;
    }
  }

  if (lower.includes('pain') || lower.includes('fever')) {
    return MEDICINE_CATEGORIES_MAP['Pain Relief & Fever'];
  }
  if (lower.includes('diabet')) {
    return MEDICINE_CATEGORIES_MAP['Diabetes Care'];
  }
  if (lower.includes('heart') || lower.includes('cardiac') || lower.includes('bp')) {
    return MEDICINE_CATEGORIES_MAP['Cardiac & BP'];
  }
  if (lower.includes('vitamin') || lower.includes('supplement')) {
    return MEDICINE_CATEGORIES_MAP['Vitamins & Supplements'];
  }
  if (lower.includes('antibiotic')) {
    return MEDICINE_CATEGORIES_MAP['Antibiotics'];
  }
  if (lower.includes('digest') || lower.includes('gut') || lower.includes('stomach')) {
    return MEDICINE_CATEGORIES_MAP['Digestive Health'];
  }
  if (lower.includes('skin') || lower.includes('derma')) {
    return MEDICINE_CATEGORIES_MAP['Skin Care'];
  }

  const generatedSlug = lower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';
  return {
    slug: generatedSlug,
    slugs: [generatedSlug],
    name: str
  };
}

/**
 * Normalizes a medicine object to guarantee all frontend properties are present and consistent
 */
export function normalizeMedicineItem(raw) {
  if (!raw) return null;

  let rawDesc = String(raw.shortDescription || raw.description || '');
  let metaExtracted = {};
  if (rawDesc.includes('<!--ZM_META:')) {
    try {
      const parts = rawDesc.split('<!--ZM_META:');
      const jsonStr = parts[1].split('-->')[0];
      metaExtracted = JSON.parse(jsonStr);
      rawDesc = (parts[0] + (parts[1].split('-->')[1] || '')).trim();
    } catch (_) {}
  }

  const id = String(raw.id || `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const name = String(raw.name || raw.brandName || '').trim();
  const catInput = raw.categoryName || raw.categoryLong || raw.category || metaExtracted.categoryName || 'General Medicines';
  const catMeta = resolveCategoryMetadata(catInput);

  const priceNum = parseFloat(raw.price) || 0;
  const mrpNum = parseFloat(raw.mrp || metaExtracted.mrp) || (priceNum > 0 ? Math.round(priceNum * 1.25) : 0);
  const discountVal = raw.discount !== undefined 
    ? parseFloat(raw.discount) 
    : (raw.discountPercent !== undefined 
      ? parseFloat(raw.discountPercent) 
      : (mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0));

  const stockNum = raw.stock !== undefined 
    ? parseInt(raw.stock, 10) 
    : (raw.stockQuantity !== undefined ? parseInt(raw.stockQuantity, 10) : 100);

  const inStockBool = raw.inStock !== undefined 
    ? Boolean(raw.inStock) 
    : stockNum > 0;

  let imageMain = raw.image || raw.imageUrl || raw.image_url || (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : '');
  if (!imageMain) {
    const cachedImg = getCustomMedicineImage(id) || getCustomMedicineImage(name);
    if (cachedImg) imageMain = cachedImg;
  }
  const imagesArray = Array.isArray(raw.images) && raw.images.length > 0 
    ? raw.images 
    : (imageMain ? [imageMain] : []);

  const dosageType = raw.type || raw.dosageType || raw.dosage_form || 'Tablet';
  const packSize = raw.packSize || raw.pack || `Strip of 10 ${dosageType}s`;
  const generic = String(raw.genericName || raw.generic_name || raw.composition || 'Active Pharmaceutical Ingredient').trim();
  const composition = String(raw.composition || raw.compositionLong || generic).trim();

  const dosage = raw.dosage || raw.dosageText || metaExtracted.dosage || 'As prescribed by the physician.';
  const expiry = raw.expiry || metaExtracted.expiry || 'Dec 2027';
  const storage = raw.storage || metaExtracted.storage || 'Store below 25°C, away from moisture';
  const descText = rawDesc || `${name} (${composition}) is formulated for effective therapeutic care.`;

  return {
    id,
    name,
    genericName: generic,
    composition,
    compositionLong: raw.compositionLong || composition,
    type: dosageType,
    dosageType,
    pack: packSize,
    packSize,
    brand: raw.brand || raw.manufacturer || 'Apex Healthcare Labs',
    manufacturer: raw.manufacturer || raw.brand || 'Apex Healthcare Labs',
    category: catMeta.slug,
    categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories : catMeta.slugs,
    categoryName: catMeta.name,
    categoryLong: raw.categoryLong || catMeta.name,
    price: priceNum,
    mrp: mrpNum,
    discount: discountVal,
    discountPercent: discountVal,
    stock: stockNum,
    stockQuantity: stockNum,
    threshold: parseInt(raw.threshold, 10) || 20,
    inStock: inStockBool,
    stockText: inStockBool ? 'In Stock' : 'Out of Stock',
    stockCount: raw.stockCount || `${stockNum} units`,
    expiry,
    batchNo: raw.batchNo || `B-${Math.floor(100 + Math.random() * 900)}`,
    rackLocation: raw.rackLocation || 'GUW-WH-A05',
    storage,
    shortDescription: descText,
    description: descText,
    uses: raw.uses || raw.usesText || 'Relieves symptoms as directed by a healthcare professional.',
    usesText: raw.usesText || raw.uses || 'Relieves symptoms as directed by a healthcare professional.',
    dosage,
    dosageText: dosage,
    prescriptionRequired: Boolean(raw.prescriptionRequired || raw.prescription_required),
    rating: parseFloat(raw.rating) || 4.5,
    reviewsCount: String(raw.reviewsCount || '120'),
    image: imageMain,
    images: imagesArray,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString()
  };
}

/**
 * Uploads a medicine image to Supabase Storage ('medicines' bucket).
 * Stores image as a permanent public asset and returns the public URL.
 */
export async function uploadMedicineImage(file, medicineIdentifier = '') {
  if (!file) {
    return { success: false, error: 'No file provided for upload' };
  }

  // File type validation
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const ext = (file.name ? file.name.split('.').pop() : 'png').toLowerCase();
  
  if (!validExtensions.includes(ext) && file.type && !file.type.startsWith('image/')) {
    return { 
      success: false, 
      error: 'Invalid file format. Please upload a JPG, PNG, or WebP image.' 
    };
  }

  // File size validation (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { 
      success: false, 
      error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.` 
    };
  }

  // Sanitize file name for cloud storage
  const cleanPrefix = (medicineIdentifier || 'med')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  const fileName = `${cleanPrefix}-${Date.now()}.${ext}`;
  const filePath = `products/${fileName}`;

  // Upload to Supabase Storage bucket 'medicines'
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.storage
        .from('medicines')
        .upload(filePath, file, {
          cacheControl: '31536000', // 1 year cache
          upsert: true,
          contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`
        });

      if (!error && data?.path) {
        const { data: urlData } = supabase.storage
          .from('medicines')
          .getPublicUrl(data.path);

        if (urlData?.publicUrl) {
          saveCustomMedicineImage(cleanPrefix, urlData.publicUrl);
          if (medicineIdentifier) saveCustomMedicineImage(medicineIdentifier, urlData.publicUrl);
          return {
            success: true,
            publicUrl: urlData.publicUrl,
            storagePath: data.path
          };
        }
      } else {
        const errMsg = error?.message || 'Bucket not found';
        console.warn('[MedicineService] Supabase Storage upload error:', errMsg);
        return {
          success: false,
          error: errMsg.includes('Bucket not found') || errMsg.includes('not found')
            ? 'Supabase Storage bucket "medicines" not found. Please create the "medicines" bucket with public access in Supabase Storage or run the SQL migration.'
            : `Supabase Storage upload failed: ${errMsg}`
        };
      }
    } catch (storageException) {
      console.warn('[MedicineService] Supabase Storage exception:', storageException?.message);
      return {
        success: false,
        error: `Supabase Storage upload exception: ${storageException?.message}`
      };
    }
  }

  return { 
    success: false, 
    error: 'Supabase storage is not configured or unavailable.' 
  };
}

/**
 * Returns the unified list of all medicines synchronously from memory/localStorage.
 * Never stores large base64 strings in localStorage to avoid quota errors.
 */
export function getSynchronizedMedicines() {
  let deletedSet = new Set();
  try {
    const rawDel = localStorage.getItem(DELETED_MEDICINES_KEY);
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
    const rawStored = localStorage.getItem(MEDICINES_STORAGE_KEY);
    if (rawStored) {
      const parsed = JSON.parse(rawStored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        storedItems = parsed.map(normalizeMedicineItem).filter(Boolean);
      }
    }
  } catch (_) {}

  // Build merged map starting from default catalog (all 37 medicines from Medicine page)
  const medicineMap = new Map();

  // 1. Seed base catalogue from ALL_MEDICINES_DATA
  ALL_MEDICINES_DATA.forEach((raw) => {
    const norm = normalizeMedicineItem(raw);
    if (!norm) return;
    const nameKey = norm.name.toLowerCase().trim();
    const idKey = norm.id.toLowerCase().trim();
    if (!deletedSet.has(nameKey) && !deletedSet.has(idKey)) {
      medicineMap.set(nameKey, norm);
    }
  });

  // 2. Overlay dynamic stored items (additions, edits, custom stock)
  storedItems.forEach((norm) => {
    if (!norm) return;
    const nameKey = norm.name.toLowerCase().trim();
    const idKey = norm.id.toLowerCase().trim();
    if (!deletedSet.has(nameKey) && !deletedSet.has(idKey)) {
      medicineMap.set(nameKey, norm);
    }
  });

  return Array.from(medicineMap.values());
}

/**
 * Asynchronously fetches all medicine records from Supabase PostgreSQL,
 * merges them with the local catalog, persists clean permanent URLs to localStorage,
 * and broadcasts update events so all pages re-render with the saved images.
 */
export async function fetchSynchronizedMedicines() {
  const currentList = getSynchronizedMedicines();
  let dbMedicines = [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        dbMedicines = data.map((row) => {
          let rawDesc = row.description || '';
          let meta = {};
          if (rawDesc.includes('<!--ZM_META:')) {
            try {
              const parts = rawDesc.split('<!--ZM_META:');
              const jsonStr = parts[1].split('-->')[0];
              meta = JSON.parse(jsonStr);
              rawDesc = (parts[0] + (parts[1].split('-->')[1] || '')).trim();
            } catch (_) {}
          }

          const parsedPrice = parseFloat(row.price) || 0;
          const parsedDiscount = parseFloat(row.discount_percentage) || 0;
          const parsedMrp = meta.mrp !== undefined 
            ? parseFloat(meta.mrp) 
            : (row.discounted_price ? (parsedPrice * (1 + parsedDiscount / 100)) : parsedPrice * 1.25);

          return normalizeMedicineItem({
            id: row.id,
            name: row.name,
            genericName: row.generic_name || row.composition,
            composition: row.composition || row.generic_name,
            compositionLong: row.composition || row.generic_name,
            categoryName: meta.categoryName || row.category_name || 'General Medicines',
            type: row.dosage_form || 'Tablet',
            dosageType: row.dosage_form || 'Tablet',
            packSize: row.pack_size || `Strip of 10 ${row.dosage_form || 'Tablet'}s`,
            pack: row.pack_size || `Strip of 10 ${row.dosage_form || 'Tablet'}s`,
            brand: row.manufacturer || 'Apex Healthcare Labs',
            manufacturer: row.manufacturer || 'Apex Healthcare Labs',
            price: parsedPrice,
            mrp: parsedMrp,
            discount: parsedDiscount,
            discountPercent: parsedDiscount,
            stock: parseInt(row.stock_quantity, 10) || 100,
            stockQuantity: parseInt(row.stock_quantity, 10) || 100,
            inStock: row.in_stock !== false,
            stockText: row.in_stock !== false ? 'In Stock' : 'Out of Stock',
            shortDescription: rawDesc || `${row.name} for clinical therapeutic care.`,
            description: rawDesc || `${row.name} is formulated for effective therapeutic care.`,
            uses: row.uses || 'Relieves symptoms as directed by a healthcare professional.',
            dosage: meta.dosage || row.dosage || 'As prescribed by the physician.',
            expiry: meta.expiry || row.expiry || 'Dec 2027',
            storage: meta.storage || row.storage || 'Store below 25°C, away from moisture',
            prescriptionRequired: Boolean(row.prescription_required),
            image: row.image_url || '',
            images: row.image_url ? [row.image_url] : [],
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString()
          });
        }).filter(Boolean);
      }
    } catch (err) {
      console.warn('[MedicineService] Failed to query medicines from Supabase:', err);
    }
  }

  // Merge: Supabase records take top priority
  let deletedSet = new Set();
  try {
    const rawDel = localStorage.getItem(DELETED_MEDICINES_KEY);
    if (rawDel) {
      const arr = JSON.parse(rawDel);
      if (Array.isArray(arr)) {
        arr.forEach(k => k && deletedSet.add(String(k).toLowerCase().trim()));
      }
    }
  } catch (_) {}

  const mergedMap = new Map();

  // 1. Base list
  currentList.forEach((m) => {
    const k = m.name.toLowerCase().trim();
    if (!deletedSet.has(k)) mergedMap.set(k, m);
  });

  // 2. Overlay live Supabase database records
  dbMedicines.forEach((dbMed) => {
    const k = dbMed.name.toLowerCase().trim();
    if (!deletedSet.has(k)) {
      const existing = mergedMap.get(k);
      mergedMap.set(k, {
        ...(existing || {}),
        ...dbMed,
        image: dbMed.image || existing?.image || '',
        images: dbMed.images?.length > 0 ? dbMed.images : (existing?.images || [])
      });
    }
  });

  const finalMerged = Array.from(mergedMap.values());

  // Save snapshot back to localStorage
  try {
    const toStore = finalMerged.map(item => {
      if (item.image && !item.image.startsWith('data:')) {
        saveCustomMedicineImage(item.id, item.image);
        saveCustomMedicineImage(item.name, item.image);
      }
      return {
        ...item,
        image: item.image && item.image.startsWith('data:') ? '' : item.image,
        images: Array.isArray(item.images) ? item.images.filter(img => !img.startsWith('data:')) : []
      };
    });
    localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(toStore));
  } catch (storageErr) {
    console.warn('[MedicineService] LocalStorage quota limit reached:', storageErr);
  }

  // Broadcast real-time update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zestmed_medicines_updated', {
      detail: { action: 'fetch', count: finalMerged.length }
    }));
  }

  return finalMerged;
}

/**
 * Save (create or update) a medicine record.
 * Permanently stores the record in Supabase PostgreSQL and Storage,
 * and broadcasts real-time events to all active views.
 */
export async function saveMedicine(medicineData) {
  if (!medicineData || !medicineData.name) {
    throw new Error('Medicine name is required');
  }

  const normalized = normalizeMedicineItem(medicineData);
  normalized.updatedAt = new Date().toISOString();

  // 1. Save / Sync to Supabase PostgreSQL database FIRST
  if (isSupabaseConfigured()) {
    const permanentImageUrl = normalized.image && !normalized.image.startsWith('data:') && !normalized.image.startsWith('blob:')
      ? normalized.image
      : null;

    const metaTag = `<!--ZM_META:${JSON.stringify({
      categoryName: normalized.categoryName,
      mrp: normalized.mrp,
      dosage: normalized.dosage,
      expiry: normalized.expiry,
      storage: normalized.storage
    })}-->`;

    const dbPayload = {
      name: normalized.name.trim(),
      generic_name: normalized.genericName || normalized.composition,
      manufacturer: normalized.manufacturer || normalized.brand,
      prescription_required: Boolean(normalized.prescriptionRequired),
      dosage_form: normalized.type || 'Tablet',
      pack_size: normalized.packSize || normalized.pack,
      price: parseFloat(normalized.price) || 0,
      discount_percentage: parseFloat(normalized.discount) || 0,
      discounted_price: parseFloat(normalized.price) || 0,
      in_stock: Boolean(normalized.inStock),
      stock_quantity: parseInt(normalized.stock, 10) || 100,
      description: `${normalized.shortDescription || normalized.description || ''}\n${metaTag}`,
      composition: normalized.composition,
      uses: normalized.uses,
      image_url: permanentImageUrl,
      updated_at: new Date().toISOString()
    };

    // Check if medicine with this name already exists in Supabase
    const { data: existingRows, error: searchErr } = await supabase
      .from('medicines')
      .select('id, name')
      .ilike('name', normalized.name.trim())
      .limit(1);

    if (searchErr) {
      console.error('[MedicineService] Search error:', searchErr);
      if (searchErr.code === '42501') {
        throw new Error('Supabase RLS Policy Error (42501): Permission denied on "medicines". Please execute the migration in supabase/migrations/20261127_medicines_storage_and_rls.sql in Supabase SQL Editor.');
      }
      throw new Error(`Database query failed: ${searchErr.message}`);
    }

    if (existingRows && existingRows.length > 0) {
      // Update existing record
      const targetId = existingRows[0].id;
      normalized.id = targetId;

      const { error: updErr } = await supabase
        .from('medicines')
        .update(dbPayload)
        .eq('id', targetId);

      if (updErr) {
        console.error('[MedicineService] Supabase PostgreSQL update error:', updErr);
        if (updErr.code === '42501') {
          throw new Error('Supabase RLS Policy Error (42501): Permission denied to update "medicines". Please execute the migration in supabase/migrations/20261127_medicines_storage_and_rls.sql in Supabase SQL Editor.');
        }
        throw new Error(`Database update failed: ${updErr.message}`);
      }
      console.log(`[MedicineService] Successfully updated "${normalized.name}" in Supabase PostgreSQL`);
    } else {
      // Insert new record
      const { data: insertedRows, error: insErr } = await supabase
        .from('medicines')
        .insert([dbPayload])
        .select();

      if (insErr) {
        console.error('[MedicineService] Supabase PostgreSQL insert error:', insErr);
        if (insErr.code === '42501') {
          throw new Error('Supabase RLS Policy Error (42501): Permission denied to insert into "medicines". Please execute the migration in supabase/migrations/20261127_medicines_storage_and_rls.sql in Supabase SQL Editor.');
        }
        throw new Error(`Database insert failed: ${insErr.message}`);
      }

      if (insertedRows && insertedRows.length > 0 && insertedRows[0].id) {
        normalized.id = insertedRows[0].id;
      }
      console.log(`[MedicineService] Successfully inserted "${normalized.name}" into Supabase PostgreSQL`);
    }
  }

  // 2. After successful database save, update local memory / storage cache
  const currentList = getSynchronizedMedicines();
  const nameKey = normalized.name.toLowerCase().trim();
  const idKey = normalized.id.toLowerCase().trim();

  // Remove matching ID or name from deleted blacklist if re-added
  try {
    const rawDel = localStorage.getItem(DELETED_MEDICINES_KEY);
    if (rawDel) {
      const arr = JSON.parse(rawDel);
      if (Array.isArray(arr)) {
        const cleaned = arr.filter(
          (k) => String(k).toLowerCase().trim() !== nameKey && String(k).toLowerCase().trim() !== idKey
        );
        localStorage.setItem(DELETED_MEDICINES_KEY, JSON.stringify(cleaned));
      }
    }
  } catch (_) {}

  const existingIndex = currentList.findIndex(
    (m) => m.id === normalized.id || m.name.toLowerCase().trim() === nameKey
  );

  let updatedList = [];
  if (existingIndex >= 0) {
    updatedList = [...currentList];
    const existingImage = updatedList[existingIndex].image;
    const finalImage = normalized.image || existingImage || '';
    updatedList[existingIndex] = {
      ...updatedList[existingIndex],
      ...normalized,
      image: finalImage,
      images: [finalImage]
    };
  } else {
    updatedList = [normalized, ...currentList];
  }

  // Deduplicate strictly by name
  const seenNames = new Set();
  const dedupedList = [];
  updatedList.forEach((m) => {
    const k = m.name.toLowerCase().trim();
    if (!seenNames.has(k)) {
      seenNames.add(k);
      dedupedList.push(m);
    }
  });

  // Save to localStorage safely (never store base64 data URLs)
  try {
    const cleanForStorage = dedupedList.map(item => ({
      ...item,
      image: item.image && item.image.startsWith('data:') ? '' : item.image,
      images: Array.isArray(item.images) ? item.images.filter(img => !img.startsWith('data:')) : []
    }));
    localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(cleanForStorage));
  } catch (storageErr) {
    console.warn('[MedicineService] LocalStorage quota exception:', storageErr);
  }

  // Broadcast real-time update events immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zestmed_medicines_updated', {
      detail: { action: existingIndex >= 0 ? 'update' : 'create', medicine: normalized }
    }));
    window.dispatchEvent(new Event('storage'));
  }

  return normalized;
}

/**
 * Delete a medicine by ID or Name.
 * Deletes from Supabase PostgreSQL, broadcasts real-time events, and updates catalog.
 */
export async function deleteMedicine(idOrName) {
  if (!idOrName) return false;

  const targetStr = String(idOrName).toLowerCase().trim();
  const currentList = getSynchronizedMedicines();

  const toDelete = currentList.find(
    (m) => m.id === idOrName || m.id.toLowerCase() === targetStr || m.name.toLowerCase().trim() === targetStr
  );

  // 1. Supabase PostgreSQL deletion FIRST
  if (isSupabaseConfigured() && toDelete) {
    const { error: delErr } = await supabase
      .from('medicines')
      .delete()
      .or(`id.eq.${toDelete.id},name.ilike.${toDelete.name}`);

    if (delErr) {
      console.error('[MedicineService] Supabase delete error:', delErr);
      if (delErr.code === '42501') {
        throw new Error('Supabase RLS Policy Error (42501): Permission denied to delete from "medicines". Please execute the migration in supabase/migrations/20261127_medicines_storage_and_rls.sql in Supabase SQL Editor.');
      }
      throw new Error(`Database delete failed: ${delErr.message}`);
    }
    console.log(`[MedicineService] Successfully deleted "${toDelete.name}" from Supabase PostgreSQL`);
  }

  // 2. Update local storage
  const updatedList = currentList.filter(
    (m) => m.id !== idOrName && m.id.toLowerCase() !== targetStr && m.name.toLowerCase().trim() !== targetStr
  );

  try {
    localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(updatedList));

    // Record into deleted blacklist so base catalogue doesn't recreate it on refresh
    const rawDel = localStorage.getItem(DELETED_MEDICINES_KEY);
    const delList = rawDel ? JSON.parse(rawDel) : [];
    const keysToAdd = [idOrName, targetStr];
    if (toDelete?.name) keysToAdd.push(toDelete.name.toLowerCase().trim());
    if (toDelete?.id) keysToAdd.push(toDelete.id.toLowerCase().trim());
    const newDel = Array.from(new Set([...delList, ...keysToAdd]));
    localStorage.setItem(DELETED_MEDICINES_KEY, JSON.stringify(newDel));
  } catch (_) {}

  // Broadcast real-time update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zestmed_medicines_updated', {
      detail: { action: 'delete', id: idOrName, name: toDelete?.name }
    }));
    window.dispatchEvent(new Event('storage'));
  }

  return true;
}
