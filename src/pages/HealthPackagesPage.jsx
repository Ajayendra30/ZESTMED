import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, ShieldCheck, HeartPulse, Home, Heart, Star, 
  SlidersHorizontal, Clock, ArrowRight, LayoutGrid, Users, 
  Droplet, Activity, FileText, Calendar, Truck, UserCheck,
  ChevronDown
} from 'lucide-react';

const PACKAGES_DATA = [
  {
    id: 'pkg-1',
    name: 'Complete Body Checkup',
    subtitle: 'A comprehensive health checkup with 70+ tests.',
    category: 'fullbody',
    categoryName: 'Full Body Checkup',
    testsCount: 70,
    discountPercent: 33,
    rating: 4.7,
    reviewsCount: '3,205',
    price: 1999,
    mrp: 2999,
    includes: '70+ Tests Included (CBC, Lipid, LFT, KFT, Blood Sugar, Thyroid, Urine)',
    reportsIn: 'Same Day (Within 12-24 Hours) ⚡',
    fasting: '10-12 hrs Fasting Required',
    image: '/packages/pkg-1-thumb.jpg',
    tag: 'Bestseller'
  },
  {
    id: 'pkg-2',
    name: "Men's Health Package",
    subtitle: "Key tests for overall men's health & wellness.",
    category: 'men',
    categoryName: "Men's Health",
    testsCount: 55,
    discountPercent: 25,
    rating: 4.6,
    reviewsCount: '1,987',
    price: 1499,
    mrp: 1999,
    includes: '55+ Tests Included (PSA, Testosterone, Cardiac Risk, Vitamin D, Lipid)',
    reportsIn: 'Same Day (Within 12-24 Hours) ⚡',
    fasting: '10-12 hrs Fasting Required',
    image: '/packages/pkg-2-thumb.jpg',
    tag: 'Popular'
  },
  {
    id: 'pkg-3',
    name: "Women's Health Package",
    subtitle: "Essential tests for women's complete health.",
    category: 'women',
    categoryName: "Women's Health",
    testsCount: 58,
    discountPercent: 30,
    rating: 4.6,
    reviewsCount: '1,643',
    price: 1799,
    mrp: 2599,
    includes: '58+ Tests Included (Thyroid Profile, Iron, Calcium, Vitamin D, Pap Smear)',
    reportsIn: 'Same Day (Within 12-24 Hours) ⚡',
    fasting: '10-12 hrs Fasting Required',
    image: '/packages/pkg-3-thumb.jpg',
    tag: 'Popular'
  },
  {
    id: 'pkg-4',
    name: 'Senior Citizen Health Package',
    subtitle: 'Complete screening for age 60+ with free 10km transport in Guwahati.',
    category: 'senior',
    categoryName: 'Senior Citizen',
    testsCount: 75,
    discountPercent: 28,
    rating: 4.9,
    reviewsCount: '892',
    price: 1899,
    mrp: 2699,
    includes: '75+ Tests + Free 10km Roundtrip Sanitized AC Cab in Guwahati',
    reportsIn: 'Same Day (Within 12-24 Hours) ⚡',
    fasting: '10-12 hrs Fasting Required',
    image: '/packages/pkg-4-thumb.jpg',
    tag: 'Free 10km Cab Included',
    hasFreeCab: true
  },
  {
    id: 'pkg-5',
    name: 'Diabetes Care Package',
    subtitle: 'Comprehensive tests to monitor and manage diabetes.',
    category: 'diabetes',
    categoryName: 'Diabetes Care',
    testsCount: 42,
    discountPercent: 20,
    rating: 4.6,
    reviewsCount: '1,276',
    price: 1299,
    mrp: 1599,
    includes: '42+ Tests Included (HbA1c, Fasting Blood Sugar, PPBS, Lipid, Microalbumin)',
    reportsIn: 'Same Day (Within 12-24 Hours) ⚡',
    fasting: '10-12 hrs Fasting Required',
    image: '/packages/pkg-5-thumb.jpg',
    tag: 'Essential'
  },
  {
    id: 'pkg-6',
    name: 'Heart Care Package',
    subtitle: 'Advanced tests to assess your heart health.',
    category: 'heart',
    categoryName: 'Heart Care',
    testsCount: 48,
    discountPercent: 25,
    rating: 4.7,
    reviewsCount: '1,108',
    price: 2499,
    mrp: 3299,
    includes: '48+ Tests Included (Lipid Profile, hs-CRP, ECG, Apolipoprotein, Homocysteine)',
    reportsIn: 'Same Day (Within 12-24 Hours) ⚡',
    fasting: '10-12 hrs Fasting Required',
    image: '/packages/pkg-6-thumb.jpg',
    tag: 'Recommended'
  }
];

const CATEGORY_PILLS = [
  { id: 'all', label: 'All Packages', icon: LayoutGrid, iconColor: 'text-[#005CB9]' },
  { id: 'fullbody', label: 'Full Body Checkup', icon: HeartPulse, iconColor: 'text-blue-500' },
  { id: 'men', label: "Men's Health", icon: UserCheck, iconColor: 'text-sky-500' },
  { id: 'women', label: "Women's Health", icon: Heart, iconColor: 'text-pink-500' },
  { id: 'senior', label: 'Senior Citizen', icon: Users, iconColor: 'text-emerald-500' },
  { id: 'diabetes', label: 'Diabetes Care', icon: Droplet, iconColor: 'text-rose-500' },
  { id: 'heart', label: 'Heart Care', icon: Activity, iconColor: 'text-red-500' },
  { id: 'preventive', label: 'Preventive Care', icon: ShieldCheck, iconColor: 'text-teal-600' },
];

export default function HealthPackagesPage() {
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [activeCategoryPill, setActiveCategoryPill] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMax, setPriceMax] = useState(10000);
  const [minDiscount, setMinDiscount] = useState(0);
  const [wishlist, setWishlist] = useState({});
  const [sortBy, setSortBy] = useState('Popularity');
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [showAllTypes, setShowAllTypes] = useState(false);

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
    if (!wishlist[id]) {
      addToast('Health package saved to wishlist!', 'success');
    } else {
      addToast('Removed from saved list', 'info');
    }
  };

  const handleBookPackage = (pkg) => {
    addItem({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      mrp: pkg.mrp,
      type: 'package',
      quantity: 1,
      image: pkg.image,
      testsCount: pkg.testsCount
    });
    addToast(`${pkg.name} added to cart!`, 'success');
  };

  const handleCategorySelect = (catId) => {
    setActiveCategoryPill(catId);
    if (catId === 'all') {
      setSelectedTypes(new Set());
    } else {
      setSelectedTypes(new Set([catId]));
    }
  };

  const handleSidebarTypeToggle = (typeId) => {
    const next = new Set(selectedTypes);
    if (next.has(typeId)) {
      next.delete(typeId);
    } else {
      next.add(typeId);
    }
    setSelectedTypes(next);

    if (next.size === 1) {
      setActiveCategoryPill(Array.from(next)[0]);
    } else if (next.size === 0) {
      setActiveCategoryPill('all');
    } else {
      setActiveCategoryPill('custom');
    }
  };

  const filteredPackages = useMemo(() => {
    return PACKAGES_DATA.filter((pkg) => {
      // Category filter (either pill or sidebar checkboxes)
      if (selectedTypes.size > 0 && !selectedTypes.has(pkg.category)) {
        return false;
      }
      if (activeCategoryPill !== 'all' && activeCategoryPill !== 'custom' && selectedTypes.size === 0 && pkg.category !== activeCategoryPill) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = pkg.name.toLowerCase().includes(q);
        const matchesSubtitle = pkg.subtitle.toLowerCase().includes(q);
        const matchesInc = pkg.includes.toLowerCase().includes(q);
        if (!matchesName && !matchesSubtitle && !matchesInc) return false;
      }

      // Price filter
      if (pkg.price > priceMax) return false;

      // Discount filter
      if (minDiscount > 0 && pkg.discountPercent < minDiscount) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'Rating') return b.rating - a.rating;
      return 0; // Default: Popularity
    });
  }, [activeCategoryPill, selectedTypes, searchQuery, priceMax, minDiscount, sortBy]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-20 select-none">
      
      {/* 1. HERO BANNER - EXACT HOMEPAGE HERO STYLING & PACKAGES VISUAL */}
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
              <linearGradient id="pkgOrganicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#93C5FD" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="pkgOrganicGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path
              d="M110,0 C180,45 150,135 230,185 C300,225 390,210 500,260 L500,0 Z"
              fill="url(#pkgOrganicGrad1)"
            />
            <path
              d="M230,0 C280,65 260,150 340,195 C400,225 450,215 500,225 L500,0 Z"
              fill="url(#pkgOrganicGrad2)"
              opacity="0.65"
            />
          </svg>
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] bg-gradient-to-bl from-[#60A5FA]/45 via-[#93C5FD]/25 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10 min-h-[280px] sm:min-h-[300px] lg:min-h-[330px] xl:min-h-[350px] flex items-center">
          {/* Left Column: Heading, Subtitle & 4 Key Feature Badges */}
          <div className="relative z-20 max-w-lg lg:max-w-xl xl:max-w-2xl py-8 sm:py-10 lg:py-12 space-y-3 sm:space-y-3.5">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#0B1728] tracking-tight leading-tight">
              Health Checkup <span className="text-[#005CB9]">Packages</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
              Comprehensive health checkup packages for you and your family at affordable prices.
            </p>

            {/* 4 Trust Badges in a Horizontal Row */}
            <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-slate-800 font-bold">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/80 border border-teal-200/80 flex items-center justify-center text-[#005CB9] shadow-xs">
                  <HeartPulse className="w-4 h-4 text-[#005CB9]" />
                </div>
                <span>Full Body Screening</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/80 border border-teal-200/80 flex items-center justify-center text-[#005CB9] shadow-xs">
                  <Home className="w-4 h-4 text-[#005CB9]" />
                </div>
                <span>Free Sample Collection</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/80 border border-teal-200/80 flex items-center justify-center text-[#005CB9] shadow-xs">
                  <UserCheck className="w-4 h-4 text-[#005CB9]" />
                </div>
                <span>Doctor Consultation</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/80 border border-teal-200/80 flex items-center justify-center text-[#005CB9] shadow-xs">
                  <Clock className="w-4 h-4 text-[#005CB9]" />
                </div>
                <span>Same Day Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Right Imagery: Prominently sized family with shield resting along the bottom baseline */}
        <div className="hidden lg:flex absolute bottom-0 right-0 h-full w-[56%] xl:w-[52%] 2xl:w-[48%] pointer-events-none z-10 items-end justify-end overflow-hidden pr-2 sm:pr-4 lg:pr-8 xl:pr-12">
          <img
            src="/packages-hero-family.png"
            alt="Health Packages Protection Family"
            className="h-auto max-h-[300px] lg:max-h-[320px] xl:max-h-[345px] 2xl:max-h-[365px] w-auto max-w-full object-contain object-bottom drop-shadow-md select-none"
          />
        </div>

        {/* Mobile View Image (Displayed below badges on <lg screens) */}
        <div className="lg:hidden relative z-10 px-4 sm:px-6 pb-2 flex justify-end">
          <img
            src="/packages-hero-family.png"
            alt="Health Packages Protection Family"
            className="w-full max-w-lg h-auto max-h-[250px] object-contain object-right-bottom drop-shadow-md select-none ml-auto"
          />
        </div>
      </section>

      {/* 2. BREADCRUMB */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-5 pb-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold">
          <Link to="/" className="flex items-center gap-1.5 hover:text-[#005CB9] transition">
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#005CB9]" />
            <span>Home</span>
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-900 font-bold">Health Packages</span>
        </div>
      </div>

      {/* 3. MAIN SECTION (SIDEBAR + MAIN CONTENT AREA) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ================== LEFT SIDEBAR: FILTER PACKAGES ================== */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
              {/* Sidebar Header */}
              <div className="flex items-center gap-2 text-[#0B1728] font-black text-base pb-3 border-b border-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-[#005CB9]" />
                <span>Filter Packages</span>
              </div>

              {/* Group 1: Package Type */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#0B1728]">Package Type</h4>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {[
                    { id: 'fullbody', name: 'Full Body Checkup', count: 12 },
                    { id: 'men', name: "Men's Health", count: 6 },
                    { id: 'women', name: "Women's Health", count: 6 },
                    { id: 'senior', name: 'Senior Citizen', count: 4 },
                    { id: 'diabetes', name: 'Diabetes Care', count: 5 },
                    { id: 'heart', name: 'Heart Care', count: 4 },
                    ...(showAllTypes
                      ? [
                          { id: 'thyroid', name: 'Thyroid Care', count: 3 },
                          { id: 'kidney', name: 'Kidney Function', count: 4 },
                          { id: 'liver', name: 'Liver Health', count: 3 },
                          { id: 'fitness', name: 'Fitness & Sports', count: 5 },
                        ]
                      : []),
                  ].map((type) => {
                    const isChecked = selectedTypes.has(type.id);
                    return (
                      <label
                        key={type.id}
                        className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 group"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSidebarTypeToggle(type.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#005CB9] focus:ring-[#005CB9] cursor-pointer"
                          />
                          <span className={`font-medium ${isChecked ? 'text-[#005CB9] font-bold' : ''}`}>
                            {type.name}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-semibold">({type.count})</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllTypes(!showAllTypes)}
                  className="flex items-center gap-1 text-xs text-[#005CB9] font-bold hover:underline pt-1 cursor-pointer"
                >
                  <span>{showAllTypes ? 'Show Less' : 'View More'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllTypes ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Group 2: Price Range */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-sm font-bold text-[#0B1728]">Price Range</h4>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="250"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#005CB9] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 font-bold">
                  <span>₹0</span>
                  <span className="text-slate-400">—</span>
                  <span className="text-[#005CB9]">₹{priceMax.toLocaleString()}</span>
                </div>
              </div>

              {/* Group 3: Discount */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-sm font-bold text-[#0B1728]">Discount</h4>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {[
                    { val: 10, label: '10% and above', count: 8 },
                    { val: 20, label: '20% and above', count: 12 },
                    { val: 30, label: '30% and above', count: 6 },
                  ].map((d) => (
                    <label
                      key={d.val}
                      className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={minDiscount === d.val}
                          onChange={() => setMinDiscount(minDiscount === d.val ? 0 : d.val)}
                          className="w-4 h-4 rounded border-slate-300 text-[#005CB9] focus:ring-[#005CB9] cursor-pointer"
                        />
                        <span className={`font-medium ${minDiscount === d.val ? 'text-[#005CB9] font-bold' : ''}`}>
                          {d.label}
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs font-semibold">({d.count})</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ================== RIGHT MAIN AREA: SEARCH, CATEGORIES, POPULAR PACKAGES ================== */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* 1. Search Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 flex items-center shadow-xs focus-within:border-[#005CB9] transition">
              <Search className="w-5 h-5 text-slate-400 ml-3 mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for health packages, e.g., Full Body Checkup, Diabetes Care..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium pr-2"
              />
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    addToast(`Filtering health packages matching "${searchQuery}"`, 'info');
                  } else {
                    addToast('Showing all available health packages', 'info');
                  }
                }}
                className="px-6 py-2 bg-[#005CB9] hover:bg-[#004C99] text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer shrink-0 shadow-xs"
              >
                Search
              </button>
            </div>

            {/* 2. Category Cards Bar (Horizontal row of 8 cards matching reference) */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORY_PILLS.map((pill) => {
                const isActive = activeCategoryPill === pill.id;
                const IconComponent = pill.icon;

                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handleCategorySelect(pill.id)}
                    className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border text-center transition cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#E2F7F8] border-[#005CB9] text-[#005CB9] shadow-xs'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:border-teal-200 hover:bg-teal-50/40'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-1.5 ${isActive ? 'text-[#005CB9]' : pill.iconColor}`} />
                    <span className={`text-[10px] sm:text-[11px] leading-tight line-clamp-2 ${isActive ? 'font-black' : 'font-bold'}`}>
                      {pill.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3. Section Title + Sort By */}
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1728] tracking-tight">
                Popular Health Packages
              </h2>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-slate-500 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#005CB9] cursor-pointer shadow-xs"
                >
                  <option value="Popularity">Popularity</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Discount">Discount</option>
                  <option value="Rating">Rating</option>
                </select>
              </div>
            </div>

            {/* 4. Packages Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredPackages.map((pkg) => {
                const isLiked = wishlist[pkg.id];

                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl border border-slate-200/85 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Left: Thumbnail Image */}
                      <div className="w-[84px] h-[98px] rounded-xl overflow-hidden shrink-0 bg-[#F1F5F9] border border-slate-200/80 shadow-2xs">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Right: Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Top: Discount Badge + Wishlist */}
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-[#EAF8EF] text-[#16A34A] text-[10px] sm:text-[11px] font-bold">
                            {pkg.discountPercent}% OFF
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(pkg.id)}
                            className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition cursor-pointer"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-[#0B1728] leading-snug line-clamp-1 group-hover:text-[#005CB9] transition">
                          {pkg.name}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug line-clamp-2">
                          {pkg.subtitle}
                        </p>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 pt-0.5">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span>{pkg.rating}</span>
                          <span className="text-slate-400 font-normal">({pkg.reviewsCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Price + Book Now Button */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-black text-[#0B1728]">
                          ₹{pkg.price.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{pkg.mrp.toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookPackage(pkg)}
                        className="px-3 py-1.5 bg-[#005CB9] hover:bg-[#004C99] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5. Bottom Promotional Bar: Home Sample Collection (Exact Reference Match) */}
            <div className="bg-[#F8FCFB] border border-[#C6ECE5] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-3 shadow-xs mt-6">
              {/* Left Column: Home Icon + Title & Subtitle */}
              <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#E6F7F4] flex items-center justify-center text-[#005CB9] shrink-0">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0B1728] leading-tight">Home Sample Collection</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    Book any health package and get sample collection<br className="hidden sm:inline" /> at your doorstep.
                  </p>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden lg:block w-px h-9 bg-slate-200/90 mx-1 shrink-0" />

              {/* Middle Column: 4 Features with Centered Icons Above Text & Vertical Dividers */}
              <div className="flex items-center justify-between w-full lg:w-auto gap-2.5 sm:gap-4 md:gap-5 overflow-x-auto py-1">
                {/* 1. Easy Booking */}
                <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 shrink-0">
                  <Calendar className="w-5 h-5 text-[#005CB9] stroke-[2] mb-1" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#0B1728] leading-tight">
                    Easy Booking
                  </span>
                </div>

                <div className="w-px h-7 bg-slate-200/90 shrink-0" />

                {/* 2. Trained Phlebotomist */}
                <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 shrink-0">
                  <Truck className="w-5 h-5 text-[#005CB9] stroke-[2] mb-1" />
                  <div className="text-[10px] sm:text-[11px] font-bold text-[#0B1728] leading-tight">
                    <div>Trained</div>
                    <div>Phlebotomist</div>
                  </div>
                </div>

                <div className="w-px h-7 bg-slate-200/90 shrink-0" />

                {/* 3. Safe & Hygienic */}
                <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#005CB9] stroke-[2] mb-1" />
                  <div className="text-[10px] sm:text-[11px] font-bold text-[#0B1728] leading-tight">
                    <div>Safe &</div>
                    <div>Hygienic</div>
                  </div>
                </div>

                <div className="w-px h-7 bg-slate-200/90 shrink-0" />

                {/* 4. Reports in 24–48 Hours */}
                <div className="flex flex-col items-center justify-center text-center px-1 sm:px-2 shrink-0">
                  <Clock className="w-5 h-5 text-[#005CB9] stroke-[2] mb-1" />
                  <div className="text-[10px] sm:text-[11px] font-bold text-[#0B1728] leading-tight">
                    <div>Reports in</div>
                    <div>24–48 Hours</div>
                  </div>
                </div>
              </div>

              {/* Right Column: CTA Button */}
              <div className="shrink-0 w-full lg:w-auto flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (filteredPackages.length > 0) handleBookPackage(filteredPackages[0]);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-[#005CB9] hover:bg-[#004C99] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <span>Book a Health Package Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </main>

        </div>
      </div>

    </div>
  );
}
