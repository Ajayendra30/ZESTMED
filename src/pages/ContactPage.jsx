// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Headphones,
  User,
  MessageSquare,
  Send,
  Building2,
  Clock,
  Calendar,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { submitInquiry } from '../services/supabaseService';

export default function ContactPage() {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    submitInquiry(formData).catch(() => {});
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      addToast('Thank you! Your message has been sent to our customer care team.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 600);
  };

  return (
    <div className="bg-white min-h-screen font-sans pb-20">
      {/* 1. HERO BANNER - FULL WIDTH HOMEPAGE HERO STYLING */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#F0F9FB] via-[#E8F6F8] to-[#DEF3F6] border-b border-teal-100/60 select-none">
        {/* 1. Medical Plus (+) Symbols matching Homepage Hero */}
        <div className="absolute top-6 left-[16%] opacity-20 text-teal-400 font-bold text-5xl pointer-events-none select-none">
          +
        </div>
        <div className="absolute top-4 left-[48%] lg:left-[52%] opacity-35 text-teal-300 font-bold text-6xl lg:text-7xl pointer-events-none select-none">
          +
        </div>
        <div className="absolute top-10 right-10 opacity-25 text-teal-300 font-bold text-6xl pointer-events-none select-none">
          +
        </div>

        {/* 2. Bottom-Left Soft Cyan Wave Arc sweeping from corner */}
        <div className="absolute -bottom-10 -left-10 w-[360px] sm:w-[440px] h-[320px] sm:h-[380px] pointer-events-none select-none opacity-40">
          <svg viewBox="0 0 400 400" className="w-full h-full fill-current text-teal-200/50">
            <path d="M0,160 C130,150 230,240 270,400 L0,400 Z" />
          </svg>
        </div>
        <div className="absolute -bottom-16 -left-16 w-[380px] h-[380px] bg-gradient-to-tr from-cyan-100/50 via-teal-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* 3. Distinctive Organic Mint-Cyan Curved Backdrop Wave */}
        <div className="absolute top-0 right-0 w-[64%] sm:w-[58%] lg:w-[50%] xl:w-[46%] h-full pointer-events-none select-none overflow-hidden">
          <svg
            viewBox="0 0 500 400"
            preserveAspectRatio="none"
            className="absolute top-0 right-0 w-full h-full"
          >
            <defs>
              <linearGradient id="contactOrganicGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4F1F7" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#A2E6F2" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#7AD4E4" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="contactOrganicGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BCEEF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#67CCE0" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path
              d="M110,0 C180,45 150,135 230,185 C300,225 390,210 500,260 L500,0 Z"
              fill="url(#contactOrganicGrad1)"
            />
            <path
              d="M230,0 C280,65 260,150 340,195 C400,225 450,215 500,225 L500,0 Z"
              fill="url(#contactOrganicGrad2)"
              opacity="0.65"
            />
          </svg>
          <div className="absolute -top-16 -right-16 w-[420px] h-[420px] bg-gradient-to-bl from-[#75D2E4]/45 via-[#9FE5F2]/25 to-transparent rounded-full blur-2xl" />
        </div>

        {/* Main Content & Imagery Container */}
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10 min-h-[230px] sm:min-h-[250px] lg:min-h-[270px] flex items-center">
          {/* Left Column: Breadcrumbs, Title & Subtitle */}
          <div className="relative z-20 w-full max-w-full sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] py-6 sm:py-7 lg:py-8 space-y-1.5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold mb-1.5">
              <Link to="/" className="flex items-center gap-1.5 hover:text-[#008F83] transition">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#008F83]" />
                <span>Home</span>
              </Link>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-900 font-bold">Contact Us</span>
            </div>

            {/* Page Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-[#0B1728] tracking-tight leading-tight mb-1.5">
              Contact <span className="text-[#008F83]">Us</span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-[400px]">
              We're here to help you. Get in touch with our team for any queries, support or assistance.
            </p>
          </div>

          {/* Desktop Right Area: Unified Hero Visual (Doctor + Facility Building) */}
          <div className="hidden lg:flex absolute inset-y-0 right-0 w-full pointer-events-none z-10 items-end justify-end">
            <div className="relative h-full w-full flex items-end justify-end">
              <img
                src="/contact-hero.png"
                alt="ZESTMED Healthcare & Diagnostics Facility and Medical Specialist"
                className="absolute bottom-0 right-0 h-full max-h-[230px] sm:max-h-[250px] lg:max-h-[270px] w-auto max-w-[58%] lg:max-w-[60%] xl:max-w-[64%] object-contain object-right-bottom drop-shadow-xl select-none"
              />
            </div>
          </div>
        </div>

        {/* Mobile / Tablet View Image (Displayed below text on <lg screens) */}
        <div className="lg:hidden relative z-10 px-4 sm:px-6 pb-0 flex justify-end">
          <img
            src="/contact-hero.png"
            alt="ZESTMED Healthcare & Diagnostics Facility and Medical Specialist"
            className="w-full max-w-md sm:max-w-lg h-auto max-h-[220px] sm:max-h-[250px] object-contain object-right-bottom drop-shadow-xl select-none ml-auto"
          />
        </div>
      </section>

      {/* 2. GET IN TOUCH & SEND US A MESSAGE FORM - FULL WIDTH */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Get in Touch (4 stacked cards) */}
            <div className="lg:col-span-5 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Get in Touch
              </h2>

              <div className="space-y-4 pt-1">
                {/* 1. Call Us */}
                <div className="p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008F83] border border-teal-200 flex items-center justify-center shrink-0 shadow-xs">
                    <PhoneCall className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Call Us
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                      Mon – Sat, 8:00 AM - 8:00 PM
                    </p>
                    <a
                      href="tel:+919279125091"
                      className="text-base sm:text-lg font-black text-[#008F83] hover:underline font-mono mt-1 block"
                    >
                      +91 92791 25091
                    </a>
                  </div>
                </div>

                {/* 2. Email Us */}
                <div className="p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008F83] border border-teal-200 flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Email Us
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                      We'll reply within 24 hours
                    </p>
                    <a
                      href="mailto:support@zestmed.com"
                      className="text-sm sm:text-base font-bold text-[#008F83] hover:underline mt-1 block"
                    >
                      support@zestmed.com
                    </a>
                  </div>
                </div>

                {/* 3. Visit Our Office */}
                <div className="p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008F83] border border-teal-200 flex items-center justify-center shrink-0 shadow-xs">
                    <MapPin className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Visit Our Office
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed font-medium">
                      GS Road, Dispur, Guwahati, <br className="hidden sm:inline" />
                      Assam – 781005
                    </p>
                  </div>
                </div>

                {/* 4. Customer Support */}
                <div className="p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008F83] border border-teal-200 flex items-center justify-center shrink-0 shadow-xs">
                    <Headphones className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Customer Support
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                      For orders, reports and general queries
                    </p>
                    <a
                      href="tel:+919279125091"
                      className="text-base sm:text-lg font-black text-[#008F83] hover:underline font-mono mt-1 block"
                    >
                      +91 92791 25091
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Send Us a Message Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-100 shadow-md space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Send Us a Message
              </h2>

              {isSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Your message has been sent successfully. Our support team will get in touch shortly.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-slate-800">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008F83] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-slate-800">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008F83] focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Phone & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-slate-800">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008F83] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-slate-800">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-slate-800 focus:outline-none focus:border-[#008F83] focus:bg-white appearance-none transition cursor-pointer"
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Medicine Order">Medicine Order & Delivery</option>
                        <option value="Lab Test Booking">Diagnostic Test & Home Collection</option>
                        <option value="Report Issue">Report Download Issue</option>
                        <option value="Corporate / Partnership">Corporate / Doctor Partnership</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Message */}
                <div className="space-y-2 text-left">
                  <label className="text-sm font-bold text-slate-800">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008F83] focus:bg-white transition resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#008F83] hover:bg-[#007a70] text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md transition"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FIND US ON MAP & OUR LOCATION & TIMINGS - FULL WIDTH */}
      <section className="py-10 sm:py-14 bg-white border-t border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Find Us on Map */}
            <div className="lg:col-span-6 space-y-4 flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Find Us on Map
              </h2>

              <div className="relative w-full flex-1 min-h-[300px] sm:min-h-[340px] rounded-3xl overflow-hidden border-2 border-slate-200 shadow-sm bg-[#E5E9EE]">
                <MapVisual zoomLevel={zoomLevel} />

                {/* Map Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden z-10">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
                    className="p-2 hover:bg-slate-100 text-slate-700 border-b border-slate-100 transition"
                    title="Zoom In"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
                    className="p-2 hover:bg-slate-100 text-slate-700 transition"
                    title="Zoom Out"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Our Location & Timings */}
            <div className="lg:col-span-6 space-y-4 flex flex-col">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Our Location & Timings
              </h2>

              <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-100 shadow-sm flex flex-col justify-between flex-1 space-y-6">
                {/* Clinic Address Box */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#008F83] flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      ZESTMED Healthcare & Diagnostics
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                      GS Road, Dispur, Guwahati, Assam – 781005
                    </p>
                  </div>
                </div>

                {/* 3 Columns: Working Hours, Sunday, Lab Timings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#008F83]" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Working Hours
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 font-medium">Mon – Sat</p>
                    <p className="text-sm font-bold text-slate-800 pl-7">8:00 AM – 8:00 PM</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#008F83]" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Sunday
                      </h4>
                    </div>
                    <p className="text-sm font-bold text-slate-800 pl-7">9:00 AM – 2:00 PM</p>
                    <p className="text-xs text-slate-500 pl-7 font-medium">(Limited Services)</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#008F83]" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Lab Timings
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 pl-7 font-medium">Sample Collection:</p>
                    <p className="text-sm font-bold text-slate-800 pl-7">7:00 AM – 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEED IMMEDIATE HELP? SUPPORT BANNER - FULL WIDTH */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="rounded-3xl p-8 sm:p-10 border-2 border-teal-100 bg-gradient-to-r from-[#E6F8F5] via-[#E0F5F2] to-[#D5EFEA] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
            {/* Left: Headset Icon + Text */}
            <div className="flex items-center gap-5 text-left">
              <div className="w-16 h-16 rounded-3xl bg-white text-[#008F83] flex items-center justify-center shrink-0 shadow-sm">
                <Headphones className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Need Immediate Help?
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mt-1.5 font-medium leading-relaxed">
                  Talk to our support team for quick assistance with bookings, orders or reports.
                </p>
              </div>
            </div>

            {/* Action: Call Button */}
            <div className="shrink-0 z-10">
              <a
                href="tel:+919279125091"
                className="bg-[#00545D] hover:bg-[#003f46] text-white px-7 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-3 shadow-md transition"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call Now: +91 92791 25091</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// MAP VISUAL COMPONENT
function MapVisual({ zoomLevel }) {
  return (
    <div
      className="w-full h-full min-h-[260px] relative overflow-hidden transition-transform duration-300"
      style={{ transform: `scale(${zoomLevel})` }}
    >
      <svg viewBox="0 0 500 240" className="w-full h-full">
        <rect width="500" height="240" fill="#E8ECEF" />
        <rect x="30" y="20" width="70" height="50" rx="6" fill="#D3E5D4" />
        <rect x="290" y="140" width="80" height="60" rx="8" fill="#D3E5D4" />
        <rect x="420" y="10" width="60" height="40" rx="4" fill="#D3E5D4" />

        <line x1="0" y1="120" x2="500" y2="120" stroke="#FFFFFF" strokeWidth="14" />
        <line x1="0" y1="120" x2="500" y2="120" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6" />

        <line x1="0" y1="30" x2="500" y2="210" stroke="#FFFFFF" strokeWidth="12" />

        <line x1="120" y1="0" x2="120" y2="240" stroke="#FFFFFF" strokeWidth="8" />
        <line x1="260" y1="0" x2="260" y2="240" stroke="#FFFFFF" strokeWidth="9" />
        <line x1="390" y1="0" x2="390" y2="240" stroke="#FFFFFF" strokeWidth="8" />
        <line x1="0" y1="60" x2="500" y2="60" stroke="#FFFFFF" strokeWidth="7" />
        <line x1="0" y1="180" x2="500" y2="180" stroke="#FFFFFF" strokeWidth="7" />

        <text x="140" y="114" fill="#94A3B8" fontSize="9" fontFamily="sans-serif">
          SECTOR 45 ROAD
        </text>
        <text x="270" y="52" fill="#94A3B8" fontSize="8" fontFamily="sans-serif">
          HEALTHCARE BOULEVARD
        </text>
      </svg>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 select-none pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl ring-4 ring-rose-200 animate-bounce">
          <MapPin className="w-5 h-5 fill-white text-rose-600" />
        </div>

        <div className="bg-white/95 backdrop-blur-xs rounded-2xl px-4 py-2 shadow-lg border border-slate-200">
          <div className="text-xs font-black text-slate-900 leading-none">
            ZESTMED Healthcare
          </div>
          <div className="text-[11px] font-semibold text-slate-500 leading-none mt-1">
            & Diagnostics
          </div>
        </div>
      </div>
    </div>
  );
}
