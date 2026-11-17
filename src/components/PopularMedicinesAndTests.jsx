// src/components/PopularMedicinesAndTests.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Pill, FlaskConical, Heart, ShoppingCart, Calendar, 
  ArrowRight, Droplet, Activity, ShieldCheck, HeartPulse 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function PopularMedicinesAndTests({ onSelectProduct, onSelectTest, onSelectPackage }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState({});

  const toggleWishlist = (id, name, e) => {
    e.stopPropagation();
    setWishlisted((prev) => {
      const next = !prev[id];
      addToast(next ? `${name} added to wishlist` : `${name} removed from wishlist`, 'info');
      return { ...prev, [id]: next };
    });
  };

  const popularMedicines = [
    {
      id: 'med-paracetamol-500',
      name: 'Paracetamol 500 mg',
      packing: '(10 Tablets)',
      price: 32,
      mrp: 40,
      discount: '20% Off',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      type: 'medicine',
      genericName: 'Paracetamol IP 500mg'
    },
    {
      id: 'med-amoxicillin-500',
      name: 'Amoxicillin 500 mg',
      packing: '(10 Capsules)',
      price: 78,
      mrp: 98,
      discount: '20% Off',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80',
      type: 'medicine',
      genericName: 'Amoxicillin Trihydrate IP 500mg'
    },
    {
      id: 'med-omeprazole-20',
      name: 'Omeprazole 20 mg',
      packing: '(10 Capsules)',
      price: 62,
      mrp: 75,
      discount: '17% Off',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80',
      type: 'medicine',
      genericName: 'Omeprazole Gastro-Resistant 20mg'
    }
  ];

  const popularTests = [
    {
      id: 'test-cbc-cbc',
      name: 'Complete Blood Count (CBC)',
      price: 399,
      mrp: 600,
      discount: '33% Off',
      type: 'test',
      image: '/popular-test-cbc.jpg'
    },
    {
      id: 'test-thyroid-profile',
      name: 'Thyroid Profile (T3, T4, TSH)',
      price: 699,
      mrp: 1000,
      discount: '30% Off',
      type: 'test',
      image: '/popular-test-thyroid.jpg'
    },
    {
      id: 'test-lft-profile',
      name: 'Liver Function Test (LFT)',
      price: 599,
      mrp: 850,
      discount: '30% Off',
      type: 'test',
      image: '/popular-test-lft.png'
    }
  ];

  const checkupPackages = [
    {
      id: 'pkg-basic-checkup',
      name: 'Basic Health Checkup',
      price: 999,
      mrp: 1499,
      type: 'package'
    },
    {
      id: 'pkg-complete-body',
      name: 'Complete Body Checkup',
      price: 1999,
      mrp: 2999,
      type: 'package'
    },
    {
      id: 'pkg-diabetes-screening',
      name: 'Diabetes Screening',
      price: 799,
      mrp: 1199,
      type: 'package'
    },
    {
      id: 'pkg-womens-health',
      name: "Women's Health Package",
      price: 1299,
      mrp: 1999,
      type: 'package'
    },
    {
      id: 'pkg-senior-citizen',
      name: 'Senior Citizen Health Package',
      price: 1699,
      mrp: 2499,
      type: 'package'
    }
  ];

  const handleAddToCart = (item, e) => {
    e.stopPropagation();
    addItem(item);
    addToast(`${item.name} added to cart`, 'success');
  };

  const handleBookTest = (test, e) => {
    e.stopPropagation();
    addItem({
      ...test,
      price: test.price,
      name: test.name
    });
    addToast(`${test.name} booked! Added to cart`, 'success');
  };

  const handleSelectPackage = (pkg) => {
    if (onSelectPackage) {
      onSelectPackage(pkg);
    } else {
      navigate('/packages');
    }
  };

  return (
    <section className="py-8 sm:py-10 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-6 sm:space-y-8">
        
        {/* ROW 1: Popular Medicines & Popular Diagnostic Tests (Side-by-Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Box 1: Popular Medicines */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008F83] flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Popular Medicines
                </h3>
              </div>
              <Link
                to="/medicines"
                className="text-xs sm:text-sm font-bold text-[#008F83] hover:text-[#007a70] flex items-center gap-1 group transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 3 Medicine Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {popularMedicines.map((med) => {
                const isFav = wishlisted[med.id];
                return (
                  <div
                    key={med.id}
                    onClick={() => onSelectProduct && onSelectProduct(med)}
                    className="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between hover:shadow-md hover:border-[#008F83]/40 transition cursor-pointer relative group"
                  >
                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(med.id, med.name, e)}
                      aria-label="Wishlist"
                      className="absolute top-2.5 right-2.5 z-10 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Image */}
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-2.5">
                      <img
                        src={med.image}
                        alt={med.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-1">
                        {med.name}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500">
                        {med.packing}
                      </p>
                      
                      {/* Price & Discount */}
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="font-extrabold text-sm text-slate-900">
                          ₹{med.price}
                        </span>
                        <span className="line-through text-xs text-slate-400 font-medium">
                          ₹{med.mrp}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 ml-auto">
                          {med.discount}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart CTA */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(med, e)}
                      className="w-full mt-3 bg-[#008F83] hover:bg-[#007a70] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Box 2: Popular Diagnostic Tests */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008F83] flex items-center justify-center shrink-0">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Popular Diagnostic Tests
                </h3>
              </div>
              <Link
                to="/diagnostics"
                className="text-xs sm:text-sm font-bold text-[#008F83] hover:text-[#007a70] flex items-center gap-1 group transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 3 Diagnostic Test Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {popularTests.map((test) => {
                const isFav = wishlisted[test.id];
                return (
                  <div
                    key={test.id}
                    onClick={() => onSelectTest && onSelectTest(test)}
                    className="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between hover:shadow-md hover:border-[#008F83]/40 transition cursor-pointer relative group text-center"
                  >
                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(test.id, test.name, e)}
                      aria-label="Wishlist"
                      className="absolute top-2.5 right-2.5 z-10 p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Diagnostic Test Image */}
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-2.5">
                      <img
                        src={test.image}
                        alt={test.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug min-h-[38px] flex items-center justify-center">
                        {test.name}
                      </h4>
                      
                      {/* Price & Discount */}
                      <div className="flex items-baseline justify-between gap-1 pt-1">
                        <div className="flex items-baseline gap-1">
                          <span className="font-extrabold text-sm text-slate-900">
                            ₹{test.price}
                          </span>
                          <span className="line-through text-xs text-slate-400 font-medium">
                            ₹{test.mrp}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                          {test.discount}
                        </span>
                      </div>
                    </div>

                    {/* Book Now CTA */}
                    <button
                      type="button"
                      onClick={(e) => handleBookTest(test, e)}
                      className="w-full mt-3 bg-[#008F83] hover:bg-[#007a70] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Now</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
