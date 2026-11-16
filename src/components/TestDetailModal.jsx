import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, Clock, Droplets, CheckCircle2, ShieldCheck, 
  AlertCircle, Home, Check, Calendar 
} from 'lucide-react';

export default function TestDetailModal({ test, onClose, onScheduleCollection }) {
  const { addItem, cartItems } = useCart();

  if (!test) return null;

  const inCart = cartItems.some(i => i.id === test.id);

  const handleBookNow = () => {
    if (!inCart) {
      addItem(test, 'diagnostic');
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
            <span className="text-xs font-semibold text-teal-dark bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              {test.categoryName}
            </span>
            {test.homeCollection && (
              <span className="text-xs font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Home className="w-3 h-3" />
                <span>Home Collection Available</span>
              </span>
            )}
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
              {test.name}
            </h3>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              {test.shortDescription}
            </p>
          </div>

          {/* Quick Specifications Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-border">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-rose-500" />
                Sample Type
              </span>
              <p className="text-xs font-bold text-dark mt-1">{test.sampleType}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-border">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Report Delivery
              </span>
              <p className="text-xs font-bold text-dark mt-1">{test.turnaroundTime}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-border">
              <span className="text-[11px] text-muted flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Fasting
              </span>
              <p className="text-xs font-bold text-dark mt-1">
                {test.fastingRequired ? 'Required' : 'Not Required'}
              </p>
            </div>
          </div>

          {/* Preparation Instructions */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Patient Preparation Instructions
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {test.preparationInstructions}
            </p>
          </div>

          {/* Parameters Included */}
          <div>
            <h4 className="text-xs font-bold text-dark uppercase tracking-wider mb-2.5">
              Parameters Covered ({test.parametersCount} Parameters)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {test.parameters.map((param, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-brand shrink-0" />
                  <span className="text-dark truncate">{param}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-surface rounded-xl p-4 border border-border flex items-center justify-between">
            <div>
              <span className="text-xs text-muted">Test Booking Fee</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-dark">₹{test.price.toFixed(2)}</span>
                {test.mrp && test.mrp > test.price && (
                  <span className="text-xs text-muted line-through">₹{test.mrp.toFixed(2)}</span>
                )}
                <span className="text-xs font-bold text-blue- bg-blue- px-2 py-0.5 rounded-md">
                  {test.discountPercent}% OFF
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] text-muted">
              <div>Free Home Sample Collection</div>
              <div className="text-blue- font-semibold">100% Sterile Kit</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>NABL Standards Demo Workflow</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onScheduleCollection) onScheduleCollection(test);
              }}
              className="btn-secondary py-2 px-4 text-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Slot</span>
            </button>
            <button
              onClick={handleBookNow}
              className="btn-primary py-2 px-5 text-xs font-semibold"
            >
              {inCart ? 'Already in Cart' : 'Book Lab Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
