import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

function formatToE164(countryCode: string, phone: string): string {
  let cleanCc = (countryCode || '').replace(/\D/g, '');
  let cleanPhone = (phone || '').replace(/\D/g, '');

  if (!cleanCc) {
    if (cleanPhone.length === 10) cleanCc = '91';
    else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      return `+${cleanPhone}`;
    }
  }

  if (cleanPhone.startsWith(cleanCc)) {
    cleanPhone = cleanPhone.slice(cleanCc.length);
  }

  return `+${cleanCc}${cleanPhone}`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateCheck = await rateLimit(`auth:link-phone:ip:${ip}`, 10, 60000);
    if (!rateCheck.success) {
      return NextResponse.json({ error: 'Too many attempts. Please wait.' }, { status: 429 });
    }

    const { user_json_url } = await req.json();
    if (!user_json_url || typeof user_json_url !== 'string') {
      return NextResponse.json({ error: 'Missing user_json_url' }, { status: 400 });
    }

    // SSRF Guard
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(user_json_url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const allowedHosts = ['user.phone.email', 'auth.phone.email'];
    if (!allowedHosts.includes(parsedUrl.hostname.toLowerCase()) || parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Untrusted provider' }, { status: 400 });
    }

    const phoneEmailRes = await fetch(user_json_url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!phoneEmailRes.ok) {
      return NextResponse.json({ error: 'Failed to verify phone credential' }, { status: 400 });
    }

    const payload = await phoneEmailRes.json();
    const rawPhone = payload.user_phone_number || payload.phone_no;
    const rawCc = payload.user_country_code || payload.country_code || '+91';

    if (!rawPhone) {
      return NextResponse.json({ error: 'No phone number in verified response' }, { status: 400 });
    }

    const e164Phone = formatToE164(rawCc, rawPhone);

    const client = await clerkClient();

    // Check if phone belongs to someone else in Clerk
    const otherUsers = await client.users.getUserList({
      phoneNumber: [e164Phone],
    });

    const isConflict = otherUsers.data?.some(u => u.id !== userId);
    if (isConflict) {
      return NextResponse.json(
        { error: 'This number is already linked to another account. Sign in with that method.' },
        { status: 409 }
      );
    }

    // Attach phone to existing Clerk user
    try {
      await client.phoneNumbers.createPhoneNumber({
        userId,
        phoneNumber: e164Phone,
        primary: true,
        verified: true,
      });
    } catch (clerkErr: any) {
      // If already added on this user, proceed
      console.log('[Attach Phone Notice]:', clerkErr?.message);
    }

    // Update Neon DB
    await db
      .update(schema.users)
      .set({
        phone: e164Phone,
        phone_verified: true,
        phone_verified_at: new Date(),
        last_active_at: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return NextResponse.json({
      success: true,
      phone: e164Phone,
    });
  } catch (err: any) {
    console.error('[POST /api/auth/link-phone exception]:', err);
    return NextResponse.json({ error: 'Failed to link phone number' }, { status: 500 });
  }
}

