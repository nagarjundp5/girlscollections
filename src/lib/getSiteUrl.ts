/**
 * getSiteUrl
 * Resolves the canonical, stable production URL for callbacks (e.g. QStash, webhooks, metadata).
 * NEVER uses VERCEL_URL or the request host, which produce preview URLs gated by Vercel Deployment Protection.
 *
 * Precedence:
 * 1. NEXT_PUBLIC_SITE_URL (stable production domain e.g. https://www.thegirlscollections.com)
 * 2. NEXT_PUBLIC_APP_URL / APP_BASE_URL (if provided)
 * 3. VERCEL_PROJECT_PRODUCTION_URL (Vercel system env for production domain, e.g. thegirlscollections.vercel.app)
 * 4. In development: http://localhost:3000
 *
 * If none exists in production, throws a descriptive error.
 */
export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_BASE_URL;

  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    // Normalize apex/legacy domains to canonical www.thegirlscollections.com
    return clean
      .replace('://thegirlscollections.com', '://www.thegirlscollections.com')
      .replace('://drftnclothing.in', '://www.thegirlscollections.com')
      .replace('://drftn.in', '://www.thegirlscollections.com');
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd && vercelProd.trim()) {
    let clean = vercelProd.trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    return clean;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000';
  }

  throw new Error(
    'CRITICAL_CONFIG_ERROR: Neither NEXT_PUBLIC_SITE_URL nor VERCEL_PROJECT_PRODUCTION_URL is configured. ' +
    'Cannot construct a stable callback URL for external webhooks/QStash.'
  );
}

/**
 * Returns standard headers for QStash publish requests.
 * If VERCEL_PROTECTION_BYPASS_SECRET is set, forwards the bypass header
 * so Vercel Deployment Protection does not 401 the callback.
 */
export function getQStashPublishHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extraHeaders || {}) };
  const bypassSecret = process.env.VERCEL_PROTECTION_BYPASS_SECRET;
  if (bypassSecret && bypassSecret.trim()) {
    headers['Upstash-Forward-x-vercel-protection-bypass'] = bypassSecret.trim();
  }
  return headers;
}

