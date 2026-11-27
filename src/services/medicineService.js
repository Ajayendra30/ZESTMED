// src/services/medicineService.js
/**
 * ZESTMED CENTRALIZED MEDICINE CATALOG SERVICE
 * Synchronizes medicines between Admin Dashboard (Medicine Management),
 * User-facing Medicine Store (/medicines), and Supabase PostgreSQL.
 * Provides real-time cross-tab & in-page updates on Add, Edit, and Delete.
 */

import { ALL_MEDICINES_DATA } from '../mock-data/allMedicinesData.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

export const MEDICINES_STORAGE_KEY = 'zestmed_inventory_medicines';
export const DELETED_MEDICINES_KEY = 'zestmed_deleted_medicines';

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

  const id = String(raw.id || `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const name = String(raw.name || raw.brandName || '').trim();
  const catMeta = resolveCategoryMetadata(raw.categoryName || raw.categoryLong || raw.category || 'General Medicines');

  const priceNum = parseFloat(raw.price) || 0;
  const mrpNum = parseFloat(raw.mrp) || (priceNum > 0 ? Math.round(priceNum * 1.25) : 0);
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

  const imageMain = raw.image || raw.imageUrl || (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : '');
  const imagesArray = Array.isArray(raw.images) && raw.images.length > 0 
    ? raw.images 
    : (imageMain ? [imageMain] : []);

  const dosageType = raw.type || raw.dosageType || raw.dosage_form || 'Tablet';
  const packSize = raw.packSize || raw.pack || `Strip of 10 ${dosageType}s`;
  const generic = String(raw.genericName || raw.generic_name || raw.composition || 'Active Pharmaceutical Ingredient').trim();
  const composition = String(raw.composition || raw.compositionLong || generic).trim();

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
    expiry: raw.expiry || 'Dec 2027',
    batchNo: raw.batchNo || `B-${Math.floor(100 + Math.random() * 900)}`,
    rackLocation: raw.rackLocation || 'GUW-WH-A05',
    storage: raw.storage || 'Store below 25°C, away from moisture',
    shortDescription: raw.shortDescription || raw.description || `${name} (${composition}) for fast clinical relief.`,
    description: raw.description || raw.shortDescription || `${name} (${composition}) is formulated for effective therapeutic care.`,
    uses: raw.uses || raw.usesText || 'Relieves symptoms as directed by a healthcare professional.',
    usesText: raw.usesText || raw.uses || 'Relieves symptoms as directed by a healthcare professional.',
    dosage: raw.dosage || raw.dosageText || 'As prescribed by the physician.',
    dosageText: raw.dosageText || raw.dosage || 'As prescribed by the physician.',
    prescriptionRequired: Boolean(raw.prescriptionRequired),
    rating: parseFloat(raw.rating) || 4.5,
    reviewsCount: String(raw.reviewsCount || '120'),
    image: imageMain,
    images: imagesArray,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString()
  };
}

/**
 * Returns the unified, deduplicated list of all medicines.
 * Integrates base catalog (37 medicines) with dynamic local storage additions and edits.
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

  // 2. Overlay / prepend dynamic stored items (allows additions, edits, and custom stock changes)
  storedItems.forEach((norm) => {
    if (!norm) return;
    const nameKey = norm.name.toLowerCase().trim();
    const idKey = norm.id.toLowerCase().trim();
    if (!deletedSet.has(nameKey) && !deletedSet.has(idKey)) {
      // Overwrite or add
      medicineMap.set(nameKey, norm);
    }
  });

  const merged = Array.from(medicineMap.values());

  // Save back normalized snapshot so other components read the same data
  try {
    localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(merged));
  } catch (_) {}

  return merged;
}

/**
 * Save (create or update) a medicine record.
 * Broadcasts real-time events to all active views.
 */
export function saveMedicine(medicineData) {
  if (!medicineData || !medicineData.name) {
    throw new Error('Medicine name is required');
  }

  const normalized = normalizeMedicineItem(medicineData);
  normalized.updatedAt = new Date().toISOString();

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
    updatedList[existingIndex] = { ...updatedList[existingIndex], ...normalized };
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

  try {
    localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(dedupedList));
  } catch (_) {}

  // Broadcast real-time update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zestmed_medicines_updated', {
      detail: { action: existingIndex >= 0 ? 'update' : 'create', medicine: normalized }
    }));
    window.dispatchEvent(new Event('storage'));
  }

  // Background Supabase PostgreSQL sync if configured
  if (isSupabaseConfigured()) {
    try {
      supabase
        .from('medicines')
        .upsert({
          name: normalized.name,
          generic_name: normalized.genericName,
          manufacturer: normalized.manufacturer,
          prescription_required: normalized.prescriptionRequired,
          dosage_form: normalized.type,
          pack_size: normalized.packSize,
          price: normalized.price,
          discount_percentage: normalized.discount,
          discounted_price: normalized.price,
          in_stock: normalized.inStock,
          stock_quantity: normalized.stock,
          description: normalized.shortDescription || normalized.description,
          composition: normalized.composition,
          uses: normalized.uses,
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
 * Delete a medicine by ID or Name.
 * Broadcasts real-time events to all active views.
 */
export function deleteMedicine(idOrName) {
  if (!idOrName) return false;

  const targetStr = String(idOrName).toLowerCase().trim();
  const currentList = getSynchronizedMedicines();

  const toDelete = currentList.find(
    (m) => m.id === idOrName || m.id.toLowerCase() === targetStr || m.name.toLowerCase().trim() === targetStr
  );

  const updatedList = currentList.filter(
    (m) => m.id !== idOrName && m.id.toLowerCase() !== targetStr && m.name.toLowerCase().trim() !== targetStr
  );

  try {
    localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(updatedList));

    // Record into deleted blacklist so base mock catalogue doesn't recreate it on refresh
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

  // Background Supabase deletion attempt
  if (isSupabaseConfigured() && toDelete) {
    try {
      supabase
        .from('medicines')
        .delete()
        .ilike('name', toDelete.name)
        .then(() => {})
        .catch(() => {});
    } catch (_) {}
  }

  return true;
}
