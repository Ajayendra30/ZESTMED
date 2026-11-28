// src/components/admin/SupportComplaintsView.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LifeBuoy, Search, Filter, CheckCircle2, Clock, 
  AlertTriangle, Phone, Mail, MessageSquare, Send, 
  ExternalLink, User, ChevronRight, RefreshCw, X, 
  ChevronDown, ArrowUpDown, PlusCircle, AlertCircle, 
  Check, ShieldAlert, Sparkles, Tag, Calendar
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { 
  fetchSupportTickets, 
  updateSupportTicketStatus, 
  respondToSupportTicket, 
  createSupportTicket 
} from '../../services/supportService';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function SupportComplaintsView() {
  const { addToast } = useToast();
  const [ticketsList, setTicketsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal States
  const [viewingTicket, setViewingTicket] = useState(null);
  const [respondingTicket, setRespondingTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('Resolved');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    category: 'Diagnostic Lab',
    priority: 'Normal',
    message: ''
  });
  const [isSubmittingNewTicket, setIsSubmittingNewTicket] = useState(false);

  // Load real tickets from Supabase PostgreSQL
  const loadTickets = useCallback(async (showToast = false) => {
    try {
      const tickets = await fetchSupportTickets();
      setTicketsList(tickets || []);
      if (showToast) {
        addToast('Support tickets synchronized from database', 'success');
      }
    } catch (err) {
      console.error('[SupportComplaintsView] Error loading tickets:', err);
      if (showToast) {
        addToast('Failed to fetch tickets: ' + err.message, 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadTickets();

    // Listen to real-time events
    const handleSync = () => loadTickets(false);
    window.addEventListener('storage', handleSync);
    window.addEventListener('zestmed_support_ticket_created', handleSync);
    window.addEventListener('zestmed_ticket_updated', handleSync);

    // Supabase real-time subscription
    let subscription = null;
    if (isSupabaseConfigured()) {
      try {
        subscription = supabase
          .channel('admin-support-inquiries-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
            loadTickets(false);
          })
          .subscribe();
      } catch (_) {}
    }

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('zestmed_support_ticket_created', handleSync);
      window.removeEventListener('zestmed_ticket_updated', handleSync);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [loadTickets]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadTickets(true);
  };

  // Status Change Handler
  const handleStatusChange = async (ticketId, nextStatus) => {
    try {
      await updateSupportTicketStatus(ticketId, nextStatus);
      setTicketsList(prev => prev.map(t => {
        if (t.id === ticketId || t.ticketRef === ticketId) {
          return { ...t, status: nextStatus, isResolved: nextStatus === 'Resolved' || nextStatus === 'Closed' };
        }
        return t;
      }));
      if (viewingTicket && (viewingTicket.id === ticketId || viewingTicket.ticketRef === ticketId)) {
        setViewingTicket(prev => ({ ...prev, status: nextStatus, isResolved: nextStatus === 'Resolved' || nextStatus === 'Closed' }));
      }
      addToast(`Ticket #${ticketId} status updated to ${nextStatus}`, 'success');
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  // Send Administrative Response
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!respondingTicket || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      await respondToSupportTicket(respondingTicket.ticketRef || respondingTicket.id, {
        replyMessage: replyMessage.trim(),
        adminName: 'Super Admin (Operations)',
        newStatus: replyStatus
      });

      setTicketsList(prev => prev.map(t => {
        if (t.id === respondingTicket.id || t.ticketRef === respondingTicket.ticketRef) {
          return {
            ...t,
            adminResponse: replyMessage.trim(),
            responseDate: new Date().toISOString(),
            respondedBy: 'Super Admin (Operations)',
            status: replyStatus,
            isResolved: replyStatus === 'Resolved' || replyStatus === 'Closed'
          };
        }
        return t;
      }));

      addToast(`Resolution note sent for Ticket #${respondingTicket.ticketRef} and saved in database!`, 'success');
      setRespondingTicket(null);
      setReplyMessage('');
    } catch (err) {
      addToast('Failed to save resolution note: ' + err.message, 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Submit New Support Ticket
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!newTicketForm.name || !newTicketForm.phone || !newTicketForm.message) {
      addToast('Please provide patient name, phone, and complaint description', 'error');
      return;
    }

    setIsSubmittingNewTicket(true);
    try {
      const created = await createSupportTicket({
        name: newTicketForm.name,
        phone: newTicketForm.phone,
        email: newTicketForm.email,
        subject: newTicketForm.subject || `${newTicketForm.category} Assistance`,
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        message: newTicketForm.message
      });

      setTicketsList(prev => [created, ...prev.filter(t => t.id !== created.id)]);
      addToast(`Support ticket #${created.ticketRef} created successfully in database!`, 'success');
      setIsCreateModalOpen(false);
      setNewTicketForm({
        name: '',
        phone: '',
        email: '',
        subject: '',
        category: 'Diagnostic Lab',
        priority: 'Normal',
        message: ''
      });
    } catch (err) {
      addToast('Failed to submit ticket: ' + err.message, 'error');
    } finally {
      setIsSubmittingNewTicket(false);
    }
  };

  // Filtered & Sorted Tickets
  const filteredTickets = useMemo(() => {
    return (ticketsList || []).filter(t => {
      // Status filter
      if (statusFilter !== 'all') {
        const s = (t.status || '').toLowerCase();
        if (statusFilter === 'open' && s !== 'open') return false;
        if (statusFilter === 'in progress' && !s.includes('progress')) return false;
        if (statusFilter === 'resolved' && s !== 'resolved') return false;
        if (statusFilter === 'closed' && s !== 'closed') return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        const c = (t.category || '').toLowerCase();
        if (!c.includes(categoryFilter.toLowerCase())) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all') {
        const p = (t.priority || '').toLowerCase();
        if (priorityFilter === 'high' && p !== 'high' && p !== 'urgent') return false;
        if (priorityFilter === 'normal' && p !== 'normal' && p !== 'medium') return false;
        if (priorityFilter === 'low' && p !== 'low') return false;
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const name = (t.patientName || '').toLowerCase();
        const phone = (t.phone || '').toLowerCase();
        const email = (t.email || '').toLowerCase();
        const subj = (t.subject || '').toLowerCase();
        const msg = (t.message || '').toLowerCase();
        const id = (t.ticketRef || t.id || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();

        const match = name.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          subj.includes(q) ||
          msg.includes(q) ||
          id.includes(q) ||
          cat.includes(q);

        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') {
        const pWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
        return (pWeight[b.priority?.toLowerCase()] || 0) - (pWeight[a.priority?.toLowerCase()] || 0);
      }
      if (sortBy === 'status') {
        const sWeight = { open: 4, 'in progress': 3, resolved: 2, closed: 1 };
        return (sWeight[b.status?.toLowerCase()] || 0) - (sWeight[a.status?.toLowerCase()] || 0);
      }
      return 0;
    });
  }, [ticketsList, statusFilter, categoryFilter, priorityFilter, searchQuery, sortBy]);

  // Status Badge Class
  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'resolved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'closed') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (s.includes('progress')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  // Priority Badge Class
  const getPriorityBadge = (priority = '') => {
    const p = priority.toLowerCase();
    if (p === 'urgent' || p === 'high') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (p === 'low') return 'bg-slate-50 text-slate-600 border-slate-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const openCount = ticketsList.filter(t => t.status === 'Open').length;
  const inProgressCount = ticketsList.filter(t => t.status === 'In Progress').length;
  const resolvedCount = ticketsList.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-[#00A68A]">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Support & Complaints Help Desk
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              {ticketsList.length} Total Tickets
            </span>
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Syncing Supabase...</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Connected to genuine Supabase PostgreSQL customer inquiries, grievance redressals, and patient assistance requests.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh from Supabase database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoading ? 'animate-spin text-[#00A68A]' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#007A64] hover:bg-[#006852] rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>All Tickets</span>
            <LifeBuoy className="w-3.5 h-3.5 opacity-60" />
          </div>
          <div className={`text-xl font-black ${statusFilter === 'all' ? 'text-white' : 'text-slate-900'}`}>
            {ticketsList.length}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('open')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'open' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-white border-slate-200/80 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>Open / Pending</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${statusFilter === 'open' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <div className={`text-xl font-black ${statusFilter === 'open' ? 'text-white' : 'text-slate-900'}`}>
            {openCount}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('in progress')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'in progress' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>In Progress</span>
            <Clock className={`w-3.5 h-3.5 ${statusFilter === 'in progress' ? 'text-white' : 'text-blue-500'}`} />
          </div>
          <div className={`text-xl font-black ${statusFilter === 'in progress' ? 'text-white' : 'text-slate-900'}`}>
            {inProgressCount}
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('resolved')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'resolved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white border-slate-200/80 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>Resolved / Closed</span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${statusFilter === 'resolved' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-xl font-black ${statusFilter === 'resolved' ? 'text-white' : 'text-slate-900'}`}>
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-teal-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-teal-600 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Diagnostic Lab">Diagnostic Lab</option>
            <option value="Pharmacy Orders">Pharmacy Orders</option>
            <option value="Doctor Consult">Doctor Consultations</option>
            <option value="Senior Citizen Care">Senior Citizen Care</option>
            <option value="Billing & Payments">Billing & Payments</option>
            <option value="General Support">General Support</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-teal-600 cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="priority">Sort: By Priority</option>
            <option value="status">Sort: Open First</option>
          </select>
        </div>

        {/* Search Box */}
        <div className="relative md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket ref, patient, message..."
            className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ticket Ref</th>
                <th className="py-3 px-4">Patient / Contact</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Category & Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading && filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#00A68A] mb-2" />
                    <p className="font-semibold text-slate-700">Loading support tickets from Supabase PostgreSQL...</p>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <LifeBuoy className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-bold text-slate-700 text-sm">No support tickets found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? 'Try clearing your search or status filters.'
                        : 'No patient complaints or inquiries currently recorded in the database.'}
                    </p>
                    {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('all');
                          setCategoryFilter('all');
                          setPriorityFilter('all');
                          setSearchQuery('');
                        }}
                        className="mt-3 px-4 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id || t.ticketRef} className="hover:bg-slate-50/80 transition group">
                    {/* 1. Ticket Ref & Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-black text-slate-900 block tracking-tight">{t.ticketRef}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    {/* 2. Patient / Contact */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{t.patientName}</div>
                      {t.phone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          <span>{t.phone}</span>
                        </div>
                      )}
                      {t.email && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[160px]" title={t.email}>
                          <Mail className="w-2.5 h-2.5 text-slate-400" />
                          <span>{t.email}</span>
                        </div>
                      )}
                    </td>

                    {/* 3. Subject & Description */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-bold text-slate-800 line-clamp-1">{t.subject}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{t.message}</p>
                      {t.adminResponse && (
                        <div className="mt-1.5 p-1.5 bg-emerald-50/80 border border-emerald-200/60 rounded-lg text-[10px] text-emerald-800 line-clamp-1 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Resolved: {t.adminResponse}</span>
                        </div>
                      )}
                    </td>

                    {/* 4. Category & Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 block w-max border border-slate-200/60">
                        {t.category}
                      </span>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded-full border ${getPriorityBadge(t.priority)}`}>
                        {t.priority} Priority
                      </span>
                    </td>

                    {/* 5. Status Selector */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.ticketRef || t.id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer appearance-none pr-6 ${getStatusBadge(t.status)}`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* 6. Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View Full Details */}
                        <button
                          type="button"
                          onClick={() => setViewingTicket(t)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="View Full Ticket Details"
                        >
                          View Details
                        </button>

                        {/* Reply / Resolution */}
                        <button
                          type="button"
                          onClick={() => {
                            setRespondingTicket(t);
                            setReplyMessage(t.adminResponse || '');
                            setReplyStatus(t.status === 'Open' ? 'Resolved' : t.status);
                          }}
                          className="px-2.5 py-1 bg-[#007A64] hover:bg-[#006852] text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Send Resolution Note to Patient"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. View Full Details Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-50 text-[#00A68A]">
                  <LifeBuoy className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">
                    Ticket #{viewingTicket.ticketRef}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Submitted on {new Date(viewingTicket.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingTicket(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient Information</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{viewingTicket.patientName}</h4>
                <div className="flex items-center gap-3 mt-1 text-slate-500 font-mono text-[11px]">
                  {viewingTicket.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {viewingTicket.phone}
                    </span>
                  )}
                  {viewingTicket.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {viewingTicket.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(viewingTicket.status)}`}>
                  {viewingTicket.status}
                </span>
                <span className={`block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(viewingTicket.priority)}`}>
                  {viewingTicket.priority} Priority
                </span>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject</span>
              <div className="font-bold text-slate-900 text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {viewingTicket.subject}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                {viewingTicket.message}
              </div>
            </div>

            {/* Admin Response Thread (if exists) */}
            {viewingTicket.adminResponse && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/70 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-800 font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Admin Resolution Note
                  </span>
                  <span className="text-[10px] font-normal text-emerald-600 font-mono">
                    {viewingTicket.responseDate ? new Date(viewingTicket.responseDate).toLocaleString('en-IN') : 'Saved'}
                  </span>
                </div>
                <p className="text-emerald-900 font-medium whitespace-pre-wrap">
                  {viewingTicket.adminResponse}
                </p>
                <span className="text-[10px] text-emerald-600 block mt-1">
                  Responded by: {viewingTicket.respondedBy || 'Zestmed Operations Lead'}
                </span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <select
                  value={viewingTicket.status}
                  onChange={(e) => handleStatusChange(viewingTicket.ticketRef || viewingTicket.id, e.target.value)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl border outline-none cursor-pointer ${getStatusBadge(viewingTicket.status)}`}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const t = viewingTicket;
                    setViewingTicket(null);
                    setRespondingTicket(t);
                    setReplyMessage(t.adminResponse || '');
                    setReplyStatus(t.status === 'Open' ? 'Resolved' : t.status);
                  }}
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{viewingTicket.adminResponse ? 'Update Response' : 'Write Response'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingTicket(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Write Resolution / Reply Modal */}
      {respondingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Respond to Ticket #{respondingTicket.ticketRef}
                </h3>
                <span className="text-xs text-slate-500">
                  Patient: {respondingTicket.patientName} ({respondingTicket.phone || respondingTicket.email})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRespondingTicket(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
              <strong className="block text-slate-900 font-bold">{respondingTicket.subject}</strong>
              <p className="text-slate-600 italic">"{respondingTicket.message}"</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Resolution Note / Reply Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Provide resolution details for the patient (e.g., 'Your lab sample has been prioritized for 5:00 PM publication' or 'Address updated on delivery')..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Update Ticket Status After Reply
                </label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold outline-none focus:border-teal-600"
                >
                  <option value="Resolved">Resolved (Recommended)</option>
                  <option value="In Progress">In Progress (Follow-up needed)</option>
                  <option value="Closed">Closed</option>
                  <option value="Open">Keep Open</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRespondingTicket(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingReply ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmittingReply ? 'Saving to Database...' : 'Save & Send Resolution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-[#00A68A]">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  Log New Patient Complaint / Support Ticket
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.name}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Ankit Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newTicketForm.phone}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 92791 25091"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-teal-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newTicketForm.email}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="patient@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Service Category *</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold outline-none focus:border-teal-600"
                  >
                    <option value="Diagnostic Lab">Diagnostic Lab</option>
                    <option value="Pharmacy Orders">Pharmacy Orders</option>
                    <option value="Doctor Consult">Doctor Consultations</option>
                    <option value="Surgery Packages">Surgery Packages</option>
                    <option value="Senior Citizen Care">Senior Citizen Care</option>
                    <option value="Billing & Payments">Billing & Payments</option>
                    <option value="General Support">General Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject / Issue Summary *</label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of the inquiry or issue"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Urgency / Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold outline-none focus:border-teal-600"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Medical Priority)</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newTicketForm.message}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Record all specific details shared by the patient..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none focus:border-teal-600"
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
                  disabled={isSubmittingNewTicket}
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingNewTicket ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PlusCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmittingNewTicket ? 'Saving...' : 'Save & Open Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
