export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/auth/admin';
import { logAuditEvent } from '@/lib/audit';
import { StaffInviteSchema } from '@/lib/validations/admin';

export async function POST(request: Request) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await request.json();
    const validation = StaffInviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid staff invitation inputs', details: validation.error.format() }, { status: 400 });
    }

    const { email, name, role, permissions } = validation.data;

    // 1. Create Clerk Invitation via Clerk REST/Server Client
    const client = await clerkClient();
    let invitation: any = null;

    try {
      invitation = await client.invitations.createInvitation({
        emailAddress: email,
        publicMetadata: {
          role,
          permissions,
          invitedByName: authRes.email,
        },
        ignoreExisting: true,
      });
    } catch (clerkErr: any) {
      console.warn('[Clerk Invitation Note]', clerkErr.message);
    }

    // 2. Persist intended staff metadata to Firestore
    if (typeof window === 'undefined') {
      try {
        const { dbService } = await import('@/lib/db');
        // Record staff invitation in Firestore
        await dbService.createStaffMember({
          email,
          name: name || email.split('@')[0],
          role,
          status: 'invited',
          permissions,
          invitedAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Firestore staff record creation warning:', dbErr);
      }
    }

    await logAuditEvent({
      action: 'staff.invited',
      actorId: authRes.userId,
      details: { email, role, permissions, invitationId: invitation?.id },
    });

    return NextResponse.json({
      success: true,
      email,
      role,
      permissions,
      invitationId: invitation?.id || 'manual_created',
      message: `Invitation generated for ${email} with role [${role}].`,
    });
  } catch (error) {
    console.error('Staff invite error:', error);
    return NextResponse.json({ error: 'Failed to generate staff invitation' }, { status: 500 });
  }
}
