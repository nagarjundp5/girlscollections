export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyQStashSignature } from '@/lib/orchestration/qstash-client';
import { executeCustomPushSend } from '@/app/api/admin/push/send-custom/route';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('upstash-signature');

  if (signature) {
    const valid = await verifyQStashSignature(req, rawBody);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid QStash signature' }, { status: 401 });
    }
  }

  try {
    const data = JSON.parse(rawBody);
    const result = await executeCustomPushSend(data);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('[qstash/send-push] Error:', err);
    return NextResponse.json({ error: 'Failed scheduled push' }, { status: 500 });
  }
}
