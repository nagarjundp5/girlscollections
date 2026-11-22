import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken, signToken } from '@/lib/jwt';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redis, isRedisConfigured } from '@/lib/redis';

export const dynamic = 'force-dynamic';

function formatUser(u: any) {
  if (!u) return null;
  return {
    ...u,
    authProvider: u.auth_provider || u.authProvider || 'phone',
    auth_provider: u.auth_provider || u.authProvider || 'phone',
    notificationsOptIn: u.notifications_opt_in ?? u.notificationsOptIn ?? true,
    phoneVerified: u.phone_verified ?? u.phoneVerified ?? false,
    emailVerified: u.email_verified ?? u.emailVerified ?? false,
    onboardingCompleted: u.onboarding_completed ?? u.onboardingCompleted ?? false,
  };
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('tgc_session')?.value;
    const hasClerkCookie =
      cookieStore.has('__session') ||
      cookieStore.has('__client_uat') ||
      cookieStore.has('__clerk_db_jwt');

    // 1. FAST GUEST EXIT: If neither tgc_session nor Clerk session cookies exist,
    // visitor is 100% a guest. Trigger ZERO database and ZERO Clerk API calls.
    if (!sessionToken && !hasClerkCookie) {
      return NextResponse.json({ user: null });
    }

    // 2. Verified Custom TGC Session (Phone or synced Clerk)
    if (sessionToken) {
      try {
        const payload = await verifyToken(sessionToken);
        if (payload && payload.userId) {
          const userId = payload.userId as string;
          const cacheKey = `user:me:${userId}`;

          // Check short-TTL session cache in Redis (300s TTL)
          if (isRedisConfigured()) {
            try {
              const cached = await redis.get(cacheKey);
              if (cached) {
                const userObj = typeof cached === 'string' ? JSON.parse(cached) : cached;
                return NextResponse.json({ user: userObj });
              }
            } catch {
              // Ignore Redis read error, fall through to DB
            }
          }

          const [dbUser] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, userId))
            .limit(1);

          if (dbUser) {
            const formatted = formatUser(dbUser);
            if (isRedisConfigured()) {
              try {
                await redis.set(cacheKey, JSON.stringify(formatted), { ex: 300 });
              } catch {
                // Non-critical
              }
            }
            return NextResponse.json({ user: formatted });
          }
        }
      } catch (tokenErr) {
        console.warn('Session verification warning:', tokenErr);
      }
    }

    // 3. Fallback: Check Clerk authentication if Clerk cookies are present
    if (hasClerkCookie) {
      try {
        const clerkAuth = await auth();
        if (clerkAuth?.userId) {
          const [dbUser] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, clerkAuth.userId))
            .limit(1);

          if (dbUser) {
            const token = await signToken({ userId: dbUser.id });
            cookies().set('tgc_session', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 30 * 24 * 60 * 60,
              path: '/',
            });

            const formatted = formatUser(dbUser);
            return NextResponse.json({ user: formatted });
          }

          try {
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(clerkAuth.userId);
            const email = clerkUser.emailAddresses.find(
              (e: any) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || null;
            const name = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Google User';

            let dbUserByEmail = null;
            if (email) {
              const [found] = await db
                .select()
                .from(schema.users)
                .where(eq(schema.users.email, email))
                .limit(1);
              dbUserByEmail = found;
            }

            let syncedUser;
            let isNewUser = false;
            if (dbUserByEmail) {
              const [updated] = await db
                .update(schema.users)
                .set({
                  auth_provider: 'google',
                  email_verified: true,
                  name: dbUserByEmail.name || name,
                })
                .where(eq(schema.users.id, dbUserByEmail.id))
                .returning();
              syncedUser = updated;
            } else {
              isNewUser = true;
              const [created] = await db
                .insert(schema.users)
                .values({
                  id: clerkAuth.userId,
                  email,
                  name,
                  auth_provider: 'google',
                  email_verified: true,
                  phone_verified: false,
                })
                .returning();
              syncedUser = created;
            }

            const token = await signToken({ userId: syncedUser.id });
            cookies().set('tgc_session', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 30 * 24 * 60 * 60,
              path: '/',
            });

            return NextResponse.json({ user: formatUser(syncedUser), isNewUser });
          } catch (clerkErr) {
            console.warn('Clerk user sync skipped:', clerkErr);
          }
        }
      } catch (clerkAuthErr) {
        console.warn('Clerk auth fallback skipped:', clerkAuthErr);
      }
    }

    return NextResponse.json({ user: null });
  } catch (error) {
    console.warn('Unified Auth Me Route Warning:', error);
    return NextResponse.json({ user: null });
  }
}
