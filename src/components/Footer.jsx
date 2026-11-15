// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Youtube,
  Instagram,
  Facebook,
  Linkedin
} from 'lucide-react';

export default function Footer({ onOpenPrescriptionModal }) {
  return (
    <footer id="contact" className="bg-[#01333A] text-[#C0D8DC] select-none font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-12 sm:pt-16 pb-8 sm:pb-10">
        {/* Main Grid: Brand + 4 Link Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 pb-10">
          {/* Brand Column (~25%) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Zestmed Diagnostics & Polyclinic"
                className="h-10 sm:h-12 w-auto object-contain select-none"
              />
            </div>

            {/* Mission Statement */}
            <p className="text-xs sm:text-sm text-[#C0D8DC] leading-relaxed max-w-xs">
              Your trusted healthcare partner for medicines, diagnostic tests, and wellness checkups.
              Reliable. Convenient. Always for your health.
            </p>

            {/* Social Icons (clean white glyphs) */}
            <div className="flex items-center gap-4 pt-1">
              <a
                href="#youtube"
                aria-label="YouTube"
                className="text-white hover:text-[#14B8A6] transition duration-200"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="text-white hover:text-[#14B8A6] transition duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#facebook"
                aria-label="Facebook"
                className="text-white hover:text-[#14B8A6] transition duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="text-white hover:text-[#14B8A6] transition duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#twitter"
                aria-label="X"
                className="text-white hover:text-[#14B8A6] transition duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#C0D8DC]">
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/medicines" className="hover:text-white transition">Medicines</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/diagnostics" className="hover:text-white transition">Lab Tests</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/packages" className="hover:text-white transition">Health Packages</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/about" className="hover:text-white transition">About Us</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/contact" className="hover:text-white transition">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#C0D8DC]">
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/medicines" className="hover:text-white transition">Order Medicines</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/diagnostics" className="hover:text-white transition">Book Lab Tests</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/diagnostics" className="hover:text-white transition">Home Sample Collection</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/packages" className="hover:text-white transition">Health Checkup Packages</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/patient-dashboard" className="hover:text-white transition">View Reports</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <button
                  type="button"
                  onClick={onOpenPrescriptionModal}
                  className="hover:text-white transition text-left"
                >
                  Upload Prescription
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#C0D8DC]">
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/about" className="hover:text-white transition">About ZESTMED</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/about" className="hover:text-white transition">Our Labs</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/about" className="hover:text-white transition">Careers</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/about" className="hover:text-white transition">Terms & Conditions</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/about" className="hover:text-white transition">Privacy Policy</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/about" className="hover:text-white transition">Refund & Cancellation</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-sm text-[#C0D8DC]">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <a href="tel:+919279125091" className="text-white font-semibold tracking-wide hover:underline">+91 92791 25091</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <a href="mailto:support@zestmed.com" className="hover:text-white transition break-all">
                  support@zestmed.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span className="leading-snug">Guwahati, Assam, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div className="border-t border-white/15 my-6 sm:my-8" />

        {/* Bottom Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#C0D8DC] text-center sm:text-left">
          <p>© 2026 ZESTMED. All Rights Reserved.</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
            <span className="font-semibold text-white">Download Our App</span>
            <div className="flex items-center gap-2.5">
              {/* Google Play Badge */}
              <a
                href="#google-play"
                aria-label="Get it on Google Play"
                className="flex items-center gap-2 bg-black hover:bg-neutral-900 border border-white/20 rounded-lg px-2.5 py-1 transition text-white select-none shrink-0"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.6 1.8L13.8 12 3.6 22.2c-.4-.4-.6-1-.6-1.8V3.6c0-.8.2-1.4.6-1.8z" />
                  <path fill="#34A853" d="M17.3 8.5l-3.5 3.5 3.5 3.5 4-2.3c1.1-.6 1.1-1.7 0-2.4l-4-2.3z" />
                  <path fill="#EA3545" d="M3.6 1.8l10.2 10.2 3.5-3.5L4.5.8c-.3-.2-.6-.3-.9-.3v1.3z" />
                  <path fill="#FBBC04" d="M17.3 15.5l-3.5-3.5-10.2 10.2c.3 0 .6-.1.9-.3l12.8-6.4z" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[7.5px] uppercase tracking-wider text-slate-300 font-medium">GET IT ON</div>
                  <div className="text-xs font-semibold text-white tracking-tight -mt-0.5">Google Play</div>
                </div>
              </a>

              {/* Apple App Store Badge */}
              <a
                href="#app-store"
                aria-label="Download on the App Store"
                className="flex items-center gap-2 bg-black hover:bg-neutral-900 border border-white/20 rounded-lg px-2.5 py-1 transition text-white select-none shrink-0"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.84.94-2.91-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.76-.95 2.81 1.02.08 2.05-.5 2.68-1.27z" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[7.5px] text-slate-300 font-medium">Download on the</div>
                  <div className="text-xs font-semibold text-white tracking-tight -mt-0.5">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
