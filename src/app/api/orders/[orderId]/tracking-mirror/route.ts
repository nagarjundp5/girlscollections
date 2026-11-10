export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firestore';

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const doc = await firestoreService.getDoc('order_status', orderId);
    if (!doc) {
      return NextResponse.json({ status: 'confirmed' });
    }

    return NextResponse.json(doc);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error fetching tracking mirror' }, { status: 500 });
  }
}

