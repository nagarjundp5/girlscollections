import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
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
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateCheck = await rateLimit(`auth:phone-email:ip:${ip}`, 10, 60000); // 10 attempts per minute
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Too many login attempts. Please retry in ${rateCheck.reset} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { user_json_url } = body;

    if (!user_json_url || typeof user_json_url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid user_json_url' }, { status: 400 });
    }

    // SSRF Guard: Strictly allowlist phone.email host
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(user_json_url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const allowedHosts = ['user.phone.email', 'auth.phone.email'];
    if (!allowedHosts.includes(parsedUrl.hostname.toLowerCase())) {
      console.error(`[SSRF Blocked] Unauthorized host attempt: ${parsedUrl.hostname}`);
      return NextResponse.json({ error: 'Untrusted authorization provider URL' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Insecure protocol. HTTPS required.' }, { status: 400 });
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
    const fullName = `${firstName} ${lastName}`.trim() || 'Valued Customer';

    if (!rawPhone) {
      return NextResponse.json({ error: 'No verified phone number found in credential payload' }, { status: 400 });
    }

    const e164Phone = formatToE164(rawCc, rawPhone);

    // Rate limit per verified phone
    const phoneRateCheck = await rateLimit(`auth:phone-email:phone:${e164Phone}`, 5, 60000);
    if (!phoneRateCheck.success) {
      return NextResponse.json(
        { error: `Too many attempts for this number. Please wait ${phoneRateCheck.reset} seconds.` },
        { status: 429 }
      );
    }

    const client = await clerkClient();

    // Check if Clerk user already exists with this phone number
    const clerkUserList = await client.users.getUserList({
      phoneNumber: [e164Phone],
    });

    let clerkUser = clerkUserList.data && clerkUserList.data.length > 0 ? clerkUserList.data[0] : null;

    // Check if this phone exists in Neon DB under another Clerk user ID
    const [existingNeonByPhone] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.phone, e164Phone))
      .limit(1);

    if (existingNeonByPhone && clerkUser && existingNeonByPhone.id !== clerkUser.id) {
      // Conflict: verified phone belongs to a different account
      console.warn(`[Auth Conflict] Phone ${e164Phone} belongs to Clerk ${clerkUser.id} but Neon user is ${existingNeonByPhone.id}`);
      return NextResponse.json(
        { error: 'This number is already linked to another account. Sign in with that method.' },
        { status: 409 }
      );
    }

    if (!clerkUser) {
      // Create new Clerk user with verified phone
      try {
        clerkUser = await client.users.createUser({
          phoneNumber: [e164Phone],
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        });
      } catch (createErr: any) {
        console.error('[Clerk createUser Error]:', createErr);
        // If phone already taken or formatting mismatch
        const msg = createErr?.errors?.[0]?.message || 'Failed to initialize account with phone';
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    // Mint a 60-second sign-in token (ticket)
    const signInToken = await client.signInTokens.createSignInToken({
      userId: clerkUser.id,
      expiresInSeconds: 60,
    });

    // Upsert into Neon users table
    const [existingNeonUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, clerkUser.id))
      .limit(1);

    if (existingNeonUser) {
      await db
        .update(schema.users)
        .set({
          phone: e164Phone,
          phone_verified: true,
          name: existingNeonUser.name || fullName,
          last_active_at: new Date(),
        })
        .where(eq(schema.users.id, clerkUser.id));
    } else {
      await db
        .insert(schema.users)
        .values({
          id: clerkUser.id,
          phone: e164Phone,
          phone_verified: true,
          email: clerkUser.primaryEmailAddress?.emailAddress || null,
          email_verified: Boolean(clerkUser.primaryEmailAddress),
          name: fullName,
          auth_provider: 'phone',
          created_at: new Date(),
          last_active_at: new Date(),
        });
    }

    return NextResponse.json({
      success: true,
      ticket: signInToken.token,
      userId: clerkUser.id,
      name: fullName,
    });
  } catch (error: any) {
    console.error('[POST /api/auth/phone-email exception]:', error);
    return NextResponse.json({ error: 'Authentication failed. Please retry.' }, { status: 500 });
  }
}

