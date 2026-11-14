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

  // 1. Path-based check
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/lab')) return 'lab';

  // 2. Production host-based check (e.g. admin.zestmed.com, lab.zestmed.com)
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith('admin.') || hostname.startsWith('admin-')) return 'admin';
  if (hostname.startsWith('lab.') || hostname.startsWith('lab-') || hostname.startsWith('labexecutive-')) return 'lab';

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
