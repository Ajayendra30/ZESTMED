import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, 
  FileText, ArrowRight, CheckCircle2, AlertTriangle, Truck, Clock, Lock
} from 'lucide-react';
import RazorpayCheckoutModal from './RazorpayCheckoutModal';

export default function CartDrawer({ onOpenPrescriptionModal }) {
  const { 
    isDrawerOpen, closeCart, cartItems, 
    removeItem, updateQuantity, clearCart, 
    subtotal, totalMRP, totalSavings, totalItemsCount 
  } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);

  if (!isDrawerOpen) return null;

  const hasPrescriptionItems = cartItems.some(i => i.prescriptionRequired);
  const hasDiagnosticItems = cartItems.some(i => i.category === 'Diagnostic Test' || i.category === 'Health Package' || i.type === 'test' || i.turnaroundTime);
  const deliveryCharge = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const grandTotal = subtotal + deliveryCharge;

  const handleOpenRazorpayCheckout = () => {
    setIsRazorpayOpen(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setLastPayment(paymentData);
    setIsRazorpayOpen(false);
    setCheckoutComplete(true);
    clearCart();
    addToast(`Order Confirmed via Razorpay! Payment ID: ${paymentData.paymentId}`, 'success');
  };

  const resetCheckout = () => {
    setCheckoutComplete(false);
    setLastPayment(null);
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={closeCart} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-surface flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#01333A]/10 text-[#01333A] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[#01333A]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-dark">Your Healthcare Cart</h2>
                <p className="text-xs text-muted">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-muted hover:text-dark hover:bg-slate-200 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout Completed State */}
          {checkoutComplete ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-dark">Order Confirmed!</h3>
              <p className="text-xs text-muted mt-2 max-w-xs leading-relaxed">
                Thank you, {user?.name || 'Valued Patient'}! Your order has been registered with Zestmed Central Hub, Guwahati.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 mt-4 text-left w-full space-y-1.5">
                <div className="font-bold text-emerald-950 flex items-center justify-between">
                  <span>Razorpay Payment Confirmed</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono">Captured</span>
                </div>
                {lastPayment && (
                  <>
                    <div className="font-mono text-[11px]">• Razorpay ID: {lastPayment.paymentId}</div>
                    <div className="font-mono text-[11px]">• Order ID: {lastPayment.orderId}</div>
                    <div>• Amount Paid: ₹{lastPayment.amount.toFixed(2)}</div>
                  </>
                )}
                <div>• Single-Day Report Delivery: Guaranteed within 12-24 Hours</div>
                <div>• Location: Guwahati, Assam (Assam GST Invoice Issued)</div>
              </div>
              <button
                onClick={resetCheckout}
                className="mt-6 bg-[#008F83] hover:bg-[#007a70] text-white font-bold w-full py-3 text-sm rounded-xl transition shadow-sm active:scale-[0.98]"
              >
                Continue Browsing
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#01333A]/10 text-[#01333A] flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 stroke-[1.5] text-[#01333A]" />
              </div>
              <h3 className="text-lg font-bold text-dark">Your Cart is Empty</h3>
              <p className="text-xs text-muted mt-1.5 max-w-xs">
                Explore genuine medicines, diagnostic tests, and complete health checkup packages.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 bg-[#01333A] hover:bg-[#002227] text-white font-bold py-3 px-7 rounded-xl text-sm transition shadow-sm active:scale-[0.98]"
              >
                Browse Healthcare Catalog
              </button>
            </div>
          ) : (
            /* Cart with items */
            <>
              {/* Prescription Banner if needed */}
              {hasPrescriptionItems && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold">Prescription Needed:</span> One or more items require a valid doctor's prescription.
                    <button
                      type="button"
                      onClick={() => {
                        closeCart();
                        if (onOpenPrescriptionModal) onOpenPrescriptionModal();
                      }}
                      className="ml-2 font-bold text-[#01333A] hover:underline inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Upload Rx Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-border/60">
                {cartItems.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5">
                    {/* Thumbnail or Icon */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-border shrink-0 bg-slate-50"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#01333A]/10 text-[#01333A] border border-[#01333A]/20 flex flex-col items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-[#01333A]" />
                        <span className="text-[9px] font-bold uppercase mt-0.5">Lab Test</span>
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-dark truncate leading-snug">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted hover:text-rose-500 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.manufacturer && (
                        <p className="text-[11px] text-muted truncate">{item.manufacturer}</p>
                      )}
                      {item.sampleType && (
                        <p className="text-[11px] text-teal-dark font-medium truncate">
                          Sample: {item.sampleType} • {item.turnaroundTime}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-dark">₹{item.price.toFixed(2)}</span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-xs text-muted line-through">₹{item.mrp.toFixed(2)}</span>
                          )}
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center border border-border rounded-lg bg-surface">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 rounded-l-lg text-dark transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-dark">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 rounded-r-lg text-dark transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="border-t border-border p-6 bg-surface space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Total (MRP)</span>
                    <span>₹{totalMRP.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Platform Discount Savings</span>
                      <span>-₹{totalSavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-muted" />
                      Delivery & Handling
                    </span>
                    <span>
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      ) : (
                        `₹${deliveryCharge.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-[10px] text-[#01333A] font-medium">
                      Add ₹{(500 - subtotal).toFixed(2)} more for FREE delivery
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-2 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs text-muted">To Pay</div>
                    <div className="text-lg font-bold text-dark">₹{grandTotal.toFixed(2)}</div>
                  </div>
                  {totalSavings > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      You save ₹{totalSavings.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Single-Day Reports & Guwahati Service Guarantee */}
                <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-teal-900">
                  <Clock className="w-4 h-4 text-[#008F83] shrink-0" />
                  <span>⚡ <strong>Guwahati Fast:</strong> All lab reports delivered in a single day (12-24 Hrs)</span>
                </div>

                {/* Razorpay Checkout Button */}
                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={handleOpenRazorpayCheckout}
                  className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold py-3 text-sm rounded-xl flex items-center justify-center gap-2 mt-2 transition shadow-md active:scale-[0.98]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay via Razorpay • ₹{grandTotal.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secured by Razorpay • UPI, Card & NetBanking</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        amount={grandTotal}
        orderDetails={{
          itemsCount: totalItemsCount,
          subtotal,
          deliveryCharge
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
