import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET: List all system staff & admin accounts
export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const rolesList = await db
      .select()
      .from(schema.systemRoles)
      .orderBy(desc(schema.systemRoles.created_at));

    return NextResponse.json({ roles: rolesList });
  } catch (err: any) {
    console.error('Failed to fetch system roles:', err);
    return NextResponse.json({ error: 'Failed to fetch staff roles' }, { status: 500 });
  }
}

// POST: Add a new staff or admin email allow-list entry
export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { email, role, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = role === 'admin' ? 'admin' : 'staff';

    const [inserted] = await db
      .insert(schema.systemRoles)
      .values({
        email: cleanEmail,
        role: assignedRole,
        name: name ? name.trim() : null,
      })
      .onConflictDoUpdate({
        target: schema.systemRoles.email,
        set: {
          role: assignedRole,
          name: name ? name.trim() : undefined,
          updated_at: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ success: true, role: inserted });
  } catch (err: any) {
    console.error('Failed to add staff role:', err);
    return NextResponse.json({ error: 'Failed to save staff role' }, { status: 500 });
  }
}

// DELETE: Remove a staff or admin email from the allow-list
export async function DELETE(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ error: 'Role ID or Email is required' }, { status: 400 });
    }

    let deleted;
    if (id) {
      deleted = await db
        .delete(schema.systemRoles)
        .where(eq(schema.systemRoles.id, id))
        .returning();
    } else if (email) {
      deleted = await db
        .delete(schema.systemRoles)
        .where(eq(schema.systemRoles.email, email.toLowerCase().trim()))
        .returning();
    }

    return NextResponse.json({ success: true, deletedCount: deleted?.length || 0 });
  } catch (err: any) {
    console.error('Failed to delete staff role:', err);
    return NextResponse.json({ error: 'Failed to delete staff role' }, { status: 500 });
  }
}
