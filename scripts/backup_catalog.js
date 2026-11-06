const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

function extractCloudinaryPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  // e.g. https://res.cloudinary.com/lt3ga2by/image/upload/f_auto,q_auto/v1788754756/tgc/products/hp96ipuhnhtcidca3cdm.webp
  const match = url.match(/\/upload\/(?:[^\/]+\/)*(?:v\d+\/)?(tgc\/products\/[^.]+)(?:\.[a-zA-Z0-9]+)?$/);
  if (match && match[1]) {
    return match[1];
  }
  // Fallback for any product asset
  const generalMatch = url.match(/\/upload\/(?:[^\/]+\/)*(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return generalMatch ? generalMatch[1] : null;
}

async function runBackup() {
  const backupDir = '/Users/nagarjundp/thegirlscollections/backups/catalog_backup_20261029';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('Querying database tables for backup...');
  const [
    productsRows,
    productImagesRows,
    variantsRows,
    attrValuesRows,
    ordersRows
  ] = await Promise.all([
    sql`SELECT * FROM products ORDER BY created_at ASC`,
    sql`SELECT * FROM product_images ORDER BY created_at ASC`,
    sql`SELECT * FROM product_variants ORDER BY created_at ASC`,
    sql`SELECT * FROM product_attribute_values ORDER BY created_at ASC`,
    sql`SELECT * FROM orders ORDER BY created_at ASC`,
  ]);

  // Count orders referencing products
  const productIdsSet = new Set(productsRows.map(p => p.id));
  let ordersReferencingProductsCount = 0;
  for (const o of ordersRows) {
    const items = Array.isArray(o.items) ? o.items : [];
    const hasProductRef = items.some(item => productIdsSet.has(item.id));
    if (hasProductRef) ordersReferencingProductsCount++;
  }

  // Extract Cloudinary public IDs
  const publicIdsSet = new Set();
  for (const p of productsRows) {
    const imgs = Array.isArray(p.images) ? p.images : [];
    for (const imgUrl of imgs) {
      const pid = extractCloudinaryPublicId(imgUrl);
      if (pid) publicIdsSet.add(pid);
    }
  }
  for (const pi of productImagesRows) {
    const pid = extractCloudinaryPublicId(pi.image_url);
    if (pid) publicIdsSet.add(pid);
  }

  const cloudinaryList = Array.from(publicIdsSet).sort();

  // Write files
  const filesToWrite = [
    { filename: 'products.json', data: productsRows },
    { filename: 'product_images.json', data: productImagesRows },
    { filename: 'product_variants.json', data: variantsRows },
    { filename: 'product_attribute_values.json', data: attrValuesRows },
    { filename: 'orders_snapshot.json', data: ordersRows },
    { filename: 'cloudinary_product_public_ids.json', data: cloudinaryList },
  ];

  const results = [];
  for (const item of filesToWrite) {
    const filePath = path.join(backupDir, item.filename);
    const content = JSON.stringify(item.data, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
    const stat = fs.statSync(filePath);
    results.push({
      file: filePath,
      sizeBytes: stat.size,
      rows: Array.isArray(item.data) ? item.data.length : 0,
    });
  }

  console.log('\n================ BACKUP SUMMARY ================');
  console.log(`Backup Location (OUTSIDE REPO): ${backupDir}`);
  for (const r of results) {
    console.log(`- ${path.basename(r.file)}: ${r.sizeBytes} bytes, ${r.rows} records`);
  }
  console.log('================================================');
  console.log(`\nRow counts for what the wipe would affect:`);
  console.log(`- Products to delete: ${productsRows.length}`);
  console.log(`- Product Variants to delete: ${variantsRows.length}`);
  console.log(`- Sizes / Stock records to delete: ${productsRows.length} (embedded in products.stock_quantity JSONB)`);
  console.log(`- Product Images to delete: ${productImagesRows.length}`);
  console.log(`- Product-filter attribute links to delete: ${attrValuesRows.length}`);
  console.log(`- Orders in system: ${ordersRows.length}`);
  console.log(`- Orders referencing catalog products: ${ordersReferencingProductsCount}`);
  console.log(`- Cloudinary product public_ids targeted for removal: ${cloudinaryList.length}`);
  console.log('================================================\n');
}

runBackup().catch(err => {
  console.error('Backup error:', err);
  process.exit(1);
});
