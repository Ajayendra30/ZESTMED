// src/components/Testimonials.jsx
import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { fetchReviews } from '../services/reviewService';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([
    {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment:
        'Very convenient service. I booked a lab test and the sample collection was done at my home on time. Got the report quickly too!'
    },
    {
      name: 'Rupam Sharma',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment:
        'Genuine medicines and great discounts. The ordering process is simple and delivery was super fast.'
    },
    {
      name: 'Sanjay Mehta',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      comment:
        'The health package was affordable and covered all important tests. Highly recommend ZESTMED.'
    }
  ]);

  useEffect(() => {
    let isMounted = true;
    fetchReviews().then((list) => {
      if (!isMounted) return;
      const approved = (list || []).filter(r => r.status === 'Approved' || r.isPublished);
      if (approved.length >= 3) {
        setTestimonials(approved.slice(0, 6).map((r, idx) => ({
          name: r.author || r.patientName || 'Patient',
          avatar: DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length],
          rating: Math.round(r.rating || 5),
          service: r.service,
          comment: r.comment,
          officialReply: r.officialReply
        })));
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header with Title and Left/Right Buttons */}
        <div className="flex items-center justify-between gap-3 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              What Our <span className="text-[#008F83]">Customers Say?</span>
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              className="w-11 h-11 rounded-full border-2 border-slate-200 hover:border-[#008F83] hover:text-[#008F83] bg-white flex items-center justify-center text-slate-600 transition shadow-xs"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="w-11 h-11 rounded-full border-2 border-slate-200 hover:border-[#008F83] hover:text-[#008F83] bg-white flex items-center justify-center text-slate-600 transition shadow-xs"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Testimonials Cards in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Author Avatar & Name & Stars */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 ring-2 ring-teal-200 shrink-0">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                      {t.name}
                    </h3>
                    {t.service && (
                      <span className="text-xs text-teal-700 font-bold block mt-1">
                        {t.service}
                      </span>
                    )}
                    {/* 5 Gold Stars */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium italic">
                  "{t.comment}"
                </p>

                {/* Official Response if present */}
                {t.officialReply && (
                  <div className="mt-4 p-3 rounded-2xl bg-teal-50 border border-teal-100 text-xs text-teal-900">
                    <span className="font-bold text-[10px] uppercase text-teal-800 block mb-0.5">Official Response:</span>
                    <p className="font-medium text-slate-700">{t.officialReply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
