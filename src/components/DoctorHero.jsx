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
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-3 sm:pt-3.5 lg:pt-4 pb-4 sm:pb-5 lg:pb-0 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-4 xl:gap-6">
        
        {/* Left Column: Heading, Subtitle & Action Buttons */}
        <div className="w-full lg:w-[440px] xl:w-[470px] 2xl:w-[500px] shrink-0 space-y-3 sm:space-y-3.5 relative z-20 text-left self-center lg:self-center lg:pb-3 xl:pb-4">
          
          {/* Doctor Appointment Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#E0F3ED] text-[#007A64] border border-[#BCE8DD] text-xs sm:text-sm font-extrabold shadow-2xs">
            <Calendar className="w-4 h-4 text-[#007A64]" />
            <span>Doctor Appointment</span>
          </div>

          {/* Main Headline - High contrast & fully visible */}
          <h1 className="text-2xl sm:text-3xl lg:text-[28px] xl:text-[32px] 2xl:text-[35px] font-black text-[#0F1E36] leading-[1.18] tracking-tight">
            Book Doctor Appointment<br />
            <span className="font-extrabold text-[#0F1E36]">with </span>
            <span className="text-[#007A64] font-black">Trusted Specialists</span>
          </h1>

          {/* Subheading text */}
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-md">
            Consult experienced and verified doctors across<br className="hidden sm:inline" />
            multiple specialties, online or at the clinic.
          </p>

          {/* Action Buttons - Side by side in a single horizontal line on desktop, wrapping cleanly on small mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1.5 w-full">
            <button
              type="button"
              onClick={() => onBookAppointment && onBookAppointment(null, 'Clinic Visit')}
              className="w-full sm:w-auto bg-[#007A64] hover:bg-[#006852] text-white font-extrabold text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 sm:gap-2.5 whitespace-nowrap cursor-pointer active:scale-95 min-h-[48px]"
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onOnlineConsultation && onOnlineConsultation(null, 'Online Consultation')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#007A64] border-2 border-[#007A64] font-extrabold text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2 sm:gap-2.5 whitespace-nowrap cursor-pointer active:scale-95 min-h-[48px]"
            >
              <Video className="w-5 h-5 shrink-0 text-[#007A64]" />
              <span>Online Consultation</span>
            </button>
          </div>
        </div>

        {/* Center Column: Doctor Image Asset - Prominent, Grounded, Filling Space Vertically */}
        <div className="flex-1 w-full flex items-end justify-center relative select-none pointer-events-none self-end z-10 min-w-0">
          <img
            src="/doctor-hero-doctors.jpg"
            alt="ZESTMED Verified Specialist Doctors"
            className="h-[210px] xs:h-[250px] sm:h-[300px] md:h-[330px] lg:h-[345px] xl:h-[375px] 2xl:h-[400px] w-auto max-w-full object-contain object-bottom drop-shadow-md transition-all duration-300"
          />
        </div>

        {/* Right Column: "Find a Doctor" Card - Positioned lower & filling space below */}
        <div className="w-full lg:w-[320px] xl:w-[350px] 2xl:w-[370px] shrink-0 flex justify-center lg:justify-end relative z-20 self-center lg:self-end lg:mb-2.5 xl:mb-3">
          <div className="w-full max-w-full sm:max-w-[370px] bg-white rounded-3xl shadow-xl border border-slate-100 p-4 sm:p-5.5 space-y-3">
            
            {/* Card Title matching Reference */}
            <div className="flex items-center gap-2.5 mb-2">
              <Search className="w-5 h-5 text-[#007A64] stroke-[2.5]" />
              <h3 className="text-lg sm:text-xl font-black text-[#0F1E36] tracking-tight">
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
