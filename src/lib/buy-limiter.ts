import { Ratelimit } from '@upstash/ratelimit';
import { redis, isRedisConfigured } from './redis';

let limiterInstance: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (!isRedisConfigured()) return null;
  if (!limiterInstance) {
    try {
      limiterInstance = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '10 s'),
        analytics: true,
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
        limit: 5,
        remaining: 5,
        reset: Date.now(),
        pending: Promise.resolve(),
      };
    }
    try {
      return await limiter.limit(identifier);
    } catch (err) {
      console.error('[buyAttemptLimiter] Redis error (failing open):', err);
      return {
        success: true,
        limit: 5,
        remaining: 5,
        reset: Date.now(),
        pending: Promise.resolve(),
      };
    }
  },
};

