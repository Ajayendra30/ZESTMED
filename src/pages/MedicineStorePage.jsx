import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { enforceAuth } from '../utils/authGuard';
import ProductDetailModal from '../components/ProductDetailModal';
import { 
  Search, ShieldCheck, Truck, RotateCcw, Tag,
  ShoppingCart, SlidersHorizontal
} from 'lucide-react';

const STORE_MEDICINES = [
  {
    id: 'med-crocin',
    name: 'Crocin 500 mg Tablet',
    genericName: 'Paracetamol 500 mg',
    composition: 'Paracetamol 500 mg',
    compositionLong: 'Paracetamol (Acetaminophen) 500 mg',
    dosageType: 'Tablet',
    pack: '(15 Tablets)',
    packSize: 'Strip of 15 Tablets',
    brand: 'GlaxoSmithKline (GSK)',
    manufacturer: 'GlaxoSmithKline (GSK)',
    category: 'fever',
    categories: ['fever', 'pain'],
    categoryLong: 'Pain Relief / Fever Reducer',
    price: 35.00,
    mrp: 42.00,
    discountPercent: 17,
    rating: 4.6,
    reviewsCount: '2,418',
    prescriptionRequired: false,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '50 strips',
    expiry: 'Apr 2028',
    storage: 'Store below 30°C, in a dry place',
    description: 'Crocin 500 mg is a fast and effective pain reliever and fever reducer. It helps to relieve headache, body ache, toothache, and fever.',
    usesText: 'Relieves fever, headache, body ache, and mild to moderate pain.',
    dosageText: '1 tablet (500 mg) every 4–6 hours as needed. (Max 4 tablets in 24 hours)',
    image: '/medicines/crocin-500.png',
    images: [
      '/medicines/crocin-500.png',
      '/medicines/crocin-thumb2.png',
      '/medicines/crocin-thumb3.png'
    ],
    popularityRank: 1
  },
  {
    id: 'med-disprin',
    name: 'Disprin Tablet',
    genericName: 'Pain Relief / Headache',
    composition: 'Aspirin 350 mg',
    compositionLong: 'Acetylsalicylic Acid (Aspirin) 350 mg',
    dosageType: 'Tablet',
    pack: '(10 Tablets)',
    packSize: 'Strip of 10 Tablets',
    brand: 'Reckitt Benckiser',
    manufacturer: 'Reckitt Benckiser',
    category: 'pain',
    categories: ['pain', 'fever'],
    categoryLong: 'Pain Relief / Headache',
    price: 28.00,
    mrp: 32.00,
    discountPercent: 12,
    rating: 4.5,
    reviewsCount: '1,540',
    prescriptionRequired: false,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '35 strips',
    expiry: 'Dec 2027',
    storage: 'Store below 25°C, away from moisture',
    description: 'Disprin is an effervescent tablet used for fast relief from headache, toothache, period pain, and muscular pain.',
    usesText: 'Fast relief from headache, muscular pain, toothache, and inflammation.',
    dosageText: '1 to 2 tablets dissolved in a glass of water every 4–6 hours as needed.',
    image: '/medicines/disprin.png',
    images: ['/medicines/disprin.png'],
    popularityRank: 2
  },
  {
    id: 'med-augovin',
    name: 'Augovin 625 mg Tablet',
    genericName: 'Antibiotic',
    composition: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg',
    compositionLong: 'Amoxicillin Trihydrate IP 500 mg + Diluted Potassium Clavulanate IP 125 mg',
    dosageType: 'Tablet',
    pack: '(10 Tablets)',
    packSize: 'Strip of 10 Tablets',
    brand: 'GlaxoSmithKline (GSK)',
    manufacturer: 'GlaxoSmithKline (GSK)',
    category: 'antibiotics',
    categories: ['antibiotics'],
    categoryLong: 'Antibiotic / Bacterial Infections',
    price: 210.00,
    mrp: 232.00,
    discountPercent: 9,
    rating: 4.7,
    reviewsCount: '1,820',
    prescriptionRequired: true,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '30 strips',
    expiry: 'Aug 2027',
    storage: 'Store below 25°C in a dry place',
    description: 'Augovin 625 mg is a broad-spectrum penicillin antibiotic combined with a beta-lactamase inhibitor to treat severe bacterial infections.',
    usesText: 'Bacterial infections of the respiratory tract, ear, nose, throat, skin, and urinary tract.',
    dosageText: '1 tablet twice daily with food or as advised by your doctor.',
    image: '/medicines/augovin-625.png',
    images: ['/medicines/augovin-625.png'],
    popularityRank: 3
  },
  {
    id: 'med-evion',
    name: 'Evion 400 mg Capsule',
    genericName: 'Vitamin E Supplement',
    composition: 'Tocopheryl Acetate 400 mg',
    compositionLong: 'Tocopheryl Acetate IP (Vitamin E) 400 mg',
    dosageType: 'Capsule',
    pack: '(10 Capsules)',
    packSize: 'Strip of 10 Capsules',
    brand: 'Procter & Gamble / Merck',
    manufacturer: 'Merck Healthcare / P&G',
    category: 'vitamins',
    categories: ['vitamins', 'skin'],
    categoryLong: 'Vitamin E Supplement / Antioxidant',
    price: 110.00,
    mrp: 132.00,
    discountPercent: 17,
    rating: 4.8,
    reviewsCount: '3,120',
    prescriptionRequired: false,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '65 strips',
    expiry: 'May 2028',
    storage: 'Store below 25°C, away from direct sunlight',
    description: 'Evion 400 contains Vitamin E, an essential fat-soluble antioxidant that protects cells from damage, promotes healthy skin, and supports muscular health.',
    usesText: 'Nourishes glowing skin, prevents cellular aging, strengthens hair, and boosts immunity.',
    dosageText: '1 capsule daily after a meal or as directed by a healthcare professional.',
    image: '/medicines/evion-400.png',
    images: ['/medicines/evion-400.png'],
    popularityRank: 4
  },
  {
    id: 'med-becosules',
    name: 'Becosules Capsule',
    genericName: 'Multivitamin Supplement',
    composition: 'B-Complex + Vitamin C',
    compositionLong: 'Vitamin B1, B2, B6, B12, Niacinamide, Calcium Pantothenate, Folic Acid + Vitamin C',
    dosageType: 'Capsule',
    pack: '(20 Capsules)',
    packSize: 'Strip of 20 Capsules',
    brand: 'Pfizer',
    manufacturer: 'Pfizer Limited',
    category: 'vitamins',
    categories: ['vitamins'],
    categoryLong: 'Multivitamin & Mineral Supplement',
    price: 125.00,
    mrp: 149.00,
    discountPercent: 16,
    rating: 4.6,
    reviewsCount: '2,850',
    prescriptionRequired: false,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '80 strips',
    expiry: 'Jul 2028',
    storage: 'Store below 30°C in a dry place',
    description: 'Becosules capsules provide an optimal balance of Vitamin B-complex and Vitamin C to treat vitamin deficiencies, mouth ulcers, and physical fatigue.',
    usesText: 'Treats mouth ulcers, heals tissue damage, boosts cellular metabolism, and improves vitality.',
    dosageText: '1 capsule daily after food or as recommended by physician.',
    image: '/medicines/becosules.png',
    images: ['/medicines/becosules.png'],
    popularityRank: 5
  },
  {
    id: 'med-pantop',
    name: 'Pantop 40 mg Tablet',
    genericName: 'Acidity / GERD',
    composition: 'Pantoprazole Sodium 40 mg',
    compositionLong: 'Pantoprazole Sodium Gastro-resistant IP 40 mg',
    dosageType: 'Tablet',
    pack: '(10 Tablets)',
    packSize: 'Strip of 10 Tablets',
    brand: 'Aristo Pharma',
    manufacturer: 'Aristo Pharmaceuticals',
    category: 'digestive',
    categories: ['digestive'],
    categoryLong: 'Antacid / GERD & Acidity',
    price: 98.00,
    mrp: 112.00,
    discountPercent: 12,
    rating: 4.6,
    reviewsCount: '1,420',
    prescriptionRequired: false,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '55 strips',
    expiry: 'Sep 2028',
    storage: 'Store below 25°C in a cool, dry place',
    description: 'Pantop 40 mg is a proton pump inhibitor that suppresses stomach acid secretion, relieving severe acid reflux, heartburn, and peptic ulcers.',
    usesText: 'Treats gastroesophageal reflux disease (GERD), heartburn, stomach ulcers, and acid indigestion.',
    dosageText: '1 tablet daily in the morning, 30–60 minutes before breakfast.',
    image: '/medicines/pantop-40.png',
    images: ['/medicines/pantop-40.png'],
    popularityRank: 6
  },
  {
    id: 'med-amlong',
    name: 'Amlong 5 mg Tablet',
    genericName: 'Blood Pressure Control',
    composition: 'Amlodipine Besylate 5 mg',
    compositionLong: 'Amlodipine Besylate IP 5 mg',
    dosageType: 'Tablet',
    pack: '(10 Tablets)',
    packSize: 'Strip of 10 Tablets',
    brand: 'Micro Labs',
    manufacturer: 'Micro Labs Limited',
    category: 'heart',
    categories: ['heart'],
    categoryLong: 'Cardiovascular / Blood Pressure',
    price: 72.00,
    mrp: 88.00,
    discountPercent: 18,
    rating: 4.7,
    reviewsCount: '1,640',
    prescriptionRequired: true,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '45 strips',
    expiry: 'Jan 2028',
    storage: 'Store below 25°C, protected from light',
    description: 'Amlong 5 contains Amlodipine, which widens blood vessels to improve blood flow, lower arterial pressure, and prevent coronary chest pain.',
    usesText: 'Manages high blood pressure (hypertension) and prevents stable angina attacks.',
    dosageText: '1 tablet daily at the same time every day, or as advised by your physician.',
    image: '/medicines/amlong-5.png',
    images: ['/medicines/amlong-5.png'],
    popularityRank: 7
  },
  {
    id: 'med-metformin',
    name: 'Metformin 500 mg Tablet',
    genericName: 'Diabetes Care',
    composition: 'Metformin Hydrochloride 500 mg',
    compositionLong: 'Metformin Hydrochloride Prolonged-Release IP 500 mg',
    dosageType: 'Tablet',
    pack: '(10 Tablets)',
    packSize: 'Strip of 10 Tablets',
    brand: 'USV Limited',
    manufacturer: 'USV Private Limited',
    category: 'diabetes',
    categories: ['diabetes'],
    categoryLong: 'Diabetes Care / Blood Sugar Control',
    price: 56.00,
    mrp: 68.00,
    discountPercent: 18,
    rating: 4.5,
    reviewsCount: '2,110',
    prescriptionRequired: true,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '70 strips',
    expiry: 'Oct 2027',
    storage: 'Store below 30°C in a dry place',
    description: 'Metformin 500 mg is the gold standard oral anti-diabetic medication, helping the body respond better to insulin and decreasing liver glucose production.',
    usesText: 'Lowers high blood sugar levels in Type 2 Diabetes Mellitus and prevents diabetic complications.',
    dosageText: '1 tablet twice daily with or immediately after meals.',
    image: '/medicines/metformin-500.png',
    images: ['/medicines/metformin-500.png'],
    popularityRank: 8
  },
  {
    id: 'med-atorva',
    name: 'Atorva 10 mg Tablet',
    genericName: 'Cholesterol Control',
    composition: 'Atorvastatin Calcium 10 mg',
    compositionLong: 'Atorvastatin Calcium IP 10 mg',
    dosageType: 'Tablet',
    pack: '(10 Tablets)',
    packSize: 'Strip of 10 Tablets',
    brand: 'Zydus Cadila',
    manufacturer: 'Zydus Healthcare',
    category: 'heart',
    categories: ['heart'],
    categoryLong: 'Cardiovascular / Lipid Lowering',
    price: 135.00,
    mrp: 158.00,
    discountPercent: 15,
    rating: 4.6,
    reviewsCount: '1,980',
    prescriptionRequired: true,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '40 strips',
    expiry: 'Feb 2028',
    storage: 'Store below 25°C in a dry place',
    description: 'Atorva 10 mg is a lipid-lowering medication (statin) that blocks the enzyme needed to produce cholesterol, protecting against heart attacks and strokes.',
    usesText: 'Lowers LDL ("bad") cholesterol, reduces triglycerides, and elevates HDL ("good") cholesterol.',
    dosageText: '1 tablet once daily, preferably at bedtime.',
    image: '/medicines/atorva-10.png',
    images: ['/medicines/atorva-10.png'],
    popularityRank: 9
  },
  {
    id: 'med-cetirizine',
    name: 'Cetirizine 10 mg Tablet',
    genericName: 'Allergy Relief',
    composition: 'Cetirizine Dihydrochloride 10 mg',
    compositionLong: 'Cetirizine Dihydrochloride IP 10 mg',
    dosageType: 'Tablet',
    pack: '(10 Tablets)',
    packSize: 'Strip of 10 Tablets',
    brand: 'Cipla',
    manufacturer: 'Cipla Ltd',
    category: 'skin',
    categories: ['skin', 'fever', 'pain'],
    categoryLong: 'Antiallergic / Skin & Cold Relief',
    price: 28.00,
    mrp: 32.00,
    discountPercent: 12,
    rating: 4.5,
    reviewsCount: '1,750',
    prescriptionRequired: false,
    inStock: true,
    stockText: 'In Stock',
    stockCount: '85 strips',
    expiry: 'Nov 2027',
    storage: 'Store below 30°C in a dry place',
    description: 'Cetirizine 10 mg provides fast, 24-hour relief from allergies, allergic rhinitis, watery eyes, sneezing, and itchy skin rashes or hives.',
    usesText: 'Relieves allergy symptoms, allergic rhinitis, hay fever, hives, and pruritus.',
    dosageText: '1 tablet once daily at bedtime.',
    image: '/medicines/cetirizine-10.png',
    images: ['/medicines/cetirizine-10.png'],
    popularityRank: 10
  }
];

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
          2. MEDICINES CATALOG SECTION (MATCHING EXACT REFERENCE IMAGE 1)
          ========================================================================= */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8">
        
        {/* Top Header Row: Left Title/Subtitle & Right Search Bar + Filter Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Title & Subtitle on Left */}
          <div>
            <h2 className="text-2xl sm:text-[26px] font-bold text-[#0B1E3F] tracking-tight">
              Medicines
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Order genuine medicines online with fast and reliable delivery.
            </p>
          </div>

          {/* Search & Filter on Right */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines (e.g., Crocin, Disprin, Augovin...)"
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#007A64] shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Left Filter Sidebar + Right 10-Card Catalog Grid */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
          
          {/* ================== LEFT FILTER SIDEBAR ================== */}
          <aside
            className={`w-full lg:w-56 xl:w-60 shrink-0 ${
              showMobileFilter ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-5">
              
              {/* 1. Categories */}
              <div>
                <h3 className="text-sm font-bold text-[#0B1E3F] mb-3 tracking-tight">
                  Categories
                </h3>
                <div className="space-y-2">
                  {SIDEBAR_CATEGORIES.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900 select-none text-xs sm:text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#007A64] focus:ring-[#007A64] cursor-pointer"
                        />
                        <span className={isChecked ? 'text-[#007A64] font-semibold' : 'font-normal'}>
                          {cat.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Price Range */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-[#0B1E3F] mb-2.5 tracking-tight">
                  Price Range
                </h3>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="10"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#007A64] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="text-xs text-slate-600 font-medium mt-1.5">
                  ₹0 – ₹{priceMax >= 2000 ? '2,000' : priceMax.toLocaleString()}
                </div>
              </div>

              {/* 3. Availability */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-[#0B1E3F] mb-2.5 tracking-tight">
                  Availability
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900 select-none text-xs sm:text-sm">
                    <input
                      type="checkbox"
                      checked={stockFilter === 'in_stock' || stockFilter === 'all'}
                      onChange={() => setStockFilter(stockFilter === 'in_stock' ? 'all' : 'in_stock')}
                      className="w-4 h-4 rounded border-slate-300 text-[#007A64] focus:ring-[#007A64] cursor-pointer"
                    />
                    <span className="font-normal text-slate-800">In Stock (328)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900 select-none text-xs sm:text-sm">
                    <input
                      type="checkbox"
                      checked={stockFilter === 'out_of_stock'}
                      onChange={() => setStockFilter(stockFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
                      className="w-4 h-4 rounded border-slate-300 text-[#007A64] focus:ring-[#007A64] cursor-pointer"
                    />
                    <span className="font-normal text-slate-800">Out of Stock (12)</span>
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
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Reset Filters
                </button>
              )}

            </div>
          </aside>

          {/* ================== RIGHT 10-CARD GRID ================== */}
          <main className="flex-1 min-w-0">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-3.5">
                {filteredProducts.map((item) => (
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
                        <div className="flex items-baseline gap-1.5 pt-1.5">
                          <span className="text-sm sm:text-base font-bold text-[#0B1E3F]">
                            ₹{item.price.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{item.mrp.toFixed(2)}
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
