export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { notificationLogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { logId } = await req.json();
    if (!logId || typeof logId !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await db
      .update(notificationLogs)
      .set({ clicked_count: sql`${notificationLogs.clicked_count} + 1` })
      .where(eq(notificationLogs.id, logId));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
