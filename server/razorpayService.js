// server/razorpayService.js
/**
 * ZESTMED RAZORPAY PAYMENT GATEWAY SERVICE (NODE.JS BACKEND)
 * 
 * Handles:
 * 1. Secure order creation with Razorpay REST API
 * 2. Cryptographic signature verification using HMAC-SHA256 & Razorpay Key Secret
 * 3. Server-side payment validation before database state changes
 */
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Get Razorpay client instance
 */
export const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

/**
 * 1. Create a Razorpay Order
 * @param {Object} params
 * @param {number} params.amount - Amount in INR (Rupees)
 * @param {string} [params.currency='INR']
 * @param {string} [params.receipt]
 * @param {Object} [params.notes]
 */
export const createPaymentOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay configuration missing: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in server environment.');
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid payment amount. Amount must be a positive number.');
  }

  // Convert amount to paise (1 INR = 100 paise)
  const amountInPaise = Math.round(numericAmount * 100);

  const client = getRazorpayClient();
  if (!client) {
    throw new Error('Failed to initialize Razorpay SDK client.');
  }

  const options = {
    amount: amountInPaise,
    currency: currency.toUpperCase(),
    receipt: receipt || `rcpt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    payment_capture: 1, // Auto capture payment upon authorization
    notes: {
      platform: 'ZESTMED Healthcare',
      ...notes
    }
  };

  const order = await client.orders.create(options);
  return {
    success: true,
    orderId: order.id,
    amount: order.amount, // in paise
    amountRupees: numericAmount,
    currency: order.currency,
    receipt: order.receipt,
    keyId: keyId
  };
};

/**
 * 2. Cryptographically verify Razorpay Payment Signature
 * Formula: HMAC-SHA256(order_id + "|" + payment_id, secret) === razorpay_signature
 * 
 * @param {Object} params
 * @param {string} params.orderId - Razorpay Order ID (order_...)
 * @param {string} params.paymentId - Razorpay Payment ID (pay_...)
 * @param {string} params.signature - Signature received from checkout modal
 * @returns {boolean} true if signature matches perfectly
 */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[RazorpayService] Verification failed: RAZORPAY_KEY_SECRET is missing.');
    return false;
  }

  if (!orderId || !paymentId || !signature) {
    console.error('[RazorpayService] Verification failed: Missing orderId, paymentId, or signature.');
    return false;
  }

  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    // Timing-safe buffer comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[RazorpayService] Signature computation error:', err);
    return false;
  }
};
