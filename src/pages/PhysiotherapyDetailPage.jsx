// src/pages/PhysiotherapyDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, Star, 
  ArrowRight, ArrowLeft, ChevronDown, Award, Users, Heart, 
  Sparkles, Stethoscope, Home, Activity, Check, Share2, HelpCircle,
  ClipboardList, CreditCard
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

  const handleProceedToBooking = () => {
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 select-none">
      
      {/* 1. BREADCRUMBS & TOP BAR - Full Width Edge to Edge */}
      <div className="bg-white border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 sticky top-16 z-20 shadow-2xs">
        <div className="w-full flex items-center justify-between">
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

      {/* 2. MAIN TWO-COLUMN LAYOUT - Full Width Responsive Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start">
          
          {/* Left Column: Complete Details Card */}
          <div className="lg:col-span-8 xl:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 border border-slate-200/90 shadow-2xs space-y-7 sm:space-y-8">
            
            {/* Header with Activity Icon & Title */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-[#E0F3ED] text-[#007A64] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-[#007A64]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
                  {service.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {service.tagline}
                </p>
              </div>
            </div>

            {/* Service Featured Image - Full Size & Entirely Visible Without Cropping */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-sm">
              {/* Ambient soft background to fill letterboxing smoothly */}
              <img
                src={service.image}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none"
              />
              
              {/* Main Image - Fully visible, uncropped, maximized size */}
              <div className="relative z-10 w-full flex items-center justify-center min-h-[360px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px] xl:min-h-[600px] py-2 sm:py-3">
                <img
                  src={service.image}
                  onError={(e) => { e.currentTarget.src = service.fallback; }}
                  alt={service.title}
                  className="w-full h-auto max-h-[580px] lg:max-h-[640px] object-contain mx-auto"
                />
              </div>

              {/* Badges Overlay */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent pt-12 pb-3.5 px-3.5 sm:px-5 flex items-center justify-between text-white pointer-events-none">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>In-Clinic &amp; Doorstep Home Visits in Guwahati</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black bg-amber-400 text-slate-900 px-3 py-1.5 rounded-xl shadow-xs">
                  <Star className="w-4 h-4 fill-slate-900" />
                  <span>{service.rating} ({service.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Clinical Overview */}
            <div className="space-y-2.5">
              <h2 className="text-base sm:text-xl font-black text-[#0F172A]">
                About This Therapy
              </h2>
              <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
                {service.fullDesc}
              </p>
            </div>

            {/* Available Session Modes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#E0F3ED]/50 border border-[#BCE8DD]">
                <div className="w-10 h-10 rounded-xl bg-[#E0F3ED] text-[#007A64] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#0F172A]">In-Clinic Session</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Fully equipped rehabilitation center in Guwahati</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#E0F3ED]/50 border border-[#BCE8DD]">
                <div className="w-10 h-10 rounded-xl bg-[#E0F3ED] text-[#007A64] flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#0F172A]">At-Home Session</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Physiotherapist visits your home with portable therapy equipment</p>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-xl font-black text-[#0F172A] flex items-center gap-2">
                <ShieldCheck className="w-5 sm:w-6 h-5 sm:h-6 text-[#007A64]" />
                <span>What's Included in Every Session</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.keyBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#007A64] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions Treated */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-xl font-black text-[#0F172A]">
                Conditions Treated Under This Service
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.conditionsTreated.map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-[#E0F3ED]/40 px-4 py-3 rounded-xl border border-[#BCE8DD]">
                    <div className="w-2 h-2 rounded-full bg-[#007A64] shrink-0" />
                    <span>{cond}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Step Treatment Process */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-xl font-black text-[#0F172A]">
                Our 4-Step Clinical Treatment Process
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {service.process.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#007A64] transition space-y-1.5">
                    <span className="text-[10px] sm:text-xs font-black text-[#007A64] bg-[#E0F3ED] px-2.5 py-0.5 rounded border border-[#BCE8DD]">
                      Step {p.step}
                    </span>
                    <h4 className="text-xs sm:text-sm md:text-base font-black text-[#0F172A]">
                      {p.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Specialist Doctor */}
            {service.expert && (
              <div className="space-y-3 pt-2">
                <h2 className="text-base sm:text-xl font-black text-[#0F172A]">
                  Supervised by Senior Clinical Lead
                </h2>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <img
                    src={service.expert.avatar}
                    alt={service.expert.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white shadow-2xs"
                  />
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-black text-[#0F172A]">
                      {service.expert.name}
                    </h3>
                    <p className="text-xs text-[#007A64] font-bold">
                      {service.expert.degree}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      {service.expert.experience} • {service.expert.hospital}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Frequently Asked Questions */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-xl font-black text-[#0F172A] flex items-center gap-2">
                <HelpCircle className="w-5 sm:w-6 h-5 sm:h-6 text-[#007A64]" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-2.5">
                {service.faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden transition-all">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full text-left p-4 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#0F172A] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#007A64]' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Service & Booking Summary Card (ZESTMED Emerald Primary Theme) */}
          <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5 sticky top-28">
            
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <ClipboardList className="w-5 h-5 text-[#007A64]" />
              <h3 className="text-lg sm:text-xl font-black text-[#0F172A]">
                Booking Summary
              </h3>
            </div>

            {/* Service Preview Card */}
            <div className="flex items-start gap-3.5">
              <img
                src={service.image}
                onError={(e) => { e.currentTarget.src = service.fallback; }}
                alt={service.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
              />
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm sm:text-base font-black text-[#0F172A] leading-snug truncate">
                  {service.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#007A64] shrink-0" />
                  <span>In-Clinic &amp; At-Home Session</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#007A64] shrink-0" />
                  <span>{service.duration} Dedicated Care</span>
                </div>
              </div>
            </div>

            {/* Divider & Price Breakdown */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
                <span>Session Fee</span>
                <span className="font-bold text-slate-900">₹{service.price.toLocaleString('en-IN')}</span>
              </div>

              {/* Highlighted Total Box - ZESTMED Primary Emerald */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-[#E0F3ED]/70 text-slate-900 border border-[#BCE8DD]">
                <span className="text-sm font-bold">Total Payable</span>
                <span className="text-lg sm:text-xl font-black text-[#007A64]">
                  ₹{service.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Separate Book Button & Back Button - ZESTMED Primary Theme */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleProceedToBooking}
                className="w-full bg-[#007A64] hover:bg-[#006852] text-white font-bold text-sm sm:text-base py-3.5 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>Book</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/physiotherapy')}
                className="w-full bg-white hover:bg-emerald-50/50 text-[#007A64] border-2 border-[#007A64] font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Physiotherapy</span>
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 font-medium space-y-0.5">
              <p>Instant Confirmation • Certified Physiotherapists</p>
              <p>Pay Online or Post-Session upon Visit</p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
