import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const isIntern = authRes.role === 'staff' && !authRes.permissions.includes('*');

    // Active user criteria: active within the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Query active users
    const activeUsers = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phone: schema.users.phone,
        lastActiveAt: schema.users.last_active_at,
      })
      .from(schema.users)
      .where(gte(schema.users.last_active_at, fiveMinutesAgo))
      .orderBy(schema.users.last_active_at);

    const totalActiveCount = activeUsers.length;

    // Mask PII for interns
    if (isIntern) {
      return NextResponse.json({
        success: true,
        count: totalActiveCount,
        users: [],
      });
    }

    return NextResponse.json({
      success: true,
      count: totalActiveCount,
      users: activeUsers,
    });
  } catch (error) {
    console.error('Admin Active Users API error:', error);
    return NextResponse.json({ success: true, count: 0, users: [] });
  }
}
