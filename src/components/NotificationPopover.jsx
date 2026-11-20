// src/components/NotificationPopover.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Settings, ChevronLeft, Check, Bell, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Default project notification items designed for ZESTMED Healthcare
export const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    sender: 'Dr. Amit Sharma',
    avatar: 'AS',
    avatarBg: 'bg-[#3D3319] text-[#EAB308]', // Gold/Amber theme
    actionText: 'is confirmed: Tomorrow 04:30 PM',
    time: '10m ago',
    desc: 'Consultation scheduled at Zestmed Polyclinic Hub, Guwahati. Tap to review consultation token & directions.',
    category: 'Doctor Consultation',
    status: 'Confirmed',
    statusColor: 'text-emerald-400',
    linkType: 'doctor'
  },
  {
    id: 2,
    sender: 'Dispur Central Pathology Lab',
    avatar: 'LB',
    avatarBg: 'bg-[#123832] text-[#14B8A6]', // Teal theme
    actionText: 'is ready: Complete Blood Count (CBC)',
    time: '45m ago',
    desc: 'Your Complete Blood Count (CBC) report is verified by Dr. Pranabesh Sarma (MD Pathology). Available for download.',
    category: 'Diagnostic Lab Report',
    status: 'Ready for Download',
    statusColor: 'text-teal-400',
    linkType: 'lab'
  },
  {
    id: 3,
    sender: 'Bikash Das (Phlebotomist)',
    avatar: 'BD',
    avatarBg: 'bg-[#1A2B44] text-[#38BDF8]', // Blue theme
    actionText: 'is assigned: Home Sample Collection',
    time: '2 h ago',
    desc: 'Vaccinated field technician assigned with barcoded collection vacutainers for your home blood collection in Guwahati.',
    category: 'Home Sample Collection',
    status: 'Technician Assigned',
    statusColor: 'text-sky-400',
    linkType: 'phlebo'
  },
  {
    id: 4,
    sender: 'Zestmed Express Pharmacy',
    avatar: 'ZM',
    avatarBg: 'bg-[#351D42] text-[#C084FC]', // Purple theme
    actionText: 'is dispatched: Medicine Order #ORD-2026-9045',
    time: '3 h ago',
    desc: 'Cold-chain medicine package verified by Chief Pharmacist and out for express doorstep delivery across Dispur.',
    category: 'Pharmacy Order',
    status: 'Out for Delivery',
    statusColor: 'text-amber-400',
    linkType: 'order'
  },
  {
    id: 5,
    sender: 'Guwahati Pharmacy Desk',
    avatar: 'RX',
    avatarBg: 'bg-[#2E1F38] text-[#F472B6]', // Pink theme
    actionText: 'is verified: Prescription #RX-8842',
    time: 'Yesterday',
    desc: 'All prescribed medications validated and pre-filled in your cart with 100% genuine batch verification.',
    category: 'Prescription Vault',
    status: 'Verified',
    statusColor: 'text-purple-400',
    linkType: 'rx'
  }
];

// Healthcare settings categories tailored for ZESTMED project
const DEFAULT_NOTIFICATION_SETTINGS = {
  browserNotifications: false,
  sound: true,
  categories: {
    doctor: {
      title: 'Doctor appointments',
      desc: 'Consultation confirmations, schedule reminders, and clinic check-ins',
      bell: true,
      browser: true
    },
    lab: {
      title: 'Lab reports & tests',
      desc: 'Sample collection updates, report publishing, and abnormal flag alerts',
      bell: true,
      browser: true
    },
    medicine: {
      title: 'Medicine orders',
      desc: 'Pharmacist verification, out for delivery dispatch, and delivery confirmation',
      bell: true,
      browser: true
    },
    prescription: {
      title: 'Prescription verification',
      desc: 'Doctor prescription review status and pharmacist cart auto-fill',
      bell: true,
      browser: true
    },
    surgery: {
      title: 'Surgery & health packages',
      desc: 'Pre-op consultations, care manager updates, and cashless insurance approvals',
      bell: true,
      browser: true
    },
    wellness: {
      title: 'Health tips & reminders',
      desc: 'Daily medication reminders, preventive health checkup tips, and wellness alerts',
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
      const updated = {
        ...prev,
        categories: {
          ...prev.categories,
          [categoryKey]: {
            ...prev.categories[categoryKey],
            [channel]: !currentVal
          }
        }
      };
      return updated;
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

  // Request native browser notifications
  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setSettings((prev) => ({ ...prev, browserNotifications: true }));
          addToast('Browser notifications enabled successfully!', 'success');
        } else {
          addToast('Notification permission was blocked in browser settings', 'error');
        }
      } catch (e) {
        setSettings((prev) => ({ ...prev, browserNotifications: true }));
        addToast('Browser notifications simulated as active', 'success');
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
          ? 'w-full max-w-xl mx-auto bg-[#18191E] text-white rounded-3xl shadow-2xl shadow-black/80 border border-[#2C2D35] overflow-hidden select-none'
          : 'absolute right-0 mt-2 w-[360px] sm:w-[400px] max-w-[calc(100vw-1.5rem)] bg-[#18191E] text-white rounded-2xl shadow-2xl shadow-black/80 border border-[#2C2D35] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none'
      }
    >
      {/* ========================================================================= */}
      {/* 1. NOTIFICATIONS LIST VIEW (Image 1)                                      */}
      {/* ========================================================================= */}
      {view === 'list' && (
        <div className="flex flex-col max-h-[540px]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2C2D35]/60">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Notifications
            </h3>
            <button
              type="button"
              onClick={() => setView('settings')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
              title="Notification settings"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Scrollable Notifications List */}
          <div className="overflow-y-auto px-4 py-3 space-y-4 max-h-[460px] custom-dark-scrollbar">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onNotificationClick) onNotificationClick(item);
                }}
                className="group flex items-start gap-3.5 cursor-pointer hover:opacity-95 transition"
              >
                {/* Circular Initial Avatar */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center font-black text-xs sm:text-sm shadow-xs ${item.avatarBg}`}
                >
                  {item.avatar}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  {/* Sender & Action Line */}
                  <div className="text-xs sm:text-sm text-slate-200 leading-snug">
                    <strong className="text-white font-bold">{item.sender}</strong>{' '}
                    <span className="text-slate-300 font-normal">{item.actionText}</span>
                  </div>

                  {/* Time ago */}
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {item.time}
                  </span>

                  {/* Inner Card Preview Box */}
                  <div className="bg-[#24262E] rounded-xl p-3 mt-2 border border-white/5 group-hover:border-white/10 transition">
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className={`${item.statusColor} font-semibold`}>
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
      {/* 2. NOTIFICATION SETTINGS VIEW (Images 2 & 3)                              */}
      {/* ========================================================================= */}
      {view === 'settings' && (
        <div className="flex flex-col max-h-[580px]">
          {/* Header with Back Arrow */}
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-[#2C2D35]/60">
            <button
              type="button"
              onClick={() => setView('list')}
              className="p-1 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
              title="Back to notifications"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Notification settings
            </h3>
          </div>

          {/* Scrollable Settings Form */}
          <div className="overflow-y-auto px-4 py-3 space-y-4 max-h-[510px] custom-dark-scrollbar">
            {/* Top Card: Browser Notifications */}
            <div className="bg-[#24262E] rounded-2xl p-3.5 sm:p-4 border border-white/5 flex items-center justify-between gap-3">
              <div className="min-w-0 pr-2">
                <h4 className="text-sm font-bold text-white leading-tight">
                  Browser notifications
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  Get notified even when Zestmed isn't open.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestBrowserPermission}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 ${
                  settings.browserNotifications
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#9333EA] hover:bg-[#7E22CE] text-white active:scale-95'
                }`}
              >
                {settings.browserNotifications ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <span>Turn on</span>
                )}
              </button>
            </div>

            {/* Table Header: NOTIFY ME ABOUT | BELL | BROWSER */}
            <div className="flex items-center justify-between pt-1 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#2C2D35]/60">
              <span>Notify Me About</span>
              <div className="flex items-center gap-4 pr-1">
                <span className="w-11 text-center">Bell</span>
                <span className="w-11 text-center">Browser</span>
              </div>
            </div>

            {/* Notification Rows */}
            <div className="space-y-3.5">
              {Object.entries(settings.categories).map(([key, cat]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 pr-1">
                    <h5 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {cat.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {cat.desc}
                    </p>
                  </div>

                  {/* Dual Purple Toggles */}
                  <div className="flex items-center gap-4 shrink-0 pr-1">
                    {/* Bell Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleChannel(key, 'bell')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        cat.bell ? 'bg-[#9333EA]' : 'bg-[#383A42]'
                      }`}
                      aria-label={`Toggle bell for ${cat.title}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          cat.bell ? 'translate-x-5.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>

                    {/* Browser Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleChannel(key, 'browser')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        cat.browser ? 'bg-[#9333EA]' : 'bg-[#383A42]'
                      }`}
                      aria-label={`Toggle browser for ${cat.title}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          cat.browser ? 'translate-x-5.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sound Row at Bottom (Image 3) */}
            <div className="pt-3 border-t border-[#2C2D35]/60 flex items-center justify-between gap-3">
              <div className="min-w-0 pr-1">
                <h5 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Sound
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Play a short sound for new notifications
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none mr-1 ${
                  settings.sound ? 'bg-[#9333EA]' : 'bg-[#383A42]'
                }`}
                aria-label="Toggle notification sound"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    settings.sound ? 'translate-x-5.5' : 'translate-x-0.5'
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
