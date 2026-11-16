import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Target, Eye, Pill, FlaskConical, Layers, 
  CheckCircle2, Users, Package, MapPin, ShieldCheck, 
  Award, Leaf 
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-20">
      {/* 1. HERO BANNER - FULL WIDTH HOMEPAGE HERO STYLING */}
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
              <linearGradient id="aboutOrganicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#93C5FD" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="aboutOrganicGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path
              d="M110,0 C180,45 150,135 230,185 C300,225 390,210 500,260 L500,0 Z"
              fill="url(#aboutOrganicGrad1)"
            />
            <path
              d="M230,0 C280,65 260,150 340,195 C400,225 450,215 500,225 L500,0 Z"
              fill="url(#aboutOrganicGrad2)"
              opacity="0.65"
            />
          </svg>
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] bg-gradient-to-bl from-[#60A5FA]/45 via-[#93C5FD]/25 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10 min-h-[230px] sm:min-h-[250px] lg:min-h-[270px] flex items-center">
          {/* Left Column: Breadcrumb, Title & Subtitle */}
          <div className="relative z-20 max-w-lg lg:max-w-xl xl:max-w-2xl py-6 sm:py-7 lg:py-8 space-y-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold mb-1.5">
              <Link to="/" className="flex items-center gap-1.5 hover:text-[#005CB9] transition">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#005CB9]" />
                <span>Home</span>
              </Link>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-900 font-bold">About Us</span>
            </div>

            {/* Page Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-[#0B1728] tracking-tight leading-tight mb-1.5">
              About <span className="text-[#005CB9]">ZESTMED</span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
              Your trusted healthcare and diagnostics partner for medicines, lab tests, health checkups and home sample collection.
            </p>
          </div>
        </div>

        {/* Desktop Right Corner Building Asset (Positioned Flush in Right Corner) */}
        <div className="hidden lg:flex absolute inset-y-0 right-0 w-full pointer-events-none z-10 items-end justify-end">
          <div className="relative h-full w-full flex items-end justify-end">
            <img
              src="/about-building.png"
              alt="ZESTMED Healthcare & Diagnostics Central Facility"
              className="absolute bottom-0 right-0 h-full max-h-[230px] sm:max-h-[250px] lg:max-h-[270px] w-auto max-w-[58%] lg:max-w-[60%] xl:max-w-[64%] object-contain object-right-bottom drop-shadow-xl select-none"
            />
          </div>
        </div>

        {/* Mobile / Tablet Image (Displayed below text on <lg screens) */}
        <div className="lg:hidden relative z-10 px-4 sm:px-6 pb-0 flex justify-end">
          <img
            src="/about-building.png"
            alt="ZESTMED Healthcare & Diagnostics Central Facility"
            className="w-full max-w-md sm:max-w-lg h-auto max-h-[220px] sm:max-h-[250px] object-contain object-right-bottom drop-shadow-xl select-none ml-auto"
          />
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-10 sm:py-14 space-y-12 sm:space-y-16">

        {/* 1. OUR MISSION & VISION */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1728] text-center tracking-tight">
            Our Mission & Vision
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Mission Card */}
            <div className="bg-[#E2F7F8] border border-[#C6EFEF] rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex items-start gap-4 sm:gap-5 transition-shadow hover:shadow-md">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#AEF2F1] text-[#005CB9] flex items-center justify-center shrink-0 shadow-xs">
                <Target className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-[#0B1728]">Our Mission</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  To make quality healthcare accessible, affordable and convenient for everyone through trusted medicines, accurate diagnostics and reliable home services.
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="bg-[#FDECF4] border border-[#FAD7E7] rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex items-start gap-4 sm:gap-5 transition-shadow hover:shadow-md">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#FFB9CD] text-[#E11D48] flex items-center justify-center shrink-0 shadow-xs">
                <Eye className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-[#0B1728]">Our Vision</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  To be a leading digital healthcare platform, empowering people to take better care of their health with technology, trust and a patient-first approach.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WHAT WE DO */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1728] text-center tracking-tight">
            What We Do
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Order Medicines */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-teal-200 transition">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-50 text-[#005CB9] flex items-center justify-center shrink-0">
                <Pill className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug">Order Medicines</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                  Get genuine medicines from trusted & licensed partners.
                </p>
              </div>
            </div>

            {/* 2. Book Lab Tests */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-blue-200 transition">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FlaskConical className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug">Book Lab Tests</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                  Choose from 100+ diagnostic tests with accurate reports.
                </p>
              </div>
            </div>

            {/* 3. Health Packages */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-amber-200 transition">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug">Health Packages</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                  Comprehensive checkups for you and your family.
                </p>
              </div>
            </div>

            {/* 4. Home Sample Collection */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-blue-200 transition">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Home className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug">Home Sample Collection</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                  Book a test and get samples collected from your home.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. WHY CHOOSE ZESTMED */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
            {/* Left: Team Illustration / Photo */}
            <div className="lg:col-span-4 flex justify-center items-end">
              <div className="relative w-full max-w-[360px] flex items-end justify-center">
                <img
                  src="/about-team.png"
                  alt="ZESTMED Dedicated Medical Team"
                  className="w-full h-auto max-h-[260px] sm:max-h-[290px] object-contain object-bottom drop-shadow-md select-none"
                />
              </div>
            </div>

            {/* Center: Title + 5 Bullet Points */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-2xl sm:text-3xl font-black text-[#0B1728] tracking-tight">
                Why Choose <span className="text-[#005CB9]">ZESTMED?</span>
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                {[
                  'Wide range of genuine medicines',
                  'Accurate & reliable diagnostic tests',
                  'Convenient home sample collection',
                  'Secure and easy online payment',
                  'Reports anytime, anywhere'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#005CB9] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 2x2 Stats Grid in Soft Ice Azure Container */}
            <div className="lg:col-span-4 bg-[#F0F6FE] border border-blue-100 rounded-2xl p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                {/* 50,000+ Happy Patients */}
                <div className="bg-white rounded-xl p-3.5 text-center shadow-xs border border-teal-50 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#005CB9] flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#0B1728]">50,000+</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Happy Patients</div>
                </div>

                {/* 100+ Lab Tests */}
                <div className="bg-white rounded-xl p-3.5 text-center shadow-xs border border-teal-50 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#005CB9] flex items-center justify-center mb-1">
                    <FlaskConical className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#0B1728]">100+</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Lab Tests</div>
                </div>

                {/* 5,000+ Medicines */}
                <div className="bg-white rounded-xl p-3.5 text-center shadow-xs border border-teal-50 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#005CB9] flex items-center justify-center mb-1">
                    <Package className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#0B1728]">5,000+</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Medicines</div>
                </div>

                {/* 10+ Partner Labs */}
                <div className="bg-white rounded-xl p-3.5 text-center shadow-xs border border-teal-50 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#005CB9] flex items-center justify-center mb-1">
                    <MapPin className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#0B1728]">10+</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Partner Labs</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. OUR VALUES */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1728] text-center tracking-tight">
            Our Values
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* 1. Trust */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-teal-200 transition">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-50 text-[#005CB9] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug">Trust</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                  Reliable and transparent healthcare services.
                </p>
              </div>
            </div>

            {/* 2. Patient First */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-sky-200 transition">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug">Patient First</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                  Your health and convenience are our top priority.
                </p>
              </div>
            </div>

            {/* 3. Quality */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-amber-200 transition">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug">Quality</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                  Accurate, safe and certified services.
                </p>
              </div>
            </div>

            {/* 4. Accessibility */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-blue-200 transition">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Leaf className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#0B1728] leading-snug">Accessibility</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                  Healthcare made easy, affordable and near you.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
