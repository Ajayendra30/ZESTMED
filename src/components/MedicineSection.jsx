import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MOCK_MEDICINES, MEDICINE_CATEGORIES 
} from '../mock-data/medicines';
import { useCart } from '../context/CartContext';
import { 
  Plus, Check, Star, ShieldCheck, ArrowRight, 
  Upload, AlertCircle, ShoppingBag 
} from 'lucide-react';

export default function MedicineSection({ onSelectProduct, onOpenPrescriptionModal }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addItem, cartItems } = useCart();

  const filteredMedicines = selectedCategory === 'all'
    ? MOCK_MEDICINES
    : MOCK_MEDICINES.filter(m => m.category === selectedCategory);

  return (
    <section id="medicines" className="py-14 sm:py-20 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pharmacy Store</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight">
              Shop Medicines
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Find the healthcare essentials you need. 100% genuine products with rapid dispatch.
            </p>
          </div>

          {/* Quick Prescription Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={onOpenPrescriptionModal}
              className="btn-teal text-xs sm:text-sm py-2.5 px-4 font-semibold shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Order via Prescription</span>
            </button>
          </div>
        </div>

        {/* Category Pills Slider / Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {MEDICINE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]'
                    : 'bg-surface text-slate-700 hover:text-primary hover:bg-primary-50/50 border border-border'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMedicines.map((product) => {
            const inCart = cartItems.find(i => i.id === product.id);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-white rounded-2xl border border-border hover:border-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
              >
                {/* Discount Badge */}
                {product.discountPercent > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-blue- text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
                    {product.discountPercent}% OFF
                  </div>
                )}

                {/* Prescription Required Badge */}
                {product.prescriptionRequired && (
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
                    Rx Required
                  </div>
                )}

                {/* Product Image */}
                <div className="h-48 bg-slate-50/80 p-4 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Manufacturer & Form */}
                    <div className="flex items-center justify-between text-[11px] text-muted mb-1">
                      <span className="truncate max-w-[140px] font-medium">{product.manufacturer}</span>
                      <span className="shrink-0">{product.form}</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-bold text-dark group-hover:text-primary transition line-clamp-2 leading-snug">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-amber-200/60">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                      <span className="text-[11px] text-muted">({product.reviewsCount})</span>
                      <span className="text-muted text-[11px]">•</span>
                      <span className="text-[11px] font-bold text-[#005CB9]">In Stock</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart Action */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-dark">
                          ₹{product.price.toFixed(2)}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="text-xs text-muted line-through">
                            ₹{product.mrp.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted block">Demo Unit Price</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product, 'medicine');
                      }}
                      className={`p-2.5 rounded-xl font-semibold text-xs flex items-center gap-1 transition ${
                        inCart
                          ? 'bg-[#005CB9] text-white shadow-xs'
                          : 'bg-primary-50 text-primary hover:bg-primary hover:text-white'
                      }`}
                      title={inCart ? 'Item in cart' : 'Add to cart'}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="font-bold">{inCart.quantity}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Medicines Button */}
        <div className="mt-10 text-center">
          <Link
            to="/medicines"
            className="btn-secondary text-xs sm:text-sm py-3 px-7 font-bold rounded-xl inline-flex items-center gap-2 shadow-xs hover:border-primary/50"
          >
            <span>Explore Complete Medicine Store (All Categories)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pharmacist Advice Callout Banner */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 via-teal-50 to-white rounded-3xl p-6 sm:p-8 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-card text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-dark">
                Need Help Finding the Right Medication?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Upload your doctor's prescription or consult with our advisory team. We verify dosage and interactions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onOpenPrescriptionModal}
              className="btn-primary text-xs sm:text-sm py-3 px-6 whitespace-nowrap w-full md:w-auto"
            >
              Upload Prescription Now
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
