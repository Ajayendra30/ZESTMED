import React, { useState } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, CreditCard, Smartphone, Building, 
  Banknote, Lock, ArrowRight, Check, AlertCircle, Copy, RefreshCw 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function RazorpayCheckoutModal({ isOpen, onClose, amount, orderDetails, onPaymentSuccess }) {
  const { addToast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('patient@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('843');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  if (!isOpen) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const paymentId = `pay_ZM_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const txnRecord = {
        paymentId,
        orderId: `order_GUW_${Math.floor(10000 + Math.random() * 90000)}`,
        amount: amount || 499,
        method: selectedMethod.toUpperCase(),
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        status: 'Captured',
        razorpaySignature: 'rzp_sig_verified_prod_sandbox_ok'
      };
      setPaymentSuccessData(txnRecord);
      addToast('Payment captured successfully via Razorpay Gateway!', 'success');
      if (onPaymentSuccess) {
        onPaymentSuccess(txnRecord);
      }
    }, 1200);
  };

  const handleFinish = () => {
    setPaymentSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Brand Top Bar */}
        <div className="bg-[#0C2340] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0284C7] flex items-center justify-center font-black text-white text-base shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Razorpay Checkout</h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-mono">
                  Sandbox Test
                </span>
              </div>
              <p className="text-[11px] text-slate-300">ZESTMED Diagnostics & Polyclinic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span>Payable Amount:</span>
          </div>
          <div className="text-xl font-black text-slate-900">
            ₹{amount ? Number(amount).toFixed(2) : '499.00'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentSuccessData ? (
            /* Payment Success Receipt */
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Razorpay Transaction Verified & Settled
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Razorpay Payment ID:</span>
                  <span className="font-mono font-bold text-[#0284C7]">{paymentSuccessData.paymentId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Order Reference:</span>
                  <span className="font-mono text-slate-700">{paymentSuccessData.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-slate-900">₹{paymentSuccessData.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-blue-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Captured (Assam GST Invoice Generated)
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 rounded-xl p-2.5 text-[11px] font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Diagnostic booking confirmed. Single-day reports guaranteed!</span>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full bg-[#005CB9] hover:bg-[#004C99] text-white font-bold py-3 text-sm rounded-xl transition shadow-sm"
              >
                Close & Return
              </button>
            </div>
          ) : (
            /* Select Payment Method Form */
            <div className="space-y-4">
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-center">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`py-2 rounded-xl transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'upi' ? 'bg-white text-[#0284C7] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`py-2 rounded-xl transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'card' ? 'bg-white text-[#0284C7] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`py-2 rounded-xl transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'netbanking' ? 'bg-white text-[#0284C7] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>NetBanking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('cod')}
                  className={`py-2 rounded-xl transition flex flex-col items-center gap-1 ${
                    selectedMethod === 'cod' ? 'bg-white text-[#0284C7] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Pay on Visit</span>
                </button>
              </div>

              {/* UPI Tab */}
              {selectedMethod === 'upi' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi / yourname@okhdfcbank"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] outline-none font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Supported:</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">Google Pay</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">PhonePe</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">Paytm</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">BHIM</span>
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {selectedMethod === 'card' && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Valid Thru</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {selectedMethod === 'netbanking' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#0284C7] outline-none font-medium bg-white"
                    >
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Assam Gramin Vikash Bank">Assam Gramin Vikash Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* COD / Pay on Collection Tab */}
              {selectedMethod === 'cod' && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 space-y-1">
                  <div className="font-bold">Pay on Home Collection / Clinic Visit</div>
                  <p className="text-teal-700 text-[11px]">
                    You can pay using Cash, UPI QR, or Card directly to the Zestmed phlebotomist when they arrive for your test in Guwahati.
                  </p>
                </div>
              )}

              {/* Pay Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePayNow}
                  className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold py-3 text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Processing with Razorpay...' : `Pay ₹${amount ? Number(amount).toFixed(2) : '499.00'} Securely`}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>PCI-DSS Compliant • 256-Bit SSL Encryption</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
