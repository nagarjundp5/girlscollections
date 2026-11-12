import { NextRequest, NextResponse } from 'next/server';
import { redis, isRedisConfigured } from '@/lib/redis';

export const runtime = 'nodejs';

/**
 * POST /api/search/log-zero
 *
 * Logs zero-result queries to a capped Redis list (200 entries max).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body.query || '').trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({ ok: true });
    }

    if (isRedisConfigured()) {
      const entry = JSON.stringify({
        q: query,
        at: new Date().toISOString(),
      });
      await redis.lpush('search:zero_results', entry);
      await redis.ltrim('search:zero_results', 0, 199);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

