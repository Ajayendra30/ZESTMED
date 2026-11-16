// src/pages/AuthPage.jsx
// Dedicated full-page Login & Register experience for ZESTMED Healthcare
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Smartphone, User, ShieldCheck, ArrowRight, ArrowLeft, 
  CheckCircle2, Clock, Car, MapPin, Sparkles, RefreshCw, ChevronDown 
} from 'lucide-react';

export default function AuthPage({ defaultMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithPhoneOtp, loginWithGoogle, logout } = useAuth();
  const { addToast } = useToast();

  const [authMode, setAuthMode] = useState(defaultMode); // 'login' or 'register'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: OTP
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('register');
    } else if (location.pathname === '/login') {
      setAuthMode('login');
    }
  }, [location.pathname]);

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
    addToast('Demo OTP sent to your mobile: 1234', 'info');
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input box
    if (value && index < 3) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`auth-otp-${index - 1}`);
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
    addToast('Authentication verified successfully!', 'success');
    navigate('/patient-dashboard');
  };

  const handleGoogleSignIn = () => {
    loginWithGoogle();
    addToast('Signed in with Google successfully!', 'success');
    navigate('/patient-dashboard');
  };

  const handleResendOtp = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setResendCountdown(30);
      addToast('New OTP sent: 1234', 'info');
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#EFFBF9] via-[#F4FBF9] to-white flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Promotional Banner (Guwahati healthcare benefits) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B2238] via-[#093539] to-[#008F83] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Ambient circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <Link to="/" className="inline-block">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl inline-flex items-center shadow-sm">
                <img
                  src="/logo.png"
                  alt="Zestmed Diagnostics"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>

            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-teal-300 bg-teal-900/60 px-2 py-0.5 rounded-md border border-teal-500/30">
                Guwahati Exclusive
              </span>
              <h2 className="text-2xl font-black mt-2 leading-tight">
                Your Health, Our Priority.
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Access single-day diagnostic reports, specialist doctors, home physiotherapy & genuine medicine delivery across Guwahati.
              </p>
            </div>

            {/* Benefit Bullets */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-500/30 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span><strong>Single-Day Reports:</strong> All lab test reports delivered within 12-24 hours guaranteed.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                  <Car className="w-3.5 h-3.5" />
                </div>
                <span><strong>Free Senior Citizen Transport:</strong> Dedicated AC cab within 10km radius in Guwahati.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-sky-500/30 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span><strong>Guwahati Central Lab:</strong> NABL accredited pathologists and verified doctors.</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 text-[11px] text-slate-400 border-t border-white/10 flex items-center justify-between">
            <span>Zestmed Health Portal</span>
            <span>Assam 781001</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top Back & Header */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                className="text-xs font-bold text-slate-500 hover:text-[#008F83] flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>

              {user && (
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Logged in as</span>
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                </div>
              )}
            </div>

            {/* Toggle Tabs: Login vs Register */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 max-w-[280px] mx-auto select-none shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setStep(1);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setStep(1);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  authMode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                New Account (Register)
              </button>
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {authMode === 'login' ? 'Welcome Back to ZESTMED' : 'Create Your Patient Account'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {step === 1
                  ? authMode === 'login'
                    ? 'Enter your mobile number to receive a 4-digit verification code.'
                    : 'Register your mobile number to view test reports, book doctors & track orders.'
                  : `Enter the 4-digit OTP sent to +91 ${phoneNumber}`}
              </p>
            </div>

            {/* Form Step 1: Mobile & Name */}
            {step === 1 ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4 max-w-sm mx-auto">
                {authMode === 'register' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name *</label>
                    <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-[#008F83] focus-within:ring-2 focus-within:ring-[#008F83]/15 transition bg-white px-3 py-2.5">
                      <User className="w-4 h-4 text-[#008F83] shrink-0 mr-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Mobile Number *</label>
                  <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-[#008F83] focus-within:ring-2 focus-within:ring-[#008F83]/15 transition bg-white px-3 py-2.5">
                    <div className="flex items-center gap-1 pr-3 border-r border-slate-200 shrink-0 text-slate-800 font-bold text-xs sm:text-sm">
                      <Smartphone className="w-4 h-4 text-[#008F83]" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none bg-transparent tracking-wide"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    We will send an instant SMS OTP for instant login.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={phoneNumber.length !== 10 || (authMode === 'register' && !fullName.trim())}
                  className="w-full py-3 bg-[#008F83] hover:bg-[#007A70] text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{authMode === 'login' ? 'Send OTP & Sign In' : 'Send OTP & Register'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="flex items-center justify-center my-4 gap-3">
                  <div className="flex-1 h-[1px] bg-slate-200" />
                  <span className="text-xs text-slate-400">or</span>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>
            ) : (
              /* Form Step 2: OTP Entry */
              <form onSubmit={handleVerifyOtp} className="space-y-5 max-w-sm mx-auto">
                <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-3.5 text-center text-xs text-teal-900">
                  <span>Enter demo verification code: <strong className="font-mono text-sm font-bold text-[#008F83]">1234</strong></span>
                </div>

                <div className="flex justify-center gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`auth-otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-black rounded-xl border border-slate-300 focus:border-[#008F83] focus:ring-2 focus:ring-[#008F83]/20 outline-none"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={otp.join('').length < 4}
                  className="w-full py-3 bg-[#008F83] hover:bg-[#007A70] text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  Verify & Enter Dashboard
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    ← Change Number
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#008F83] hover:underline font-bold"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <span>By proceeding, you agree to Zestmed's Terms of Service & Privacy Policy in Guwahati, Assam.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
