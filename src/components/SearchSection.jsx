// src/components/SearchSection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SearchSection({ 
  searchInputRef, 
  onSelectProduct, 
  onSelectTest, 
  onSelectPackage,
  onOpenDoctorModal,
  onOpenPhysioModal,
  onOpenSurgeryModal,
  onOpenSeniorPickup
}) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      addToast('Please enter a search query', 'info');
      return;
    }

    const lower = query.toLowerCase();
    if (lower.includes('doctor') || lower.includes('dr.') || lower.includes('cardiologist') || lower.includes('ortho') || lower.includes('physician')) {
      navigate('/doctor-appointment');
    } else if (lower.includes('physio') || lower.includes('therapy') || lower.includes('rehab')) {
      navigate('/physiotherapy');
    } else if (lower.includes('medicine') || lower.includes('tablet') || lower.includes('syrup') || lower.includes('capsule')) {
      navigate(`/medicines?search=${encodeURIComponent(query)}`);
    } else if (lower.includes('package') || lower.includes('checkup') || lower.includes('wellness')) {
      navigate(`/packages?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/diagnostics?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative -mt-5 sm:-mt-6 lg:-mt-7 xl:-mt-8 z-20 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl lg:max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100/90 p-3 sm:p-4 lg:p-4.5">
        {/* Search Input Bar with Search Button */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diagnostic tests, doctors, medicines, or health packages..."
            className="w-full pl-11 sm:pl-14 pr-24 sm:pr-32 py-3 sm:py-3.5 lg:py-4 text-xs sm:text-sm lg:text-base text-slate-800 placeholder:text-slate-400 placeholder:truncate rounded-xl sm:rounded-2xl border border-slate-200 focus:outline-none focus:border-[#008F83] transition bg-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 bg-[#008F83] hover:bg-[#007a70] text-white px-4 sm:px-7 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-bold shadow-xs transition cursor-pointer active:scale-95 shrink-0"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
