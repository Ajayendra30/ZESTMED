// src/components/DiagnosticTestFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, SquarePlus, FlaskConical, Upload, Trash2, 
  Eye, Clock, Check, ChevronDown, Layers, ShieldCheck, 
  Droplet, Activity, Info, Tag, ShoppingCart, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { uploadLabTestImage, resolveLabTestCategory } from '../services/labTestService';

const CATEGORY_OPTIONS = [
  'Blood Tests',
  'Diabetes Tests',
  'Heart Tests',
  'Liver Tests',
  'Kidney Tests',
  'Thyroid Tests',
  'Hormone Tests',
  'Vitamin Tests',
  'Allergy Tests',
  'Popular Tests'
];

const SAMPLE_TYPE_OPTIONS = [
  'Blood (2–3 ml)',
  'EDTA Whole Blood',
  'Serum (Yellow top)',
  'Plasma (Grey top)',
  'Sterile Urine Routine',
  'Throat / Nasal Swab',
  'Stool Sample',
  'Tissue / Biopsy'
];

export default function DiagnosticTestFormModal({
  isOpen = true,
  onClose,
  test = null,
  onSave
}) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const isEdit = Boolean(test && test.id);

  const [form, setForm] = useState({
    name: '',
    categoryName: 'Blood Tests',
    sampleType: 'Blood (2–3 ml)',
    price: 399,
    mrp: 499,
    discountPercent: 20,
    tat: '6–12 Hours',
    fastingRequired: false,
    description: 'A clinical diagnostic assay measuring biomarker components for early detection and wellness monitoring.',
    parametersText: 'Hemoglobin (Hb), Total WBC, Platelets, Hematocrit',
    purposeText: 'Detects infections and aids early clinical diagnosis',
    preparationText: 'No special dietary restrictions. Stay well-hydrated.',
    collectionMode: 'Home / Lab Visit',
    supportsLabVisit: true,
    image: '',
    images: []
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (test) {
      const p = parseFloat(test.price) || 399;
      const m = parseFloat(test.mrp) || (p > 0 ? Math.round(p * 1.25) : 499);
      const d = test.discountPercent !== undefined 
        ? parseFloat(test.discountPercent) 
        : (m > p ? Math.round(((m - p) / m) * 100) : 20);

      const params = Array.isArray(test.parameters) 
        ? test.parameters.join(', ') 
        : (typeof test.parameters === 'string' ? test.parameters : (test.parametersCount ? `${test.parametersCount} Parameters Included` : ''));

      const purposes = Array.isArray(test.purpose) 
        ? test.purpose.join(', ') 
        : (typeof test.purpose === 'string' ? test.purpose : '');

      const prep = Array.isArray(test.preparation) 
        ? test.preparation.join(', ') 
        : (typeof test.preparation === 'string' ? test.preparation : '');

      setForm({
        name: test.name || '',
        categoryName: resolveLabTestCategory(test.categoryName || test.category || 'Blood Tests').name,
        sampleType: test.sampleType || 'Blood (2–3 ml)',
        price: p,
        mrp: m,
        discountPercent: d,
        tat: test.reportTime || test.turnaroundTime || test.tat || '6–12 Hours',
        fastingRequired: Boolean(test.fastingRequired),
        description: test.description || '',
        parametersText: params || 'Key biomarker measurements included',
        purposeText: purposes || 'Aids clinical diagnosis and health evaluation',
        preparationText: prep || (test.fastingRequired ? 'Overnight 8-10 hrs fasting required' : 'No special dietary restrictions'),
        collectionMode: test.sampleCollection || 'Home / Lab Visit',
        supportsLabVisit: test.supportsLabVisit !== false,
        image: test.image || '',
        images: Array.isArray(test.images) && test.images.length > 0 
          ? test.images 
          : (test.image ? [test.image] : [])
      });
      setImageUrlInput(test.image || '');
      setImageFile(null);
      setUploadError(null);
      setUploadSuccess(Boolean(test.image));
    } else {
      // Default Add Test form state
      setForm({
        name: '',
        categoryName: 'Blood Tests',
        sampleType: 'Blood (2–3 ml)',
        price: 399,
        mrp: 499,
        discountPercent: 20,
        tat: '6–12 Hours',
        fastingRequired: false,
        description: 'A clinical diagnostic assay measuring biomarker components for early detection and wellness monitoring.',
        parametersText: 'Hemoglobin (Hb), Total WBC, Platelets, Hematocrit',
        purposeText: 'Detects infections and aids early clinical diagnosis',
        preparationText: 'No special dietary restrictions. Stay well-hydrated.',
        collectionMode: 'Home / Lab Visit',
        supportsLabVisit: true,
        image: '',
        images: []
      });
      setImageUrlInput('');
      setImageFile(null);
      setUploadError(null);
      setUploadSuccess(false);
    }
    setIsUploading(false);
    setIsSubmitting(false);
  }, [test, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image size should be under 10MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/') && !['jpg', 'jpeg', 'png', 'webp'].some(ext => file.name.toLowerCase().endsWith(ext))) {
      addToast('Please upload a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    // Immediate temporary preview so the user sees instant UI update
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

    // Upload directly to Supabase Storage ('lab-tests' bucket)
    try {
      const uploadRes = await uploadLabTestImage(file, form.name || 'test');
      setIsUploading(false);

      if (uploadRes.success && uploadRes.publicUrl) {
        setUploadSuccess(true);
        setForm((prev) => ({
          ...prev,
          image: uploadRes.publicUrl,
          images: [uploadRes.publicUrl]
        }));
        setImageUrlInput(uploadRes.publicUrl);
        addToast(uploadRes.isLocalPersistent 
          ? 'Diagnostic test image saved and mapped successfully!' 
          : 'Diagnostic test image uploaded to Supabase Storage!', 'success');
      } else {
        setUploadError(uploadRes.error || 'Failed to upload to Supabase Storage');
        addToast(`Image upload notice: ${uploadRes.error || 'Storage error'}. Ensure the "lab-tests" bucket exists.`, 'error');
      }
    } catch (err) {
      setIsUploading(false);
      setUploadError(err.message || 'Upload exception');
      addToast(`Image upload failed: ${err.message}`, 'error');
    }
  };

  const handleApplyImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      addToast('Please enter a valid image URL', 'error');
      return;
    }
    setImageFile(null);
    setUploadError(null);
    setUploadSuccess(true);
    setForm((prev) => ({
      ...prev,
      image: trimmed,
      images: [trimmed]
    }));
    addToast('Test image URL applied!', 'success');
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
    setImageUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePriceChange = (newPrice) => {
    const p = parseFloat(newPrice) || 0;
    const m = parseFloat(form.mrp) || 0;
    let disc = form.discountPercent;
    if (m > 0 && p >= 0) {
      disc = Math.max(0, Math.round(((m - p) / m) * 100));
    }
    setForm((prev) => ({ ...prev, price: newPrice, discountPercent: disc }));
  };

  const handleMrpChange = (newMrp) => {
    const m = parseFloat(newMrp) || 0;
    const p = parseFloat(form.price) || 0;
    let disc = form.discountPercent;
    if (m > 0 && p >= 0) {
      disc = Math.max(0, Math.round(((m - p) / m) * 100));
    }
    setForm((prev) => ({ ...prev, mrp: newMrp, discountPercent: disc }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Please enter diagnostic test name', 'error');
      return;
    }

    if (isUploading) {
      addToast('Please wait for the image upload to finish before saving', 'warning');
      return;
    }

    // Requirement 8: Handle upload failures properly and do not save with broken/blob URL
    if (uploadError && form.image && form.image.startsWith('blob:')) {
      addToast('Image upload failed. Please re-upload or remove the image before saving.', 'error');
      return;
    }

    setIsSubmitting(true);

    const parsedParams = form.parametersText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedPurpose = form.purposeText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedPrep = form.preparationText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Requirement 7: When editing, retain existing image unless a new image is uploaded
    // Requirement 9: If a lab test has no uploaded image, leave blank (do not use dummy image)
    let finalImage = form.image;
    if (!imageFile && isEdit) {
      finalImage = form.image || test?.image || '';
    } else if (form.image && form.image.startsWith('blob:') && !uploadSuccess) {
      finalImage = '';
    }

    const payload = {
      ...(test || {}),
      id: test?.id || `test-${Date.now()}`,
      name: form.name.trim(),
      categoryName: form.categoryName,
      category: form.categoryName,
      sampleType: form.sampleType,
      sample: form.sampleType,
      price: parseFloat(form.price) || 399,
      mrp: parseFloat(form.mrp) || (parseFloat(form.price) * 1.25),
      discountPercent: parseFloat(form.discountPercent) || 20,
      reportTime: form.tat,
      turnaroundTime: form.tat,
      tat: form.tat,
      fastingRequired: Boolean(form.fastingRequired),
      description: form.description.trim(),
      parameters: parsedParams.length > 0 ? parsedParams : ['Diagnostic parameters'],
      parametersCount: parsedParams.length > 0 ? parsedParams.length : 10,
      purpose: parsedPurpose.length > 0 ? parsedPurpose : ['Clinical diagnosis'],
      preparation: parsedPrep.length > 0 ? parsedPrep : ['No special preparation required'],
      sampleCollection: form.collectionMode,
      supportsLabVisit: Boolean(form.supportsLabVisit),
      image: finalImage || '',
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
      addToast(`Error saving test: ${saveErr.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-6 animate-scale-up max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#14B8A6]/20 border border-[#14B8A6]/40 flex items-center justify-center text-[#14B8A6] font-bold">
              {isEdit ? <FlaskConical className="w-5 h-5" /> : <SquarePlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{isEdit ? 'Edit Diagnostic Test' : 'Add New Diagnostic Test'}</span>
                {isEdit && test?.id && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                    {test.id}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit 
                  ? 'Update clinical assay parameters, pricing, and phlebotomy requirements.' 
                  : 'Register a new clinical laboratory investigation with NABL standard parameters.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Image Upload, URL Option & Live Test Card Preview (Span 4) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Main Image Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Lab Test Image</span>
                  {uploadSuccess && (
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cloud Saved
                    </span>
                  )}
                </label>
                <div className="relative border-2 border-dashed border-teal-300/80 rounded-2xl bg-teal-50/20 p-4 text-center hover:bg-teal-50/40 transition group">
                  {form.image ? (
                    <div className="space-y-3">
                      <div className="w-full h-40 rounded-xl bg-gradient-to-b from-[#F0F7FF] to-[#EAF3FC] border border-slate-100 flex items-center justify-center p-3 overflow-hidden shadow-inner relative">
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex flex-col items-center justify-center z-10 gap-2">
                            <Loader2 className="w-6 h-6 text-[#14B8A6] animate-spin" />
                            <span className="text-xs font-bold text-slate-700">Uploading to Storage...</span>
                          </div>
                        )}
                        <img 
                          src={form.image} 
                          alt="Test preview" 
                          className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={isUploading}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2.5">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-100/70 text-[#007A64] flex items-center justify-center shadow-xs">
                        <FlaskConical className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Add Lab Test Image</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Upload test image or sample tube banner (JPG, PNG, WebP)</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007A64] hover:bg-[#00604e] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {uploadError && (
                  <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Optional Image URL Input */}
                <div className="mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste permanent image URL"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:border-[#14B8A6]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyImageUrl}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Thumbnail slots indicator */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1.5">
                    <span>Test Images ({form.image ? '1/4' : '0/4'})</span>
                    <span className="text-[10px] text-slate-400">800 × 800 px recommended</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 transition cursor-pointer text-xs font-bold"
                    >
                      <span className="text-base leading-none mb-0.5">+</span>
                      <span className="text-[9px]">Add</span>
                    </button>
                    <div className="aspect-square rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-center overflow-hidden">
                      {form.image ? (
                        <img src={form.image} alt="slot" className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                      )}
                    </div>
                    <div className="aspect-square rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    </div>
                    <div className="aspect-square rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE CARD PREVIEW SECTION (Matching /lab-tests design) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                    <span>Live Lab Test Page Preview</span>
                  </span>
                  <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    User View
                  </span>
                </div>

                {/* Card Container exactly as on /lab-tests */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-2">
                  {/* Image showcase box - blank if no image per user specification */}
                  <div className="w-full h-28 rounded-xl bg-gradient-to-b from-[#F0F7FF] to-[#EAF3FC] flex items-center justify-center p-2 overflow-hidden">
                    {form.image ? (
                      <img 
                        src={form.image} 
                        alt="Preview" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : null}
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-[#0B1E3F] leading-snug line-clamp-2 min-h-[32px]">
                    {form.name || 'Complete Blood Count (CBC)'}
                  </h4>

                  {/* Description */}
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {form.description || 'Clinical diagnostic assay evaluating blood parameters with precision.'}
                  </p>

                  {/* Price Row */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-sm font-black text-[#0B1E3F]">
                      ₹{parseFloat(form.price || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through font-normal">
                      ₹{parseFloat(form.mrp || 0).toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#E8F8EE] text-[#16A34A] text-[9px] font-bold ml-auto">
                      {form.discountPercent}% OFF
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="w-full py-1.5 border border-[#007A64] text-[#007A64] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-white">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Clinical Specifications & Configuration (Span 8) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Row 1: Test Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-7 space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Diagnostic Test Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Complete Blood Count (CBC)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#14B8A6] focus:bg-white text-xs transition"
                  />
                </div>
                
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.categoryName}
                      onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#14B8A6] focus:bg-white text-xs transition pr-8 cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Sample Type & Turnaround Time */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-6 space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Specimen / Sample Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.sampleType}
                      onChange={(e) => setForm({ ...form, sampleType: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#14B8A6] focus:bg-white text-xs transition pr-8 cursor-pointer"
                    >
                      {SAMPLE_TYPE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="sm:col-span-6 space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Report Turnaround Time (TAT)
                  </label>
                  <input
                    type="text"
                    value={form.tat}
                    onChange={(e) => setForm({ ...form, tat: e.target.value })}
                    placeholder="e.g. 6–12 Hours or 24 Hours"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#14B8A6] focus:bg-white text-xs transition"
                  />
                </div>
              </div>

              {/* Row 3: Pricing (Price, MRP, Discount) */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-black focus:outline-none focus:border-[#14B8A6] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    MRP / List Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.mrp}
                    onChange={(e) => handleMrpChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-[#14B8A6] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Discount (%)
                  </label>
                  <div className="flex items-center h-[34px] px-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-emerald-600">
                    {form.discountPercent}% OFF
                  </div>
                </div>
              </div>

              {/* Row 4: Clinical Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Clinical Overview & Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide an overview of the test, its medical significance, and clinical evaluation utility."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#14B8A6] focus:bg-white text-xs leading-relaxed transition"
                />
              </div>

              {/* Row 5: Biomarker Parameters Included */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Biomarker Parameters (Comma Separated)
                  </label>
                  <span className="text-[10px] text-slate-400">Separated by comma</span>
                </div>
                <input
                  type="text"
                  value={form.parametersText}
                  onChange={(e) => setForm({ ...form, parametersText: e.target.value })}
                  placeholder="e.g. Hemoglobin, Total WBC, RBC, Platelet Count, Hematocrit"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#14B8A6] focus:bg-white text-xs transition"
                />
              </div>

              {/* Row 6: Clinical Purpose / Diagnostic Reasons */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Diagnostic Purpose & Reasons
                </label>
                <input
                  type="text"
                  value={form.purposeText}
                  onChange={(e) => setForm({ ...form, purposeText: e.target.value })}
                  placeholder="e.g. Detects anemia and infections, Evaluates overall health status"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#14B8A6] focus:bg-white text-xs transition"
                />
              </div>

              {/* Row 7: Fasting & Patient Preparation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs">
                <div className="space-y-1.5 flex flex-col justify-center">
                  <span className="font-bold text-slate-700">Fasting Requirement</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.fastingRequired}
                      onChange={(e) => setForm({ ...form, fastingRequired: e.target.checked })}
                      className="w-4 h-4 text-[#14B8A6] rounded border-slate-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-800 font-semibold text-xs">
                      {form.fastingRequired ? 'Overnight Fasting Required (8–10 hrs)' : 'No Fasting Required'}
                    </span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">
                    Preparation Instructions
                  </label>
                  <input
                    type="text"
                    value={form.preparationText}
                    onChange={(e) => setForm({ ...form, preparationText: e.target.value })}
                    placeholder="e.g. Stay well hydrated. Maintain normal diet."
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#14B8A6] text-xs"
                  />
                </div>
              </div>

              {/* Row 8: Sample Collection Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-teal-50/50 rounded-2xl border border-teal-100">
                <div>
                  <div className="font-bold text-slate-800">Sample Collection Modes</div>
                  <div className="text-[11px] text-slate-500">Enable phlebotomist home dispatch and walk-in central hub testing</div>
                </div>
                <div className="flex items-center gap-2">
                  {['Home / Lab Visit', 'Home Collection', 'Lab Visit'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setForm({ ...form, collectionMode: mode })}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        form.collectionMode === mode
                          ? 'bg-[#14B8A6] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#007A64] hover:bg-[#00604e] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isEdit ? 'Save Changes' : 'Publish Test to Catalog'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
