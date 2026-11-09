export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rateLimit';
import { signToken } from '@/lib/jwt';
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

function makeErrorResponse(code: string, message: string, status: number, stage: string) {
  const isDev = process.env.NODE_ENV !== 'production';
  return NextResponse.json(
    {
      error: code,
      message,
      ...(isDev ? { stage } : {}),
    },
    { status }
  );
}

export async function POST(req: Request) {
  // STAGE: rate-limit
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateCheck = await rateLimit(`auth:phone-login:ip:${ip}`, 10, 60000);
    if (!rateCheck.success) {
      console.warn(`[phone-login] stage=rate-limit error=Rate limit exceeded for IP`);
      return makeErrorResponse(
        'RATE_LIMITED',
        `Too many attempts. Please retry in ${rateCheck.reset} seconds.`,
        429,
        'rate-limit'
      );
    }
  } catch (rateErr: any) {
    // Fail open in dev or on Redis connection error
    console.warn(`[phone-login] stage=rate-limit error=${rateErr?.message || 'Rate limit check failed'}`);
  }

  // STAGE: token-validate
  let targetUrlString: string | null = null;
  let returnToPath: string | null = null;
  let parsedUrl: URL;
  try {
    const body = await req.json();
    const parsed = PhoneLoginSchema.safeParse(body);
    if (!parsed.success) {
      console.warn(`[phone-login] stage=token-validate error=Invalid request payload schema`);
      return makeErrorResponse('TOKEN_INVALID', 'Invalid authentication request.', 400, 'token-validate');
    }

    const { user_json_url, access_token, returnTo } = parsed.data;
    returnToPath = returnTo || null;

    targetUrlString = user_json_url || null;
    if (!targetUrlString && access_token) {
      targetUrlString = `https://user.phone.email/user_${encodeURIComponent(access_token)}.json`;
    }

    if (!targetUrlString) {
      console.warn(`[phone-login] stage=token-validate error=Missing verification parameters`);
      return makeErrorResponse('TOKEN_INVALID', 'Missing credential parameter.', 400, 'token-validate');
    }

    parsedUrl = new URL(targetUrlString);
    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname.toLowerCase() !== 'user.phone.email') {
      console.warn(`[phone-login] stage=token-validate error=Untrusted verification host`);
      return makeErrorResponse('UNTRUSTED_HOST', 'Untrusted authorization provider URL.', 400, 'token-validate');
    }
  } catch (valErr: any) {
    console.warn(`[phone-login] stage=token-validate error=${valErr?.message || 'Malformed authentication request'}`);
    return makeErrorResponse('TOKEN_INVALID', 'Malformed authentication request.', 400, 'token-validate');
  }

  // STAGE: fetch-phone-json (phone.email OTP verification)
  let rawPhone: string | undefined;
  let rawCc: string | undefined;
  let firstName = '';
  let lastName = '';
  try {
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
      console.warn(
        `[phone-login] stage=fetch-phone-json error=${
          fetchErr?.name === 'AbortError' ? 'Verification provider timed out' : fetchErr?.message || 'Network error'
        }`
      );
      return makeErrorResponse('VERIFICATION_TIMEOUT', 'Verification provider timed out. Please retry.', 504, 'fetch-phone-json');
    } finally {
      clearTimeout(timeoutId);
    }

    if (!phoneEmailRes.ok) {
      console.warn(`[phone-login] stage=fetch-phone-json error=HTTP status ${phoneEmailRes.status}`);
      if (phoneEmailRes.status === 400 || phoneEmailRes.status === 404) {
        return makeErrorResponse('TOKEN_EXPIRED', 'Verification link or OTP has expired. Please try again.', 400, 'fetch-phone-json');
      }
      return makeErrorResponse('VERIFICATION_FAILED', 'Failed to verify phone credential. Please retry.', 400, 'fetch-phone-json');
    }

    const payload = await phoneEmailRes.json();
    rawPhone = payload.user_phone_number || payload.phone_no;
    rawCc = payload.user_country_code || payload.country_code || '+91';
    firstName = payload.user_first_name || '';
    lastName = payload.user_last_name || '';

    if (!rawPhone) {
      console.warn(`[phone-login] stage=fetch-phone-json error=Missing phone in verification payload`);
      return makeErrorResponse('TOKEN_EXPIRED', 'Verification link or OTP has expired. Please try again.', 400, 'fetch-phone-json');
    }
  } catch (parseErr: any) {
    console.warn(`[phone-login] stage=fetch-phone-json error=${parseErr?.message || 'Error processing credential'}`);
    return makeErrorResponse('VERIFICATION_FAILED', 'Failed to retrieve phone verification.', 400, 'fetch-phone-json');
  }

  const e164Phone = formatToE164(rawCc || '+91', rawPhone);

  // STAGE: db-lookup & neon-upsert (Pure Phone OTP via Neon & tgc_session, decoupled from Clerk)
  let userId: string;
  let isNewUser = false;
  let onboardingCompleted = false;
  const now = new Date();
  const nameFromPayload = `${firstName} ${lastName}`.trim();
  let finalName = 'Customer';

  try {
    const [existingNeonUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.phone, e164Phone))
      .limit(1);

    if (existingNeonUser) {
      userId = existingNeonUser.id;
      finalName = existingNeonUser.name || nameFromPayload || 'Customer';
      onboardingCompleted = existingNeonUser.onboarding_completed || false;
      isNewUser = false;

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
      finalName = nameFromPayload || 'Customer';

      await db
        .insert(schema.users)
        .values({
          id: userId,
          phone: e164Phone,
          phone_verified: true,
          phone_verified_at: now,
          name: finalName,
          auth_provider: 'phone',
          onboarding_completed: false,
          notifications_opt_in: true,
          created_at: now,
          last_active_at: now,
        });
    }
  } catch (dbErr: any) {
    console.warn(`[phone-login] stage=db-upsert error=${dbErr?.message || 'Database operation failed'}`);
    return makeErrorResponse('DATABASE_ERROR', 'Failed to save phone verification.', 500, 'db-upsert');
  }

  // STAGE: issue-session (Mint 30-day session token in tgc_session cookie)
  let sessionToken: string;
  try {
    sessionToken = await signToken({ userId });
    cookies().set('tgc_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
  } catch (signErr: any) {
    console.warn(`[phone-login] stage=issue-session error=${signErr?.message || 'Failed to sign JWT session'}`);
    return makeErrorResponse('SESSION_CREATION_FAILED', 'Failed to establish login session.', 500, 'issue-session');
  }

  // Validate returnTo: same-origin relative path only
  let safeReturnTo = '/';
  if (returnToPath && returnToPath.startsWith('/') && !returnToPath.startsWith('//') && !returnToPath.includes('\\')) {
    safeReturnTo = returnToPath;
  }

  return NextResponse.json({
    success: true,
    isNewUser,
    onboarding_completed: onboardingCompleted,
    returnTo: safeReturnTo,
    user: {
      id: userId,
      phone: e164Phone,
      name: finalName,
      authProvider: 'phone',
      phoneVerified: true,
      onboardingCompleted,
    },
  });
}
