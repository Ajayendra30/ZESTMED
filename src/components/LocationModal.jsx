import React, { useState } from 'react';
import { useLocation, DEFAULT_LOCATIONS } from '../context/LocationContext';
import { MapPin, X, Search, Check, Navigation, ShieldCheck } from 'lucide-react';

export default function LocationModal() {
  const { isLocationModalOpen, closeLocationModal, currentLocation, selectLocation, setByPincode } = useLocation();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLocationModalOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMsg('Please enter a 6-digit Assam PIN code');
      return;
    }
    const res = setByPincode(pinInput);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setErrorMsg('');
      setPinInput('');
    }
  };

  const handleUseCurrentGeo = () => {
    // Quick demo geolocation simulation in Assam
    selectLocation({
      city: 'Guwahati (Central)',
      pincode: '781001',
      district: 'Kamrup Metro',
      state: 'Assam',
      active: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-dropdown border border-border w-full max-w-md max-h-[92vh] flex flex-col overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-dark">Choose Delivery Location</h3>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-dark border border-teal-200 px-1.5 py-0.2 rounded">
                  Assam Only
                </span>
              </div>
              <p className="text-xs text-muted">Select your city for medicine delivery & diagnostic tests in Assam</p>
            </div>
          </div>
          <button
            onClick={closeLocationModal}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Geolocation Button */}
          <button
            type="button"
            onClick={handleUseCurrentGeo}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-primary/30 text-primary font-medium hover:bg-primary-50 transition text-sm"
          >
            <Navigation className="w-4 h-4" />
            <span>Detect Location (Assam)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-white px-3 text-xs text-muted uppercase tracking-wider absolute">Or Enter Assam PIN Code</span>
          </div>

          {/* Form */}
          <form onSubmit={handlePinSubmit} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, ''));
                    setErrorMsg('');
                  }}
                  placeholder="Enter Assam PIN code (e.g. 781001)"
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="btn-primary text-sm px-4 py-2.5 whitespace-nowrap"
              >
                Apply
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-500 font-medium pl-1 leading-relaxed">{errorMsg}</p>
            )}
          </form>

          {/* Popular Cities in Assam */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                Assam Service Hubs
              </label>
              <span className="text-[11px] text-teal-dark font-medium">8 Districts Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_LOCATIONS.map((loc) => {
                const isSelected = currentLocation.pincode === loc.pincode;
                return (
                  <button
                    key={loc.pincode}
                    type="button"
                    onClick={() => selectLocation(loc)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-sm transition ${
                      isSelected
                        ? 'border-primary bg-primary-50 text-primary font-semibold'
                        : 'border-border hover:border-slate-300 text-dark hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="leading-tight font-medium">{loc.city}</div>
                      <span className="text-[11px] text-muted">{loc.pincode} • {loc.district}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>Currently selected: <strong className="text-dark">{currentLocation.city}, Assam ({currentLocation.pincode})</strong></span>
          <span className="text-emerald-600 font-medium">● Express Delivery Active</span>
        </div>
      </div>
    </div>
  );
}
