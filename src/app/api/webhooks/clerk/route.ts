export const dynamic = 'force-dynamic';

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createOrUpdateUserFromGoogle } from '@/lib/user-identity';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.warn('[Clerk Webhook] CLERK_WEBHOOK_SECRET missing, processing in unverified dev mode');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  const body = await req.text();

  let evt: WebhookEvent;

  if (WEBHOOK_SECRET) {
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('[Clerk Webhook] Error verifying webhook signature:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else {
    try {
      evt = JSON.parse(body);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const primaryEmail = email_addresses && email_addresses.length > 0
      ? email_addresses[0].email_address
      : '';
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Customer';

    // 1. Sync to Neon Postgres (Source of truth for customer profile data)
    try {
      const { db } = await import('@/db');
      const schema = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      const existingUsers = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);

      const existingUser = existingUsers[0];

      if (existingUser) {
        await db
          .update(schema.users)
          .set({
            name: fullName || existingUser.name,
            email: primaryEmail || existingUser.email,
            last_active_at: new Date(),
          })
          .where(eq(schema.users.id, id));
        console.log(`[Clerk Webhook] Updated existing Neon user ${id}`);
      } else {
        // Determine auth provider (default to google if external account or no phone)
        const isGoogle = evt.data.external_accounts && evt.data.external_accounts.some((acc: any) => acc.provider === 'google');
        const provider: 'google' | 'phone' = isGoogle ? 'google' : 'google'; // default customer OAuth

        await db
          .insert(schema.users)
          .values({
            id,
            name: fullName,
            email: primaryEmail || null,
            email_verified: true,
            phone: null,
            phone_verified: false, // Google sign-ins default to false until OTP completed
            auth_provider: provider,
            created_at: new Date(),
            last_active_at: new Date(),
          })
          .onConflictDoUpdate({
            target: schema.users.id,
            set: {
              name: fullName,
              email: primaryEmail || null,
              last_active_at: new Date(),
            },
          });
        console.log(`[Clerk Webhook] Created new Neon user record for ${id} (phone_verified=false)`);
      }
    } catch (neonErr) {
      console.error('[Clerk Webhook] Failed to sync to Neon Postgres:', neonErr);
    }

    // 2. Also update Firestore for legacy media/identity reference
    let firestoreUserId = id;
    try {
      const firestoreUser = await createOrUpdateUserFromGoogle({
        clerkId: id,
        email: primaryEmail,
        fullName,
      });
      firestoreUserId = firestoreUser.id;
    } catch (fsErr) {
      console.warn('[Clerk Webhook] Firestore identity sync optional notice:', fsErr);
    }

    return NextResponse.json({ success: true, userId: firestoreUserId });
  }

  return NextResponse.json({ success: true, message: `Ignored event ${eventType}` });
}

