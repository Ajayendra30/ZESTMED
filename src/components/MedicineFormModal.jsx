// src/components/MedicineFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, SquarePlus, Pill, Droplet, Syringe, Upload, 
  Trash2, Eye, Calendar, Sparkles, Check, ChevronDown, 
  Layers, Package, Thermometer, Building2, Tag, ShieldCheck
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function MedicineFormModal({
  isOpen = true,
  onClose,
  medicine = null,
  onSave
}) {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const isEdit = Boolean(medicine && medicine.id);

  const [form, setForm] = useState({
    name: '',
    categoryName: 'General Medicines',
    type: 'Tablet',
    price: 28.00,
    mrp: 32.00,
    discount: 20,
    stock: 100,
    shortDescription: 'Fast relief from headache, toothache, and muscular pain.',
    uses: 'Used for headache, toothache and inflammation.',
    dosage: '1 to 2 tablets every 4–6 hours as needed.',
    inStock: true,
    composition: 'Acetylsalicylic Acid 350 mg',
    expiry: 'Dec 2027',
    packSize: 'Strip of 10 Tablets',
    storage: 'Store below 25°C, away from moisture',
    manufacturer: 'Reckitt Benckiser',
    image: '',
    images: []
  });

  useEffect(() => {
    if (medicine) {
      const p = parseFloat(medicine.price) || 28;
      const m = parseFloat(medicine.mrp) || (p > 0 ? Math.round(p * 1.25) : 32);
      const d = medicine.discount !== undefined 
        ? parseFloat(medicine.discount) 
        : (medicine.discountPercent !== undefined ? parseFloat(medicine.discountPercent) : Math.max(0, Math.round(((m - p) / m) * 100)));

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
        packSize: medicine.packSize || medicine.pack || 'Strip of 10 Tablets',
        storage: medicine.storage || 'Store below 25°C, away from moisture',
        manufacturer: medicine.manufacturer || medicine.brand || 'Reckitt Benckiser',
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
        price: 28.00,
        mrp: 32.00,
        discount: 20,
        stock: 100,
        shortDescription: 'Fast relief from headache, toothache, and muscular pain.',
        uses: 'Used for headache, toothache and inflammation.',
        dosage: '1 to 2 tablets every 4–6 hours as needed.',
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
        addToast('Medicine product image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Please enter medicine brand name', 'error');
      return;
    }

    const payload = {
      ...(medicine || {}),
      id: medicine?.id || `med-${Date.now()}`,
      name: form.name.trim(),
      genericName: form.composition.trim() || 'Active Pharmaceutical Ingredient',
      composition: form.composition.trim(),
      compositionLong: form.composition.trim(),
      categoryName: form.categoryName,
      type: form.type,
      dosageType: form.type,
      price: parseFloat(form.price) || 0,
      mrp: parseFloat(form.mrp) || 0,
      discount: parseFloat(form.discount) || 0,
      discountPercent: parseFloat(form.discount) || 0,
      stock: parseInt(form.stock, 10) || 0,
      stockQuantity: parseInt(form.stock, 10) || 0,
      inStock: Boolean(form.inStock),
      shortDescription: form.shortDescription.trim(),
      description: form.shortDescription.trim(),
      uses: form.uses.trim(),
      usesText: form.uses.trim(),
      dosage: form.dosage.trim(),
      dosageText: form.dosage.trim(),
      pack: form.packSize.trim() || 'Strip of 10 Tablets',
      packSize: form.packSize.trim() || 'Strip of 10 Tablets',
      storage: form.storage.trim(),
      manufacturer: form.manufacturer.trim(),
      brand: form.manufacturer.trim(),
      expiry: form.expiry.trim(),
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

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-6 animate-scale-up max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#14B8A6]/20 border border-[#14B8A6]/40 flex items-center justify-center text-[#14B8A6] font-bold">
              {isEdit ? <Pill className="w-5 h-5" /> : <SquarePlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{isEdit ? 'Edit Medicine Details' : 'Add New Medicine'}</span>
                {isEdit && medicine?.id && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                    {medicine.id}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {isEdit 
                  ? 'Update pharmaceutical product details, stock and pricing.' 
                  : 'Register a new pharmaceutical product with NABL drug approval codes.'}
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
            
            {/* LEFT COLUMN: Main Image Upload, Additional Slots & Live Medicine Preview (Span 4) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Main Image Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Medicine Image
                </label>
                <div className="relative border-2 border-dashed border-emerald-300/80 rounded-2xl bg-emerald-50/20 p-4 text-center hover:bg-emerald-50/40 transition group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {form.image ? (
                    <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden p-2 flex items-center justify-center border border-slate-200 shadow-2xs">
                      <img
                        src={form.image}
                        alt="Product Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow-xs cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-2.5">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">Add Medicine Image</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                        Upload product image (JPG, PNG, WebP)
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Image</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Optional Image URL Input */}
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={form.image.startsWith('data:') ? '' : form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="Or paste image URL (/medicines/disprin.png)..."
                    className="w-full px-3 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Medicine Images (0/4) Gallery Slots */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">Medicine Images ({form.images?.length || (form.image ? 1 : 0)}/4)</span>
                  <span className="text-[10px] text-slate-400">Recommended: 800×800 px</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-700 transition cursor-pointer p-1"
                  >
                    <Upload className="w-3.5 h-3.5 mb-0.5" />
                    <span className="text-[9px] font-bold leading-tight">Add</span>
                  </button>
                  {[2, 3, 4].map((slot) => (
                    <div
                      key={slot}
                      className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50/40 flex items-center justify-center text-[10px] text-slate-300"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE MEDICINE PREVIEW CARD */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#008F83]" />
                    <span className="font-bold text-xs text-slate-800">Medicine Preview</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Live Store View
                  </span>
                </div>

                {/* Store Card Preview */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs space-y-2.5">
                  <div className="w-full h-28 bg-[#F1F3F5] rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt={form.name || 'Preview'}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Pill className="w-10 h-10 text-teal-400/50" />
                    )}
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#E8F8EE] text-[#16A34A] text-[9px] font-bold">
                      {form.discount || 20}% OFF
                    </span>
                    <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      form.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {form.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                        {form.type || 'Tablet'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {form.packSize || 'Strip of 10 Tablets'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0B1E3F] line-clamp-1 mt-1">
                      {form.name || 'Disprin Tablet'}
                    </h4>
                    <p className="text-[10.5px] text-slate-500 font-medium line-clamp-1">
                      {form.composition || 'Active Pharmaceutical Ingredient'}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-sm font-bold text-[#0B1E3F]">
                        ₹{Number(form.price || 28).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{Number(form.mrp || 32).toFixed(2)}
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
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Medicine Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Disprin Tablet"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.categoryName}
                      onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white appearance-none pr-8 cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Type <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
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
                            ? 'bg-[#059669] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                        }`}
                      >
                        {IconComp && <IconComp className={`w-3.5 h-3.5 ${t.rotate ? 'rotate-45' : ''}`} />}
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Price, MRP, Discount, Stock Quantity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="e.g. 28.00"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    MRP (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.mrp}
                    onChange={(e) => handleMrpChange(e.target.value)}
                    placeholder="e.g. 32.00"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
              </div>

              {/* Row 4: Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Short Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="e.g. Fast relief from headache, toothache, and muscular pain."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                />
              </div>

              {/* Row 5: Uses, Dosage, Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-600 inline mr-1" />
                    Uses
                  </label>
                  <input
                    type="text"
                    value={form.uses}
                    onChange={(e) => setForm({ ...form, uses: e.target.value })}
                    placeholder="e.g. Headache, toothache..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    <Pill className="w-3 h-3 text-emerald-600 inline mr-1" />
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="e.g. 1 to 2 tablets..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Availability</span>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-slate-600">
                      {form.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, inStock: !form.inStock })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.inStock ? 'bg-[#059669]' : 'bg-slate-300'
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
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Composition <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.composition}
                    onChange={(e) => setForm({ ...form, composition: e.target.value })}
                    placeholder="e.g. Acetylsalicylic Acid 350 mg"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    placeholder="e.g. Dec 2027"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
              </div>

              {/* Row 7: Pack Size + Storage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                    Pack Size <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.packSize}
                    onChange={(e) => setForm({ ...form, packSize: e.target.value })}
                    placeholder="e.g. Strip of 10 Tablets"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                    Storage <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })}
                    placeholder="e.g. Store below 25°C, away from moisture"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                  />
                </div>
              </div>

              {/* Row 8: Manufacturer */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                  Manufacturer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  placeholder="e.g. Reckitt Benckiser"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition bg-white"
                />
              </div>

            </div>

          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#008F83] hover:bg-[#007A70] text-white font-bold text-xs shadow-md shadow-[#008F83]/20 transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Save to Inventory'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
