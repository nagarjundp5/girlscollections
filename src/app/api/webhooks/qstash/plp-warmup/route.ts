export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyQStashSignature } from '@/lib/orchestration/qstash-client';
import { executeDbPlpWarmup, getPlpCacheVersion } from '@/lib/plp-cache';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // 1. Verify QStash Signature
    const isValid = await verifyQStashSignature(request, rawBody);
    if (!isValid) {
      console.warn('[QStash PLP Warmup] Unauthorized: invalid or missing upstash-signature.');
      return NextResponse.json({ error: 'Unauthorized QStash signature' }, { status: 401 });
    }

    let targetVersion = '';
    try {
      const parsed = JSON.parse(rawBody);
      if (parsed.targetVersion) {
        targetVersion = String(parsed.targetVersion);
      }
    } catch {
      // Fall through
    }

    if (!targetVersion) {
      const currentVer = await getPlpCacheVersion();
      targetVersion = String(Number(currentVer) + 1);
    }

    // 2. Prebuild active categories directly from DB (Part C.2)
    const prebuiltCount = await executeDbPlpWarmup(targetVersion);

    return NextResponse.json({
      success: true,
      targetVersion,
      prebuiltCount,
    });
  } catch (error: any) {
    console.error('[QStash PLP Warmup Exception]:', error);
    return NextResponse.json(
      { error: error?.message || 'PLP warmup failed' },
      { status: 500 }
    );
  }
}
