// src/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, FlaskConical, ArrowRight, Heart, 
  Stethoscope, Activity, Scissors, Car, Clock, ShieldCheck, MapPin 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import heroTeamImg from '../assets/hero-team.png';
import heroBgImg from '../assets/hero-bg.jpg';

export default function Hero({ onOpenDoctorModal, onOpenPhysioModal, onOpenSurgeryModal, onOpenSeniorPickup }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  return (
    <section className="relative w-full min-w-full overflow-hidden bg-[#EFFBF9] pt-5 sm:pt-6 lg:pt-8 pb-10 sm:pb-12 lg:pb-14 xl:pb-16 border-b border-teal-100/60">
      {/* Hero Background Image - Full width edge-to-edge */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center lg:bg-right bg-no-repeat pointer-events-none select-none"
        style={{ backgroundImage: `url(${heroBgImg})` }}
      />

      {/* Main Full-Width Container */}
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-6 xl:gap-8 items-end w-full">
          {/* Left Column: Heading, Value Prop, CTAs */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-3 sm:space-y-3.5 text-left self-center translate-y-0 lg:-translate-y-4 xl:-translate-y-5 py-1 sm:py-2 pr-0 lg:pr-2">
            
            {/* Tag Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008F83]/10 border border-[#008F83]/30 text-xs sm:text-[13px] font-bold text-[#008F83] shadow-2xs">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Exclusively Guwahati</span>
              </div>
            </div>

            {/* Main Headline - Lab Tests FIRST */}
            <h1 className="text-[22px] xs:text-2xl sm:text-3.5xl md:text-4xl lg:text-[32px] xl:text-[36px] 2xl:text-[40px] font-black text-[#0B2238] tracking-tight leading-[1.18]">
              Book Lab Tests, Consult <br className="hidden sm:inline" />
              Doctors &amp; Order Medicines <br className="hidden sm:inline" />
              <span className="text-[#008F83]">Healthcare Hub in Guwahati</span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 max-w-xl font-medium leading-relaxed">
              Guwahati's unified healthcare destination for fast diagnostics, top specialist doctors, home physiotherapy, day-care surgeries &amp; genuine medicine delivery.
            </p>

            {/* CTAs - 6 Service Boxes in 2x3 Grid on Mobile, 3x2 on Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1 w-full">
              <Link
                to="/doctor-appointment"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/90 px-2 sm:px-3 py-2 sm:py-3 rounded-2xl font-bold text-[11.5px] xs:text-xs sm:text-[13.5px] leading-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-md hover:border-teal-300 text-center min-h-[48px] sm:min-h-[52px] cursor-pointer"
              >
                <Stethoscope className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#008F83] shrink-0" />
                <span>Book Doctor</span>
              </Link>

              <Link
                to="/medicines"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/90 px-2 sm:px-3 py-2 sm:py-3 rounded-2xl font-bold text-[11.5px] xs:text-xs sm:text-[13.5px] leading-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-md hover:border-teal-300 text-center min-h-[48px] sm:min-h-[52px] cursor-pointer"
              >
                <ShoppingCart className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                <span>Medicines</span>
              </Link>

              <Link
                to="/diagnostics"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/90 px-2 sm:px-3 py-2 sm:py-3 rounded-2xl font-bold text-[11.5px] xs:text-xs sm:text-[13.5px] leading-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-md hover:border-teal-300 text-center min-h-[48px] sm:min-h-[52px] cursor-pointer"
              >
                <FlaskConical className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#008F83] shrink-0" />
                <span>Lab Tests</span>
              </Link>

              <Link
                to="/physiotherapy"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/90 px-2 sm:px-3 py-2 sm:py-3 rounded-2xl font-bold text-[11.5px] xs:text-xs sm:text-[13.5px] leading-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-md hover:border-teal-300 text-center min-h-[48px] sm:min-h-[52px] cursor-pointer"
              >
                <Activity className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#008F83] shrink-0" />
                <span>Physiotherapy</span>
              </Link>

              <Link
                to="/surgery-packages"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/90 px-2 sm:px-3 py-2 sm:py-3 rounded-2xl font-bold text-[11.5px] xs:text-xs sm:text-[13.5px] leading-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-md hover:border-teal-300 text-center min-h-[48px] sm:min-h-[52px] cursor-pointer"
              >
                <Scissors className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#008F83] shrink-0" />
                <span>Surgery Packages</span>
              </Link>

              <Link
                to="/wellness-packages"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/90 px-2 sm:px-3 py-2 sm:py-3 rounded-2xl font-bold text-[11.5px] xs:text-xs sm:text-[13.5px] leading-tight flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 shadow-xs transition hover:shadow-md hover:border-teal-300 text-center min-h-[48px] sm:min-h-[52px] cursor-pointer"
              >
                <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#008F83] shrink-0" />
                <span>Wellness Packages</span>
              </Link>
            </div>

            {/* Senior Citizen Free Pick-up & Drop Feature Callout Banner */}
            <div 
              onClick={onOpenSeniorPickup}
              className="cursor-pointer bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border border-[#008F83]/30 rounded-2xl p-3 sm:py-3 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 hover:border-[#008F83] transition group shadow-xs hover:shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#008F83] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Car className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-[14.5px] leading-snug">
                      Within 10km Radius Free Pick-up &amp; Drop
                    </span>
                    <span className="text-[10px] sm:text-xs font-black bg-[#008F83] text-white px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 shadow-2xs">
                      For Senior Citizen
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#008F83] group-hover:underline whitespace-nowrap flex items-center gap-1 shrink-0 self-end sm:self-center">
                Book Cab <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Right Column: Prominent Healthcare Professionals Graphic matching Reference Image */}
          <div className="lg:col-span-7 xl:col-span-7 relative flex justify-center lg:justify-end items-end self-center translate-y-0 lg:-translate-y-6 xl:-translate-y-8 mt-2 sm:mt-0 mb-0 lg:-mb-4 xl:-mb-5 overflow-visible">
            <div className="w-full flex justify-center lg:justify-end items-end">
              <img
                src={heroTeamImg}
                alt="ZESTMED Healthcare Professionals - Lab Scientist, Doctor, and Delivery Partner"
                className="w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[700px] xl:max-w-[800px] 2xl:max-w-[880px] h-auto object-contain object-bottom drop-shadow-xl select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
