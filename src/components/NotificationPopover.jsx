// src/components/NotificationPopover.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Settings, ChevronLeft, Check, Bell, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Healthcare notifications tailored for ZESTMED project with website branding
export const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    sender: 'Dr. Amit Sharma',
    avatar: 'AS',
    avatarBg: 'bg-teal-50 text-[#007A64] border border-teal-200/80',
    actionText: 'is confirmed: Tomorrow 04:30 PM',
    time: '10m ago',
    desc: 'Consultation scheduled at Zestmed Polyclinic Hub, Guwahati. Tap to review token & directions.',
    category: 'Doctor Consultation',
    status: 'Confirmed',
    statusBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    linkType: 'doctor'
  },
  {
    id: 2,
    sender: 'Dispur Central Pathology Lab',
    avatar: 'LB',
    avatarBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    actionText: 'is ready: Complete Blood Count (CBC)',
    time: '45m ago',
    desc: 'Your CBC report is verified by Dr. Pranabesh Sarma (MD Pathology). Available for download.',
    category: 'Diagnostic Lab Report',
    status: 'Ready',
    statusBadge: 'bg-teal-50 text-teal-700 border border-teal-200',
    linkType: 'lab'
  },
  {
    id: 3,
    sender: 'Bikash Das (Phlebotomist)',
    avatar: 'BD',
    avatarBg: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    actionText: 'is assigned: Home Sample Collection',
    time: '2 h ago',
    desc: 'Vaccinated technician assigned with barcoded collection tubes for your home sample collection.',
    category: 'Home Sample Collection',
    status: 'Assigned',
    statusBadge: 'bg-sky-50 text-sky-700 border border-sky-200',
    linkType: 'phlebo'
  },
  {
    id: 4,
    sender: 'Zestmed Express Pharmacy',
    avatar: 'ZM',
    avatarBg: 'bg-teal-50 text-[#008F83] border border-teal-200/80',
    actionText: 'is dispatched: Order #ORD-2026-9045',
    time: '3 h ago',
    desc: 'Cold-chain medicine pack verified by Chief Pharmacist and out for express delivery in Dispur.',
    category: 'Pharmacy Order',
    status: 'Out for Delivery',
    statusBadge: 'bg-amber-50 text-amber-700 border border-amber-200',
    linkType: 'order'
  },
  {
    id: 5,
    sender: 'Guwahati Pharmacy Desk',
    avatar: 'RX',
    avatarBg: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    actionText: 'is verified: Prescription #RX-8842',
    time: 'Yesterday',
    desc: 'All prescribed medicines validated and pre-filled in your cart with genuine batch verification.',
    category: 'Prescription Vault',
    status: 'Verified',
    statusBadge: 'bg-purple-50 text-purple-700 border border-purple-200',
    linkType: 'rx'
  }
];

// Healthcare notification settings categories tailored for ZESTMED website
const DEFAULT_NOTIFICATION_SETTINGS = {
  browserNotifications: false,
  sound: true,
  categories: {
    doctor: {
      title: 'Doctor appointments',
      desc: 'Consultation confirmations, schedule reminders & check-ins',
      bell: true,
      browser: true
    },
    lab: {
      title: 'Lab reports & tests',
      desc: 'Sample collection updates & published report alerts',
      bell: true,
      browser: true
    },
    medicine: {
      title: 'Medicine orders',
      desc: 'Pharmacist verification, dispatch & delivery alerts',
      bell: true,
      browser: true
    },
    prescription: {
      title: 'Prescription verification',
      desc: 'Prescription review status & cart auto-fill updates',
      bell: true,
      browser: true
    },
    surgery: {
      title: 'Surgery & health packages',
      desc: 'Pre-op consultations & cashless insurance approvals',
      bell: true,
      browser: true
    },
    wellness: {
      title: 'Health tips & reminders',
      desc: 'Medication reminders & preventive healthcare tips',
      bell: true,
      browser: false
    }
  }
};

export default function NotificationPopover({
  isOpen = true,
  inline = false,
  onClose = () => {},
  notifications = DEFAULT_NOTIFICATIONS,
  onNotificationClick
}) {
  const { addToast } = useToast();
  const [view, setView] = useState('list'); // 'list' | 'settings'
  const popoverRef = useRef(null);

  // Settings State loaded from LocalStorage
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('zestmed_notification_settings');
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATION_SETTINGS;
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  });

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem('zestmed_notification_settings', JSON.stringify(settings));
    } catch (_) {}
  }, [settings]);

  // Close on outside click (popover mode only)
  useEffect(() => {
    if (!isOpen || inline) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, inline, onClose]);

  if (!isOpen) return null;

  // Toggle Bell / Browser notification switch
  const handleToggleChannel = (categoryKey, channel) => {
    setSettings((prev) => {
      const currentVal = prev.categories[categoryKey]?.[channel];
      return {
        ...prev,
        categories: {
          ...prev.categories,
          [categoryKey]: {
            ...prev.categories[categoryKey],
            [channel]: !currentVal
          }
        }
      };
    });
  };

  // Toggle Sound switch
  const handleToggleSound = () => {
    setSettings((prev) => ({
      ...prev,
      sound: !prev.sound
    }));
    addToast(!settings.sound ? 'Notification sounds enabled' : 'Notification sounds muted', 'info');
  };

  // Request browser notifications
  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setSettings((prev) => ({ ...prev, browserNotifications: true }));
          addToast('Browser notifications enabled successfully!', 'success');
        } else {
          addToast('Notification permission was blocked in browser', 'error');
        }
      } catch (e) {
        setSettings((prev) => ({ ...prev, browserNotifications: true }));
        addToast('Browser notifications turned on', 'success');
      }
    } else {
      setSettings((prev) => ({ ...prev, browserNotifications: true }));
      addToast('Browser notifications turned on', 'success');
    }
  };

  return (
    <div
      ref={popoverRef}
      className={
        inline
          ? 'w-full max-w-lg mx-auto bg-white text-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden select-none'
          : 'absolute right-0 mt-2 w-[310px] sm:w-[340px] max-w-[calc(100vw-1.5rem)] bg-white text-slate-900 rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none'
      }
    >
      {/* ========================================================================= */}
      {/* 1. NOTIFICATIONS LIST VIEW (Clean Zestmed Theme)                           */}
      {/* ========================================================================= */}
      {view === 'list' && (
        <div className="flex flex-col max-h-[460px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Notifications
              </h3>
              <span className="text-[10px] font-bold text-[#008F83] bg-teal-50 border border-teal-200/60 px-1.5 py-0.2 rounded-full">
                5 New
              </span>
            </div>
            <button
              type="button"
              onClick={() => setView('settings')}
              className="p-1 text-slate-400 hover:text-[#008F83] rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Notification settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Notifications List */}
          <div className="overflow-y-auto px-3 py-2 space-y-2.5 max-h-[400px] custom-popover-scrollbar">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onNotificationClick) onNotificationClick(item);
                }}
                className="group flex items-start gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                {/* Circular Initial Avatar */}
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[11px] shadow-2xs ${item.avatarBg}`}
                >
                  {item.avatar}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  {/* Sender & Action Line */}
                  <div className="text-xs text-slate-800 leading-tight">
                    <strong className="text-slate-900 font-bold">{item.sender}</strong>{' '}
                    <span className="text-slate-600 font-normal">{item.actionText}</span>
                  </div>

                  {/* Time ago */}
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                    {item.time}
                  </span>

                  {/* Inner Card Preview Box */}
                  <div className="bg-slate-50 rounded-xl p-2.5 mt-1.5 border border-slate-100 group-hover:border-teal-200/60 group-hover:bg-teal-50/30 transition">
                    <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium flex-wrap">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className={`px-1.5 py-0.2 rounded-md font-semibold text-[10px] ${item.statusBadge}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. NOTIFICATION SETTINGS VIEW (Clean Zestmed Theme)                        */}
      {/* ========================================================================= */}
      {view === 'settings' && (
        <div className="flex flex-col max-h-[480px]">
          {/* Header with Back Arrow */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
            <button
              type="button"
              onClick={() => setView('list')}
              className="p-1 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Back to notifications"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Notification settings
            </h3>
          </div>

          {/* Scrollable Settings Form */}
          <div className="overflow-y-auto px-3.5 py-2.5 space-y-3 max-h-[420px] custom-popover-scrollbar">
            {/* Top Card: Browser Notifications */}
            <div className="bg-gradient-to-r from-teal-50/90 to-emerald-50/50 rounded-xl p-3 border border-teal-100 flex items-center justify-between gap-2.5">
              <div className="min-w-0 pr-1">
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Browser notifications
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  Get notified even when Zestmed isn't open.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestBrowserPermission}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer flex items-center gap-1 ${
                  settings.browserNotifications
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-[#008F83] hover:bg-[#007A64] text-white active:scale-95'
                }`}
              >
                {settings.browserNotifications ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <span>Turn on</span>
                )}
              </button>
            </div>

            {/* Table Header: NOTIFY ME ABOUT | BELL | BROWSER */}
            <div className="flex items-center justify-between pt-0.5 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <span>Notify Me About</span>
              <div className="flex items-center gap-3 pr-1">
                <span className="w-9 text-center">Bell</span>
                <span className="w-9 text-center">Browser</span>
              </div>
            </div>

            {/* Notification Rows */}
            <div className="space-y-2.5">
              {Object.entries(settings.categories).map(([key, cat]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 pr-1">
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">
                      {cat.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      {cat.desc}
                    </p>
                  </div>

                  {/* Dual Teal Brand Toggles */}
                  <div className="flex items-center gap-3 shrink-0 pr-1">
                    {/* Bell Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleChannel(key, 'bell')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        cat.bell ? 'bg-[#008F83]' : 'bg-slate-200'
                      }`}
                      aria-label={`Toggle bell for ${cat.title}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          cat.bell ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>

                    {/* Browser Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleChannel(key, 'browser')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        cat.browser ? 'bg-[#008F83]' : 'bg-slate-200'
                      }`}
                      aria-label={`Toggle browser for ${cat.title}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          cat.browser ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sound Row at Bottom */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="min-w-0 pr-1">
                <h5 className="text-xs font-bold text-slate-800 leading-tight">
                  Sound
                </h5>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  Play a short sound for new alerts
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none mr-1 ${
                  settings.sound ? 'bg-[#008F83]' : 'bg-slate-200'
                }`}
                aria-label="Toggle notification sound"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    settings.sound ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
