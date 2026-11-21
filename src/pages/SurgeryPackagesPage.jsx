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

// Custom Hero Icons matching the Reference Design
function SurgeonSpecialistIcon({ className = "w-5 h-5 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function ModernOTIcon({ className = "w-5 h-5 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="8" rx="2" />
      <path d="M12 4.5v3M10.5 6h3" />
      <rect x="3" y="13" width="18" height="3" rx="1.5" />
      <path d="M6 16v4M18 16v4M8 20h8" />
    </svg>
  );
}

function AdvancedTechIcon({ className = "w-5 h-5 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function PostCareIcon({ className = "w-5 h-5 text-[#0B1E3F]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5.5c-1.3-1.8-3.7-1.3-4.3.7-.8 2.5 4.3 5.3 4.3 5.3s5.1-2.8 4.3-5.3c-.6-2-3-2.5-4.3-.7Z" />
      <path d="M12 7v2M11 8h2" />
      <path d="M4 14.5c1 3 3.5 5 6 6" />
      <path d="M20 14.5c-1 3-3.5 5-6 6" />
      <path d="M6 13c.5-1.5 1.5-2 2.5-2" />
      <path d="M18 13c-.5-1.5-1.5-2-2.5-2" />
    </svg>
  );
}

// 6 Core Surgery Packages matching Section 3 in the reference design
const SURGERY_PACKAGES = [
  {
    id: 'surg-gallbladder',
    slug: 'gallbladder-stone-surgery',
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
    slug: 'appendectomy',
    title: 'Appendectomy',
    subtitle: '(Appendix Surgery)',
    image: '/surgery-pkg2-appendix.png',
    startingPrice: 35000,
    priceFormatted: '₹35,000',
    category: 'Laparoscopic & General',
    mockRefId: 'surg-appendix'
  },
  {
    id: 'surg-hernia',
    slug: 'hernia-repair',
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
    slug: 'knee-replacement',
    title: 'Knee Replacement',
    subtitle: '(Total / Partial)',
    image: '/surgery-pkg4-knee.png',
    startingPrice: 250000,
    priceFormatted: '₹2,50,000',
    category: 'Orthopedic & Joint',
    mockRefId: 'surg-knee'
  },
  {
    id: 'surg-hip',
    slug: 'hip-replacement',
    title: 'Hip Replacement',
    subtitle: '(Total Hip Surgery)',
    image: '/surgery-pkg5-hip.png',
    startingPrice: 280000,
    priceFormatted: '₹2,80,000',
    category: 'Orthopedic & Joint',
    mockRefId: 'surg-hip'
  },
  {
    id: 'surg-cataract',
    slug: 'cataract-surgery',
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
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FBFA] font-sans text-slate-800 antialiased selection:bg-[#007A64] selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION - Recreated to exact reference design                       */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-[#E8F6F8] min-h-[380px] sm:min-h-[410px] lg:min-h-[436px] flex items-stretch">
        
        {/* Full-Width Background Image */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/surgery-hero-bg.jpg"
            alt="ZESTMED Surgery Facility Background"
            className="w-full h-full object-cover object-[right_top]"
          />
          {/* Subtle soft gradient on the left behind text for high legibility */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[58%] lg:w-[50%] bg-gradient-to-r from-sky-50/85 via-sky-50/45 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-8 pt-7 sm:pt-9 lg:pt-8 pb-0">
          
          {/* Left Column: Pill, Title, Subtitle, 4 Pillars & CTA */}
          <div className="w-full lg:w-[540px] xl:w-[580px] shrink-0 space-y-4 sm:space-y-4.5 self-center py-4 lg:py-6 z-20">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/85 border border-[#007A64]/40 text-[#007A64] text-xs sm:text-[13px] font-black tracking-wide shadow-2xs">
              <span>Advanced Surgical Care</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-black text-[#0B1E3F] tracking-tight leading-[1.18]">
              Expert Surgery Services<br />
              <span className="text-[#0B1E3F]">for a </span><span className="text-[#007A64]">Healthier Tomorrow</span>
            </h1>

            {/* Subheading text */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
              Safe, advanced and trusted surgical procedures with experienced doctors and modern facilities.
            </p>

            {/* 4 Feature Pillars Row with Dividers */}
            <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5 pt-1.5 pb-1 flex-wrap sm:flex-nowrap">
              {/* Pillar 1 */}
              <div className="flex flex-col items-center text-center">
                <SurgeonSpecialistIcon className="w-5 h-5 text-[#0B1E3F] mb-1.5" />
                <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                  Expert Surgeons<br />&amp; Specialists
                </span>
              </div>

              {/* Divider 1 */}
              <div className="hidden sm:block w-[1px] h-8 bg-slate-300/80 shrink-0" />

              {/* Pillar 2 */}
              <div className="flex flex-col items-center text-center">
                <ModernOTIcon className="w-5 h-5 text-[#0B1E3F] mb-1.5" />
                <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                  Modern<br />Operation Theatres
                </span>
              </div>

              {/* Divider 2 */}
              <div className="hidden sm:block w-[1px] h-8 bg-slate-300/80 shrink-0" />

              {/* Pillar 3 */}
              <div className="flex flex-col items-center text-center">
                <AdvancedTechIcon className="w-5 h-5 text-[#0B1E3F] mb-1.5" />
                <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                  Advanced<br />Technology
                </span>
              </div>

              {/* Divider 3 */}
              <div className="hidden sm:block w-[1px] h-8 bg-slate-300/80 shrink-0" />

              {/* Pillar 4 */}
              <div className="flex flex-col items-center text-center">
                <PostCareIcon className="w-5 h-5 text-[#0B1E3F] mb-1.5" />
                <span className="text-[11px] sm:text-xs font-bold text-[#0B1E3F] leading-tight">
                  Comprehensive<br />Post-Surgery Care
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('our-surgery-packages')}
                className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 group"
              >
                <span>Book Surgery Package</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Right Column: Transparent Surgeon Cutout Layered Seamlessly */}
          <div className="w-full lg:flex-1 flex justify-center lg:justify-end items-end self-end pointer-events-none select-none z-20 mt-2 lg:mt-0 -mb-[1px]">
            <img
              src="/surgery-hero-surgeon.png"
              alt="Surgeon performing advanced surgical procedure at ZESTMED"
              className="h-[250px] xs:h-[290px] sm:h-[350px] md:h-[390px] lg:h-[436px] xl:h-[460px] w-auto max-w-full object-contain object-bottom select-none drop-shadow-md"
            />
          </div>

        </div>
      </section>

      {/* Main Responsive Container for subsequent sections */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-8 sm:pt-10 pb-4 sm:pb-6 space-y-9 sm:space-y-12">

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
              onClick={() => scrollToSection('other-surgery-categories')}
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
                <Link to={`/surgery-packages/${pkg.slug}`} className="block group-hover:opacity-95 transition">
                  {/* Visual Illustration */}
                  <div className="h-28 sm:h-32 lg:h-32 xl:h-36 w-full flex items-center justify-center mb-3 overflow-hidden rounded-2xl bg-slate-50/70 p-1">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xs sm:text-sm lg:text-[13.5px] xl:text-[14px] font-extrabold text-slate-900 group-hover:text-[#007A64] transition-colors leading-snug text-center min-h-[38px] flex items-center justify-center">
                    {pkg.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium text-center mt-1">
                    {pkg.subtitle}
                  </p>
                </Link>

                {/* Starting Price & Action Button linking directly to dedicated detail page */}
                <Link
                  to={`/surgery-packages/${pkg.slug}`}
                  className="mt-3.5 sm:mt-4 w-full bg-[#007A64] hover:bg-[#006853] text-white rounded-xl sm:rounded-2xl py-2 px-2.5 sm:px-3 flex items-center justify-between shadow-xs hover:shadow-md transition active:scale-98 cursor-pointer select-none"
                  title={`View details for ${pkg.title}`}
                >
                  <div className="text-left leading-tight">
                    <span className="block text-[9.5px] sm:text-[10px] uppercase tracking-wider text-teal-100 font-semibold">Starting from</span>
                    <span className="block text-xs sm:text-[13.5px] font-black text-white">{pkg.priceFormatted}</span>
                  </div>
                  <div className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </Link>
              </div>
            ))}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 4. WHY CHOOSE ZESTMED FOR SURGERY? (5 Cards)                              */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Choose ZESTMED for Surgery?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4.5">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 hover:border-teal-300 hover:shadow-md transition flex flex-col justify-between min-h-[140px] sm:min-h-[145px]">
              <div className="w-14 h-14 flex items-center justify-start mb-3 text-[#007A64]">
                <Award className="w-10 h-10 sm:w-11 sm:h-11 lg:w-10 lg:h-10 xl:w-11 xl:h-11 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-slate-900 leading-tight whitespace-nowrap">Expert Surgeons</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">Highly experienced &amp; specialized team</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 hover:border-teal-300 hover:shadow-md transition flex flex-col justify-between min-h-[140px] sm:min-h-[145px]">
              <div className="w-14 h-14 flex items-center justify-start mb-3 text-[#007A64]">
                <Building2 className="w-10 h-10 sm:w-11 sm:h-11 lg:w-10 lg:h-10 xl:w-11 xl:h-11 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-slate-900 leading-tight whitespace-nowrap">Advanced OT Facilities</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">Modern, sterile &amp; well-equipped OTs</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 hover:border-teal-300 hover:shadow-md transition flex flex-col justify-between min-h-[140px] sm:min-h-[145px]">
              <div className="w-14 h-14 flex items-center justify-start mb-3 text-[#007A64]">
                <ShieldCheck className="w-10 h-10 sm:w-11 sm:h-11 lg:w-10 lg:h-10 xl:w-11 xl:h-11 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-slate-900 leading-tight whitespace-nowrap">Safety First</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">International safety protocols &amp; care</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 hover:border-teal-300 hover:shadow-md transition flex flex-col justify-between min-h-[140px] sm:min-h-[145px]">
              <div className="w-14 h-14 flex items-center justify-start mb-3 text-[#007A64]">
                <CircleDollarSign className="w-10 h-10 sm:w-11 sm:h-11 lg:w-10 lg:h-10 xl:w-11 xl:h-11 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-slate-900 leading-tight whitespace-nowrap">Transparent Pricing</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">No hidden costs, clear package details</p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 hover:border-teal-300 hover:shadow-md transition flex flex-col justify-between min-h-[140px] sm:min-h-[145px]">
              <div className="w-14 h-14 flex items-center justify-start mb-3 text-[#007A64]">
                <Headphones className="w-10 h-10 sm:w-11 sm:h-11 lg:w-10 lg:h-10 xl:w-11 xl:h-11 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-slate-900 leading-tight whitespace-nowrap">Complete Care</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">Pre-surgery, surgery &amp; post-surgery support</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. OUR SURGERY PROCESS (4 Steps with chevrons)                            */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Our Surgery Process
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 sm:p-5.5 lg:p-4.5 xl:p-6 relative hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-2xs">
                  1
                </span>
                <Stethoscope className="w-9 h-9 sm:w-10 sm:h-10 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-base sm:text-lg lg:text-[15px] xl:text-lg font-black text-slate-900 leading-tight whitespace-nowrap">Consultation</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1.5 leading-snug whitespace-nowrap">Meet our specialist for evaluation</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 sm:p-5.5 lg:p-4.5 xl:p-6 relative hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-2xs">
                  2
                </span>
                <ClipboardList className="w-9 h-9 sm:w-10 sm:h-10 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-base sm:text-lg lg:text-[15px] xl:text-lg font-black text-slate-900 leading-tight whitespace-nowrap">Surgery Planning</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1.5 leading-snug whitespace-nowrap">Choose the right surgery package</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 sm:p-5.5 lg:p-4.5 xl:p-6 relative hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-2xs">
                  3
                </span>
                <BedDouble className="w-9 h-9 sm:w-10 sm:h-10 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-base sm:text-lg lg:text-[15px] xl:text-lg font-black text-slate-900 leading-tight whitespace-nowrap">Procedure</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1.5 leading-snug whitespace-nowrap">Safe surgery with advanced technology</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 sm:p-5.5 lg:p-4.5 xl:p-6 relative hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007A64] text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-2xs">
                  4
                </span>
                <HeartPulse className="w-9 h-9 sm:w-10 sm:h-10 text-[#007A64] stroke-[2.2]" />
              </div>
              <div className="mt-auto">
                <h3 className="text-base sm:text-lg lg:text-[15px] xl:text-lg font-black text-slate-900 leading-tight whitespace-nowrap">Recovery &amp; Follow-up</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium mt-1.5 leading-snug whitespace-nowrap">Post-surgery care &amp; regular follow-up</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. WORLD-CLASS SURGICAL FACILITIES AT ZESTMED (Facilities Showcase)        */}
        {/* ========================================================================= */}
        <section className="rounded-3xl border border-teal-200/70 bg-gradient-to-r from-[#E6FAF5] via-[#E2F7F2] to-white p-7 sm:p-9 lg:p-11 relative overflow-hidden shadow-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/90 border border-teal-200 text-[#007A64] text-xs sm:text-sm font-extrabold shadow-2xs">
                <Building2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#007A64]" />
                <span>Advanced Surgical Care</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                World-Class Surgical Facilities at <span className="text-[#007A64]">ZESTMED</span>
              </h3>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                Equipped with modern operation theatres, advanced medical technology and a dedicated surgical team for safe and successful outcomes.
              </p>
            </div>

            {/* Right Operation Theatre Image */}
            <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
              <img
                src="/surgery-facilities-ot.png"
                alt="Modern Operation Theatre at ZESTMED"
                className="w-full h-auto object-contain max-h-64 sm:max-h-72 lg:max-h-80 drop-shadow-md select-none"
              />
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. OTHER SURGERY CATEGORIES (7 Cards Grid)                                */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Other Surgery Categories
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5">
            {SURGERY_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => scrollToSection('our-surgery-packages')}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col items-center justify-center text-center hover:border-teal-300 hover:shadow-md transition duration-200 cursor-pointer group min-h-[125px] sm:min-h-[140px]"
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-3 text-[#007A64] group-hover:scale-110 transition-transform">
                    <IconComp className="w-8 h-8 sm:w-9 sm:h-9 text-[#007A64] stroke-[2.2]" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-[#007A64] transition-colors leading-tight">
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
        <section id="surgery-planning-cta" className="rounded-3xl bg-gradient-to-r from-[#006853] via-[#007A64] to-[#005B48] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-lg border border-teal-600/30">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-60 h-60 bg-teal-300/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left Headline & Subhead */}
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-snug">
                Planning for a Surgery?
              </h2>
              <p className="text-sm sm:text-base text-teal-100 font-medium leading-relaxed max-w-xl">
                Get expert consultation, personalized guidance and a transparent package quote for your treatment.
              </p>
            </div>

            {/* Right Action Button & Graphic */}
            <div className="flex items-center gap-3.5 sm:gap-5 shrink-0">
              <button
                type="button"
                onClick={() => scrollToSection('our-surgery-packages')}
                className="bg-white hover:bg-slate-50 text-[#007A64] font-black text-sm sm:text-base px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-md hover:shadow-lg transition flex items-center gap-2.5 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Calendar className="w-5 h-5 text-[#007A64] shrink-0" />
                <span>Explore Surgery Packages</span>
                <ArrowRight className="w-5 h-5 text-[#007A64] shrink-0" />
              </button>

              {/* 3D Clipboard Graphic */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 flex items-center justify-center select-none pointer-events-none">
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

    </div>
  );
}
