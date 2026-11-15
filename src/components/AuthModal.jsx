// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, ArrowLeft, ChevronDown, Smartphone, ShieldCheck, RefreshCw, User } from 'lucide-react';

export default function AuthModal() {
  const navigate = useNavigate();
  const { isAuthModalOpen, closeAuth, authMode, setAuthMode, loginWithPhoneOtp, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState(1); // 1: Details / Phone, 2: OTP
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'register' && !fullName.trim()) {
      addToast('Please enter your full name', 'error');
      return;
    }
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length !== 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setStep(2);
    setOtp(['', '', '', '']);
    addToast('OTP sent to your registered mobile number: 1234', 'info');
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 4) {
      addToast('Please enter the complete 4-digit OTP', 'error');
      return;
    }
    loginWithPhoneOtp(phoneNumber, fullName.trim() || 'Verified Patient');
    resetModal();
    navigate('/patient-dashboard');
  };

  const handleGoogleSignIn = () => {
    loginWithGoogle();
    resetModal();
    navigate('/patient-dashboard');
  };

  const handleResendOtp = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setResendCountdown(30);
    }, 1000);
  };

  const resetModal = () => {
    setStep(1);
    setPhoneNumber('');
    setFullName('');
    setOtp(['', '', '', '']);
  };

  const handleClose = () => {
    resetModal();
    closeAuth();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity select-none font-sans"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 w-[94%] max-w-[420px] min-h-[580px] max-h-[92vh] flex flex-col justify-between overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Row */}
        <div className="pt-5 px-6 sm:px-7 flex items-center justify-between shrink-0">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Back to Details"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Brand: Logo + Zestmed */}
        <div className="flex items-center justify-center gap-2.5 pt-1 pb-3 shrink-0">
          <img
            src="/logo.png"
            alt="Zestmed Logo"
            className="w-10 h-10 object-contain drop-shadow-sm select-none"
          />
          <span className="text-[26px] sm:text-[28px] font-black text-[#0A2540] tracking-tight">
            Zestmed
          </span>
        </div>

        {/* Form Body with identical height & layout across Login and Register */}
        <div className="px-6 sm:px-8 pb-6 flex-1 flex flex-col justify-between">
          {step === 1 ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Login / Register Toggle Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4 max-w-[240px] mx-auto select-none">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                      authMode === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                      authMode === 'register'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Heading & Subtitle - Centered with fixed height */}
                <div className="text-center mb-4 min-h-[52px] flex flex-col justify-center">
                  <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight">
                    {authMode === 'login' ? 'Login with Mobile OTP' : 'Register with Mobile OTP'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug max-w-xs mx-auto">
                    {authMode === 'login'
                      ? 'Enter your mobile number to receive a 4-digit verification OTP.'
                      : 'Enter your full name and mobile number to create your account.'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
                  {/* Inputs slot with consistent min-height */}
                  <div className="min-h-[105px] flex flex-col justify-center space-y-3">
                    {/* Full Name Input (Only on Register) */}
                    {authMode === 'register' && (
                      <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-[#008F83] focus-within:ring-2 focus-within:ring-[#008F83]/15 transition bg-white px-3 py-2.5">
                        <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200 shrink-0">
                          <div className="w-6 h-6 rounded-md bg-[#E6F7F5] flex items-center justify-center text-[#008F83] shrink-0">
                            <User className="w-3.5 h-3.5 text-[#008F83]" />
                          </div>
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full pl-3 pr-2 py-0.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                      </div>
                    )}

                    {/* Mobile Number Input */}
                    <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-[#008F83] focus-within:ring-2 focus-within:ring-[#008F83]/15 transition bg-white px-3 py-2.5">
                      <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200 shrink-0">
                        <div className="w-6 h-6 rounded-md bg-[#E6F7F5] flex items-center justify-center text-[#008F83] shrink-0">
                          <Smartphone className="w-3.5 h-3.5 text-[#008F83]" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 tracking-tight ml-0.5">
                          +91
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Mobile Number"
                        className="w-full pl-3 pr-2 py-0.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={phoneNumber.length !== 10 || (authMode === 'register' && !fullName.trim())}
                    className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition shadow-sm select-none mt-1 ${
                      phoneNumber.length === 10 && (authMode === 'login' || fullName.trim())
                        ? 'bg-[#008F83] hover:bg-[#007A70] text-white active:scale-[0.99] cursor-pointer'
                        : 'bg-[#008F83]/70 text-white/80 cursor-not-allowed'
                    }`}
                  >
                    {authMode === 'login' ? 'Send OTP' : 'Send OTP & Register'}
                  </button>
                </form>

                {/* Centered "or" Divider */}
                <div className="flex items-center justify-center my-4 gap-3">
                  <div className="flex-1 h-[1px] bg-slate-200" />
                  <span className="text-xs font-semibold text-slate-400 lowercase select-none px-1">
                    or
                  </span>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-slate-800 font-bold text-sm flex items-center justify-center gap-2.5 shadow-xs select-none active:scale-[0.99]"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Bottom Toggle Note */}
              <p className="text-xs text-slate-500 text-center mt-3 pt-2 border-t border-slate-100">
                {authMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-[#008F83] font-bold hover:underline cursor-pointer"
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-[#008F83] font-bold hover:underline cursor-pointer"
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Step 2: OTP Verification */}
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight">
                  Verify Mobile OTP
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Enter the 4-digit code sent to <strong className="text-slate-800 font-semibold">+91 {phoneNumber}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 4 Digit Square OTP Inputs */}
                <div className="flex items-center justify-center gap-3 py-1">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoFocus={index === 0}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 sm:w-13 sm:h-13 text-center text-xl sm:text-2xl font-bold text-slate-900 border-2 border-slate-200 focus:border-[#008F83] focus:ring-2 focus:ring-[#008F83]/20 rounded-xl outline-none transition font-mono bg-slate-50/50"
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={otp.join('').length !== 4}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition shadow-sm select-none ${
                    otp.join('').length === 4
                      ? 'bg-[#008F83] hover:bg-[#007A70] text-white active:scale-[0.99] cursor-pointer'
                      : 'bg-[#008F83]/70 text-white/80 cursor-not-allowed'
                  }`}
                >
                  Verify & Proceed
                </button>

                {/* Resend OTP */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-xs font-semibold text-[#008F83] hover:underline inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Bottom Organic Wave Graphic with Medical Cross Trees */}
        <div className="w-full relative overflow-hidden mt-4">
          <svg
            viewBox="0 0 360 85"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto pointer-events-none select-none block"
            preserveAspectRatio="none"
          >
            {/* Back Hill */}
            <path
              d="M0 55 C80 30 180 50 360 38 L360 85 L0 85 Z"
              fill="#E8F8F6"
            />
            {/* Mid Hill */}
            <path
              d="M0 65 C120 42 220 58 360 52 L360 85 L0 85 Z"
              fill="#D5F3EF"
            />

            {/* Stylized Tree 1 (cross canopy) */}
            <rect x="155" y="38" width="4" height="18" rx="2" fill="#B2E7E1" />
            <rect x="149" y="24" width="16" height="16" rx="4" fill="#B2E7E1" />
            <path d="M154 21 H160 V39 H154 Z M146 27 H168 V33 H146 Z" fill="#9DE0D9" />

            {/* Stylized Tree 2 */}
            <rect x="205" y="45" width="4" height="16" rx="2" fill="#B2E7E1" />
            <path d="M203 32 H211 V50 H203 Z M197 38 H217 V44 H197 Z" fill="#A8E4DE" />

            {/* Stylized Tree 3 */}
            <rect x="255" y="50" width="3.5" height="14" rx="1.75" fill="#BCEBE6" />
            <path d="M253 40 H260 V54 H253 Z M248 45 H265 V49 H248 Z" fill="#B0E6E1" />

            {/* Stylized Tree 4 (Left small) */}
            <rect x="80" y="52" width="3" height="12" rx="1.5" fill="#C5EFEB" />
            <path d="M79 43 H84 V55 H79 Z M75 47 H88 V51 H75 Z" fill="#BAECE7" />

            {/* Stylized Tree 5 (Right small) */}
            <rect x="315" y="52" width="3" height="12" rx="1.5" fill="#C5EFEB" />
            <path d="M314 43 H319 V55 H314 Z M310 47 H323 V51 H310 Z" fill="#BAECE7" />

            {/* Front Hill */}
            <path
              d="M0 72 C100 60 260 74 360 66 L360 85 L0 85 Z"
              fill="#C0EDE8"
            />
          </svg>

          {/* Trust Badge at the very bottom */}
          <div className="bg-[#C0EDE8]/30 py-2.5 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#008F83] shrink-0" />
            <span>Your data is safe with us</span>
          </div>
        </div>
      </div>
    </div>
  );
}
