export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyQStashSignature } from '@/lib/orchestration/qstash-client';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const isValid = await verifyQStashSignature(request, rawBody);
    if (!isValid) {
      console.warn('[QStash Ping] Unauthorized signature');
      return NextResponse.json({ error: 'Unauthorized QStash signature' }, { status: 401 });
    }

    const messageId = request.headers.get('upstash-message-id') || 'unknown';
    console.log(`[QStash Ping] Received valid ping! QStash Message ID: ${messageId}`);

    return NextResponse.json({
      success: true,
      message: 'pong',
      messageId,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('[QStash Ping] Exception:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

