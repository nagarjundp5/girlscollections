export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { firestoreService } from '@/lib/firestore';

export async function GET() {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const rawSubscribers = await firestoreService.queryDocs('pushSubscribers', {});
    
    const subscribers = rawSubscribers.map((s: any) => ({
      id: s.id,
      token: s.token ? `${s.token.slice(0, 16)}...${s.token.slice(-8)}` : 'Unknown Token',
      device: s.device || 'Web Browser',
      userId: s.userId || 'Guest Visitor',
      createdAt: s.createdAt || s.updatedAt || new Date().toISOString(),
      active: s.active !== false,
      productId: s.productId || null,
    }));

    const activeCount = subscribers.filter((s) => s.active).length;

    return NextResponse.json({
      count: activeCount,
      totalCount: subscribers.length,
      subscribers,
    });
  } catch (error: any) {
    console.error('[admin/push/subscribers] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch push subscribers' }, { status: 500 });
  }
}
