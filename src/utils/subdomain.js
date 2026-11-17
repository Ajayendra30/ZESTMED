// src/utils/subdomain.js

/**
 * ZESTMED Portal Router Utility
 * 
 * Supports clean direct URLs:
 * - Admin Panel: /admin (http://localhost:5173/admin)
 * - Lab Executive Portal: /lab (http://localhost:5173/lab)
 * - Main Consumer Storefront: / (http://localhost:5173/)
 * 
 * Also supports production custom subdomains (admin.zestmed.com / lab.zestmed.com).
 */

export function getActiveSubdomain() {
  if (typeof window === 'undefined') return null;

  const pathname = window.location.pathname.toLowerCase();

  // Exclude consumer storefront diagnostic & lab routes from being treated as internal portals
  if (
    pathname === '/diagnostics' ||
    pathname.startsWith('/diagnostics/') ||
    pathname === '/lab-tests' ||
    pathname.startsWith('/lab-tests/') ||
    pathname === '/labtests' ||
    pathname.startsWith('/labtests/') ||
    pathname === '/lab-test' ||
    pathname.startsWith('/lab-test/')
  ) {
    return null;
  }

  // 1. Path-based check for Admin Panel
  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/admin-dashboard' ||
    pathname.startsWith('/admin-dashboard/')
  ) {
    return 'admin';
  }

  // 2. Path-based check for Lab Executive Portal
  if (
    pathname === '/lab' ||
    pathname.startsWith('/lab/') ||
    pathname === '/lab-dashboard' ||
    pathname.startsWith('/lab-dashboard/')
  ) {
    return 'lab';
  }

  // 3. Production host-based check (strictly admin.zestmed.com / lab.zestmed.com)
  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'admin.zestmed.com' || hostname === 'admin.localhost') return 'admin';
  if (hostname === 'lab.zestmed.com' || hostname === 'lab.localhost') return 'lab';

  return null;
}

/**
 * Generate clean URL or path to navigate to a target panel.
 * 
 * @param {'main' | 'admin' | 'lab'} targetPanel 
 * @param {string} path - path to navigate to (default: '/')
 * @returns {string} URL or path
 */
export function getSubdomainUrl(targetPanel, path = '/') {
  if (targetPanel === 'admin') return '/admin';
  if (targetPanel === 'lab') return '/lab';
  return path || '/';
}
