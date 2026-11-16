import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, CheckCircle2, ShieldCheck, Clock, Users, 
  Calendar 
} from 'lucide-react';

export default function PackageDetailModal({ pkg, onClose, onScheduleCollection }) {
  const { addItem, cartItems } = useCart();

  if (!pkg) return null;

  const inCart = cartItems.some(i => i.id === pkg.id);

  const handleBookNow = () => {
    if (!inCart) {
      addItem(pkg, 'package');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-dropdown border border-border w-full max-w-xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{pkg.badge}</span>
            </span>
            <span className="text-xs text-muted">
              {pkg.testsCount} Comprehensive Tests
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <h3 className="text-xl font-bold text-dark leading-snug">
              {pkg.name}
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {pkg.shortDescription}
            </p>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-border">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-primary" />
                Target Group
              </span>
              <p className="text-xs font-bold text-dark mt-1">{pkg.gender} ({pkg.ageGroup})</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-border">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-dark" />
                Fasting Rule
              </span>
              <p className="text-xs font-bold text-dark mt-1">{pkg.fastingHours}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-border">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Report Delivery
              </span>
              <p className="text-xs font-bold text-dark mt-1">24-36 Hours</p>
            </div>
          </div>

          {/* Included Tests List */}
          <div>
            <h4 className="text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Key Diagnostic Profiles Included:
            </h4>
            <div className="space-y-2">
              {pkg.includes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface border border-border text-xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-slate-800 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical note */}
          <div className="bg-slate-50 rounded-xl p-3 border border-border text-xs text-slate-600">
            <strong className="text-dark">Who should take this: </strong>
            {pkg.recommendedFor}
          </div>

          {/* Pricing Box */}
          <div className="bg-primary-50/50 rounded-xl p-4 border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted">Package Offer Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-dark">₹{pkg.price.toFixed(2)}</span>
                {pkg.mrp && (
                  <span className="text-xs text-muted line-through">₹{pkg.mrp.toFixed(2)}</span>
                )}
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  {pkg.discountPercent}% OFF
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] text-muted">
              <div>Includes Free Sample Pickup</div>
              <div className="text-teal-dark font-medium">Digital Smart Reports</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="w-4 h-4 text-teal-brand" />
            <span>Doctor Verified Reports</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onScheduleCollection) onScheduleCollection(pkg);
              }}
              className="btn-secondary py-2 px-4 text-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Home Visit</span>
            </button>
            <button
              onClick={handleBookNow}
              className="btn-primary py-2 px-5 text-xs font-semibold"
            >
              {inCart ? 'In Your Cart' : 'Book Package'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
