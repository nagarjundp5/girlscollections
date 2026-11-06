const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

async function runStep2() {
  console.log('=== STEP 2: CATALOG WIPE & CLEAN ===\n');

  // 1. Verify backup file exists
  const backupDir = '/Users/nagarjundp/thegirlscollections/backups/catalog_backup_20261029';
  const cPath = path.join(backupDir, 'cloudinary_product_public_ids.json');
  if (!fs.existsSync(cPath)) {
    throw new Error(`Backup file not found at: ${cPath}`);
  }

  const publicIds = JSON.parse(fs.readFileSync(cPath, 'utf-8'));
  console.log(`Loaded ${publicIds.length} Cloudinary public IDs from backup:`);
  for (const pid of publicIds) {
    if (!pid.startsWith('tgc/products/')) {
      throw new Error(`SECURITY ALERT: Public ID '${pid}' does NOT start with 'tgc/products/'! Aborting purge to protect non-product assets.`);
    }
    console.log(` - ${pid}`);
  }

  // 2. Delete from Cloudinary
  console.log('\nConfiguring Cloudinary and purging 14 product assets...');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const cResult = await cloudinary.api.delete_resources(publicIds);
  console.log('Cloudinary purge result:', cResult);

  // 3. Database transaction: Wipe catalog tables
  console.log('\nConnecting to Neon PostgreSQL for atomic catalog wipe transaction...');
  const sql = neon(process.env.DATABASE_URL);

  // Execute in sequence
  // Note: products has onDelete: cascade on product_images, product_variants, product_attribute_values
  console.log('Deleting from product_attribute_values...');
  await sql`DELETE FROM product_attribute_values`;

  console.log('Deleting from product_images...');
  await sql`DELETE FROM product_images`;

  console.log('Deleting from product_variants...');
  await sql`DELETE FROM product_variants`;

  console.log('Deleting from products...');
  await sql`DELETE FROM products`;

  // 4. Redis cache flush if configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = require('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      // Scan and delete catalog/product keys
      const keys = await redis.keys('*product*');
      if (keys && keys.length > 0) {
        await redis.del(...keys);
        console.log(`Cleared ${keys.length} product keys from Upstash Redis`);
      } else {
        console.log('No matching product keys in Upstash Redis');
      }
    } catch (rErr) {
      console.warn('Redis cache clear warning:', rErr.message);
    }
  }

  // 5. Verification queries
  console.log('\n=== POST-WIPE VERIFICATION ===');
  const [pCount] = await sql`SELECT count(*) FROM products`;
  const [piCount] = await sql`SELECT count(*) FROM product_images`;
  const [pvCount] = await sql`SELECT count(*) FROM product_variants`;
  const [paCount] = await sql`SELECT count(*) FROM product_attribute_values`;
  const [catCount] = await sql`SELECT count(*) FROM categories`;
  const [attrCount] = await sql`SELECT count(*) FROM master_attributes`;
  const [sizesCount] = await sql`SELECT count(*) FROM master_sizes`;
  const [usersCount] = await sql`SELECT count(*) FROM users`;

  console.log(`- Products: ${pCount.count} (MUST BE 0)`);
  console.log(`- Product Images: ${piCount.count} (MUST BE 0)`);
  console.log(`- Product Variants: ${pvCount.count} (MUST BE 0)`);
  console.log(`- Product Attributes: ${paCount.count} (MUST BE 0)`);
  console.log(`- Categories (Retained): ${catCount.count}`);
  console.log(`- Master Attributes (Retained): ${attrCount.count}`);
  console.log(`- Master Sizes (Retained): ${sizesCount.count}`);
  console.log(`- Users (Retained): ${usersCount.count}`);

  if (pCount.count !== '0' || piCount.count !== '0') {
    throw new Error(`Catalog wipe verification failed! Products: ${pCount.count}, Product Images: ${piCount.count}`);
  }

  console.log('\nSTEP 2 COMPLETE: Catalog successfully wiped and verified.\n');
}

runStep2().catch(err => {
  console.error('Step 2 error:', err);
  process.exit(1);
});
