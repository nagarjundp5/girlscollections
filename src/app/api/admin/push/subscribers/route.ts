export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { firestoreService } from '@/lib/firestore';
import { desc } from 'drizzle-orm';

export async function GET() {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const [neonSubs, rawFirestore] = await Promise.all([
      db.select().from(pushSubscriptions).orderBy(desc(pushSubscriptions.created_at)).catch(() => []),
      firestoreService.queryDocs('pushSubscribers', {}).catch(() => []),
    ]);

    const byEndpoint = new Map<string, any>();

    for (const fs of rawFirestore) {
      const ep = fs.endpoint || fs.token;
      if (!ep || fs.active === false) continue;
      byEndpoint.set(ep, {
        id: fs.id || ep,
        token: `${ep.slice(0, 16)}...${ep.slice(-8)}`,
        device: fs.device || 'Web Browser',
        userId: fs.userId || 'Guest Visitor',
        createdAt: fs.createdAt || fs.updatedAt || new Date().toISOString(),
        active: true,
        topicOrders: fs.topicOrders !== false,
        topicOffers: fs.topicOffers !== false,
      });
    }

    for (const ns of neonSubs) {
      byEndpoint.set(ns.endpoint, {
        id: ns.id,
        token: `${ns.endpoint.slice(0, 16)}...${ns.endpoint.slice(-8)}`,
        device: ns.user_agent?.includes('Mobile') ? 'Mobile Browser' : 'Web Browser',
        userId: ns.user_id || 'Guest Visitor',
        createdAt: ns.created_at?.toISOString() || new Date().toISOString(),
        active: true,
        topicOrders: ns.topic_orders,
        topicOffers: ns.topic_offers,
      });
    }

    const subscribers = Array.from(byEndpoint.values());
    const total = subscribers.length;
    const offersOn = subscribers.filter((s) => s.topicOffers).length;
    const ordersOn = subscribers.filter((s) => s.topicOrders).length;

    return NextResponse.json({
      count: total,
      total,
      offersOn,
      ordersOn,
      subscribers,
    });
  } catch (error: any) {
    console.error('[admin/push/subscribers] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch push subscribers' }, { status: 500 });
  }
}
