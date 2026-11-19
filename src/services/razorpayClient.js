// src/services/razorpayClient.js
/**
 * ZESTMED RAZORPAY FRONTEND CLIENT SERVICE
 * 
 * Provides production-ready integration with Razorpay Checkout SDK:
 * - Dynamically loads checkout.js if not already present
 * - Requests secure server-side order generation via /api/payments/create-order
 * - Passes payment authorization response to backend for HMAC verification via /api/payments/verify
 * - Updates local & database states only upon confirmed server verification
 */
import { getAuthToken, getAuthenticatedUser } from '../utils/authGuard';
import { savePaymentTransaction } from './supabaseService';

/**
 * 1. Dynamically load Razorpay Checkout script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('[RazorpayClient] Failed to load Razorpay checkout.js script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * 2. Create Order on Node.js Backend
 */
export const createServerOrder = async ({ amount, bookingId, bookingType, customer, description }) => {
  const token = getAuthToken();
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({
      amount: Number(amount),
      currency: 'INR',
      bookingId,
      bookingType,
      customer,
      description
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || 'Failed to create payment order on server.');
  }

  return data;
};

/**
 * 3. Verify Payment Signature on Node.js Backend
 */
export const verifyServerPayment = async ({
  orderId,
  paymentId,
  signature,
  bookingId,
  bookingType,
  amount,
  customer
}) => {
  const token = getAuthToken();
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      bookingId,
      bookingType,
      amount: Number(amount),
      customer
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success || !data.verified) {
    throw new Error(data.message || 'Server-side payment verification failed: Invalid signature.');
  }

  return data;
};

/**
 * 4. Record Payment Failure on Server
 */
export const recordPaymentFailure = async ({
  orderId,
  paymentId,
  errorCode,
  errorDescription,
  bookingId,
  bookingType,
  amount
}) => {
  try {
    const token = getAuthToken();
    await fetch('/api/payments/record-failure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        errorCode,
        errorDescription,
        bookingId,
        bookingType,
        amount
      })
    });
  } catch (err) {
    console.warn('[RazorpayClient] Failed to log payment failure:', err);
  }
};

/**
 * 5. Full End-to-End Razorpay Checkout Launch
 * 
 * @param {Object} options
 * @param {number} options.amount - Payable amount in INR
 * @param {string} options.bookingId - ID of booking/order
 * @param {string} options.bookingType - Type of booking ('doctor', 'surgery', 'physio', 'lab_test', 'wellness', 'medicine')
 * @param {string} [options.serviceTitle] - Name of service/package
 * @param {Object} [options.customer] - { name, phone, email }
 * @param {Function} options.onSuccess - Callback on verified success (receives transaction)
 * @param {Function} [options.onFailure] - Callback on payment failure (receives error)
 * @param {Function} [options.onDismiss] - Callback when user closes Razorpay modal
 */
export const launchRazorpayCheckout = async ({
  amount,
  bookingId,
  bookingType = 'service',
  serviceTitle = 'ZESTMED Healthcare Service',
  customer = {},
  onSuccess,
  onFailure,
  onDismiss
}) => {
  const user = getAuthenticatedUser();
  const resolvedCustomer = {
    name: customer.name || user?.name || 'Patient',
    phone: (customer.phone || user?.phone || user?.contact || '').replace(/\D/g, '').slice(-10),
    email: customer.email || user?.email || 'patient@zestmed.in'
  };

  try {
    // Step A: Load SDK script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Could not load Razorpay Payment Gateway. Please check your internet connection.');
    }

    // Step B: Request secure order from backend
    const orderData = await createServerOrder({
      amount,
      bookingId,
      bookingType,
      customer: resolvedCustomer,
      description: serviceTitle
    });

    const publicRazorpayKey = 
      orderData.keyId || 
      import.meta.env.VITE_RAZORPAY_KEY_ID || 
      'rzp_test_zestmedHealthcareKey';

    // Step C: Initialize Razorpay Standard Checkout UI
    const rzpOptions = {
      key: publicRazorpayKey,
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: 'ZESTMED Healthcare',
      description: serviceTitle,
      image: '/logo.png',
      order_id: orderData.orderId,
      prefill: {
        name: resolvedCustomer.name,
        contact: resolvedCustomer.phone ? `+91${resolvedCustomer.phone}` : '',
        email: resolvedCustomer.email
      },
      notes: {
        bookingId: String(bookingId || ''),
        bookingType: String(bookingType || 'general')
      },
      theme: {
        color: '#007A64',
        backdrop_color: 'rgba(12, 35, 64, 0.65)'
      },
      handler: async function (response) {
        // Step D: Verify payment signature on backend
        try {
          const verification = await verifyServerPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingId,
            bookingType,
            amount,
            customer: resolvedCustomer
          });

          // Step E: Persist verified transaction in database
          const recorded = await savePaymentTransaction({
            ...verification.transaction,
            customerName: resolvedCustomer.name,
            customerPhone: resolvedCustomer.phone,
            serviceTitle
          });

          if (onSuccess) {
            onSuccess(recorded || verification.transaction);
          }
        } catch (verifyErr) {
          console.error('[Razorpay Checkout Handler] Verification failed:', verifyErr);
          if (onFailure) {
            onFailure(verifyErr);
          }
        }
      },
      modal: {
        ondismiss: function () {
          recordPaymentFailure({
            orderId: orderData.orderId,
            paymentId: 'cancelled_by_user',
            errorCode: 'MODAL_DISMISSED',
            errorDescription: 'User cancelled or closed the Razorpay payment window.',
            bookingId,
            bookingType,
            amount
          });
          if (onDismiss) {
            onDismiss();
          }
        }
      }
    };

    const razorpayInstance = new window.Razorpay(rzpOptions);

    razorpayInstance.on('payment.failed', function (response) {
      console.warn('[Razorpay Payment Failed]:', response.error);
      recordPaymentFailure({
        orderId: orderData.orderId,
        paymentId: response.error?.metadata?.payment_id || 'failed_payment',
        errorCode: response.error?.code || 'PAYMENT_FAILED',
        errorDescription: response.error?.description || response.error?.reason || 'Payment failed',
        bookingId,
        bookingType,
        amount
      });

      if (onFailure) {
        onFailure(new Error(response.error?.description || 'Payment failed on Razorpay Gateway.'));
      }
    });

    razorpayInstance.open();
  } catch (err) {
    console.error('[launchRazorpayCheckout Error]:', err);
    if (onFailure) {
      onFailure(err);
    } else {
      alert(`Payment Gateway Error: ${err.message}`);
    }
  }
};
