// src/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, FlaskConical, ArrowRight, Heart, 
  Stethoscope, Activity, Scissors, Car, Clock, ShieldCheck, MapPin 
} from 'lucide-react';
import heroTeamImg from '../assets/hero-team.png';

export default function Hero({ onOpenDoctorModal, onOpenPhysioModal, onOpenSurgeryModal, onOpenSeniorPickup }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#EFFBF9] via-[#E8F8F6] to-[#DEF7F5] pt-6 sm:pt-8 lg:pt-10 pb-12 sm:pb-16 lg:pb-20 border-b border-teal-100/60">
      {/* 1. Subtle Floating Mint Medical Plus (+) Symbols */}
      <div className="absolute top-8 sm:top-10 left-[48%] lg:left-[52%] opacity-35 text-teal-300 font-bold text-5xl sm:text-6xl lg:text-7xl pointer-events-none select-none">
        +
      </div>
      <div className="absolute top-6 right-8 lg:right-16 opacity-20 text-teal-300 font-bold text-5xl pointer-events-none select-none">
        +
      </div>

      {/* 2. Distinctive Organic Mint-Cyan Curved Backdrop */}
      <div className="absolute top-0 right-0 w-[64%] sm:w-[58%] lg:w-[50%] xl:w-[46%] h-full pointer-events-none select-none overflow-hidden">
        <svg
          viewBox="0 0 500 400"
          preserveAspectRatio="none"
          className="absolute top-0 right-0 w-full h-full"
        >
          <defs>
            <linearGradient id="heroOrganicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C4F1F7" stopOpacity="0.45" />
              <stop offset="45%" stopColor="#A2E6F2" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#7AD4E4" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="heroOrganicGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BCEEF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#67CCE0" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path
            d="M80,0 C160,45 130,135 220,185 C290,225 380,210 500,260 L500,0 Z"
            fill="url(#heroOrganicGrad1)"
          />
          <path
            d="M200,0 C260,65 240,150 330,195 C390,225 440,215 500,225 L500,0 Z"
            fill="url(#heroOrganicGrad2)"
            opacity="0.65"
          />
        </svg>
        <div className="absolute -top-16 -right-16 w-[420px] h-[420px] bg-gradient-to-bl from-[#75D2E4]/45 via-[#9FE5F2]/25 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Main Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-end">
          {/* Left Column: Heading, Value Prop, CTAs */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4 sm:space-y-4.5 text-left self-center py-2 sm:py-4 lg:py-6 pr-0 lg:pr-4">
            
            {/* Tag Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#008F83]/10 border border-[#008F83]/30 text-xs font-bold text-[#008F83]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Exclusively Guwahati</span>
              </div>
            </div>

            {/* Main Headline - Lab Tests FIRST */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[38px] xl:text-[44px] 2xl:text-[48px] font-black text-[#0B2238] tracking-tight leading-[1.15]">
              Book Lab Tests, Consult <br />
              Doctors & Order Medicines <br />
              <span className="text-[#008F83]">Healthcare Hub in Guwahati</span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl font-medium leading-relaxed">
              Guwahati's unified healthcare destination for fast diagnostics, top specialist doctors, home physiotherapy, day-care surgeries & genuine medicine delivery.
            </p>

            {/* CTAs - 6 Service Boxes in 3x2 Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1 w-full">
              <Link
                to="/doctor-appointment"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3.5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-sm text-center"
              >
                <Stethoscope className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Book Doctor</span>
              </Link>

              <Link
                to="/medicines"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3.5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-sm text-center"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Medicines</span>
              </Link>

              <Link
                to="/diagnostics"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3.5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-sm text-center"
              >
                <FlaskConical className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Lab Tests</span>
              </Link>

              <Link
                to="/physiotherapy"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3.5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-sm text-center"
              >
                <Activity className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Physiotherapy</span>
              </Link>

              <Link
                to="/surgery-packages"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3.5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-sm text-center"
              >
                <Scissors className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Surgery Packages</span>
              </Link>

              <Link
                to="/wellness-packages"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3.5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-sm text-center"
              >
                <ShieldCheck className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Wellness Packages</span>
              </Link>
            </div>

            {/* Senior Citizen Free Pick-up & Drop Feature Callout Banner */}
            <div 
              onClick={onOpenSeniorPickup}
              className="cursor-pointer bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border border-[#008F83]/30 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-[#008F83] transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#008F83] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Car className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span>Within 10km Radius Free Pick-up & Drop</span>
                    <span className="text-[10px] font-black bg-[#008F83] text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                      For Senior Citizen
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Sanitized AC cab across Guwahati for diagnostics & clinics
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#008F83] group-hover:underline whitespace-nowrap flex items-center gap-1">
                Book Cab <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Right Column: Prominent Healthcare Professionals Graphic matching Reference Image */}
          <div className="lg:col-span-7 xl:col-span-7 relative flex justify-center lg:justify-end items-end self-end -mb-8 sm:-mb-12 lg:-mb-14 overflow-visible">
            <div className="w-full flex justify-center lg:justify-end items-end">
              <img
                src={heroTeamImg}
                alt="ZESTMED Healthcare Professionals - Lab Scientist, Doctor, and Delivery Partner"
                className="w-full max-w-[460px] sm:max-w-[580px] md:max-w-[660px] lg:max-w-[740px] xl:max-w-[840px] 2xl:max-w-[900px] h-auto object-contain object-bottom drop-shadow-xl select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
