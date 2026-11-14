import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, Star, ShieldCheck, Truck, Check, AlertCircle, 
  Plus, Minus, ShoppingBag, Pill 
} from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  const { addItem, cartItems, updateQuantity } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const inCartItem = cartItems.find(i => i.id === product.id);

  const handleAddToCart = () => {
    addItem(product, 'medicine');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-dropdown border border-border w-full max-w-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-md">
              {product.categoryName}
            </span>
            {product.prescriptionRequired && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                Rx Required
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image */}
            <div className="bg-slate-50 border border-border rounded-2xl p-4 flex items-center justify-center relative overflow-hidden group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-contain rounded-xl transition duration-300 group-hover:scale-105"
              />
              {product.discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs">
                  {product.discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider">
                  {product.manufacturer}
                </p>
                <h3 className="text-xl font-bold text-dark mt-1 leading-snug">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 italic">
                  {product.composition}
                </p>
              </div>

              {/* Rating & Pack size */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-muted">({product.reviewsCount})</span>
                </div>
                <span className="text-muted">•</span>
                <span className="font-medium text-slate-700">{product.form}</span>
              </div>

              {/* Pricing */}
              <div className="bg-surface rounded-xl p-3.5 border border-border">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold text-dark">₹{product.price.toFixed(2)}</span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-sm text-muted line-through">MRP ₹{product.mrp.toFixed(2)}</span>
                  )}
                  {product.discountPercent > 0 && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save {product.discountPercent}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted mt-1">Inclusive of all taxes</p>
              </div>

              {/* Key Trust Highlights */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine product sourced directly from certified stockists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>Standard 24-48 hr delivery • Express same-day available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Dosage */}
          <div className="border-t border-border pt-5 space-y-4 text-xs leading-relaxed text-slate-700">
            <div>
              <h4 className="font-bold text-dark text-sm mb-1.5 flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary" />
                Product Overview
              </h4>
              <p>{product.description}</p>
            </div>

            {/* Key Therapeutic Uses */}
            {product.uses && product.uses.length > 0 && (
              <div>
                <h5 className="font-bold text-dark text-xs mb-2">Key Uses & Benefits:</h5>
                <div className="flex flex-wrap gap-2">
                  {product.uses.map((use, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-primary-50 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-primary/20">
                      <Check className="w-3 h-3 text-primary" />
                      <span>{use}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-3.5 rounded-xl border border-border">
              <h5 className="font-bold text-dark text-xs mb-1">Recommended Directions & Dosage:</h5>
              <p className="text-slate-600">{product.dosage}</p>
            </div>

            {/* Safety & Precaution Advice */}
            {product.safetyAdvice && (
              <div className="border border-amber-200/80 bg-amber-50/50 rounded-xl p-3.5 space-y-2">
                <h5 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Pharmacist Safety Guidance
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900/90">
                  {product.safetyAdvice.alcohol && (
                    <div><strong>Alcohol:</strong> {product.safetyAdvice.alcohol}</div>
                  )}
                  {product.safetyAdvice.pregnancy && (
                    <div><strong>Pregnancy:</strong> {product.safetyAdvice.pregnancy}</div>
                  )}
                  {product.safetyAdvice.driving && (
                    <div><strong>Driving:</strong> {product.safetyAdvice.driving}</div>
                  )}
                  {product.safetyAdvice.kidney && (
                    <div><strong>Kidney/Liver:</strong> {product.safetyAdvice.kidney}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="w-4 h-4 text-teal-brand" />
            <span>Secure Packaging</span>
          </div>

          <div className="flex items-center gap-3">
            {inCartItem ? (
              <div className="flex items-center border border-primary/30 rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => updateQuantity(product.id, inCartItem.quantity - 1)}
                  className="p-2 text-primary hover:bg-primary-50 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-xs font-bold text-dark">
                  {inCartItem.quantity} in Cart
                </span>
                <button
                  onClick={() => updateQuantity(product.id, inCartItem.quantity + 1)}
                  className="p-2 text-primary hover:bg-primary-50 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="btn-primary py-2.5 px-6 text-sm rounded-xl flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
