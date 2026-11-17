import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MOCK_DIAGNOSTIC_TESTS, DIAGNOSTIC_CATEGORIES 
} from '../mock-data/diagnosticTests';
import { useCart } from '../context/CartContext';
import { 
  FlaskConical, Clock, Droplets, CheckCircle2, 
  AlertCircle, Home, Plus, Check, ArrowRight 
} from 'lucide-react';

export default function DiagnosticSection({ onSelectTest, onScheduleCollection }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const { addItem, cartItems } = useCart();

  const filteredTests = selectedCategory === 'all'
    ? MOCK_DIAGNOSTIC_TESTS
    : MOCK_DIAGNOSTIC_TESTS.filter(t => t.category === selectedCategory);

  const displayedTests = showAll ? filteredTests : filteredTests.slice(0, 6);

  return (
    <section id="lab-tests" className="py-14 sm:py-20 bg-[#F0F7FD]/60 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-dark text-xs font-bold uppercase tracking-wider mb-2 border border-teal-200/50">
              <FlaskConical className="w-3.5 h-3.5 text-teal-brand" />
              <span>Certified Diagnostics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
              Book Your Lab Tests
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Reliable diagnostic services with convenient home sample collection and rapid digital reports.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs text-muted hidden sm:inline-block">Free home pickup above ₹499</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {DIAGNOSTIC_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowAll(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:text-primary hover:bg-white/80 border border-border'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Diagnostic Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTests.map((test) => {
            const inCart = cartItems.find(i => i.id === test.id);

            return (
              <div
                key={test.id}
                onClick={() => onSelectTest(test)}
                className="group bg-white rounded-2xl border border-border hover:border-teal-brand/40 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between p-5 cursor-pointer relative"
              >
                {/* Header row in card */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[11px] font-bold text-teal-dark bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/50">
                      {test.categoryName}
                    </span>
                    {test.homeCollection && (
                      <span className="text-[11px] font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        <span>Home Sample</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-dark group-hover:text-primary transition line-clamp-1 leading-snug">
                    {test.name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {test.shortDescription}
                  </p>

                  {/* Test Specs: Fasting & Turnaround time */}
                  <div className="mt-3.5 pt-3 border-t border-border/80 flex items-center gap-4 text-xs text-muted">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{test.turnaroundTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Droplets className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{test.sampleType}</span>
                    </div>
                  </div>

                  {/* Preparation warning pill */}
                  <div className="mt-2.5 bg-slate-50 p-2 rounded-lg border border-border/60 text-[11px] text-slate-600 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{test.preparationInstructions}</span>
                  </div>
                </div>

                {/* Price & Book Now CTA */}
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-dark">
                        ₹{test.price.toFixed(2)}
                      </span>
                      {test.mrp && (
                        <span className="text-xs text-muted line-through">
                          ₹{test.mrp.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Save {test.discountPercent}% Demo Offer
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(test, 'diagnostic');
                    }}
                    className={`btn-primary text-xs py-2 px-4 rounded-xl font-semibold transition ${
                      inCart ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                    }`}
                  >
                    {inCart ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Booked</span>
                      </span>
                    ) : (
                      <span>Book Now</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Tests Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (selectedCategory !== 'all') {
                setSelectedCategory('all');
                setShowAll(true);
              } else {
                setShowAll(!showAll);
              }
            }}
            className="btn-secondary text-xs sm:text-sm py-2.5 px-6 font-semibold rounded-xl inline-flex items-center gap-2"
          >
            <span>{showAll ? 'Show Fewer Tests' : 'Quick Preview More Tests'}</span>
          </button>

          <Link
            to="/labtests"
            className="btn-primary text-xs sm:text-sm py-2.5 px-6 font-semibold rounded-xl inline-flex items-center gap-2 shadow-xs"
          >
            <span>Open Complete Diagnostic Portal (16+ Tests & Packages)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
