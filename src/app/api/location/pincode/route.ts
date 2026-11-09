export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { redis, isRedisConfigured } from '@/lib/redis';

const PincodeSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit Indian PIN code'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get('pincode') || '';
    const parsed = PincodeSchema.safeParse({ pincode: pin });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid 6-digit PIN code' }, { status: 400 });
    }

    const { pincode } = parsed.data;

    // Check Redis cache (cache for 7 days)
    const cacheKey = `pin:lookup:${pincode}`;
    if (isRedisConfigured()) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsedCached = typeof cached === 'string' ? JSON.parse(cached) : cached;
          return NextResponse.json({ success: true, ...parsedCached });
        }
      } catch {
        // Redis fallback
      }
    }

    // Call postal API with 3.5s timeout to prevent browser 504
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let res: Response;
    try {
      res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timeoutId);
      // Return 200 with success: false so the UI falls back smoothly to manual entry without 504 console errors
      return NextResponse.json({ success: false, error: 'Postal lookup unavailable. Please enter manually.' });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Failed to query postal database' });
    }

    const data = await res.json();
    const result = data?.[0];

    if (!result || result.Status !== 'Success' || !result.PostOffice) {
      return NextResponse.json({ success: false, error: 'Invalid or unserviceable PIN code' });
    }

    const postOffices = result.PostOffice;
    const firstPo = postOffices[0];
    const city = firstPo.District || firstPo.Division || firstPo.Circle || '';
    const state = firstPo.State || '';
    const areas = Array.from(new Set(postOffices.map((po: any) => po.Name).filter(Boolean))) as string[];

    const payload = {
      pincode,
      city,
      state,
      areas,
    };

    if (isRedisConfigured()) {
      try {
        await redis.set(cacheKey, JSON.stringify(payload), { ex: 7 * 24 * 60 * 60 });
      } catch {}
    }

    return NextResponse.json({ success: true, ...payload });
  } catch (error: any) {
    console.error('[Pincode Lookup Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to lookup PIN code' });
  }
}
