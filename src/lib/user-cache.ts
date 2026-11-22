import { redis, isRedisConfigured } from '@/lib/redis';

/**
 * Invalidates the cached user profile for /api/auth/me (300s TTL in Redis).
 * Must be invoked whenever user data, phone verification, address, or profile changes occur.
 */
export async function invalidateUserCache(userId: string | null | undefined): Promise<void> {
  if (!userId || !isRedisConfigured() || !redis) return;
  try {
    await redis.del(`user:me:${userId}`);
  } catch (err) {
    console.warn('[UserCache Invalidation Warning]:', err);
  }
}
