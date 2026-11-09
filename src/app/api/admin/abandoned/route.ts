import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { firestoreService } from '@/lib/firestore';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const ip = req.headers.get('x-forwarded-for') || 'admin';
  const rateCheck = await rateLimit(`admin:abandoned:get:${ip}`, 30, 60000);
  if (!rateCheck.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'bags'; // 'bags' | 'checkouts'

    if (tab === 'bags') {
      const docs = await firestoreService.queryDocs('carts_abandoned');
      // Sort by lastActivity desc
      docs.sort((a: any, b: any) => new Date(b.lastActivity || b.updatedAt || 0).getTime() - new Date(a.lastActivity || a.updatedAt || 0).getTime());
      return NextResponse.json({ items: docs });
    } else {
      const docs = await firestoreService.queryDocs('checkout_sessions');
      docs.sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
      return NextResponse.json({ items: docs });
    }
  } catch (err: any) {
    console.error('[GET /api/admin/abandoned error]:', err);
    return NextResponse.json({ error: 'Failed to retrieve abandoned records' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const { action, id, tab } = body;

    const collection = tab === 'checkouts' ? 'checkout_sessions' : 'carts_abandoned';

    if (action === 'mark_contacted') {
      await firestoreService.setDoc(collection, id, {
        contacted: true,
        contactedAt: new Date().toISOString(),
      }, { merge: true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed action' }, { status: 500 });
  }
}
