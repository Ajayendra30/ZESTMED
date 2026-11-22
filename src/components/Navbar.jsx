import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, ShoppingCart, MapPin, User, Search, Menu, X, 
  ChevronDown, PhoneCall, LogOut, ShieldCheck,
  LayoutDashboard, Activity, FileText, Layers, Syringe, ShieldAlert,
  Truck, ArrowRight, Pill, Heart, Award, Clock, Tag, Gift,
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

  const getDisplayName = () => {
    if (user?.name && user.name !== 'Verified Patient' && !user.name.startsWith('Patient ') && user.name !== 'Patient' && user.name !== 'Rahul Verma') {
      return user.name;
    }
    try {
      const saved = localStorage.getItem('zestmed_patient_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed.name !== 'Verified Patient' && !parsed.name.startsWith('Patient ') && parsed.name !== 'Patient' && parsed.name !== 'Rahul Verma') {
          return parsed.name;
        }
      }
    } catch (_) {}
    return 'Ajayendra Shekhar';
  };
  const displayName = getDisplayName();
  const displayInitial = (displayName.charAt(0) || 'A').toUpperCase();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Mega menu state
  const [medicinesMegaOpen, setMedicinesMegaOpen] = useState(false);
  const [labTestsMenuOpen, setLabTestsMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef(null);
  const labMenuTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [userDropdownOpen]);

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
    { name: 'Surgery Packages', href: '/surgery-packages', isRoute: true },
    { name: 'Wellness Packages', href: '/wellness-packages', isRoute: true },
    { name: 'Physiotherapy', href: '/physiotherapy', isRoute: true },
    { name: 'Doctor Appointment', href: '/doctor-appointment', isRoute: true },
    { name: 'Contact', href: '/contact', isRoute: true },
  ];

  const secondaryNavLinks = [
    { name: 'Senior Care (10km Free)', onClick: onOpenSeniorPickup, isModal: true },
  ];

  const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];

  return (
    <>
      {/* Top Announcement Bar - Compact, Sleek Height with Exact Original Content */}
      <div className="bg-[#0B2238] text-white text-[11px] sm:text-xs py-1 sm:py-1.5 px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 border-b border-white/10 select-none font-sans">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-4 min-h-[24px]">
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 text-slate-200 min-w-0 flex-1">
            <span className="flex items-center gap-1.5 font-bold truncate sm:whitespace-nowrap text-[11px] sm:text-xs text-teal-300 leading-none">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span>Reports Delivered in a Single Day (12-24 Hrs)</span>
            </span>
            <span className="hidden sm:inline text-slate-500 leading-none">|</span>
            <button
              type="button"
              onClick={onOpenSeniorPickup}
              className="hidden sm:inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-[11px] sm:text-xs text-emerald-300 hover:text-emerald-200 hover:underline cursor-pointer leading-none"
            >
              🚗 Free Senior Citizen Pick-up & Drop within 10km (Guwahati)
            </button>
          </div>

          <div className="hidden lg:flex items-center shrink-0">
            <span className="font-bold text-white whitespace-nowrap text-[11px] sm:text-xs bg-teal-800/70 px-2.5 py-0.5 rounded-full border border-teal-600/40 shadow-xs leading-none">
              📍 Serving Exclusively Guwahati, Assam
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar - Full Width with Responsive Max Constraint */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 font-sans ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-border'
            : 'bg-white border-b border-border'
        }`}
      >
        <div className="w-full max-w-full px-3 sm:px-6 lg:px-3 xl:px-4 2xl:px-8 relative">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-2.5 xl:gap-3">
            
            {/* Left: Brand Logo & Navigation (Hamburger alongside it) */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 min-w-0">
              <Link to="/" className="flex items-center group shrink-0">
                <img
                  src="/logo.png"
                  alt="Zestmed Diagnostics & Polyclinic"
                  className="h-8 xs:h-9 sm:h-12 md:h-13 w-auto max-h-14 object-contain drop-shadow-xs group-hover:scale-105 transition-transform select-none shrink-0"
                />
              </Link>

              {/* Mobile Hamburger Toggle alongside Logo */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-xl text-slate-700 hover:text-[#008F83] hover:bg-slate-100 transition shrink-0 ml-0.5 sm:ml-1 border border-slate-200/70"
                aria-label="Navigation Menu"
                title="Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
              </button>
            </div>

            {/* Center Navigation Links with Mega Menu */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-2 lg:ml-3.5 xl:ml-5 2xl:ml-6">
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
                        className={`px-1.5 xl:px-2 2xl:px-3 py-2 text-xs 2xl:text-sm font-semibold rounded-xl transition flex items-center gap-1 whitespace-nowrap relative ${
                          isActive
                            ? 'text-[#008F83] font-bold'
                            : 'text-slate-700 hover:text-[#008F83]'
                        }`}
                      >
                        <span>{link.name}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-1.5 right-1.5 xl:left-2 xl:right-2 h-[3px] bg-[#008F83] rounded-full" />
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
                                    <Award className="w-4 h-4" />
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
                        onClick={() => setLabTestsMenuOpen(false)}
                        className={`px-1.5 xl:px-2 2xl:px-3 py-2 text-xs 2xl:text-sm font-semibold rounded-xl transition flex items-center gap-1 whitespace-nowrap relative ${
                          routerLocation.pathname === link.href ||
                          routerLocation.pathname === '/lab-tests' ||
                          routerLocation.pathname === '/labtests' ||
                          routerLocation.pathname === '/lab-test' ||
                          labTestsMenuOpen
                            ? 'text-[#008F83] font-bold'
                            : 'text-slate-700 hover:text-[#008F83]'
                        }`}
                      >
                        <span>{link.name}</span>
                        {(routerLocation.pathname === link.href ||
                          routerLocation.pathname === '/lab-tests' ||
                          routerLocation.pathname === '/labtests' ||
                          routerLocation.pathname === '/lab-test') && (
                          <span className="absolute bottom-0 left-1.5 right-1.5 xl:left-2 xl:right-2 h-[3px] bg-[#008F83] rounded-full" />
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

                if (link.isModal) {
                  return (
                    <button
                      key={link.name}
                      type="button"
                      onClick={link.onClick}
                      className="px-1.5 xl:px-2 2xl:px-3 py-2 text-xs 2xl:text-sm font-semibold rounded-xl text-slate-700 hover:text-[#008F83] hover:bg-slate-50 transition whitespace-nowrap cursor-pointer"
                    >
                      <span>{link.name}</span>
                    </button>
                  );
                }

                const isCurrentActive = link.name === 'Wellness Packages'
                  ? routerLocation.pathname === '/wellness-packages' || routerLocation.pathname === '/wellness'
                  : link.name === 'Surgery Packages'
                  ? routerLocation.pathname === '/surgery-packages' || routerLocation.pathname === '/surgeries' || routerLocation.pathname === '/packages'
                  : link.name === 'Physiotherapy'
                  ? routerLocation.pathname === '/physiotherapy' || routerLocation.pathname === '/physio' || routerLocation.pathname === '/physiotherapist'
                  : link.name === 'Doctor Appointment'
                  ? routerLocation.pathname === '/doctor-appointment' || routerLocation.pathname === '/doctors' || routerLocation.pathname === '/doctor' || routerLocation.pathname === '/book-doctor'
                  : link.name === 'About'
                  ? routerLocation.pathname === '/about' || routerLocation.pathname === '/about-us'
                  : link.name === 'Contact'
                  ? routerLocation.pathname === '/contact' || routerLocation.pathname === '/contact-us'
                  : link.name === 'Lab Tests'
                  ? routerLocation.pathname === '/diagnostics' || routerLocation.pathname === '/lab-tests' || routerLocation.pathname === '/labtests' || routerLocation.pathname === '/lab-test'
                  : routerLocation.pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`px-1.5 xl:px-2 2xl:px-3 py-2 text-xs 2xl:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap relative ${
                      isCurrentActive
                        ? 'text-[#008F83] font-bold'
                        : 'text-slate-700 hover:text-[#008F83]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isCurrentActive && (
                      <span className="absolute bottom-0 left-1.5 right-1.5 xl:left-2 xl:right-2 h-[3px] bg-[#008F83] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions: Search, Cart, Login / Profile (Always 100% visible, never cut off) */}
            <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0 ml-auto z-20">
              <button
                type="button"
                onClick={onSearchFocus}
                className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition shrink-0 cursor-pointer"
                aria-label="Search"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={openCart}
                className="relative p-2 sm:p-2.5 rounded-full text-[#008F83] hover:bg-teal-50 transition shrink-0 cursor-pointer"
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

              {/* Login / User Profile Dropdown Button */}
              {isLoggedIn ? (
                <div className="relative shrink-0" ref={userMenuRef}>
                  {/* Profile Box - No Text inside the box */}
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border border-slate-200 hover:border-[#008F83] bg-white transition shrink-0 shadow-2xs hover:shadow-xs cursor-pointer group"
                    title={displayName}
                    aria-label="User Account Menu"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#008F83] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      {displayInitial}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Clearly Visible Dropdown Box with 3 Required Options */}
                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-[100] animate-scale-up"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
                        <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || user?.contact || ''}</p>
                      </div>

                      {/* 3 Required Dropdown Options */}
                      <div className="p-1.5 space-y-0.5">
                        {/* 1. Patient Dashboard */}
                        <Link
                          to="/patient-dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-800 hover:text-[#008F83] hover:bg-teal-50/70 rounded-xl transition font-medium group cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#008F83] shrink-0" />
                          <span className="font-semibold text-slate-800 group-hover:text-[#008F83]">Patient Dashboard</span>
                        </Link>

                        {/* 2. Switch Account */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openAuth('login');
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-800 hover:text-[#008F83] hover:bg-teal-50/70 rounded-xl transition font-medium group text-left cursor-pointer"
                        >
                          <User className="w-4 h-4 text-[#008F83] shrink-0" />
                          <span className="font-semibold text-slate-800 group-hover:text-[#008F83]">Switch Account</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        {/* 3. Logout */}
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition text-left font-semibold cursor-pointer group"
                        >
                          <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="font-semibold text-rose-600">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="p-2 sm:p-2.5 rounded-full transition shrink-0 flex items-center justify-center hover:bg-slate-100 text-slate-700 hover:text-[#008F83] cursor-pointer"
                  title="Login"
                  aria-label="Login"
                >
                  <User className="w-5 h-5 shrink-0" />
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 sm:px-6 py-4 space-y-4 shadow-xl max-h-[calc(100vh-64px)] overflow-y-auto overscroll-contain">
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
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('login');
                  }}
                  className="px-4 py-2 bg-[#008F83] hover:bg-[#007A70] text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                >
                  Login
                </button>
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
                  ? routerLocation.pathname === '/wellness-packages' || routerLocation.pathname === '/wellness'
                  : link.name === 'Surgery Packages'
                  ? routerLocation.pathname === '/surgery-packages' || routerLocation.pathname === '/surgeries' || routerLocation.pathname === '/packages'
                  : link.name === 'Physiotherapy'
                  ? routerLocation.pathname === '/physiotherapy' || routerLocation.pathname === '/physio' || routerLocation.pathname === '/physiotherapist'
                  : link.name === 'Doctor Appointment'
                  ? routerLocation.pathname === '/doctor-appointment' || routerLocation.pathname === '/doctors' || routerLocation.pathname === '/doctor' || routerLocation.pathname === '/book-doctor'
                  : link.name === 'About'
                  ? routerLocation.pathname === '/about' || routerLocation.pathname === '/about-us'
                  : link.name === 'Contact'
                  ? routerLocation.pathname === '/contact' || routerLocation.pathname === '/contact-us'
                  : link.name === 'Lab Tests'
                  ? routerLocation.pathname === '/diagnostics' || routerLocation.pathname === '/lab-tests' || routerLocation.pathname === '/labtests' || routerLocation.pathname === '/lab-test'
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