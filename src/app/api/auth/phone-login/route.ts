export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

const PhoneLoginSchema = z.object({
  user_json_url: z.string().optional().nullable(),
  access_token: z.string().optional().nullable(),
  returnTo: z.string().optional().nullable(),
}).refine(data => !!data.user_json_url || !!data.access_token, {
  message: 'Either user_json_url or access_token is required',
});

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
    const rateCheck = await rateLimit(`auth:phone-login:ip:${ip}`, 10, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please retry in ${rateCheck.reset} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = PhoneLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid authentication request' }, { status: 400 });
    }

    const { user_json_url, access_token, returnTo } = parsed.data;

    // Validate and construct safe user JSON URL
    let targetUrlString = user_json_url;
    if (!targetUrlString && access_token) {
      targetUrlString = `https://user.phone.email/user_${encodeURIComponent(access_token)}.json`;
    }

    if (!targetUrlString) {
      return NextResponse.json({ error: 'Missing credential URL' }, { status: 400 });
    }

    // SSRF Guard: Strictly accept ONLY user.phone.email over HTTPS
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrlString);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname.toLowerCase() !== 'user.phone.email') {
      console.warn('[SSRF Guard] Rejected untrusted phone verification host');
      return NextResponse.json({ error: 'Untrusted authorization provider URL' }, { status: 400 });
    }

    // Fetch verified JSON server-side with 8-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let phoneEmailRes: Response;
    try {
      phoneEmailRes = await fetch(parsedUrl.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.error('[Phone Login] Error connecting to verification provider');
      return NextResponse.json({ error: 'Verification provider timed out. Please retry.' }, { status: 504 });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!phoneEmailRes.ok) {
      console.error('[Phone Login] Verification provider response status:', phoneEmailRes.status);
      return NextResponse.json({ error: 'Failed to verify phone credential' }, { status: 400 });
    }

    const payload = await phoneEmailRes.json();
    const rawPhone = payload.user_phone_number || payload.phone_no;
    const rawCc = payload.user_country_code || payload.country_code || '+91';
    const firstName = payload.user_first_name || '';
    const lastName = payload.user_last_name || '';
    const nameFromPayload = `${firstName} ${lastName}`.trim();

    if (!rawPhone) {
      return NextResponse.json({ error: 'No verified phone number found in credential payload' }, { status: 400 });
    }

    const e164Phone = formatToE164(rawCc, rawPhone);

    const client = await clerkClient();

    // 1. Look up user by phone number in Clerk
    const clerkUserList = await client.users.getUserList({
      phoneNumber: [e164Phone],
    });

    let clerkUser = clerkUserList.data && clerkUserList.data.length > 0 ? clerkUserList.data[0] : null;

    // 2. Check Neon user
    const [existingNeonUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.phone, e164Phone))
      .limit(1);

    let isNewUser = false;
    let onboardingCompleted = existingNeonUser?.onboarding_completed || false;

    if (!clerkUser) {
      isNewUser = true;
      // Create new phone-only user in Clerk (no password)
      try {
        clerkUser = await client.users.createUser({
          phoneNumber: [e164Phone],
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        });
      } catch (createErr: any) {
        console.error('[Phone Login] Clerk createUser failed:', createErr?.errors?.[0]?.message || createErr);
        return NextResponse.json(
          { error: createErr?.errors?.[0]?.message || 'Failed to initialize account with phone' },
          { status: 400 }
        );
      }
    }

    // Upsert user into Neon Postgres
    const now = new Date();
    const finalName = existingNeonUser?.name || nameFromPayload || 'Customer';

    if (existingNeonUser) {
      await db
        .update(schema.users)
        .set({
          phone: e164Phone,
          phone_verified: true,
          phone_verified_at: now,
          last_active_at: now,
        })
        .where(eq(schema.users.id, existingNeonUser.id));
    } else {
      isNewUser = true;
      onboardingCompleted = false;
      await db
        .insert(schema.users)
        .values({
          id: clerkUser.id,
          phone: e164Phone,
          phone_verified: true,
          phone_verified_at: now,
          email: clerkUser.primaryEmailAddress?.emailAddress || null,
          email_verified: Boolean(clerkUser.primaryEmailAddress),
          name: finalName,
          auth_provider: 'phone',
          onboarding_completed: false,
          created_at: now,
          last_active_at: now,
        })
        .onConflictDoUpdate({
          target: schema.users.id,
          set: {
            phone: e164Phone,
            phone_verified: true,
            phone_verified_at: now,
            last_active_at: now,
          },
        });
    }

    // 3. Mint short-lived Clerk sign-in ticket (60s)
    const signInToken = await client.signInTokens.createSignInToken({
      userId: clerkUser.id,
      expiresInSeconds: 60,
    });

    // Validate returnTo: same-origin relative path only
    let safeReturnTo = '/';
    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') && !returnTo.includes('\\')) {
      safeReturnTo = returnTo;
    }

    return NextResponse.json({
      success: true,
      token: signInToken.token,
      isNewUser,
      onboarding_completed: onboardingCompleted,
      returnTo: safeReturnTo,
    });
  } catch (error: any) {
    console.error('[POST /api/auth/phone-login exception]:', error?.message || 'internal error');
    return NextResponse.json({ error: 'Authentication failed. Please retry.' }, { status: 500 });
  }
}

