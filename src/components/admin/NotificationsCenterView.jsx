// src/components/admin/NotificationsCenterView.jsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, Volume2, VolumeX, Send, CheckCheck, Trash2, 
  Filter, Search, AlertCircle, ShoppingCart, Calendar, 
  FileCheck, ShieldAlert, Sparkles, Plus, Clock
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { playNotificationSound, recordAndPlayNotification } from '../../utils/notificationSound';
import { fetchAdminNotifications } from '../../services/notificationService';

export default function NotificationsCenterView() {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // New broadcast form state
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    category: 'Emergency Notice',
    priority: 'high',
    desc: '',
    actionText: 'View Healthcare Update',
    targetAudience: 'All Patients & Staff'
  });

  useEffect(() => {
    const list = fetchAdminNotifications();
    setNotifications(list);
  }, []);

  const handleToggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    addToast(next ? 'Audible chimes muted' : 'Audible chimes unmuted', 'info');
    if (!next) playNotificationSound('success');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    addToast('All notifications marked as read', 'success');
  };

  const handleClearAll = () => {
    setNotifications([]);
    addToast('All notifications cleared', 'info');
  };

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!broadcastData.title.trim() || !broadcastData.desc.trim()) {
      addToast('Please provide a title and announcement message', 'error');
      return;
    }

    const created = recordAndPlayNotification({
      type: broadcastData.priority === 'high' ? 'critical' : 'system',
      title: broadcastData.title,
      desc: broadcastData.desc,
      actionText: broadcastData.actionText,
      category: broadcastData.category,
      sender: 'Super Administrator',
      priority: broadcastData.priority
    });

    setNotifications(prev => [created, ...prev]);
    addToast(`Broadcast announcement sent to ${broadcastData.targetAudience}!`, 'success');
    setIsBroadcastModalOpen(false);
    setBroadcastData({
      title: '',
      category: 'Emergency Notice',
      priority: 'high',
      desc: '',
      actionText: 'View Healthcare Update',
      targetAudience: 'All Patients & Staff'
    });
  };

  const filteredList = notifications.filter(n => {
    const matchesCat = categoryFilter === 'all' || (n.category || '').toLowerCase().includes(categoryFilter.toLowerCase());
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (n.title || '').toLowerCase().includes(q) ||
      (n.desc || '').toLowerCase().includes(q) ||
      (n.category || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Notifications & Broadcast Center
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              {notifications.filter(n => n.unread).length} Unread
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch announcements, monitor platform alerts, and broadcast critical medical notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isSoundMuted ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}
            title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#007A64] hover:bg-[#006852] rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Broadcast</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'appointment', label: 'Appointments' },
            { id: 'order', label: 'Pharmacy Orders' },
            { id: 'lab', label: 'Lab Dispatches' },
            { id: 'senior', label: 'Senior Care' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#007A64] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notification feed..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-teal-600 outline-none"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80">
            No notifications matching the current criteria.
          </div>
        ) : (
          filteredList.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl p-4 border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
                n.unread ? 'border-teal-300 bg-teal-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs ${
                  n.category?.includes('Emergency') || n.priority === 'high'
                    ? 'bg-rose-100 text-rose-700'
                    : n.category?.includes('Order')
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-teal-100 text-teal-700'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{n.title}</h4>
                    {n.unread && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block animate-pulse" />
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                      {n.category || 'General'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">{n.desc}</p>

                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{n.timestamp || 'Just now'}</span>
                    </span>
                    <span>•</span>
                    <span>Sender: <strong>{n.sender || 'System'}</strong></span>
                  </div>
                </div>
              </div>

              {n.actionText && (
                <div className="shrink-0 self-end sm:self-center">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200/80">
                    {n.actionText}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Send className="w-5 h-5" />
                </span>
                <h3 className="font-black text-slate-900 text-base">Send Broadcast Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                <select
                  value={broadcastData.targetAudience}
                  onChange={(e) => setBroadcastData({ ...broadcastData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none"
                >
                  <option value="All Patients & Staff">All Patients & Hospital Staff</option>
                  <option value="Registered Patients">Registered Patients Only</option>
                  <option value="On-Duty Lab Executives">On-Duty Lab Executives & Phlebotomists</option>
                  <option value="Senior Citizen Care Group">Senior Citizen Care Subscribers</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={broadcastData.category}
                    onChange={(e) => setBroadcastData({ ...broadcastData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none"
                  >
                    <option value="Emergency Notice">Emergency Notice</option>
                    <option value="Clinic Update">Clinic Update</option>
                    <option value="Special Health Offer">Special Health Offer</option>
                    <option value="System Advisory">System Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={broadcastData.priority}
                    onChange={(e) => setBroadcastData({ ...broadcastData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none"
                  >
                    <option value="high">High (Audible Alert)</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  placeholder="e.g. Free Geriatric Bone Density Camp this Saturday"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastData.desc}
                  onChange={(e) => setBroadcastData({ ...broadcastData, desc: e.target.value })}
                  placeholder="Provide comprehensive details of the update..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Broadcast Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
