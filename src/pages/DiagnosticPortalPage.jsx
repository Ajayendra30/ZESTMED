import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { enforceAuth } from '../utils/authGuard';
import DiagnosticBookingModal from '../components/DiagnosticBookingModal';
import TestDetailModal from '../components/TestDetailModal';
import { 
  Search, ShieldCheck, Clock, Award, Home,
  ChevronDown, ShoppingCart, Check, SlidersHorizontal,
  Calendar, ArrowRight, ArrowLeft
} from 'lucide-react';
import { ALL_LAB_TESTS_DATA } from '../mock-data/allLabTestsData';
import { getSynchronizedLabTests, fetchSynchronizedLabTests } from '../services/labTestService';

const SIDEBAR_CATEGORIES = [
  { id: 'all', name: 'All Tests' },
  { id: 'popular', name: 'Popular Tests', count: 32 },
  { id: 'blood', name: 'Blood Tests', count: 56 },
  { id: 'diabetes', name: 'Diabetes Tests', count: 18 },
  { id: 'heart', name: 'Heart Tests', count: 24 },
  { id: 'liver', name: 'Liver Tests', count: 20 },
  { id: 'kidney', name: 'Kidney Tests', count: 16 },
  { id: 'thyroid', name: 'Thyroid Tests', count: 12 },
  { id: 'hormone', name: 'Hormone Tests', count: 14 },
  { id: 'vitamin', name: 'Vitamin Tests', count: 10 },
  { id: 'allergy', name: 'Allergy Tests', count: 8 },
];

const AVAILABILITY_OPTIONS = [
  { id: 'home', name: 'Home Collection', count: 212 },
  { id: 'lab', name: 'Lab Visit', count: 98 },
];

export default function DiagnosticPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuth } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedAvailability, setSelectedAvailability] = useState(['home']);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMax, setPriceMax] = useState(5000);
  const [sortBy, setSortBy] = useState('Popularity');
  const [selectedTestDetail, setSelectedTestDetail] = useState(null);
  const [bookingTestItem, setBookingTestItem] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [testsList, setTestsList] = useState(() => getSynchronizedLabTests());

  // Real-time synchronization across Admin Dashboard actions and Supabase
  useEffect(() => {
    // Initial fetch to sync with Supabase PostgreSQL
    fetchSynchronizedLabTests().then((synced) => {
      if (Array.isArray(synced) && synced.length > 0) {
        setTestsList(synced);
      }
    });

    const handleSync = () => {
      setTestsList(getSynchronizedLabTests());
    };

    window.addEventListener('zestmed_lab_tests_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('zestmed_lab_tests_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const ITEMS_PER_PAGE = 12;

  // Auto-open booking modal when user logs in on the same page
  useEffect(() => {
    if (user) {
      try {
        const pendingRaw = sessionStorage.getItem('zestmed_pending_action');
        if (pendingRaw) {
          const parsed = JSON.parse(pendingRaw);
          if (parsed?.type === 'book_test' && parsed.test) {
            sessionStorage.removeItem('zestmed_pending_action');
            setBookingTestItem(parsed.test);
          }
        }
      } catch (_) {}
    }
  }, [user, location.state]);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedAvailability, searchQuery, priceMax, sortBy]);

  const handleCategoryToggle = (catId) => {
    if (catId === 'all') {
      setSelectedCategories(['all']);
      return;
    }
    setSelectedCategories((prev) => {
      const withoutAll = prev.filter((id) => id !== 'all');
      if (withoutAll.includes(catId)) {
        const next = withoutAll.filter((id) => id !== catId);
        return next.length === 0 ? ['all'] : next;
      } else {
        return [...withoutAll, catId];
      }
    });
  };

  const handleAvailabilityToggle = (availId) => {
    setSelectedAvailability((prev) => {
      if (prev.includes(availId)) {
        return prev.length === 1 ? prev : prev.filter((id) => id !== availId);
      } else {
        return [...prev, availId];
      }
    });
  };

  const handleAddToCart = (test, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to book a lab test',
        pendingAction: {
          type: 'add_to_cart',
          item: {
            id: test.id,
            name: test.name,
            price: test.price,
            mrp: test.mrp,
            image: test.image,
            type: 'diagnostic',
            category: 'Lab Test',
            description: test.description
          },
          itemType: 'diagnostic'
        },
        addToast
      });
      return;
    }
    addItem({
      id: test.id,
      name: test.name,
      price: test.price,
      mrp: test.mrp,
      image: test.image,
      type: 'diagnostic',
      category: 'Lab Test',
      description: test.description
    }, 'diagnostic');
  };

  const handleCardClick = (test) => {
    setSelectedTestDetail(test);
  };

  // Deduplicate lab tests so each lab test name appears strictly once
  const uniqueLabTests = useMemo(() => {
    const seen = new Set();
    return (testsList || []).filter((test) => {
      if (!test || !test.name) return false;
      const key = test.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [testsList]);

  const filteredTests = useMemo(() => {
    return uniqueLabTests.filter((test) => {
      // Category filter
      if (!selectedCategories.includes('all')) {
        const hasMatchingCat = selectedCategories.some((cat) =>
          test.categories ? test.categories.includes(cat) : test.category === cat
        );
        if (!hasMatchingCat) return false;
      }

      // Availability filter
      if (selectedAvailability.includes('lab') && !selectedAvailability.includes('home')) {
        if (!test.supportsLabVisit && !test.sampleCollection.includes('Lab')) return false;
      }

      // Search input filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = test.name.toLowerCase().includes(q);
        const matchesDesc = test.description && test.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // Price slider
      if (test.price > priceMax) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'Popularity') return a.popularRank - b.popularRank;
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Highest Discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'Name: A to Z') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [selectedCategories, selectedAvailability, searchQuery, priceMax, sortBy]);

  // Pagination calculations
  const totalItems = filteredTests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const displayedTests = filteredTests.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
    setCurrentPage(pageNum);
    const catalogElem = document.getElementById('lab-tests-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 450, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-16">
      
      {/* =========================================================================
          1. HERO BANNER WITH HOMEPAGE HERO STYLING & LAB SCIENTIST
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#F0F9FB] via-[#E8F6F8] to-[#DEF3F6] border-b border-teal-100/60 select-none">
        {/* Medical Plus (+) Symbols matching Homepage Hero */}
        <div className="absolute top-6 left-[16%] opacity-20 text-teal-400 font-bold text-5xl pointer-events-none select-none">
          +
        </div>
        <div className="absolute top-4 left-[48%] lg:left-[52%] opacity-35 text-teal-300 font-bold text-6xl lg:text-7xl pointer-events-none select-none">
          +
        </div>
        <div className="absolute top-10 right-10 opacity-25 text-teal-300 font-bold text-6xl pointer-events-none select-none">
          +
        </div>

        {/* Bottom-Left Soft Cyan Wave Arc */}
        <div className="absolute -bottom-10 -left-10 w-[360px] sm:w-[440px] h-[320px] sm:h-[380px] pointer-events-none select-none opacity-40">
          <svg viewBox="0 0 400 400" className="w-full h-full fill-current text-teal-200/50">
            <path d="M0,160 C130,150 230,240 270,400 L0,400 Z" />
          </svg>
        </div>
        <div className="absolute -bottom-16 -left-16 w-[380px] h-[380px] bg-gradient-to-tr from-cyan-100/50 via-teal-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Organic Mint-Cyan Curved Backdrop Wave */}
        <div className="absolute top-0 right-0 w-[64%] sm:w-[58%] lg:w-[50%] xl:w-[46%] h-full pointer-events-none select-none overflow-hidden">
          <svg
            viewBox="0 0 500 400"
            preserveAspectRatio="none"
            className="absolute top-0 right-0 w-full h-full"
          >
            <defs>
              <linearGradient id="labOrganicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4F1F7" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#A2E6F2" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#7AD4E4" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="labOrganicGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BCEEF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#67CCE0" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path
              d="M110,0 C180,45 150,135 230,185 C300,225 390,210 500,260 L500,0 Z"
              fill="url(#labOrganicGrad1)"
            />
            <path
              d="M230,0 C280,65 260,150 340,195 C400,225 450,215 500,225 L500,0 Z"
              fill="url(#labOrganicGrad2)"
              opacity="0.65"
            />
          </svg>
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] bg-gradient-to-bl from-[#75D2E4]/45 via-[#9FE5F2]/25 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-7 md:pt-8 lg:pt-9 pb-7 md:pb-8 lg:pb-9 relative z-10 min-h-[320px] sm:min-h-[360px] lg:min-h-[390px] xl:min-h-[420px] 2xl:min-h-[450px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full">
            
            {/* Left Content */}
            <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 z-10 space-y-3.5 sm:space-y-4 max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-tight">
                Lab Tests & <span className="text-[#008F83]">Diagnostics</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 max-w-xl font-medium leading-relaxed">
                Book a wide range of lab tests online across Guwahati with home sample collection. All test reports delivered within a single day (12-24 Hours).
              </p>

              {/* 4 Trust Badges in a 2x2 Grid */}
              <div className="pt-3 sm:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 lg:gap-x-10 gap-y-3 sm:gap-y-3.5 max-w-xl text-sm sm:text-base text-slate-800 font-bold">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#008F83]">
                    <ShieldCheck className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-[#008F83]" />
                  </div>
                  <span>100% Accurate</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#008F83]">
                    <Home className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-[#008F83]" />
                  </div>
                  <span>Free Home Collection</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#008F83]">
                    <Award className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-[#008F83]" />
                  </div>
                  <span>NABL Certified</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#008F83]">
                    <Clock className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-[#008F83]" />
                  </div>
                  <span>Single-Day Reports</span>
                </div>
              </div>
            </div>

            {/* Right Image: Scientist with Microscope & Laboratory Equipment */}
            <div className="w-full flex lg:flex lg:col-span-7 xl:col-span-7 2xl:col-span-7 relative items-end justify-center lg:justify-end self-end mt-4 lg:mt-0 -mb-7 sm:-mb-8 lg:-mb-9">
              <img
                src="/lab-tests-hero.png"
                alt="Lab Diagnostics Scientist with Microscope"
                className="h-auto max-h-[290px] sm:max-h-[350px] md:max-h-[400px] lg:max-h-[450px] xl:max-h-[500px] 2xl:max-h-[550px] w-auto max-w-full object-contain object-bottom drop-shadow-md select-none pointer-events-none transition-all duration-300"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LAB TESTS CATALOG SECTION (MATCHING EXACT REFERENCE IMAGE 1)
          ========================================================================= */}
      <section id="lab-tests-catalog" className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">
        
        {/* Full-width Search Bar with left Search Icon & right Filter Button */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center gap-3 mb-6">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for lab tests (e.g., CBC, Lipid Profile, Thyroid, etc.)"
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#007A64]" />
            <span>Filter</span>
          </button>
        </div>

        {/* 2-Column Layout: Left Sidebar + Right 12-Card Grid */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
          
          {/* ================== LEFT FILTER SIDEBAR ================== */}
          <aside
            className={`w-full lg:w-56 xl:w-64 shrink-0 ${
              showMobileFilter ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-6">
              
              {/* 1. Categories */}
              <div>
                <h3 className="text-base font-bold text-[#0B1E3F] mb-3.5 tracking-tight">
                  Categories
                </h3>
                <div className="space-y-2.5">
                  {SIDEBAR_CATEGORIES.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        onClick={() => handleCategoryToggle(cat.id)}
                        className="flex items-center justify-between text-xs sm:text-sm cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4.5 h-4.5 rounded-[4px] flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#007A64] text-white'
                                : 'border border-slate-300 bg-white group-hover:border-slate-400'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-slate-700 group-hover:text-slate-900 ${
                              isChecked ? 'font-bold text-[#007A64]' : 'font-medium'
                            }`}
                          >
                            {cat.name}
                          </span>
                        </div>
                        {cat.count !== undefined && (
                          <span className="text-slate-400 text-xs font-medium">
                            ({cat.count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* 2. Price Range */}
              <div>
                <h3 className="text-base font-bold text-[#0B1E3F] mb-3.5 tracking-tight">
                  Price Range
                </h3>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-[#007A64] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                  ₹0 – ₹{priceMax.toLocaleString()}
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* 3. Availability */}
              <div>
                <h3 className="text-base font-bold text-[#0B1E3F] mb-3.5 tracking-tight">
                  Availability
                </h3>
                <div className="space-y-2.5">
                  {AVAILABILITY_OPTIONS.map((avail) => {
                    const isChecked = selectedAvailability.includes(avail.id);
                    return (
                      <label
                        key={avail.id}
                        onClick={() => handleAvailabilityToggle(avail.id)}
                        className="flex items-center justify-between text-xs sm:text-sm cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4.5 h-4.5 rounded-[4px] flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#007A64] text-white'
                                : 'border border-slate-300 bg-white group-hover:border-slate-400'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-slate-700 group-hover:text-slate-900 ${
                              isChecked ? 'font-bold text-[#007A64]' : 'font-medium'
                            }`}
                          >
                            {avail.name}
                          </span>
                        </div>
                        {avail.count !== undefined && (
                          <span className="text-slate-400 text-xs font-medium">
                            ({avail.count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* ================== RIGHT CONTENT: 12 LAB TEST CARDS PER PAGE ================== */}
          <main className="flex-1 min-w-0">
            
            {/* Header: Showing X – Y of 212 Lab Tests + Sort By dropdown */}
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                Showing {totalItems === 0 ? 0 : startIndex + 1} – {endIndex} of {totalItems} Lab Tests
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-slate-500 font-medium">Sort By:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#007A64] cursor-pointer shadow-2xs"
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Highest Discount">Highest Discount</option>
                    <option value="Name: A to Z">Name: A to Z</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Test Cards Grid: 6 Columns x 2 Rows = 12 Cards on Desktop */}
            {filteredTests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-600 font-semibold mb-2 text-base">No lab tests match your filter criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories(['all']);
                    setSearchQuery('');
                    setPriceMax(5000);
                  }}
                  className="px-4 py-2 bg-[#007A64] text-white text-xs sm:text-sm font-bold rounded-lg mt-2 cursor-pointer shadow-xs hover:bg-[#006855] transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
                  {displayedTests.map((test) => {
                    return (
                      <div
                        key={test.id}
                        onClick={() => handleCardClick(test)}
                        className="bg-white rounded-2xl border border-slate-200/90 p-3 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all duration-200 group cursor-pointer"
                      >
                        <div>
                          {/* Image Showcase Box */}
                          <div 
                            className="w-full h-28 sm:h-32 rounded-xl bg-gradient-to-b from-[#F0F7FF] to-[#EAF3FC] flex items-center justify-center p-2 overflow-hidden"
                          >
                            {test.image ? (
                              <img
                                src={test.image}
                                alt={test.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 drop-shadow-xs"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                          </div>

                          {/* Title */}
                          <h3
                            title={test.name}
                            className="text-xs sm:text-[13px] font-bold text-[#0B1E3F] leading-snug line-clamp-2 min-h-[36px] mt-2.5 hover:text-[#007A64] transition-colors"
                          >
                            {test.name}
                          </h3>

                          {/* Description */}
                          <p
                            title={test.description}
                            className="text-[11px] text-slate-500 leading-snug line-clamp-2 min-h-[30px] mt-1"
                          >
                            {test.description}
                          </p>

                          {/* Price Row */}
                          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                            <span className="text-sm sm:text-[15px] font-black text-[#0B1E3F]">
                              ₹{test.price.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-slate-400 line-through font-normal">
                              ₹{test.mrp.toLocaleString()}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#E8F8EE] text-[#16A34A] text-[10px] font-bold shrink-0 ml-auto sm:ml-0">
                              20% OFF
                            </span>
                          </div>
                        </div>

                        {/* Outline Add to Cart Button */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(test, e)}
                          className="w-full mt-3 py-1.5 px-2 border border-[#007A64] text-[#007A64] hover:bg-[#007A64] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* ================== PAGINATION ROW (MATCHING USER REFERENCE IMAGE) ================== */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 pb-4 select-none">
                    {/* Previous Page Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 flex items-center justify-center text-sm font-bold transition shadow-2xs ${
                        currentPage === 1
                          ? 'text-slate-300 bg-white cursor-not-allowed opacity-60'
                          : 'text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
                      }`}
                      title="Previous Page"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    {/* Number Buttons & Ellipsis */}
                    {getPageNumbers().map((num, idx) => {
                      if (num === '...') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-1 text-slate-500 font-bold text-sm sm:text-base select-none"
                          >
                            ...
                          </span>
                        );
                      }

                      const isCurrent = currentPage === num;
                      return (
                        <button
                          key={`page-${num}`}
                          type="button"
                          onClick={() => handlePageChange(num)}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm sm:text-base font-bold transition shadow-2xs cursor-pointer ${
                            isCurrent
                              ? 'bg-[#007A64] text-white shadow-xs'
                              : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}

                    {/* Next Page Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 flex items-center justify-center text-sm font-bold transition shadow-2xs ${
                        currentPage === totalPages
                          ? 'text-slate-300 bg-white cursor-not-allowed opacity-60'
                          : 'text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
                      }`}
                      title="Next Page"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

          </main>

        </div>
      </section>

      {/* Lab Test Detail Pop-up Modal matching reference image */}
      {selectedTestDetail && (
        <TestDetailModal
          test={selectedTestDetail}
          onClose={() => setSelectedTestDetail(null)}
          onBookNow={(test) => {
            setSelectedTestDetail(null);
            setBookingTestItem(test);
          }}
        />
      )}

      {/* Interactive Lab Test Booking Modal */}
      {bookingTestItem && (
        <DiagnosticBookingModal
          item={bookingTestItem}
          type="diagnostic"
          onClose={() => setBookingTestItem(null)}
        />
      )}

    </div>
  );
}
