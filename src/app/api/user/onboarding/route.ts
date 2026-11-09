export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clerkClient } from '@clerk/nextjs/server';
import { getAuthUserId } from '@/lib/auth/getAuthUserId';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { signToken } from '@/lib/jwt';

const OnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  area: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  locationSource: z.enum(['geolocation', 'manual']).optional().default('manual'),
});

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in again' }, { status: 401 });
    }

    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const rateCheck = await rateLimit(`onboarding:user:${userId}`, 10, 60000);
      if (!rateCheck.success) {
        return NextResponse.json({ error: 'Too many attempts. Please wait.' }, { status: 429 });
      }
    } catch (rateErr) {
      console.warn('[Onboarding] Rate check warning (failing open):', rateErr);
    }

    const body = await req.json();
    const parsed = OnboardingSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Invalid form data';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { name, email, pincode, city, state, area, line1, line2, locationSource } = parsed.data;

    // 1. Get user from Neon
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    const userPhone = existingUser?.phone || '';

    // 2. If user signed up via Google, update Clerk name non-blockingly
    if (existingUser?.auth_provider === 'google') {
      try {
        const client = await clerkClient();
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        await client.users.updateUser(userId, {
          firstName,
          lastName: lastName || undefined,
        });
      } catch (clerkErr: any) {
        console.warn('[Onboarding] Clerk user update note:', clerkErr?.message);
      }
    }

    // 3. Update or upsert Neon users table
    const now = new Date();
    const cleanEmail = email ? email.trim() : existingUser?.email || null;

    if (existingUser) {
      await db
        .update(schema.users)
        .set({
          name: name.trim(),
          email: cleanEmail,
          onboarding_completed: true,
          last_active_at: now,
        })
        .where(eq(schema.users.id, userId));
    } else {
      await db
        .insert(schema.users)
        .values({
          id: userId,
          name: name.trim(),
          email: cleanEmail,
          phone: userPhone || null,
          phone_verified: Boolean(userPhone),
          auth_provider: 'phone',
          onboarding_completed: true,
          created_at: now,
          last_active_at: now,
        })
        .onConflictDoUpdate({
          target: schema.users.id,
          set: {
            name: name.trim(),
            email: cleanEmail,
            onboarding_completed: true,
            last_active_at: now,
          },
        });
    }

    // 4. Save location as default address in addresses table
    const fullLine1 = line1?.trim() || area?.trim() || `${city}, ${state}`;

    try {
      // Clear existing default flags for this user
      await db
        .update(schema.addresses)
        .set({ is_default: false })
        .where(eq(schema.addresses.user_id, userId));

      await db.insert(schema.addresses).values({
        user_id: userId,
        name: name.trim(),
        phone: userPhone || '9999999999',
        line1: fullLine1,
        line2: line2?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        area: area?.trim() || null,
        location_source: locationSource,
        location_updated_at: now,
        is_default: true,
      });
    } catch (addrErr: any) {
      console.warn('[Onboarding] Address insert warning:', addrErr?.message);
    }

    // 5. Re-issue fresh session token with onboarding status
    try {
      const sessionToken = await signToken({ userId });
      cookies().set('tgc_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    } catch (tokenErr) {
      console.warn('[Onboarding] Session token refresh note:', tokenErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Onboarding API Error]:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Failed to complete profile' }, { status: 500 });
  }
}
