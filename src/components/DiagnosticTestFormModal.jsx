// src/components/DiagnosticTestFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, SquarePlus, FlaskConical, Upload, Trash2, 
  Eye, Clock, Check, ChevronDown, Layers, ShieldCheck, 
  Droplet, Activity, Info, Tag, ShoppingCart
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
        categoryName: test.categoryName || test.category || 'Blood Tests',
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
    }
  }, [test, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        addToast('Image size should be under 8MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setForm((prev) => ({
          ...prev,
          image: result,
          images: prev.images?.length > 0 ? [result, ...prev.images.slice(1)] : [result]
        }));
        setImageUrlInput('');
        addToast('Diagnostic test image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      addToast('Please enter a valid image URL', 'error');
      return;
    }
    setForm((prev) => ({
      ...prev,
      image: trimmed,
      images: prev.images?.length > 0 ? [trimmed, ...prev.images.slice(1)] : [trimmed]
    }));
    addToast('Test image URL applied!', 'success');
  };

  const handleRemoveImage = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Please enter diagnostic test name', 'error');
      return;
    }

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
      image: form.image || '',
      images: form.images?.length > 0 ? form.images : (form.image ? [form.image] : [])
    };

    if (onSave) {
      onSave(payload);
    }
    onClose();
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
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Lab Test Image
                </label>
                <div className="relative border-2 border-dashed border-teal-300/80 rounded-2xl bg-teal-50/20 p-4 text-center hover:bg-teal-50/40 transition group">
                  {form.image ? (
                    <div className="space-y-3">
                      <div className="w-full h-40 rounded-xl bg-gradient-to-b from-[#F0F7FF] to-[#EAF3FC] border border-slate-100 flex items-center justify-center p-3 overflow-hidden shadow-inner">
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
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
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
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007A64] hover:bg-[#00604e] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Image</span>
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

                {/* Optional Image URL Input */}
                <div className="mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste image URL (e.g. /lab-tests/cbc.png)"
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
                    {form.description || 'Clinical diagnostic investigation.'}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                      {form.sampleType}
                    </span>
                    <span className="text-[9px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md font-medium flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{form.tat}</span>
                    </span>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-[#0B1E3F]">
                        ₹{Number(form.price || 399).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{Number(form.mrp || 499).toLocaleString()}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-[#E8F8EE] text-[#16A34A] text-[9px] font-bold">
                        {form.discountPercent || 20}% OFF
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="w-full py-1.5 border border-[#007A64] text-[#007A64] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
                    <ShoppingCart className="w-3 h-3" />
                    <span>Add to Cart</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Form Fields & Details (Span 8) */}
            <div className="lg:col-span-8 space-y-4 text-xs">
              
              {/* Row 1: Test Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-8">
                  <label className="block text-slate-700 font-bold mb-1">
                    Diagnostic Test Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Complete Blood Count (CBC) or Lipid Profile"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/10 text-xs"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-slate-700 font-bold mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.categoryName}
                    onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#14B8A6] text-xs cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Specimen / Sample Type & Turnaround Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Specimen / Sample Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.sampleType}
                    onChange={(e) => setForm({ ...form, sampleType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#14B8A6] text-xs cursor-pointer"
                  >
                    {SAMPLE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Turnaround Time (TAT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.tat}
                    onChange={(e) => setForm({ ...form, tat: e.target.value })}
                    placeholder="e.g. 6–12 Hours or 24 Hours"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#14B8A6] text-xs"
                  />
                </div>
              </div>

              {/* Row 3: Pricing & Discounts */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-[#14B8A6] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    MRP (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.mrp}
                    onChange={(e) => handleMrpChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#14B8A6] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-[#14B8A6] text-xs"
                  />
                </div>
              </div>

              {/* Row 4: Clinical Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Clinical Description & Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide clinical summary of what this diagnostic test measures..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-[#14B8A6] resize-none text-xs"
                />
              </div>

              {/* Row 5: Parameters Tested */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Parameters Tested (Comma Separated)
                </label>
                <input
                  type="text"
                  value={form.parametersText}
                  onChange={(e) => setForm({ ...form, parametersText: e.target.value })}
                  placeholder="e.g. Hemoglobin, Total WBC, RBC Count, Platelets, Hematocrit"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-[#14B8A6] text-xs"
                />
              </div>

              {/* Row 6: Clinical Purpose / Indications */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Clinical Purpose & Indications
                </label>
                <input
                  type="text"
                  value={form.purposeText}
                  onChange={(e) => setForm({ ...form, purposeText: e.target.value })}
                  placeholder="e.g. Detects anemia, infections, evaluates overall cellular health"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-[#14B8A6] text-xs"
                />
              </div>

              {/* Row 7: Fasting Requirement & Preparation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <span className="block text-slate-700 font-bold">Fasting Requirement</span>
                  <label className="flex items-center gap-2 cursor-pointer pt-0.5">
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
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#007A64] hover:bg-[#00604e] text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEdit ? 'Save Changes' : 'Publish Test to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
