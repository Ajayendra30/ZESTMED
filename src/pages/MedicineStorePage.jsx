import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, ShieldCheck, Truck, Tag, RotateCcw,
  Heart, Star, ShoppingCart, ChevronDown, 
  Home, Filter, Layers, ArrowLeft, ArrowRight
} from 'lucide-react';

const STORE_MEDICINES = [
  {
    id: 'store-1',
    name: 'Paracetamol 500 mg',
    pack: '(10 Tablets)',
    brand: 'Cipla',
    category: 'general',
    price: 32,
    mrp: 40,
    discountPercent: 20,
    rating: 4.6,
    reviewsCount: '2,418',
    image: '/medicines/paracetamol.png',
    popularityRank: 1
  },
  {
    id: 'store-2',
    name: 'Amoxicillin 500 mg',
    pack: '(10 Capsules)',
    brand: 'Sun Pharma',
    category: 'general',
    price: 78,
    mrp: 98,
    discountPercent: 25,
    rating: 4.5,
    reviewsCount: '1,936',
    image: '/medicines/amoxicillin.png',
    popularityRank: 2
  },
  {
    id: 'store-3',
    name: 'Omeprazole 20 mg',
    pack: '(10 Capsules)',
    brand: "Dr. Reddy's",
    category: 'digestive',
    price: 62,
    mrp: 75,
    discountPercent: 17,
    rating: 4.4,
    reviewsCount: '1,278',
    image: '/medicines/omeprazole.png',
    popularityRank: 3
  },
  {
    id: 'store-4',
    name: 'Vitamin D3 600 IU',
    pack: '(10 Tablets)',
    brand: 'Alkem',
    category: 'vitamins',
    price: 140,
    mrp: 200,
    discountPercent: 30,
    rating: 4.7,
    reviewsCount: '964',
    image: '/medicines/vitamind3.png',
    popularityRank: 4
  },
  {
    id: 'store-5',
    name: 'Cetirizine 10 mg',
    pack: '(10 Tablets)',
    brand: 'Cipla',
    category: 'respiratory',
    price: 46,
    mrp: 54,
    discountPercent: 15,
    rating: 4.5,
    reviewsCount: '812',
    image: '/medicines/cetirizine.png',
    popularityRank: 5
  },
  {
    id: 'store-6',
    name: 'Amlodipine 5 mg',
    pack: '(10 Tablets)',
    brand: "Dr. Reddy's",
    category: 'heart',
    price: 48,
    mrp: 60,
    discountPercent: 20,
    rating: 4.6,
    reviewsCount: '1,083',
    image: '/medicines/amlodipine.png',
    popularityRank: 6
  },
  {
    id: 'store-7',
    name: 'Atorvastatin 10 mg',
    pack: '(10 Tablets)',
    brand: 'Sun Pharma',
    category: 'heart',
    price: 82,
    mrp: 100,
    discountPercent: 18,
    rating: 4.4,
    reviewsCount: '739',
    image: '/medicines/atorvastatin.png',
    popularityRank: 7
  },
  {
    id: 'store-8',
    name: 'Pantoprazole 40 mg',
    pack: '(10 Tablets)',
    brand: 'Torrent Pharma',
    category: 'digestive',
    price: 70,
    mrp: 90,
    discountPercent: 22,
    rating: 4.5,
    reviewsCount: '691',
    image: '/medicines/pantoprazole.png',
    popularityRank: 8
  }
];

const CATEGORIES_LIST = [
  { id: 'general', name: 'General Medicines', count: '1,234' },
  { id: 'vitamins', name: 'Vitamins & Supplements', count: '456' },
  { id: 'diabetes', name: 'Diabetes Care', count: '328' },
  { id: 'heart', name: 'Heart Care', count: '217' },
  { id: 'respiratory', name: 'Respiratory Care', count: '184' },
  { id: 'digestive', name: 'Digestive Care', count: '162' },
  { id: 'personal', name: 'Personal Care', count: '398' },
  { id: 'baby', name: 'Baby Care', count: '145' },
];

export default function MedicineStorePage({ onOpenPrescriptionModal }) {
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputVal, setSearchInputVal] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMax, setPriceMax] = useState(5000);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [sortBy, setSortBy] = useState('Popularity');
  const [wishlist, setWishlist] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewMoreCategories, setIsViewMoreCategories] = useState(false);

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
    const isNowLiked = !wishlist[id];
    if (isNowLiked) {
      addToast('Added to wishlist!', 'success');
    } else {
      addToast('Removed from wishlist', 'info');
    }
  };

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const toggleDiscount = (pct) => {
    setSelectedDiscounts((prev) =>
      prev.includes(pct) ? prev.filter((p) => p !== pct) : [...prev, pct]
    );
  };

  const handleAddToCart = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      type: 'medicine',
      quantity: 1,
      image: product.image,
      pack: product.pack
    });
    addToast(`${product.name} added to cart!`, 'success');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInputVal);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return STORE_MEDICINES.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand) return false;
      }

      if (brandSearch.trim()) {
        const b = brandSearch.toLowerCase().trim();
        if (!item.brand.toLowerCase().includes(b)) return false;
      }

      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
        return false;
      }

      if (item.price > priceMax) return false;

      if (selectedDiscounts.length > 0) {
        const matchesAnyDiscount = selectedDiscounts.some(
          (pct) => item.discountPercent >= pct
        );
        if (!matchesAnyDiscount) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'Popularity') return a.popularityRank - b.popularityRank;
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'Rating') return b.rating - a.rating;
      return 0;
    });
  }, [searchQuery, selectedCategories, priceMax, selectedDiscounts, brandSearch, sortBy]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-16">
      
      {/* =========================================================================
          1. HERO BANNER WITH HOMEPAGE HERO STYLING & MEDICINES VISUAL - FULL WIDTH
          ========================================================================= */}
      <section className="relative w-full min-w-full overflow-hidden bg-gradient-to-r from-[#F0F9FB] via-[#E8F6F8] to-[#DEF3F6] border-b border-teal-100/60 select-none">
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
              <linearGradient id="medOrganicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4F1F7" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#A2E6F2" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#7AD4E4" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="medOrganicGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BCEEF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#67CCE0" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path
              d="M110,0 C180,45 150,135 230,185 C300,225 390,210 500,260 L500,0 Z"
              fill="url(#medOrganicGrad1)"
            />
            <path
              d="M230,0 C280,65 260,150 340,195 C400,225 450,215 500,225 L500,0 Z"
              fill="url(#medOrganicGrad2)"
              opacity="0.65"
            />
          </svg>
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] bg-gradient-to-bl from-[#75D2E4]/45 via-[#9FE5F2]/25 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-8 md:pt-9 lg:pt-10 pb-8 md:pb-9 lg:pb-10 relative z-10 min-h-[260px] lg:min-h-[290px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
            
            {/* Left Column */}
            <div className="lg:col-span-7 xl:col-span-7 z-10 space-y-3.5 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-slate-900 tracking-tight leading-tight">
                Medicines <span className="text-[#008F83]">Store</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
                Order genuine medicines online with fast & safe delivery at your doorstep.
              </p>

              {/* 4 Trust Badges in a 2x2 Grid: Best Prices placed directly under Express Delivery */}
              <div className="pt-3 sm:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 lg:gap-x-10 gap-y-3 sm:gap-y-3.5 max-w-xl text-sm sm:text-base text-slate-800 font-bold">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#008F83]">
                    <ShieldCheck className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-[#008F83]" />
                  </div>
                  <span>100% Genuine Medicines</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#008F83]">
                    <Truck className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-[#008F83]" />
                  </div>
                  <span>Express Delivery</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#008F83]">
                    <RotateCcw className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-[#008F83]" />
                  </div>
                  <span>Easy Returns</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#008F83]">
                    <Tag className="w-6.5 h-6.5 sm:w-7 sm:h-7 text-[#008F83]" />
                  </div>
                  <span>Best Prices</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual with Bottles and First Aid Box pulled down to bottom baseline */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative items-end justify-end self-end -mb-8 md:-mb-9 lg:-mb-10">
              <img
                src="/medicines-hero.png"
                alt="Pharmacy Medicines and First Aid Kit"
                className="h-auto max-h-[220px] xl:max-h-[245px] w-auto max-w-full object-contain object-bottom drop-shadow-md select-none pointer-events-none"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BREADCRUMBS
          ========================================================================= */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-3.5">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-semibold">
          <Link to="/" className="flex items-center gap-1 hover:text-[#008F83] transition">
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#008F83]" />
            <span>Home</span>
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-800 font-bold">Medicines</span>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN STORE LAYOUT (SIDEBAR + PRODUCTS GRID) - FULL WIDTH
          ========================================================================= */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-6 xl:gap-8 items-start w-full">
          
          {/* ================== LEFT FILTER SIDEBAR ================== */}
          <aside className="lg:col-span-3 space-y-4 sm:space-y-5">
            
            {/* Box 1: Categories */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
                <Layers className="w-4 h-4 text-[#008F83]" />
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Categories</h3>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm">
                {CATEGORIES_LIST.slice(0, isViewMoreCategories ? CATEGORIES_LIST.length : 8).map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 select-none group"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#008F83] focus:ring-[#008F83] cursor-pointer"
                        />
                        <span className={`text-xs sm:text-sm ${isChecked ? 'text-[#008F83] font-bold' : 'font-medium'}`}>
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px] sm:text-xs font-medium">({cat.count})</span>
                    </label>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsViewMoreCategories(!isViewMoreCategories)}
                  className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#008F83] hover:underline pt-1.5 cursor-pointer"
                >
                  <span>{isViewMoreCategories ? 'View Less' : 'View More'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isViewMoreCategories ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Box 2: Filter by (Price Range, Discount, Brand) */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Filter className="w-4 h-4 text-[#008F83]" />
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Filter by</h3>
              </div>

              {/* Price Range Slider */}
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block mb-2">Price Range</span>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#008F83] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 font-bold mt-2">
                  <span>₹0</span>
                  <span className="text-slate-400">—</span>
                  <span className="text-slate-900 font-black">₹{priceMax.toLocaleString()}</span>
                </div>
              </div>

              {/* Discount Checkboxes */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs sm:text-sm font-bold text-slate-900 block mb-2">Discount</span>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {[
                    { val: 10, label: '10% and above', count: 632 },
                    { val: 20, label: '20% and above', count: 348 },
                    { val: 30, label: '30% and above', count: 156 },
                  ].map((d) => {
                    const isChecked = selectedDiscounts.includes(d.val);
                    return (
                      <label
                        key={d.val}
                        className="flex items-center justify-between cursor-pointer text-slate-700 hover:text-slate-900 select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDiscount(d.val)}
                            className="w-4 h-4 rounded border-slate-300 text-[#008F83] focus:ring-[#008F83] cursor-pointer"
                          />
                          <span className={`text-xs sm:text-sm ${isChecked ? 'text-[#008F83] font-bold' : 'font-medium'}`}>
                            {d.label}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] sm:text-xs font-medium">({d.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Brand Search */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs sm:text-sm font-bold text-slate-900 block mb-2">Brand</span>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search brand..."
                    className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#008F83] transition"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              {(selectedCategories.length > 0 || selectedDiscounts.length > 0 || priceMax < 5000 || brandSearch || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedDiscounts([]);
                    setPriceMax(5000);
                    setBrandSearch('');
                    setSearchQuery('');
                    setSearchInputVal('');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

          </aside>

          {/* ================== RIGHT PRODUCT GRID AREA ================== */}
          <main className="lg:col-span-9 space-y-4 sm:space-y-4.5">
            
            {/* Top Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center p-1 sm:p-1.5 pl-4 focus-within:border-[#008F83] focus-within:ring-2 focus-within:ring-[#008F83]/20 transition">
                <Search className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchInputVal}
                  onChange={(e) => {
                    setSearchInputVal(e.target.value);
                    if (!e.target.value) setSearchQuery('');
                  }}
                  placeholder="Search for medicines, brands, or health concerns..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {searchInputVal && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInputVal('');
                      setSearchQuery('');
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2.5 py-1 mr-1 font-medium"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#008F83] hover:bg-[#00786E] text-white text-xs sm:text-sm font-bold rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Sub-header row: Count & Sort */}
            <div className="flex items-center justify-between text-xs sm:text-sm py-1">
              <span className="font-bold text-slate-900">
                Showing 1 – {filteredProducts.length} of 3,456 medicines
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#008F83] cursor-pointer shadow-2xs"
                  >
                    <option value="Popularity">Popularity</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Discount">Highest Discount</option>
                    <option value="Rating">Customer Rating</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Grid: 4 Columns x 2 Rows = 8 Cards */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <p className="text-slate-600 font-bold mb-3 text-base">No medicines match your filter criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedDiscounts([]);
                    setPriceMax(5000);
                    setBrandSearch('');
                    setSearchQuery('');
                    setSearchInputVal('');
                  }}
                  className="px-5 py-2.5 bg-[#008F83] text-white text-sm font-bold rounded-xl mt-2 cursor-pointer shadow-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-4.5">
                {filteredProducts.map((item) => {
                  const isLiked = wishlist[item.id];

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Top Row: Discount badge & Wishlist Heart */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#E8F8EE] text-[#16A34A] text-[10px] sm:text-[11px] font-bold">
                            {item.discountPercent}% OFF
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleWishlist(item.id)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                              isLiked
                                ? 'text-rose-500 bg-rose-50'
                                : 'text-slate-300 hover:text-rose-500 hover:bg-slate-50'
                            }`}
                            title="Add to Wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          </button>
                        </div>

                        {/* Medicine Packaging Image */}
                        <div className="w-full h-22 sm:h-26 flex items-center justify-center p-1.5 my-0.5 overflow-hidden group-hover:scale-105 transition-transform">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              // Fallback if image path fails
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Product Title & Pack */}
                        <div className="space-y-0.5 mt-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#008F83] transition leading-snug line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                            {item.pack}
                          </p>

                          {/* Brand & Star Rating Row */}
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-600">
                              {item.brand}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-700">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{item.rating}</span>
                              <span className="text-slate-400 text-[10px]">({item.reviewsCount})</span>
                            </div>
                          </div>

                          {/* Pricing Row */}
                          <div className="flex items-baseline gap-1.5 pt-1.5">
                            <span className="text-base sm:text-lg font-black text-slate-900">
                              ₹{item.price}
                            </span>
                            <span className="text-[11px] sm:text-xs text-slate-400 line-through">
                              ₹{item.mrp}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="w-full mt-2.5 py-2 sm:py-2.5 px-3 bg-[#008F83] hover:bg-[#00786E] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Row */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 select-none">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer shadow-2xs ${
                    currentPage === page
                      ? 'bg-[#008F83] text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <span className="px-1 text-slate-400 text-xs font-bold">...</span>

              <button
                type="button"
                onClick={() => setCurrentPage(144)}
                className={`min-w-[36px] sm:min-w-[40px] h-8 sm:h-9 px-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer shadow-2xs ${
                  currentPage === 144
                    ? 'bg-[#008F83] text-white shadow-2xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                144
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(144, p + 1))}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs font-bold transition cursor-pointer shadow-2xs"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </main>

        </div>
      </div>
    </div>
  );
}
