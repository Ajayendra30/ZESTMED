// src/components/RazorpayCheckoutModal.jsx
import React, { useState } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  Lock, ArrowRight, Check, CreditCard, Banknote, Smartphone, Building
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { launchRazorpayCheckout } from '../services/razorpayClient';

export default function RazorpayCheckoutModal({ 
  isOpen, 
  onClose, 
  amount, 
  orderDetails = {}, 
  bookingId,
  bookingType = 'medicine_order',
  serviceTitle = 'ZESTMED Healthcare Service',
  onPaymentSuccess 
}) {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [paymentOption, setPaymentOption] = useState('online'); // 'online' (Razorpay) or 'offline' (COD/Pay on Visit)
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [verifiedSuccessData, setVerifiedSuccessData] = useState(null);

  if (!isOpen) return null;

  const resolvedBookingId = bookingId || orderDetails.orderNumber || orderDetails.bookingId || `ZM-ORD-${Date.now().toString().slice(-6)}`;
  const resolvedAmount = Number(amount || orderDetails.totalAmount || orderDetails.total || 499);

  // Trigger Real Razorpay Standard Checkout SDK
  const handleProceedToRazorpay = () => {
    setPaymentError(null);

    // If user chose Pay on Visit / COD
    if (paymentOption === 'offline') {
      const offlineRecord = {
        transactionId: `cod_${Date.now()}`,
        paymentId: 'PAY_ON_DELIVERY',
        orderId: resolvedBookingId,
        amount: resolvedAmount,
        method: 'Cash / Pay on Visit',
        status: 'Pending Collection',
        paymentStatus: 'Pending',
        bookingId: resolvedBookingId,
        bookingType,
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };
      addToast('Booking placed with Pay on Visit / Cash on Delivery', 'info');
      if (onPaymentSuccess) {
        onPaymentSuccess(offlineRecord);
      }
      onClose();
      return;
    }

    setIsProcessing(true);

    launchRazorpayCheckout({
      amount: resolvedAmount,
      bookingId: resolvedBookingId,
      bookingType,
      serviceTitle: serviceTitle || orderDetails.title || 'ZESTMED Healthcare Service',
      customer: {
        name: user?.name || orderDetails.patientName || 'Patient',
        phone: user?.contact || user?.phone || orderDetails.phone || '',
        email: user?.email || orderDetails.email || 'patient@zestmed.in'
      },
      onSuccess: (verifiedTransaction) => {
        setIsProcessing(false);
        setVerifiedSuccessData(verifiedTransaction);
        addToast(`Payment Verified! ID: ${verifiedTransaction.paymentId}`, 'success');
        if (onPaymentSuccess) {
          onPaymentSuccess(verifiedTransaction);
        }
      },
      onFailure: (error) => {
        setIsProcessing(false);
        const errMsg = error?.message || 'Payment was unsuccessful or declined by bank.';
        setPaymentError(errMsg);
        addToast(errMsg, 'error');
      },
      onDismiss: () => {
        setIsProcessing(false);
        addToast('Payment cancelled. You can retry whenever you are ready.', 'info');
      }
    });
  };

  const handleFinish = () => {
    setVerifiedSuccessData(null);
    setPaymentError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Brand Header */}
        <div className="bg-[#0C2340] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0284C7] flex items-center justify-center font-black text-white text-base shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Razorpay Payment Gateway</h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-400 text-slate-900 px-1.5 py-0.2 rounded font-mono">
                  Official SDK
                </span>
              </div>
              <p className="text-[11px] text-slate-300">ZESTMED Healthcare Merchant Hub</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close payment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Payable Amount:</span>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Ref: {resolvedBookingId}</div>
          </div>
          <div className="text-xl font-black text-slate-900">
            ₹{resolvedAmount.toFixed(2)}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {verifiedSuccessData ? (
            /* REAL PAYMENT SUCCESS CONFIRMATION RECEIPT */
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">Payment Verified & Settled</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cryptographically verified on ZestMed Node.js backend
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Razorpay Payment ID:</span>
                  <span className="font-mono font-bold text-[#0284C7]">{verifiedSuccessData.paymentId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Razorpay Order ID:</span>
                  <span className="font-mono text-slate-700">{verifiedSuccessData.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Amount Captured:</span>
                  <span className="font-bold text-slate-900">₹{Number(verifiedSuccessData.amount || resolvedAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Booking / Service:</span>
                  <span className="font-medium text-slate-800">{serviceTitle || resolvedBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Server Status:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Signature Verified (HMAC-SHA256)
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-800 rounded-xl p-2.5 text-[11px] font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transaction stored in database and linked to your booking.</span>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full bg-[#007A64] hover:bg-[#006853] text-white font-bold py-3 text-sm rounded-xl transition shadow-md cursor-pointer text-center"
              >
                Done & View Booking
              </button>
            </div>
          ) : (
            /* PAYMENT SELECTION & REAL CHECKOUT LAUNCH */
            <div className="space-y-4">
              
              {/* Error Alert if payment failed */}
              {paymentError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">Payment Failed / Cancelled</div>
                    <div className="text-[11px] text-rose-700 mt-0.5">{paymentError}</div>
                  </div>
                </div>
              )}

              {/* Payment Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Payment Option:
                </label>

                {/* Option 1: Razorpay Online (Recommended) */}
                <div 
                  onClick={() => setPaymentOption('online')}
                  className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    paymentOption === 'online'
                      ? 'border-[#007A64] bg-[#E6F7F2]/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#007A64] text-white flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Pay Online via Razorpay</span>
                        <span className="text-[10px] font-bold bg-[#007A64] text-white px-1.5 py-0.2 rounded">Instant</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentOption === 'online' ? 'border-[#007A64] bg-[#007A64]' : 'border-slate-300'
                  }`}>
                    {paymentOption === 'online' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Option 2: Pay at Clinic / On Sample Collection */}
                <div 
                  onClick={() => setPaymentOption('offline')}
                  className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    paymentOption === 'offline'
                      ? 'border-[#007A64] bg-[#E6F7F2]/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        Pay on Visit / Cash on Delivery
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Pay cash or scan UPI QR code upon arrival/sample pickup
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    paymentOption === 'offline' ? 'border-[#007A64] bg-[#007A64]' : 'border-slate-300'
                  }`}>
                    {paymentOption === 'offline' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>

              {/* Supported payment badges */}
              {paymentOption === 'online' && (
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Supported by Razorpay:</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">0% Convenience Fee</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700">Google Pay</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700">PhonePe</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700">Paytm</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700">BHIM UPI</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700">Visa / Mastercard / RuPay</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700">All Major Banks</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProceedToRazorpay}
                  className="w-full bg-[#007A64] hover:bg-[#006853] text-white font-bold py-3.5 text-xs sm:text-sm rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting to Razorpay Gateway...</span>
                    </>
                  ) : paymentOption === 'online' ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{resolvedAmount.toFixed(2)} via Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Booking (Pay on Visit)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1 select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-[#007A64]" />
                <span>100% Secure • 256-Bit SSL • Verified Server Signatures</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
