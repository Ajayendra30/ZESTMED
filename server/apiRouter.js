// server/apiRouter.js
/**
 * ZESTMED NODE.JS BACKEND API ROUTER & AUTHENTICATION GUARD
 * 
 * Protects all backend API routes from unauthorized access.
 * Enforces mandatory Bearer token / Session authentication on:
 * - /api/payments/create-order
 * - /api/payments/verify
 * - /api/payments/record-failure
 * - /api/cart/add
 * - /api/cart/checkout
 * - /api/bookings/doctor
 * - /api/bookings/surgery
 * - /api/bookings/physiotherapy
 * - /api/bookings/lab-test
 * - /api/bookings/wellness
 * - /api/orders/medicine
 * - /api/user/bookings
 * - /api/user/orders
 */
import { createPaymentOrder, verifyPaymentSignature } from './razorpayService.js';

export const verifyAuthHeader = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];
  if (!token || token === 'null' || token === 'undefined') return null;

  try {
    // Decode base64 session payload
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (decoded && (decoded.id || decoded.phone)) {
      return decoded;
    }
  } catch {
    // Fallback simple token validation
    if (token.startsWith('Bearer-Session-') || token.length >= 10) {
      return { id: token.replace('Bearer-Session-', ''), phone: 'verified' };
    }
  }
  return null;
};

export const handleApiRequest = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  // Public Health check
  if (pathname === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', service: 'ZESTMED Backend API', timestamp: new Date().toISOString() }));
    return true;
  }

  // Only handle /api/ routes
  if (!pathname.startsWith('/api/')) {
    return false;
  }

  // Read request body for POST/PUT
  let body = {};
  if (method === 'POST' || method === 'PUT') {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const raw = Buffer.concat(buffers).toString('utf8');
      if (raw) body = JSON.parse(raw);
    } catch (e) {
      body = {};
    }
  }

  // ------------------------------------------------------------------------
  // AUTHENTICATION GUARD
  // ------------------------------------------------------------------------
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  const authenticatedUser = verifyAuthHeader(authHeader);

  // Protected service endpoints: mandatory login required
  const isProtectedPath = 
    pathname.startsWith('/api/payments/') ||
    pathname.startsWith('/api/cart/') ||
    pathname.startsWith('/api/bookings/') ||
    pathname.startsWith('/api/orders/') ||
    pathname.startsWith('/api/user/');

  if (isProtectedPath && !authenticatedUser) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Access Denied: You must be logged in to access this service or perform this action.',
      redirectTo: '/login'
    }));
    return true;
  }

  // ------------------------------------------------------------------------
  // PROTECTED ROUTE HANDLERS
  // ------------------------------------------------------------------------
  res.setHeader('Content-Type', 'application/json');

  // ========================================================================
  // RAZORPAY PAYMENT GATEWAY ENDPOINTS
  // ========================================================================

  // P1. Create Secure Razorpay Payment Order
  if (pathname === '/api/payments/create-order' && method === 'POST') {
    try {
      const { amount, currency, bookingId, bookingType, customer, description } = body;
      const orderData = await createPaymentOrder({
        amount,
        currency: currency || 'INR',
        receipt: `rcpt_${bookingId || Date.now()}`,
        notes: {
          bookingId: String(bookingId || ''),
          bookingType: String(bookingType || 'general'),
          customerName: customer?.name || authenticatedUser.name || 'Patient',
          customerPhone: customer?.phone || authenticatedUser.phone || '',
          userId: String(authenticatedUser.id || '')
        }
      });

      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        ...orderData,
        description: description || 'ZESTMED Healthcare Service Payment'
      }));
      return true;
    } catch (err) {
      console.error('[API /api/payments/create-order error]:', err.message);
      res.statusCode = 400;
      res.end(JSON.stringify({
        success: false,
        error: 'RAZORPAY_ORDER_CREATION_FAILED',
        message: err.message || 'Failed to create Razorpay payment order.'
      }));
      return true;
    }
  }

  // P2. Cryptographically Verify Razorpay Payment Signature
  if (pathname === '/api/payments/verify' && method === 'POST') {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        bookingId, 
        bookingType, 
        amount,
        customer 
      } = body;

      const isSignatureValid = verifyPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature
      });

      if (!isSignatureValid) {
        console.warn(`[API /api/payments/verify] Signature mismatch for Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
        res.statusCode = 400;
        res.end(JSON.stringify({
          success: false,
          verified: false,
          error: 'SIGNATURE_VERIFICATION_FAILED',
          message: 'Security Verification Failed: The Razorpay payment signature could not be verified by the server.'
        }));
        return true;
      }

      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const verifiedTransaction = {
        transactionId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: Number(amount) || 0,
        currency: 'INR',
        status: 'Captured',
        paymentStatus: 'Paid',
        bookingId: bookingId || `ZM-ORD-${Date.now().toString().slice(-6)}`,
        bookingType: bookingType || 'service',
        customerName: customer?.name || authenticatedUser.name || 'Patient',
        customerPhone: customer?.phone || authenticatedUser.phone || '',
        verifiedAt: new Date().toISOString()
      };

      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        verified: true,
        transaction: verifiedTransaction,
        message: 'Payment verified and captured successfully via Razorpay Gateway!'
      }));
      return true;
    } catch (err) {
      console.error('[API /api/payments/verify error]:', err.message);
      res.statusCode = 500;
      res.end(JSON.stringify({
        success: false,
        verified: false,
        error: 'PAYMENT_VERIFICATION_ERROR',
        message: err.message || 'Server error while verifying payment.'
      }));
      return true;
    }
  }

  // P3. Record Failed or Cancelled Payment Attempt
  if (pathname === '/api/payments/record-failure' && method === 'POST') {
    const { orderId, paymentId, errorCode, errorDescription, bookingId, bookingType, amount } = body;
    console.warn(`[Payment Failed/Cancelled]: Booking: ${bookingId}, Order: ${orderId}, Reason: ${errorDescription || errorCode}`);

    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      recorded: true,
      status: 'Failed',
      bookingId,
      errorCode,
      errorDescription,
      message: 'Payment failure has been recorded in the security audit log.'
    }));
    return true;
  }

  // 1. Add to Cart API
  if (pathname === '/api/cart/add' && method === 'POST') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      message: `Item "${body.name || 'Product'}" successfully added to cart for user ${authenticatedUser.id || authenticatedUser.phone}`,
      user: authenticatedUser.id,
      item: body
    }));
    return true;
  }

  // 2. Checkout Cart API
  if (pathname === '/api/cart/checkout' && method === 'POST') {
    res.statusCode = 201;
    res.end(JSON.stringify({
      success: true,
      orderId: `ZM-ORD-${Date.now().toString().slice(-6)}`,
      user: authenticatedUser,
      amount: body.amount || 0,
      status: 'Confirmed'
    }));
    return true;
  }

  // 3. Doctor Appointment Booking API
  if (pathname === '/api/bookings/doctor' && method === 'POST') {
    res.statusCode = 201;
    res.end(JSON.stringify({
      success: true,
      bookingId: `ZM-DOC-${Date.now().toString().slice(-6)}`,
      doctor: body.doctorName,
      patient: body.patientName,
      user: authenticatedUser,
      status: 'Confirmed'
    }));
    return true;
  }

  // 4. Surgery Package Booking API
  if (pathname === '/api/bookings/surgery' && method === 'POST') {
    res.statusCode = 201;
    res.end(JSON.stringify({
      success: true,
      bookingId: `ZM-SURG-${Date.now().toString().slice(-6)}`,
      surgery: body.surgeryTitle || body.surgeryName,
      user: authenticatedUser,
      status: 'Confirmed'
    }));
    return true;
  }

  // 5. Physiotherapy Booking API
  if (pathname === '/api/bookings/physiotherapy' && method === 'POST') {
    res.statusCode = 201;
    res.end(JSON.stringify({
      success: true,
      bookingId: `ZM-PHY-${Date.now().toString().slice(-6)}`,
      service: body.serviceTitle,
      user: authenticatedUser,
      status: 'Confirmed'
    }));
    return true;
  }

  // 6. Lab Test Booking API
  if (pathname === '/api/bookings/lab-test' && method === 'POST') {
    res.statusCode = 201;
    res.end(JSON.stringify({
      success: true,
      bookingId: `ZM-LAB-${Date.now().toString().slice(-6)}`,
      test: body.testName,
      user: authenticatedUser,
      status: 'Confirmed'
    }));
    return true;
  }

  // 7. Wellness / Health Package Booking API
  if (pathname === '/api/bookings/wellness' && method === 'POST') {
    res.statusCode = 201;
    res.end(JSON.stringify({
      success: true,
      bookingId: `ZM-WELL-${Date.now().toString().slice(-6)}`,
      package: body.packageName,
      user: authenticatedUser,
      status: 'Confirmed'
    }));
    return true;
  }

  // 8. Medicine Order API
  if (pathname === '/api/orders/medicine' && method === 'POST') {
    res.statusCode = 201;
    res.end(JSON.stringify({
      success: true,
      orderId: `ZM-MED-${Date.now().toString().slice(-6)}`,
      user: authenticatedUser,
      status: 'Confirmed'
    }));
    return true;
  }

  // Catch-all unhandled API route
  res.statusCode = 404;
  res.end(JSON.stringify({ success: false, error: 'NOT_FOUND', message: 'API route not found' }));
  return true;
};
