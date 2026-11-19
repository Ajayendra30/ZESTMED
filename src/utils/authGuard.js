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
 * 2. Redirects to /login with returnUrl query param
 * 3. Shows toast alert
 * @returns {boolean} true if authenticated, false if redirected to login
 */
export const enforceAuth = ({
  user = null,
  navigate = null,
  location = null,
  toastMessage = 'Please login or register to continue with this service',
  pendingAction = null,
  addToast = null
}) => {
  const activeUser = user || getAuthenticatedUser();
  if (activeUser) {
    return true;
  }

  // Save pending action to resume post-login
  if (pendingAction) {
    try {
      sessionStorage.setItem('zestmed_pending_action', JSON.stringify(pendingAction));
    } catch (err) {
      console.warn('[AuthGuard] Failed to save pending action:', err);
    }
  }

  if (addToast) {
    addToast(toastMessage, 'info');
  }

  // Calculate return URL
  let returnUrl = '/';
  if (location?.pathname) {
    returnUrl = `${location.pathname}${location.search || ''}`;
  } else if (typeof window !== 'undefined' && window.location?.pathname) {
    returnUrl = `${window.location.pathname}${window.location.search || ''}`;
  }

  // Avoid recursive return to login page
  if (returnUrl.startsWith('/login') || returnUrl.startsWith('/auth') || returnUrl.startsWith('/register')) {
    returnUrl = '/';
  }

  const loginTarget = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;

  if (navigate) {
    navigate(loginTarget, { state: { returnUrl, pendingAction } });
  } else if (typeof window !== 'undefined') {
    window.location.href = loginTarget;
  }

  return false;
};
