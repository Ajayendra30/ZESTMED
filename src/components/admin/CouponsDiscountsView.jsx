// src/components/admin/CouponsDiscountsView.jsx
import React, { useState } from 'react';
import { 
  Tag, Plus, Search, Copy, Check, Calendar, 
  Percent, ArrowUpRight, Trash2, Edit, AlertCircle, ShoppingBag
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CouponsDiscountsView() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [couponsList, setCouponsList] = useState([
    {
      id: 'CPN-1',
      code: 'ZESTFIRST',
      title: 'New Patient Welcome Offer',
      discountType: 'percentage',
      discountValue: 20,
      minOrder: 500,
      maxDiscount: 300,
      applicableTo: 'Medicines & Lab Tests',
      validTill: '31 Dec 2026',
      totalUses: 482,
      maxUses: 1000,
      isActive: true
    },
    {
      id: 'CPN-2',
      code: 'WELL500',
      title: 'Full Body Wellness Checkup Saver',
      discountType: 'flat',
      discountValue: 500,
      minOrder: 1999,
      maxDiscount: 500,
      applicableTo: 'Wellness Packages Only',
      validTill: '31 Dec 2026',
      totalUses: 194,
      maxUses: 500,
      isActive: true
    },
    {
      id: 'CPN-3',
      code: 'SENIORCARE',
      title: 'Senior Citizen Special Care & Free Cab',
      discountType: 'percentage',
      discountValue: 15,
      minOrder: 1000,
      maxDiscount: 400,
      applicableTo: 'Geriatric Packages & Diagnostics',
      validTill: '31 Dec 2026',
      totalUses: 312,
      maxUses: 1000,
      isActive: true
    },
    {
      id: 'CPN-4',
      code: 'FREELAB',
      title: 'Free Home Phlebotomy Sample Collection',
      discountType: 'flat',
      discountValue: 150,
      minOrder: 499,
      maxDiscount: 150,
      applicableTo: 'Diagnostic Home Collection',
      validTill: '31 Dec 2026',
      totalUses: 620,
      maxUses: 2000,
      isActive: true
    },
    {
      id: 'CPN-5',
      code: 'HEALTH10',
      title: 'Recurring Medicine Refill Discount',
      discountType: 'percentage',
      discountValue: 10,
      minOrder: 300,
      maxDiscount: 200,
      applicableTo: 'Chronic Disease Prescription Medicines',
      validTill: '31 Dec 2026',
      totalUses: 850,
      maxUses: 5000,
      isActive: true
    }
  ]);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    title: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrder: 500,
    maxDiscount: 250,
    applicableTo: 'All Services',
    validTill: '2026-12-31',
    maxUses: 500
  });

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    addToast(`Coupon code ${code} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = (id) => {
    setCouponsList(prev => prev.map(c => {
      if (c.id === id) {
        const next = !c.isActive;
        addToast(`Coupon ${c.code} ${next ? 'activated' : 'deactivated'}`, next ? 'success' : 'info');
        return { ...c, isActive: next };
      }
      return c;
    }));
  };

  const handleDeleteCoupon = (id) => {
    setCouponsList(prev => prev.filter(c => c.id !== id));
    addToast('Coupon deleted', 'info');
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) {
      addToast('Please enter a coupon code', 'error');
      return;
    }

    const created = {
      id: `CPN-${Date.now()}`,
      code: newCoupon.code.toUpperCase().trim(),
      title: newCoupon.title.trim() || `${newCoupon.code} Promo Offer`,
      discountType: newCoupon.discountType,
      discountValue: parseFloat(newCoupon.discountValue) || 10,
      minOrder: parseFloat(newCoupon.minOrder) || 0,
      maxDiscount: parseFloat(newCoupon.maxDiscount) || 500,
      applicableTo: newCoupon.applicableTo,
      validTill: newCoupon.validTill,
      totalUses: 0,
      maxUses: parseInt(newCoupon.maxUses, 10) || 500,
      isActive: true
    };

    setCouponsList(prev => [created, ...prev]);
    addToast(`Coupon ${created.code} created successfully!`, 'success');
    setIsCreateModalOpen(false);
    setNewCoupon({
      code: '',
      title: '',
      discountType: 'percentage',
      discountValue: 20,
      minOrder: 500,
      maxDiscount: 250,
      applicableTo: 'All Services',
      validTill: '2026-12-31',
      maxUses: 500
    });
  };

  const filteredCoupons = couponsList.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.applicableTo.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Tag className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Coupons & Promotional Discounts
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              {couponsList.filter(c => c.isActive).length} Active Campaigns
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create, audit, and configure checkout promo discount codes across medicines, diagnostics, and wellness.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 text-xs font-bold text-white bg-[#007A64] hover:bg-[#006852] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Total Savings Given</div>
          <div className="text-xl font-black text-slate-900 font-mono">₹1,42,850</div>
          <span className="text-[10px] text-teal-700 font-bold">Patient Healthcare Subsidies</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Total Redemptions</div>
          <div className="text-xl font-black text-slate-900 font-mono">2,458</div>
          <span className="text-[10px] text-emerald-600 font-bold">Checkouts Completed</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Top Performing Code</div>
          <div className="text-xl font-black text-teal-700 font-mono">ZESTFIRST</div>
          <span className="text-[10px] text-slate-400">482 First-Time Patient Users</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Senior Discount Redeemed</div>
          <div className="text-xl font-black text-slate-900 font-mono">312 Rides</div>
          <span className="text-[10px] text-emerald-600 font-bold">100% Free Guwahati Cab</span>
        </div>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon code, campaign..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Cart Rules</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 font-mono font-black text-teal-800 text-xs">
                      <span>{c.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        className="text-teal-600 hover:text-teal-900 cursor-pointer"
                        title="Copy Code"
                      >
                        {copiedCode === c.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <span className="text-[10px] text-slate-400 block">{c.applicableTo}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 font-mono">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Max ₹{c.maxDiscount}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div>Min Spend: <strong className="font-mono text-slate-800">₹{c.minOrder}</strong></div>
                    <span className="text-[10px] text-slate-400 block">Valid till: {c.validTill}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-800">{c.totalUses} / {c.maxUses}</div>
                    <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div 
                        className="bg-teal-600 h-full rounded-full" 
                        style={{ width: `${Math.min(100, (c.totalUses / c.maxUses) * 100)}%` }} 
                      />
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c.id)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Tag className="w-5 h-5" />
                </span>
                <h3 className="font-black text-slate-900 text-base">Create Promotional Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MONSOON25"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-teal-800 uppercase outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campaign Title</label>
                  <input
                    type="text"
                    value={newCoupon.title}
                    onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                    placeholder="e.g. Monsoon Health Saver"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ FLAT)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {newCoupon.discountType === 'percentage' ? 'Discount Percentage (%) *' : 'Flat Discount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Cart Value (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrder}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Cap / Discount (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Applicable Services</label>
                  <select
                    value={newCoupon.applicableTo}
                    onChange={(e) => setNewCoupon({ ...newCoupon, applicableTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none"
                  >
                    <option value="All Services">All Platform Services</option>
                    <option value="Medicines Only">Medicines & Pharmacy Only</option>
                    <option value="Lab Tests Only">Diagnostic Lab Tests Only</option>
                    <option value="Wellness Packages">Wellness Packages Only</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newCoupon.validTill}
                    onChange={(e) => setNewCoupon({ ...newCoupon, validTill: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Launch Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
