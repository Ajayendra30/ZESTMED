// src/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, FlaskConical, ArrowRight, Heart, 
  Stethoscope, Activity, Scissors, Car, Clock, ShieldCheck, MapPin 
} from 'lucide-react';
import heroTeamImg from '../assets/hero-team.png';
import heroBgImg from '../assets/hero-bg.jpg';

export default function Hero({ onOpenDoctorModal, onOpenPhysioModal, onOpenSurgeryModal, onOpenSeniorPickup }) {
  return (
    <section className="relative overflow-hidden bg-[#EFFBF9] pt-4 sm:pt-5 lg:pt-6 pb-8 sm:pb-10 lg:pb-12 xl:pb-14 border-b border-teal-100/60">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center lg:bg-right bg-no-repeat pointer-events-none select-none"
        style={{ backgroundImage: `url(${heroBgImg})` }}
      />

      {/* Main Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-4 items-end">
          {/* Left Column: Heading, Value Prop, CTAs */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-2.5 sm:space-y-3 text-left self-center -translate-y-2 sm:-translate-y-3 lg:-translate-y-5 xl:-translate-y-6 py-1 sm:py-2 pr-0 lg:pr-4">
            
            {/* Tag Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008F83]/10 border border-[#008F83]/30 text-xs font-bold text-[#008F83]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Exclusively Guwahati</span>
              </div>
            </div>

            {/* Main Headline - Lab Tests FIRST */}
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[30px] xl:text-[34px] 2xl:text-[38px] font-black text-[#0B2238] tracking-tight leading-[1.15]">
              Book Lab Tests, Consult <br className="hidden sm:inline" />
              Doctors & Order Medicines <br className="hidden sm:inline" />
              <span className="text-[#008F83]">Healthcare Hub in Guwahati</span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-[13px] md:text-sm text-slate-600 max-w-xl font-medium leading-relaxed">
              Guwahati's unified healthcare destination for fast diagnostics, top specialist doctors, home physiotherapy, day-care surgeries & genuine medicine delivery.
            </p>

            {/* CTAs - 6 Service Boxes in 3x2 Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-0.5 w-full">
              <Link
                to="/doctor-appointment"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-[13px] leading-snug flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-xs transition hover:shadow-sm text-center min-h-[44px] sm:min-h-[46px]"
              >
                <Stethoscope className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Book Doctor</span>
              </Link>

              <Link
                to="/medicines"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-[13px] leading-snug flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-xs transition hover:shadow-sm text-center min-h-[44px] sm:min-h-[46px]"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Medicines</span>
              </Link>

              <Link
                to="/diagnostics"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-[13px] leading-snug flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-xs transition hover:shadow-sm text-center min-h-[44px] sm:min-h-[46px]"
              >
                <FlaskConical className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Lab Tests</span>
              </Link>

              <Link
                to="/physiotherapy"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-[13px] leading-snug flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-xs transition hover:shadow-sm text-center min-h-[44px] sm:min-h-[46px]"
              >
                <Activity className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Physiotherapy</span>
              </Link>

              <Link
                to="/surgery-packages"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-[13px] leading-snug flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-xs transition hover:shadow-sm text-center min-h-[44px] sm:min-h-[46px]"
              >
                <Scissors className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Surgery Packages</span>
              </Link>

              <Link
                to="/wellness-packages"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-[13px] leading-snug flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shadow-xs transition hover:shadow-sm text-center min-h-[44px] sm:min-h-[46px]"
              >
                <ShieldCheck className="w-4 h-4 text-[#008F83] shrink-0" />
                <span>Wellness Packages</span>
              </Link>
            </div>

            {/* Senior Citizen Free Pick-up & Drop Feature Callout Banner */}
            <div 
              onClick={onOpenSeniorPickup}
              className="cursor-pointer bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border border-[#008F83]/30 rounded-xl sm:rounded-2xl p-2.5 sm:py-2.5 sm:px-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 hover:border-[#008F83] transition group shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#008F83] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Car className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs sm:text-[13px] md:text-sm leading-snug">
                      Within 10km Radius Free Pick-up & Drop
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-black bg-[#008F83] text-white px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 shadow-2xs">
                      For Senior Citizen
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                    Sanitized AC cab across Guwahati for diagnostics & clinics
                  </p>
                </div>
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-[#008F83] group-hover:underline whitespace-nowrap flex items-center gap-1 shrink-0 self-end sm:self-center">
                Book Cab <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Right Column: Prominent Healthcare Professionals Graphic matching Reference Image */}
          <div className="lg:col-span-7 xl:col-span-7 relative flex justify-center lg:justify-end items-end self-center -translate-y-3 sm:-translate-y-4 lg:-translate-y-6 xl:-translate-y-8 -mb-2 sm:-mb-3 lg:-mb-4 xl:-mb-5 overflow-visible">
            <div className="w-full flex justify-center lg:justify-end items-end">
              <img
                src={heroTeamImg}
                alt="ZESTMED Healthcare Professionals - Lab Scientist, Doctor, and Delivery Partner"
                className="w-full max-w-[380px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[680px] xl:max-w-[760px] 2xl:max-w-[830px] h-auto object-contain object-bottom drop-shadow-xl select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
