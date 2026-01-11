import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
import { getSiteConfig } from './config';

/**
 * Hashes a PIN using SHA-256
 */
export function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

/**
 * Verifies a PIN against the stored hash
 */
export function verifyPin(pin: string): boolean {
  const config = getSiteConfig();
  
  // If no PIN hash is configured, deny access
  if (!config.admin?.pinHash) {
    return false;
  }
  
  const inputHash = hashPin(pin);
  return inputHash === config.admin.pinHash;
}

/**
 * Verifies an API key against the stored key
 */
export function verifyApiKey(apiKey: string | null | undefined): boolean {
  const config = getSiteConfig();
  
  // If no API key is configured, allow access (backward compatibility)
  if (!config.admin?.apiKey) {
    return true;
  }
  
  // If API key is configured, it must match
  return apiKey === config.admin.apiKey;
}

/**
 * Checks if the request is authenticated (either via cookie or API key)
 */
export function isAuthenticated(request: NextRequest): boolean {
  const config = getSiteConfig();
  
  // Check for admin auth cookie (for browser requests)
  const authCookie = request.cookies.get('admin-auth');
  if (authCookie && authCookie.value === 'true') {
    return true;
  }
  
  // Check for API key in header (for external requests)
  const apiKey = request.headers.get('x-api-key');
  if (apiKey && verifyApiKey(apiKey)) {
    return true;
  }
  
  // If no authentication is configured, allow access (backward compatibility)
  if (!config.admin?.pinHash && !config.admin?.apiKey) {
    return true;
  }
  
  return false;
}

/**
 * Checks if the request is coming from the same origin (internal request)
 */
export function isInternalRequest(request: Request): boolean {
  const referer = request.headers.get('referer');
  const origin = request.headers.get('origin');
  
  if (!referer && !origin) {
    // No referer or origin means it might be an external request
    return false;
  }
  
  // Check if referer or origin matches our domain
  const config = getSiteConfig();
  const domain = config.domain;
  
  if (referer && (referer.includes(domain) || referer.includes('localhost'))) {
    return true;
  }
  
  if (origin && (origin.includes(domain) || origin.includes('localhost'))) {
    return true;
  }
  
  return false;
}
