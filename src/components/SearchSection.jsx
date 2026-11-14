// src/components/SearchSection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pill, FlaskConical, Layers, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SearchSection({ searchInputRef, onSelectProduct, onSelectTest, onSelectPackage }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('medicines');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      addToast('Please enter a medicine or lab test name', 'info');
      return;
    }

    if (activeTab === 'medicines') {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    } else if (activeTab === 'tests') {
      navigate(`/diagnostics?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/packages?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative -mt-8 sm:-mt-10 lg:-mt-12 xl:-mt-14 z-20 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl xl:max-w-5xl 2xl:max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100/90 px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4">
        {/* 3 Tabs Row - Sleek Height & Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1.5 sm:gap-3 mb-2.5 sm:mb-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('medicines')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm lg:text-base font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'medicines'
                ? 'bg-[#C6F1EA] text-[#008F83] shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Pill className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#008F83]" />
            <span>Search Medicines</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm lg:text-base font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'tests'
                ? 'bg-[#C6F1EA] text-[#008F83] shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-blue-600" />
            <span>Book Lab Test</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm lg:text-base font-bold transition whitespace-nowrap shrink-0 ${
              activeTab === 'packages'
                ? 'bg-[#C6F1EA] text-[#008F83] shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-purple-600" />
            <span>Health Packages</span>
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
            placeholder="Search for medicines, lab tests, or health packages..."
            className="w-full pl-9 sm:pl-12 pr-24 sm:pr-28 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base text-slate-800 placeholder:text-slate-400 placeholder:truncate rounded-xl sm:rounded-2xl border border-slate-200 focus:outline-none focus:border-[#008F83] transition bg-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 bg-[#008F83] hover:bg-[#007a70] text-white px-5 sm:px-6.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-bold shadow-xs transition"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
