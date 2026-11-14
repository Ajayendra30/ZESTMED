// src/components/TrustBenefits.jsx
import React from 'react';
import { ShieldCheck, Home, FileText, Headphones } from 'lucide-react';

export default function TrustBenefits() {
  const benefits = [
    {
      title: '100% Genuine Medicines',
      subtitle: 'From trusted & licensed partners',
      icon: ShieldCheck,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200'
    },
    {
      title: 'Home Sample Collection',
      subtitle: 'Safe, convenient & on-time',
      icon: Home,
      color: 'text-[#008F83]',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      title: 'Digital Reports',
      subtitle: 'Access anytime, anywhere',
      icon: FileText,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200'
    },
    {
      title: 'Expert Support',
      subtitle: 'For booking, orders & reports',
      icon: Headphones,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200'
    }
  ];

  return (
    <section className="py-10 bg-white border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-5 p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-md transition"
              >
                <div className={`w-16 h-16 rounded-2xl ${b.bg} ${b.color} border ${b.border} flex items-center justify-center shrink-0 shadow-xs`}>
                  <Icon className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {b.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">
                    {b.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
