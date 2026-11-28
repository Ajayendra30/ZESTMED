// src/components/admin/ReviewsFeedbackView.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Star, Search, Filter, CheckCircle2, EyeOff, Eye, 
  MessageSquare, UserCheck, Trash2, Award, ThumbsUp, Send,
  RefreshCw, PlusCircle, AlertCircle, AlertTriangle, ShieldAlert,
  ChevronDown, X, User, Phone, Mail, Calendar, Sparkles,
  ArrowUpDown, ExternalLink, Check, Flag
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { 
  fetchReviews, 
  updateReviewStatus, 
  replyToReview, 
  createReview,
  calculateRatingMetrics 
} from '../../services/reviewService';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function ReviewsFeedbackView() {
  const { addToast } = useToast();
  const [reviewsList, setReviewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal States
  const [viewingReview, setViewingReview] = useState(null);
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    author: '',
    phone: '',
    email: '',
    service: 'Diagnostic Lab Test',
    clinic: 'Zestmed Central Lab (GS Road)',
    rating: 5,
    comment: '',
    status: 'Approved'
  });
  const [isSubmittingNewReview, setIsSubmittingNewReview] = useState(false);

  // Load reviews from Supabase PostgreSQL & Backend API
  const loadReviews = useCallback(async (showToast = false) => {
    try {
      const data = await fetchReviews();
      setReviewsList(data || []);
      if (showToast) {
        addToast('Reviews synchronized with Supabase database', 'success');
      }
    } catch (err) {
      console.error('[ReviewsFeedbackView] Error loading reviews:', err);
      if (showToast) {
        addToast('Failed to load reviews: ' + err.message, 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadReviews();

    // Listen to real-time events
    const handleSync = () => loadReviews(false);
    window.addEventListener('storage', handleSync);
    window.addEventListener('zestmed_review_created', handleSync);
    window.addEventListener('zestmed_review_updated', handleSync);

    // Supabase real-time channel
    let subscription = null;
    if (isSupabaseConfigured()) {
      try {
        subscription = supabase
          .channel('admin-reviews-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
            loadReviews(false);
          })
          .subscribe();
      } catch (_) {}
    }

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('zestmed_review_created', handleSync);
      window.removeEventListener('zestmed_review_updated', handleSync);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [loadReviews]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadReviews(true);
  };

  // Toggle Publish / Live Status
  const togglePublishStatus = async (review) => {
    const nextPublished = !review.isPublished;
    const nextStatus = nextPublished ? 'Approved' : 'Pending';

    try {
      await updateReviewStatus(review.reviewNumber || review.id, nextStatus);
      setReviewsList(prev => prev.map(r => {
        if (r.id === review.id || r.reviewNumber === review.reviewNumber) {
          return { ...r, isPublished: nextPublished, status: nextStatus };
        }
        return r;
      }));
      addToast(
        `Review #${review.reviewNumber || review.id} ${nextPublished ? 'published live to website' : 'hidden from public view'}`,
        nextPublished ? 'success' : 'info'
      );
    } catch (err) {
      addToast(`Failed to update review visibility: ${err.message}`, 'error');
    }
  };

  // Change Moderation Status (Approved, Pending, Flagged, Rejected)
  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      const isPublished = newStatus === 'Approved';
      setReviewsList(prev => prev.map(r => {
        if (r.id === reviewId || r.reviewNumber === reviewId) {
          return { ...r, status: newStatus, isPublished };
        }
        return r;
      }));
      if (viewingReview && (viewingReview.id === reviewId || viewingReview.reviewNumber === reviewId)) {
        setViewingReview(prev => ({ ...prev, status: newStatus, isPublished }));
      }
      addToast(`Review status updated to "${newStatus}"`, 'success');
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  // Send / Save Official Clinic Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const reviewKey = replyingReview.reviewNumber || replyingReview.id;
      await replyToReview(reviewKey, {
        replyText: replyText.trim(),
        adminName: 'Super Admin (Operations)'
      });

      setReviewsList(prev => prev.map(r => {
        if (r.id === replyingReview.id || r.reviewNumber === replyingReview.reviewNumber) {
          return {
            ...r,
            officialReply: replyText.trim(),
            replyDate: new Date().toISOString(),
            repliedBy: 'Super Admin (Operations)'
          };
        }
        return r;
      }));

      if (viewingReview && (viewingReview.id === replyingReview.id || viewingReview.reviewNumber === replyingReview.reviewNumber)) {
        setViewingReview(prev => ({
          ...prev,
          officialReply: replyText.trim(),
          replyDate: new Date().toISOString(),
          repliedBy: 'Super Admin (Operations)'
        }));
      }

      addToast(`Official clinic reply saved permanently for Review #${reviewKey}!`, 'success');
      setReplyingReview(null);
      setReplyText('');
    } catch (err) {
      addToast(`Failed to save reply: ${err.message}`, 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handle Add New Review / Testimonial
  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newReviewForm.author.trim() || !newReviewForm.comment.trim()) {
      addToast('Please enter patient name and feedback comment', 'warning');
      return;
    }

    setIsSubmittingNewReview(true);
    try {
      const created = await createReview(newReviewForm);
      setReviewsList(prev => [created, ...prev.filter(r => r.id !== created.id)]);
      addToast(`Review #${created.reviewNumber || created.id} recorded successfully!`, 'success');
      setIsCreateModalOpen(false);
      setNewReviewForm({
        author: '',
        phone: '',
        email: '',
        service: 'Diagnostic Lab Test',
        clinic: 'Zestmed Central Lab (GS Road)',
        rating: 5,
        comment: '',
        status: 'Approved'
      });
    } catch (err) {
      addToast(`Failed to record review: ${err.message}`, 'error');
    } finally {
      setIsSubmittingNewReview(false);
    }
  };

  // Metrics computation from genuine reviews
  const metrics = useMemo(() => {
    return calculateRatingMetrics(reviewsList);
  }, [reviewsList]);

  // Unique services list for filtering
  const availableServices = useMemo(() => {
    const set = new Set();
    reviewsList.forEach(r => {
      if (r.service) set.add(r.service);
    });
    return Array.from(set);
  }, [reviewsList]);

  // Filter & Search Logic
  const filteredReviews = useMemo(() => {
    return reviewsList.filter(r => {
      // Rating filter
      const matchesRating = filterRating === 'all' || Math.floor(r.rating) === parseInt(filterRating, 10);

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'approved') matchesStatus = r.status === 'Approved' || r.isPublished;
      else if (statusFilter === 'pending') matchesStatus = r.status === 'Pending';
      else if (statusFilter === 'flagged') matchesStatus = r.status === 'Flagged';
      else if (statusFilter === 'rejected') matchesStatus = r.status === 'Rejected';
      else if (statusFilter === 'hidden') matchesStatus = !r.isPublished;

      // Service filter
      const matchesService = serviceFilter === 'all' || r.service === serviceFilter;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (r.author && r.author.toLowerCase().includes(q)) ||
        (r.service && r.service.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q)) ||
        (r.reviewNumber && r.reviewNumber.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q));

      return matchesRating && matchesStatus && matchesService && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });
  }, [reviewsList, filterRating, statusFilter, serviceFilter, searchQuery, sortBy]);

  const getStatusBadge = (status, isPublished) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Check className="w-2.5 h-2.5" />
            <span>Approved (Live)</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>Pending Approval</span>
          </span>
        );
      case 'Flagged':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Flag className="w-2.5 h-2.5 text-purple-600" />
            <span>Flagged for Review</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
            <X className="w-2.5 h-2.5 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPublished ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'}`}>
            {isPublished ? 'Live' : 'Hidden'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Analytics Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Reviews & Feedback Console
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 font-mono">
              ★ {metrics.average} / 5.0 Rating
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Moderate verified patient feedback, manage published testimonials, and post official clinical responses.
          </p>
        </div>

        {/* Action Controls & Top Metrics */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{metrics.recommendationRate}% Recommendation Rate</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#007A64]' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Star Rating Distribution Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = metrics.distribution[star] || 0;
            const pct = metrics.percentages[star] || 0;
            return (
              <div 
                key={star} 
                onClick={() => setFilterRating(filterRating === String(star) ? 'all' : String(star))}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  filterRating === String(star) 
                    ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-200' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{count} ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Star Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">★ 5 Stars Only</option>
            <option value="4">★ 4 Stars Only</option>
            <option value="3">★ 3 Stars Only</option>
            <option value="2">★ 2 Stars Only</option>
            <option value="1">★ 1 Star Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Moderation Status</option>
            <option value="approved">Approved & Live</option>
            <option value="pending">Pending Approval</option>
            <option value="flagged">Flagged for Review</option>
            <option value="rejected">Rejected</option>
            <option value="hidden">Hidden from Website</option>
          </select>

          {/* Service Filter */}
          {availableServices.length > 0 && (
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none max-w-[160px] truncate"
            >
              <option value="all">All Services</option>
              {availableServices.map((srv, idx) => (
                <option key={idx} value={srv}>{srv}</option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest">Sort: Highest Rating</option>
            <option value="lowest">Sort: Lowest Rating</option>
          </select>
        </div>

        {/* Search input */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, review, service, ID..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#007A64] outline-none"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 text-[#007A64] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">Fetching verified reviews from database...</p>
          <p className="text-xs text-slate-500 mt-1">Connecting to Supabase PostgreSQL review registry</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredReviews.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Patient Reviews Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || filterRating !== 'all' || statusFilter !== 'all' || serviceFilter !== 'all'
              ? 'No reviews match your current filters. Try resetting the search or filter criteria.'
              : 'There are currently no reviews recorded in the database.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            {(searchQuery || filterRating !== 'all' || statusFilter !== 'all' || serviceFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterRating('all');
                  setStatusFilter('all');
                  setServiceFilter('all');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#007A64] hover:bg-[#006852] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              + Record Patient Review
            </button>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      {!isLoading && filteredReviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((r) => (
            <div 
              key={r.id || r.reviewNumber} 
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition duration-150"
            >
              <div>
                {/* Header: Author, Rating, Status, Date */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-[#007A64] font-black text-xs flex items-center justify-center shrink-0">
                        {r.author ? r.author.charAt(0).toUpperCase() : 'P'}
                      </div>
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
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < Math.floor(r.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1 font-mono">{r.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className="text-[10px] font-mono text-slate-400">{r.date}</span>
                      <span className="text-[10px] font-mono text-slate-400">#{r.reviewNumber || r.id}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Clinic Hub info */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 text-[11px]">
                  <span className="text-slate-500 truncate">{r.clinic}</span>
                  <div>{getStatusBadge(r.status, r.isPublished)}</div>
                </div>

                {/* Patient Review Text */}
                <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mb-3">
                  "{r.comment}"
                </p>

                {/* Official Response Banner */}
                {r.officialReply && (
                  <div className="bg-teal-50/80 p-2.5 rounded-xl border border-teal-100 text-xs text-slate-700 mb-3">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-teal-800 mb-1">
                      <span>Official ZESTMED Response</span>
                      {r.replyDate && (
                        <span className="text-teal-600 font-normal">
                          {new Date(r.replyDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 font-medium text-[11px] leading-relaxed">{r.officialReply}</p>
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Moderation Dropdown */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={r.status || 'Approved'}
                    onChange={(e) => handleStatusChange(r.reviewNumber || r.id, e.target.value)}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="Approved">Approve (Live)</option>
                    <option value="Pending">Pending</option>
                    <option value="Flagged">Flag</option>
                    <option value="Rejected">Reject</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => togglePublishStatus(r)}
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition ${
                      r.isPublished 
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title={r.isPublished ? 'Click to hide from website' : 'Click to publish on website'}
                  >
                    {r.isPublished ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
                    <span>{r.isPublished ? 'Live' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Details & Reply Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewingReview(r)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    Details
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyingReview(r);
                      setReplyText(r.officialReply || '');
                    }}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{r.officialReply ? 'Edit Reply' : 'Post Reply'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. VIEW FULL REVIEW DETAILS MODAL                        */}
      {/* ======================================================== */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Review Details</h3>
                  <span className="text-xs text-slate-500 font-mono">#{viewingReview.reviewNumber || viewingReview.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReview(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Patient & Service Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient Name</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-teal-600" />
                  {viewingReview.author}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Reviewed</span>
                <span className="font-bold text-teal-700 block mt-0.5">{viewingReview.service}</span>
              </div>
              {viewingReview.phone && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {viewingReview.phone}
                  </span>
                </div>
              )}
              {viewingReview.email && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {viewingReview.email}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Star Rating</span>
                <div className="flex items-center gap-1 mt-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < Math.floor(viewingReview.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                  <span className="font-bold text-slate-800 ml-1">({viewingReview.rating} / 5)</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                <div className="mt-0.5">{getStatusBadge(viewingReview.status, viewingReview.isPublished)}</div>
              </div>
            </div>

            {/* Review Comment Body */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">Patient Feedback:</span>
              <p className="text-xs text-slate-800 italic bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100 leading-relaxed">
                "{viewingReview.comment}"
              </p>
            </div>

            {/* Official Response if any */}
            {viewingReview.officialReply && (
              <div className="bg-teal-50 p-3 rounded-2xl border border-teal-100 text-xs">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-teal-800 mb-1">
                  <span>Official Clinic Response</span>
                  {viewingReview.replyDate && (
                    <span className="text-teal-600 font-normal">
                      {new Date(viewingReview.replyDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <p className="text-slate-800 font-medium text-[11px] leading-relaxed">{viewingReview.officialReply}</p>
                {viewingReview.repliedBy && (
                  <span className="text-[10px] text-teal-600 font-medium block mt-1">Posted by: {viewingReview.repliedBy}</span>
                )}
              </div>
            )}

            {/* Actions Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(viewingReview.reviewNumber || viewingReview.id, 'Approved')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 cursor-pointer"
                >
                  Approve Live
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(viewingReview.reviewNumber || viewingReview.id, 'Rejected')}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer"
                >
                  Reject
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplyingReview(viewingReview);
                    setReplyText(viewingReview.officialReply || '');
                    setViewingReview(null);
                  }}
                  className="px-3 py-1.5 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReview(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. REPLY / CLINIC RESPONSE MODAL                         */}
      {/* ======================================================== */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Reply to Patient Feedback</h3>
                <span className="text-xs text-slate-500 font-mono">Review #{replyingReview.reviewNumber || replyingReview.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-slate-700">
              <strong className="text-slate-900">{replyingReview.author}</strong> on {replyingReview.service}:
              <p className="italic mt-1 text-slate-600">"{replyingReview.comment}"</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Response *</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the patient and address their remarks professionally..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none focus:border-[#007A64]"
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
                  disabled={isSubmittingReply}
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingReply && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingReply ? 'Saving...' : 'Save & Publish Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. RECORD NEW REVIEW MODAL                               */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-[#007A64]">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Record Patient Review</h3>
                  <span className="text-xs text-slate-500">Save genuine testimonial directly in database</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kalita"
                    value={newReviewForm.author}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#007A64]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9XXXXXXXXX"
                    value={newReviewForm.phone}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#007A64]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service *</label>
                  <select
                    value={newReviewForm.service}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, service: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#007A64]"
                  >
                    <option value="Diagnostic Lab Test">Diagnostic Lab Test</option>
                    <option value="Online Medicine Delivery">Online Medicine Delivery</option>
                    <option value="Doctor Consultation">Doctor Consultation</option>
                    <option value="Physiotherapy Rehabilitation">Physiotherapy Rehabilitation</option>
                    <option value="Wellness Health Package">Wellness Health Package</option>
                    <option value="Senior Citizen Pick-up Service">Senior Citizen Pick-up Service</option>
                    <option value="Surgery Care Package">Surgery Care Package</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Star Rating (1 - 5) *</label>
                  <div className="flex items-center gap-1 py-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setNewReviewForm({ ...newReviewForm, rating: num })}
                        className="p-1 cursor-pointer"
                      >
                        <Star 
                          className={`w-5 h-5 ${num <= newReviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                        />
                      </button>
                    ))}
                    <span className="font-bold text-slate-800 ml-2 font-mono">{newReviewForm.rating} / 5</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Patient Feedback / Testimonial *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter detailed feedback from patient..."
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none focus:border-[#007A64]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewReview}
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingNewReview && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingNewReview ? 'Saving...' : 'Save to Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
