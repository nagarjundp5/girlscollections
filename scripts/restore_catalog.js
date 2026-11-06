const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function restoreCatalog() {
  const backupDir = '/Users/nagarjundp/thegirlscollections/backups/catalog_backup_20261029';
  console.log(`=== RESTORING CATALOG FROM: ${backupDir} ===\n`);

  const pPath = path.join(backupDir, 'products.json');
  const piPath = path.join(backupDir, 'product_images.json');

  if (!fs.existsSync(pPath) || !fs.existsSync(piPath)) {
    throw new Error('Backup files not found!');
  }

  const products = JSON.parse(fs.readFileSync(pPath, 'utf-8'));
  const productImages = JSON.parse(fs.readFileSync(piPath, 'utf-8'));

  const sql = neon(process.env.DATABASE_URL);

  console.log(`Restoring ${products.length} products...`);
  for (const p of products) {
    await sql`
      INSERT INTO products (
        id, name, slug, description, price, compare_price, category, subcategory,
        gender, fit_type, images, sizes, stock, is_featured, paired_with,
        is_active, weight_grams, length_cm, breadth_cm, height_cm, units_sold,
        age_ranges, colours, fabric, occasion, style_silhouette, work_type,
        sleeve, neckline, length_type, set_type, care_instructions,
        is_custom_tailoring, seo_title, seo_description, created_at, updated_at
      ) VALUES (
        ${p.id}, ${p.name}, ${p.slug}, ${p.description}, ${p.price}, ${p.compare_price}, ${p.category}, ${p.subcategory},
        ${p.gender}, ${p.fit_type}, ${p.images}, ${p.sizes}, ${JSON.stringify(p.stock)}, ${p.is_featured}, ${p.paired_with},
        ${p.is_active}, ${p.weight_grams}, ${p.length_cm}, ${p.breadth_cm}, ${p.height_cm}, ${p.units_sold},
        ${p.age_ranges}, ${p.colours}, ${p.fabric}, ${p.occasion}, ${p.style_silhouette}, ${p.work_type},
        ${p.sleeve}, ${p.neckline}, ${p.length_type}, ${p.set_type}, ${p.care_instructions},
        ${p.is_custom_tailoring}, ${p.seo_title}, ${p.seo_description}, ${p.created_at}, ${p.updated_at}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  console.log(`Restoring ${productImages.length} product images...`);
  for (const pi of productImages) {
    await sql`
      INSERT INTO product_images (
        id, product_id, image_url, sort_order, alt_text, created_at
      ) VALUES (
        ${pi.id}, ${pi.product_id}, ${pi.image_url}, ${pi.sort_order}, ${pi.alt_text}, ${pi.created_at}
      )
      ON CONFLICT (id) DO NOTHING;
    `;
  }

  const [pCount] = await sql`SELECT count(*) FROM products`;
  const [piCount] = await sql`SELECT count(*) FROM product_images`;
  console.log(`\nRestore complete! Products in DB: ${pCount.count}, Product Images in DB: ${piCount.count}`);
}

restoreCatalog().catch(err => {
  console.error('Restore error:', err);
  process.exit(1);
});
