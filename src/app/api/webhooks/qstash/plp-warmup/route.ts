export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'PLP warmup scheduled job removed in favor of Vercel Data Cache',
    timestamp: new Date().toISOString(),
  });
}
