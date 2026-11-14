// src/components/OrderInvoiceModal.jsx
import React from 'react';
import { X, Receipt, Download, Printer, CheckCircle2, Truck, Package, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function OrderInvoiceModal({ isOpen, onClose, order }) {
  const { addToast } = useToast();

  if (!isOpen || !order) return null;

  const handleDownload = () => {
    addToast(`Downloading Tax Invoice for ${order.id}... (Demo PDF)`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-modal border border-slate-200 overflow-hidden z-10 my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary-100">
                Official Medicine Tax Invoice
              </div>
              <h3 className="text-base font-bold text-white">
                Invoice #{order.id}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-primary text-xs font-bold transition shadow-sm"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6 text-dark text-xs">
          {/* Company & Billing Headers */}
          <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="ZESTMED Logo" className="w-6 h-6 object-contain" />
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  ZEST<span className="text-primary">MED</span>
                </span>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  RETAIL PHARMACY
                </span>
              </div>
              <p className="font-bold text-slate-800 mt-1">Zestmed Health Private Limited</p>
              <p className="text-slate-500">GS Road, Dispur, Guwahati, Assam - 781005</p>
              <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                GSTIN: 18AAACZ9901M1ZT • Drug Lic: AS-KAM-DL-88421
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {order.status}
              </div>
              <div className="text-slate-500">Order Date: <span className="font-semibold text-slate-800">{order.date}</span></div>
              <div className="text-slate-500">Time: <span className="font-semibold text-slate-800">{order.time}</span></div>
              <div className="text-slate-500">Payment: <span className="font-semibold text-slate-800">{order.paymentMethod}</span></div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Delivery Destination (Assam Network)
            </div>
            <p className="font-semibold text-slate-900 leading-relaxed">{order.deliveryAddress}</p>
            <p className="text-slate-500 text-[11px]">Fulfilled by: {order.hub}</p>
          </div>

          {/* Itemized Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Itemized Healthcare Products
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">MRP</th>
                    <th className="py-2.5 px-3 text-right">Zestmed Rate</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10.5px] text-slate-500">{item.manufacturer} • {item.dosage}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400 line-through font-mono">₹{item.mrp}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">₹{item.price}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Total MRP Value</span>
              <span className="font-mono line-through">₹{order.mrpTotal}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Zestmed Direct Health Discount</span>
              <span className="font-mono">-₹{order.savings}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Assam Express Phlebotomy / Delivery</span>
              <span className="text-teal-700 font-bold uppercase text-[11px]">FREE</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Pharmacist Dispensing & Handling Fee</span>
              <span className="text-teal-700 font-bold uppercase text-[11px]">Waived</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Net Amount Paid</span>
              <span className="text-base font-black text-primary font-mono">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Compliance Footer */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Certified genuine batch medications under Assam State Drug Control license.</span>
            </div>
            <div className="font-mono">Demo Invoice generated for testing</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-5 font-semibold"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
