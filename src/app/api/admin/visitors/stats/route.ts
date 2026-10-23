import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { redis } from '@/lib/redis';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, gte, count, countDistinct } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const now = new Date();
    const nowSec = Math.floor(now.getTime() / 1000);
    const threeMinsAgoSec = nowSec - 180;
    const monthStr = now.toISOString().slice(0, 7); // 'YYYY-MM'
    const threeMinsAgoDate = new Date(now.getTime() - 3 * 60 * 1000);

    let liveVisitors = 0;
    let monthlyVisitors = 0;
    let overallVisitors = 0;

    // 1. Fetch live active visitors from Redis sorted set
    try {
      if (redis) {
        await redis.zremrangebyscore('analytics:live_visitors', 0, threeMinsAgoSec);
        liveVisitors = await redis.zcard('analytics:live_visitors');
        monthlyVisitors = await redis.pfcount(`analytics:visitors:${monthStr}`);
        overallVisitors = await redis.pfcount('analytics:visitors:overall');
      }
    } catch (err) {
      // Fallback
    }

    // 2. Query PostgreSQL database as fallback
    try {
      if (liveVisitors === 0) {
        const [dbLive] = await db
          .select({ value: countDistinct(schema.uniqueVisitors.visitor_id) })
          .from(schema.uniqueVisitors)
          .where(gte(schema.uniqueVisitors.last_seen_at, threeMinsAgoDate));
        liveVisitors = dbLive?.value || 0;
      }

      const [dbMonthly] = await db
        .select({ value: count(schema.uniqueVisitors.visitor_id) })
        .from(schema.uniqueVisitors)
        .where(eq(schema.uniqueVisitors.created_month, monthStr));
      
      const dbMonthlyCount = dbMonthly?.value || 0;
      monthlyVisitors = Math.max(monthlyVisitors, dbMonthlyCount);

      const [dbOverall] = await db
        .select({ value: count(schema.uniqueVisitors.visitor_id) })
        .from(schema.uniqueVisitors);

      const dbOverallCount = dbOverall?.value || 0;
      overallVisitors = Math.max(overallVisitors, dbOverallCount);
    } catch (dbErr) {
      // Ignore DB errors
    }

    return NextResponse.json({
      success: true,
      liveVisitors,
      monthlyVisitors,
      overallVisitors,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
