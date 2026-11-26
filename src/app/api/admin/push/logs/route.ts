import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { firestoreService } from '@/lib/firestore';
import { db } from '@/db';
import { notificationLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    // 1. Fetch from Firestore history first
    const firestoreLogs = await firestoreService.queryDocs('notification_history', {});

    if (firestoreLogs && firestoreLogs.length > 0) {
      const sorted = firestoreLogs.sort(
        (a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      );
      return NextResponse.json({ logs: sorted });
    }

    // 2. Fallback to Neon DB notificationLogs
    const dbLogs = await db
      .select({
        id: notificationLogs.id,
        title: notificationLogs.title,
        body: notificationLogs.body,
        url: notificationLogs.url,
        audience_type: notificationLogs.audience_type,
        product_id: notificationLogs.product_id,
        sent_count: notificationLogs.sent_count,
        failed_count: notificationLogs.failed_count,
        sent_at: notificationLogs.sent_at,
      })
      .from(notificationLogs)
      .orderBy(desc(notificationLogs.sent_at))
      .limit(50);

    return NextResponse.json({ logs: dbLogs });
  } catch (error) {
    console.error('[Notification logs] Error:', error);
    return NextResponse.json({ logs: [] });
  }
}
