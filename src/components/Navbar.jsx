import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, ShoppingCart, MapPin, User, Search, Menu, X, 
  ChevronDown, PhoneCall, LogOut, ShieldCheck,
  LayoutDashboard, Activity, FileText, Layers, Syringe, ShieldAlert,
  Truck, ArrowRight, Pill, Heart, Sparkles, Clock, Tag, Gift,
  FileCheck2, Baby, Stethoscope, Droplet, Apple, ShieldPlus,
  FlaskConical
} from 'lucide-react';

export default function Navbar({ 
  onOpenPrescriptionModal, 
  onSearchFocus,
  onOpenDoctorModal,
  onOpenPhysioModal,
  onOpenSurgeryModal,
  onOpenSeniorPickup
}) {
  const { totalItemsCount, openCart } = useCart();
  const { currentLocation, openLocationModal } = useLocation();
  const { user, isLoggedIn, openAuth, logout } = useAuth();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  const displayName = user?.name || user?.email || user?.contact || 'Patient';
  const displayInitial = (displayName.charAt(0) || 'P').toUpperCase();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Mega menu state
  const [medicinesMegaOpen, setMedicinesMegaOpen] = useState(false);
  const [labTestsMenuOpen, setLabTestsMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef(null);
  const labMenuTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMedicinesEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMedicinesMegaOpen(true);
    setLabTestsMenuOpen(false);
  };

  const handleMedicinesLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMedicinesMegaOpen(false);
    }, 200);
  };

  const handleLabTestsEnter = () => {
    if (labMenuTimeoutRef.current) clearTimeout(labMenuTimeoutRef.current);
    setLabTestsMenuOpen(true);
    setMedicinesMegaOpen(false);
  };

  const handleLabTestsLeave = () => {
    labMenuTimeoutRef.current = setTimeout(() => {
      setLabTestsMenuOpen(false);
    }, 200);
  };

  useEffect(() => {
    setMedicinesMegaOpen(false);
    setLabTestsMenuOpen(false);
    setMobileMenuOpen(false);
  }, [routerLocation.pathname]);

  const primaryNavLinks = [
    { name: 'Home', href: '/', isRoute: true },
    { name: 'Medicines', href: '/medicines', isRoute: true, hasDropdown: true, isMega: true },
    { name: 'Lab Tests', href: '/diagnostics', isRoute: true, hasDropdown: true, isLab: true },
    { name: 'Health Packages', href: '/packages', isRoute: true },
    { name: 'Wellness Packages', href: '/packages?type=wellness', isRoute: true },
    { name: 'Physiotherapy', href: '/physiotherapy', isRoute: true },
    { name: 'Doctor Appointment', href: '/doctor-appointment', isRoute: true },
  ];

  const secondaryNavLinks = [
    { name: 'Surgery Packages', onClick: onOpenSurgeryModal, isModal: true },
    { name: 'Senior Care (10km Free)', onClick: onOpenSeniorPickup, isModal: true },
    { name: 'About Us', href: '/about', isRoute: true },
    { name: 'Contact', href: '/contact', isRoute: true },
  ];

  const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];

  return (
    <>
      {/* Top Announcement Bar - Full Width with Responsive Gutters */}
      <div className="bg-[#0B2238] text-white text-xs sm:text-sm py-2 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 border-b border-white/10 select-none font-sans">
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 overflow-hidden text-slate-200">
            <span className="flex items-center gap-1.5 font-bold whitespace-nowrap text-[11px] sm:text-xs md:text-sm text-teal-300">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>Reports Delivered in a Single Day (12-24 Hrs)</span>
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <button
              type="button"
              onClick={onOpenSeniorPickup}
              className="hidden sm:inline-flex items-center gap-1 font-medium whitespace-nowrap text-xs md:text-sm text-emerald-300 hover:text-emerald-200 hover:underline cursor-pointer"
            >
              🚗 Free Senior Citizen Pick-up & Drop within 10km (Guwahati)
            </button>
            <span className="hidden lg:inline text-slate-500">|</span>
            <span className="hidden lg:inline font-bold text-white whitespace-nowrap text-xs md:text-sm bg-teal-800/60 px-2 py-0.5 rounded-full border border-teal-600/40">
              📍 Serving Exclusively Guwahati, Assam
            </span>
          </div>

          {/* Top Bar Right: Location Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={openLocationModal}
              className="flex items-center gap-1.5 sm:gap-2 text-slate-200 hover:text-white font-semibold transition shrink-0 text-xs sm:text-sm cursor-pointer"
              title="Select Delivery City"
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#14B8A6] shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-none">{currentLocation?.city || 'Guwahati'}</span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar - Full Width with Responsive Max Constraint */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 font-sans ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-border'
            : 'bg-white border-b border-border'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3 lg:gap-3 xl:gap-6">
            
            {/* Left: Brand Logo & Navigation (Hamburger alongside it) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <Link to="/" className="flex items-center group shrink-0">
                <img
                  src="/logo.png"
                  alt="Zestmed Diagnostics & Polyclinic"
                  className="h-10 sm:h-12 md:h-13 w-auto max-h-14 object-contain drop-shadow-xs group-hover:scale-105 transition-transform select-none shrink-0"
                />
              </Link>

              {/* Mobile Hamburger Toggle alongside Logo */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:text-[#008F83] hover:bg-slate-100 transition shrink-0 ml-1 border border-slate-200/70"
                aria-label="Navigation Menu"
                title="Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
              </button>
            </div>

            {/* Center Navigation Links with Mega Menu */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-2">
              {primaryNavLinks.map((link) => {
                const isActive = routerLocation.pathname === link.href || 
                  (link.href === '/medicines' && (routerLocation.pathname.startsWith('/medicines') || medicinesMegaOpen));

                if (link.isMega) {
                  return (
                    <div
                      key={link.name}
                      onMouseEnter={handleMedicinesEnter}
                      onMouseLeave={handleMedicinesLeave}
                    >
                      <Link
                        to={link.href}
                        className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-semibold rounded-xl transition flex items-center gap-1 whitespace-nowrap relative ${
                          isActive
                            ? 'text-[#008F83] font-bold'
                            : 'text-slate-700 hover:text-[#008F83]'
                        }`}
                      >
                        <span>{link.name}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-2.5 right-2.5 h-[3px] bg-[#008F83] rounded-full" />
                        )}
                      </Link>

                      {/* Mega Menu Dropdown - Centered on Navbar */}
                      {medicinesMegaOpen && (
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-fadeIn"
                          onMouseEnter={handleMedicinesEnter}
                          onMouseLeave={handleMedicinesLeave}
                        >
                          <div className="w-[940px] xl:w-[980px] max-w-[calc(100vw-32px)] bg-white rounded-3xl shadow-2xl border border-slate-100 p-7">
                            <div className="grid grid-cols-12 gap-6 items-stretch">
                            {/* Left Promo Card */}
                            <div className="col-span-4 bg-gradient-to-br from-[#E6F9F5] via-[#EDFCF9] to-[#D5F5EE] rounded-3xl p-6 border border-[#CCF2E9] flex flex-col justify-between text-left relative overflow-hidden group">
                              {/* Soft ambient mint glow in background */}
                              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-36 h-36 bg-teal-300/25 rounded-full blur-2xl pointer-events-none" />

                              <div>
                                {/* 3D Medicine Bottle & Pills Image matching reference */}
                                <div className="w-full h-36 flex items-center justify-center mb-3 relative z-10">
                                  <img
                                    src="/medicines-mega-bottle.png"
                                    alt="Buy Medicines Online - ZESTMED"
                                    className="max-h-full max-w-[210px] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 select-none"
                                  />
                                </div>

                                <h4 className="text-xl font-extrabold text-slate-900 leading-snug">
                                  Buy Medicines<br />Online
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                                  Wide range of genuine medicines at best prices.
                                </p>
                              </div>

                              <Link
                                to="/medicines"
                                onClick={() => setMedicinesMegaOpen(false)}
                                className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#008F83] hover:bg-[#007A70] text-white text-sm font-bold rounded-2xl shadow-sm transition group/btn"
                              >
                                <span>Shop All Medicines</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                            </div>

                            {/* Middle Column: Shop by Category */}
                            <div className="col-span-5 border-r border-slate-100 pr-5">
                              <h5 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
                                Shop by Category
                              </h5>
                              <div className="grid grid-cols-2 gap-2.5 text-sm">
                                <Link
                                  to="/medicines?category=general"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                    <Pill className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">General Medicines</span>
                                </Link>

                                <Link
                                  to="/medicines?category=heart"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <Heart className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Heart Care</span>
                                </Link>

                                <Link
                                  to="/medicines?category=vitamins"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    <Apple className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Vitamins</span>
                                </Link>

                                <Link
                                  to="/medicines?category=respiratory"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                    <Activity className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Respiratory</span>
                                </Link>

                                <Link
                                  to="/medicines?category=diabetes"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                    <Droplet className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Diabetes Care</span>
                                </Link>

                                <Link
                                  to="/medicines?category=digestive"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                                    <ShieldPlus className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Digestive Care</span>
                                </Link>

                                <Link
                                  to="/medicines?category=personal"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Personal Care</span>
                                </Link>

                                <Link
                                  to="/medicines?category=baby"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                                    <Baby className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Baby Care</span>
                                </Link>
                              </div>
                            </div>

                            {/* Right Column: Quick Links */}
                            <div className="col-span-3">
                              <h5 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
                                Quick Links
                              </h5>
                              <div className="space-y-2 text-sm">
                                <Link
                                  to="/medicines?filter=offers"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Gift className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Offers & Deals</span>
                                </Link>

                                <Link
                                  to="/medicines?filter=prescription"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008F83] flex items-center justify-center shrink-0">
                                    <FileCheck2 className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Prescription Required</span>
                                </Link>

                                <Link
                                  to="/medicines?filter=bestsellers"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Bestsellers</span>
                                </Link>

                                <Link
                                  to="/medicines?filter=new"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">New Arrivals</span>
                                </Link>

                                <Link
                                  to="/medicines?filter=generic"
                                  onClick={() => setMedicinesMegaOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <Tag className="w-4 h-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 group-hover:text-[#008F83]">Generic Medicines</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
                }

                if (link.isLab) {
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={handleLabTestsEnter}
                      onMouseLeave={handleLabTestsLeave}
                    >
                      <Link
                        to={link.href}
                        className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-semibold rounded-xl transition flex items-center gap-1 whitespace-nowrap relative ${
                          routerLocation.pathname === link.href || labTestsMenuOpen
                            ? 'text-[#008F83] font-bold'
                            : 'text-slate-700 hover:text-[#008F83]'
                        }`}
                      >
                        <span>{link.name}</span>
                        {routerLocation.pathname === link.href && (
                          <span className="absolute bottom-0 left-2.5 right-2.5 h-[3px] bg-[#008F83] rounded-full" />
                        )}
                      </Link>

                      {labTestsMenuOpen && (
                        <div
                          className="absolute top-full left-0 w-72 bg-white rounded-3xl shadow-xl border border-slate-100 py-3 z-50 animate-fadeIn"
                          onMouseEnter={handleLabTestsEnter}
                          onMouseLeave={handleLabTestsLeave}
                        >
                          <div className="px-5 py-2 border-b border-slate-100 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnostic Services</span>
                          </div>
                          <Link
                            to="/diagnostics"
                            onClick={() => setLabTestsMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-teal-50 hover:text-[#008F83] transition"
                          >
                            <FlaskConical className="w-5 h-5 text-[#008F83]" />
                            <span>All Diagnostic Tests</span>
                          </Link>
                          <Link
                            to="/diagnostics?cat=routine"
                            onClick={() => setLabTestsMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Activity className="w-5 h-5 text-sky-600" />
                            <span>Complete Blood Count</span>
                          </Link>
                          <Link
                            to="/diagnostics?cat=thyroid"
                            onClick={() => setLabTestsMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Activity className="w-5 h-5 text-purple-600" />
                            <span>Thyroid Profile</span>
                          </Link>
                          <Link
                            to="/diagnostics?cat=liver"
                            onClick={() => setLabTestsMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Activity className="w-5 h-5 text-amber-600" />
                            <span>Liver Function Test</span>
                          </Link>
                          <Link
                            to="/packages"
                            onClick={() => setLabTestsMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <ShieldPlus className="w-5 h-5 text-emerald-600" />
                            <span>Full Body Checkup</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.name === 'Physiotherapy' && (routerLocation.pathname === '/physiotherapy' || routerLocation.pathname === '/physio')) {
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="px-3.5 xl:px-4.5 py-1.5 text-xs xl:text-sm font-bold rounded-full bg-[#D8F3EC] text-[#007A64] border border-[#A7F3D0] shadow-2xs whitespace-nowrap"
                    >
                      <span>{link.name}</span>
                    </Link>
                  );
                }

                if (link.name === 'Doctor Appointment' && (routerLocation.pathname === '/doctor-appointment' || routerLocation.pathname === '/doctors')) {
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="px-3.5 xl:px-4.5 py-1.5 text-xs xl:text-sm font-bold rounded-full bg-[#007A64] text-white shadow-2xs whitespace-nowrap"
                    >
                      <span>{link.name}</span>
                    </Link>
                  );
                }

                if (link.isModal) {
                  return (
                    <button
                      key={link.name}
                      type="button"
                      onClick={link.onClick}
                      className="px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-semibold rounded-xl text-slate-700 hover:text-[#008F83] hover:bg-slate-50 transition whitespace-nowrap cursor-pointer"
                    >
                      <span>{link.name}</span>
                    </button>
                  );
                }

                const isCurrentActive = link.name === 'Wellness Packages'
                  ? routerLocation.pathname === '/packages' && routerLocation.search.includes('wellness')
                  : link.name === 'Health Packages'
                  ? routerLocation.pathname === '/packages' && !routerLocation.search.includes('wellness')
                  : routerLocation.pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`px-2.5 xl:px-3.5 py-2 text-xs xl:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap relative ${
                      isCurrentActive
                        ? 'text-[#008F83] font-bold'
                        : 'text-slate-700 hover:text-[#008F83]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isCurrentActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[3px] bg-[#008F83] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions: Search, Cart, Login (Always 100% visible) */}
            <div className="flex items-center gap-2 sm:gap-3 xl:gap-3.5 shrink-0 ml-auto z-20">
              <button
                type="button"
                onClick={onSearchFocus}
                className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition shrink-0"
                aria-label="Search"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={openCart}
                className="relative p-2 sm:p-2.5 rounded-full text-[#008F83] hover:bg-teal-50 transition shrink-0"
                aria-label="Shopping Cart"
                title="View Healthcare Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-[#008F83]" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white leading-none pointer-events-none select-none">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
              </button>

              {/* Login Button */}
              {isLoggedIn ? (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-slate-300 hover:border-[#008F83] bg-white transition text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap shrink-0 shadow-xs"
                    title={displayName}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#008F83] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {displayInitial}
                    </div>
                    <span className="hidden sm:inline-block max-w-[80px] xl:max-w-[110px] truncate">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-slate-200 py-2.5 z-50 animate-scale-up"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-5 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || user?.contact || ''}</p>
                      </div>
                      <Link
                        to="/patient-dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-800 hover:bg-slate-50 font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#008F83]" />
                        <span>Patient Dashboard</span>
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <User className="w-4 h-4 text-[#008F83]" />
                        <span>Switch Account / Login Page</span>
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl bg-[#008F83] hover:bg-[#007a70] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition whitespace-nowrap shrink-0"
                  title="Login"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>Login</span>
                </Link>
              )}

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-5 sm:px-6 py-4 space-y-4 shadow-xl">
            {/* User Profile / Auth Action Card in Mobile Menu */}
            {isLoggedIn ? (
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#008F83] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {displayInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || user?.contact || ''}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline shrink-0"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 via-teal-50/50 to-emerald-50/60 border border-teal-100 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Welcome to ZESTMED</p>
                  <p className="text-xs text-slate-500 mt-0.5">Sign in for orders & reports</p>
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 bg-[#008F83] hover:bg-[#007A70] text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-1">
              {allNavLinks.map((link) => {
                if (link.isModal) {
                  return (
                    <button
                      key={link.name}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        link.onClick && link.onClick();
                      }}
                      className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between text-left ${
                        link.highlight
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-800 hover:bg-slate-50 hover:text-[#008F83]'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-40" />
                    </button>
                  );
                }

                const isMobileActive = link.name === 'Wellness Packages'
                  ? routerLocation.pathname === '/packages' && routerLocation.search.includes('wellness')
                  : link.name === 'Health Packages'
                  ? routerLocation.pathname === '/packages' && !routerLocation.search.includes('wellness')
                  : routerLocation.pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-between ${
                      isMobileActive
                        ? 'bg-teal-50 text-[#008F83] font-bold'
                        : 'text-slate-800 hover:bg-slate-50 hover:text-[#008F83]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Extra Quick Actions - Shown ONLY after user logs in or registers */}
            {isLoggedIn && (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/patient-dashboard');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition text-center"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#008F83]" />
                  <span>Patient Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPrescriptionModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#008F83] text-[#008F83] hover:bg-teal-50 text-xs font-bold transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Upload Prescription</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}