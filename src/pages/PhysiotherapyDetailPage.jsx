// src/pages/PhysiotherapyDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, Star, 
  ArrowRight, ArrowLeft, ChevronDown, Award, Users, Heart, 
  Sparkles, Stethoscope, Home, Activity, Check, Share2, HelpCircle 
} from 'lucide-react';
import { getPhysioServiceById, ALL_PHYSIO_SERVICES } from '../mock-data/allPhysioServicesData';
import { useToast } from '../context/ToastContext';

export default function PhysiotherapyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const service = getPhysioServiceById(id);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleBookNow = () => {
    navigate(`/book-physiotherapy/${service.id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${service.title} | ZESTMED Physiotherapy`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16">
      
      {/* 1. BREADCRUMBS & TOP BAR */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium overflow-x-auto">
            <Link to="/" className="hover:text-[#007A64] transition">Home</Link>
            <span>/</span>
            <Link to="/physiotherapy" className="hover:text-[#007A64] transition">Physiotherapy</Link>
            <span>/</span>
            <span className="text-[#0B1E3F] font-bold truncate max-w-[200px] sm:max-w-none">{service.title}</span>
          </nav>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#007A64] rounded-lg hover:bg-slate-50 border border-slate-200 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">

        {/* 2. HERO / MAIN DETAIL BANNER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Comprehensive Service Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title & Badge */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full bg-teal-50 text-[#007A64] border border-[#007A64]/20 text-xs font-black uppercase tracking-wider">
                  {service.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{service.rating} ({service.reviewCount} Reviews)</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-[#007A64]" />
                  <span>{service.duration} Session</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1E3F] tracking-tight leading-tight">
                  {service.title}
                </h1>
                <p className="text-base sm:text-lg text-slate-600 font-semibold mt-2 leading-relaxed">
                  {service.tagline}
                </p>
              </div>

              {/* Service Hero Image */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                <img
                  src={service.image}
                  onError={(e) => { e.currentTarget.src = service.fallback; }}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>In-Clinic &amp; Doorstep Home Visits in Guwahati</span>
                  </div>
                </div>
              </div>

              {/* Service Overview Prose */}
              <div className="space-y-3 pt-2">
                <h2 className="text-lg sm:text-xl font-black text-[#0B1E3F]">About This Therapy</h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {service.fullDesc}
                </p>
              </div>

              {/* Session Types Available */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-[#007A64] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0B1E3F]">In-Clinic Session</h4>
                    <p className="text-xs text-slate-500 font-medium">Equipped rehabilitation center, Guwahati</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#0B1E3F]">At-Home Session</h4>
                    <p className="text-xs text-slate-500 font-medium">Physiotherapist visits your home with portable kit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included / Key Benefits */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1E3F] flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#007A64]" />
                <span>What's Included in Every Session</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {service.keyBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-teal-50/40 border border-teal-100/70">
                    <CheckCircle2 className="w-5 h-5 text-[#007A64] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions Treated */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1E3F] flex items-center gap-2">
                <Activity className="w-6 h-6 text-[#007A64]" />
                <span>Conditions Treated Under This Service</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {service.conditionsTreated.map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-bold bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/80">
                    <div className="w-2 h-2 rounded-full bg-[#007A64] shrink-0" />
                    <span>{cond}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Step Treatment Process */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1E3F]">
                Our Clinical Treatment Process
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.process.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-teal-300 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#007A64] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                        Step {p.step}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-[#0B1E3F]">
                      {p.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Specialist Doctor */}
            {service.expert && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-[#0B1E3F]">
                  Supervised by Senior Clinical Physiotherapists
                </h2>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <img
                    src={service.expert.avatar}
                    alt={service.expert.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border-2 border-white shadow-sm"
                  />
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="inline-block px-2.5 py-0.5 bg-teal-100 text-[#007A64] text-[11px] font-black rounded-md">
                      Verified Clinical Lead
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B1E3F]">
                      {service.expert.name}
                    </h3>
                    <p className="text-xs text-[#007A64] font-bold">
                      {service.expert.degree}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {service.expert.experience} • {service.expert.hospital}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FAQs Accordion */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-[#0B1E3F] flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#007A64]" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-3 pt-2">
                {service.faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full text-left p-4 sm:p-4.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0B1E3F] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#007A64]' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 sm:p-4.5 pt-0 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Card & Pricing */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-6">
              
              {/* Pricing Header */}
              <div className="border-b border-slate-100 pb-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Session Pricing
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black text-[#0B1E3F]">
                    ₹{service.price}
                  </span>
                  <span className="text-base text-slate-400 line-through font-bold">
                    ₹{service.mrp}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                    {service.discount}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Includes full 60-minute evaluation, manual therapy &amp; modalities.
                </p>
              </div>

              {/* Key Features Quick List */}
              <div className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#007A64] shrink-0" />
                  <span>Duration: <strong>60 Minutes Dedicated Care</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#007A64] shrink-0" />
                  <span>Location: <strong>Clinic or Doorstep Home Visit</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#007A64] shrink-0" />
                  <span>Assurance: <strong>Certified &amp; Background-Verified PT</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#007A64] shrink-0" />
                  <span>Recommendation: <strong>{service.recommendedSessions}</strong></span>
                </div>
              </div>

              {/* Book Now Button */}
              <button
                type="button"
                onClick={handleBookNow}
                className="w-full bg-[#007A64] hover:bg-[#006852] text-white font-black text-base py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 group"
              >
                <span>Book Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400 font-medium space-y-1">
                <p>Instant Confirmation • Free Rescheduling</p>
                <p>Pay Online or Post-Session upon Visit</p>
              </div>
            </div>

            {/* Other Services Navigation Widget */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
              <h4 className="text-sm font-black text-[#0B1E3F]">
                Other Physiotherapy Services
              </h4>
              <div className="space-y-1.5">
                {ALL_PHYSIO_SERVICES.filter(s => s.id !== service.id).slice(0, 5).map(s => (
                  <Link
                    key={s.id}
                    to={`/physiotherapy/${s.id}`}
                    className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-700 hover:text-[#007A64] hover:bg-slate-50 transition"
                  >
                    <span className="truncate pr-2">{s.title}</span>
                    <span className="text-[#007A64] shrink-0">₹{s.price} &rarr;</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Bottom Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 z-40 flex items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-xs text-slate-500 font-semibold block">Total Fee</span>
          <span className="text-xl font-black text-[#0B1E3F]">₹{service.price}</span>
        </div>
        <button
          type="button"
          onClick={handleBookNow}
          className="flex-1 bg-[#007A64] text-white font-black text-sm py-3 px-5 rounded-xl shadow-md flex items-center justify-center gap-2"
        >
          <span>Book Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
