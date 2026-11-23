// src/components/AuthModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { 
  X, ArrowLeft, Smartphone, ShieldCheck, ChevronDown, User, 
  CheckCircle2, Clock, AlertTriangle, RefreshCw
} from 'lucide-react';
import { 
  requestOtp, 
  verifyOtpCode, 
  resendOtpCode, 
  getPhoneLockoutStatus, 
  normalizePhoneNumber,
  checkUserRegistrationByPhone,
  getTargetDashboardForRole,
  isAuthorizedAdmin,
  isAuthorizedLab
} from '../services/otpAuthService';

function ZestmedLogo() {
  return (
    <div className="flex items-center justify-center select-none">
      <img
        src="/logo.png"
        alt="Zestmed Diagnostics & Polyclinic"
        className="h-9 sm:h-11 w-auto object-contain select-none"
      />
    </div>
  );
}

function LandscapeIllustration() {
  return (
    <div className="w-full pointer-events-none select-none mt-4 sm:mt-5">
      <svg viewBox="0 0 360 85" fill="none" className="w-full h-auto" preserveAspectRatio="none">
        <path d="M0,85 L0,48 Q90,20 180,45 T360,35 L360,85 Z" fill="#E8F8FA" />
        <path d="M0,85 L0,60 Q120,38 240,58 T360,48 L360,85 Z" fill="#D9F2F6" />
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

export default function AuthModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthModalOpen, closeAuth, loginWithPhoneOtp, setupUserProfile, loginWithGoogle, user } = useAuth();
  const { addToast } = useToast();
  const { addItem } = useCart();

  // Wizard Step: 1: Phone, 2: 6-Digit OTP, 3: Profile Setup (new users)
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 6-Digit OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [expiryCountdown, setExpiryCountdown] = useState(300); // 5 minutes (300s)
  const [isExpired, setIsExpired] = useState(false);
  const [lockoutStatus, setLockoutStatus] = useState({ isLocked: false, remainingMinutes: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(4);
  const [isNewUser, setIsNewUser] = useState(false);
  const [detectedUser, setDetectedUser] = useState(null);

  // Step 3 Profile fields
  const [profileName, setProfileName] = useState('');

  // Check detected user as phone changes
  useEffect(() => {
    const clean = normalizePhoneNumber(phoneNumber);
    if (clean.length === 10) {
      const lockout = getPhoneLockoutStatus(clean);
      setLockoutStatus(lockout);

      checkUserRegistrationByPhone(clean).then((res) => {
        if (res.exists && res.user) {
          setDetectedUser(res.user);
          setIsNewUser(false);
          setProfileName(res.user.name || '');
        } else {
          setDetectedUser(null);
          setIsNewUser(true);
        }
      });
    } else {
      setDetectedUser(null);
      setLockoutStatus({ isLocked: false, remainingMinutes: 0 });
    }
  }, [phoneNumber]);

  // Resend Cooldown Countdown (30s)
  useEffect(() => {
    let timer;
    if (step === 2 && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // 5-Minute OTP Expiry Countdown (300s)
  useEffect(() => {
    let timer;
    if (step === 2 && expiryCountdown > 0 && !isExpired) {
      timer = setInterval(() => {
        setExpiryCountdown((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            setErrorMessage('OTP has expired (valid for 5 minutes). Please request a new OTP.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, expiryCountdown, isExpired]);

  if (!isAuthModalOpen) return null;

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const clean = normalizePhoneNumber(phoneNumber);
    if (clean.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestOtp(clean);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to send OTP. Please try again.');
        if (res.isLocked) {
          setLockoutStatus({ isLocked: true, remainingMinutes: 10 });
        }
        addToast(res.error || 'Failed to send OTP', 'error');
        return;
      }

      setStep(2);
      setOtp(['', '', '', '', '', '']);
      setResendCountdown(30);
      setExpiryCountdown(300);
      setIsExpired(false);
      setAttemptsRemaining(4);
      setIsNewUser(res.isNewUser);

      // Notify user of generated OTP for instant verification / demo
      addToast(`OTP sent to +91 ${clean}: ${res.code} (Valid for 5 mins)`, 'info');
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Error communicating with authentication server.');
      addToast('Error sending OTP', 'error');
    }
  };

  // Step 2: Handle 6-digit OTP inputs
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setErrorMessage('');
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const next = document.getElementById(`modal-otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`modal-otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length && i < 6; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pasted.length, 5);
      const next = document.getElementById(`modal-otp-${focusIndex}`);
      if (next) next.focus();
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || lockoutStatus.isLocked) return;
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await resendOtpCode(phoneNumber);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error);
        addToast(res.error, 'error');
        return;
      }

      setOtp(['', '', '', '', '', '']);
      setResendCountdown(30);
      setExpiryCountdown(300);
      setIsExpired(false);
      setAttemptsRemaining(4);

      addToast(`New OTP sent to +91 ${phoneNumber}: ${res.code}`, 'info');
    } catch {
      setIsSubmitting(false);
      addToast('Failed to resend OTP', 'error');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      addToast('Please enter all 6 digits of OTP', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtpCode(phoneNumber, fullOtp);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Invalid OTP entered.');
        if (res.attemptsRemaining !== undefined) {
          setAttemptsRemaining(res.attemptsRemaining);
        }
        if (res.isLocked) {
          setLockoutStatus({ isLocked: true, remainingMinutes: 10 });
        }
        if (res.isExpired) {
          setIsExpired(true);
        }
        addToast(res.error || 'Verification failed', 'error');
        return;
      }

      // Check if this is a new user who needs profile setup (Step 3)
      if (res.isNewUser && (!detectedUser || !detectedUser.name || detectedUser.name === 'Patient')) {
        setStep(3); // Go to Profile Setup
        return;
      }

      // Existing User: direct login
      const clean = normalizePhoneNumber(phoneNumber);
      const loggedInUser = loginWithPhoneOtp(clean, detectedUser?.name || profileName || '');
      handlePostLoginFlow(loggedInUser);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Verification failed due to a system error.');
      addToast('Verification failed', 'error');
    }
  };

  // Step 3: Complete Profile Setup (New User Registration)
  const handleCompleteProfile = (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setErrorMessage('Please enter your full name to complete registration.');
      addToast('Please enter your full name', 'error');
      return;
    }

    const clean = normalizePhoneNumber(phoneNumber);
    const newUser = setupUserProfile(clean, {
      name: profileName.trim(),
      city: 'Guwahati'
    });

    handlePostLoginFlow(newUser);
  };

  // Post Login Redirection & Restoration
  const handlePostLoginFlow = (loggedInUser) => {
    // 1. Restore pending cart item
    try {
      const pendingRaw = sessionStorage.getItem('zestmed_pending_cart_item');
      if (pendingRaw) {
        const parsed = JSON.parse(pendingRaw);
        sessionStorage.removeItem('zestmed_pending_cart_item');
        if (parsed?.item) {
          addItem(parsed.item, parsed.itemType || 'medicine');
        }
      }
    } catch (e) {
      console.warn('Failed restoring pending cart item:', e);
    }

    // 2. Restore pending booking action
    try {
      const pendingActionRaw = sessionStorage.getItem('zestmed_pending_action');
      if (pendingActionRaw) {
        const parsed = JSON.parse(pendingActionRaw);
        if (parsed?.type === 'add_to_cart' && parsed?.item) {
          sessionStorage.removeItem('zestmed_pending_action');
          addItem(parsed.item, parsed.itemType || 'medicine');
        }
        window.dispatchEvent(new CustomEvent('zestmed:resume-action', { detail: parsed }));
      }
    } catch (e) {
      console.warn('Failed restoring pending action:', e);
    }

    handleClose();

    // 3. Role-Based Redirection: Admin -> Admin Dashboard, Lab -> Lab Dashboard, Regular User -> Home Page
    if (isAuthorizedAdmin(loggedInUser)) {
      navigate('/admin-dashboard');
    } else if (isAuthorizedLab(loggedInUser)) {
      navigate('/lab-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleClose = () => {
    setStep(1);
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setErrorMessage('');
    setIsExpired(false);
    setLockoutStatus({ isLocked: false, remainingMinutes: 0 });
    closeAuth();
  };

  const handleChangeNumber = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setErrorMessage('');
    setIsExpired(false);
    setResendCountdown(30);
    setExpiryCountdown(300);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity select-none font-sans overflow-x-hidden"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-[420px] max-h-[94vh] flex flex-col overflow-y-auto relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with Back / Close Button */}
        <div className="pt-4 sm:pt-5 px-5 sm:px-6 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleChangeNumber}
              className="p-2 -ml-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}

          <button
            type="button"
            onClick={handleClose}
            className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="px-5 sm:px-7 pt-1 flex flex-col">
          {/* Brand Logo */}
          <div className="flex justify-center mb-4 sm:mb-5">
            <ZestmedLogo />
          </div>

          {/* STEP 1: MOBILE NUMBER LOGIN */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1 text-left">
                <h2 className="text-lg sm:text-xl font-black text-[#0B2238] tracking-tight">
                  Login with Mobile OTP
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Enter your 10-digit mobile number to sign in or create an account.
                </p>
              </div>

              {/* Lockout Warning Banner */}
              {lockoutStatus.isLocked && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Account Temporarily Locked:</span> Too many failed attempts. Try again in {lockoutStatus.remainingMinutes} minute(s).
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && !lockoutStatus.isLocked && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Mobile Number *
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 focus-within:border-[#007A64] focus-within:ring-2 focus-within:ring-[#007A64]/15 transition bg-white px-3 py-2.5 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-[#E6F7F2] text-[#007A64] flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1 pl-2.5 pr-2 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-800">+91</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="h-5 w-px bg-slate-200 shrink-0 mr-3" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      value={phoneNumber}
                      onChange={(e) => {
                        setErrorMessage('');
                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                      }}
                      placeholder="Enter 10-digit number"
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                      autoFocus
                      disabled={lockoutStatus.isLocked}
                    />
                  </div>
                </div>

                {/* Account Uniqueness Status Badge */}
                {phoneNumber.length === 10 && (
                  <div>
                    {detectedUser?.name ? (
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-[#007A64] font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#007A64] shrink-0" />
                        <span>Registered Account: <strong className="text-slate-900 font-bold">{detectedUser.name}</strong></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-800 font-medium">
                        <ShieldCheck className="w-4 h-4 text-[#007A64] shrink-0" />
                        <span>New User: An account will be automatically created with this number.</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || lockoutStatus.isLocked || phoneNumber.length !== 10}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2 ${
                    phoneNumber.length === 10 && !lockoutStatus.isLocked
                      ? 'bg-[#007A64] hover:bg-[#006852] text-white shadow-teal-700/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send 6-Digit OTP</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-black text-[#0B2238] tracking-tight">
                    Verify 6-Digit OTP
                  </h2>
                  {/* 5-minute Expiry Countdown */}
                  <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isExpired ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{isExpired ? 'Expired' : formatCountdown(expiryCountdown)}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Code sent to <strong className="text-slate-800">+91 {phoneNumber}</strong>{' '}
                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    className="text-[#007A64] hover:underline font-bold ml-1 cursor-pointer"
                  >
                    (Change)
                  </button>
                </div>
              </div>

              {/* Lockout or Error Alert */}
              {lockoutStatus.isLocked && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>This number is temporarily locked for 10 minutes due to failed attempts.</div>
                </div>
              )}

              {errorMessage && !lockoutStatus.isLocked && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* 6 OTP Input Boxes */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 max-w-[310px] mx-auto py-1">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`modal-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handlePaste : undefined}
                      disabled={isExpired || lockoutStatus.isLocked}
                      className="w-10 sm:w-11 h-12 sm:h-13 text-center text-lg sm:text-xl font-black text-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 focus:border-[#007A64] focus:ring-2 focus:ring-[#007A64]/15 outline-none transition bg-white shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Resend OTP & Change Number Controls */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    className="font-bold text-slate-600 hover:text-[#007A64] transition cursor-pointer"
                  >
                    Change Number
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || lockoutStatus.isLocked}
                    className={`font-bold transition cursor-pointer flex items-center gap-1 ${
                      resendCountdown > 0 || lockoutStatus.isLocked
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-[#007A64] hover:underline'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.join('').length < 6 || isExpired || lockoutStatus.isLocked}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2 ${
                    otp.join('').length === 6 && !isExpired && !lockoutStatus.isLocked
                      ? 'bg-[#007A64] hover:bg-[#006852] text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: USER PROFILE SETUP (NEW USERS) */}
          {step === 3 && (
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-black text-[#0B2238] tracking-tight">
                  Complete Your Profile
                </h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Welcome to ZESTMED! Please share basic details to finalize your account.
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCompleteProfile} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name *
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 focus-within:border-[#007A64] focus-within:ring-2 focus-within:ring-[#007A64]/15 transition bg-white px-3 py-2.5 shadow-2xs">
                    <User className="w-4 h-4 text-[#007A64] shrink-0" />
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Arpita Sen"
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none bg-transparent pl-2.5"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!profileName.trim()}
                  className="w-full mt-2 py-3.5 rounded-2xl bg-[#007A64] hover:bg-[#006852] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-[0.98] cursor-pointer text-center"
                >
                  Complete Registration & Login
                </button>
              </form>
            </div>
          )}

          {/* Bottom Illustration & Trust Badge */}
          <LandscapeIllustration />
          <div className="flex items-center justify-center gap-1.5 pb-4 pt-1 text-xs font-bold text-[#007A64] select-none">
            <ShieldCheck className="w-4 h-4 text-[#007A64]" />
            <span>One Mobile Number, One User Account</span>
          </div>

        </div>
      </div>
    </div>
  );
}
