import React from 'react';
import { 
  Calendar, ArrowRight, Video, Search, Stethoscope, 
  MapPin, ChevronDown 
} from 'lucide-react';

/**
 * DoctorHero - Pixel-accurate Hero Section for Doctor Appointment page
 * Recreated with individual React components, HTML elements, Tailwind CSS, 
 * and standalone doctor image asset (/doctor-hero-doctors.jpg).
 * 
 * Features:
 * - Edge-to-edge full width layout without outer card box
 * - Left: High-contrast typography & dual CTA buttons
 * - Center: Both female and male doctors 100% visible, fully clear & unwashed
 * - Right: Floating "Find a Doctor" interactive search card
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
    <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-gradient-to-r from-[#EFFBF8] via-[#E2F2F8] to-[#D5EBF8] flex items-center min-h-[340px] sm:min-h-[370px] lg:min-h-[400px]">
      
      {/* 1. Subtle Background Hospital Aura & Ambient Light */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-24 left-[10%] w-[380px] h-[380px] bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-[15%] w-[420px] h-[420px] bg-sky-200/30 rounded-full blur-3xl" />
      </div>

      {/* 2. Main Full-Width Content Container */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
          
          {/* Left Column: Heading, Subtitle & Action Buttons */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3 sm:space-y-4">
            
            {/* Doctor Appointment Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E0F3ED] text-[#007A64] border border-[#BCE8DD] text-xs font-bold shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
              <span>Doctor Appointment</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] xl:text-[36px] font-black text-[#0F1E36] leading-[1.18] tracking-tight">
              Book Doctor Appointment<br />
              <span className="font-extrabold text-[#0F1E36]">with </span>
              <span className="text-[#007A64] font-black">Trusted Specialists</span>
            </h1>

            {/* Subheading text */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
              Consult experienced and verified doctors across<br className="hidden sm:inline" />
              multiple specialties, online or at the clinic.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => onBookAppointment && onBookAppointment(null, 'Clinic Visit')}
                className="bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onOnlineConsultation && onOnlineConsultation(null, 'Online Consultation')}
                className="bg-white hover:bg-slate-50 text-[#007A64] border border-[#007A64] font-bold text-xs sm:text-sm px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Video className="w-4 h-4 text-[#007A64]" />
                <span>Online Consultation</span>
              </button>
            </div>
          </div>

          {/* Center Column: Both Doctors Image (Fully Visible, Unobstructed, Crystal Clear) */}
          <div className="lg:col-span-4 xl:col-span-5 flex items-center justify-center relative overflow-hidden py-2 select-none pointer-events-none">
            <img
              src="/doctor-hero-doctors.jpg"
              alt="ZESTMED Verified Specialist Doctors"
              className="h-[270px] sm:h-[310px] md:h-[340px] lg:h-[360px] xl:h-[390px] w-auto max-w-full object-contain object-bottom drop-shadow-md transition-all duration-300"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)'
              }}
            />
          </div>

          {/* Right Column: Floating White "Find a Doctor" Card */}
          <div className="lg:col-span-3 xl:col-span-3 flex justify-center lg:justify-end">
            <div className="w-full max-w-[340px] bg-white rounded-[24px] shadow-xl border border-slate-100 p-5 space-y-3">
              
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
                  <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs font-semibold hover:border-[#007A64] transition">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Stethoscope className="w-4 h-4 text-[#007A64] shrink-0" />
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs truncate"
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
                  <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs font-semibold hover:border-[#007A64] transition">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MapPin className="w-4 h-4 text-[#007A64] shrink-0" />
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs truncate"
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
                  <div className="flex items-center justify-between w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-slate-700 text-xs font-semibold hover:border-[#007A64] transition">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Calendar className="w-4 h-4 text-[#007A64] shrink-0" />
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-transparent outline-none cursor-pointer text-slate-800 text-xs truncate"
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
                  className="w-full mt-1 bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Search Doctors</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
