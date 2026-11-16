// src/components/HowItWorks.jsx
import React from 'react';
import { Search, Calendar, Home, FileText, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: 'Search & Choose Medicines or Tests',
      icon: Search
    },
    {
      title: 'Book / Order Online',
      icon: Calendar
    },
    {
      title: 'Home Sample Collection or Lab Visit',
      icon: Home
    },
    {
      title: 'Get Reports Online',
      icon: FileText
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Title */}
        <div className="text-left mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How <span className="text-[#008F83]">It Works?</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
            Get healthcare services in just a few simple steps.
          </p>
        </div>

        {/* 4 Step Cards with Connecting Arrows */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <React.Fragment key={idx}>
                {/* Step Card */}
                <div className="w-full md:flex-1 bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-100 shadow-sm hover:shadow-lg transition text-center flex flex-col items-center justify-center min-h-[180px]">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#008F83] flex items-center justify-center mb-4 shadow-xs">
                    <Icon className="w-8 h-8 stroke-[2]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                    {st.title}
                  </h3>
                </div>

                {/* Arrow */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-[#008F83] shrink-0">
                    <ArrowRight className="w-7 h-7 stroke-[3]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
