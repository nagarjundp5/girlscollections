export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rateLimit';
import { signToken } from '@/lib/jwt';

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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = await rateLimit(`auth:phone-email:ip:${ip}`, 10, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please retry in ${rateCheck.reset} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { user_json_url } = body;

    if (!user_json_url || typeof user_json_url !== 'string') {
      return NextResponse.json({ error: 'Missing user_json_url' }, { status: 400 });
    }

    // SSRF Guard: Strictly allowlist phone.email host
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(user_json_url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const allowedHosts = ['user.phone.email', 'auth.phone.email'];
    if (!allowedHosts.includes(parsedUrl.hostname.toLowerCase()) || parsedUrl.protocol !== 'https:') {
      console.warn('[SSRF Guard] Rejected untrusted phone verification host');
      return NextResponse.json({ error: 'Untrusted authorization provider URL' }, { status: 400 });
    }

    // Fetch verified user payload from phone.email
    const phoneEmailRes = await fetch(user_json_url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!phoneEmailRes.ok) {
      console.error(`[phone.email] Failed fetching user json: ${phoneEmailRes.status}`);
      return NextResponse.json({ error: 'Failed to verify phone credential' }, { status: 400 });
    }

    const payload = await phoneEmailRes.json();
    const rawPhone = payload.user_phone_number || payload.phone_no;
    const rawCc = payload.user_country_code || payload.country_code || '+91';
    const firstName = payload.user_first_name || '';
    const lastName = payload.user_last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Customer';

    if (!rawPhone) {
      return NextResponse.json({ error: 'No phone number returned in credential' }, { status: 400 });
    }

    const e164Phone = formatToE164(rawCc, rawPhone);

    // Look up or create Neon user directly
    const [existingNeonUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.phone, e164Phone))
      .limit(1);

    let userId: string;
    let isNewUser = false;
    let onboardingCompleted = false;
    const now = new Date();

    if (existingNeonUser) {
      userId = existingNeonUser.id;
      onboardingCompleted = existingNeonUser.onboarding_completed || false;
      await db
        .update(schema.users)
        .set({
          phone_verified: true,
          phone_verified_at: now,
          last_active_at: now,
        })
        .where(eq(schema.users.id, existingNeonUser.id));
    } else {
      isNewUser = true;
      onboardingCompleted = false;
      userId = `usr_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
      await db
        .insert(schema.users)
        .values({
          id: userId,
          phone: e164Phone,
          phone_verified: true,
          phone_verified_at: now,
          name: fullName,
          auth_provider: 'phone',
          onboarding_completed: false,
          notifications_opt_in: true,
          created_at: now,
          last_active_at: now,
        });
    }

    // Set 30-day session token cookie
    const token = await signToken({ userId });
    cookies().set('tgc_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      userId,
      name: fullName,
      isNewUser,
      onboarding_completed: onboardingCompleted,
    });
  } catch (error: any) {
    console.error('[POST /api/auth/phone-email exception]:', error);
    return NextResponse.json({ error: 'Authentication failed. Please retry.' }, { status: 500 });
  }
}
