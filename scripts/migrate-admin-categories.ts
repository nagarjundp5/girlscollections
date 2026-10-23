import { config } from 'dotenv';
config({ path: '.env.local' });
import { eq } from 'drizzle-orm';

async function migrateAdminCategories() {
  const { db } = await import('../src/db/index');
  const schema = await import('../src/db/schema');
  console.log('Starting Admin Product-Categorization Migration...');

  // 1. Define clean Garment-Type Categories (No age in name, No sarees)
  const cleanCategories = [
    { name: 'Co-ord Set', slug: 'co-ord-set', description: 'Handloom cotton, silk & festive co-ord sets' },
    { name: 'Indo-Western Gown', slug: 'indo-western-gown', description: 'Modern Indo-Western fusion gowns & dresses' },
    { name: 'Lehenga Choli', slug: 'lehenga-choli', description: 'Royal designer & traditional lehenga ensembles' },
    { name: 'Kurta & Dhoti', slug: 'kurta-dhoti', description: 'Traditional kurta sets & dhoti pairings' },
    { name: 'Pattu Frock', slug: 'pattu-frock', description: 'Silk pattu frocks and traditional dresses' },
    { name: 'Kurti & Tunic', slug: 'kurti-tunic', description: 'Embroidered kurtis, tunics and tops' },
    { name: 'Anarkali', slug: 'anarkali', description: 'Royal flared Anarkali suit sets' },
    { name: 'Sharara', slug: 'sharara', description: 'Playful tiered shararas and palazzo sets' },
  ];

  // Upsert clean categories into DB
  for (let i = 0; i < cleanCategories.length; i++) {
    const cat = cleanCategories[i];
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, cat.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.categories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        is_active: true,
        display_order: i + 1,
      });
      console.log(`✓ Inserted category: ${cat.name} (${cat.slug})`);
    } else {
      await db.update(schema.categories).set({
        name: cat.name,
        description: cat.description,
        is_active: true,
        display_order: i + 1,
        updated_at: new Date(),
      }).where(eq(schema.categories.slug, cat.slug));
      console.log(`✓ Updated category: ${cat.name} (${cat.slug})`);
    }
  }

  // 2. Remove "sarees" category if present
  await db.delete(schema.categories).where(eq(schema.categories.slug, 'sarees'));
  console.log('✓ Removed "sarees" category from categories table');

  // Also remove old age-encoded category slugs from categories table if they exist
  const legacySlugs = ['kids-lehenga', 'kids-kurta', 'pattu-frocks', 'lehengas', 'kurtis', 'indo-western', 'co-ords'];
  for (const legacySlug of legacySlugs) {
    await db.delete(schema.categories).where(eq(schema.categories.slug, legacySlug));
  }

  // 3. Migrate existing Products
  const allProducts = await db.select().from(schema.products);
  console.log(`Processing ${allProducts.length} products for categorization & image reset...`);

  for (const prod of allProducts) {
    let newCategory = prod.category;
    let newGender = prod.gender;
    let isActive = prod.is_active;
    let notes = prod.notes || '';

    // Category & Age-Group mapping
    if (prod.category === 'sarees') {
      newCategory = 'lehenga-choli'; // fallback garment type
      isActive = false; // Flag for manual review
      notes = (notes ? notes + ' | ' : '') + 'Flagged for manual review: Sarees category removed.';
      console.log(`⚠ Product "${prod.name}" (${prod.id}) was tagged as Sarees. Flagged inactive for manual review.`);
    } else if (prod.category === 'kids-lehenga' || prod.category === 'kids-lehenga-blouse-or-pattu-pavadai') {
      newCategory = 'lehenga-choli';
      newGender = 'kids';
    } else if (prod.category === 'kids-kurta' || prod.category === 'children-kurta-sets') {
      newCategory = 'kurta-dhoti';
      newGender = 'kids';
    } else if (prod.category === 'pattu-frocks' || prod.category === 'pattu-frock') {
      newCategory = 'pattu-frock';
      newGender = 'kids';
    } else if (prod.category === 'lehengas') {
      newCategory = 'lehenga-choli';
      if (!newGender) newGender = 'women';
    } else if (prod.category === 'kurtis' || prod.category === 'all-kurta-sets') {
      newCategory = 'kurti-tunic';
      if (!newGender) newGender = 'women';
    } else if (prod.category === 'indo-western') {
      newCategory = 'indo-western-gown';
      if (!newGender) newGender = 'women';
    } else if (prod.category === 'co-ords') {
      newCategory = 'co-ord-set';
      if (!newGender) newGender = 'women';
    }

    // Default gender if empty or invalid
    if (!['women', 'kids', 'unisex'].includes(newGender)) {
      newGender = 'women';
    }

    // Clear sample photos so user can upload real client clothes images via admin panel
    await db.update(schema.products).set({
      category: newCategory,
      gender: newGender,
      images: [], // Clear product image array
      is_active: isActive,
      notes: notes,
      updated_at: new Date(),
    }).where(eq(schema.products.id, prod.id));

    // Also delete rows from product_images table for this product
    await db.delete(schema.productImages).where(eq(schema.productImages.product_id, prod.id));
  }

  console.log('✓ Migration completed successfully!');
}

migrateAdminCategories().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
