/**
 * Upstash Redis-backed rate limiter using the fixed window algorithm.
 * Fixed window is the cheapest algorithm in Redis: 1 atomic command/check,
 * minimizing commands/month against the Upstash Free Tier (500K limit).
 */
import { Ratelimit } from '@upstash/ratelimit';
import { redis, isRedisConfigured } from './redis';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Seconds until limit resets
}

// Cache limiter instances per (limit, windowSeconds) combo
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowSeconds: number): Ratelimit {
  const cacheKey = `${limit}:${windowSeconds}`;
  if (limiterCache.has(cacheKey)) {
    return limiterCache.get(cacheKey)!;
  }
  const limiter = new Ratelimit({
    redis,
    // Cheapest algorithm: fixedWindow (1 Redis INCR + EXPIRE command)
    limiter: Ratelimit.fixedWindow(limit, `${windowSeconds} s`),
    analytics: false,
    prefix: 'ratelimit',
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

/**
 * Validates request counts against a Redis fixed window rate limit.
 *
 * @param key      Unique identifier (e.g. `pub_products:1.2.3.4`)
 * @param limit    Maximum allowed requests within the window
 * @param windowMs Window duration in milliseconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.round(windowMs / 1000));
  if (!isRedisConfigured()) {
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - 1),
      reset: windowSeconds,
    };
  }

  try {
    const limiter = getLimiter(limit, windowSeconds);
    const result = await limiter.limit(key);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (err) {
    // Fail open safely if Redis is unreachable or rate limited
    console.warn('[rateLimit] Upstash Redis warning — failing open:', err);
    return {
      success: true,
      limit,
      remaining: 1,
      reset: windowSeconds,
    };
  }
}

/**
 * Public catalogue / category / thumbnail / recommended routes: 60/min
 */
export async function rateLimitPublicCatalogue(ip: string): Promise<RateLimitResult> {
  return rateLimit(`cat_${ip}`, 60, 60000);
}

/**
 * Search and filter routes: 30/min
 */
export async function rateLimitSearch(ip: string): Promise<RateLimitResult> {
  return rateLimit(`search_${ip}`, 30, 60000);
}

/**
 * Auth & OTP rate limits:
 * - Primary: 5 attempts per 10 min per phone number (stops brute-forcing a specific target)
 * - Secondary: 30 attempts per 10 min per IP (shared mobile carrier CGNAT friendly)
 */
export async function rateLimitAuthOtpByPhone(phone: string): Promise<RateLimitResult> {
  const cleanPhone = phone.replace(/\D/g, '');
  return rateLimit(`otp_phone_${cleanPhone}`, 5, 600000); // 5 per 10 min
}

export async function rateLimitAuthOtpByIp(ip: string): Promise<RateLimitResult> {
  return rateLimit(`otp_ip_${ip}`, 30, 600000); // 30 per 10 min
}

export async function rateLimitAuthOtp(
  params: { phone?: string | null; ip: string } | string
): Promise<RateLimitResult> {
  if (typeof params === 'string') {
    const digitsOnly = params.replace(/\D/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      return rateLimitAuthOtpByPhone(params);
    }
    return rateLimitAuthOtpByIp(params);
  }

  // 1. Secondary: Check IP limit (30 / 10 min)
  if (params.ip && params.ip !== 'unknown' && params.ip !== '127.0.0.1') {
    const ipRes = await rateLimitAuthOtpByIp(params.ip);
    if (!ipRes.success) return ipRes;
  }

  // 2. Primary: Check Phone limit (5 / 10 min)
  if (params.phone) {
    const phoneRes = await rateLimitAuthOtpByPhone(params.phone);
    if (!phoneRes.success) return phoneRes;
  }

  return { success: true, limit: 5, remaining: 4, reset: 600 };
}

/**
 * Cart, wishlist, checkout reserve, order create, coupon apply: 20/min
 */
export async function rateLimitCheckoutFlow(identifier: string): Promise<RateLimitResult> {
  return rateLimit(`flow_${identifier}`, 20, 60000);
}

/**
 * Admin routes: 60/min
 */
export async function rateLimitAdmin(identifier: string): Promise<RateLimitResult> {
  return rateLimit(`admin_${identifier}`, 60, 60000);
}
