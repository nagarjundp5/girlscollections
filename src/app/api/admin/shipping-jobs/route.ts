import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {

    const activeJobs = await db
      .select()
      .from(schema.shippingJobs)
      .orderBy(desc(schema.shippingJobs.created_at))
      .limit(50);

    const deadJobs = await db
      .select()
      .from(schema.deadShippingJobs)
      .orderBy(desc(schema.deadShippingJobs.failed_at))
      .limit(50);

    const auditLogs = await db
      .select()
      .from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.created_at))
      .limit(50);

    return NextResponse.json({
      active_jobs: activeJobs,
      dead_letter_jobs: deadJobs,
      audit_logs: auditLogs,
    });
  } catch (err: any) {
    console.error('[Admin Shipping Jobs API Error]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch shipping jobs' }, { status: 500 });
  }
}
