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
                <Link to="/labtests" className="hover:text-white transition">Lab Tests</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/surgery-packages" className="hover:text-white transition">Surgery Packages</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/wellness-packages" className="hover:text-white transition">Wellness Packages</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/about" className="hover:text-white transition">About</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/contact" className="hover:text-white transition">Contact</Link>
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
                <Link to="/labtests" className="hover:text-white transition">Book Lab Tests</Link>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#C0D8DC]/70">•</span>
                <Link to="/labtests" className="hover:text-white transition">Home Sample Collection</Link>
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
        </div>
      </div>
    </footer>
  );
}
