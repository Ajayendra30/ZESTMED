import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, ArrowRight, Phone, User, Clock, Activity, 
  ShieldCheck, CheckCircle2, ChevronRight, Star, Heart,
  Award, Sparkles, FileText, Target, Home as HomeIcon,
  Stethoscope, Users, X, CreditCard, Banknote, Lock, ClipboardList,
  Brain, Wind, Baby, HeartHandshake, Flame, Dumbbell
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// =========================================================================
// Custom Medical Vector Icons matching Reference Design
// =========================================================================

function SpineIcon({ className = "w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2v20" />
      <path d="M8 5.5h8" />
      <path d="M7 9h10" />
      <path d="M6.5 12.5h11" />
      <path d="M7 16h10" />
      <path d="M8 19.5h8" />
      <rect x="10.5" y="4.5" width="3" height="2" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="8" width="3" height="2" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="11.5" width="3" height="2" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="15" width="3" height="2" rx="0.5" fill="currentColor" />
      <rect x="10.5" y="18.5" width="3" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function NeckIcon({ className = "w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="6" r="3.2" />
      <path d="M10 9.5v2.2c0 .6-.4 1.1-.9 1.3L4.5 15.5c-.9.4-1.5 1.3-1.5 2.3v3.2" />
      <path d="M14 9.5v2.2c0 .6.4 1.1.9 1.3l4.6 2.5c.9.4 1.5 1.3 1.5 2.3v3.2" />
      <path d="M9.5 13.5c1.5 1 3.5 1 5 0" />
    </svg>
  );
}

function KneeJointIcon({ className = "w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Upper Femur bone */}
      <path d="M10 2v5.5c0 1.2-1.2 2-2 2.8-.8.8-1 1.7-.5 2.2h9c.5-.5.3-1.4-.5-2.2-.8-.8-2-1.6-2-2.8V2" />
      {/* Patella Kneecap */}
      <circle cx="12" cy="12" r="2.2" />
      {/* Lower Tibia bone */}
      <path d="M7.5 12.5c-.5.5-.3 1.4.5 2.2.8.8 2 1.6 2 2.8V22h4v-4.5c0-1.2 1.2-2 2-2.8.8-.8 1-1.7.5-2.2" />
    </svg>
  );
}

function ShoulderIcon({ className = "w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="14.5" cy="5.5" r="2.8" />
      <path d="M12.5 8.5c-1 .8-2.2 1.3-3.8 1.3-2 0-3.4 1.1-4 2.8l-1.2 7.4" />
      <path d="M16.5 8.5c1 .8 2.2 1.3 3.8 1.3 1.8 0 2.8 1 3.2 2.6l.5 7.6" />
      {/* 3 radiating pain lines on left shoulder */}
      <path d="M4 5.5l2 2" />
      <path d="M1.5 9h3" />
      <path d="M3 13l2.5-1.5" />
    </svg>
  );
}

function SportsInjuryIcon({ className = "w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="16.5" cy="4" r="2" />
      <path d="M15 6.8l-3.2 3.8-3.6-.8-3.2 2" />
      <path d="M13.2 8.5l2.8 2 4.2-.8" />
      <path d="M11.8 10.6l-2.2 5.2 4.2 4.2" />
      <path d="M13.8 12.8l3 3.2 4.2-2" />
    </svg>
  );
}

function PostSurgeryIcon({ className = "w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="8" y="2.5" width="8" height="4" rx="2" />
      <rect x="7.5" y="7.5" width="9" height="4" rx="2" />
      <rect x="7" y="12.5" width="10" height="4" rx="2" />
      <rect x="7.5" y="17.5" width="9" height="4" rx="2" />
    </svg>
  );
}

function ElderlyCareIcon({ className = "w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="5" r="2.2" />
      <path d="M10 7.5c-2 2-3 5-3 8 0 2 1 3.5 1.5 5.5" />
      <path d="M8.5 15.5l3 5.5" />
      <path d="M8 11.5c1.5 1 3.5 2 6 2" />
      <path d="M15 11c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v10" />
    </svg>
  );
}

function PostureIcon({ className = "w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="5.5" r="3" />
      <path d="M12 8.5v12.5" />
      <path d="M8.5 9.8c-2.5.5-4 2-5 5l-1 5.2" />
      <path d="M15.5 9.8c2.5.5 4 2 5 5l1 5.2" />
      <path d="M7 14h10" />
    </svg>
  );
}

// 12 Comprehensive Physiotherapy Services data with fallback images
const PHYSIO_SERVICES = [
  {
    id: 'back-neck',
    title: 'Back & Neck Pain Therapy',
    desc: 'Targeted relief from chronic cervical, lumbar, and posture-related pain.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-back.jpg',
    icon: SpineIcon,
  },
  {
    id: 'joint-pain',
    title: 'Joint Pain & Arthritis Care',
    desc: 'Specialized therapy for knee osteoarthritis, hip stiffness, and joint mobility.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-joint.jpg',
    icon: KneeJointIcon,
  },
  {
    id: 'sports-injury',
    title: 'Sports Injury Rehabilitation',
    desc: 'Rapid recovery from ligament sprains, muscle tears, and athletic conditioning.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-sports.jpg',
    icon: SportsInjuryIcon,
  },
  {
    id: 'post-surgery',
    title: 'Post-Surgery Rehabilitation',
    desc: 'Structured recovery for joint replacements, spine surgeries, and fractures.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-surgery.jpg',
    icon: PostSurgeryIcon,
  },
  {
    id: 'elderly-care',
    title: 'Elderly Care & Fall Prevention',
    desc: 'Gentle mobility exercises, gait retraining, and balance support for seniors.',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-elderly.jpg',
    icon: ElderlyCareIcon,
  },
  {
    id: 'posture-correction',
    title: 'Posture & Ergonomic Correction',
    desc: 'Correction of rounded shoulders, tech-neck, and desk-related strain.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-posture.jpg',
    icon: PostureIcon,
  },
  {
    id: 'neuro-rehab',
    title: 'Neurological Rehabilitation',
    desc: 'Neuro-physiotherapy for stroke recovery, Parkinson’s, paralysis, and neuropathy.',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-surgery.jpg',
    icon: Brain,
  },
  {
    id: 'cardiopulmonary',
    title: 'Cardiopulmonary & Chest Therapy',
    desc: 'Breathing exercises, endurance recovery, and lung capacity improvement.',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-back.jpg',
    icon: Wind,
  },
  {
    id: 'pediatric',
    title: 'Pediatric Physiotherapy',
    desc: 'Developmental milestone therapy for children, posture, and motor coordination.',
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-sports.jpg',
    icon: Baby,
  },
  {
    id: 'womens-health',
    title: 'Women’s Health & Prenatal Care',
    desc: 'Pelvic floor conditioning, prenatal back pain relief, and postpartum recovery.',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-elderly.jpg',
    icon: HeartHandshake,
  },
  {
    id: 'dry-needling',
    title: 'Myofascial Trigger Point Therapy',
    desc: 'Deep tissue therapy, cupping, and dry needling for stubborn muscular knots.',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-joint.jpg',
    icon: Flame,
  },
  {
    id: 'strength-conditioning',
    title: 'Strength & Functional Conditioning',
    desc: 'Therapeutic resistance training to restore muscle mass, core, and stamina.',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    fallback: '/physio-service-posture.jpg',
    icon: Dumbbell,
  },
];

// 12 Conditions data matching Comprehensive Physiotherapy Scope
const CONDITIONS_LIST = [
  { id: 'c1', name: 'Back Pain', lines: ['Back Pain'], icon: SpineIcon },
  { id: 'c2', name: 'Neck Pain', lines: ['Neck Pain'], icon: NeckIcon },
  { id: 'c3', name: 'Knee Pain', lines: ['Knee Pain'], icon: KneeJointIcon },
  { id: 'c4', name: 'Shoulder Pain', lines: ['Shoulder Pain'], icon: ShoulderIcon },
  { id: 'c5', name: 'Sports Injuries', lines: ['Sports Injuries'], icon: SportsInjuryIcon },
  { id: 'c6', name: 'Post-Surgery Recovery', lines: ['Post-Surgery', 'Recovery'], icon: PostSurgeryIcon },
  { id: 'c7', name: 'Age-Related Mobility Issues', lines: ['Age-Related', 'Mobility Issues'], icon: ElderlyCareIcon },
  { id: 'c8', name: 'Posture Problems', lines: ['Posture', 'Problems'], icon: PostureIcon },
  { id: 'c9', name: 'Stroke & Paralysis', lines: ['Stroke &', 'Paralysis'], icon: Brain },
  { id: 'c10', name: 'Sciatica & Slip Disc', lines: ['Sciatica &', 'Slip Disc'], icon: SpineIcon },
  { id: 'c11', name: 'Arthritis & Spondylitis', lines: ['Arthritis &', 'Spondylitis'], icon: KneeJointIcon },
  { id: 'c12', name: 'Muscle Spasms & Strains', lines: ['Muscle Spasms', '& Strains'], icon: Flame },
];

export default function PhysiotherapyPage() {
  const { addToast } = useToast();
  const { user, openAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToServices = () => {
    const el = document.getElementById('physio-services-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBookSession = (serviceTitle = '') => {
    const text = encodeURIComponent(
      `Hi Zestmed, I would like to book a Physiotherapy session${serviceTitle ? ` for ${serviceTitle}` : ''}. Please provide available slots and details.`
    );
    window.open(`https://wa.me/919279125091?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER - Full-Width Edge to Edge (Exact Crisp Background & Cutout)  */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden w-full border-b border-slate-200/80 bg-[#E2F4F8] min-h-[360px] sm:min-h-[390px] lg:min-h-[420px] xl:min-h-[450px] flex items-stretch">
        
        {/* Full-Width Background Image with Smooth, Subtle Ambient Light Aura */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <img
            src="/physio-hero-bg.jpg"
            alt="ZESTMED Physiotherapy Clinic Background"
            className="w-full h-full object-cover object-[right_bottom]"
          />
          {/* Smooth, subtle ambient blur effects matching medical theme without blurring the imagery */}
          <div className="absolute -top-24 left-[10%] w-[380px] h-[380px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-[15%] w-[420px] h-[420px] bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />
          {/* Subtle soft gradient on the left behind text for enhanced readability and natural visual depth */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[50%] lg:w-[44%] bg-gradient-to-r from-[#E2F4F8]/75 via-[#E2F4F8]/35 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-8 pt-8 sm:pt-10 lg:pt-6 pb-0">
          
          {/* Left Column: Heading, Subtitle & Action Buttons */}
          <div className="w-full lg:w-[480px] xl:w-[520px] 2xl:w-[560px] shrink-0 space-y-4 sm:space-y-4.5 self-center py-4 lg:py-8 z-20">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#E6F7F2] text-[#007A64] border border-[#BCE8DD] text-xs sm:text-sm font-extrabold shadow-2xs">
              <Activity className="w-4 h-4 text-[#007A64]" />
              <span>Physiotherapy & Rehabilitation</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-black text-[#0F172A] leading-[1.26] tracking-tight">
              Expert Physiotherapy<br />
              Care for a <span className="text-[#007A64]">Healthier,</span><br />
              <span className="text-[#007A64]">More Active Life</span>
            </h1>

            {/* Subheading text */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg">
              Personalized physiotherapy treatment for pain relief, injury recovery and overall mobility improvement.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2 w-full">
              <button
                type="button"
                onClick={scrollToServices}
                className="w-full sm:w-auto bg-[#007A64] hover:bg-[#006852] text-white font-black text-sm sm:text-base px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2.5 group cursor-pointer active:scale-95 min-h-[48px]"
              >
                <Calendar className="w-5 h-5" />
                <span>Book a Session</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleBookSession('Physiotherapy Consultation')}
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#0F172A] border-2 border-slate-300 font-black text-sm sm:text-base px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 min-h-[48px]"
              >
                <Stethoscope className="w-5 h-5 text-[#007A64]" />
                <span>Consult a Physiotherapist</span>
              </button>
            </div>
          </div>

          {/* Right Column: Transparent Cutout of Physiotherapist & Patient placed prominently on the right */}
          <div className="w-full lg:flex-1 flex justify-center lg:justify-end xl:justify-end items-end self-end pointer-events-none select-none z-20 mt-3 lg:mt-0 -mb-[1px]">
            <img
              src="/physio-hero-therapist.png"
              alt="Physiotherapist treating patient"
              className="h-[230px] xs:h-[270px] sm:h-[340px] md:h-[380px] lg:h-[410px] xl:h-[450px] 2xl:h-[480px] w-auto max-w-full object-contain object-bottom drop-shadow-md select-none"
            />
          </div>

          {/* Right spacer for 2xl / ultra-wide screens to keep clinic table and spine shelf visible on right */}
          <div className="hidden 2xl:block w-[60px] shrink-0 pointer-events-none" />

        </div>
      </section>

      {/* Main Container matching Zestmed Standard for remaining sections */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-5 sm:pt-6 pb-4 sm:pb-6 space-y-8 sm:space-y-10">

        {/* ========================================================================= */}
        {/* 2. FEATURE HIGHLIGHTS (4 Items Bar matching Reference Image)              */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs py-5 sm:py-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 first:pt-0 sm:first:pl-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <User className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">Certified Physiotherapists</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Experienced & qualified professionals</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <HomeIcon className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">Personalized Treatment Plans</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Care tailored to your needs</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <ShieldCheck className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">Pain Relief & Recovery</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Evidence-based therapy for faster healing</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4 pt-2 sm:pt-0 pl-1 sm:pl-3">
              <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                <Activity className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">Better Mobility & Strength</p>
                <p className="text-xs sm:text-[13px] text-slate-500 font-semibold mt-0.5">Improve movement, posture and daily life</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. OUR PHYSIOTHERAPY SERVICES (12 Cards in Balanced Grid)                 */}
        {/* ========================================================================= */}
        <section id="physio-services-section" className="space-y-6">
          
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Our Physiotherapy Services
              </h2>
              <div className="w-12 h-1 bg-[#007A64] rounded-full mt-2" />
            </div>
            <button
              type="button"
              onClick={scrollToServices}
              className="text-[#007A64] hover:text-[#005c4b] font-extrabold text-sm sm:text-base flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* 6 Cards Grid in 3 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {PHYSIO_SERVICES.map((srv) => {
              const IconComp = srv.icon;

              return (
                <div
                  key={srv.id}
                  onClick={() => navigate(`/physiotherapy/${srv.id}`)}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group select-none"
                >
                  <div>
                    {/* Image Thumbnail with Floating Badge */}
                    <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={srv.image}
                        onError={(e) => { e.currentTarget.src = srv.fallback; }}
                        alt={srv.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Circular Icon Overlay */}
                      <div className="absolute bottom-2.5 left-2.5 w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-white text-[#007A64] shadow-md flex items-center justify-center border border-teal-100">
                        <IconComp className="w-5 sm:w-5.5 h-5 sm:h-5.5 text-[#007A64]" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <h3 className="text-base sm:text-lg font-black text-[#0F172A] mt-3.5 group-hover:text-[#007A64] transition-colors leading-snug">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                      {srv.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/physiotherapy/${srv.id}`);
                    }}
                    className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-black text-[#007A64] w-full text-left cursor-pointer group-hover:text-[#005c4b] transition-colors"
                  >
                    <span>View Details and book</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 4. WHY CHOOSE ZESTMED FOR PHYSIOTHERAPY? (5 Cards)                        */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Why Choose ZESTMED for Physiotherapy?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4.5">
            
            {/* 1. Expert & Certified Team */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[140px] sm:min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <Award className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div className="mt-auto">
                <h4 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-[#0F172A] leading-tight whitespace-nowrap">Expert &amp; Certified Team</h4>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">Trained and experienced physiotherapists</p>
              </div>
            </div>

            {/* 2. Personalized Care */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[140px] sm:min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <FileText className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div className="mt-auto">
                <h4 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-[#0F172A] leading-tight whitespace-nowrap">Personalized Care</h4>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">Condition-specific treatment plans</p>
              </div>
            </div>

            {/* 3. Evidence-Based Approach */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[140px] sm:min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <Target className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div className="mt-auto">
                <h4 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-[#0F172A] leading-tight whitespace-nowrap">Evidence-Based Approach</h4>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">Proven, safe &amp; effective therapy methods</p>
              </div>
            </div>

            {/* 4. Modern Equipment */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[140px] sm:min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div className="mt-auto">
                <h4 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-[#0F172A] leading-tight whitespace-nowrap">Modern Equipment</h4>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">Advanced tools for effective rehabilitation</p>
              </div>
            </div>

            {/* 5. Holistic Recovery */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 lg:p-3.5 xl:p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-teal-300 transition-all group min-h-[140px] sm:min-h-[145px]">
              <div className="w-12 h-12 flex items-center justify-start mb-3 text-[#007A64] group-hover:scale-105 transition-transform">
                <Heart className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
              </div>
              <div className="mt-auto">
                <h4 className="text-sm sm:text-base lg:text-[13px] xl:text-[15px] 2xl:text-base font-black text-[#0F172A] leading-tight whitespace-nowrap">Holistic Recovery</h4>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug min-h-[36px] sm:min-h-[38px]">Pain relief, mobility &amp; long-term wellness</p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CONDITIONS WE TREAT (8 Cards in One Row)                              */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Conditions We Treat
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
            {CONDITIONS_LIST.map((cond) => {
              const IconComp = cond.icon;
              return (
                <div
                  key={cond.id}
                  onClick={() => {
                    const match = PHYSIO_SERVICES.find(s => s.title.toLowerCase().includes(cond.name.toLowerCase().split(' ')[0])) || PHYSIO_SERVICES[0];
                    navigate(`/physiotherapy/${match.id}`);
                  }}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-md hover:border-teal-300 hover:scale-102 transition-all cursor-pointer group min-h-[110px] sm:min-h-[120px] select-none"
                >
                  <div className="h-10 w-10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-[#007A64]">
                    <IconComp className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-bold text-[#0F172A] group-hover:text-[#007A64] transition-colors leading-tight">
                    {cond.lines ? (
                      cond.lines.map((l, i) => (
                        <React.Fragment key={i}>
                          {l}
                          {i < cond.lines.length - 1 && <br />}
                        </React.Fragment>
                      ))
                    ) : (
                      cond.name
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 6. OUR TREATMENT PROCESS (4 Steps matching Reference Design)              */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Our Treatment Process
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5 relative items-center">
            
            {/* Step 1: Assessment */}
            <div className="relative group">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 hover:shadow-md hover:border-teal-300 transition flex items-start sm:items-center gap-3 sm:gap-3.5 shadow-2xs min-h-[105px]">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#007A64] text-white text-xs sm:text-[13px] font-black flex items-center justify-center shrink-0 shadow-2xs self-start mt-0.5 sm:self-center sm:mt-0">
                  1
                </span>
                <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                  <ClipboardList className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64] stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">
                    Assessment
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug">
                    Detailed evaluation of your condition
                  </p>
                </div>
              </div>
              {/* Chevron connecting to Step 2 */}
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#007A64]">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            {/* Step 2: Personalized Plan */}
            <div className="relative group">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 hover:shadow-md hover:border-teal-300 transition flex items-start sm:items-center gap-3 sm:gap-3.5 shadow-2xs min-h-[105px]">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#007A64] text-white text-xs sm:text-[13px] font-black flex items-center justify-center shrink-0 shadow-2xs self-start mt-0.5 sm:self-center sm:mt-0">
                  2
                </span>
                <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]">
                    <path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5" />
                    <path d="M12 6.5a5.5 5.5 0 1 0 5.5 5.5" />
                    <circle cx="12" cy="12" r="1.8" />
                    <path d="m21.5 2.5-8 8" />
                    <path d="M21.5 6.5V2.5h-4" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">
                    Personalized Plan
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug">
                    A customized therapy plan for you
                  </p>
                </div>
              </div>
              {/* Chevron connecting to Step 3 */}
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#007A64]">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            {/* Step 3: Therapy Sessions */}
            <div className="relative group">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 hover:shadow-md hover:border-teal-300 transition flex items-start sm:items-center gap-3 sm:gap-3.5 shadow-2xs min-h-[105px]">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#007A64] text-white text-xs sm:text-[13px] font-black flex items-center justify-center shrink-0 shadow-2xs self-start mt-0.5 sm:self-center sm:mt-0">
                  3
                </span>
                <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]">
                    <circle cx="15.5" cy="7" r="2" />
                    <path d="M8 15c.5-3 2.5-4.5 5-4.5 1.5 0 2.5.5 3 2.5" />
                    <path d="M12.5 11l-3 4" />
                    <rect x="2" y="15" width="20" height="3" rx="1.5" />
                    <rect x="2" y="19" width="20" height="2.5" rx="1" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">
                    Therapy Sessions
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug">
                    Guided sessions with expert care
                  </p>
                </div>
              </div>
              {/* Chevron connecting to Step 4 */}
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#007A64]">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>

            {/* Step 4: Progress & Recovery */}
            <div className="relative group">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 hover:shadow-md hover:border-teal-300 transition flex items-start sm:items-center gap-3 sm:gap-3.5 shadow-2xs min-h-[105px]">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#007A64] text-white text-xs sm:text-[13px] font-black flex items-center justify-center shrink-0 shadow-2xs self-start mt-0.5 sm:self-center sm:mt-0">
                  4
                </span>
                <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 sm:w-8 h-7 sm:h-8 text-[#007A64]">
                    <rect x="3.5" y="13.5" width="4" height="7.5" rx="1.5" />
                    <rect x="10" y="8" width="4" height="13" rx="1.5" />
                    <rect x="16.5" y="3" width="4" height="18" rx="1.5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-black text-[#0F172A] leading-tight">
                    Progress &amp; Recovery
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1 leading-snug">
                    Track improvement and get long-term support
                  </p>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* 7. OUR IMPACT IN NUMBERS                                                  */}
        {/* ========================================================================= */}
        <section className="rounded-2xl sm:rounded-[24px] bg-white border border-slate-200/90 p-5 sm:p-7 lg:p-8 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Image: Physiotherapist helping elderly patient */}
            <div className="lg:col-span-4 xl:col-span-4 flex justify-center lg:justify-start">
              <div className="w-full max-w-[320px] rounded-xl overflow-hidden shadow-xs border border-slate-100 bg-slate-50">
                <img
                  src="/physio-impact.png"
                  onError={(e) => { e.currentTarget.src = '/physio-impact-raw.jpg'; }}
                  alt="Physiotherapy session with elderly patient"
                  className="w-full h-auto max-h-[190px] sm:max-h-[210px] object-cover object-center select-none"
                />
              </div>
            </div>

            {/* Right: Heading & 4 Stats Counters */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-4 sm:space-y-5">
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-[#0F172A] tracking-tight">
                Our Impact in Numbers
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                
                {/* Stat 1: 5,000+ Happy Patients */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                    <Users className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64] stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-[#007A64] leading-tight">5,000+</p>
                    <p className="text-xs sm:text-[13px] text-slate-600 font-semibold leading-snug mt-0.5">Happy Patients</p>
                  </div>
                </div>

                {/* Stat 2: 15+ Expert Physiotherapists */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]">
                      <rect x="3" y="4" width="18" height="18" rx="3" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <path d="M7 14h.01" />
                      <path d="M11 14h.01" />
                      <path d="M7 17.5h.01" />
                      <circle cx="16.5" cy="16.5" r="4.2" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.2" />
                      <path d="m14.8 16.5 1.2 1.2 2.4-2.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-[#007A64] leading-tight">15+</p>
                    <p className="text-xs sm:text-[13px] text-slate-600 font-semibold leading-snug mt-0.5">Expert Physiotherapists</p>
                  </div>
                </div>

                {/* Stat 3: 98% Recovery Rate */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]">
                      <path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5" />
                      <path d="M12 6.5a5.5 5.5 0 1 0 5.5 5.5" />
                      <circle cx="12" cy="12" r="1.8" />
                      <path d="m21.5 2.5-8 8" />
                      <path d="M21.5 6.5V2.5h-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-[#0F172A] leading-tight">98%</p>
                    <p className="text-xs sm:text-[13px] text-slate-600 font-semibold leading-snug mt-0.5">Recovery Rate</p>
                  </div>
                </div>

                {/* Stat 4: 4.9/5 Patient Satisfaction */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="shrink-0 flex items-center justify-center text-[#007A64]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-8 sm:w-9 h-8 sm:h-9 text-[#007A64]">
                      <circle cx="12" cy="8.5" r="6.2" />
                      <polygon points="12 5.2 13.1 7.4 15.5 7.7 13.8 9.3 14.2 11.7 12 10.5 9.8 11.7 10.2 9.3 8.5 7.7 10.9 7.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="m15.5 13.5 1.5 8a.5.5 0 0 1-.8.47l-3.6-2.7a1 1 0 0 0-1.2 0l-3.6 2.7a.5.5 0 0 1-.8-.47l1.5-8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-[#007A64] leading-tight">4.9/5</p>
                    <p className="text-xs sm:text-[13px] text-slate-600 font-semibold leading-snug mt-0.5">Patient Satisfaction</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. RECOVERY CTA BANNER (Start Your Recovery Today!)                        */}
        {/* ========================================================================= */}
        <section className="rounded-[28px] bg-gradient-to-r from-[#006A57] via-[#007A64] to-[#008970] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-md flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Ambient background blur elements */}
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 top-0 w-48 h-48 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text */}
          <div className="relative z-10 space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-tight">
              Start Your Recovery Today!
            </h2>
            <p className="text-sm sm:text-base text-[#D1FAE5] font-medium leading-relaxed max-w-lg">
              Book a physiotherapy session with our expert team and get back to an active, pain-free life.
            </p>
          </div>

          {/* Right Action Button & Medical Clipboard Illustration */}
          <div className="relative z-10 flex items-center gap-6 shrink-0">
            
            <button
              type="button"
              onClick={() => navigate('/book-physiotherapy')}
              className="bg-white hover:bg-slate-50 text-[#007A64] font-black text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Calendar className="w-5 h-5 text-[#007A64]" />
              <span>Book a Session Now</span>
              <ArrowRight className="w-5 h-5 text-[#007A64]" />
            </button>

            {/* Illustrated Medical Clipboard with Green Checkmarks & Red Heart with Pulse */}
            <div className="hidden sm:block w-24 h-24 relative select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none">
                {/* Clipboard Board */}
                <rect x="25" y="16" width="54" height="74" rx="8" fill="#FFFFFF" stroke="#D1FAE5" strokeWidth="2" />
                
                {/* Clipboard Top Clip */}
                <rect x="38" y="10" width="28" height="12" rx="4" fill="#005B4E" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="52" cy="14" r="2.5" fill="#FFFFFF" />
                
                {/* Green Checkmarks on Document */}
                <path d="M36 34 L40 38 L48 30" stroke="#007A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="52" y1="34" x2="70" y2="34" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                
                <path d="M36 48 L40 52 L48 44" stroke="#007A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="52" y1="48" x2="70" y2="48" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                
                <path d="M36 62 L40 66 L48 58" stroke="#007A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="52" y1="62" x2="70" y2="62" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Red Heart with ECG line on bottom-right of clipboard */}
                <g transform="translate(62, 58) scale(0.9)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
                  <path d="M6 10 h3 l2 -3 l3 6 l2 -3 h3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              </svg>
            </div>

          </div>

        </section>

      </div>

      {/* ========================================================================= */}

    </div>
  );
}