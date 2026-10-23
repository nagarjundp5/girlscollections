import { NextResponse } from 'next/server';
import { db } from '@/db';

export const dynamic = 'force-dynamic';
import { notificationLogs, products } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const logs = await db
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

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Notification logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
