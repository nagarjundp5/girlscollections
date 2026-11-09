export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { redis } from '@/lib/redis';

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
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsedCached = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json({ success: true, ...parsedCached });
      }
    } catch {
      // Redis fallback
    }

    // Call postal API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let res: Response;
    try {
      res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timeoutId);
      return NextResponse.json({ error: 'Postal service timed out' }, { status: 504 });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to query postal database' }, { status: 502 });
    }

    const data = await res.json();
    const result = data?.[0];

    if (!result || result.Status !== 'Success' || !result.PostOffice) {
      return NextResponse.json({ error: 'Invalid or unserviceable PIN code' }, { status: 404 });
    }

    const postOffices: any[] = result.PostOffice || [];
    const firstPo = postOffices[0] || {};

    const city = firstPo.District || firstPo.Division || firstPo.Circle || '';
    const state = firstPo.State || '';
    const areas = postOffices.map((po: any) => po.Name).filter(Boolean);

    const payload = {
      pincode,
      city,
      district: firstPo.District || city,
      state,
      areas: Array.from(new Set(areas)),
    };

    // Cache in Redis for 7 days
    try {
      await redis.set(cacheKey, JSON.stringify(payload), { ex: 7 * 24 * 60 * 60 });
    } catch {}

    return NextResponse.json({ success: true, ...payload });
  } catch (error: any) {
    console.error('[Pincode Lookup Error]:', error);
    return NextResponse.json({ error: 'Pincode lookup failed' }, { status: 500 });
  }
}
