import { currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const DEFAULT_ADMIN_ALLOWLIST = [
  'nagarjundp256@gmail.com',
  'admin@tgc.in',
  'nnvg2608@gmail.com',
  'drftnclothing@gmail.com',
  'chethansc47@gmail.com',
];

export interface AdminAuthContext {
  userId: string;
  email: string;
  role: 'admin' | 'staff';
  permissions: string[];
  isAdmin: boolean;
}

export async function getAdminSession(): Promise<AdminAuthContext | null> {
  const cookieStore = cookies();

  // 0. Check direct tgc_admin_session cookie
  const adminCookie = cookieStore.get('tgc_admin_session')?.value;
  if (adminCookie === 'true') {
    return {
      userId: 'admin-session-cookie',
      email: 'admin@tgc.in',
      role: 'admin',
      permissions: ['*'],
      isAdmin: true,
    };
  }

  // 1. Check custom JWT session cookie (tgc_session or drftn_session)
  const sessionToken = cookieStore.get('tgc_session')?.value || cookieStore.get('drftn_session')?.value;
  if (sessionToken) {
    try {
      const { verifyToken } = await import('@/lib/jwt');
      const payload = await verifyToken(sessionToken);
      if (payload && payload.userId) {
        const { db } = await import('@/db');
        const schema = await import('@/db/schema');
        const { eq } = await import('drizzle-orm');
        const [u] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, payload.userId as string))
          .limit(1);
        if (u) {
          const uEmail = (u.email || '').toLowerCase().trim();
          if (DEFAULT_ADMIN_ALLOWLIST.includes(uEmail)) {
            return {
              userId: u.id,
              email: uEmail,
              role: 'admin',
              permissions: ['*'],
              isAdmin: true,
            };
          }
        }
      }
    } catch (jwtErr) {
      console.warn('[AdminAuth] JWT verification warning:', jwtErr);
    }
  }

  // 2. Check Clerk auth session (Primary Auth Path)
  try {
    const user = await currentUser();
    if (user) {
      const email = (user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '').toLowerCase().trim();
      if (email) {
        let role: 'admin' | 'staff' | null = null;
        try {
          const { dbHttp } = await import('@/db');
          const schema = await import('@/db/schema');
          const { eq } = await import('drizzle-orm');

          const [dbRole] = await dbHttp
            .select()
            .from(schema.systemRoles)
            .where(eq(schema.systemRoles.email, email))
            .limit(1);

          if (dbRole) {
            role = dbRole.role as 'admin' | 'staff';
          }
        } catch (dbErr) {
          console.warn('[AdminAuth] Database system_roles lookup warning:', dbErr);
        }

        if (!role && DEFAULT_ADMIN_ALLOWLIST.includes(email)) {
          role = 'admin';
        }

        if (!role) {
          const publicMetadata = (user.publicMetadata || {}) as { role?: string };
          if (publicMetadata.role === 'admin') role = 'admin';
          if (publicMetadata.role === 'staff') role = 'staff';
        }

        if (role) {
          const isAdmin = role === 'admin';
          return {
            userId: user.id,
            email,
            role,
            permissions: isAdmin ? ['*'] : ['products.read', 'products.write', 'categories.read', 'categories.write'],
            isAdmin,
          };
        }
      }
    }
  } catch (error) {
    console.warn('[AdminAuth] Clerk user check warning:', error);
  }

  return null;
}

export async function requireAdmin(): Promise<AdminAuthContext | NextResponse> {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }
  return session;
}

export async function requireStaffOrAdmin(): Promise<AdminAuthContext | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 }
    );
  }
  return session;
}

export async function requirePermission(permission: string): Promise<AdminAuthContext | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 }
    );
  }

  if (session.isAdmin || session.permissions.includes('*') || session.permissions.includes(permission)) {
    return session;
  }

  return NextResponse.json(
    { error: `Forbidden: Missing required permission [${permission}]` },
    { status: 403 }
  );
}
