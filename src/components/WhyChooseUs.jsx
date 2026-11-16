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
                <ShieldCheck className="w-8 h-8 text-blue-" />
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Why Choose ZESTMED?
                </h3>
              </div>

              <div className="space-y-4 mt-6">
                {points.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    <CheckCircle2 className="w-6 h-6 text-[#005CB9] shrink-0 stroke-[2.2]" />
                    <span className="text-base sm:text-lg font-semibold text-slate-700 leading-snug">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Home Sample Collection at Your Doorstep Banner */}
          <div className="lg:col-span-7 bg-[#00545D] rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-8 relative shadow-md overflow-hidden">
            {/* Background glowing circle */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="relative z-10 max-w-md space-y-3">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                Home Sample Collection <br className="hidden sm:inline" />
                at Your Doorstep
              </h3>
              <p className="text-sm sm:text-base text-teal-100 leading-relaxed font-medium">
                Book your diagnostic test and get sample collection from home by certified phlebotomists.
              </p>
              <div className="pt-3">
                <Link
                  to="/diagnostics"
                  className="inline-flex items-center gap-2.5 bg-white hover:bg-teal-50 text-[#00545D] px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold shadow-sm transition"
                >
                  <span>Book a Test Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Photo */}
            <div className="relative z-10 w-full sm:w-72 h-52 sm:h-60 rounded-2xl overflow-hidden shrink-0 shadow-lg border-2 border-white/30">
              <img
                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=700&q=80"
                alt="Phlebotomist collecting home diagnostic blood sample"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
