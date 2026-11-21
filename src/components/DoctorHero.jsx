import React from 'react';
import { Calendar, ArrowRight, Video } from 'lucide-react';

/**
 * DoctorHero - Pixel-accurate Full-Width Hero Section for Doctor Appointment page
 * 
 * Features:
 * - Two-column responsive layout: Heading & Action CTAs on the left, prominent doctor asset on the right
 * - "Book an Appointment" and "Online Consultation" side by side in a single horizontal line
 * - Grounded doctor image against modern hospital clinic background
 * - Cleaned up to remove the "Find a Doctor" widget as requested
 */
export default function DoctorHero({
  onBookAppointment,
  onOnlineConsultation
}) {
  return (
    <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-slate-100">
      
      {/* 1. Full Hero Background Image with Responsive Positioning */}
      <div className="absolute inset-0 select-none pointer-events-none overflow-hidden">
        <img
          src="/doctor-hero-hospital-corridor.jpg"
          alt="Modern Hospital Specialty Clinic Corridor"
          className="w-full h-full object-cover object-center sm:object-[center_35%] lg:object-center transition-all duration-300"
        />
        {/* Soft Ambient Protective Overlay for Typography Legibility & Brand Theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/70 sm:from-white/90 sm:via-white/75 sm:to-white/60 lg:from-white/92 lg:via-white/75 lg:to-white/50 backdrop-blur-[0.5px]" />
      </div>

      {/* 2. Main Full-Width Content Container - Compact top padding, grounded bottom */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-3 sm:pt-4 lg:pt-5 pb-4 sm:pb-5 lg:pb-0 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-8">
        
        {/* Left Column: Heading, Subtitle & Action Buttons */}
        <div className="w-full lg:max-w-lg xl:max-w-xl shrink-0 space-y-3 sm:space-y-4 relative z-20 text-left self-center lg:self-center py-4 lg:py-8">
          
          {/* Doctor Appointment Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#E0F3ED] text-[#007A64] border border-[#BCE8DD] text-xs sm:text-sm font-extrabold shadow-2xs">
            <Calendar className="w-4 h-4 text-[#007A64]" />
            <span>Doctor Appointment</span>
          </div>

          {/* Main Headline - High contrast & fully visible */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[40px] 2xl:text-[44px] font-black text-[#0F1E36] leading-[1.18] tracking-tight">
            Book Doctor Appointment<br />
            <span className="font-extrabold text-[#0F1E36]">with </span>
            <span className="text-[#007A64] font-black">Trusted Specialists</span>
          </h1>

          {/* Subheading text */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-lg">
            Consult experienced and verified doctors across<br className="hidden sm:inline" />
            multiple specialties, online or at the clinic.
          </p>

          {/* Action Buttons - Side by side in a single horizontal line on desktop, wrapping cleanly on small mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1.5 w-full">
            <button
              type="button"
              onClick={() => onBookAppointment && onBookAppointment(null, 'Clinic Visit')}
              className="w-full sm:w-auto bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 sm:gap-2.5 whitespace-nowrap cursor-pointer active:scale-95 min-h-[48px]"
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onOnlineConsultation && onOnlineConsultation(null, 'Online Consultation')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#007A64] border-2 border-[#007A64] font-extrabold text-sm sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2 sm:gap-2.5 whitespace-nowrap cursor-pointer active:scale-95 min-h-[48px]"
            >
              <Video className="w-5 h-5 shrink-0 text-[#007A64]" />
              <span>Online Consultation</span>
            </button>
          </div>
        </div>

        {/* Right Column: Doctor Image Asset - Prominent, Grounded to bottom border */}
        <div className="flex-1 w-full flex items-end justify-center lg:justify-end relative select-none pointer-events-none self-end z-10 min-w-0">
          <img
            src="/doctor-hero-doctors.jpg"
            alt="ZESTMED Verified Specialist Doctors"
            className="h-[230px] xs:h-[270px] sm:h-[320px] md:h-[360px] lg:h-[390px] xl:h-[430px] 2xl:h-[460px] w-auto max-w-full object-contain object-bottom drop-shadow-md transition-all duration-300"
          />
        </div>

      </div>

    </section>
  );
}
