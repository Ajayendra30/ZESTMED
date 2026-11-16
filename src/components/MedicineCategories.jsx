// src/components/MedicineCategories.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Package, Droplet, Sparkles, Activity, Smile, ArrowRight } from 'lucide-react';

export default function MedicineCategories() {
  const categories = [
    {
      name: 'General Medicines',
      icon: Pill,
      bg: 'bg-[#F0F7FF]',
      border: 'border-blue-200 hover:border-blue-400',
      iconColor: 'text-blue-600 bg-blue-100',
      categorySlug: 'general'
    },
    {
      name: 'Vitamins & Supplements',
      icon: Package,
      bg: 'bg-[#FFFBEB]',
      border: 'border-amber-200 hover:border-amber-400',
      iconColor: 'text-amber-600 bg-amber-100',
      categorySlug: 'vitamins'
    },
    {
      name: 'Diabetes Care',
      icon: Droplet,
      bg: 'bg-[#FFF1F2]',
      border: 'border-rose-200 hover:border-rose-400',
      iconColor: 'text-rose-600 bg-rose-100',
      categorySlug: 'diabetes'
    },
    {
      name: 'Personal Care',
      icon: Sparkles,
      bg: 'bg-[#F0FDF4]',
      border: 'border-blue- hover:border-blue-',
      iconColor: 'text-blue- bg-blue-',
      categorySlug: 'personal'
    },
    {
      name: 'Healthcare Devices',
      icon: Activity,
      bg: 'bg-[#FAF5FF]',
      border: 'border-purple-200 hover:border-purple-400',
      iconColor: 'text-purple-600 bg-purple-100',
      categorySlug: 'devices'
    },
    {
      name: 'Baby Care',
      icon: Smile,
      bg: 'bg-[#FFF7ED]',
      border: 'border-orange-200 hover:border-orange-400',
      iconColor: 'text-orange-600 bg-orange-100',
      categorySlug: 'baby'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop by Medicine Category
          </h2>
          <Link
            to="/medicines"
            className="text-sm sm:text-base font-bold text-[#005CB9] hover:underline flex items-center gap-1.5 transition"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Categories Grid (6 in a row on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/medicines?category=${cat.categorySlug}`}
                className={`${cat.bg} border-2 ${cat.border} rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:shadow-md group`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${cat.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
