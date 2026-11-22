import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const vid = typeof body.vid === 'string' ? body.vid.trim() : null;

    if (!vid || vid.length < 8 || vid.length > 128) {
      return NextResponse.json({ error: 'Invalid visitor ID' }, { status: 400 });
    }

    const now = new Date();
    const nowSec = Math.floor(now.getTime() / 1000);
    const monthStr = now.toISOString().slice(0, 7); // 'YYYY-MM'

    // Batched single pipeline request in Upstash Redis (1 HTTP round-trip)
    try {
      if (redis) {
        const pipe = redis.pipeline();
        pipe.zadd('analytics:live_visitors', { score: nowSec, member: vid });
        pipe.pfadd(`analytics:visitors:${monthStr}`, vid);
        pipe.pfadd('analytics:visitors:overall', vid);
        await pipe.exec();
      }
    } catch (redisErr) {
      console.warn('[heartbeat] Redis pipeline warning:', redisErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
