import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_HEALTH_PACKAGES } from '../mock-data/packages';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { enforceAuth } from '../utils/authGuard';
import { 
  CheckCircle2, Clock, Users, 
  ArrowRight, ShieldCheck, Check, Plus 
} from 'lucide-react';

export default function HealthPackages({ onSelectPackage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { addItem, cartItems } = useCart();

  return (
    <section id="packages" className="py-14 sm:py-20 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-50 text-primary text-xs font-bold uppercase tracking-wider mb-2 border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Preventive Wellness</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
            Comprehensive Health Packages
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Specially curated diagnostic health checkups covering vital organs, hormone balance, and lifestyle health.
          </p>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_HEALTH_PACKAGES.map((pkg, idx) => {
            const isFeatured = idx === 1; // Complete Body Checkup Pro
            const inCart = cartItems.find(i => i.id === pkg.id);

            return (
              <div
                key={pkg.id}
                className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between p-6 relative ${
                  isFeatured
                    ? 'bg-gradient-to-b from-primary-50/70 via-white to-white border-primary shadow-card-hover scale-[1.02] ring-2 ring-primary/20'
                    : 'bg-white border-border hover:border-primary/40 shadow-card hover:shadow-card-hover'
                }`}
              >
                {/* Badge Tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    isFeatured
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-teal-50 text-teal-dark border border-teal-200/60'
                  }`}>
                    {pkg.badge}
                  </span>
                  <span className="text-xs font-semibold text-muted">
                    {pkg.testsCount} Tests Included
                  </span>
                </div>

                {/* Package Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-dark leading-snug">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {pkg.shortDescription}
                  </p>

                  {/* Fasting & Gender pill */}
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-muted">
                    <span className="bg-surface px-2.5 py-1 rounded-lg border border-border">
                      {pkg.gender}
                    </span>
                    <span className="bg-surface px-2.5 py-1 rounded-lg border border-border">
                      {pkg.fastingHours}
                    </span>
                  </div>

                  {/* Included Tests Preview List */}
                  <div className="mt-5 space-y-2 border-t border-border/70 pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Key Profiles Covered:
                    </span>
                    {pkg.includes.slice(0, 4).map((testName, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{testName}</span>
                      </div>
                    ))}
                    {pkg.includes.length > 4 && (
                      <div className="text-[11px] text-primary font-semibold pl-5">
                        +{pkg.includes.length - 4} more specialized tests
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-dark">
                        ₹{pkg.price.toFixed(2)}
                      </span>
                      {pkg.mrp && (
                        <span className="text-xs text-muted line-through">
                          ₹{pkg.mrp.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      {pkg.discountPercent}% Demo Discount
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPackage(pkg)}
                      className="btn-secondary text-xs py-2 px-3 font-semibold rounded-xl"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          enforceAuth({
                            user,
                            navigate,
                            location,
                            toastMessage: 'Please login or register to book a health package',
                            pendingAction: { type: 'add_to_cart', item: pkg, itemType: 'package' },
                            addToast
                          });
                          return;
                        }
                        addItem(pkg, 'package');
                      }}
                      className={`btn-primary text-xs py-2 px-3.5 rounded-xl font-semibold transition ${
                        inCart ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                      }`}
                    >
                      {inCart ? 'In Cart' : 'Book'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Packages Action */}
        <div className="mt-10 text-center">
          <Link
            to="/diagnostics"
            className="btn-secondary text-xs sm:text-sm py-2.5 px-6 font-bold rounded-xl inline-flex items-center gap-2 shadow-xs hover:border-primary/50"
          >
            <span>Compare All Preventive Packages in Diagnostic Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Diagnostic Home Pickup Guarantee Strip */}
        <div className="mt-12 bg-surface rounded-2xl p-5 border border-border flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>All health packages include sterile barcoded vacutainer sample collection.</span>
          </div>
          <div className="flex items-center gap-4 text-muted">
            <span>• Verified Digital Reports</span>
            <span>• Free Doctor Tele-Consultation (Demo)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
