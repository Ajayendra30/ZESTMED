// src/components/HealthcareCategories.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, Stethoscope, Activity, Scissors, 
  Layers, Pill, Car, ArrowRight, ShieldCheck, Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function HealthcareCategories({ 
  onOpenDoctorModal, 
  onOpenPhysioModal, 
  onOpenSurgeryModal, 
  onOpenSeniorPickup 
}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const serviceCategories = [
    {
      id: 'lab-tests',
      title: 'Lab & Diagnostic Tests',
      sub: 'Home Sample Collection',
      badge: '#1 First Order',
      badgeColor: 'bg-amber-100 text-amber-800',
      iconBg: 'bg-teal-50 text-[#008F83]',
      link: '/diagnostics',
      icon: <FlaskConical className="w-7 h-7 text-[#008F83]" />
    },
    {
      id: 'book-doctor',
      title: 'Book Doctor',
      sub: 'Verified Specialists in Guwahati',
      badge: 'OPD & Video',
      badgeColor: 'bg-blue-50 text-blue-700',
      iconBg: 'bg-blue-50 text-blue-600',
      link: '/doctor-appointment',
      onClick: onOpenDoctorModal,
      icon: <Stethoscope className="w-7 h-7 text-blue-600" />
    },
    {
      id: 'book-physio',
      title: 'Physiotherapist',
      sub: 'Home Visit & Clinic Rehab',
      badge: 'Senior Mobility',
      badgeColor: 'bg-emerald-50 text-emerald-700',
      iconBg: 'bg-emerald-50 text-emerald-600',
      link: '/physiotherapy',
      onClick: onOpenPhysioModal,
      icon: <Activity className="w-7 h-7 text-emerald-600" />
    },
    {
      id: 'surgery-packages',
      title: 'Surgery Packages',
      sub: 'Daycare & Elective Surgeries',
      badge: 'Cashless TPA',
      badgeColor: 'bg-purple-50 text-purple-700',
      iconBg: 'bg-purple-50 text-purple-600',
      link: '/surgery-packages',
      onClick: onOpenSurgeryModal,
      icon: <Scissors className="w-7 h-7 text-purple-600" />
    },
    {
      id: 'wellness-packages',
      title: 'Wellness Packages',
      sub: 'Full Body & Preventive Panels',
      badge: '12-24h Reports',
      badgeColor: 'bg-rose-50 text-rose-700',
      iconBg: 'bg-rose-50 text-rose-600',
      link: '/wellness-packages',
      icon: <Layers className="w-7 h-7 text-rose-600" />
    },
    {
      id: 'medicine-store',
      title: 'Online Medicines',
      sub: 'Genuine Pharmacy & Fast Delivery',
      badge: 'Guwahati Fast',
      badgeColor: 'bg-teal-50 text-teal-800',
      iconBg: 'bg-teal-50 text-[#008F83]',
      link: '/medicines',
      icon: <Pill className="w-7 h-7 text-[#008F83]" />
    },
    {
      id: 'senior-care',
      title: 'Senior Citizen Transport',
      sub: 'Free Pick-up & Drop (10km Radius)',
      badge: '100% Free',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-700',
      onClick: onOpenSeniorPickup,
      icon: <Car className="w-7 h-7 text-emerald-700" />
    }
  ];

  return (
    <section className="py-6 sm:py-8 bg-white border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Comprehensive Healthcare Services</span>
              <span className="text-xs font-bold text-[#008F83] bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full">
                Guwahati Exclusive
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Diagnostics in 1st order, top doctors, physiotherapy, surgeries, medicines & free senior citizen transport.
            </p>
          </div>
        </div>

        {/* Categories Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-3.5">
          {serviceCategories.map((cat) => {
            const Content = (
              <div className="h-full flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-[#008F83] hover:shadow-md transition text-left group cursor-pointer relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-2xl ${cat.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                    {cat.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cat.badgeColor}`}>
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#008F83] transition leading-snug">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.sub}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#008F83]">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );

            if (cat.link) {
              return (
                <Link key={cat.id} to={cat.link} className="block h-full">
                  {Content}
                </Link>
              );
            }

            return (
              <div key={cat.id} onClick={cat.onClick} className="h-full">
                {Content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
