// src/components/WhyChooseUs.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WhyChooseUs() {
  const points = [
    'Wide range of genuine medicines',
    'Accurate & reliable diagnostic tests',
    'Convenient home sample collection',
    'Secure and easy online payment',
    'Reports anytime, anywhere'
  ];

  return (
    <section className="py-14 sm:py-18 bg-white border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Why Choose ZESTMED? Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Why Choose ZESTMED?
                </h3>
              </div>

              <div className="space-y-4 mt-6">
                {points.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    <CheckCircle2 className="w-6 h-6 text-[#008F83] shrink-0 stroke-[2.2]" />
                    <span className="text-base sm:text-lg font-semibold text-slate-700 leading-snug">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Home Sample Collection at Your Doorstep Banner */}
          <div className="lg:col-span-7 bg-[#00545D] rounded-3xl p-6 sm:p-8 lg:p-9 xl:p-10 text-white relative shadow-sm overflow-hidden flex flex-col justify-center min-h-[260px] sm:min-h-[280px] lg:min-h-[300px]">
            {/* Background Graphic: Wavy Teal Gradient & Phlebotomist in Curved Arch */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-no-repeat bg-right pointer-events-none select-none rounded-3xl transition-all duration-300"
              style={{ backgroundImage: "url('/home-sample-collection.png')" }}
            />
            {/* Subtle Gradient Overlay to Guarantee Crisp Readability Without Touching the Photo */}
            <div className="absolute inset-y-0 left-0 w-3/5 sm:w-1/2 bg-gradient-to-r from-[#00545D] via-[#00545D]/85 to-transparent pointer-events-none rounded-l-3xl z-[1]" />

            {/* Left Content - Perfectly Constrained to Safe Teal Region */}
            <div className="relative z-10 max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] xl:max-w-[360px] space-y-3 text-left">
              <h3 className="text-2xl sm:text-[28px] lg:text-[30px] xl:text-[32px] font-black text-white leading-[1.22] tracking-tight">
                Home Sample Collection <br />
                at Your Doorstep
              </h3>
              <p className="text-xs sm:text-sm lg:text-[14px] text-teal-100 font-medium leading-relaxed max-w-[270px] sm:max-w-[310px]">
                Book your diagnostic test and get sample collection from home.
              </p>
              <div className="pt-2 sm:pt-2.5">
                <Link
                  to="/diagnostics"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 bg-white hover:bg-teal-50 text-[#00545D] px-6 py-3 rounded-full text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer active:scale-95"
                >
                  <span>Book a Test Now</span>
                  <ArrowRight className="w-4 h-4 text-[#00545D] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Visual Clickable Overlay Link to Diagnostics */}
            <Link
              to="/diagnostics"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hidden sm:block absolute inset-y-0 right-0 w-[48%] lg:w-[45%] z-10 cursor-pointer"
              title="Book Home Sample Collection Diagnostic Test"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
