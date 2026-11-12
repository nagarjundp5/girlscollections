import { NextResponse } from 'next/server';
import { dbHttp } from '@/db';
import * as schema from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { redis } from '@/lib/redis';

export const revalidate = 300;

const CATEGORIES_CACHE_KEY = 'cache:categories:v1';
const CATEGORIES_CACHE_TTL = 600; // 10 minutes

export async function GET() {
  try {
    // 1. Try Redis cache first (zero Neon queries)
    try {
      const cached = await redis.get<string | any[]>(CATEGORIES_CACHE_KEY);
      if (cached) {
        const categories = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json(
          { categories },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
              'X-Cache': 'HIT',
              'X-Neon-Queries': '0',
            },
          }
        );
      }
    } catch {
      // Redis error fallback
    }

    // 2. Neon fallback (only on cold cache miss)
    const categories = await dbHttp
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.is_active, true))
      .orderBy(asc(schema.categories.display_order));

    // Save to Redis
    try {
      await redis.set(CATEGORIES_CACHE_KEY, JSON.stringify(categories), {
        ex: CATEGORIES_CACHE_TTL,
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json(
      { categories },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'MISS',
          'X-Neon-Queries': '1',
        },
      }
    );
  } catch (error) {
    console.error('Public categories GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
