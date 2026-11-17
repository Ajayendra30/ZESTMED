// src/components/PopularServices.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, FlaskConical, Heart } from 'lucide-react';

export default function PopularServices() {
  const services = [
    {
      title: 'Order Medicines Online',
      description: 'Wide range of genuine medicines with fast & safe delivery.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80',
      alt: 'Pills spilling from medicine bottle',
      buttonText: 'Shop Medicines',
      link: '/medicines',
      icon: ShoppingCart
    },
    {
      title: 'Book Diagnostic Tests',
      description: 'Choose from 100+ lab tests with home collection.',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=700&q=80',
      alt: 'Laboratory blood test tubes',
      buttonText: 'Book a Test',
      link: '/labtests',
      icon: FlaskConical
    },
    {
      title: 'Health Packages',
      description: 'Comprehensive preventive checkups for individual health.',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=700&q=80',
      alt: 'Stethoscope with red heart and clinical chart',
      buttonText: 'Explore Packages',
      link: '/packages',
      icon: Heart
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Popular Services
          </h2>
          <Link
            to="/medicines"
            className="text-sm sm:text-base font-bold text-[#008F83] hover:underline flex items-center gap-1.5 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* 3 Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image Container */}
              <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-50 mb-5 relative">
                <img
                  src={srv.image}
                  alt={srv.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text Info & CTA */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#008F83] transition">
                    {srv.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <Link
                  to={srv.link}
                  className="inline-flex items-center gap-2 bg-[#008F83] hover:bg-[#007a70] text-white px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold w-fit mt-6 transition shadow-sm"
                >
                  <span>{srv.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
