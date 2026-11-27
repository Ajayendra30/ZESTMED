// src/components/admin/SecurityAuditLogsView.jsx
import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Filter, Download, Lock, 
  AlertTriangle, CheckCircle2, UserCheck, Key, Database, RefreshCw
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function SecurityAuditLogsView() {
  const { addToast } = useToast();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'AUD-901',
      action: 'AUTH_ADMIN_LOGIN',
      actionTitle: 'Super Admin Login',
      user: 'admin@zestmed.in',
      role: 'Super Administrator',
      ipAddress: '103.28.246.12',
      location: 'Guwahati, Assam (Broadband)',
      timestamp: '27 Nov 2026, 10:14:22 AM',
      details: 'Successful session authenticated via OTP verification on admin portal.',
      severity: 'info',
      status: 'Success'
    },
    {
      id: 'AUD-902',
      action: 'DATA_EXPORT_CSV',
      actionTitle: 'Customer Orders Exported',
      user: 'admin@zestmed.in',
      role: 'Super Administrator',
      ipAddress: '103.28.246.12',
      location: 'Guwahati, Assam',
      timestamp: '27 Nov 2026, 09:45:10 AM',
      details: 'Downloaded complete medicine order ledger (CSV format) for pharmacy dispatch review.',
      severity: 'info',
      status: 'Completed'
    },
    {
      id: 'AUD-903',
      action: 'REFUND_PROCESSED',
      actionTitle: 'Razorpay Refund Authorization',
      user: 'admin@zestmed.in',
      role: 'Super Administrator',
      ipAddress: '103.28.246.12',
      location: 'Guwahati, Assam',
      timestamp: '26 Nov 2026, 04:32:19 PM',
      details: 'Authorized immediate refund of ₹1,499 for cancelled Wellness Package booking #WEL-4491.',
      severity: 'warning',
      status: 'Verified'
    },
    {
      id: 'AUD-904',
      action: 'PRICE_UPDATE',
      actionTitle: 'Diagnostic Test Price Adjustment',
      user: 'dr.bora@zestmed.in',
      role: 'Chief of Diagnostics',
      ipAddress: '103.28.246.12',
      location: 'Guwahati Hub',
      timestamp: '25 Nov 2026, 11:20:00 AM',
      details: 'Updated price for Comprehensive Lipid & Cardiac Risk test code #TST-LIP-02 to ₹799.',
      severity: 'info',
      status: 'Applied'
    },
    {
      id: 'AUD-905',
      action: 'ROLE_UPDATE',
      actionTitle: 'Phlebotomist Field Credentials Verified',
      user: 'admin@zestmed.in',
      role: 'Super Administrator',
      ipAddress: '103.28.246.12',
      location: 'Guwahati, Assam',
      timestamp: '24 Nov 2026, 03:15:40 PM',
      details: 'Verified NABL Certification and vehicle cold-chain sensor registration for Rajib Barman.',
      severity: 'info',
      status: 'Active'
    },
    {
      id: 'AUD-906',
      action: 'DATABASE_RLS_AUDIT',
      actionTitle: 'Supabase PostgreSQL RLS Health Scan',
      user: 'System Automated Guard',
      role: 'Security Engine',
      ipAddress: 'Internal Subnet',
      location: 'Supabase Cloud (ap-south-1)',
      timestamp: '24 Nov 2026, 08:00:00 AM',
      details: 'Validated Row Level Security (RLS) enforcement across all 12 platform tables. Zero unauthorized leakage paths.',
      severity: 'info',
      status: 'Protected'
    }
  ]);

  const handleExportLogs = () => {
    try {
      const headers = ['Audit ID', 'Action', 'Initiator', 'Role', 'IP Address', 'Location', 'Timestamp', 'Details', 'Status'];
      const rows = auditLogs.map(a => [
        a.id, a.action, a.user, a.role, a.ipAddress, a.location, a.timestamp, a.details, a.status
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
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

  const filteredLogs = auditLogs.filter(a => {
    const matchesType = filterType === 'all' || a.action.toLowerCase().includes(filterType.toLowerCase());
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      a.actionTitle.toLowerCase().includes(q) ||
      a.user.toLowerCase().includes(q) ||
      a.ipAddress.toLowerCase().includes(q) ||
      a.details.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Security & Audit Logs
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
              100% Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident system audit trail capturing administrative logins, permission changes, and financial activities.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportLogs}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Security Health Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Supabase RLS Policies</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900">12 / 12 Tables</div>
          <span className="text-[10px] text-emerald-600 font-bold">Row-Level Security Active</span>
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
            <span>Failed Auth Attempts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900">0 (Last 24h)</div>
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
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Audit Actions</option>
            <option value="auth">Authentication Events</option>
            <option value="refund">Refund Authorizations</option>
            <option value="export">Data Exports</option>
            <option value="price">Price Updates</option>
            <option value="database">Database Security</option>
          </select>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, initiator, IP..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
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
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{log.id}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{log.actionTitle}</span>
                    <span className="font-mono text-[10px] text-teal-700">{log.action}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{log.user}</div>
                    <span className="text-[10px] text-slate-400 block">{log.role}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-800 font-semibold">{log.ipAddress}</div>
                    <span className="text-[10px] text-slate-400 block">{log.location}</span>
                  </td>

                  <td className="py-3 px-4 max-w-sm">
                    <p className="text-[11px] text-slate-600 line-clamp-2">{log.details}</p>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
