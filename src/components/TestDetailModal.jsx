import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enforceAuth } from '../utils/authGuard';
import { 
  X, ChevronLeft, ChevronRight, Star, Home, Clock, Award, 
  ShieldCheck, Droplets, ClipboardList, UserCheck, FlaskConical, 
  Calendar, MapPin, ShoppingCart, Zap, Check, Minus, Plus 
} from 'lucide-react';

export default function TestDetailModal({ test, onClose, onBookNow }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuth } = useAuth();
  const { addToast } = useToast();
  const { addItem } = useCart();

  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!test) return null;

  // Setup gallery images tailored for the test
  const defaultImages = [
    test.id === 'test-cbc' || (test.name && test.name.includes('CBC')) 
      ? '/lab-tests/cbc-modal-main.png' 
      : (test.image || '/lab-tests/cbc.png'),
    '/lab-tests/cbc-modal-thumb2.png',
    '/lab-tests/cbc-modal-thumb3.png'
  ];

  const thumbnailsList = [
    test.id === 'test-cbc' || (test.name && test.name.includes('CBC'))
      ? '/lab-tests/cbc-modal-thumb1.png'
      : (test.image || '/lab-tests/cbc.png'),
    '/lab-tests/cbc-modal-thumb2.png',
    '/lab-tests/cbc-modal-thumb3.png'
  ];

  const imagesList = test.images && test.images.length > 0 ? test.images : defaultImages;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const priceNum = typeof test.price === 'number' ? test.price : parseFloat(test.price || 399);
  const mrpNum = typeof test.mrp === 'number' ? test.mrp : parseFloat(test.mrp || (priceNum * 1.25));
  const discountVal = 20;

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    const itemData = {
      id: test.id,
      name: test.name,
      price: priceNum,
      mrp: mrpNum,
      type: 'diagnostic',
      category: 'Lab Test',
      quantity: 1,
      image: test.image || imagesList[0],
      description: test.description
    };

    if (!user) {
      if (onClose) onClose();
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to book a lab test',
        pendingAction: { type: 'add_to_cart', item: itemData, itemType: 'diagnostic' },
        addToast
      });
      return;
    }

    for (let i = 0; i < qty; i++) {
      addItem(itemData, 'diagnostic');
    }
    if (onClose) onClose();
  };

  const handleBookNowClick = (e) => {
    e?.stopPropagation();
    if (!user) {
      if (onClose) onClose();
      enforceAuth({
        user,
        navigate,
        location,
        openAuth,
        toastMessage: 'Please login to book a lab test',
        pendingAction: { type: 'book_test', test },
        addToast
      });
      return;
    }

    if (onBookNow) {
      onBookNow(test);
    } else if (onClose) {
      onClose();
    }
  };

  // Test parameters & medical details fallback based on test data
  const parameters = test.parameters || [
    'Hemoglobin (Hb)',
    'Total WBC Count',
    'RBC Count',
    'Platelet Count',
    'Hematocrit (PCV)',
    '& 15+ other parameters'
  ];

  const purpose = test.purpose || [
    'Detects anemia and infections',
    'Checks overall blood health',
    'Helps in early diagnosis of many conditions',
    'Monitors treatment progress'
  ];

  const preparation = test.preparation || [
    'No fasting required',
    'Maintain normal diet and hydration'
  ];

  const sampleType = test.sampleType || 'Blood (2–3 ml)';
  const reportTime = test.reportTime || '6–12 Hours';
  const available = test.available || 'Mon – Sun';
  const sampleCollection = test.sampleCollection || 'Home / Lab Visit';
  const ratingVal = test.rating || 4.8;
  const reviewsCountVal = test.reviewsCount || '2,354';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-5 sm:p-6 md:p-7 max-w-4xl w-full mx-auto shadow-2xl relative my-auto animate-scale-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer z-20 shadow-2xs"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: MAIN IMAGE SHOWCASE + THUMBNAILS CAROUSEL
              ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Main Image Container */}
            <div className="relative w-full h-[260px] sm:h-[300px] md:h-[320px] rounded-2xl overflow-hidden bg-[#F0F7FF] border border-slate-100 flex items-center justify-center group select-none">
              <img
                src={imagesList[selectedImageIndex] || imagesList[0]}
                alt={test.name}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Prev Image Button */}
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 hover:scale-105 transition cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              {/* Next Image Button */}
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 hover:scale-105 transition cursor-pointer z-10"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Thumbnails Row */}
            <div className="flex items-center gap-2.5 sm:gap-3 mt-3">
              {thumbnailsList.map((thumbSrc, idx) => {
                const isActive = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`rounded-xl overflow-hidden w-20 h-20 sm:w-22 sm:h-22 p-0.5 cursor-pointer bg-slate-50 transition shrink-0 ${
                      isActive 
                        ? 'border-2 border-[#007A64] ring-2 ring-[#007A64]/20 shadow-xs' 
                        : 'border border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumbSrc}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                );
              })}
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: TEST DETAILS, PARAMETERS, SPECS & ACTIONS
              ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
            
            {/* Header: Title, Category Badge & Rating */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0B1E3F] tracking-tight leading-snug pr-8">
                {test.name}
              </h2>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-block bg-[#E0F2FE] text-[#0369A1] font-semibold text-xs px-2.5 py-0.5 rounded-full">
                  Lab Test
                </span>
                
                <div className="flex items-center text-xs sm:text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline mr-1" />
                  <span className="font-bold text-slate-900">{ratingVal}</span>
                  <span className="text-slate-500 font-medium ml-1">({reviewsCountVal} reviews)</span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mt-2">
                {test.description || `A ${test.name} provides vital information about your overall health with reliable laboratory diagnostics.`}
              </p>

              {/* Price Row */}
              <div className="flex items-baseline gap-2 mt-2.5">
                <span className="text-2xl font-black text-[#0B1E3F]">
                  ₹{priceNum.toFixed(2)}
                </span>
                {mrpNum > priceNum && (
                  <span className="text-sm text-slate-400 line-through font-normal">
                    ₹{mrpNum.toFixed(2)}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-[#E8F8EE] text-[#16A34A] text-xs font-bold">
                  {discountVal}% OFF
                </span>
              </div>
            </div>

            {/* 4 Trust Badges in a Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-[#F8FAFC]">
                <Home className="w-4 h-4 text-[#007A64] shrink-0" />
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                  <div>Home</div>
                  <div>Sample Collection</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-[#F8FAFC]">
                <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                  <div>Reports in</div>
                  <div>{reportTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-[#F8FAFC]">
                <Award className="w-4 h-4 text-[#007A64] shrink-0" />
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                  <div>NABL</div>
                  <div>Accredited Lab</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-[#F8FAFC]">
                <ShieldCheck className="w-4 h-4 text-[#007A64] shrink-0" />
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">
                  <div>100%</div>
                  <div>Secure & Accurate</div>
                </div>
              </div>
            </div>

            {/* Two Side-by-Side Medical Information Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              {/* Box 1: Test Includes (Parameters) */}
              <div className="bg-[#F4F9FD] border border-[#E1EEF8] rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-sky-100/70">
                    <Droplets className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#0B1E3F]">
                      Test Includes (Parameters)
                    </h4>
                  </div>
                  <ul className="space-y-1.5">
                    {parameters.slice(0, 6).map((param, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-slate-700 font-medium leading-tight">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[2.5] shrink-0 mt-0.5" />
                        <span>{param}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Box 2: Purpose / Uses & Patient Preparation */}
              <div className="bg-[#F4F9FD] border border-[#E1EEF8] rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between space-y-2.5">
                {/* Purpose / Uses */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-sky-100/70">
                    <ClipboardList className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#0B1E3F]">
                      Purpose / Uses
                    </h4>
                  </div>
                  <ul className="space-y-1">
                    {purpose.slice(0, 4).map((item, uIdx) => (
                      <li key={uIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium leading-tight">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[2.5] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Patient Preparation */}
                <div className="pt-1 border-t border-sky-100/70">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <UserCheck className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#0B1E3F]">
                      Patient Preparation
                    </h4>
                  </div>
                  <ul className="space-y-1">
                    {preparation.slice(0, 2).map((item, prepIdx) => (
                      <li key={prepIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium leading-tight">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[2.5] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Bottom 4 Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 border-t border-b border-slate-100 text-left">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Sample Type:</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{sampleType}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Report Time:</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{reportTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Available:</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{available}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">Sample Collection:</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{sampleCollection}</div>
                </div>
              </div>
            </div>

            {/* Bottom Action Row: Qty Selector, Add to Cart & Book Now */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              
              {/* Quantity Counter */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-bold text-slate-700">Qty:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white px-1.5 py-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900 select-none">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((prev) => prev + 1)}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Book Now */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 bg-[#007A64] hover:bg-[#006855] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookNowClick}
                  className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 border border-slate-300 text-[#0B1E3F] hover:bg-slate-50 hover:border-slate-400 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs active:scale-98"
                >
                  <Calendar className="w-4 h-4 text-[#007A64]" />
                  <span>Book Now</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
