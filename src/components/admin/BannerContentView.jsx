// src/components/admin/BannerContentView.jsx
import React, { useState } from 'react';
import { 
  Sliders, Eye, EyeOff, Edit, Plus, Image, 
  ExternalLink, CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function BannerContentView() {
  const { addToast } = useToast();
  const [editingBanner, setEditingBanner] = useState(null);

  const [topTickerText, setTopTickerText] = useState(
    'Flat 20% OFF on all Diagnostic Tests & Health Packages in Guwahati • Complimentary Home Phlebotomy Collection'
  );

  const [bannersList, setBannersList] = useState([
    {
      id: 'BAN-01',
      title: 'Senior Citizen Pick-up & Drop Service',
      subtitle: 'Guaranteed within 10 km radius in Guwahati, Assam • 100% Free Door-to-Door Sanitized Cab',
      badge: '100% Free Senior Care',
      badgeClass: 'bg-emerald-500 text-white',
      ctaText: 'Book Free Cab',
      targetUrl: '/senior-pickup',
      placement: 'Homepage Top Hero Banner',
      imagePath: '/senior-pickup-header-banner.jpg',
      isLive: true
    },
    {
      id: 'BAN-02',
      title: 'Monsoon Preventive Wellness & Full Body Health Checkup',
      subtitle: 'Comprehensive 60+ vital biomarker screening with same-day digital laboratory reports',
      badge: 'Flat 20% OFF',
      badgeClass: 'bg-teal-600 text-white',
      ctaText: 'View Wellness Packages',
      targetUrl: '/wellness-packages',
      placement: 'Diagnostics Section Ribbon',
      imagePath: '/health-packages-banner.jpg',
      isLive: true
    },
    {
      id: 'BAN-03',
      title: 'Senior Consultant Doctors OPD Clinic',
      subtitle: 'Book appointments with leading Cardiologists, Neurologists, and Orthopedic Specialists in Dispur',
      badge: 'Direct OPD Booking',
      badgeClass: 'bg-blue-600 text-white',
      ctaText: 'Book Doctor Consult',
      targetUrl: '/doctor-appointment',
      placement: 'Doctor Consultation Section',
      imagePath: '/hero-team.png',
      isLive: true
    },
    {
      id: 'BAN-04',
      title: '1-Hour Express Medicine Delivery in Guwahati',
      subtitle: '100% genuine sealed medicines from licensed Assam pharmacists with temperature-monitored courier',
      badge: 'Guwahati Express Delivery',
      badgeClass: 'bg-amber-600 text-white',
      ctaText: 'Order Medicines Now',
      targetUrl: '/medicines',
      placement: 'Pharmacy Store Banner',
      imagePath: '/medicine-delivery-banner.jpg',
      isLive: true
    }
  ]);

  const toggleBannerLive = (id) => {
    setBannersList(prev => prev.map(b => {
      if (b.id === id) {
        const next = !b.isLive;
        addToast(`Banner "${b.title}" is now ${next ? 'Live on website' : 'Hidden as draft'}`, next ? 'success' : 'info');
        return { ...b, isLive: next };
      }
      return b;
    }));
  };

  const handleSaveBanner = (e) => {
    e.preventDefault();
    setBannersList(prev => prev.map(b => b.id === editingBanner.id ? editingBanner : b));
    addToast('Website banner updated successfully!', 'success');
    setEditingBanner(null);
  };

  const handleUpdateTicker = (e) => {
    e.preventDefault();
    addToast('Top announcement bar ticker updated live!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Banner & Website Content Management
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              {bannersList.filter(b => b.isLive).length} Live Banners
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure promotional marketing ribbons, homepage hero banners, seasonal offers, and website announcements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => addToast('Add new promotional banner modal', 'info')}
          className="px-3.5 py-2 text-xs font-bold text-white bg-[#007A64] hover:bg-[#006852] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Global Top Announcement Ticker Editor */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Website Top Announcement Marquee Bar</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Appears across the top header of all public website pages for flash announcements.
        </p>

        <form onSubmit={handleUpdateTicker} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={topTickerText}
            onChange={(e) => setTopTickerText(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-teal-600 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
          >
            Update Live Ticker
          </button>
        </form>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bannersList.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-teal-200 transition">
            <div>
              {/* Placement & Status Tag */}
              <div className="flex items-center justify-between mb-2.5 text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {banner.placement}
                </span>

                <button
                  type="button"
                  onClick={() => toggleBannerLive(banner.id)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition ${
                    banner.isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {banner.isLive ? '● Live on Site' : '○ Draft'}
                </button>
              </div>

              {/* Banner Visual Preview Box */}
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-xl p-4 text-white relative overflow-hidden mb-3">
                <div className="relative z-10 space-y-1">
                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${banner.badgeClass}`}>
                    {banner.badge}
                  </span>
                  <h4 className="font-black text-sm text-white leading-tight">{banner.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{banner.subtitle}</p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300">
                      <span>{banner.ctaText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-400">Target: {banner.targetUrl}</span>
              <button
                type="button"
                onClick={() => setEditingBanner({ ...banner })}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3 h-3" />
                <span>Edit Content</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Edit Banner Content</h3>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={editingBanner.badge}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Button Call to Action</label>
                  <input
                    type="text"
                    value={editingBanner.ctaText}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Page URL</label>
                <input
                  type="text"
                  value={editingBanner.targetUrl}
                  onChange={(e) => setEditingBanner({ ...editingBanner, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
