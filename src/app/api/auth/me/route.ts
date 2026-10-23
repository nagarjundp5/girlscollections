import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken, signToken } from '@/lib/jwt';
import { auth, clerkClient } from '@clerk/nextjs/server';

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
  };
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('tgc_session')?.value;

    if (sessionToken) {
      try {
        const payload = await verifyToken(sessionToken);
        if (payload && payload.userId) {
          const [dbUser] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, payload.userId as string))
            .limit(1);

          if (dbUser) {
            return NextResponse.json({ user: formatUser(dbUser) });
          }
        }
      } catch (tokenErr) {
        console.warn('Session verification warning:', tokenErr);
      }
    }

    // Fallback: Check if Clerk is authenticated
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

          return NextResponse.json({ user: formatUser(dbUser) });
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
                email: email,
                email_verified: !!email,
                name: name,
                auth_provider: 'google',
                notifications_opt_in: true,
                terms_accepted_at: new Date(),
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

    return NextResponse.json({ user: null });
  } catch (error) {
    console.warn('Unified Auth Me Route Warning:', error);
    return NextResponse.json({ user: null });
  }
}
