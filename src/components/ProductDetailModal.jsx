import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enforceAuth } from '../utils/authGuard';
import { 
  X, Star, ShieldCheck, Truck, RotateCcw, Lock, 
  Target, Pill, Package, FlaskConical, Calendar, 
  Thermometer, Building2, Tag, ShoppingCart, ShoppingBag,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuth } = useAuth();
  const { addToast } = useToast();
  const { addItem } = useCart();

  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  // Prepare images array matching reference Crocin image and thumbnails
  const defaultImages = [
    product.image || '/medicines/crocin-main.png',
    '/medicines/crocin-thumb2.png',
    '/medicines/crocin-thumb3.png'
  ];
  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : (product.name && product.name.toLowerCase().includes('crocin') ? defaultImages : [product.image || '/medicines/crocin-main.png']);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const priceNum = typeof product.price === 'number' ? product.price : parseFloat(product.price || 35);
  const mrpNum = typeof product.mrp === 'number' ? product.mrp : parseFloat(product.mrp || (priceNum * 1.25));
  const discountVal = 20;

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    const itemData = {
      id: product.id,
      name: product.name,
      price: priceNum,
      mrp: mrpNum,
      type: 'medicine',
      quantity: 1,
      image: product.image,
      pack: product.pack || product.packSize
    };

    if (!user) {
      if (onClose) onClose();
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
    for (let i = 0; i < qty; i++) {
      addItem(itemData, 'medicine');
    }
  };

  const handleBuyNow = (e) => {
    e?.stopPropagation();
    const itemData = {
      id: product.id,
      name: product.name,
      price: priceNum,
      mrp: mrpNum,
      type: 'medicine',
      quantity: 1,
      image: product.image,
      pack: product.pack || product.packSize
    };

    if (!user) {
      if (onClose) onClose();
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to proceed to checkout',
        pendingAction: { type: 'buy_now', item: itemData, itemType: 'medicine' },
        addToast
      });
      return;
    }
    for (let i = 0; i < qty; i++) {
      addItem(itemData, 'medicine');
    }
    if (onClose) onClose();
    navigate('/cart');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl p-5 sm:p-7 relative overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer z-30"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 2-Column Responsive Layout */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-7 items-start">
          
          {/* ===================================================================
              LEFT COLUMN: IMAGE SHOWCASE & THUMBNAILS CAROUSEL
              =================================================================== */}
          <div className="w-full md:w-[42%] lg:w-[40%] flex flex-col justify-between shrink-0 space-y-3">
            
            {/* Main Showcase Box */}
            <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 relative border border-slate-100 flex flex-col items-center justify-center min-h-[290px] sm:min-h-[320px]">
              
              {/* Prescription Status Pill Badge (Only shown if prescription is strictly required) */}
              {product.prescriptionRequired && (
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-black tracking-wide">
                    Prescription Required
                  </span>
                </div>
              )}

              {/* Prev Carousel Arrow Button */}
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer z-10 transition hover:scale-105 active:scale-95"
                  title="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Next Carousel Arrow Button */}
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer z-10 transition hover:scale-105 active:scale-95"
                  title="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Main Image */}
              <div className="w-full h-48 sm:h-56 flex items-center justify-center p-2">
                <img
                  src={imagesList[selectedImageIndex] || product.image || '/medicines/crocin-main.png'}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain drop-shadow-xs select-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Thumbnails Row */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3">
                {imagesList.slice(0, 3).map((thumb, idx) => {
                  const isActive = selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 flex items-center justify-center p-1.5 bg-white cursor-pointer transition ${
                        isActive 
                          ? 'border-[#007A64] ring-2 ring-[#007A64]/20' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={thumb}
                        alt={`Thumbnail ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {/* ===================================================================
              RIGHT COLUMN: PRODUCT DETAILS & PURCHASE CONTROLS
              =================================================================== */}
          <div className="w-full md:w-[58%] lg:w-[60%] space-y-3.5">
            
            {/* Title & Form Badge */}
            <div>
              <h2 className="text-2xl sm:text-[26px] font-black text-[#0B1E3F] tracking-tight leading-tight pr-8">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs sm:text-sm font-bold text-slate-600">
                  {product.genericName || product.composition || 'Paracetamol 500 mg'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EBF4FE] text-[#1D4ED8] text-xs font-bold">
                  {product.dosageType || product.formType || 'Tablet'}
                </span>
              </div>
            </div>

            {/* Star Rating & Reviews */}
            <div className="flex items-center gap-1.5 text-xs font-bold pt-0.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-slate-900">{product.rating || '4.6'}</span>
              <span className="text-slate-500 font-medium">
                ({typeof product.reviewsCount === 'number' ? product.reviewsCount.toLocaleString() : (product.reviewsCount || '2,418')} reviews)
              </span>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
              {product.description || 'Crocin 500 mg is a fast and effective pain reliever and fever reducer. It helps to relieve headache, body ache, toothache, and fever.'}
            </p>

            {/* Pricing Row */}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-[#0B1E3F]">
                ₹{priceNum.toFixed(2)}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold">
                ₹{mrpNum.toFixed(2)}
              </span>
              <span className="text-xs font-black text-[#007A64] bg-[#DCF6EF] px-2.5 py-0.5 rounded-md border border-[#BCE8DD]">
                {discountVal}% OFF
              </span>
            </div>

            {/* Trust Badges Strip (4 Pillars) */}
            <div className="bg-[#F8FCFF] border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#007A64] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Genuine<br />Medicine</span>
              </div>
              <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
                <Truck className="w-5 h-5 text-[#007A64] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Fast<br />Delivery</span>
              </div>
              <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
                <RotateCcw className="w-5 h-5 text-[#007A64] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Easy<br />Returns</span>
              </div>
              <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
                <Lock className="w-5 h-5 text-[#007A64] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold leading-tight">Secure<br />Payment</span>
              </div>
            </div>

            {/* 3 Mini Info Cards: Uses, Dosage, Available */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              
              {/* Uses */}
              <div className="bg-[#F8FCFF] rounded-2xl p-3 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Target className="w-4 h-4 text-[#007A64]" />
                  <span>Uses</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-snug">
                  {product.usesText || (Array.isArray(product.uses) ? product.uses.join(', ') : 'Relieves fever, headache, body ache, and mild to moderate pain.')}
                </p>
              </div>

              {/* Dosage */}
              <div className="bg-[#F8FCFF] rounded-2xl p-3 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Pill className="w-4 h-4 text-[#007A64]" />
                  <span>Dosage</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-snug">
                  {product.dosageText || product.dosage || '1 tablet (500 mg) every 4–6 hours as needed. (Max 4 tablets in 24 hours)'}
                </p>
              </div>

              {/* Available */}
              <div className="bg-[#F8FCFF] rounded-2xl p-3 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Package className="w-4 h-4 text-[#007A64]" />
                  <span>Available</span>
                </div>
                <p className="text-xs font-black text-emerald-700 leading-snug">
                  {product.inStock !== false ? (product.stockText || 'In Stock') : 'Out of Stock'}
                </p>
                <p className="text-[10.5px] text-slate-500 font-medium leading-snug">
                  ({product.stockCount || '50 strips'})
                </p>
              </div>

            </div>

            {/* Specifications 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2 text-xs text-slate-700 border-t border-slate-100">
              
              {/* Composition */}
              <div className="flex items-start gap-2">
                <FlaskConical className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Composition: </span>
                  <span className="text-slate-600 font-medium">
                    {product.compositionLong || product.composition || product.genericName || 'Paracetamol (Acetaminophen) 500 mg'}
                  </span>
                </div>
              </div>

              {/* Expiry */}
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Expiry: </span>
                  <span className="text-slate-600 font-medium">{product.expiry || 'Apr 2028'}</span>
                </div>
              </div>

              {/* Pack Size */}
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Pack Size: </span>
                  <span className="text-slate-600 font-medium">{product.packSize || product.pack || product.form || 'Strip of 15 Tablets'}</span>
                </div>
              </div>

              {/* Storage */}
              <div className="flex items-start gap-2">
                <Thermometer className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Storage: </span>
                  <span className="text-slate-600 font-medium">{product.storage || 'Store below 30°C, in a dry place'}</span>
                </div>
              </div>

              {/* Manufacturer */}
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Manufacturer: </span>
                  <span className="text-slate-600 font-medium">{product.manufacturer || product.brand || 'GlaxoSmithKline (GSK)'}</span>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Category: </span>
                  <span className="text-slate-600 font-medium">{product.categoryLong || product.categoryName || 'Pain Relief / Fever Reducer'}</span>
                </div>
              </div>

            </div>

            {/* Bottom Action Bar: Qty Counter, Add to Cart & Buy Now */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 flex-wrap sm:flex-nowrap">
              
              {/* Qty Counter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Qty:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white px-2 py-1.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 font-bold transition cursor-pointer"
                  >
                    −
                  </button>
                  <span className="w-7 text-center font-bold text-xs sm:text-sm text-slate-900">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(q => q + 1)}
                    className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-5 bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-3 px-5 bg-white hover:bg-slate-50 text-[#0B1E3F] border border-slate-300 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-[#007A64]" />
                <span>Buy Now</span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
