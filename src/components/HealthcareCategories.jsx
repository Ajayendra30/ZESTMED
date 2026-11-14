// src/components/HealthcareCategories.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function HealthcareCategories() {
  const categories = [
    {
      id: 'general',
      line1: 'General',
      line2: 'Medicines',
      iconColor: 'text-[#00A887]',
      icon: (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 text-[#00A887]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            x="7"
            y="14"
            width="26"
            height="12"
            rx="6"
            transform="rotate(-45 20 20)"
            stroke="currentColor"
          />
          <line x1="16" y1="16" x2="24" y2="24" strokeWidth="2.4" />
        </svg>
      )
    },
    {
      id: 'vitamins',
      line1: 'Vitamins &',
      line2: 'Supplements',
      iconColor: 'text-[#16A34A]',
      icon: (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 text-[#16A34A]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 28C12 21 17 14 28 12C28 23 21 28 14 28" />
          <path d="M13 28L22 19" />
          <path d="M17 28C20 25 24 24 27 24" />
          <path d="M21 20C24 16 26 15 28 12" />
        </svg>
      )
    },
    {
      id: 'diabetes',
      line1: 'Diabetes',
      line2: 'Care',
      iconColor: 'text-[#0284C7]',
      icon: (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 text-[#0284C7]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="12" y="8" width="16" height="20" rx="4" />
          <rect x="15.5" y="12" width="9" height="6.5" rx="1.5" fill="#E0F2FE" />
          <circle cx="20" cy="23" r="1.5" fill="currentColor" />
          <path d="M17 28L17 32C17 33.5 20 35 20 35C20 35 23 33.5 23 32L23 28" />
        </svg>
      )
    },
    {
      id: 'personal',
      line1: 'Personal',
      line2: 'Care',
      iconColor: 'text-[#0D9488]',
      icon: (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 text-[#0D9488]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="16" y="8" width="8" height="4" rx="1" />
          <path d="M18 12L15 15.5C13.5 17.5 13.5 19 13.5 21V30.5C13.5 32 14.5 33 16 33H24C25.5 33 26.5 32 26.5 30.5V21C26.5 19 26.5 17.5 25 15.5L22 12Z" />
          <line x1="16" y1="22" x2="24" y2="22" />
          <line x1="16" y1="26" x2="21" y2="26" />
        </svg>
      )
    },
    {
      id: 'heart',
      line1: 'Healthcare',
      line2: 'Devices',
      iconColor: 'text-[#2563EB]',
      icon: (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 text-[#2563EB]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="8" y="9" width="24" height="18" rx="3.5" />
          <path d="M12 18H15.5L17.5 14L20.5 22L22.5 18H28" />
          <path d="M16 27L14 32H26L24 27" />
        </svg>
      )
    },
    {
      id: 'baby',
      line1: 'Baby',
      line2: 'Care',
      iconColor: 'text-[#008F83]',
      icon: (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 text-[#008F83]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="22" r="11" />
          <path d="M20 11C20 9 21.5 8 23 8C24 8 24.5 9 24 10C23 11 21 11 20 11Z" fill="currentColor" />
          <circle cx="16.5" cy="20" r="1.3" fill="currentColor" />
          <circle cx="23.5" cy="20" r="1.3" fill="currentColor" />
          <path d="M17 25C18 26.5 22 26.5 23 25" />
          <path d="M9 22C8 22 7 21 7 20C7 19 8 18 9 19" />
          <path d="M31 22C32 22 33 21 33 20C33 19 32 18 31 19" />
        </svg>
      )
    }
  ];

  return (
    <section className="pt-6 sm:pt-8 pb-3 sm:pb-4 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Main Rounded Categories Container Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow py-3 sm:py-4 px-2 sm:px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 lg:divide-slate-200/70 items-center">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/medicines?category=${cat.id}`}
                className="flex flex-col items-center justify-center py-3.5 sm:py-4 px-3 text-center group hover:bg-slate-50/70 rounded-2xl transition-all duration-200 cursor-pointer"
              >
                {/* Icon Wrapper */}
                <div className="mb-2 flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {cat.icon}
                  </div>
                </div>

                {/* 2-line Label */}
                <div className="text-xs sm:text-[13px] lg:text-sm font-extrabold text-[#0B1728] group-hover:text-[#008F83] transition-colors leading-tight tracking-tight text-center">
                  <div>{cat.line1}</div>
                  <div>{cat.line2}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
