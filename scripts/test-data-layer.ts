import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { redis, isRedisConfigured } from '../src/lib/redis';
import { firestoreService } from '../src/lib/firestore';
import { createOrUpdateUserFromGoogle, createOrUpdateUserFromPhone, mergeAccounts } from '../src/lib/user-identity';

async function runDataLayerTest() {
  console.log('--- PHASE 1: DATA LAYER & IDENTITY VERIFICATION ---');

  // 1. Check Neon Connection String
  const dbUrl = process.env.DATABASE_URL || '';
  const isPooled = dbUrl.includes('-pooler');
  console.log(`\n[Neon Postgres Check]`);
  console.log(`- Connection String URL: ${dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'MISSING'}`);
  console.log(`- Uses POOLED Hostname (-pooler): ${isPooled ? 'CONFIRMED' : 'FAILED (Direct connection string detected)'}`);

  // 2. Check Upstash Redis HTTP Client
  console.log(`\n[Upstash Redis Check]`);
  console.log(`- Configured: ${isRedisConfigured()}`);
  const testKey = `phase1_test_${Date.now()}`;
  const testValue = `ok_at_${new Date().toISOString()}`;
  await redis.set(testKey, testValue, { ex: 60 });
  const retrieved = await redis.get(testKey);
  console.log(`- Set key '${testKey}' -> '${testValue}'`);
  console.log(`- Retrieved key '${testKey}' -> '${retrieved}'`);
  console.log(`- Redis HTTP Set/Get Test: ${retrieved === testValue ? 'PASSED' : 'FAILED'}`);

  // 3. Check Firestore Client & Users Collection Operations
  console.log(`\n[Firestore Users Collection & Identity Model Check]`);
  console.log(`- Using Real Firebase Admin SDK: ${!firestoreService.isMock()}`);

  // Test Creating Google User
  const mockClerkId = `clerk_test_${Date.now()}`;
  const googleUser = await createOrUpdateUserFromGoogle({
    clerkId: mockClerkId,
    email: `test_user_${Date.now()}@example.com`,
    fullName: 'Ananya Sharma',
  });
  console.log(`- Created Google User:`, JSON.stringify(googleUser, null, 2));

  // Test Linking Phone
  const mockPhone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
  const linkedUser = await createOrUpdateUserFromPhone({
    phone: mockPhone,
    activeUserId: googleUser.id,
  });
  console.log(`- Linked Phone User:`, JSON.stringify(linkedUser, null, 2));

  // Test Account Conflict & Merge
  const phoneOnlyUser = await createOrUpdateUserFromPhone({
    phone: `+9197${Math.floor(10000000 + Math.random() * 90000000)}`,
  });
  console.log(`- Created Phone-Only User:`, JSON.stringify(phoneOnlyUser, null, 2));

  const mergedUser = await mergeAccounts(linkedUser.id, phoneOnlyUser.id);
  console.log(`- Merged Account Result:`, JSON.stringify(mergedUser, null, 2));

  console.log('\n--- ALL DATA LAYER TESTS COMPLETED ---');
}

runDataLayerTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
