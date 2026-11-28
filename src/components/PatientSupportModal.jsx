// src/components/PatientSupportModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, MessageSquare, Send, CheckCircle2, Clock, 
  AlertTriangle, Phone, Mail, X, PlusCircle, RefreshCw, 
  ChevronRight, Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { createSupportTicket, getPatientSupportTickets } from '../services/supportService';

export default function PatientSupportModal({ isOpen, onClose, user }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'new'
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Diagnostic Lab',
    priority: 'Normal',
    message: ''
  });

  const loadPatientTickets = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getPatientSupportTickets(user);
      setTickets(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPatientTickets();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleSync = () => loadPatientTickets();
    window.addEventListener('zestmed_ticket_updated', handleSync);
    window.addEventListener('zestmed_support_ticket_created', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('zestmed_ticket_updated', handleSync);
      window.removeEventListener('zestmed_support_ticket_created', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      addToast('Please enter both subject and message', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupportTicket({
        name: user?.name || 'Verified Patient',
        email: user?.email || '',
        phone: user?.phone || user?.contact || '',
        profileId: user?.id || null,
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        message: formData.message
      });

      addToast('Your support request has been submitted to the operations team.', 'success');
      setFormData({
        subject: '',
        category: 'Diagnostic Lab',
        priority: 'Normal',
        message: ''
      });
      setActiveTab('tickets');
      loadPatientTickets();
    } catch (err) {
      addToast('Failed to submit request: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'resolved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'closed') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (s.includes('progress')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-teal-500/20 text-[#00BFA5] border border-teal-500/30">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Patient Support & Help Desk</h3>
              <p className="text-xs text-teal-300 font-medium mt-0.5">
                24x7 Assistance & Grievance Redressal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 pt-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tickets'
                ? 'border-[#007A64] text-[#007A64]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>My Tickets ({tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'new'
                ? 'border-[#007A64] text-[#007A64]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Complaint / Query</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto custom-scrollbar text-xs">
          {activeTab === 'tickets' ? (
            <div className="space-y-3">
              {isLoading && tickets.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                  <p>Loading your support tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <LifeBuoy className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                  <p className="font-bold text-slate-700">No support tickets found</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Have an issue with a lab test, medicine order, or appointment? Click below to contact our care team.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="mt-2 px-4 py-2 bg-[#007A64] text-white rounded-xl font-bold hover:bg-[#006852] transition cursor-pointer"
                  >
                    Raise a Support Request
                  </button>
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id || t.ticketRef} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{t.ticketRef}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                          {t.category}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900">{t.subject}</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5 whitespace-pre-wrap">{t.message}</p>
                    </div>

                    {/* Admin Response Section (Visible to Patient) */}
                    {t.adminResponse ? (
                      <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Care Team Resolution Note</span>
                        </div>
                        <p className="text-emerald-900 font-medium text-[11px] whitespace-pre-wrap">
                          {t.adminResponse}
                        </p>
                        <span className="text-[9px] text-emerald-600 block mt-0.5 font-mono">
                          {t.responseDate ? new Date(t.responseDate).toLocaleString('en-IN') : 'Saved'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Awaiting care team response (Average turnaround: 30 minutes)</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600"
                >
                  <option value="Diagnostic Lab">Diagnostic Lab / Sample Collection</option>
                  <option value="Pharmacy Orders">Medicine Orders & Delivery</option>
                  <option value="Doctor Consult">Doctor Consultations & Appointments</option>
                  <option value="Surgery Packages">Surgery Packages & TPA Cashless</option>
                  <option value="Billing & Payments">Billing, Invoices & Refunds</option>
                  <option value="General Support">General Query</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject / Issue Summary *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Expedited report request or delivery address change"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Urgency Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent (Medical Requirement)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please describe your query or complaint with booking ID if applicable..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none resize-none focus:border-teal-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#007A64] hover:bg-[#006852] text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-slate-500 text-xs">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>24/7 Helpline: +91 92791 25091</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
