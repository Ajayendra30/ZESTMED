// src/components/HomeFeaturesOverview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartPulse, Calendar, Home, FileText, 
  ArrowRight, ShieldCheck, Check, Laptop, Search
} from 'lucide-react';

export default function HomeFeaturesOverview({ onSelectPackage, onOpenSeniorPickup }) {
  const checkupPackages = [
    {
      id: 'pkg-basic',
      name: 'Basic Health Checkup',
      price: 999,
      mrp: 1499,
      testsCount: '58 Tests Included',
      reportsTime: 'Same Day (12-24 Hours)',
      fasting: '10-12 Hours Fasting Required',
      description: 'Ideal starting package covering vital blood counts, glucose and basic lipid indicators.'
    },
    {
      id: 'pkg-complete',
      name: 'Complete Body Checkup',
      price: 1999,
      mrp: 2999,
      testsCount: '84 Tests Included',
      reportsTime: 'Same Day (Within 24 Hours)',
      fasting: '10-12 Hours Fasting Required',
      description: 'Comprehensive screening for liver, kidney, thyroid, heart and vital parameters.'
    },
    {
      id: 'pkg-diabetes',
      name: 'Diabetes Screening',
      price: 799,
      mrp: 1199,
      testsCount: '12 Tests Included',
      reportsTime: 'Same Day (12 Hours)',
      fasting: '8-10 Hours Fasting Required',
      description: 'HbA1c, Fasting Blood Sugar, Urine Microalbumin & Lipid profiling for diabetes management.'
    },
    {
      id: 'pkg-womens',
      name: "Women's Health Package",
      price: 1299,
      mrp: 1995,
      testsCount: '65 Tests Included',
      reportsTime: 'Same Day (Within 24 Hours)',
      fasting: 'Fasting Required',
      description: 'Designed specifically for women covering hormonal balance, thyroid, calcium, vitamin D & CBC.'
    },
    {
      id: 'pkg-senior',
      name: 'Senior Citizen Package',
      price: 1699,
      mrp: 2499,
      testsCount: '76 Tests Included',
      reportsTime: 'Same Day (Within 24 Hours)',
      fasting: 'Fasting Required',
      description: 'Focused evaluation for age 60+ with free 10km pick-up & drop across Guwahati.',
      hasFreeCab: true
    }
  ];

  const steps = [
    {
      title: 'Search & Choose Medicines or Tests',
      icon: (
        <div className="relative">
          <Laptop className="w-7 h-7 sm:w-8 sm:h-8 text-[#008F83]" />
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#008F83] absolute -bottom-1 -right-1" />
        </div>
      )
    },
    {
      title: 'Book / Order Online',
      icon: <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-[#008F83]" />
    },
    {
      title: 'Home Sample Collection or Lab Visit',
      icon: <Home className="w-7 h-7 sm:w-8 sm:h-8 text-[#008F83]" />
    },
    {
      title: 'Get Reports Online',
      icon: <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#008F83]" />
    }
  ];

  const whyChoosePoints = [
    'Wide range of genuine medicines',
    'Accurate & reliable diagnostic tests',
    'Convenient home sample collection',
    'Secure and easy online payment',
    'Reports anytime, anywhere'
  ];

  return (
    <section className="py-8 sm:py-10 bg-white border-t border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-6 sm:space-y-7">
        
        {/* =========================================================================
            ROW 1: HEALTH CHECKUP PACKAGES HORIZONTAL STRIP
            ========================================================================= */}
        <div className="bg-[#EDFBF9] border border-[#C6F1E9] rounded-3xl p-5 sm:p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 shadow-sm">
          {/* Left Title Block */}
          <div className="flex items-center gap-4 sm:gap-5 shrink-0 lg:max-w-sm">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-[#008F83] border-2 border-teal-200 flex items-center justify-center shadow-xs shrink-0">
              <HeartPulse className="w-8 h-8 sm:w-9 sm:h-9 text-[#008F83]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  Health Checkup Packages
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 leading-relaxed">
                Comprehensive packages delivered in 12-24 hours across Guwahati.
              </p>
            </div>
          </div>

          {/* Right 5 Package Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 flex-1">
            {checkupPackages.map((pkg, idx) => (
              <div
                key={pkg.id}
                onClick={() => {
                  if (pkg.hasFreeCab && onOpenSeniorPickup) {
                    onOpenSeniorPickup();
                  } else if (onSelectPackage) {
                    onSelectPackage(pkg);
                  }
                }}
                className={`bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 min-h-[120px] sm:min-h-[135px] text-center flex flex-col justify-center items-center hover:shadow-lg hover:border-[#008F83]/60 transition cursor-pointer group ${
                  idx === checkupPackages.length - 1 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                {pkg.hasFreeCab && (
                  <span className="text-[11px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full mb-1.5">
                    Free 10km Cab 🚗
                  </span>
                )}
                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#008F83] transition leading-snug min-h-[44px] flex items-center justify-center text-center">
                  {pkg.name}
                </h4>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="font-black text-base sm:text-lg text-slate-900">
                    ₹{pkg.price}
                  </span>
                  <span className="line-through text-xs sm:text-sm text-slate-400 font-medium">
                    ₹{pkg.mrp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            ROW 2: HOW IT WORKS? SECTION
            ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 lg:p-8 xl:p-9 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
            {/* Left Header */}
            <div className="lg:w-[22%] xl:w-[20%] shrink-0 text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                How <span className="text-[#008F83]">It Works?</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-1.5 font-medium leading-relaxed">
                Get healthcare services in just a few simple steps.
              </p>
            </div>

            {/* Right 4 Steps with Connecting Arrows */}
            <div className="lg:w-[78%] xl:w-[80%] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 xl:gap-4 flex-1">
              {steps.map((st, idx) => (
                <React.Fragment key={idx}>
                  {/* Step Card */}
                  <div className="w-full sm:flex-1 bg-white rounded-2xl p-4 sm:p-5 lg:p-5 xl:p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-teal-300 transition text-center flex flex-col items-center justify-center min-h-[145px] sm:min-h-[160px] xl:min-h-[175px]">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-50 border-2 border-teal-100 flex items-center justify-center mb-3 shadow-2xs shrink-0">
                      {st.icon}
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-[14px] xl:text-[15px] font-bold text-slate-900 leading-snug text-center min-h-[36px] sm:min-h-[42px] flex items-center justify-center">
                      {st.title}
                    </h3>
                  </div>

                  {/* Arrow Indicator */}
                  {idx < steps.length - 1 && (
                    <div className="hidden sm:flex items-center justify-center text-[#008F83] shrink-0">
                      <ArrowRight className="w-5 h-5 xl:w-6 xl:h-6 stroke-[2.5]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 3: WHY CHOOSE ZESTMED? + HOME SAMPLE COLLECTION BANNER
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* Left Column: Why Choose ZESTMED? */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008F83] border border-teal-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#008F83] stroke-[2.4]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Why Choose ZESTMED?
                </h3>
              </div>

              {/* 5 Checklist Points */}
              <div className="space-y-3.5">
                {whyChoosePoints.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100/90 text-[#008F83] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Home Sample Collection at Your Doorstep Banner */}
          <div className="lg:col-span-7 bg-gradient-to-r from-[#00545D] via-[#00626D] to-[#00747E] rounded-3xl p-6 sm:p-8 lg:p-9 text-white relative shadow-sm overflow-hidden flex flex-col sm:flex-row items-center justify-between min-h-[220px] lg:min-h-[250px]">
            {/* Background Soft Glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[55%] h-full bg-gradient-to-l from-teal-400/20 via-cyan-300/10 to-transparent rounded-l-full pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-xs sm:max-w-sm lg:max-w-md space-y-2.5 text-left mb-4 sm:mb-0">
              <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white leading-tight">
                Home Sample Collection <br className="hidden sm:inline" />
                at Your Doorstep
              </h3>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-medium">
                Book your diagnostic test and get sample collection from home.
              </p>
              <div className="pt-2">
                <Link
                  to="/diagnostics"
                  className="inline-flex items-center gap-2 bg-white hover:bg-teal-50 text-[#00545D] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-black shadow-md transition-all duration-200 group"
                >
                  <span>Book a Test Now</span>
                  <ArrowRight className="w-4 h-4 text-[#00545D] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Visual: Phlebotomist Home Sample Collection Image */}
            <div className="relative sm:absolute bottom-0 right-0 w-full sm:w-[48%] lg:w-[45%] h-auto sm:h-full flex items-end justify-end pointer-events-none select-none">
              <img
                src="/home-sample-collection.png"
                alt="ZESTMED Home Sample Collection Phlebotomist and Patient"
                className="h-auto max-h-[190px] sm:max-h-[230px] lg:max-h-[250px] w-auto max-w-full object-contain object-right-bottom drop-shadow-xl"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
