export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc, count } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(request: Request) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const [totalResult] = await db.select({ total: count() }).from(schema.auditLogs);

    const logs = await db
      .select()
      .from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total: Number(totalResult?.total || 0),
        totalPages: Math.ceil(Number(totalResult?.total || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Audit logs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
