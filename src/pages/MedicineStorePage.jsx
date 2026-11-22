import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { enforceAuth } from '../utils/authGuard';
import ProductDetailModal from '../components/ProductDetailModal';
import { ALL_MEDICINES_DATA } from '../mock-data/allMedicinesData';
import { 
  Search, ShieldCheck, Truck, RotateCcw, Tag,
  ShoppingCart, SlidersHorizontal, ArrowLeft, ArrowRight, Check
} from 'lucide-react';

const STORE_MEDICINES = ALL_MEDICINES_DATA;

const SIDEBAR_CATEGORIES = [
  { id: 'pain', name: 'Pain Relief' },
  { id: 'fever', name: 'Fever' },
  { id: 'antibiotics', name: 'Antibiotics' },
  { id: 'diabetes', name: 'Diabetes' },
  { id: 'heart', name: 'Heart Care' },
  { id: 'digestive', name: 'Digestive Care' },
  { id: 'skin', name: 'Skin Care' },
  { id: 'vitamins', name: 'Vitamins & Supplements' }
];

export default function MedicineStorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuth } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMax, setPriceMax] = useState(2000);
  const [stockFilter, setStockFilter] = useState('in_stock');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleAddToCart = (product) => {
    const itemData = {
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      type: 'medicine',
      quantity: 1,
      image: product.image,
      pack: product.pack || product.packSize
    };

    if (!user) {
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to add medicines to your cart',
        pendingAction: { type: 'add_to_cart', item: itemData, itemType: 'medicine' },
        addToast
      });
      return;
    }

    addItem(itemData, 'medicine');
  };

  // Filter products based on search, categories, price range, and availability
  const filteredProducts = useMemo(() => {
    return STORE_MEDICINES.filter((item) => {
      // Search input filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q) || item.genericName.toLowerCase().includes(q);
        const matchesBrand = item.brand && item.brand.toLowerCase().includes(q);
        const matchesDesc = item.description && item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesDesc) return false;
      }

      // Categories filter
      if (selectedCategories.length > 0) {
        const matchesCategory = selectedCategories.some((cat) =>
          item.categories ? item.categories.includes(cat) : item.category === cat
        );
        if (!matchesCategory) return false;
      }

      // Price filter
      if (item.price > priceMax) return false;

      // Stock filter
      if (stockFilter === 'in_stock' && !item.inStock) return false;
      if (stockFilter === 'out_of_stock' && item.inStock) return false;

      return true;
    }).sort((a, b) => a.popularityRank - b.popularityRank);
  }, [searchQuery, selectedCategories, priceMax, stockFilter]);

  // Overall stock count for the sidebar
  const stockCounts = useMemo(() => {
    const inStock = STORE_MEDICINES.filter((m) => m.inStock).length;
    const outOfStock = STORE_MEDICINES.filter((m) => !m.inStock).length;
    return { inStock, outOfStock };
  }, []);

  // Pagination states & calculations
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, priceMax, stockFilter]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

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
    const catalogElem = document.getElementById('medicines-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 450, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-16">
      
      {/* =========================================================================
          1. HERO BANNER WITH HOMEPAGE HERO STYLING & MEDICINES VISUAL - FULL WIDTH
          ========================================================================= */}
      <section className="relative w-full min-w-full overflow-hidden bg-gradient-to-r from-[#F0F9FB] via-[#E8F6F8] to-[#DEF3F6] border-b border-teal-100/60 select-none">
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

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-7 md:pt-8 lg:pt-9 pb-7 md:pb-8 lg:pb-9 relative z-10 min-h-[320px] sm:min-h-[360px] lg:min-h-[390px] xl:min-h-[420px] 2xl:min-h-[450px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full">
            
            {/* Left Content */}
            <div className="lg:col-span-6 xl:col-span-6 z-10 space-y-3.5 sm:space-y-4 max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-slate-900 tracking-tight leading-tight">
                Medicines <span className="text-[#008F83]">Store</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
                Order genuine medicines online with fast & safe delivery at your doorstep.
              </p>

              {/* 4 Trust Badges in a 2x2 Grid */}
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

            {/* Right Column Visual */}
            <div className="w-full flex lg:flex lg:col-span-6 xl:col-span-6 relative items-end justify-center lg:justify-end self-end mt-4 lg:mt-0 -mb-4 sm:-mb-6 lg:-mb-9">
              <img
                src="/medicines-hero.png"
                alt="Pharmacy Medicines and First Aid Kit"
                className="h-auto max-h-[240px] sm:max-h-[290px] md:max-h-[330px] lg:max-h-[360px] xl:max-h-[400px] 2xl:max-h-[440px] w-auto max-w-full object-contain object-bottom drop-shadow-md select-none pointer-events-none"
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MEDICINES CATALOG SECTION (MATCHING LAB TESTS FULL-WIDTH SEARCH BAR)
          ========================================================================= */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6">
        
        {/* Full-width Search Bar with left Search Icon & right Filter Button (just like Lab Tests page) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2 sm:p-2.5 flex items-center gap-3 mb-6">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicines (e.g., Crocin, Disprin, Augovin...)"
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

        {/* 2-Column Layout: Left Filter Sidebar + Right 10-Card Catalog Grid */}
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
                        onClick={() => toggleCategory(cat.id)}
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
                    max="2000"
                    step="10"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-[#007A64] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                  ₹0 – ₹{priceMax >= 2000 ? '2,000' : priceMax.toLocaleString()}
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* 3. Availability */}
              <div>
                <h3 className="text-base font-bold text-[#0B1E3F] mb-3.5 tracking-tight">
                  Availability
                </h3>
                <div className="space-y-2.5">
                  <label
                    onClick={() => setStockFilter(stockFilter === 'in_stock' ? 'all' : 'in_stock')}
                    className="flex items-center justify-between text-xs sm:text-sm cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4.5 h-4.5 rounded-[4px] flex items-center justify-center transition-colors ${
                          stockFilter === 'in_stock' || stockFilter === 'all'
                            ? 'bg-[#007A64] text-white'
                            : 'border border-slate-300 bg-white group-hover:border-slate-400'
                        }`}
                      >
                        {(stockFilter === 'in_stock' || stockFilter === 'all') && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </div>
                      <span
                        className={`text-slate-700 group-hover:text-slate-900 ${
                          stockFilter === 'in_stock' || stockFilter === 'all' ? 'font-bold text-[#007A64]' : 'font-medium'
                        }`}
                      >
                        In Stock
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs font-medium">
                      ({stockCounts.inStock.toLocaleString()})
                    </span>
                  </label>

                  <label
                    onClick={() => setStockFilter(stockFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
                    className="flex items-center justify-between text-xs sm:text-sm cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4.5 h-4.5 rounded-[4px] flex items-center justify-center transition-colors ${
                          stockFilter === 'out_of_stock'
                            ? 'bg-[#007A64] text-white'
                            : 'border border-slate-300 bg-white group-hover:border-slate-400'
                        }`}
                      >
                        {stockFilter === 'out_of_stock' && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </div>
                      <span
                        className={`text-slate-700 group-hover:text-slate-900 ${
                          stockFilter === 'out_of_stock' ? 'font-bold text-[#007A64]' : 'font-medium'
                        }`}
                      >
                        Out of Stock
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs font-medium">
                      ({stockCounts.outOfStock.toLocaleString()})
                    </span>
                  </label>
                </div>
              </div>

              {/* Reset Filters */}
              {(selectedCategories.length > 0 || priceMax < 2000 || searchQuery || stockFilter !== 'in_stock') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceMax(2000);
                    setSearchQuery('');
                    setStockFilter('in_stock');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Reset Filters
                </button>
              )}

            </div>
          </aside>

          {/* ================== RIGHT 10-CARD GRID ================== */}
          <main className="flex-1 min-w-0" id="medicines-catalog">
            
            {/* Header: Showing X – Y of 1,440 medicines */}
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-600">
                Showing {totalItems === 0 ? 0 : startIndex + 1} – {endIndex} of {totalItems.toLocaleString()} medicines
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-600 font-bold mb-3 text-sm sm:text-base">No medicines match your filter criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceMax(2000);
                    setSearchQuery('');
                    setStockFilter('in_stock');
                  }}
                  className="px-4 py-2 bg-[#007A64] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-3.5">
                  {displayedProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProduct(item)}
                      className="bg-white rounded-xl border border-slate-200/80 p-2.5 sm:p-3 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        {/* Image Container with Light Grey Background */}
                        <div className="w-full h-28 sm:h-32 bg-[#F1F3F5] rounded-lg flex items-center justify-center p-2 mb-2.5 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-bold text-[#0B1E3F] leading-snug line-clamp-1 group-hover:text-[#007A64] transition">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-snug line-clamp-1">
                            {item.genericName}
                          </p>

                          {/* Pricing */}
                          <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-[#0B1E3F]">
                              ₹{item.price.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{item.mrp.toFixed(2)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#E8F8EE] text-[#16A34A] text-[10px] font-bold shrink-0 ml-auto sm:ml-0">
                              20% OFF
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Outline Green Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        className="w-full mt-2.5 py-1.5 px-2 rounded-lg border border-[#007A64] text-[#007A64] hover:bg-[#007A64] hover:text-white transition font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* ================== PAGINATION ROW (MATCHING USER REFERENCE IMAGE) ================== */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 pb-4 select-none">
                    {/* Previous Page Button */}
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 flex items-center justify-center transition shadow-2xs ${
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
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 flex items-center justify-center transition shadow-2xs ${
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

      {/* Product Detail Pop-up Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
