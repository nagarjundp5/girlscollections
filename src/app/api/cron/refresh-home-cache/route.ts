import { NextResponse } from 'next/server';
import { invalidateAndRebuildHomepageSnapshot } from '@/lib/homepage-snapshot';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Optional cron secret verification if CRON_SECRET is configured
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await invalidateAndRebuildHomepageSnapshot();
    return NextResponse.json({
      success: true,
      message: 'Homepage snapshot refreshed in Redis & Firestore successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron:RefreshHomeCache] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}

