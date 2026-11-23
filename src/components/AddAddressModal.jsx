// src/components/AddAddressModal.jsx
import React, { useState } from 'react';
import { X, MapPin, Building, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { ASSAM_DISTRICTS } from '../context/LocationContext';

export default function AddAddressModal({ isOpen = true, onClose, onAddAddress }) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    street: '',
    city: 'Guwahati',
    district: 'Kamrup Metropolitan (Guwahati)',
    pincode: '781001',
    isDefault: false
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.recipientName.trim() || !formData.phone.trim() || !formData.street.trim()) {
      addToast('Please fill in recipient name, phone, and street address.', 'error');
      return;
    }

    // Assam PIN Code Validation: Must start with 78
    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6 || !cleanPin.startsWith('78')) {
      addToast('ZESTMED currently operates only within Assam. Please provide a valid 6-digit Assam PIN code (e.g., 781001, 785001).', 'error');
      return;
    }

    const newAddress = {
      id: `addr-${Date.now()}`,
      label: formData.label,
      recipientName: formData.recipientName.trim(),
      phone: formData.phone.trim(),
      street: formData.street.trim(),
      city: formData.city,
      district: formData.district,
      state: 'Assam',
      pincode: cleanPin,
      isDefault: formData.isDefault
    };

    onAddAddress(newAddress);
    addToast(`Address "${newAddress.label}" saved successfully.`, 'success');
    onClose();

    // Reset
    setFormData({
      label: 'Home',
      recipientName: '',
      phone: '',
      street: '',
      city: 'Guwahati',
      district: 'Kamrup Metropolitan (Guwahati)',
      pincode: '781001',
      isDefault: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Delivery Address</h3>
              <p className="text-[11px] text-primary-100">Assam Express Medicine & Phlebotomy Collection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="flex gap-2">
            {['Home', 'Office', 'Parents / Other'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, label: type })}
                className={`flex-1 py-2 rounded-xl font-bold border transition text-center ${
                  formData.label === type
                    ? 'bg-primary-50 border-primary text-primary shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="Enter full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 92791 25091"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Flat / House No., Building, Street & Landmark *
            </label>
            <textarea
              required
              rows={2}
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="e.g. Flat 3A, Riverview Heights, GS Road, Near Dispur Supermarket"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assam District / City *</label>
              <select
                value={formData.city}
                onChange={(e) => {
                  const selCity = e.target.value;
                  const matched = ASSAM_DISTRICTS?.find(d => d.name.toLowerCase().includes(selCity.toLowerCase()));
                  setFormData({ 
                    ...formData, 
                    city: selCity,
                    district: matched ? matched.district : selCity,
                    pincode: matched ? matched.pincode : formData.pincode
                  });
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 bg-white"
              >
                <option value="Guwahati">Guwahati (Kamrup Metro)</option>
                <option value="Dibrugarh">Dibrugarh</option>
                <option value="Silchar">Silchar (Cachar)</option>
                <option value="Jorhat">Jorhat</option>
                <option value="Nagaon">Nagaon</option>
                <option value="Tezpur">Tezpur (Sonitpur)</option>
                <option value="Tinsukia">Tinsukia</option>
                <option value="Bongaigaon">Bongaigaon</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Assam PIN Code (78xxxx) *</label>
              <input
                type="text"
                maxLength={6}
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                placeholder="781001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-slate-700 font-semibold cursor-pointer">
              Set as default address for medicine deliveries and lab collections
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5 font-bold shadow-sm"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
