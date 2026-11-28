// src/components/PatientReviewModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Star, MessageSquare, Send, CheckCircle2, Clock, 
  X, User, ShieldCheck, HeartHandshake, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createReview, getPatientReviews } from '../services/reviewService';

export default function PatientReviewModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'my-reviews'
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [service, setService] = useState('Diagnostic Lab Test');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const patientName = user?.name || user?.fullName || 'Valued Patient';
  const patientPhone = user?.phone || user?.phoneNumber || '';
  const patientEmail = user?.email || '';

  // Load reviews submitted by this patient
  const loadMyReviews = useCallback(async () => {
    if (!user) return;
    setIsLoadingReviews(true);
    try {
      const list = await getPatientReviews(user);
      setMyReviews(list || []);
    } catch (_) {}
    finally {
      setIsLoadingReviews(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadMyReviews();
    }
  }, [isOpen, loadMyReviews]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Please enter your experience or feedback remarks', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = await createReview({
        patientName,
        phone: patientPhone,
        email: patientEmail,
        service,
        clinic: 'Zestmed Central Lab & Polyclinic (Guwahati)',
        rating,
        comment: comment.trim(),
        userId: user?.id || null,
        status: 'Approved' // auto-approved for verified patient
      });

      addToast('Thank you! Your verified feedback has been recorded and submitted.', 'success');
      setComment('');
      setRating(5);
      setActiveTab('my-reviews');
      loadMyReviews();
    } catch (err) {
      addToast('Failed to submit review: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-800 to-[#007A64] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Star className="w-6 h-6 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">Patient Feedback & Reviews</h3>
              <p className="text-xs text-teal-100">Share your healthcare experience with ZESTMED</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'new'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Write a Review</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('my-reviews');
              loadMyReviews();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'my-reviews'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>My Submitted Reviews ({myReviews.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Patient Badge */}
              <div className="flex items-center gap-2 p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-teal-900">
                <ShieldCheck className="w-5 h-5 text-[#007A64] shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-1 font-bold">
                    <span>{patientName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                      Verified Patient
                    </span>
                  </div>
                  <span className="text-[11px] text-teal-700">{patientPhone || 'Guwahati, Assam'}</span>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Which service are you reviewing? *</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold outline-none focus:border-[#007A64]"
                >
                  <option value="Diagnostic Lab Test">Diagnostic Lab Test (Home Sample / Lab)</option>
                  <option value="Online Medicine Delivery">Online Medicine Delivery</option>
                  <option value="Doctor Consultation">Doctor Consultation (OPD / Video)</option>
                  <option value="Physiotherapy Rehabilitation">Physiotherapy Rehabilitation</option>
                  <option value="Wellness Health Package">Full Body Wellness Health Package</option>
                  <option value="Senior Citizen Pick-up Service">Senior Citizen Free Transport</option>
                  <option value="Surgery Care Package">Surgery Consultation & Package</option>
                </select>
              </div>

              {/* Star Rating Interactive Input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Your Overall Rating *</label>
                <div className="flex items-center gap-2 py-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer transition transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-black text-slate-800 ml-2 font-mono">
                    {rating} / 5 Stars {rating === 5 ? '★ Excellent!' : rating >= 4 ? '★ Good' : ''}
                  </span>
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Your Experience & Comments *</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the phlebotomist punctuality, medicine quality, doctor care, or clinic facility..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none focus:border-[#007A64]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#007A64] hover:bg-[#006852] text-white font-bold rounded-2xl shadow-sm cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Submitting Feedback...' : 'Submit Verified Review'}</span>
              </button>
            </form>
          )}

          {activeTab === 'my-reviews' && (
            <div className="space-y-3">
              {isLoadingReviews && (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#007A64]" />
                  <span>Loading your submitted reviews...</span>
                </div>
              )}

              {!isLoadingReviews && myReviews.length === 0 && (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Star className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">You haven't submitted any reviews yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="text-xs text-[#007A64] font-bold hover:underline"
                  >
                    Click here to write your first review!
                  </button>
                </div>
              )}

              {!isLoadingReviews && myReviews.map((r) => (
                <div 
                  key={r.id || r.reviewNumber}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 block">{r.service}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{r.date} • #{r.reviewNumber || r.id}</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(r.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{r.comment}"
                  </p>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'Approved' || r.isPublished
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {r.status === 'Approved' || r.isPublished ? '✓ Approved & Live' : 'Under Review'}
                    </span>
                  </div>

                  {/* Official Clinic Response */}
                  {r.officialReply && (
                    <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-100 space-y-1">
                      <span className="text-[10px] font-bold text-teal-800 uppercase block">
                        Official Response from ZESTMED Clinic:
                      </span>
                      <p className="text-slate-800 font-medium text-[11px]">{r.officialReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
