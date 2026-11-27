// src/components/MedicineFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Pill, Droplet, Syringe, Upload, Trash2, Eye, Calendar, 
  Sparkles, Check, ChevronDown, Layers, Package, Thermometer, 
  Building2, Tag, Image, Link2, Copy, ExternalLink, 
  LayoutGrid, IndianRupee, Percent, FileText, PackageCheck, 
  FlaskConical, SquarePlus, Loader2 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { uploadMedicineImage } from '../services/medicineService';

export default function MedicineFormModal({
  isOpen = true,
  onClose,
  medicine = null,
  onSave
}) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const isEdit = Boolean(medicine && medicine.id);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState(() => {
    if (medicine) {
      return {
        name: medicine.name || '',
        categoryName: medicine.categoryName || medicine.categoryLong || 'General Medicines',
        type: medicine.type || medicine.dosageType || 'Tablet',
        price: parseFloat(medicine.price) || 0,
        mrp: parseFloat(medicine.mrp) || 0,
        discount: medicine.discount !== undefined ? parseFloat(medicine.discount) : 0,
        stock: medicine.stock !== undefined ? parseInt(medicine.stock, 10) : 100,
        shortDescription: medicine.shortDescription || medicine.description || '',
        uses: medicine.uses || medicine.usesText || '',
        dosage: medicine.dosage || medicine.dosageText || '',
        inStock: medicine.inStock !== false,
        composition: medicine.composition || medicine.genericName || '',
        expiry: medicine.expiry || 'Dec 2027',
        packSize: medicine.packSize || medicine.pack || 'Standard Pack',
        storage: medicine.storage || 'Store below 25°C in a dry place',
        manufacturer: medicine.manufacturer || medicine.brand || '',
        image: medicine.image || '',
        images: Array.isArray(medicine.images) && medicine.images.length > 0 ? medicine.images : (medicine.image ? [medicine.image] : [])
      };
    }
    // Default Add New Medicine form state matching reference image
    return {
      name: '',
      categoryName: 'General Medicines',
      type: 'Tablet',
      price: 28,
      mrp: 32,
      discount: 20,
      stock: 100,
      shortDescription: 'Fast relief from headache, toothache, and muscular pain.',
      uses: 'Used for headache, tooth',
      dosage: '1 to 2 tablets every 4–6 hc',
      inStock: true,
      composition: 'Acetylsalicylic Acid 350 mg',
      expiry: 'Dec 2027',
      packSize: 'Strip of 10 Tablets',
      storage: 'Store below 25°C, away from moisture',
      manufacturer: 'Reckitt Benckiser',
      image: '',
      images: []
    };
  });

  useEffect(() => {
    if (medicine) {
      const p = parseFloat(medicine.price) || 0;
      const m = parseFloat(medicine.mrp) || (p > 0 ? Math.round(p * 1.25) : 0);
      const d = medicine.discount !== undefined 
        ? parseFloat(medicine.discount) 
        : (medicine.discountPercent !== undefined ? parseFloat(medicine.discountPercent) : (m > p ? Math.max(0, Math.round(((m - p) / m) * 100)) : 0));

      setForm({
        name: medicine.name || '',
        categoryName: medicine.categoryName || medicine.categoryLong || 'General Medicines',
        type: medicine.type || medicine.dosageType || 'Tablet',
        price: p,
        mrp: m,
        discount: d,
        stock: medicine.stock !== undefined ? parseInt(medicine.stock, 10) : 100,
        shortDescription: medicine.shortDescription || medicine.description || '',
        uses: medicine.uses || medicine.usesText || '',
        dosage: medicine.dosage || medicine.dosageText || '',
        inStock: medicine.inStock !== false,
        composition: medicine.composition || medicine.genericName || '',
        expiry: medicine.expiry || 'Dec 2027',
        packSize: medicine.packSize || medicine.pack || 'Standard Pack',
        storage: medicine.storage || 'Store below 25°C in a dry place',
        manufacturer: medicine.manufacturer || medicine.brand || '',
        image: medicine.image || '',
        images: Array.isArray(medicine.images) && medicine.images.length > 0 
          ? medicine.images 
          : (medicine.image ? [medicine.image] : [])
      });
    } else {
      // Default Add Medicine form state
      setForm({
        name: '',
        categoryName: 'General Medicines',
        type: 'Tablet',
        price: 28,
        mrp: 32,
        discount: 20,
        stock: 100,
        shortDescription: 'Fast relief from headache, toothache, and muscular pain.',
        uses: 'Used for headache, tooth',
        dosage: '1 to 2 tablets every 4–6 hc',
        inStock: true,
        composition: 'Acetylsalicylic Acid 350 mg',
        expiry: 'Dec 2027',
        packSize: 'Strip of 10 Tablets',
        storage: 'Store below 25°C, away from moisture',
        manufacturer: 'Reckitt Benckiser',
        image: '',
        images: []
      });
    }
  }, [medicine, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image size should be under 10MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/') && !['jpg', 'jpeg', 'png', 'webp'].some(ext => file.name.toLowerCase().endsWith(ext))) {
      addToast('Please upload a valid image (JPG, PNG, WebP)', 'error');
      return;
    }

    // Set immediate temporary preview so user sees card update instantly
    const localBlob = URL.createObjectURL(file);
    setImageFile(file);
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(true);

    setForm((prev) => ({
      ...prev,
      image: localBlob,
      images: [localBlob]
    }));

    // Upload image with automatic persistent fallback
    try {
      const uploadRes = await uploadMedicineImage(file, form.name || medicine?.name || 'med');
      setIsUploading(false);

      if (uploadRes.success && uploadRes.publicUrl) {
        setUploadSuccess(true);
        setUploadError(null);
        setForm((prev) => ({
          ...prev,
          image: uploadRes.publicUrl,
          images: [uploadRes.publicUrl]
        }));
        addToast('Medicine product image uploaded successfully!', 'success');
      } else {
        setUploadError(uploadRes.error || 'Failed to process image');
        addToast(`Image upload notice: ${uploadRes.error || 'Upload error'}`, 'error');
      }
    } catch (err) {
      setIsUploading(false);
      setUploadError(err.message || 'Upload exception');
      addToast(`Image upload failed: ${err.message}`, 'error');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(false);
    setForm((prev) => ({
      ...prev,
      image: '',
      images: []
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePriceChange = (newPrice) => {
    const p = parseFloat(newPrice) || 0;
    const m = parseFloat(form.mrp) || 0;
    let disc = form.discount;
    if (m > 0 && p >= 0) {
      disc = Math.max(0, Math.round(((m - p) / m) * 100));
    }
    setForm((prev) => ({ ...prev, price: newPrice, discount: disc }));
  };

  const handleMrpChange = (newMrp) => {
    const m = parseFloat(newMrp) || 0;
    const p = parseFloat(form.price) || 0;
    let disc = form.discount;
    if (m > 0 && p >= 0) {
      disc = Math.max(0, Math.round(((m - p) / m) * 100));
    }
    setForm((prev) => ({ ...prev, mrp: newMrp, discount: disc }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      addToast('Please wait for the image to finish uploading.', 'info');
      return;
    }

    if (imageFile && !uploadSuccess && form.image && form.image.startsWith('blob:')) {
      addToast('Please wait for the image upload to complete.', 'info');
      return;
    }

    setIsSubmitting(true);
    const resolvedName = form.name.trim() || (isEdit ? (medicine?.name || '') : 'New Medicine');

    // Requirement 5: Ensure editing does not remove existing image when no new image is uploaded
    // Requirement 6: If a new image is uploaded while editing, update the stored image and display the new one
    // Unwanted fallback images (/medicines/crocin-500.png) completely removed
    const finalImage = form.image || (isEdit ? (medicine?.image || '') : '');

    const payload = {
      ...(medicine || {}),
      id: medicine?.id || `med-${Date.now()}`,
      name: resolvedName,
      genericName: form.composition.trim() || 'Active Pharmaceutical Ingredient',
      composition: form.composition.trim() || (isEdit ? (medicine?.composition || medicine?.genericName || '') : ''),
      compositionLong: form.composition.trim() || (isEdit ? (medicine?.compositionLong || medicine?.composition || '') : ''),
      categoryName: form.categoryName || 'General Medicines',
      type: form.type || 'Tablet',
      dosageType: form.type || 'Tablet',
      price: parseFloat(form.price) || (isEdit ? (medicine?.price || 0) : 0),
      mrp: parseFloat(form.mrp) || (isEdit ? (medicine?.mrp || 0) : 0),
      discount: parseFloat(form.discount) || 0,
      discountPercent: parseFloat(form.discount) || 0,
      stock: parseInt(form.stock, 10) || 100,
      stockQuantity: parseInt(form.stock, 10) || 100,
      inStock: Boolean(form.inStock),
      shortDescription: form.shortDescription.trim() || '',
      description: form.shortDescription.trim() || '',
      uses: form.uses.trim() || '',
      usesText: form.uses.trim() || '',
      dosage: form.dosage.trim() || '',
      dosageText: form.dosage.trim() || '',
      pack: form.packSize.trim() || (isEdit ? (medicine?.pack || medicine?.packSize || '') : 'Standard Pack'),
      packSize: form.packSize.trim() || (isEdit ? (medicine?.packSize || medicine?.pack || '') : 'Standard Pack'),
      storage: form.storage.trim() || 'Store below 25°C, away from moisture',
      manufacturer: form.manufacturer.trim() || (isEdit ? (medicine?.manufacturer || medicine?.brand || '') : ''),
      brand: form.manufacturer.trim() || (isEdit ? (medicine?.manufacturer || medicine?.brand || '') : ''),
      expiry: form.expiry.trim() || (isEdit ? (medicine?.expiry || 'Dec 2027') : 'Dec 2027'),
      image: finalImage,
      images: finalImage ? [finalImage] : []
    };

    try {
      if (onSave) {
        await onSave(payload);
      }
      setIsSubmitting(false);
      onClose();
    } catch (saveErr) {
      setIsSubmitting(false);
      addToast(`Error saving medicine: ${saveErr.message}`, 'error');
    }
  };

  // Preview derivations for live card - completely independent of Crocin fallback
  const previewImg = form.image || (isEdit ? (medicine?.image || '') : '');
  const previewName = form.name.trim() || (isEdit ? (medicine?.name || '') : 'New Medicine');
  const previewComp = form.composition.trim() || (isEdit ? (medicine?.composition || medicine?.genericName || '') : '');
  const previewPack = form.packSize.trim() || (isEdit ? (medicine?.packSize || medicine?.pack || '') : 'Standard Pack');
  const previewPrice = form.price || (isEdit ? (medicine?.price || 0) : 0);
  const previewMrp = form.mrp || (isEdit ? (medicine?.mrp || 0) : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-6 animate-scale-up max-h-[92vh] flex flex-col">
        {/* Top Header Bar with Organic Curved Emerald Wave */}
        <div className="relative flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-[#07131F] via-[#0B1E2E] to-[#0A2E28] text-white border-b border-slate-800 shrink-0 overflow-hidden">
          {/* Organic Emerald Wave Backdrop Accent */}
          <div className="absolute top-0 right-0 w-80 h-full pointer-events-none opacity-40">
            <svg viewBox="0 0 320 80" className="w-full h-full fill-current text-emerald-400">
              <path d="M60,0 C120,40 180,80 320,80 L320,0 Z" />
            </svg>
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-bl from-emerald-500/30 to-teal-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A76F] flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              {isEdit ? (
                <Pill className="w-5 h-5 -rotate-45 stroke-[2.5]" />
              ) : (
                <SquarePlus className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{isEdit ? 'Edit Medicine Details' : 'Add New Medicine'}</span>
                {isEdit && medicine?.id && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-teal-300 border border-slate-700">
                    {medicine.id}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300/80 mt-0.5">
                {isEdit 
                  ? 'Update pharmaceutical product details, stock and pricing.' 
                  : 'Register a new pharmaceutical product with NABL drug approval codes.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative z-10 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 lg:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Main Image Upload, Additional Slots & Live Medicine Preview (Span 4) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Main Image Upload Box */}
              <div>
                <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                  <Image className="w-4 h-4 text-emerald-600 mr-1.5" />
                  <span>Medicine Image</span>
                </label>
                <div className="relative border-2 border-dashed border-emerald-400/80 rounded-2xl bg-[#F8FCF9] p-4 text-center hover:bg-emerald-50/40 transition group overflow-hidden">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Uploading Spinner Overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4">
                      <Loader2 className="w-8 h-8 text-[#00A76F] animate-spin mb-2" />
                      <p className="text-xs font-bold text-slate-800">Uploading to Supabase Storage...</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Storing permanent image asset</p>
                    </div>
                  )}

                  {form.image ? (
                    <div className="relative w-full aspect-square bg-transparent rounded-xl flex items-center justify-center p-2">
                      <img
                        src={form.image}
                        alt="Product Preview"
                        className="max-h-full max-w-full object-contain drop-shadow-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 p-1.5 bg-[#EF4444] text-white rounded-lg hover:bg-red-600 transition shadow-sm cursor-pointer z-10"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-7 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#00A76F] flex items-center justify-center mb-2.5">
                        <Upload className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">Add Medicine Image</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                        Upload product image (JPG, PNG, WebP)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
                        <span>Upload Image</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Image storage status indicators */}
                {uploadSuccess && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span>Image Stored & Verified</span>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{uploadError}</span>
                  </div>
                )}

                {/* Image URL path pill bar */}
                <div className="mt-2.5">
                  <div className="flex items-center gap-2 bg-[#F1F5F9] border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-mono">
                    <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder={isEdit ? (form.image || 'Image URL or file path (optional)...') : 'Paste image URL or file path (optional)...'}
                      className="w-full bg-transparent border-none text-slate-700 placeholder:text-slate-400 focus:outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Medicine Images (0/4 or 1/4) Gallery Slots */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center text-xs font-bold text-slate-800">
                    <Copy className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Medicine Images ({form.image ? '1/4' : '0/4'})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Recommended: 800 × 800 px</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 flex flex-col items-center justify-center text-slate-700 transition cursor-pointer p-1"
                  >
                    <Upload className="w-4 h-4 text-slate-800 mb-0.5 stroke-[2.5]" />
                    <span className="text-[10px] font-bold">Add</span>
                  </button>
                  <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50/30 flex items-center justify-center text-xs text-slate-400 font-medium">
                    2
                  </div>
                  <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50/30 flex items-center justify-center text-xs text-slate-400 font-medium">
                    3
                  </div>
                  <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50/30 flex items-center justify-center text-xs text-slate-400 font-medium">
                    4
                  </div>
                </div>
              </div>

              {/* LIVE MEDICINE PREVIEW CARD */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-800">Medicine Preview</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F7F3] text-[#00A76F] border border-[#A7F3D0] flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>Live Store View</span>
                  </span>
                </div>

                {/* Store Card Preview */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#16A34A] text-[10px] font-bold">
                      {form.discount || 20}% OFF
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      form.inStock ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {form.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Centered Image */}
                  <div className="w-full h-24 flex items-center justify-center p-1 overflow-hidden">
                    {previewImg ? (
                      <img
                        src={previewImg}
                        alt={previewName}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Pill className="w-10 h-10 text-teal-400/40" />
                    )}
                  </div>

                  {/* Bottom Meta */}
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {form.type || 'Tablet'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {previewPack}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0B1E3F] line-clamp-1 mt-1">
                      {previewName}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 font-medium line-clamp-1">
                      {previewComp}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-sm font-bold text-[#0B1E3F]">
                        ₹{Number(previewPrice).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{Number(previewMrp).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Form Fields (Span 8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Row 1: Medicine Name + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Tag className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Medicine Name</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={isEdit ? (medicine?.name || 'Medicine Name') : 'e.g. Disprin Tablet'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Layers className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Category</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.categoryName}
                      onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white appearance-none pr-8 cursor-pointer"
                    >
                      <option value="General Medicines">General Medicines</option>
                      <option value="Pain Relief & Fever">Pain Relief & Fever</option>
                      <option value="Diabetes Care">Diabetes Care</option>
                      <option value="Cardiac & BP">Cardiac & BP</option>
                      <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Digestive Health">Digestive Health</option>
                      <option value="Skin Care">Skin Care</option>
                      <option value="Respiratory Care">Respiratory Care</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Type (Tablet, Capsule, Syrup, Injection, Other) */}
              <div>
                <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                  <LayoutGrid className="w-4 h-4 text-emerald-600 mr-1.5" />
                  <span>Type</span>
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {[
                    { id: 'Tablet', label: 'Tablet', icon: Pill },
                    { id: 'Capsule', label: 'Capsule', icon: Pill, rotate: true },
                    { id: 'Syrup', label: 'Syrup', icon: Droplet },
                    { id: 'Injection', label: 'Injection', icon: Syringe },
                    { id: 'Other', label: '... Other', icon: null }
                  ].map((t) => {
                    const IconComp = t.icon;
                    const isSelected = form.type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.id })}
                        className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#00A76F] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          IconComp && <IconComp className={`w-3.5 h-3.5 ${t.rotate ? 'rotate-45' : ''}`} />
                        )}
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Price, MRP, Discount, Stock Quantity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>Price (₹)</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder={isEdit ? '35' : '28'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>MRP (₹)</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.mrp}
                    onChange={(e) => handleMrpChange(e.target.value)}
                    placeholder={isEdit ? '42' : '32'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>Discount (%)</span>
                  </label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="20"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>Stock Quantity</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                  />
                </div>
              </div>

              {/* Row 4: Short Description */}
              <div>
                <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                  <FileText className="w-4 h-4 text-emerald-600 mr-1.5" />
                  <span>Short Description</span>
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Fast relief from headache, toothache, and muscular pain."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white resize-none"
                />
              </div>

              {/* Row 5: Uses, Dosage, Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/80">
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>Uses</span>
                  </label>
                  <input
                    type="text"
                    value={form.uses}
                    onChange={(e) => setForm({ ...form, uses: e.target.value })}
                    placeholder="Used for headache, tooth"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00A76F]"
                  />
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/80">
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-600 mr-1 rotate-45" />
                    <span>Dosage</span>
                  </label>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="1 to 2 tablets every 4–6 hc"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00A76F]"
                  />
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                  <span className="flex items-center text-xs font-bold text-slate-800">
                    <PackageCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>Availability</span>
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-slate-700">
                      {form.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, inStock: !form.inStock })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.inStock ? 'bg-[#00A76F]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          form.inStock ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 6: Composition + Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <FlaskConical className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Composition</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.composition}
                    onChange={(e) => setForm({ ...form, composition: e.target.value })}
                    placeholder={isEdit ? 'Paracetamol 500 mg' : 'Acetylsalicylic Acid 350 mg'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Expiry Date</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                      placeholder={isEdit ? 'Apr 2028' : 'Dec 2027'}
                      className="w-full px-3.5 py-2.5 pr-9 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 7: Pack Size + Storage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Package className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Pack Size</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.packSize}
                    onChange={(e) => setForm({ ...form, packSize: e.target.value })}
                    placeholder={isEdit ? 'Strip of 15 Tablets' : 'Strip of 10 Tablets'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                    <Thermometer className="w-4 h-4 text-emerald-600 mr-1.5" />
                    <span>Storage</span>
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })}
                    placeholder={isEdit ? 'Store below 30°C, in a dry place' : 'Store below 25°C, away from moisture'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                  />
                </div>
              </div>

              {/* Row 8: Manufacturer */}
              <div>
                <label className="flex items-center text-xs font-bold text-slate-800 mb-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                  <span>Manufacturer</span>
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  placeholder={isEdit ? 'GlaxoSmithKline (GSK)' : 'Reckitt Benckiser'}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A76F] focus:ring-1 focus:ring-[#00A76F] transition bg-white"
                />
              </div>

            </div>

          </div>

          {/* Footer Buttons matching reference image */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4 text-slate-700" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`px-7 py-2.5 rounded-2xl bg-[#00A76F] hover:bg-[#009360] text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer flex items-center gap-2 ${
                isSubmitting || isUploading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting || isUploading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin stroke-[2.5]" />
              ) : (
                <Check className="w-4 h-4 text-white stroke-[2.5]" />
              )}
              <span>{isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Save to Inventory')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
