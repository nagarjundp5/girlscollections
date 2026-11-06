const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// Configuration
const BATCH_ID = 'batch-20261105';
const CONCURRENCY = 4;
const MAX_RETRIES = 3;
const STATE_FILE = path.join(__dirname, '..', 'proper_order_upload_state.json');
const GROUPS_FILE = path.join(__dirname, '..', 'proper_order_groups.json');

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function calculateFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Failed to parse state file, starting fresh:', e.message);
    }
  }
  return { uploadedImages: {}, createdProducts: {} };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

async function uploadImageWithRetry(filePath, folder, publicIdTarget, hash, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const uploadOptions = {
        folder: folder,
        public_id: publicIdTarget,
        overwrite: false,
        transformation: [
          { width: 2000, height: 2000, crop: 'limit' },
        ],
        flags: 'strip_profile',
      };

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        hash: hash,
      };
    } catch (error) {
      console.warn(`[Upload Attempt ${attempt}/${retries} Failed] ${path.basename(filePath)}:`, error.message);
      if (attempt === retries) {
        throw error;
      }
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Simple worker pool for concurrency
async function runPool(tasks, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function runUploadAndImport() {
  console.log('=== CLOUDINARY UPLOAD & PRODUCT IMPORT (103 PRODUCTS) ===\n');

  if (!fs.existsSync(GROUPS_FILE)) {
    throw new Error(`Groups file not found at: ${GROUPS_FILE}`);
  }

  const groups = JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf-8'));
  console.log(`Loaded ${groups.length} product groups (${groups.length * 4} total images) from ${GROUPS_FILE}.`);

  const state = loadState();
  const sql = neon(process.env.DATABASE_URL);

  // 1. Prepare image upload tasks
  const allImages = [];
  for (const g of groups) {
    for (const img of g.images) {
      allImages.push({
        groupIndex: g.group_index,
        productNo: g.product_no,
        productName: g.product_name,
        slug: `product-import2-${g.product_no}`,
        importKey: `import_${BATCH_ID}_${g.product_no}`,
        order: img.order,
        role: img.role,
        filename: img.filename,
        filepath: path.join(__dirname, '..', img.filepath),
      });
    }
  }

  console.log(`\nVerifying file hashes and scheduling uploads (Concurrency: ${CONCURRENCY})...`);
  let uploadTasksCount = 0;
  let reusedCount = 0;

  const uploadTasks = allImages.map((item, idx) => async () => {
    const hash = calculateFileHash(item.filepath);
    const targetFolder = `products/${BATCH_ID}/${item.productNo}`;
    const targetPublicId = `img_${item.order}`;

    // Check if already uploaded and saved in state
    if (state.uploadedImages[hash]) {
      reusedCount++;
      process.stdout.write(`[Cached ${idx + 1}/${allImages.length}] Product ${item.productNo} Img ${item.order}\n`);
      return { ...item, ...state.uploadedImages[hash] };
    }

    uploadTasksCount++;
    const res = await uploadImageWithRetry(item.filepath, targetFolder, targetPublicId, hash);
    state.uploadedImages[hash] = res;
    saveState(state); // Save progress immediately for crash resiliency

    console.log(`[Uploaded ${idx + 1}/${allImages.length}] Product ${item.productNo} Img ${item.order} -> ${res.public_id} (${res.width}x${res.height}, ${Math.round(res.bytes / 1024)} KB)`);
    return { ...item, ...res };
  });

  const uploadResults = await runPool(uploadTasks, CONCURRENCY);
  console.log(`\nUpload phase complete! Uploaded: ${uploadTasksCount}, Reused from cache: ${reusedCount}.`);

  // Map upload results by product
  const productUploadMap = {};
  for (const r of uploadResults) {
    if (!productUploadMap[r.productNo]) {
      productUploadMap[r.productNo] = [];
    }
    productUploadMap[r.productNo].push(r);
  }

  // 2. Database Creation Phase
  console.log('\nCreating/Updating DRAFT products in Neon Database...');
  let createdCount = 0;
  let updatedCount = 0;

  for (const g of groups) {
    const productNo = g.product_no;
    const prodItems = (productUploadMap[productNo] || []).sort((a, b) => a.order - b.order);
    const imageUrls = prodItems.map((p) => p.secure_url);
    const importKey = `import_${BATCH_ID}_${productNo}`;
    const slug = `product-import2-${productNo}`;
    const name = `Product ${productNo}`;

    // Check if product already exists by import_key
    const existing = await sql`
      SELECT id, name, slug FROM products WHERE import_key = ${importKey} LIMIT 1
    `;

    let productId;
    if (existing.length > 0) {
      productId = existing[0].id;
      updatedCount++;
      // Update image array
      await sql`
        UPDATE products 
        SET images = ${imageUrls}, updated_at = NOW()
        WHERE id = ${productId}
      `;
    } else {
      // Insert product as DRAFT
      const [newProd] = await sql`
        INSERT INTO products (
          name, slug, description, price, compare_price, category, subcategory,
          gender, fit_type, images, sizes, stock, is_featured, is_active,
          weight_grams, import_key, created_at, updated_at
        ) VALUES (
          ${name},
          ${slug},
          'Imported draft product. Pending title, description, category, and pricing updates.',
          0,
          NULL,
          '',
          NULL,
          'women',
          'regular',
          ${imageUrls},
          ARRAY[]::text[],
          '{}'::jsonb,
          false,
          false,
          500,
          ${importKey},
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      productId = newProd.id;
      createdCount++;
    }

    // Insert or update product_images table
    for (const item of prodItems) {
      const altText = `${name} - Image ${item.order}`;
      // Clean previous images for this product and order to avoid duplicate rows
      await sql`
        DELETE FROM product_images 
        WHERE product_id = ${productId} AND sort_order = ${item.order}
      `;

      await sql`
        INSERT INTO product_images (
          product_id, image_url, public_id, width, height, file_hash, sort_order, alt_text, created_at
        ) VALUES (
          ${productId},
          ${item.secure_url},
          ${item.public_id},
          ${item.width},
          ${item.height},
          ${item.hash},
          ${item.order},
          ${altText},
          NOW()
        )
      `;
    }

    state.createdProducts[productNo] = {
      productId,
      importKey,
      slug,
      name,
      imageCount: prodItems.length,
    };
    saveState(state);
  }

  // 3. Clear Redis Caches
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = require('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const keys = await redis.keys('*product*');
      if (keys && keys.length > 0) {
        await redis.del(...keys);
        console.log(`Flushed ${keys.length} product cache keys from Upstash Redis`);
      }
    } catch (e) {
      console.warn('Redis flush notice:', e.message);
    }
  }

  // 4. Verification summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  const [totalProducts] = await sql`SELECT count(*) FROM products`;
  const [totalDrafts] = await sql`SELECT count(*) FROM products WHERE is_active = false`;
  const [batchDrafts] = await sql`SELECT count(*) FROM products WHERE import_key LIKE ${'import_' + BATCH_ID + '_%'}`;
  const [totalImagesInDb] = await sql`SELECT count(*) FROM product_images`;

  console.log(`- Total Products in Database: ${totalProducts.count}`);
  console.log(`- Newly Created Drafts in this batch: ${createdCount}`);
  console.log(`- Pre-existing Drafts Updated: ${updatedCount}`);
  console.log(`- Total Batch Products in DB: ${batchDrafts.count} (Expected: 103)`);
  console.log(`- Total Inactive/Drafts in DB: ${totalDrafts.count}`);
  console.log(`- Total Images in Database: ${totalImagesInDb.count}`);

  console.log('\nSUCCESSFULLY UPLOADED TO CLOUDINARY & IMPORTED TO DB!\n');
}

runUploadAndImport().catch((err) => {
  console.error('Upload and import failed:', err);
  process.exit(1);
});

