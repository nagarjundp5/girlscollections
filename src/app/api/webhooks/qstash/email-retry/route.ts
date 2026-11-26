export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyQStashSignature } from '@/lib/orchestration/qstash-client';
import { sendOrderSuccessEmail, sendDeliveryStatusEmail, sendDeliverySuccessEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    if (process.env.QSTASH_CURRENT_SIGNING_KEY) {
      const valid = await verifyQStashSignature(request, rawBody);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid QStash signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { type } = payload;

    if (type === 'order_confirmed') {
      await sendOrderSuccessEmail({ ...payload, skipRetryEnqueue: true });
    } else if (type === 'delivered') {
      await sendDeliverySuccessEmail({ ...payload, skipRetryEnqueue: true });
    } else if (type === 'shipped' || type === 'out_for_delivery' || type === 'cancelled') {
      await sendDeliveryStatusEmail({ ...payload, status: type, skipRetryEnqueue: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[QStash Email Retry] Error:', err);
    return NextResponse.json({ error: err?.message || 'Retry failed' }, { status: 500 });
  }
}
