import { db } from './src/db/index';
import * as schema from './src/db/schema';
import { MOCK_PRODUCTS } from './src/data/shopData';
import { eq } from 'drizzle-orm';

async function seedCatalog() {
  console.log('Seeding categories into Neon Postgres...');

  const categoryList = [
    { name: 'Sarees & Drapes', slug: 'sarees', description: 'Handcrafted sarees and elegant drapes' },
    { name: 'Lehenga Cholis', slug: 'lehengas', description: 'Royal designer lehengas' },
    { name: 'Kurtis & Tunics', slug: 'kurtis', description: 'Embroidered kurtis and festive tunics' },
    { name: 'Pattu Frocks', slug: 'pattu-frocks', description: 'Silk pattu frocks for kids' },
    { name: 'Boys Kurta & Dhoti', slug: 'kids-kurta', description: 'Traditional boy kurta sets' },
    { name: 'Girls Lehengas', slug: 'kids-lehenga', description: 'Twirl-worthy kids lehengas' },
    { name: 'Indo-Western Gowns', slug: 'indo-western', description: 'Modern Indo-Western fusion wear' },
    { name: 'Co-ord Sets', slug: 'co-ords', description: 'Handloom cotton & silk co-ord sets' },
  ];

  for (let i = 0; i < categoryList.length; i++) {
    const cat = categoryList[i];
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, cat.slug)).limit(1);
    if (existing.length === 0) {
      await db.insert(schema.categories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        is_active: true,
        display_order: i + 1,
      });
      console.log(`Created category: ${cat.name}`);
    }
  }

  console.log('Seeding products into Neon Postgres...');

  for (const prod of MOCK_PRODUCTS) {
    const existing = await db.select().from(schema.products).where(eq(schema.products.slug, prod.slug)).limit(1);
    
    // stock object mapping
    const stockMap: Record<string, number> = {};
    for (const s of prod.sizes) {
      stockMap[s.size] = s.inStock ? 15 : 0;
    }

    const priceInPaise = prod.price * 100;
    const comparePriceInPaise = prod.originalPrice ? prod.originalPrice * 100 : undefined;

    if (existing.length === 0) {
      const [insertedProduct] = await db.insert(schema.products).values({
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: priceInPaise,
        compare_price: comparePriceInPaise,
        category: prod.category,
        subcategory: prod.subcategory,
        gender: prod.target === 'women' ? 'women' : 'kids',
        images: prod.images,
        sizes: prod.sizes.map((s) => s.size),
        stock_quantity: stockMap,
        is_featured: prod.isBestSeller || prod.isNew || false,
        is_active: true,
        weight_grams: 500,
      }).returning();

      // Insert product images
      for (let idx = 0; idx < prod.images.length; idx++) {
        await db.insert(schema.productImages).values({
          product_id: insertedProduct.id,
          image_url: prod.images[idx],
          sort_order: idx,
        });
      }

      console.log(`Created product: ${prod.name} (${insertedProduct.id})`);
    } else {
      console.log(`Product already exists: ${prod.name}`);
    }
  }

  console.log('Catalog seeding complete!');
  process.exit(0);
}

seedCatalog().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
