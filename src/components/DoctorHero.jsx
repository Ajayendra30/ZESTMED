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
    <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-gradient-to-r from-[#EFFBF8] via-[#E2F2F8] to-[#D5EBF8] flex items-center min-h-[350px] sm:min-h-[380px] lg:min-h-[430px] xl:min-h-[460px]">
      
      {/* 1. Subtle Background Hospital Aura & Ambient Light */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-24 left-[10%] w-[380px] h-[380px] bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-[15%] w-[420px] h-[420px] bg-sky-200/30 rounded-full blur-3xl" />
      </div>

      {/* 2. Main Full-Width Content Container */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3.5 sm:py-4 lg:py-5 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
        
        {/* Left Column: Heading, Subtitle & Action Buttons */}
        <div className="w-full lg:w-[440px] xl:w-[470px] 2xl:w-[490px] shrink-0 space-y-2.5 sm:space-y-3 relative z-20 text-left">
          
          {/* Doctor Appointment Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E0F3ED] text-[#007A64] border border-[#BCE8DD] text-xs font-bold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
            <span>Doctor Appointment</span>
          </div>

          {/* Main Headline - High contrast & fully visible */}
          <h1 className="text-2xl sm:text-3xl lg:text-[28px] xl:text-[32px] 2xl:text-[35px] font-black text-[#0F1E36] leading-[1.18] tracking-tight">
            Book Doctor Appointment<br />
            <span className="font-extrabold text-[#0F1E36]">with </span>
            <span className="text-[#007A64] font-black">Trusted Specialists</span>
          </h1>

          {/* Subheading text */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
            Consult experienced and verified doctors across<br className="hidden sm:inline" />
            multiple specialties, online or at the clinic.
          </p>

          {/* Action Buttons - Side by side in a single horizontal line */}
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 pt-1 flex-nowrap overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => onBookAppointment && onBookAppointment(null, 'Clinic Visit')}
              className="bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-[13px] md:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onOnlineConsultation && onOnlineConsultation(null, 'Online Consultation')}
              className="bg-white hover:bg-slate-50 text-[#007A64] border border-[#007A64] font-bold text-xs sm:text-[13px] md:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
            >
              <Video className="w-4 h-4 shrink-0 text-[#007A64]" />
              <span>Online Consultation</span>
            </button>
          </div>
        </div>

        {/* Center Column: Doctor Image Asset - Prominent, Grounded, Filling Space */}
        <div className="flex-1 w-full flex items-end justify-center relative select-none pointer-events-none self-end -mb-3 sm:-mb-4 lg:-mb-5 z-10 min-w-0">
          <img
            src="/doctor-hero-doctors.jpg"
            alt="ZESTMED Verified Specialist Doctors"
            className="h-[290px] sm:h-[340px] md:h-[370px] lg:h-[410px] xl:h-[440px] 2xl:h-[460px] w-auto max-w-full object-contain object-bottom drop-shadow-md transition-all duration-300"
          />
        </div>

        {/* Right Column: "Find a Doctor" Card - Positioned lower & filling space below */}
        <div className="w-full lg:w-[330px] xl:w-[350px] shrink-0 flex justify-center lg:justify-end relative z-20 self-center lg:self-end lg:mb-2 xl:mb-3">
          <div className="w-full max-w-[350px] bg-white rounded-[24px] shadow-xl border border-slate-100 p-5 sm:p-5.5 space-y-3">
            
            {/* Card Title */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-[#007A64]">
                <Search className="w-4 h-4 text-[#007A64] stroke-[2.4]" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#0F1E36] tracking-tight">
                Find a Doctor
              </h3>
            </div>

            {/* Form Fields */}
            <form onSubmit={onSearchSubmit} className="space-y-2.5">
              
              {/* Field 1: Select Speciality */}
              <div className="relative">
                <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-sm font-semibold hover:border-[#007A64] transition">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Stethoscope className="w-4 h-4 text-[#007A64] shrink-0" />
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs sm:text-sm truncate"
                    >
                      <option value="">Select Speciality</option>
                      {specialties.filter(s => s !== 'All Specialties').map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Field 2: Select Location */}
              <div className="relative">
                <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-sm font-semibold hover:border-[#007A64] transition">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MapPin className="w-4 h-4 text-[#007A64] shrink-0" />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs sm:text-sm truncate"
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
                </div>
              </div>

              {/* Field 3: Preferred Date */}
              <div className="relative">
                <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs sm:text-sm font-semibold hover:border-[#007A64] transition">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Calendar className="w-4 h-4 text-[#007A64] shrink-0" />
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs sm:text-sm truncate"
                    >
                      <option value="">Preferred Date</option>
                      <option value="Today">Today ({new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="This Weekend">This Weekend</option>
                      <option value="Next Week">Next Week</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-1.5 bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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
