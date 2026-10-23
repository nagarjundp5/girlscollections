import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { nimbuspost } from '@/lib/nimbuspost';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const awb = searchParams.get('awb');

    if (!awb) {
      return NextResponse.json({ error: 'AWB number is required' }, { status: 400 });
    }

    const trackingData = await nimbuspost.trackShipment(awb);

    // Return the response with CDN cache header of 5 minutes (300s)
    return new NextResponse(
      JSON.stringify(trackingData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
        }
      }
    );

  } catch (error: any) {
    console.error('Track shipment api error:', error);
    return NextResponse.json({ error: error.message || 'Tracking fetch failed' }, { status: 500 });
  }
}
