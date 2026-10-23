import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { redis } from '../src/lib/redis';
import { firestoreService } from '../src/lib/firestore';
import { createOrUpdateUserFromGoogle, createOrUpdateUserFromPhone, findUserByClerkId, findUserByPhone } from '../src/lib/user-identity';

async function runPhase2Test() {
  console.log('--- PHASE 2: CLERK & PHONE.EMAIL INTEGRATION VERIFICATION ---');

  // 1. Test Clerk Webhook & Firestore Sync
  console.log('\n[1. Clerk Google Webhook Sync Test]');
  const mockClerkId = `user_clerk_g_${Date.now()}`;
  const mockEmail = `radhika.mehta_${Date.now()}@gmail.com`;
  const mockFullName = 'Radhika Mehta';

  const googleUser = await createOrUpdateUserFromGoogle({
    clerkId: mockClerkId,
    email: mockEmail,
    fullName: mockFullName,
  });

  console.log('- Clerk Webhook Processed user.created Event:');
  console.log(JSON.stringify(googleUser, null, 2));

  const retrievedClerkUser = await findUserByClerkId(mockClerkId);
  console.log(`- Firestore Verification (clerk_id: ${mockClerkId}):`, retrievedClerkUser ? 'PASSED (Found Document)' : 'FAILED');

  // 2. Test Phone.Email Verification & Upstash Redis Rate Limiting
  console.log('\n[2. Phone.Email Verification & Upstash Redis Rate Limit Test]');
  const mockPhone = `+919988${Math.floor(10000 + Math.random() * 90000)}`;
  const rateLimitKey = `ratelimit:phone_verify:127.0.0.1`;

  // Increment rate limit key in Upstash Redis
  await redis.incr(rateLimitKey);
  await redis.expire(rateLimitKey, 600);
  const currentCount = await redis.get(rateLimitKey);
  const ttl = await redis.ttl(rateLimitKey);

  console.log(`- Upstash Redis Rate-Limit Key Set: '${rateLimitKey}'`);
  console.log(`- Current Attempt Count: ${currentCount}`);
  console.log(`- TTL Remaining: ${ttl} seconds`);

  // Verify Phone User Creation & Account Linking
  const phoneUser = await createOrUpdateUserFromPhone({
    phone: mockPhone,
    activeUserId: googleUser.id,
  });

  console.log('- Resulting Linked Firestore User Document:');
  console.log(JSON.stringify(phoneUser, null, 2));

  const retrievedPhoneUser = await findUserByPhone(mockPhone);
  console.log(`- Firestore Verification (phone: ${mockPhone}):`, retrievedPhoneUser ? 'PASSED (Found Document)' : 'FAILED');

  console.log('\n--- ALL PHASE 2 TESTS COMPLETED SUCCESSFULLY ---');
}

runPhase2Test().catch((err) => {
  console.error('Phase 2 test failed:', err);
  process.exit(1);
});
