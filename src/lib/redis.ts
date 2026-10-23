import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;
let initialized = false;

export function isRedisConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  if (!url.startsWith('https://') && !url.startsWith('http://')) return false;
  if (
    url.includes('placeholder') ||
    url.includes('dummy.upstash.io') ||
    url === 'srswf' ||
    token.includes('placeholder') ||
    token.includes('dummy')
  ) {
    return false;
  }
  return true;
}

export function getRedis(): Redis | null {
  if (initialized) return redisInstance;
  initialized = true;

  if (!isRedisConfigured()) {
    console.warn(
      '[Redis] Upstash Redis credentials missing, invalid, or unconfigured. Operating in safe fallback mode.'
    );
    redisInstance = null;
    return null;
  }

  try {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    return redisInstance;
  } catch (err) {
    console.error('[Redis] Failed to initialize Upstash Redis client:', err);
    redisInstance = null;
    return null;
  }
}

/**
 * Proxy export for redis client.
 * Prevents build-time / runtime crashes when Redis URL is invalid or backend is not connected yet.
 * Safely fails open with standard default fallback values.
 */
export const redis: Redis = new Proxy({} as Redis, {
  get(_target, prop: string | symbol) {
    const client = getRedis();
    if (!client) {
      return async (...args: any[]) => {
        console.warn(`[Redis] Method '${String(prop)}' called, but Upstash Redis is not connected.`);
        if (prop === 'eval') return [0, 0];
        if (prop === 'get') return null;
        if (prop === 'mget') return args.map(() => null);
        if (prop === 'keys') return [];
        if (prop === 'incr' || prop === 'incrby') return 1;
        if (prop === 'ttl') return 60;
        if (prop === 'del') return 0;
        if (prop === 'set') return 'OK';
        if (prop === 'expire') return 1;
        if (prop === 'zcard') return 0;
        if (prop === 'pfcount') return 0;
        if (prop === 'zadd' || prop === 'pfadd') return 1;
        if (prop === 'zremrangebyscore') return 0;
        return null;
      };
    }
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

