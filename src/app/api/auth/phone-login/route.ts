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
    // Upstash rate limit fails open in dev rather than throwing 500
    console.warn(`[phone-login] stage=rate-limit error=${rateErr?.message || 'Rate limit failure - failing open'}`);
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

  // STAGE: fetch-phone-json
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

  // STAGE: db-lookup
  let existingNeonUser: any = null;
  try {
    const usersFound = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.phone, e164Phone))
      .limit(1);
    existingNeonUser = usersFound[0] || null;
  } catch (dbErr: any) {
    console.warn(`[phone-login] stage=db-lookup error=${dbErr?.message || 'Database lookup query failed'}`);
    return makeErrorResponse('DATABASE_ERROR', 'Database error during user verification.', 500, 'db-lookup');
  }

  // STAGE: clerk-create-user
  let clerkUser: any = null;
  let isNewUser = false;
  let client: any = null;
  try {
    client = await clerkClient();

    // Look up user by phone number in Clerk
    const clerkUserList = await client.users.getUserList({
      phoneNumber: [e164Phone],
    });

    if (clerkUserList.data && clerkUserList.data.length > 0) {
      clerkUser = clerkUserList.data[0];
    } else if (existingNeonUser?.id) {
      try {
        clerkUser = await client.users.getUser(existingNeonUser.id);
      } catch {
        clerkUser = null;
      }
    }

    if (!clerkUser) {
      isNewUser = true;
      try {
        clerkUser = await client.users.createUser({
          phoneNumber: [e164Phone],
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        });
      } catch (createErr: any) {
        // Resolve "phone already exists" gracefully to existing user
        const errMsg = createErr?.errors?.[0]?.message || createErr?.message || 'Unknown Clerk creation error';
        console.warn(`[phone-login] stage=clerk-create-user error=Conflict on createUser: ${errMsg}`);

        const retryList = await client.users.getUserList({
          phoneNumber: [e164Phone],
        });
        if (retryList.data && retryList.data.length > 0) {
          clerkUser = retryList.data[0];
        } else {
          return makeErrorResponse('CLERK_USER_CREATE_FAILED', 'Failed to initialize account with phone number.', 500, 'clerk-create-user');
        }
      }
    }
  } catch (clerkErr: any) {
    console.warn(`[phone-login] stage=clerk-create-user error=${clerkErr?.message || 'Clerk user retrieval failed'}`);
    return makeErrorResponse('CLERK_USER_CREATE_FAILED', 'Account service unavailable. Please retry.', 500, 'clerk-create-user');
  }

  // STAGE: neon-upsert
  const now = new Date();
  const nameFromPayload = `${firstName} ${lastName}`.trim();
  const finalName = existingNeonUser?.name || nameFromPayload || 'Customer';
  let onboardingCompleted = existingNeonUser?.onboarding_completed || false;

  try {
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
  } catch (upsertErr: any) {
    console.warn(`[phone-login] stage=neon-upsert error=${upsertErr?.message || 'Neon user upsert failed'}`);
    return makeErrorResponse('DATABASE_ERROR', 'Failed to record user profile.', 500, 'neon-upsert');
  }

  // STAGE: clerk-sign-in-token
  let signInToken: any = null;
  try {
    signInToken = await client.signInTokens.createSignInToken({
      userId: clerkUser.id,
      expiresInSeconds: 60,
    });
  } catch (tokenErr: any) {
    console.warn(`[phone-login] stage=clerk-sign-in-token error=${tokenErr?.message || 'Failed to mint sign in token'}`);
    return makeErrorResponse('CLERK_SIGN_IN_TOKEN_FAILED', 'Failed to generate sign-in ticket.', 500, 'clerk-sign-in-token');
  }

  // Validate returnTo: same-origin relative path only
  let safeReturnTo = '/';
  if (returnToPath && returnToPath.startsWith('/') && !returnToPath.startsWith('//') && !returnToPath.includes('\\')) {
    safeReturnTo = returnToPath;
  }

  return NextResponse.json({
    success: true,
    token: signInToken.token,
    isNewUser,
    onboarding_completed: onboardingCompleted,
    returnTo: safeReturnTo,
  });
}
