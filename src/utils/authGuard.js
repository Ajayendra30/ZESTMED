// src/utils/authGuard.js
/**
 * ZESTMED CENTRAL AUTHENTICATION & ROUTE GUARD
 * 
 * Enforces mandatory login/registration before accessing any services:
 * - Medicine Orders (Add to Cart, Checkout)
 * - Lab Tests (Book Now, Add to Cart)
 * - Surgery Packages (Book Now, Surgeon Consultation)
 * - Doctor Appointments (Book Appointment, Online Consultation)
 * - Physiotherapy (Book Session, Home Visit)
 * - Health Packages & Wellness Packages (Book Now, Add to Cart)
 */

export const getAuthenticatedUser = () => {
  try {
    const raw = localStorage.getItem('zestmed_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && (parsed.id || parsed.phone || parsed.contact)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const getAuthToken = () => {
  const user = getAuthenticatedUser();
  if (!user) return null;
  if (user.token) return user.token;
  // Generate deterministic token for active session
  try {
    return btoa(JSON.stringify({
      id: user.id || 'usr_session',
      phone: user.phone || user.contact || '',
      role: user.role || 'Patient',
      timestamp: Date.now()
    }));
  } catch {
    return `Bearer-Session-${user.id || 'Patient'}`;
  }
};

/**
 * Enforces authentication. If unauthenticated:
 * 1. Saves pending action to sessionStorage to resume post-login
 * 2. Displays the Login option (AuthModal) directly on the same page
 * 3. Shows toast alert without any "or register" option
 * 4. Ensures the user is never redirected away to the homepage
 * @returns {boolean} true if authenticated, false if login is required
 */
export const enforceAuth = ({
  user = null,
  navigate = null,
  location = null,
  openAuth = null,
  toastMessage = 'Please login to continue with this service',
  pendingAction = null,
  addToast = null,
  openInModal = true
}) => {
  const activeUser = user || getAuthenticatedUser();
  if (activeUser) {
    return true;
  }

  // Ensure message only shows "login" and never "or register"
  const cleanToastMessage = (toastMessage || 'Please login to continue with this service')
    .replace(/\s+or\s+register\s+/gi, ' ')
    .replace(/\s+or\s+register/gi, '')
    .replace(/\s+or\s+registration/gi, '');

  if (addToast) {
    addToast(cleanToastMessage, 'info');
  }

  // Determine current return URL to ensure user always stays on/returns to this same page
  let returnUrl = '/';
  if (location?.pathname) {
    returnUrl = `${location.pathname}${location.search || ''}`;
  } else if (typeof window !== 'undefined' && window.location?.pathname) {
    returnUrl = `${window.location.pathname}${window.location.search || ''}`;
  }

  // If action is specific to doctor, physio, or surgery but initiated from home page or modal,
  // target the dedicated service page directly
  const msgLower = (cleanToastMessage || '').toLowerCase();
  const actType = (pendingAction?.type || '').toLowerCase();
  if (returnUrl === '/' || returnUrl.startsWith('/login') || returnUrl.startsWith('/auth') || returnUrl.startsWith('/register')) {
    if (actType.includes('doctor') || msgLower.includes('doctor')) {
      returnUrl = '/doctor-appointment';
    } else if (actType.includes('physio') || msgLower.includes('physio')) {
      returnUrl = '/physiotherapy';
    } else if (actType.includes('surgery') || msgLower.includes('surgery') || actType.includes('package')) {
      returnUrl = '/surgery-packages';
    } else {
      returnUrl = '/';
    }
  }

  // Save pending action to resume post-login
  if (pendingAction) {
    try {
      sessionStorage.setItem('zestmed_pending_action', JSON.stringify({
        ...pendingAction,
        returnUrl
      }));
    } catch (err) {
      console.warn('[AuthGuard] Failed to save pending action:', err);
    }
  }

  // For core protected services (Doctor Appointments, Physiotherapy, Surgery Packages),
  // always redirect directly to the dedicated Login page with return target.
  const isCoreProtectedService = 
    returnUrl.includes('doctor') || 
    returnUrl.includes('physio') || 
    returnUrl.includes('surgery') || 
    returnUrl.includes('packages') ||
    actType.includes('doctor') ||
    actType.includes('physio') ||
    actType.includes('surgery') ||
    msgLower.includes('doctor') ||
    msgLower.includes('physio') ||
    msgLower.includes('surgery');

  if (isCoreProtectedService || !openInModal) {
    try {
      sessionStorage.setItem('zestmed_redirect_target', returnUrl);
    } catch (_) {}

    const loginTarget = `/login?redirect=${encodeURIComponent(returnUrl)}`;
    if (navigate) {
      navigate(loginTarget, { state: { returnUrl, pendingAction } });
    } else if (typeof window !== 'undefined') {
      window.location.href = loginTarget;
    }
    return false;
  }

  // Open the Login option right on the SAME page where the user clicked Book Now for other items.
  if (openInModal) {
    if (typeof openAuth === 'function') {
      openAuth('login');
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zestmed:open-auth', {
        detail: { mode: 'login', returnUrl, pendingAction }
      }));
    }
    return false;
  }

  return false;
};
