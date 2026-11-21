import React from 'react';
import { Calendar, ArrowRight, Video } from 'lucide-react';

/**
 * DoctorHero - Full-Width Edge-to-Edge Hero Section for Doctor Appointment page
 * 
 * Features:
 * - High-contrast typography & action buttons over the hospital corridor background
 * - "Book an Appointment" and "Online Consultation" side by side in a single horizontal line
 * - Grounded high-resolution transparent doctor cutout image on the right
 * - Perfectly fills the hero space without empty gaps on the left side
 * - Fully responsive across mobile, tablet, and desktop
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
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/40 sm:from-white/92 sm:via-white/82 sm:to-white/35 lg:from-white/95 lg:via-white/85 lg:to-white/30 backdrop-blur-[0.5px]" />
      </div>

      {/* 2. Main Content Container - Seamless edge-to-edge layout with ample height */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-5 sm:pt-6 lg:pt-8 pb-5 sm:pb-6 lg:pb-0 min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] xl:min-h-[550px] 2xl:min-h-[600px] flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-8 xl:gap-12">
        
        {/* Left Column: Heading, Subtitle & Action Buttons */}
        <div className="w-full lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl shrink-0 space-y-3.5 sm:space-y-4 relative z-20 text-left self-center lg:self-center py-2 lg:py-8">
          
          {/* Doctor Appointment Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#E0F3ED] text-[#007A64] border border-[#BCE8DD] text-xs sm:text-sm font-extrabold shadow-2xs">
            <Calendar className="w-4 h-4 text-[#007A64]" />
            <span>Doctor Appointment</span>
          </div>

          {/* Main Headline - High contrast & fully visible */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[44px] 2xl:text-[48px] font-black text-[#0F1E36] leading-[1.18] tracking-tight">
            Book Doctor Appointment<br />
            <span className="font-extrabold text-[#0F1E36]">with </span>
            <span className="text-[#007A64] font-black">Trusted Specialists</span>
          </h1>

          {/* Subheading text */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
            Consult experienced and verified doctors across multiple specialties, online or at the clinic.
          </p>

          {/* Action Buttons - Side by side in a single horizontal line on desktop, wrapping cleanly on small mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
            <button
              type="button"
              onClick={() => onBookAppointment && onBookAppointment(null, 'Clinic Visit')}
              className="w-full sm:w-auto bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 sm:gap-2.5 whitespace-nowrap cursor-pointer active:scale-95 min-h-[48px]"
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onOnlineConsultation && onOnlineConsultation(null, 'Online Consultation')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#007A64] border-2 border-[#007A64] font-extrabold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2 sm:gap-2.5 whitespace-nowrap cursor-pointer active:scale-95 min-h-[48px]"
            >
              <Video className="w-5 h-5 shrink-0 text-[#007A64]" />
              <span>Online Consultation</span>
            </button>
          </div>
        </div>

        {/* Right Column: Doctors Image - Increased size to fill space beautifully, fully visible without cropping */}
        <div className="flex-1 w-full flex items-end justify-center lg:justify-end relative select-none pointer-events-none self-end z-10 min-w-0">
          <img
            src="/doctor-hero-doctors.png"
            alt="ZESTMED Verified Specialist Doctors"
            className="h-[270px] xs:h-[320px] sm:h-[380px] md:h-[440px] lg:h-[490px] xl:h-[545px] 2xl:h-[595px] w-auto max-w-full object-contain object-bottom drop-shadow-md transition-all duration-300"
          />
        </div>

      </div>

    </section>
  );
}
