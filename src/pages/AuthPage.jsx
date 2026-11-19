// src/pages/AuthPage.jsx
// Dedicated full-page Login experience matching the mobile mockup reference design
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, Smartphone, ShieldCheck, ChevronDown, 
  RotateCcw, CheckCircle2, X, User 
} from 'lucide-react';
import { getRegisteredPatient, normalizePhone } from '../utils/patientRegistry';

function ZestmedLogo() {
  return (
    <div className="flex items-center justify-center select-none">
      <img
        src="/logo.png"
        alt="Zestmed Diagnostics & Polyclinic"
        className="h-10 sm:h-12 w-auto object-contain select-none"
      />
    </div>
  );
}

function LandscapeIllustration() {
  return (
    <div className="w-full pointer-events-none select-none mt-6">
      <svg viewBox="0 0 360 85" fill="none" className="w-full h-auto" preserveAspectRatio="none">
        {/* Back Hill */}
        <path d="M0,85 L0,48 Q90,20 180,45 T360,35 L360,85 Z" fill="#E8F8FA" />
        {/* Mid Hill */}
        <path d="M0,85 L0,60 Q120,38 240,58 T360,48 L360,85 Z" fill="#D9F2F6" />
        {/* Trees */}
        <g fill="#BCE7EE" opacity="0.9">
          <circle cx="50" cy="40" r="11" />
          <rect x="48.5" y="49" width="3" height="12" rx="1" fill="#9FDCE6" />
          
          <circle cx="170" cy="34" r="14" />
          <rect x="168" y="45" width="4" height="15" rx="1" fill="#9FDCE6" />
          
          <circle cx="295" cy="40" r="12" />
          <rect x="293.5" y="49" width="3" height="12" rx="1" fill="#9FDCE6" />
        </g>
      </svg>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loginWithPhoneOtp, loginWithGoogle, logout } = useAuth();
  const { addToast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState(() => {
    if (user?.name && user.name !== 'Verified Patient' && !user.name.startsWith('Patient ')) {
      return user.name;
    }
    try {
      const saved = localStorage.getItem('zestmed_patient_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed.name !== 'Verified Patient' && !parsed.name.startsWith('Patient ')) {
          return parsed.name;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });
  const [step, setStep] = useState(1); // 1: Phone input, 2: OTP verification
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [detectedPatient, setDetectedPatient] = useState(null);

  useEffect(() => {
    if (user?.name && user.name !== 'Verified Patient' && !user.name.startsWith('Patient ')) {
      setFullName(user.name);
      if (user.contact || user.phone) {
        setPhoneNumber(normalizePhone(user.contact || user.phone));
      }
    }
  }, [user]);

  useEffect(() => {
    const clean = normalizePhone(phoneNumber);
    if (clean.length === 10) {
      const found = getRegisteredPatient(clean);
      setDetectedPatient(found);
      if (found?.name && found.name !== 'Verified Patient' && !found.name.startsWith('Patient ')) {
        setFullName(found.name);
      }
    } else {
      setDetectedPatient(null);
    }
  }, [phoneNumber]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    const clean = normalizePhone(phoneNumber);
    if (clean.length !== 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setStep(2);
    setOtp(['', '', '', '']);
    setResendCountdown(30);
    const resolvedName = (fullName.trim() || user?.name || detectedPatient?.name || 'Deepjyoti Kalita').trim();
    if (resolvedName && resolvedName !== 'Verified Patient') {
      addToast(`OTP sent for ${resolvedName}: 1234`, 'info');
    } else {
      addToast('Demo OTP sent: 1234', 'info');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input box
    if (value && index < 3) {
      const next = document.getElementById(`auth-otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`auth-otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 4) {
      addToast('Please enter the complete 4-digit OTP', 'error');
      return;
    }
    const resolvedName = (fullName.trim() || user?.name || detectedPatient?.name || 'Deepjyoti Kalita').trim();
    loginWithPhoneOtp(phoneNumber, resolvedName);
    navigate('/patient-dashboard');
  };

  const handleGoogleSignIn = () => {
    loginWithGoogle();
    navigate('/patient-dashboard');
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(30);
    setOtp(['', '', '', '']);
    addToast('New OTP sent to +91 ' + phoneNumber + ': 1234', 'info');
  };

  // If already logged in, show quick dashboard access
  if (user) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity font-sans select-none"
        onClick={() => navigate('/')}
      >
        <div 
          className="w-full max-w-[420px] max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center space-y-6 animate-scale-up overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end -mt-3 -mr-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ZestmedLogo />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Already Logged In</h2>
            <p className="text-sm text-slate-500">
              You are currently signed in as <strong className="text-slate-800">{user.name}</strong> ({user.phone || user.contact})
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="w-full py-3 rounded-2xl bg-[#007A64] hover:bg-[#006852] text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              Go to Patient Dashboard
            </button>
            <button
              onClick={() => {
                logout();
                addToast('Logged out successfully', 'info');
              }}
              className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity font-sans select-none"
      onClick={() => navigate('/')}
    >
      {/* Mobile Frame Container matching Reference Mockup & Modal Standard */}
      <div 
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col relative overflow-y-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with Back / Close Button */}
        <div className="pt-4 sm:pt-5 px-5 sm:px-6 flex items-center justify-between shrink-0">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-2 -ml-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="px-6 sm:px-7 pt-1 pb-0 flex flex-col">
          
          {/* Top Brand Logo */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <ZestmedLogo />
          </div>

          {step === 1 ? (
            /* STEP 1: Phone Number Input Form */
            <div className="space-y-4 sm:space-y-5">
              
              {/* Heading & Subtitle */}
              <div className="space-y-1 text-left">
                <h1 className="text-xl sm:text-[22px] font-black text-[#0B2238] tracking-tight">
                  Login with Mobile OTP
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Enter your mobile number to receive a one-time password (OTP).
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                
                {/* Mobile Number Input Container matching Reference */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number *
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 focus-within:border-[#007A64] focus-within:ring-2 focus-within:ring-[#007A64]/15 transition bg-white px-3 py-2 sm:py-2.5 shadow-2xs">
                    
                    {/* SIM/Phone Icon in Mint Badge */}
                    <div className="w-8 h-8 rounded-xl bg-[#E6F7F2] text-[#007A64] flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>

                    {/* +91 Country Code with Chevron */}
                    <div className="flex items-center gap-1 pl-2.5 pr-2 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-800">+91</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Vertical Divider */}
                    <div className="h-5 w-px bg-slate-200 shrink-0 mr-3" />

                    {/* Native Input */}
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Patient Full Name Input */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Patient Full Name
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 focus-within:border-[#007A64] focus-within:ring-2 focus-within:ring-[#007A64]/15 transition bg-white px-3 py-2 sm:py-2.5 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-[#E6F7F2] text-[#007A64] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent pl-3"
                    />
                  </div>
                  {detectedPatient?.name && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#007A64] font-semibold mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#007A64] shrink-0" />
                      <span>Registered Account: <strong className="text-slate-900 font-bold">{detectedPatient.name}</strong></span>
                    </div>
                  )}
                </div>

                {/* Primary CTA: Send OTP Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-[0.98] cursor-pointer text-center"
                >
                  Send OTP
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: 4-Digit OTP Verification Form */
            <div className="space-y-4 sm:space-y-5">
              
              {/* Heading & Subtitle */}
              <div className="space-y-1 text-left">
                <h1 className="text-xl sm:text-[22px] font-black text-[#0B2238] tracking-tight">
                  Verify Mobile OTP
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Enter the 4-digit verification code sent to <strong className="text-slate-800">+91 {phoneNumber}</strong>
                  {(fullName.trim() || detectedPatient?.name) && (
                    <span className="block text-[#007A64] font-semibold mt-1">
                      Patient: <strong className="text-slate-900 font-bold">{fullName.trim() || detectedPatient?.name}</strong>
                    </span>
                  )}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                
                {/* 4 Digit Boxes */}
                <div className="flex items-center justify-between gap-3 max-w-[280px] mx-auto py-1">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`auth-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-13 sm:h-14 text-center text-xl font-black text-slate-900 rounded-2xl border border-slate-200 focus:border-[#007A64] focus:ring-2 focus:ring-[#007A64]/15 outline-none transition bg-white shadow-2xs"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Resend Link */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-bold text-slate-600 hover:text-[#007A64] transition"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0}
                    className={`font-bold transition ${
                      resendCountdown > 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-[#007A64] hover:underline cursor-pointer'
                    }`}
                  >
                    {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-[0.98] cursor-pointer text-center"
                >
                  Verify & Proceed
                </button>
              </form>
            </div>
          )}

          {/* Bottom Landscape Illustration */}
          <LandscapeIllustration />

          {/* Bottom Security Trust Badge matching Reference */}
          <div className="flex items-center justify-center gap-1.5 pb-4 pt-1.5 text-xs font-bold text-[#007A64] select-none">
            <ShieldCheck className="w-4 h-4 text-[#007A64]" />
            <span>Your data is safe with us</span>
          </div>

        </div>
      </div>
    </div>
  );
}
