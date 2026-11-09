import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { auth } from '@clerk/nextjs/server';

/**
 * Universal auth resolver:
 * 1. Checks `tgc_session` cookie (used by phone.email OTP login & synced Google users)
 * 2. Falls back to Clerk `auth()` (used by Google OAuth users)
 */
export async function getAuthUserId(req?: Request): Promise<string | null> {
  // 1. Check cookieStore
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('tgc_session')?.value;
    if (sessionToken) {
      const payload = await verifyToken(sessionToken);
      if (payload && payload.userId) {
        return payload.userId as string;
      }
    }
  } catch {
    // cookies() may throw outside Next.js request context
  }

  // 1b. Check raw cookie header if request provided
  if (req) {
    try {
      const rawCookie = req.headers.get('cookie') || '';
      const token = rawCookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('tgc_session='))
        ?.split('=')?.[1];
      if (token) {
        const payload = await verifyToken(token);
        if (payload && payload.userId) {
          return payload.userId as string;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Check Clerk session for Google login
  try {
    const clerkAuth = await auth();
    if (clerkAuth?.userId) {
      return clerkAuth.userId;
    }
  } catch {
    // Clerk not initialized or invalid session
  }

  return null;
}

