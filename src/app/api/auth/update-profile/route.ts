import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { verifyToken, signToken } from '@/lib/jwt';
import { auth } from '@clerk/nextjs/server';
import { rateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, phone, email, userId: bodyUserId, tempToken } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    // 1. Resolve user identity from all available sources
    let userId: string | null = null;
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('tgc_session')?.value || cookieStore.get('drftn_session')?.value;

    // Source A: Session Cookie
    if (sessionToken) {
      try {
        const payload = await verifyToken(sessionToken);
        if (payload && payload.userId) {
          userId = payload.userId as string;
        }
      } catch (tErr) {
        console.warn('Verify token warning in update-profile:', tErr);
      }
    }

    // Source B: Clerk Auth
    if (!userId) {
      try {
        const clerkAuth = await auth();
        if (clerkAuth?.userId) {
          userId = clerkAuth.userId;
        }
      } catch (cErr) {
        console.warn('Clerk auth in update-profile warning:', cErr);
      }
    }

    // Source C: Explicit bodyUserId
    if (!userId && bodyUserId && typeof bodyUserId === 'string' && bodyUserId.trim()) {
      userId = bodyUserId.trim();
    }

    // Source D: Temporary OTP verification token (contains phone or temp userId)
    let tempPhone: string | null = null;
    if (!userId && tempToken && typeof tempToken === 'string') {
      try {
        const payload = (await verifyToken(tempToken)) as any;
        if (payload && payload.isTemp && payload.phone) {
          tempPhone = payload.phone;
          const cleanP = payload.phone.replace(/\D/g, '');
          userId = `phone_${cleanP}`;
        } else if (payload && payload.userId) {
          userId = payload.userId as string;
        }
      } catch (tempErr) {
        console.warn('Temp token warning in update-profile:', tempErr);
      }
    }

    const cleanEmail = email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? email.trim().toLowerCase()
      : null;

    let cleanPhone: string | null = tempPhone;
    if (phone && typeof phone === 'string') {
      const digits = phone.replace(/\D/g, '');
      if (/^[6-9]\d{9}$/.test(digits)) {
        cleanPhone = `+91${digits}`;
      }
    }

    // Source E: Database lookup by email or phone if user ID is not resolved yet
    if (!userId) {
      const conditions = [];
      if (cleanEmail) conditions.push(eq(schema.users.email, cleanEmail));
      if (cleanPhone) conditions.push(eq(schema.users.phone, cleanPhone));

      if (conditions.length > 0) {
        const [userInDb] = await db
          .select()
          .from(schema.users)
          .where(or(...conditions))
          .limit(1);
        if (userInDb) {
          userId = userInDb.id;
        }
      }
    }

    // 2. Security: Rate limiting
    const rateLimitKey = userId ? `profile-update:${userId}` : `profile-update:${cleanEmail || cleanPhone || 'guest'}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 15, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({
        error: `Too many profile updates. Please wait ${rateLimitResult.reset} seconds.`,
      }, { status: 429 });
    }

    // 3. Build update fields
    const updateData: Record<string, any> = { name: name.trim() };

    if (cleanEmail) {
      updateData.email = cleanEmail;
      updateData.email_verified = true;
    }

    if (cleanPhone) {
      // Check if phone belongs to another existing user
      const [existingPhoneUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.phone, cleanPhone))
        .limit(1);

      if (existingPhoneUser && existingPhoneUser.id !== userId) {
        // If phone is linked to another user account, only block if current user is different
        if (userId) {
          return NextResponse.json(
            { error: 'This phone number is already linked to another account.' },
            { status: 400 }
          );
        } else {
          // Adopt existing user record
          userId = existingPhoneUser.id;
        }
      } else {
        updateData.phone = cleanPhone;
        updateData.phone_verified = true;
      }
    }

    // 4. Perform update or creation in Neon database
    let updatedUser: any = null;

    if (userId) {
      const [userById] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (userById) {
        const [resUser] = await db
          .update(schema.users)
          .set(updateData)
          .where(eq(schema.users.id, userId))
          .returning();
        updatedUser = resUser;
      }
    }

    if (!updatedUser && cleanEmail) {
      const [userByEmail] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, cleanEmail))
        .limit(1);

      if (userByEmail) {
        const [resUser] = await db
          .update(schema.users)
          .set(updateData)
          .where(eq(schema.users.id, userByEmail.id))
          .returning();
        updatedUser = resUser;
      }
    }

    // If user is still not in DB, insert a new user row
    if (!updatedUser) {
      const finalId = userId || `usr_${crypto.randomUUID().replace(/-/g, '')}`;
      const [insertedUser] = await db
        .insert(schema.users)
        .values({
          id: finalId,
          name: name.trim(),
          phone: cleanPhone || null,
          phone_verified: !!cleanPhone,
          email: cleanEmail || null,
          email_verified: !!cleanEmail,
          auth_provider: cleanPhone ? 'phone' : 'google',
          notifications_opt_in: true,
          terms_accepted_at: new Date(),
        })
        .returning();
      updatedUser = insertedUser;
    }

    // 5. Sign 30-day session token and set tgc_session cookie
    const token = await signToken({ userId: updatedUser.id });
    cookies().set('tgc_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    const formattedUser = {
      ...updatedUser,
      authProvider: updatedUser.auth_provider,
      notificationsOptIn: updatedUser.notifications_opt_in,
      phoneVerified: updatedUser.phone_verified,
      emailVerified: updatedUser.email_verified,
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
