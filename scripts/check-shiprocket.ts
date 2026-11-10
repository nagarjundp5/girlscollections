import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';

async function main() {
  console.log('=== Shiprocket Configuration Check ===\n');

  // 1. Verify existence of env vars (values never printed)
  const envVars = [
    'SHIPROCKET_EMAIL',
    'SHIPROCKET_PASSWORD',
    'SHIPROCKET_PICKUP_LOCATION',
    'SHIPROCKET_WEBHOOK_SECRET',
    'SHIPROCKET_DRY_RUN',
  ];

  let missingAny = false;
  console.log('1. Environment Variables Status:');
  for (const v of envVars) {
    const val = process.env[v];
    const isSet = Boolean(val && val.trim().length > 0 && !val.includes('placeholder'));
    console.log(`   ${v.padEnd(28)}: ${isSet ? 'SET' : 'NOT SET'}`);
    if (!isSet && v !== 'SHIPROCKET_DRY_RUN') {
      missingAny = true;
    }
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  const configuredLocation = process.env.SHIPROCKET_PICKUP_LOCATION?.trim();

  if (!email || !password) {
    console.error('\n❌ SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured. Halting check.');
    process.exit(1);
  }

  // 2. Authenticate
  console.log('\n2. Authentication:');
  let token: string | null = null;
  try {
    const loginRes = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.token) {
      token = loginData.token;
      // Calculate token expiry (Shiprocket tokens expire in 10 days)
      const expiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      console.log('   Status      : SUCCESS');
      console.log(`   Token Expiry: ${expiry} (~10 days)`);
    } else {
      console.error('   Status      : FAILED');
      console.error(`   API Message : ${loginData.message || 'Authentication error'}`);
      console.error('   Please verify SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env.local.');
      process.exit(1);
    }
  } catch (err: any) {
    console.error('   Status : NETWORK/FETCH ERROR');
    console.error(`   Message: ${err?.message || err}`);
    process.exit(1);
  }

  // 3. Check Pickup Locations
  console.log('\n3. Pickup Locations:');
  try {
    const locRes = await fetch(`${SHIPROCKET_API_URL}/settings/company/pickup`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const locData = await locRes.json();
    const addressList: any[] = locData?.data?.shipping_address || [];
    const availableNames = addressList.map((a: any) => a.pickup_location || a.name || 'unnamed');

    console.log(`   Available Locations (${addressList.length}): ${availableNames.join(', ') || 'None found'}`);

    if (configuredLocation) {
      const match = availableNames.some(
        (name: string) => name.toLowerCase() === configuredLocation.toLowerCase()
      );
      if (match) {
        console.log(`   Configured Location "${configuredLocation}": MATCH CONFIRMED ✅`);
      } else {
        console.warn(
          `   ⚠️ Configured SHIPROCKET_PICKUP_LOCATION "${configuredLocation}" does NOT match any available location.`
        );
        console.warn(`   Available exact names: [${availableNames.join(', ')}]`);
      }
    } else {
      console.warn('   ⚠️ SHIPROCKET_PICKUP_LOCATION is not set in env.');
    }
  } catch (err: any) {
    console.error('   Failed to fetch pickup locations:', err?.message || err);
  }

  // 4. Serviceability Check (Sample: 560001 -> 110001)
  console.log('\n4. Serviceability Check (Sample 560001 -> 110001, 0.5kg):');
  try {
    const servUrl = `${SHIPROCKET_API_URL}/courier/serviceability?pickup_postcode=560001&delivery_postcode=110001&weight=0.5&cod=0`;
    const servRes = await fetch(servUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const servData = await servRes.json();
    const availableCouriers = servData?.data?.available_courier_companies || [];
    console.log(`   Serviceability: ${servRes.ok ? 'AVAILABLE' : 'FAILED'}`);
    console.log(`   Couriers available for route: ${availableCouriers.length}`);
    if (availableCouriers.length > 0) {
      const topCouriers = availableCouriers.slice(0, 3).map((c: any) => `${c.courier_name} (₹${c.rate})`);
      console.log(`   Sample options: ${topCouriers.join(', ')}`);
    }
  } catch (err: any) {
    console.error('   Failed to check serviceability:', err?.message || err);
  }

  // 5. Wallet Balance
  console.log('\n5. Wallet Balance:');
  try {
    const walletRes = await fetch(`${SHIPROCKET_API_URL}/account/details/wallet-balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const walletData = await walletRes.json();
    const balance = walletData?.data?.balance_amount ?? walletData?.balance ?? 'N/A';
    console.log(`   Wallet Balance: ₹${balance}`);
  } catch (err: any) {
    console.error('   Failed to check wallet balance:', err?.message || err);
  }

  console.log('\n=== Check Finished ===\n');
}

main();

