import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, ShieldCheck, Clock, Award, Home,
  Star, ChevronDown, SlidersHorizontal, Filter,
  Calendar, ArrowRight, LayoutGrid, Check
} from 'lucide-react';

// Custom SVG Icons matching medical aesthetics
function BloodDropSvg({ className = "w-6 h-6 text-rose-500" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function ThyroidSvg({ className = "w-6 h-6 text-purple-600" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 6C5 7 4 10 4 13c0 4 3 6 5 6 1.5 0 2.5-.8 3-2 .5 1.2 1.5 2 3 2 2 0 5-2 5-6 0-3-1-6-4-7-1.5-.5-2.5 0-4 1.5C10.5 6 9.5 5.5 8 6z" />
      <path d="M12 4v4" />
      <path d="M10 11a2 2 0 1 0 4 0" />
    </svg>
  );
}

function LiverSvg({ className = "w-6 h-6 text-rose-600" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 14c0-5 3.5-9 9.5-9 4.5 0 6.5 2.5 6.5 6 0 5-4.5 8-10.5 8C6 19 4 17 4 14z" />
      <path d="M13 5v7c0 1.5-1 2-2.5 2" />
    </svg>
  );
}

function KidneysSvg({ className = "w-6 h-6 text-purple-600" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 7C6.5 7 5 9.5 5 12.5c0 3.5 2 5.5 4 5.5 1.5 0 2.5-1 2.5-3 0-1.5-.5-2-1-2.5.5-.5 1-1 1-2.5 0-2-1-3-2.5-3z" />
      <path d="M15 7c2.5 0 4 2.5 4 5.5 0 3.5-2 5.5-4 5.5-1.5 0-2.5-1-2.5-3 0-1.5.5-2 1-2.5-.5-.5-1-1-1-2.5 0-2 1-3 2.5-3z" />
    </svg>
  );
}

function BodySilhouetteSvg({ className = "w-6 h-6 text-sky-600" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
    </svg>
  );
}

function HeartPulseSvg({ className = "w-6 h-6 text-rose-500" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.28" />
    </svg>
  );
}

function CapsuleSvg({ className = "w-6 h-6 text-blue-600" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}

function RibbonSvg({ className = "w-6 h-6 text-pink-600" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="7" r="4" />
      <path d="m9.5 10.5-4 10.5 6-3 6 3-4-10.5" />
    </svg>
  );
}

function ScooterSvg({ className = "w-5 h-5 text-[#005CB9]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M6 15h7l3-7h3" />
      <path d="M13 15V9" />
    </svg>
  );
}

const LAB_TESTS_DATA = [
  {
    id: 'test-cbc',
    name: 'Complete Blood Count (CBC)',
    category: 'routine',
    categoryName: 'Routine Tests',
    discountPercent: 35,
    rating: 4.6,
    reviewsCount: '2,418',
    price: 399,
    mrp: 600,
    description: 'Checks overall health and detects infections, anemia, etc.',
    iconType: 'blood',
    iconBg: 'bg-rose-50 border border-rose-100',
    popularRank: 1
  },
  {
    id: 'test-thyroid',
    name: 'Thyroid Profile (T3, T4, TSH)',
    category: 'thyroid',
    categoryName: 'Thyroid Tests',
    discountPercent: 30,
    rating: 4.5,
    reviewsCount: '1,936',
    price: 699,
    mrp: 1000,
    description: 'Evaluates thyroid function and hormone levels.',
    iconType: 'thyroid',
    iconBg: 'bg-purple-50 border border-purple-100',
    popularRank: 2
  },
  {
    id: 'test-lft',
    name: 'Liver Function Test (LFT)',
    category: 'liver',
    categoryName: 'Liver Care',
    discountPercent: 29,
    rating: 4.4,
    reviewsCount: '1,278',
    price: 599,
    mrp: 850,
    description: 'Assesses liver health and detects liver disorders.',
    iconType: 'liver',
    iconBg: 'bg-rose-50 border border-rose-100',
    popularRank: 3
  },
  {
    id: 'test-fullbody',
    name: 'Complete Body Checkup',
    category: 'fullbody',
    categoryName: 'Full Body Checkup',
    discountPercent: 33,
    rating: 4.7,
    reviewsCount: '3,205',
    price: 1999,
    mrp: 2999,
    description: 'A comprehensive health checkup with 70+ parameters.',
    iconType: 'body',
    iconBg: 'bg-sky-50 border border-sky-100',
    popularRank: 4
  },
  {
    id: 'test-lipid',
    name: 'Lipid Profile',
    category: 'heart',
    categoryName: 'Heart Care',
    discountPercent: 25,
    rating: 4.6,
    reviewsCount: '1,083',
    price: 799,
    mrp: 1099,
    description: 'Measures cholesterol and triglyceride levels.',
    iconType: 'heart',
    iconBg: 'bg-rose-50 border border-rose-100',
    popularRank: 5
  },
  {
    id: 'test-kft',
    name: 'Kidney Function Test (KFT)',
    category: 'kidney',
    categoryName: 'Kidney Care',
    discountPercent: 28,
    rating: 4.5,
    reviewsCount: '739',
    price: 649,
    mrp: 900,
    description: 'Evaluates kidney health and filtration capacity.',
    iconType: 'kidney',
    iconBg: 'bg-purple-50 border border-purple-100',
    popularRank: 6
  }
];

const CATEGORY_PILLS = [
  { id: 'all', label: 'All Tests', icon: LayoutGrid },
  { id: 'fullbody', label: 'Full Body Checkup', icon: BodySilhouetteSvg, isCustom: true },
  { id: 'diabetes', label: 'Diabetes Care', icon: BloodDropSvg, isCustom: true },
  { id: 'heart', label: 'Heart Care', icon: HeartPulseSvg, isCustom: true },
  { id: 'thyroid', label: 'Thyroid Tests', icon: ThyroidSvg, isCustom: true },
  { id: 'liver', label: 'Liver Care', icon: LiverSvg, isCustom: true },
  { id: 'kidney', label: 'Kidney Care', icon: KidneysSvg, isCustom: true },
  { id: 'vitamins', label: 'Vitamin Tests', icon: CapsuleSvg, isCustom: true },
  { id: 'cancer', label: 'Cancer Screening', icon: RibbonSvg, isCustom: true }
];

const SIDEBAR_CATEGORIES = [
  { id: 'fullbody', name: 'Full Body Checkup', count: 56 },
  { id: 'diabetes', name: 'Diabetes Care', count: 18 },
  { id: 'heart', name: 'Heart Care', count: 24 },
  { id: 'thyroid', name: 'Thyroid Tests', count: 12 },
  { id: 'liver', name: 'Liver Care', count: 16 },
  { id: 'kidney', name: 'Kidney Care', count: 14 },
  { id: 'hormone', name: 'Hormone Tests', count: 20 },
  { id: 'vitamins', name: 'Vitamin & Mineral', count: 22 },
  { id: 'cancer', name: 'Cancer Screening', count: 10 }
];

export default function DiagnosticPortalPage() {
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSidebarCategories, setSelectedSidebarCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputVal, setSearchInputVal] = useState('');
  const [priceMax, setPriceMax] = useState(10000);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [sortBy, setSortBy] = useState('Popularity');
  const [isViewMoreCategories, setIsViewMoreCategories] = useState(false);

  const toggleSidebarCategory = (catId) => {
    setSelectedSidebarCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const toggleDiscount = (pct) => {
    setSelectedDiscounts((prev) =>
      prev.includes(pct) ? prev.filter((p) => p !== pct) : [...prev, pct]
    );
  };

  const handleBookTest = (test) => {
    addItem({
      id: test.id,
      name: test.name,
      price: test.price,
      mrp: test.mrp,
      type: 'test',
      quantity: 1
    });
    addToast(`${test.name} booked! Added to cart.`, 'success');
  };

  const filteredTests = useMemo(() => {
    return LAB_TESTS_DATA.filter((test) => {
      // Horizontal category pill filter
      if (activeCategory !== 'all' && test.category !== activeCategory) {
        return false;
      }

      // Sidebar category checkboxes (if any selected)
      if (
        selectedSidebarCategories.length > 0 &&
        !selectedSidebarCategories.includes(test.category)
      ) {
        return false;
      }

      // Search input filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = test.name.toLowerCase().includes(q);
        const matchesDesc = test.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // Price slider
      if (test.price > priceMax) return false;

      // Discount threshold
      if (selectedDiscounts.length > 0) {
        const meetsAnyDiscount = selectedDiscounts.some(
          (minDisc) => test.discountPercent >= minDisc
        );
        if (!meetsAnyDiscount) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'Popularity') return a.popularRank - b.popularRank;
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Highest Discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'Customer Rating') return b.rating - a.rating;
      return 0;
    });
  }, [activeCategory, selectedSidebarCategories, searchQuery, priceMax, selectedDiscounts, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInputVal);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-16">
      
      {/* =========================================================================
          1. HERO BANNER WITH HOMEPAGE HERO STYLING & LAB SCIENTIST
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#F0F9FB] via-[#E8F6F8] to-[#DEF3F6] border-b border-teal-100/60 select-none">
        {/* 1. Medical Plus (+) Symbols matching Homepage Hero */}
        <div className="absolute top-6 left-[16%] opacity-20 text-teal-400 font-bold text-5xl pointer-events-none select-none">
          +
        </div>
        <div className="absolute top-4 left-[48%] lg:left-[52%] opacity-35 text-teal-300 font-bold text-6xl lg:text-7xl pointer-events-none select-none">
          +
        </div>
        <div className="absolute top-10 right-10 opacity-25 text-teal-300 font-bold text-6xl pointer-events-none select-none">
          +
        </div>

        {/* 2. Bottom-Left Soft Cyan Wave Arc sweeping from corner */}
        <div className="absolute -bottom-10 -left-10 w-[360px] sm:w-[440px] h-[320px] sm:h-[380px] pointer-events-none select-none opacity-40">
          <svg viewBox="0 0 400 400" className="w-full h-full fill-current text-teal-200/50">
            <path d="M0,160 C130,150 230,240 270,400 L0,400 Z" />
          </svg>
        </div>
        <div className="absolute -bottom-16 -left-16 w-[380px] h-[380px] bg-gradient-to-tr from-cyan-100/50 via-teal-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* 3. Distinctive Organic Mint-Cyan Curved Backdrop Wave */}
        <div className="absolute top-0 right-0 w-[64%] sm:w-[58%] lg:w-[50%] xl:w-[46%] h-full pointer-events-none select-none overflow-hidden">
          <svg
            viewBox="0 0 500 400"
            preserveAspectRatio="none"
            className="absolute top-0 right-0 w-full h-full"
          >
            <defs>
              <linearGradient id="labOrganicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#93C5FD" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="labOrganicGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
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
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] bg-gradient-to-bl from-[#60A5FA]/45 via-[#93C5FD]/25 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-7 md:pt-8 lg:pt-9 pb-7 md:pb-8 lg:pb-9 relative z-10 min-h-[250px] lg:min-h-[270px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
            
            {/* Left Content */}
            <div className="lg:col-span-6 xl:col-span-6 z-10 space-y-3 sm:space-y-4 max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-tight">
                Lab Tests & <span className="text-[#005CB9]">Diagnostics</span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-600 max-w-xl font-medium leading-relaxed">
                Book a wide range of lab tests online across Guwahati with home sample collection. All test reports delivered within a single day (12-24 Hours).
              </p>

              {/* 4 Trust Badges in a Horizontal Row */}
              <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-slate-800 font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/80 border border-teal-200/80 flex items-center justify-center text-[#005CB9] shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-[#005CB9]" />
                  </div>
                  <span>100% Accurate Reports</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/80 border border-teal-200/80 flex items-center justify-center text-[#005CB9] shadow-xs">
                    <Home className="w-4 h-4 text-[#005CB9]" />
                  </div>
                  <span>Free Home Collection</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/80 border border-teal-200/80 flex items-center justify-center text-[#005CB9] shadow-xs">
                    <Award className="w-4 h-4 text-[#005CB9]" />
                  </div>
                  <span>NABL Certified Labs</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/80 border border-teal-200/80 flex items-center justify-center text-amber-500 shadow-xs">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-teal-900 font-extrabold">Single-Day Reports</span>
                </div>
              </div>
            </div>

            {/* Right Image: Scientist with Microscope, Test Tubes and DNA Helix */}
            <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 relative items-end justify-end self-end -mb-7 md:-mb-8 lg:-mb-9">
              <img
                src="/lab-tests-hero.png"
                alt="Lab Diagnostics Scientist with Microscope"
                className="h-auto max-h-[210px] xl:max-h-[235px] w-auto max-w-full object-contain object-bottom drop-shadow-md select-none pointer-events-none"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BREADCRUMBS
          ========================================================================= */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-semibold">
          <Link to="/" className="flex items-center gap-1.5 hover:text-[#005CB9] transition">
            <Home className="w-4 h-4 text-[#005CB9]" />
            <span>Home</span>
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-800 font-bold">Lab Tests</span>
        </div>
      </div>

      {/* =========================================================================
          3. SEARCH BAR & HORIZONTAL CATEGORY CARDS
          ========================================================================= */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-4 mb-6">
        {/* Search Bar with Search Button */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center p-1 sm:p-1.5 pl-4 focus-within:border-[#005CB9] focus-within:ring-2 focus-within:ring-[#005CB9]/20 transition">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              value={searchInputVal}
              onChange={(e) => {
                setSearchInputVal(e.target.value);
                if (!e.target.value) setSearchQuery('');
              }}
              placeholder="Search for lab tests, e.g., CBC, Lipid Profile, Thyroid, etc..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {searchInputVal && (
              <button
                type="button"
                onClick={() => {
                  setSearchInputVal('');
                  setSearchQuery('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 mr-1"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#005CB9] hover:bg-[#00786E] text-white text-sm font-semibold rounded-lg transition shrink-0 cursor-pointer shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* 9 Category Horizontal Cards */}
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {CATEGORY_PILLS.map((pill) => {
            const isActive = activeCategory === pill.id;
            const IconComponent = pill.icon;

            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveCategory(pill.id)}
                className={`flex flex-col items-center justify-center min-w-[110px] sm:min-w-[124px] h-[78px] px-2.5 py-2 rounded-xl transition cursor-pointer border shrink-0 text-center ${
                  isActive
                    ? 'bg-[#E7F7F4] border-[#005CB9] shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-teal-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-center">
                  {pill.isCustom ? (
                    <IconComponent
                      className={`w-6 h-6 ${
                        isActive
                          ? 'text-[#005CB9]'
                          : pill.id === 'diabetes'
                          ? 'text-rose-500'
                          : pill.id === 'heart'
                          ? 'text-rose-500'
                          : pill.id === 'thyroid'
                          ? 'text-purple-600'
                          : pill.id === 'liver'
                          ? 'text-rose-600'
                          : pill.id === 'kidney'
                          ? 'text-purple-600'
                          : pill.id === 'vitamins'
                          ? 'text-blue-600'
                          : pill.id === 'cancer'
                          ? 'text-pink-600'
                          : 'text-sky-600'
                      }`}
                    />
                  ) : (
                    <IconComponent
                      className={`w-6 h-6 ${
                        isActive ? 'text-[#005CB9]' : 'text-teal-600'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-xs font-bold leading-tight ${
                    isActive ? 'text-[#005CB9]' : 'text-slate-800'
                  }`}
                >
                  {pill.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          4. MAIN SECTION: SIDEBAR + TEST CARDS GRID
          ========================================================================= */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* ================== LEFT FILTER SIDEBAR ================== */}
          <aside className="lg:col-span-3 space-y-5">
            
            {/* Box 1: Test Categories */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-slate-100">
                <Filter className="w-4 h-4 text-[#005CB9]" />
                <h3 className="text-sm font-bold text-slate-900">Test Categories</h3>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                {SIDEBAR_CATEGORIES.slice(0, isViewMoreCategories ? SIDEBAR_CATEGORIES.length : 6).map((cat) => {
                  const isChecked = selectedSidebarCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 group select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSidebarCategory(cat.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#005CB9] focus:ring-[#005CB9] cursor-pointer"
                        />
                        <span className={`text-xs sm:text-[13px] ${isChecked ? 'text-[#005CB9] font-bold' : 'font-medium'}`}>
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs">({cat.count})</span>
                    </label>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsViewMoreCategories(!isViewMoreCategories)}
                  className="flex items-center gap-1 text-xs font-bold text-[#005CB9] hover:underline pt-1.5 cursor-pointer"
                >
                  <span>{isViewMoreCategories ? 'View Less' : 'View More'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isViewMoreCategories ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Box 2: Filter by Price Range & Offers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Filter className="w-4 h-4 text-[#005CB9]" />
                <h3 className="text-sm font-bold text-slate-900">Filter by</h3>
              </div>

              {/* Price Range */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2.5">Price Range</span>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#005CB9] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold mt-2">
                  <span>₹0</span>
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-900 font-bold">₹{priceMax.toLocaleString()}</span>
                </div>
              </div>

              {/* Offers */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-2.5">Offers</span>
                <div className="space-y-2.5 text-xs sm:text-[13px]">
                  {[
                    { pct: 10, label: '10% and above', count: 48 },
                    { pct: 20, label: '20% and above', count: 36 },
                    { pct: 30, label: '30% and above', count: 20 }
                  ].map((offer) => {
                    const isChecked = selectedDiscounts.includes(offer.pct);
                    return (
                      <label
                        key={offer.pct}
                        className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDiscount(offer.pct)}
                            className="w-4 h-4 rounded border-slate-300 text-[#005CB9] focus:ring-[#005CB9] cursor-pointer"
                          />
                          <span className={`text-xs sm:text-[13px] ${isChecked ? 'text-[#005CB9] font-bold' : 'font-medium'}`}>
                            {offer.label}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs">({offer.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>

          </aside>

          {/* ================== RIGHT CONTENT: POPULAR LAB TESTS ================== */}
          <main className="lg:col-span-9 space-y-4">
            
            {/* Header: Title + Sort dropdown */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Popular Lab Tests
              </h2>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#005CB9] cursor-pointer shadow-2xs"
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Highest Discount">Highest Discount</option>
                    <option value="Customer Rating">Customer Rating</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Test Cards Grid: 3 Columns x 2 Rows = 6 Cards */}
            {filteredTests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-600 font-semibold mb-2">No tests match your filter criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('all');
                    setSelectedSidebarCategories([]);
                    setSearchQuery('');
                    setSearchInputVal('');
                    setPriceMax(10000);
                    setSelectedDiscounts([]);
                  }}
                  className="px-4 py-2 bg-[#005CB9] text-white text-xs font-bold rounded-lg mt-2"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {filteredTests.map((test) => {
                  return (
                    <div
                      key={test.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      {/* Top Content Row: Icon Badge + Details */}
                      <div>
                        <div className="flex items-start gap-3.5 mb-3">
                          {/* Left Icon Badge */}
                          <div className={`w-14 h-14 rounded-xl ${test.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                            {test.iconType === 'blood' && <BloodDropSvg className="w-7 h-7 text-rose-500" />}
                            {test.iconType === 'thyroid' && <ThyroidSvg className="w-7 h-7 text-purple-600" />}
                            {test.iconType === 'liver' && <LiverSvg className="w-7 h-7 text-rose-600" />}
                            {test.iconType === 'body' && <BodySilhouetteSvg className="w-7 h-7 text-sky-600" />}
                            {test.iconType === 'heart' && <HeartPulseSvg className="w-7 h-7 text-rose-500" />}
                            {test.iconType === 'kidney' && <KidneysSvg className="w-7 h-7 text-purple-600" />}
                          </div>

                          {/* Right Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title & Discount Badge */}
                            <div className="flex items-start justify-between gap-1.5">
                              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                                {test.name}
                              </h3>
                              <span className="px-1.5 py-0.5 rounded bg-orange-50 text-[#FF5722] border border-orange-200/60 text-[10px] font-bold whitespace-nowrap shrink-0">
                                {test.discountPercent}% OFF
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
                              {test.description}
                            </p>

                            {/* Star Rating */}
                            <div className="flex items-center gap-1 mt-2 text-xs">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-slate-800">{test.rating}</span>
                              <span className="text-slate-400">({test.reviewsCount})</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Pricing & CTA Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                        {/* Price Row */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base sm:text-lg font-black text-slate-900">
                            ₹{test.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{test.mrp.toLocaleString()}
                          </span>
                        </div>

                        {/* Book Now Button */}
                        <button
                          type="button"
                          onClick={() => handleBookTest(test)}
                          className="px-3.5 py-2 bg-[#005CB9] hover:bg-[#00786E] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Now</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* =========================================================================
                BOTTOM PROMOTIONAL BAR: HOME SAMPLE COLLECTION (Directly below Popular Lab Tests)
                ========================================================================= */}
            <div className="pt-3">
              <div className="bg-[#EAF7F5] border border-teal-100/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col xl:flex-row items-center justify-between gap-4 sm:gap-5">
                
                {/* Left Title with Royal Blue Home Icon */}
                <div className="flex items-center gap-3.5 w-full xl:w-auto">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#005CB9] shrink-0 shadow-2xs">
                    <Home className="w-5 h-5 sm:w-6 sm:h-6 text-[#005CB9]" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                      Home Sample Collection
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Book your test and get sample collection at your doorstep.
                    </p>
                  </div>
                </div>

                {/* Center 4 Features */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full xl:w-auto text-center py-2 xl:py-0 border-y xl:border-y-0 xl:border-x border-teal-200/60 xl:px-5">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#005CB9]" />
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800">Easy Booking</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1">
                    <ScooterSvg className="w-4 h-4 sm:w-5 sm:h-5 text-[#005CB9]" />
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800">Trained Phlebotomist</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#005CB9]" />
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800">Safe & Hygienic</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    <span className="text-[11px] sm:text-xs font-bold text-blue-800 whitespace-nowrap">Reports in a Single Day (12-24 Hrs)</span>
                  </div>
                </div>

                {/* Right CTA Button */}
                <div className="w-full xl:w-auto flex justify-center xl:justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                      addToast('Choose from our popular tests above to book!', 'info');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#005CB9] hover:bg-[#00786E] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <span>Book a Lab Test Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

          </main>

        </div>
      </div>

    </div>
  );
}
