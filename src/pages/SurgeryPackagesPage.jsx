// src/pages/SurgeryPackagesPage.jsx
// Pixel-accurate recreation of the exact reference design for ZESTMED Surgery Packages
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Calendar, ArrowRight, Award, Building2, 
  CircleDollarSign, Headphones, Stethoscope, ClipboardList, 
  Activity, HeartPulse, ChevronRight, Eye, PhoneCall, CheckCircle2,
  BedDouble, FileText, ArrowUpRight
} from 'lucide-react';
import BookSurgeryModal from '../components/BookSurgeryModal';
import { MOCK_SURGERY_PACKAGES } from '../mock-data/surgeryPackagesData';

// Custom SVG Icons for medical specialties matching reference
function ScalpelIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 5-3-3L3.5 14.5a2.12 2.12 0 0 0 0 3L6.5 20.5a2.12 2.12 0 0 0 3 0L19 11l-3-3" />
      <path d="m14 8 2 2" />
    </svg>
  );
}

function LaparoscopyIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="20" x2="20" y2="4" />
      <circle cx="5" cy="19" r="2" />
      <path d="M15 4h5v5" />
      <path d="m14 10 3-3" />
      <path d="m10 14 3-3" />
    </svg>
  );
}

function BoneIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 10c.7-.7 1.6-1 2.5-1a3.5 3.5 0 1 0-3.5 3.5c0-.9.3-1.8 1-2.5l-7 7c-.7.7-1 1.6-1 2.5a3.5 3.5 0 1 0 3.5-3.5c-.9 0-1.8-.3-2.5-1l7-7Z" />
    </svg>
  );
}

function KidneyIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4C9 4 6 6 6 10c0 4.5 2 6.5 3.5 8 1.2 1.2 2.5 2 2.5 2s1.3-.8 2.5-2C16 16.5 18 14.5 18 10c0-4-3-6-6-6Z" />
      <path d="M12 9c-1 0-2 .8-2 2s1 2.5 2 3" />
    </svg>
  );
}

function StomachIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4c2-1 4-1 6 0 3 1.5 5 4.5 5 8 0 5-3 8-6 8-4 0-7-3-7-7 0-3 1.5-6 4-7.5" />
      <path d="M9 13c1 1.5 2.5 2 4 2" />
    </svg>
  );
}

function EarIcon({ className = "w-6 h-6 text-[#007A64]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a2.5 2.5 0 0 1-5 0" />
      <path d="M10 8.5a2.5 2.5 0 0 1 5 0c0 3-3 3-3 5" />
    </svg>
  );
}

// 6 Core Surgery Packages matching Section 3 in the reference design
const SURGERY_PACKAGES = [
  {
    id: 'surg-gallbladder',
    title: 'Gallbladder Stone Surgery',
    subtitle: '(Laparoscopic)',
    image: '/surgery-pkg1-gallbladder.png',
    startingPrice: 45000,
    priceFormatted: '₹45,000',
    category: 'Laparoscopic & General',
    mockRefId: 'surg-gallbladder'
  },
  {
    id: 'surg-appendix',
    title: 'Appendectomy',
    subtitle: '(Appendix Surgery)',
    image: '/surgery-pkg2-appendix.png',
    startingPrice: 35000,
    priceFormatted: '₹35,000',
    category: 'Laparoscopic & General',
    mockRefId: 'surg-gallbladder'
  },
  {
    id: 'surg-hernia',
    title: 'Hernia Repair',
    subtitle: '(Inguinal / Umbilical)',
    image: '/surgery-pkg3-hernia.png',
    startingPrice: 40000,
    priceFormatted: '₹40,000',
    category: 'Laparoscopic & General',
    mockRefId: 'surg-hernia'
  },
  {
    id: 'surg-knee',
    title: 'Knee Replacement',
    subtitle: '(Total / Partial)',
    image: '/surgery-pkg4-knee.png',
    startingPrice: 250000,
    priceFormatted: '₹2,50,000',
    category: 'Orthopedic & Joint',
    mockRefId: 'surg-knee-replacement'
  },
  {
    id: 'surg-hip',
    title: 'Hip Replacement',
    subtitle: '(Total Hip Surgery)',
    image: '/surgery-pkg5-hip.png',
    startingPrice: 280000,
    priceFormatted: '₹2,80,000',
    category: 'Orthopedic & Joint',
    mockRefId: 'surg-knee-replacement'
  },
  {
    id: 'surg-cataract',
    title: 'Cataract Surgery',
    subtitle: '(With Lens Implant)',
    image: '/surgery-pkg6-cataract.png',
    startingPrice: 25000,
    priceFormatted: '₹25,000',
    category: 'Ophthalmology (Eye)',
    mockRefId: 'surg-cataract'
  }
];

// 7 Surgery Categories matching Section 7 in the reference design
const SURGERY_CATEGORIES = [
  { id: 'cat-general', title: 'General Surgery', icon: ScalpelIcon },
  { id: 'cat-laparoscopic', title: 'Laparoscopic Surgery', icon: LaparoscopyIcon },
  { id: 'cat-orthopedic', title: 'Orthopedic Surgery', icon: BoneIcon },
  { id: 'cat-eye', title: 'Eye Surgery (Cataract)', icon: Eye },
  { id: 'cat-urology', title: 'Urology Surgery', icon: KidneyIcon },
  { id: 'cat-gi', title: 'Gastrointestinal Surgery', icon: StomachIcon },
  { id: 'cat-ent', title: 'ENT Surgery', icon: EarIcon }
];

export default function SurgeryPackagesPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSurgeryId, setSelectedSurgeryId] = useState(null);

  const handleOpenBooking = (surgeryId = null) => {
    setSelectedSurgeryId(surgeryId);
    setIsBookingModalOpen(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFA] font-sans text-slate-800 pb-16 antialiased selection:bg-[#007A64] selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION - Full Width Edge-to-Edge                                  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-gradient-to-r from-[#E6FAF5] via-[#DCF6EF] to-[#D0F2E8]">
        
        {/* Subtle Ambient Decorative Circles */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-teal-300/80 text-[#007A64] text-xs sm:text-sm font-bold tracking-wide shadow-2xs">
                <ScalpelIcon className="w-3.5 h-3.5 text-[#007A64]" />
                <span>Surgery Packages</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Surgery <span className="text-[#007A64]">Packages</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Affordable, transparent and comprehensive surgery care with expert surgeons, advanced technology and complete post-operative support.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#007A64] hover:bg-[#006853] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  <Calendar className="w-4 h-4 text-white shrink-0" />
                  <span>Book a Surgery</span>
                  <ArrowRight className="w-4 h-4 text-white shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Headphones className="w-4 h-4 text-[#007A64] shrink-0" />
                  <span>Talk to a Care Expert</span>
                </button>
              </div>

            </div>

            {/* Right Surgical Team Image */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-none overflow-hidden rounded-2xl drop-shadow-sm">
                <img
                  src="/surgery-hero-surgeons.png"
                  alt="Specialist Surgical Team at ZESTMED"
                  className="w-full h-auto object-contain max-h-72 sm:max-h-80"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Responsive Container for subsequent sections */}
      <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-9 sm:space-y-12">

        {/* ========================================================================= */}
        {/* 2. VALUE PROPOSITION STRIP (4 Key Pillars)                                */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md hover:border-teal-200 transition duration-200">
            <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-[#007A64] shrink-0" />
            <div>
              <p className="text-sm sm:text-base lg:text-[17px] font-bold text-slate-900 leading-snug">Experienced Surgeons</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md hover:border-teal-200 transition duration-200">
            <BedDouble className="w-8 h-8 sm:w-9 sm:h-9 text-[#007A64] shrink-0" />
            <div>
              <p className="text-sm sm:text-base lg:text-[17px] font-bold text-slate-900 leading-snug">Modern OT & Facilities</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md hover:border-teal-200 transition duration-200">
            <CircleDollarSign className="w-8 h-8 sm:w-9 sm:h-9 text-[#007A64] shrink-0" />
            <div>
              <p className="text-sm sm:text-base lg:text-[17px] font-bold text-slate-900 leading-snug">Transparent Pricing</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-center gap-4 hover:shadow-md hover:border-teal-200 transition duration-200">
            <HeartPulse className="w-8 h-8 sm:w-9 sm:h-9 text-[#007A64] shrink-0" />
            <div>
              <p className="text-sm sm:text-base lg:text-[17px] font-bold text-slate-900 leading-snug">Post-Surgery Care & Follow-up</p>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 3. OUR SURGERY PACKAGES (6 Procedure Cards)                               */}
        {/* ========================================================================= */}
        <section id="our-surgery-packages" className="space-y-4 sm:space-y-5">
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Our Surgery Packages
            </h2>
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#007A64] hover:text-[#006250] hover:underline cursor-pointer group"
            >
              <span>View All Packages</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 6 Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4.5 xl:gap-5">
            {SURGERY_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-3.5 sm:p-4.5 lg:p-4 xl:p-4.5 flex flex-col justify-between hover:shadow-xl hover:border-teal-300 transition duration-300 group shadow-xs"
              >
                <div>
                  {/* Visual Illustration */}
                  <div className="h-24 sm:h-28 w-full flex items-center justify-center mb-3 overflow-hidden rounded-2xl bg-slate-50/70 p-1.5">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xs sm:text-sm lg:text-[13.5px] xl:text-[14px] font-extrabold text-slate-900 leading-snug text-center min-h-[38px] flex items-center justify-center">
                    {pkg.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium text-center mt-1">
                    {pkg.subtitle}
                  </p>
                </div>

                {/* Starting Price & Action Button matching reference */}
                <button
                  type="button"
                  onClick={() => handleOpenBooking(pkg.mockRefId)}
                  className="mt-3.5 sm:mt-4 w-full bg-[#007A64] hover:bg-[#006853] text-white rounded-xl sm:rounded-2xl py-2 px-2.5 sm:px-3 flex items-center justify-between shadow-xs hover:shadow-md transition active:scale-98 cursor-pointer"
                  title={`Book ${pkg.title}`}
                >
                  <div className="text-left leading-tight">
                    <span className="block text-[9.5px] sm:text-[10px] uppercase tracking-wider text-teal-100 font-semibold">Starting from</span>
                    <span className="block text-xs sm:text-[13.5px] font-black text-white">{pkg.priceFormatted}</span>
                  </div>
                  <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              </div>
            ))}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 4. WHY CHOOSE ZESTMED FOR SURGERY? (5 Cards)                              */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Why Choose ZESTMED for Surgery?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-teal-200 hover:shadow-sm transition">
              <div className="w-10 h-10 flex items-center justify-start mb-3 text-[#007A64]">
                <Award className="w-7 h-7 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Expert Surgeons</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Highly experienced &amp; specialized team</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-teal-200 hover:shadow-sm transition">
              <div className="w-10 h-10 flex items-center justify-start mb-3 text-[#007A64]">
                <Building2 className="w-7 h-7 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Advanced OT Facilities</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Modern, sterile &amp; well-equipped OTs</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-teal-200 hover:shadow-sm transition">
              <div className="w-10 h-10 flex items-center justify-start mb-3 text-[#007A64]">
                <ShieldCheck className="w-7 h-7 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Safety First</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">International safety protocols</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-teal-200 hover:shadow-sm transition">
              <div className="w-10 h-10 flex items-center justify-start mb-3 text-[#007A64]">
                <CircleDollarSign className="w-7 h-7 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Transparent Pricing</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">No hidden costs, clear package details</p>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-teal-200 hover:shadow-sm transition">
              <div className="w-10 h-10 flex items-center justify-start mb-3 text-[#007A64]">
                <Headphones className="w-7 h-7 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Complete Care</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Pre-surgery, surgery &amp; post-surgery support</p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. OUR SURGERY PROCESS (4 Steps with chevrons)                            */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Our Surgery Process
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 sm:gap-4 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 relative hover:shadow-sm hover:border-teal-200 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="w-6 h-6 rounded-full bg-[#007A64] text-white text-xs font-black flex items-center justify-center">
                  1
                </span>
                <Stethoscope className="w-6 h-6 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Consultation</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Meet our specialist & get a proper evaluation</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 relative hover:shadow-sm hover:border-teal-200 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="w-6 h-6 rounded-full bg-[#007A64] text-white text-xs font-black flex items-center justify-center">
                  2
                </span>
                <ClipboardList className="w-6 h-6 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Surgery Planning</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Choose the right surgery package</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 relative hover:shadow-sm hover:border-teal-200 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="w-6 h-6 rounded-full bg-[#007A64] text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <BedDouble className="w-6 h-6 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Procedure</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Safe surgery with advanced technology</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 relative hover:shadow-sm hover:border-teal-200 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="w-6 h-6 rounded-full bg-[#007A64] text-white text-xs font-black flex items-center justify-center">
                  4
                </span>
                <HeartPulse className="w-6 h-6 text-[#007A64]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Recovery & Follow-up</h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">Personalized post-surgery care and regular follow-up</p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. WORLD-CLASS SURGICAL FACILITIES AT ZESTMED (Facilities Showcase)        */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-teal-200/70 bg-gradient-to-r from-[#E6FAF5] via-[#E2F7F2] to-white p-6 sm:p-8 lg:p-9 relative overflow-hidden shadow-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-teal-200/80 text-[#007A64] text-xs font-bold shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#007A64]" />
                <span>Advanced Surgical Care</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                World-Class Surgical Facilities at <span className="text-[#007A64]">ZESTMED</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Equipped with modern operation theatres, advanced medical technology and a dedicated surgical team for safe and successful outcomes.
              </p>
            </div>

            {/* Right Operation Theatre Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/70">
                <img
                  src="/surgery-facilities-ot.png"
                  alt="Modern Operation Theatre at ZESTMED"
                  className="w-full h-auto object-cover max-h-56 sm:max-h-64"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. OTHER SURGERY CATEGORIES (7 Cards Grid)                                */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Other Surgery Categories
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
            {SURGERY_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleOpenBooking()}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col items-center justify-center text-center hover:border-teal-300 hover:shadow-xs transition duration-200 cursor-pointer group"
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-3 text-[#007A64] group-hover:scale-110 transition-transform">
                    <IconComp className="w-7 h-7 text-[#007A64]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#007A64] transition-colors leading-tight">
                    {cat.title}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. BOTTOM CALL TO ACTION BANNER                                           */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#006853] via-[#007A64] to-[#005B48] p-5 sm:p-7 lg:p-8 text-white relative overflow-hidden shadow-lg border border-teal-600/30">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-60 h-60 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Headline & Subhead */}
            <div className="space-y-1.5 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-white tracking-tight leading-snug">
                Planning for a Surgery?
              </h2>
              <p className="text-xs sm:text-sm text-teal-100 font-medium">
                Get expert consultation, personalized guidance and a transparent package quote for your treatment.
              </p>
            </div>

            {/* Right Action Button & Graphic */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenBooking()}
                className="bg-white hover:bg-slate-50 text-[#007A64] font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 text-[#007A64] shrink-0" />
                <span>Book a Consultation Now</span>
                <ArrowRight className="w-4 h-4 text-[#007A64] shrink-0" />
              </button>

              {/* 3D Clipboard Graphic */}
              <div className="w-16 h-14 sm:w-20 sm:h-16 shrink-0 flex items-center justify-center select-none pointer-events-none">
                <img
                  src="/surgery-cta-clipboard.png"
                  alt="Surgery Planning & Protection"
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                />
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Interactive Booking Modal */}
      <BookSurgeryModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialPackageId={selectedSurgeryId}
      />

    </div>
  );
}
