import { Ratelimit } from '@upstash/ratelimit';
import { redis, isRedisConfigured } from './redis';

let limiterInstance: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (!isRedisConfigured()) return null;
  if (!limiterInstance) {
    try {
      limiterInstance = new Ratelimit({
        redis,
        // Cheapest algorithm: fixedWindow, analytics: false (0 extra write commands)
        limiter: Ratelimit.fixedWindow(20, '60 s'),
        analytics: false,
        prefix: 'ratelimit:buy',
      });
    } catch (err) {
      console.error('[buyAttemptLimiter] Failed to initialize Ratelimit:', err);
      return null;
    }
  }
  return limiterInstance;
}

export const buyAttemptLimiter = {
  async limit(identifier: string) {
    const limiter = getLimiter();
    if (!limiter) {
      return {
        success: true,
        limit: 20,
        remaining: 20,
        reset: Date.now(),
        pending: Promise.resolve(),
      };
    }
    try {
      return await limiter.limit(identifier);
    } catch (err) {
      console.warn('[buyAttemptLimiter] Redis error (failing open):', err);
      return {
        success: true,
        limit: 20,
        remaining: 20,
        reset: Date.now(),
        pending: Promise.resolve(),
      };
    }
  },
};
