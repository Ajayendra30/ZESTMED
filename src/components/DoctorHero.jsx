import React from 'react';
import { 
  Calendar, ArrowRight, Video, Search, Stethoscope, 
  MapPin, ChevronDown 
} from 'lucide-react';

/**
 * DoctorHero - Pixel-accurate Full-Width Hero Section for Doctor Appointment page
 * 
 * Features:
 * - "Find a Doctor" card moved slightly lower, grounded toward bottom to fill space below it
 * - "Book an Appointment" and "Online Consultation" side by side in a single horizontal line
 * - Doctor image prominently sized with 100% visibility and correct aspect ratio
 * - Fully responsive across mobile, tablet, and desktop
 */
export default function DoctorHero({
  selectedSpecialty,
  setSelectedSpecialty,
  selectedLocation,
  setSelectedLocation,
  selectedDate,
  setSelectedDate,
  specialties = [],
  onSearchSubmit,
  onBookAppointment,
  onOnlineConsultation
}) {
  return (
    <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-gradient-to-r from-[#EFFBF8] via-[#E2F2F8] to-[#D5EBF8]">
      
      {/* 1. Subtle Background Hospital Aura & Ambient Light */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-24 left-[10%] w-[380px] h-[380px] bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-[15%] w-[420px] h-[420px] bg-sky-200/30 rounded-full blur-3xl" />
      </div>

      {/* 2. Main Full-Width Content Container - Compact top padding, grounded bottom */}
      <div className="relative z-10 w-full px-3.5 sm:px-6 lg:px-6 xl:px-8 2xl:px-10 pt-2 sm:pt-2.5 lg:pt-3 pb-3 sm:pb-4 lg:pb-0 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-5 lg:gap-3 xl:gap-4">
        
        {/* Left Column: Heading, Subtitle & Action Buttons */}
        <div className="w-full lg:w-[420px] xl:w-[450px] 2xl:w-[480px] shrink-0 space-y-2 sm:space-y-2.5 relative z-20 text-left self-center lg:self-center lg:pb-3 xl:pb-4">
          
          {/* Doctor Appointment Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E0F3ED] text-[#007A64] border border-[#BCE8DD] text-xs font-bold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
            <span>Doctor Appointment</span>
          </div>

          {/* Main Headline - High contrast & fully visible */}
          <h1 className="text-2xl sm:text-3xl lg:text-[25px] xl:text-[29px] 2xl:text-[32px] font-black text-[#0F1E36] leading-[1.18] tracking-tight">
            Book Doctor Appointment<br />
            <span className="font-extrabold text-[#0F1E36]">with </span>
            <span className="text-[#007A64] font-black">Trusted Specialists</span>
          </h1>

          {/* Subheading text */}
          <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed max-w-md">
            Consult experienced and verified doctors across<br className="hidden sm:inline" />
            multiple specialties, online or at the clinic.
          </p>

          {/* Action Buttons - Side by side in a single horizontal line on desktop, wrapping cleanly on small mobile */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onBookAppointment && onBookAppointment(null, 'Clinic Visit')}
              className="bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-xs md:text-[13px] xl:text-sm px-3 sm:px-3.5 xl:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onOnlineConsultation && onOnlineConsultation(null, 'Online Consultation')}
              className="bg-white hover:bg-slate-50 text-[#007A64] border border-[#007A64] font-bold text-xs sm:text-xs md:text-[13px] xl:text-sm px-3 sm:px-3.5 xl:px-4 py-2 sm:py-2.5 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
            >
              <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#007A64]" />
              <span>Online Consultation</span>
            </button>
          </div>
        </div>

        {/* Center Column: Doctor Image Asset - Prominent, Grounded, Filling Space Vertically */}
        <div className="flex-1 w-full flex items-end justify-center relative select-none pointer-events-none self-end z-10 min-w-0">
          <img
            src="/doctor-hero-doctors.jpg"
            alt="ZESTMED Verified Specialist Doctors"
            className="h-[210px] sm:h-[285px] md:h-[315px] lg:h-[325px] xl:h-[355px] 2xl:h-[380px] w-auto max-w-full object-contain object-bottom drop-shadow-md transition-all duration-300"
          />
        </div>

        {/* Right Column: "Find a Doctor" Card - Positioned lower & filling space below */}
        <div className="w-full lg:w-[290px] xl:w-[315px] 2xl:w-[330px] shrink-0 flex justify-center lg:justify-end relative z-20 self-center lg:self-end lg:mb-2.5 xl:mb-3">
          <div className="w-full max-w-[330px] bg-white rounded-[22px] shadow-xl border border-slate-100 p-4 sm:p-4.5 space-y-2.5">
            
            {/* Card Title matching Reference */}
            <div className="flex items-center gap-2 mb-1.5">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#007A64] stroke-[2.5]" />
              <h3 className="text-base sm:text-lg font-black text-[#0F1E36] tracking-tight">
                Find a Doctor
              </h3>
            </div>

            {/* Form Fields */}
            <form onSubmit={onSearchSubmit} className="space-y-2 sm:space-y-2.5">
              
              {/* Field 1: Select Speciality */}
              <div className="relative">
                <div className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-[13px] font-semibold hover:border-[#007A64] transition">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Stethoscope className="w-4 h-4 text-[#007A64] shrink-0" />
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs sm:text-[13px] truncate appearance-none pr-2"
                    >
                      <option value="">Select Speciality</option>
                      {specialties.filter(s => s !== 'All Specialties').map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Select Location */}
              <div className="relative">
                <div className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-[13px] font-semibold hover:border-[#007A64] transition">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MapPin className="w-4 h-4 text-[#007A64] shrink-0" />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs sm:text-[13px] truncate appearance-none pr-2"
                    >
                      <option value="">Select Location</option>
                      <option value="Guwahati - GS Road Hub">Guwahati - GS Road Hub</option>
                      <option value="Dispur Polyclinic">Dispur Polyclinic</option>
                      <option value="Panbazar Medical Hub">Panbazar Medical Hub</option>
                      <option value="Jorhat Center">Jorhat Center</option>
                      <option value="Silpukhuri Polyclinic">Silpukhuri Polyclinic</option>
                      <option value="Ulubari Child & Family Care">Ulubari Child & Family Care</option>
                    </select>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>
              </div>

              {/* Field 3: Preferred Date */}
              <div className="relative">
                <div className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-[13px] font-semibold hover:border-[#007A64] transition">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Calendar className="w-4 h-4 text-[#007A64] shrink-0" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs sm:text-[13px] truncate appearance-none pr-2"
                    >
                      <option value="">Preferred Date</option>
                      <option value="Today">Today ({new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="This Weekend">This Weekend</option>
                      <option value="Next Week">Next Week</option>
                    </select>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-1 bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm py-2 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Search Doctors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>

    </section>
  );
}
