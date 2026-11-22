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
    <div className="min-h-screen bg-[#F0F5FD]/60 font-sans pb-20 select-none">
      
      {/* 1. BREADCRUMBS & TOP BAR */}
      <div className="bg-white border-b border-slate-200/80 py-4 px-4 sm:px-6 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      {/* 2. MAIN TWO-COLUMN LAYOUT (Similar to the second reference image) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Complete Details Card */}
          <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-blue-100/90 shadow-2xs space-y-7">
            
            {/* Header with Activity Icon & Title */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E60D5] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  {service.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {service.tagline}
                </p>
              </div>
            </div>

            {/* Service Featured Image */}
            <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
              <img
                src={service.image}
                onError={(e) => { e.currentTarget.src = service.fallback; }}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 text-xs font-bold bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>In-Clinic &amp; Doorstep Home Visits in Guwahati</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black bg-amber-400/90 text-slate-900 px-2.5 py-1 rounded-xl">
                  <Star className="w-3.5 h-3.5 fill-slate-900" />
                  <span>{service.rating} ({service.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Clinical Overview */}
            <div className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                About This Therapy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {service.fullDesc}
              </p>
            </div>

            {/* Available Session Modes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/80">
                <div className="w-9 h-9 rounded-lg bg-blue-100/80 text-[#1E60D5] flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0F172A]">In-Clinic Session</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Fully equipped rehabilitation center in Guwahati</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                  <Home className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0F172A]">At-Home Session</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Physiotherapist visits your home with portable therapy equipment</p>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#007A64]" />
                <span>What's Included in Every Session</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.keyBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <CheckCircle2 className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-slate-700 leading-snug">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions Treated */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                Conditions Treated Under This Service
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.conditionsTreated.map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-blue-50/40 px-3.5 py-2.5 rounded-xl border border-blue-100/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1E60D5] shrink-0" />
                    <span>{cond}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Step Treatment Process */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                Our 4-Step Clinical Treatment Process
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.process.map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#1E60D5] transition space-y-1.5">
                    <span className="text-[10px] font-black text-[#1E60D5] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Step {p.step}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-[#0F172A]">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Specialist Doctor */}
            {service.expert && (
              <div className="space-y-3 pt-2">
                <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                  Supervised by Senior Clinical Lead
                </h2>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
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
                    <p className="text-[11px] text-slate-500 font-medium">
                      {service.expert.experience} • {service.expert.hospital}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Frequently Asked Questions */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#1E60D5]" />
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
                        className="w-full text-left p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#0F172A] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#1E60D5]' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-3.5 pt-0 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Service & Booking Summary Card (Exact layout of 2nd reference image) */}
          <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-blue-100/90 shadow-2xs space-y-5 sticky top-28">
            
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <ClipboardList className="w-5 h-5 text-[#1E60D5]" />
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
                  <MapPin className="w-3.5 h-3.5 text-[#1E60D5] shrink-0" />
                  <span>In-Clinic &amp; At-Home Session</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#1E60D5] shrink-0" />
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

              {/* Highlighted Total Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 text-slate-900 border border-blue-100">
                <span className="text-sm font-bold">Total Payable</span>
                <span className="text-lg font-black text-[#1E60D5]">
                  ₹{service.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Separate Book Button & Back Button */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleProceedToBooking}
                className="w-full bg-[#1E60D5] hover:bg-[#1850B5] text-white font-bold text-sm sm:text-base py-3.5 rounded-xl shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>Book</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/physiotherapy')}
                className="w-full bg-white hover:bg-slate-50 text-[#1E60D5] border-2 border-[#1E60D5] font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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
