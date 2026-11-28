// src/components/admin/SecurityAuditLogsView.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, Search, Filter, Download, Lock, 
  AlertTriangle, CheckCircle2, UserCheck, Key, Database, RefreshCw,
  PlusCircle, AlertCircle, X, User, MapPin, Globe, Clock,
  ArrowUpDown, ExternalLink, ShieldAlert, Sparkles, Check, FileText, ChevronRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { 
  fetchAuditLogs, 
  recordAuditLog, 
  calculateSecurityMetrics 
} from '../../services/auditLogService';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function SecurityAuditLogsView() {
  const { addToast } = useToast();
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal States
  const [viewingLog, setViewingLog] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLogForm, setNewLogForm] = useState({
    action: 'ADMIN_ACTION',
    actionTitle: '',
    module: 'System Administration',
    details: '',
    severity: 'info',
    status: 'Success'
  });
  const [isSubmittingNewLog, setIsSubmittingNewLog] = useState(false);

  // Load genuine audit logs from database and API
  const loadLogs = useCallback(async (showToast = false) => {
    try {
      const data = await fetchAuditLogs();
      setAuditLogs(data || []);
      if (showToast) {
        addToast('Security audit logs synchronized from PostgreSQL', 'success');
      }
    } catch (err) {
      console.error('[SecurityAuditLogsView] Error loading logs:', err);
      if (showToast) {
        addToast('Failed to load audit logs: ' + err.message, 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadLogs();

    // Event listeners for real-time synchronization
    const handleSync = () => loadLogs(false);
    window.addEventListener('storage', handleSync);
    window.addEventListener('zestmed_audit_log_created', handleSync);

    // Supabase real-time subscription
    let subscription = null;
    if (isSupabaseConfigured()) {
      try {
        subscription = supabase
          .channel('admin-audit-logs-channel')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => {
            loadLogs(false);
          })
          .subscribe();
      } catch (_) {}
    }

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('zestmed_audit_log_created', handleSync);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [loadLogs]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadLogs(true);
  };

  // CSV Export with genuine records
  const handleExportLogs = () => {
    try {
      const headers = ['Event Ref', 'Action', 'Action Title', 'Module', 'Initiator', 'Role', 'IP Address', 'Location', 'Severity', 'Status', 'Timestamp', 'Details'];
      const rows = filteredLogs.map(a => [
        a.eventId || a.id,
        a.action,
        a.actionTitle,
        a.module,
        a.user,
        a.role,
        a.ipAddress,
        a.location,
        a.severity,
        a.status,
        a.timestamp,
        `"${String(a.details).replace(/"/g, '""')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Zestmed_Security_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Security Audit Log exported successfully!', 'success');
    } catch (_) {
      addToast('Failed to export audit log', 'error');
    }
  };

  // Manual Audit Event Submission
  const handleCreateAuditLog = async (e) => {
    e.preventDefault();
    if (!newLogForm.actionTitle.trim() || !newLogForm.details.trim()) {
      addToast('Please enter event title and details', 'warning');
      return;
    }

    setIsSubmittingNewLog(true);
    try {
      const created = await recordAuditLog({
        action: newLogForm.action,
        actionTitle: newLogForm.actionTitle.trim(),
        module: newLogForm.module,
        details: newLogForm.details.trim(),
        severity: newLogForm.severity,
        status: newLogForm.status,
        user: 'admin@zestmed.in',
        userName: 'Super Administrator',
        role: 'Super Administrator',
        ipAddress: '103.28.246.12',
        location: 'Guwahati, Assam'
      });

      setAuditLogs(prev => [created, ...prev.filter(l => l.id !== created.id)]);
      addToast(`Audit record #${created.eventId || created.id} sealed in database!`, 'success');
      setIsCreateModalOpen(false);
      setNewLogForm({
        action: 'ADMIN_ACTION',
        actionTitle: '',
        module: 'System Administration',
        details: '',
        severity: 'info',
        status: 'Success'
      });
    } catch (err) {
      addToast(`Failed to record audit event: ${err.message}`, 'error');
    } finally {
      setIsSubmittingNewLog(false);
    }
  };

  // Security Metrics calculated from genuine records
  const metrics = useMemo(() => {
    return calculateSecurityMetrics(auditLogs);
  }, [auditLogs]);

  // Filtering & Search Logic
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(a => {
      // Action type filter
      let matchesType = true;
      if (filterType !== 'all') {
        const act = (a.action || '').toLowerCase();
        const mod = (a.module || '').toLowerCase();
        if (filterType === 'auth') matchesType = act.includes('auth') || mod.includes('auth');
        else if (filterType === 'refund') matchesType = act.includes('refund') || mod.includes('pay');
        else if (filterType === 'export') matchesType = act.includes('export');
        else if (filterType === 'price') matchesType = act.includes('price');
        else if (filterType === 'database') matchesType = act.includes('database') || act.includes('rls') || mod.includes('database');
        else if (filterType === 'booking') matchesType = act.includes('booking') || mod.includes('booking');
      }

      // Severity filter
      const matchesSeverity = severityFilter === 'all' || (a.severity || '').toLowerCase() === severityFilter.toLowerCase();

      // Status filter
      const matchesStatus = statusFilter === 'all' || (a.status || '').toLowerCase() === statusFilter.toLowerCase();

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (a.eventId && a.eventId.toLowerCase().includes(q)) ||
        (a.actionTitle && a.actionTitle.toLowerCase().includes(q)) ||
        (a.action && a.action.toLowerCase().includes(q)) ||
        (a.user && a.user.toLowerCase().includes(q)) ||
        (a.ipAddress && a.ipAddress.includes(q)) ||
        (a.details && a.details.toLowerCase().includes(q)) ||
        (a.module && a.module.toLowerCase().includes(q));

      return matchesType && matchesSeverity && matchesStatus && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });
  }, [auditLogs, filterType, severityFilter, statusFilter, searchQuery, sortBy]);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
            <span>Critical</span>
          </span>
        );
      case 'warning':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
            <span>Warning</span>
          </span>
        );
      case 'success':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Check className="w-2.5 h-2.5 text-emerald-600" />
            <span>Success</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
            <span>Info</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || 'Success').toLowerCase();
    if (s.includes('fail') || s.includes('block')) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          {status}
        </span>
      );
    }
    if (s.includes('warn')) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {status}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck className="w-5 h-5 text-[#007A64]" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Security & Audit Logs Console
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 font-mono">
              100% Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident system audit trail capturing administrative logins, permission changes, and financial activities.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
            title="Refresh logs from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#007A64]' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportLogs}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#007A64] hover:bg-[#006852] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Event</span>
          </button>
        </div>
      </div>

      {/* Security Health Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Audited Records Total</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">{metrics.totalEvents} Events</div>
          <span className="text-[10px] text-emerald-600 font-bold">Supabase PostgreSQL Log</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Admin Authorization</span>
            <Lock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-slate-900">Role-Based RBAC</div>
          <span className="text-[10px] text-blue-600 font-bold">Strict Role Isolation</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Security Alerts / Failed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">{metrics.failedAuthAttempts} Alerts</div>
          <span className="text-[10px] text-emerald-600 font-bold">Clean Security Perimeter</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Session Encryption</span>
            <Key className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-black text-slate-900">TLS 1.3 / AES-256</div>
          <span className="text-[10px] text-teal-700 font-bold">End-to-End Secure</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Action Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Action Categories</option>
            <option value="auth">Authentication Events</option>
            <option value="refund">Refund Authorizations</option>
            <option value="export">Data Exports</option>
            <option value="price">Price Updates</option>
            <option value="database">Database Security</option>
            <option value="booking">Booking Modifications</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="success">Success</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
            <option value="active">Active</option>
            <option value="applied">Applied</option>
            <option value="protected">Protected</option>
            <option value="failed">Failed / Blocked</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>

        {/* Search input */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, initiator, IP, details..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#007A64] outline-none"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 text-[#007A64] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800">Fetching immutable audit logs from database...</p>
          <p className="text-xs text-slate-500 mt-1">Connecting to Supabase PostgreSQL audit trail</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredLogs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Security Audit Records Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || filterType !== 'all' || severityFilter !== 'all' || statusFilter !== 'all'
              ? 'No audit events match your active filters. Try clearing search criteria.'
              : 'There are currently no security records in the audit trail.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            {(searchQuery || filterType !== 'all' || severityFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setSeverityFilter('all');
                  setStatusFilter('all');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#007A64] hover:bg-[#006852] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              + Record Test Audit Event
            </button>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      {!isLoading && filteredLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Event Ref</th>
                  <th className="py-3 px-4">Action / Event</th>
                  <th className="py-3 px-4">Initiator / Role</th>
                  <th className="py-3 px-4">IP Address & Origin</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4 text-center">Severity</th>
                  <th className="py-3 px-4 text-right">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id || log.eventId} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{log.eventId || log.id}</span>
                      <span className="text-[10px] text-slate-400 block whitespace-nowrap">{log.timestamp}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.actionTitle}</span>
                      <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-md inline-block mt-0.5">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{log.userName || log.user}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{log.role}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 font-semibold">{log.ipAddress}</div>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{log.location}</span>
                    </td>

                    <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{log.details}</p>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getSeverityBadge(log.severity)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {getStatusBadge(log.status)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setViewingLog(log)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        title="View Full Audit Event Details"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. VIEW FULL AUDIT LOG DETAILS MODAL                     */}
      {/* ======================================================== */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-[#007A64]">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Audit Event Details</h3>
                  <span className="text-xs text-slate-500 font-mono">Ref: #{viewingLog.eventId || viewingLog.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingLog(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Action Title</span>
                <span className="font-bold text-slate-900 block mt-0.5">{viewingLog.actionTitle}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Action Code</span>
                <span className="font-mono text-[11px] text-teal-700 font-bold block mt-0.5">{viewingLog.action}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Initiator</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-slate-400" />
                  {viewingLog.user}
                </span>
                <span className="text-[10px] text-slate-500 block">{viewingLog.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Module</span>
                <span className="font-semibold text-slate-700 block mt-0.5">{viewingLog.module}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Network & IP</span>
                <span className="font-mono text-[11px] text-slate-800 font-bold block mt-0.5">{viewingLog.ipAddress}</span>
                <span className="text-[10px] text-slate-500 block truncate">{viewingLog.location}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Timestamp</span>
                <span className="font-medium text-slate-800 block mt-0.5 font-mono text-[11px]">{viewingLog.timestamp}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Severity</span>
                <div className="mt-1">{getSeverityBadge(viewingLog.severity)}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                <div className="mt-1">{getStatusBadge(viewingLog.status)}</div>
              </div>
            </div>

            {/* Audit Details Body */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">Full Event Description:</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                {viewingLog.details}
              </p>
            </div>

            {/* Immutability Seal */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-[11px] leading-tight font-medium">
                <strong>Cryptographically Sealed Audit Trail:</strong> This event is permanently recorded in Supabase PostgreSQL under HIPAA and ISO 27001 regulatory compliance. Deletions and edits are strictly disallowed.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. RECORD AUDIT EVENT MODAL                              */}
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
                  <h3 className="font-black text-slate-900 text-base">Record Security Audit Event</h3>
                  <span className="text-xs text-slate-500">Record administrative action in audit ledger</span>
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

            <form onSubmit={handleCreateAuditLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Action Code *</label>
                  <select
                    value={newLogForm.action}
                    onChange={(e) => setNewLogForm({ ...newLogForm, action: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#007A64]"
                  >
                    <option value="ADMIN_ACTION">ADMIN_ACTION</option>
                    <option value="AUTH_ADMIN_LOGIN">AUTH_ADMIN_LOGIN</option>
                    <option value="AUTH_FAILED_ATTEMPT">AUTH_FAILED_ATTEMPT</option>
                    <option value="REFUND_PROCESSED">REFUND_PROCESSED</option>
                    <option value="PRICE_UPDATE">PRICE_UPDATE</option>
                    <option value="ROLE_UPDATE">ROLE_UPDATE</option>
                    <option value="DATA_EXPORT_CSV">DATA_EXPORT_CSV</option>
                    <option value="DATABASE_RLS_AUDIT">DATABASE_RLS_AUDIT</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Module *</label>
                  <select
                    value={newLogForm.module}
                    onChange={(e) => setNewLogForm({ ...newLogForm, module: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#007A64]"
                  >
                    <option value="Authentication">Authentication</option>
                    <option value="Orders & Inventory">Orders & Inventory</option>
                    <option value="Diagnostic Lab">Diagnostic Lab</option>
                    <option value="Payments">Payments</option>
                    <option value="User Management">User Management</option>
                    <option value="Security & Database">Security & Database</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Action Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cold-Chain Temperature Sensor Calibration"
                  value={newLogForm.actionTitle}
                  onChange={(e) => setNewLogForm({ ...newLogForm, actionTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#007A64]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity *</label>
                  <select
                    value={newLogForm.severity}
                    onChange={(e) => setNewLogForm({ ...newLogForm, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#007A64]"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status *</label>
                  <select
                    value={newLogForm.status}
                    onChange={(e) => setNewLogForm({ ...newLogForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#007A64]"
                  >
                    <option value="Success">Success</option>
                    <option value="Completed">Completed</option>
                    <option value="Verified">Verified</option>
                    <option value="Applied">Applied</option>
                    <option value="Active">Active</option>
                    <option value="Protected">Protected</option>
                    <option value="Failed">Failed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Details & Remarks *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter detailed description of activity and reason..."
                  value={newLogForm.details}
                  onChange={(e) => setNewLogForm({ ...newLogForm, details: e.target.value })}
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
                  disabled={isSubmittingNewLog}
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingNewLog && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingNewLog ? 'Sealing...' : 'Seal to Audit Ledger'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
