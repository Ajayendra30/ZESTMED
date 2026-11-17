// src/pages/WellnessPackagesPage.jsx
// Pixel-accurate recreation of the exact reference design for ZESTMED Wellness Packages
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Calendar, ArrowRight, Info, CheckCircle2, 
  Heart, FlaskConical, Users, Headphones, Check, Sparkles,
  ClipboardList, Stethoscope, IndianRupee, Laptop, FileText,
  User, Activity, Eye, ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import PackageDetailModal from '../components/PackageDetailModal';

// 4 Core Wellness Packages matching reference Section 1
const WELLNESS_PACKAGES = [
  {
    id: 'well-pkg-1',
    name: 'Basic Wellness Package',
    subtitle: 'Essential health checkup for overall wellness',
    category: 'general',
    categoryName: 'General Wellness',
    iconColor: 'bg-blue-50 text-blue-600',
    icon: User,
    tests: [
      'CBC (Complete Blood Count)',
      'Blood Sugar (Fasting)',
      'Lipid Profile',
      'Liver Function Test (LFT)'
    ],
    testsCount: 45,
    mrp: 1999,
    price: 1299,
    discount: '35% OFF',
    discountPercent: 35,
    image: '/wellness-pkg1-heart.png',
    badge: 'Essential Checkup',
    includes: '45+ Tests Included (CBC, Blood Sugar, Lipid, LFT & Urine Routine)',
    reportsIn: 'Same Day (Within 12-24 Hours)',
    fasting: '10-12 hrs Fasting Required'
  },
  {
    id: 'well-pkg-2',
    name: "Women's Wellness Package",
    subtitle: 'Complete health screening for women',
    category: 'women',
    categoryName: "Women's Health",
    iconColor: 'bg-pink-50 text-pink-600',
    icon: User,
    tests: [
      'CBC (Complete Blood Count)',
      'Thyroid Profile (T3, T4, TSH)',
      'Lipid Profile',
      'Vitamin D & B12'
    ],
    testsCount: 58,
    mrp: 3499,
    price: 2499,
    discount: '29% OFF',
    discountPercent: 29,
    image: '/wellness-pkg2-woman.png',
    badge: 'Women Health',
    includes: '58+ Tests Included (CBC, Thyroid Profile, Lipid, Vitamin D3 & B12)',
    reportsIn: 'Same Day (Within 12-24 Hours)',
    fasting: '10-12 hrs Fasting Required'
  },
  {
    id: 'well-pkg-3',
    name: "Men's Wellness Package",
    subtitle: 'Comprehensive health checkup for men',
    category: 'men',
    categoryName: "Men's Health",
    iconColor: 'bg-teal-50 text-[#007A64]',
    icon: User,
    tests: [
      'CBC (Complete Blood Count)',
      'Lipid Profile',
      'Liver Function Test (LFT)',
      'Kidney Function Test (KFT)'
    ],
    testsCount: 55,
    mrp: 3499,
    price: 2499,
    discount: '29% OFF',
    discountPercent: 29,
    image: '/wellness-pkg3-man.png',
    badge: 'Men Health',
    includes: '55+ Tests Included (CBC, Lipid, LFT, KFT & Cardiac Risk Assessment)',
    reportsIn: 'Same Day (Within 12-24 Hours)',
    fasting: '10-12 hrs Fasting Required'
  },
  {
    id: 'well-pkg-4',
    name: 'Senior Citizen Package',
    subtitle: 'Complete health checkup for 60+ years',
    category: 'senior',
    categoryName: 'Senior Wellness',
    iconColor: 'bg-amber-50 text-amber-600',
    icon: Users,
    tests: [
      'CBC (Complete Blood Count)',
      'Diabetes Profile (FBS, HbA1c)',
      'Lipid Profile',
      'Kidney & Liver Function Tests'
    ],
    testsCount: 75,
    mrp: 4499,
    price: 3299,
    discount: '27% OFF',
    discountPercent: 27,
    image: '/wellness-pkg4-senior.png',
    badge: 'Senior Care 60+',
    includes: '75+ Tests Included + Senior Citizen Doorstep Phlebotomy Care',
    reportsIn: 'Same Day (Within 12-24 Hours)',
    fasting: '10-12 hrs Fasting Required'
  }
];

// 6 Health Categories matching reference Section 4
const CATEGORIES_DATA = [
  {
    id: 'cat-general',
    name: 'General Wellness',
    subtitle: 'Basic health check for overall well-being',
    image: '/wellness-cat-general.png',
    filterKey: 'general'
  },
  {
    id: 'cat-women',
    name: "Women's Health",
    subtitle: 'Specially designed for women of all ages',
    image: '/wellness-cat-women.png',
    filterKey: 'women'
  },
  {
    id: 'cat-men',
    name: "Men's Health",
    subtitle: 'Focused health check for men',
    image: '/wellness-cat-men.png',
    filterKey: 'men'
  },
  {
    id: 'cat-senior',
    name: 'Senior Wellness',
    subtitle: 'Comprehensive care for 60+ years',
    image: '/wellness-cat-senior.png',
    filterKey: 'senior'
  },
  {
    id: 'cat-lifestyle',
    name: 'Lifestyle Packages',
    subtitle: 'Checkups for active and healthy living',
    image: '/wellness-cat-lifestyle.png',
    filterKey: 'lifestyle'
  },
  {
    id: 'cat-family',
    name: 'Family Packages',
    subtitle: 'Health checkup packages for your entire family',
    image: '/wellness-cat-family.png',
    filterKey: 'family'
  }
];

export default function WellnessPackagesPage() {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { addToast } = useToast();

  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleBookNow = (pkg) => {
    addItem(pkg, 'package');
    addToast(`${pkg.name} added to your cart!`, 'success');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans select-none pb-12">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION matching exact Reference Image                            */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-[#EBF9F5]">
        
        {/* Hero Background Image - Covers entire section with original aspect ratio */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none select-none"
          style={{ backgroundImage: "url('/wellness-hero-bg.jpg')" }}
        />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-7 sm:pt-9 lg:pt-10 pb-7 sm:pb-9 lg:pb-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4 xl:gap-8">
            
            {/* Left Column: Heading, Subtitle & Action CTAs */}
            <div className="w-full lg:w-[360px] xl:w-[410px] shrink-0 space-y-3 sm:space-y-3.5 text-left">
              
              {/* Wellness Packages Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F5EE] text-[#007A64] border border-[#BCE8DD] text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#007A64]" />
                <span>Wellness Packages</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-black text-[#0B1B2B] leading-[1.14] tracking-tight">
                Preventive Health<br />
                Checkup <span className="text-[#007A64]">Packages</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
                Stay ahead of health problems with our comprehensive wellness packages.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => scrollToSection('wellness-packages-grid')}
                  className="bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-xs hover:shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Book a Package</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('why-choose-section')}
                  className="bg-white hover:bg-slate-50 text-[#007A64] border border-[#007A64] font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-2xs hover:shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Info className="w-4 h-4 shrink-0 text-[#007A64]" />
                  <span>Compare Packages</span>
                </button>
              </div>
            </div>

            {/* Center Column: Combined Hero Visuals (New Provided Image alongside Existing Images) */}
            <div className="flex-1 w-full flex items-center justify-center relative select-none z-10 min-w-0">
              <div className="relative flex items-center justify-center max-w-full">
                
                {/* Provided New Hero Image with Family and Glowing Shield */}
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-teal-200/80 bg-white/40 backdrop-blur-xs group">
                  <img
                    src="/wellness-hero-family.jpg"
                    alt="Preventive Health Checkup Family Care"
                    className="max-h-[220px] sm:max-h-[260px] md:max-h-[280px] lg:max-h-[310px] xl:max-h-[330px] w-auto max-w-full object-cover object-center drop-shadow-sm select-none transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {/* Subtle inner protective ring */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-white/50 pointer-events-none" />
                </div>

                {/* Existing Hero Image - Positioned alongside seamlessly */}
                <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-4 lg:-right-6 z-20 pointer-events-none select-none">
                  <img
                    src="/packages-hero-family.png"
                    alt="Preventive Health Checkup Packages Family Protection"
                    className="max-h-[70px] sm:max-h-[90px] md:max-h-[105px] lg:max-h-[120px] w-auto object-contain drop-shadow-xl"
                  />
                </div>

              </div>
            </div>

            {/* Right Column: 4 Feature Checkmark Cards */}
            <div className="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col gap-2.5 sm:gap-3 z-20 self-center">
              {[
                'Early Disease Detection',
                'Comprehensive Health Screening',
                'Expert Medical Guidance',
                'Value for Money'
              ].map((feat) => (
                <div
                  key={feat}
                  className="bg-white rounded-full px-4 py-2 sm:py-2.5 shadow-md border border-slate-100 flex items-center gap-2.5 text-xs sm:text-[13px] font-extrabold text-[#0B1B2B] hover:border-teal-200 transition"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#007A64] shrink-0 fill-[#E0F5EE]" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. VALUE PROPOSITION STRIP (5 items) matching Reference                   */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-slate-200/80 shadow-2xs py-4 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          
          {/* 1. Preventive Care */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 first:pt-0 sm:first:pl-0 pl-1 sm:pl-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">Preventive Care</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Detect health issues early</p>
            </div>
          </div>

          {/* 2. Complete Health Check */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-1 sm:pl-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">Complete Health Check</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">All essential tests in one package</p>
            </div>
          </div>

          {/* 3. For All Age Groups */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-1 sm:pl-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">For All Age Groups</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Packages for men, women & seniors</p>
            </div>
          </div>

          {/* 4. Expert Consultation */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-1 sm:pl-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">Expert Consultation</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Guidance from qualified doctors</p>
            </div>
          </div>

          {/* 5. Easy & Quick Booking */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 pl-1 sm:pl-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">Easy & Quick Booking</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Book online in just a few clicks</p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Page Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-7 sm:pt-8 space-y-9 sm:space-y-11">

        {/* ========================================================================= */}
        {/* 3. "Our Wellness Packages" (4 Cards Grid) matching Reference             */}
        {/* ========================================================================= */}
        <section id="wellness-packages-grid" className="space-y-4">
          
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#0B1B2B] tracking-tight">
              Our Wellness Packages
            </h2>
            <Link
              to="/packages"
              className="text-[#007A64] hover:text-[#005c4b] font-bold text-xs sm:text-sm flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View All Packages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {WELLNESS_PACKAGES.map((pkg) => {
              const IconComp = pkg.icon;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-4.5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    
                    {/* Top Header: Icon + Package Name & Subtitle */}
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${pkg.iconColor} flex items-center justify-center shrink-0`}>
                        <IconComp className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-[15px] font-black text-[#0B1B2B] leading-tight group-hover:text-[#007A64] transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                          {pkg.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Checklist & Right Illustration Graphic */}
                    <div className="flex items-center justify-between gap-2 pt-1 min-h-[96px]">
                      
                      {/* Left Checklist */}
                      <ul className="space-y-1.5 text-[11px] text-slate-700 font-semibold flex-1">
                        {pkg.tests.map((test, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 fill-emerald-50" />
                            <span className="truncate">{test}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Right Illustration Asset */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 shrink-0 flex items-center justify-center select-none pointer-events-none">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="max-w-full max-h-full object-contain drop-shadow-xs"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Bottom: Pricing & Action Button */}
                  <div className="pt-3.5 mt-3 border-t border-slate-100 space-y-2.5">
                    
                    {/* Pricing Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          ₹{pkg.mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="text-base sm:text-lg font-black text-[#007A64]">
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        {pkg.discount}
                      </span>
                    </div>

                    {/* Book Now Button */}
                    <button
                      type="button"
                      onClick={() => handleBookNow(pkg)}
                      className="w-full bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm py-2 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 4. "Why Choose ZESTMED for Wellness Packages?" matching Reference        */}
        {/* ========================================================================= */}
        <section id="why-choose-section" className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1B2B] tracking-tight text-center sm:text-left">
            Why Choose ZESTMED for Wellness Packages?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            
            {/* 1. Accurate & Reliable */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition p-4 sm:p-5 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                Accurate & Reliable
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                NABL-accredited labs
              </p>
            </div>

            {/* 2. Comprehensive Test Coverage */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition p-4 sm:p-5 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                Comprehensive Test Coverage
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Wide range of essential tests
              </p>
            </div>

            {/* 3. Expert Medical Guidance */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition p-4 sm:p-5 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                Expert Medical Guidance
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Reports reviewed by specialists
              </p>
            </div>

            {/* 4. Safe & Hygienic */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition p-4 sm:p-5 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                Safe & Hygienic
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Highest safety standards
              </p>
            </div>

            {/* 5. Value for Money */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition p-4 sm:p-5 flex flex-col items-center text-center space-y-2 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007A64] flex items-center justify-center font-bold">
                <IndianRupee className="w-5 h-5 text-[#007A64] stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                Value for Money
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Affordable & cost-effective
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. "How It Works?" (4 Step Cards) matching Reference                      */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1B2B] tracking-tight text-center sm:text-left">
            How It Works?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-center">
            
            {/* Step 1: Choose a Package */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex items-start gap-3 relative">
              <div className="w-7 h-7 rounded-full bg-[#007A64] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                1
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Laptop className="w-4 h-4 text-[#007A64] stroke-[2]" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                    Choose a Package
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Select a wellness package that suits you
                </p>
              </div>
              <ChevronRight className="hidden lg:block w-4 h-4 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
            </div>

            {/* Step 2: Book & Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex items-start gap-3 relative">
              <div className="w-7 h-7 rounded-full bg-[#007A64] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                2
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#007A64] stroke-[2]" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                    Book & Schedule
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Pick a date, time, and collection option
                </p>
              </div>
              <ChevronRight className="hidden lg:block w-4 h-4 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
            </div>

            {/* Step 3: Give Your Sample */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex items-start gap-3 relative">
              <div className="w-7 h-7 rounded-full bg-[#007A64] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                3
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical className="w-4 h-4 text-[#007A64] stroke-[2]" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                    Give Your Sample
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Visit our center or opt for home collection
                </p>
              </div>
              <ChevronRight className="hidden lg:block w-4 h-4 text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
            </div>

            {/* Step 4: Get Your Reports */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#007A64] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                4
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-[#007A64] stroke-[2]" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0B1B2B] leading-tight">
                    Get Your Reports
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Receive accurate reports online with expert insights
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. "Health Packages by Category" matching Reference                       */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1B2B] tracking-tight text-center sm:text-left">
            Health Packages by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {CATEGORIES_DATA.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex items-center justify-between gap-3 group relative overflow-hidden"
              >
                {/* Left Content */}
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#0B1B2B] group-hover:text-[#007A64] transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1">
                      {cat.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection('wellness-packages-grid');
                      addToast(`Showing packages for ${cat.name}`, 'info');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007A64] hover:bg-[#006852] text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer active:scale-95"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right Image Asset */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 select-none pointer-events-none flex items-center justify-end">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. BOTTOM CALL TO ACTION BANNER matching Reference                        */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#006853] via-[#007A64] to-[#005B48] p-5 sm:p-7 lg:p-8 text-white relative overflow-hidden shadow-lg border border-teal-600/30">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-60 h-60 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Headline & Subhead */}
            <div className="space-y-1.5 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-white tracking-tight leading-snug">
                Take a Proactive Step Towards Better Health!
              </h2>
              <p className="text-xs sm:text-sm text-teal-100 font-medium">
                Book a wellness package today and keep your health in check.
              </p>
            </div>

            {/* Right Action Button & Illustration */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => scrollToSection('wellness-packages-grid')}
                className="bg-white hover:bg-slate-50 text-[#007A64] font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 text-[#007A64] shrink-0" />
                <span>Book a Wellness Package</span>
                <ArrowRight className="w-4 h-4 text-[#007A64] shrink-0" />
              </button>

              {/* 3D Clipboard & Heart Graphic */}
              <div className="w-16 h-14 sm:w-20 sm:h-16 shrink-0 flex items-center justify-center select-none pointer-events-none">
                <img
                  src="/wellness-cta-clipboard.png"
                  alt="Wellness Health Protection"
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                />
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Interactive Detail Modal */}
      {selectedPackage && (
        <PackageDetailModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onScheduleCollection={() => {
            handleBookNow(selectedPackage);
            setSelectedPackage(null);
            openCart();
          }}
        />
      )}

    </div>
  );
}
