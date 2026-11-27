// src/components/admin/ReviewsFeedbackView.jsx
import React, { useState } from 'react';
import { 
  Star, Search, Filter, CheckCircle2, EyeOff, Eye, 
  MessageSquare, UserCheck, Trash2, Award, ThumbsUp, Send
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ReviewsFeedbackView() {
  const { addToast } = useToast();
  const [filterRating, setFilterRating] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [reviewsList, setReviewsList] = useState([
    {
      id: 'REV-101',
      author: 'Ajayendra Shekhar',
      phone: '+91 92791 25091',
      rating: 5,
      date: '25 Nov 2026',
      service: 'Diagnostic Lab Test',
      clinic: 'Zestmed Central Lab (GS Road)',
      comment: 'Super fast home sample collection in Dispur. Phlebotomist arrived exactly on time with a temperature-monitored cold box. Verified digital report received the same evening!',
      isPublished: true,
      verifiedPatient: true,
      officialReply: 'Thank you for choosing ZESTMED Diagnostic Hub! We strive to deliver 100% accurate same-day diagnostic results.'
    },
    {
      id: 'REV-102',
      author: 'Dr. N. Bora',
      phone: '+91 94350 11982',
      rating: 5,
      date: '23 Nov 2026',
      service: 'Doctor Consultation',
      clinic: 'Zestmed Polyclinic Hub (Dispur)',
      comment: 'Very smooth clinical consultation process. The staff was polite and digital records were seamlessly uploaded into the patient dashboard.',
      isPublished: true,
      verifiedPatient: true,
      officialReply: null
    },
    {
      id: 'REV-103',
      author: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      rating: 4.5,
      date: '21 Nov 2026',
      service: 'Online Medicine Delivery',
      clinic: 'Zestmed Central Pharmacy',
      comment: 'Medicine delivery in 45 minutes in Ulubari. Genuine sealed medicines with proper Assam GST tax invoice. Will definitely reorder.',
      isPublished: true,
      verifiedPatient: true,
      officialReply: null
    },
    {
      id: 'REV-104',
      author: 'Priya Sharma',
      phone: '+91 94350 12345',
      rating: 5,
      date: '19 Nov 2026',
      service: 'Physiotherapy Rehabilitation',
      clinic: 'Zestmed Rehab Care',
      comment: 'The physiotherapist who visited our home for post-knee surgery rehab was extremely patient, gentle, and highly experienced. Great recovery progress!',
      isPublished: true,
      verifiedPatient: true,
      officialReply: 'Wishing your mother a rapid recovery! Our rehabilitation team is always at your service.'
    },
    {
      id: 'REV-105',
      author: 'Amit Verma',
      phone: '+91 97060 98765',
      rating: 4,
      date: '16 Nov 2026',
      service: 'Senior Citizen Pick-up Service',
      clinic: 'ZESTMED Care Transport',
      comment: 'The free senior citizen cab pick-up service is truly a lifesaver in Guwahati traffic. Clean sanitized EV, wheelchair ramp, and courteous chauffeur.',
      isPublished: true,
      verifiedPatient: true,
      officialReply: null
    },
    {
      id: 'REV-106',
      author: 'Sneha Singh',
      phone: '+91 91270 54321',
      rating: 5,
      date: '14 Nov 2026',
      service: 'Wellness Health Package',
      clinic: 'Zestmed Polyclinic Hub (Dispur)',
      comment: 'Comprehensive Full Body Wellness package covered all 60 parameters at a fraction of the cost elsewhere. Clean, professional facility.',
      isPublished: true,
      verifiedPatient: true,
      officialReply: null
    }
  ]);

  const togglePublishStatus = (id) => {
    setReviewsList(prev => prev.map(r => {
      if (r.id === id) {
        const next = !r.isPublished;
        addToast(`Review #${id} ${next ? 'published to website' : 'hidden from public view'}`, next ? 'success' : 'info');
        return { ...r, isPublished: next };
      }
      return r;
    }));
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReviewsList(prev => prev.map(r => {
      if (r.id === replyingReview.id) {
        return { ...r, officialReply: replyText.trim() };
      }
      return r;
    }));
    addToast('Official clinic reply published!', 'success');
    setReplyingReview(null);
    setReplyText('');
  };

  const filteredReviews = reviewsList.filter(r => {
    const matchesRating = filterRating === 'all' || Math.floor(r.rating) === parseInt(filterRating, 10);
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && r.isPublished) ||
      (statusFilter === 'hidden' && !r.isPublished);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      r.author.toLowerCase().includes(q) ||
      r.service.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q);
    return matchesRating && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Reviews & Feedback
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
              4.9 / 5.0 Rating
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Moderate verified patient feedback, manage published testimonials, and post official clinical responses.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>98.4% Recommendation Rate</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Moderation Status</option>
            <option value="published">Published Live</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search review, patient, comment..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-amber-600 outline-none"
          />
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-amber-200 transition">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{r.author}</h4>
                    {r.verifiedPatient && (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 block mt-0.5">{r.service}</span>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(r.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{r.date}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mb-2.5">
                "{r.comment}"
              </p>

              {r.officialReply && (
                <div className="bg-teal-50/70 p-2.5 rounded-xl border border-teal-100 text-xs text-slate-700 mb-2.5">
                  <span className="text-[10px] uppercase font-bold text-teal-800 block mb-0.5">Official ZESTMED Response:</span>
                  <p className="text-slate-800 font-medium text-[11px]">{r.officialReply}</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => togglePublishStatus(r.id)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
                  r.isPublished ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{r.isPublished ? 'Live on Website' : 'Hidden'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReplyingReview(r);
                  setReplyText(r.officialReply || '');
                }}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{r.officialReply ? 'Edit Reply' : 'Post Reply'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Reply to Patient Feedback</h3>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700">
              <strong>{replyingReview.author}</strong> on {replyingReview.service}:
              <p className="italic mt-1">"{replyingReview.comment}"</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Response *</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the patient and address their remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save & Publish Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
