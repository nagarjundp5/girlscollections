import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Client } from '@upstash/qstash';

async function main() {
  console.log('\n--- [QStash Test Script] ---');

  const qstashToken = process.env.QSTASH_TOKEN;
  if (!qstashToken || qstashToken.includes('placeholder')) {
    console.error('❌ QSTASH_TOKEN is not configured in environment!');
    process.exit(1);
  }

  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
    'https://www.thegirlscollections.com';

  const siteUrl = rawUrl
    .trim()
    .replace(/\/+$/, '')
    .replace('://thegirlscollections.com', '://www.thegirlscollections.com');

  const pingUrl = `${siteUrl}/api/webhooks/qstash/ping`;
  console.log(`Publishing ping to destination: ${pingUrl}`);

  const client = new Client({ token: qstashToken });

  const headers: Record<string, string> = {};
  const bypassSecret = process.env.VERCEL_PROTECTION_BYPASS_SECRET;
  if (bypassSecret) {
    headers['Upstash-Forward-x-vercel-protection-bypass'] = bypassSecret.trim();
    console.log('✅ Added Upstash-Forward-x-vercel-protection-bypass header.');
  } else {
    console.log('ℹ️ VERCEL_PROTECTION_BYPASS_SECRET not set (not needed if production deployment is public).');
  }

  try {
    const res = await client.publishJSON({
      url: pingUrl,
      body: {
        test: true,
        source: 'scripts/test-qstash.ts',
        timestamp: Date.now(),
      },
      delay: 0,
      headers,
    });

    console.log('\n✅ Ping published successfully via QStash!');
    console.log(`   Message ID : ${res.messageId}`);
    console.log(`   Destination: ${pingUrl}`);
    console.log('\nQStash will deliver this to your endpoint and verify the HMAC signature.\n');
  } catch (err: any) {
    console.error('\n❌ QStash publish failed:', err?.message || err);
    process.exit(1);
  }
}

main();

