import React, { useState } from 'react';
import { useLocation, DEFAULT_LOCATIONS } from '../context/LocationContext';
import { MapPin, X, Search, Check, Navigation, ShieldCheck, Heart, Car } from 'lucide-react';

export default function LocationModal() {
  const { isLocationModalOpen, closeLocationModal, currentLocation, selectLocation, setByPincode } = useLocation();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isLocationModalOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMsg('Please enter a 6-digit Guwahati PIN code (e.g. 781005)');
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
    selectLocation({
      city: 'Guwahati - GS Road / Christian Basti',
      pincode: '781005',
      district: 'Kamrup Metro',
      state: 'Assam',
      active: true,
      radiusKm: '2.5 km from Central Lab'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-dropdown border border-border w-full max-w-lg max-h-[92vh] flex flex-col overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#008F83]/10 text-[#008F83] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-dark">Service Location: Guwahati</h3>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Exclusively Guwahati
                </span>
              </div>
              <p className="text-xs text-muted">Single-day reports & free 10km senior citizen transport across all Guwahati hubs</p>
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
        <div className="p-6 space-y-4">
          {/* Senior Citizen 10km Radius Alert */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#008F83] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Within 10km Radius Free Pick-up & Drop</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                Special senior citizen (60+) mobility service available across all Guwahati zones for diagnostic tests, polyclinic visits & day surgeries.
              </p>
            </div>
          </div>

          {/* Geolocation Button */}
          <button
            type="button"
            onClick={handleUseCurrentGeo}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#008F83]/30 text-[#008F83] font-bold hover:bg-teal-50 transition text-xs sm:text-sm"
          >
            <Navigation className="w-4 h-4" />
            <span>Detect Current Location in Guwahati</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-white px-3 text-[11px] text-muted uppercase tracking-wider font-semibold absolute">
              Or Enter Guwahati PIN Code (781xxx)
            </span>
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
                  placeholder="Enter Guwahati PIN code (e.g. 781005)"
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-border focus:border-[#008F83] focus:ring-2 focus:ring-[#008F83]/20 outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="bg-[#008F83] hover:bg-[#007a70] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap"
              >
                Apply
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-500 font-medium pl-1 leading-relaxed">{errorMsg}</p>
            )}
          </form>

          {/* Guwahati Hubs List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Your Guwahati Neighborhood Hub
              </label>
              <span className="text-[11px] text-[#008F83] font-bold">12 Hubs Active</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {DEFAULT_LOCATIONS.map((loc) => {
                const isSelected = currentLocation.pincode === loc.pincode && currentLocation.city === loc.city;
                return (
                  <button
                    key={loc.city + loc.pincode}
                    type="button"
                    onClick={() => selectLocation(loc)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition ${
                      isSelected
                        ? 'border-[#008F83] bg-teal-50/80 text-[#008F83] font-semibold'
                        : 'border-border hover:border-slate-300 text-dark hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="leading-tight font-bold">{loc.city}</div>
                      <span className="text-[10px] text-muted">{loc.pincode} • {loc.radiusKm}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#008F83] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>Active Hub: <strong className="text-dark">{currentLocation.city} ({currentLocation.pincode})</strong></span>
          <span className="text-[#008F83] font-semibold">Single-Day Reports ⚡</span>
        </div>
      </div>
    </div>
  );
}
