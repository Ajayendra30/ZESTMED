import React from 'react';
import { 
  Calendar, ArrowRight, Video, Search, Stethoscope, 
  MapPin, ChevronDown 
} from 'lucide-react';

/**
 * DoctorHero - Pixel-accurate Hero Section for Doctor Appointment page
 * Recreated with individual React components, HTML elements, Tailwind CSS, 
 * and standalone doctor image asset (/doctor-hero-doctors.jpg).
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
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/90 shadow-sm min-h-[320px] sm:min-h-[340px] lg:min-h-[360px] bg-gradient-to-r from-[#F8FCFB] via-[#F0FAF7] to-[#E8F6F3] flex items-center">
      
      {/* 1. Raw Individual Doctor Image Asset (/doctor-hero-doctors.jpg) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center">
        <img
          src="/doctor-hero-doctors.jpg"
          alt="ZESTMED Verified Specialist Doctors"
          className="w-full h-full object-cover object-[52%_20%]"
        />
        
        {/* Left gradient overlay: Ensures 100% crisp, contrasty readability for headings & buttons */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(248,252,251,0.98) 0%, rgba(248,252,251,0.95) 32%, rgba(248,252,251,0.70) 44%, rgba(248,252,251,0.08) 54%, rgba(248,252,251,0) 66%)'
          }}
        />

        {/* Right subtle gradient overlay behind find-a-doctor card */}
        <div 
          className="absolute inset-y-0 right-0 w-[42%] pointer-events-none hidden lg:block"
          style={{
            background: 'linear-gradient(270deg, rgba(232,246,243,0.45) 0%, rgba(232,246,243,0.15) 60%, transparent 100%)'
          }}
        />

        {/* Mobile & Tablet backdrop protection */}
        <div className="lg:hidden absolute inset-0 bg-white/85 pointer-events-none" />
      </div>

      {/* 2. Content Grid: Text CTAs (Left), Doctors Center Visual, Find a Doctor Card (Right) */}
      <div className="relative z-10 w-full px-5 sm:px-8 lg:px-10 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Heading, Subtitle & Action Buttons */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-3 sm:space-y-4">
          
          {/* Doctor Appointment Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E0F3ED] text-[#007A64] border border-[#BCE8DD] text-xs font-bold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#007A64]" />
            <span>Doctor Appointment</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[36px] font-black text-[#0F1E36] leading-[1.18] tracking-tight">
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
              className="bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book an Appointment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onOnlineConsultation && onOnlineConsultation(null, 'Online Consultation')}
              className="bg-white hover:bg-slate-50 text-[#007A64] border border-[#007A64] font-bold text-xs sm:text-sm px-4.5 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-2xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Video className="w-4 h-4 text-[#007A64]" />
              <span>Online Consultation</span>
            </button>
          </div>
        </div>

        {/* Spacer for doctors visual in the center */}
        <div className="hidden lg:block lg:col-span-2 xl:col-span-3" />

        {/* Right Column: Floating White "Find a Doctor" Card */}
        <div className="lg:col-span-4 xl:col-span-4 flex justify-end">
          <div className="w-full max-w-[340px] bg-white rounded-[24px] shadow-xl border border-slate-100 p-5 sm:p-6 space-y-3">
            
            {/* Card Title */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-[#007A64]">
                <Search className="w-4 h-4 text-[#007A64] stroke-[2.4]" />
              </div>
              <h3 className="text-lg font-black text-[#0F1E36] tracking-tight">
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
    </section>
  );
}
