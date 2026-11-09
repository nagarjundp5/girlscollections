export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';

const ReverseSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function POST(req: Request) {
  try {
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const rateCheck = await rateLimit(`loc:reverse:ip:${ip}`, 20, 60000);
      if (!rateCheck.success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    } catch {}

    const body = await req.json();
    const parsed = ReverseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const { lat, lng } = parsed.data;

    // Use Nominatim reverse geocoding with 3.5s timeout to prevent browser 504
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;

    let response: Response;
    try {
      response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'TheGirlsCollections-App/1.0 (contact@thegirlscollections.com)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timeoutId);
      return NextResponse.json({ success: false, error: 'Location service timed out' });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Reverse geocode provider unavailable' });
    }

    const data = await response.json();
    const address = data.address || {};

    const pincode = (address.postcode || '').replace(/\D/g, '').slice(0, 6);
    const city =
      address.city ||
      address.town ||
      address.district ||
      address.suburb ||
      address.state_district ||
      '';
    const state = address.state || '';
    const area = address.suburb || address.neighbourhood || address.residential || address.road || '';

    return NextResponse.json({
      success: true,
      location: {
        pincode,
        city,
        state,
        area,
        displayName: data.display_name || '',
      },
    });
  } catch (error: any) {
    console.error('[Reverse Geocode Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to reverse geocode coordinates' });
  }
}
