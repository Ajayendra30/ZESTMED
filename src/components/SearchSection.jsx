// src/components/SearchSection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Pill, FlaskConical, Layers, ArrowRight, 
  Stethoscope, Activity, Scissors, Car 
} from 'lucide-react';
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
  // Lab Tests in first order!
  const [activeTab, setActiveTab] = useState('tests');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      addToast('Please enter a search query', 'info');
      return;
    }

    if (activeTab === 'tests') {
      navigate(`/diagnostics?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (activeTab === 'medicines') {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (activeTab === 'packages') {
      navigate(`/packages?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (activeTab === 'doctor') {
      onOpenDoctorModal && onOpenDoctorModal();
    } else if (activeTab === 'physio') {
      onOpenPhysioModal && onOpenPhysioModal();
    } else if (activeTab === 'surgery') {
      onOpenSurgeryModal && onOpenSurgeryModal();
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'tests':
        return 'Search diagnostic tests (CBC, Thyroid, Liver, HbA1c, etc.) with single-day reports...';
      case 'doctor':
        return 'Search doctors by specialty in Guwahati (Cardiologist, Physician, Ortho, etc.)...';
      case 'physio':
        return 'Search physiotherapy sessions for elderly mobility, post-op, back pain in Guwahati...';
      case 'surgery':
        return 'Search daycare surgery packages (Cataract, Gallbladder, Hernia, Laser Piles)...';
      case 'packages':
        return 'Search wellness health packages with same-day reports...';
      case 'medicines':
        return 'Search genuine medicines & healthcare products in Guwahati...';
      default:
        return 'Search for lab tests, doctors, or medicines...';
    }
  };

  return (
    <div className="relative -mt-8 sm:-mt-10 lg:-mt-12 xl:-mt-14 z-20 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100/90 px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4">
        
        {/* Service Tabs Row: Lab Tests FIRST */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 overflow-x-auto pb-1 scrollbar-none">
          {/* 1. Lab Test (1st in order) */}
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'tests'
                ? 'bg-[#005CB9] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>1. Book Lab Test</span>
            <span className={`text-[10px] px-1 rounded font-bold ${activeTab === 'tests' ? 'bg-[#FF5722] text-white' : 'bg-orange-50 text-[#FF5722]'}`}>
              Single Day
            </span>
          </button>

          {/* 2. Book Doctor */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('doctor');
              onOpenDoctorModal && onOpenDoctorModal();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'doctor'
                ? 'bg-[#005CB9] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#005CB9]" />
            <span>2. Book Doctor</span>
          </button>

          {/* 3. Physiotherapist */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('physio');
              onOpenPhysioModal && onOpenPhysioModal();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'physio'
                ? 'bg-[#005CB9] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span>3. Physiotherapist</span>
          </button>

          {/* 4. Surgery Packages */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('surgery');
              onOpenSurgeryModal && onOpenSurgeryModal();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'surgery'
                ? 'bg-[#005CB9] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
            <span>4. Surgery Packages</span>
          </button>

          {/* 5. Wellness Packages */}
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'packages'
                ? 'bg-[#005CB9] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            <span>5. Wellness Packages</span>
          </button>

          {/* 6. Medicines */}
          <button
            type="button"
            onClick={() => setActiveTab('medicines')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'medicines'
                ? 'bg-[#005CB9] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
            <span>6. Medicines</span>
          </button>
        </div>

        {/* Search Input Bar with Search Button */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full pl-9 sm:pl-12 pr-24 sm:pr-28 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base text-slate-800 placeholder:text-slate-400 placeholder:truncate rounded-xl sm:rounded-2xl border border-slate-200 focus:outline-none focus:border-[#005CB9] transition bg-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 bg-[#005CB9] hover:bg-[#004C99] text-white px-5 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
