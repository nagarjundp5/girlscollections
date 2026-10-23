import { config } from 'dotenv';
config({ path: '.env.local' });
import { eq } from 'drizzle-orm';

interface SeedCategory {
  name: string;
  slug: string;
  parent_group: string;
  age_group: 'ladies' | 'kids' | 'unisex';
  sort_order: number;
}

const SEED_CATEGORIES: SeedCategory[] = [
  // ── LADIES ─────────────────────────────────────────────────────────────
  { name: 'All Kurta Sets', slug: 'all-kurta-sets', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 1 },
  { name: 'Anarkali Kurta Suit Set', slug: 'anarkali-kurta-suit-set', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 2 },
  { name: 'Straight Cut Kurta Suit Set', slug: 'straight-cut-kurta-suit-set', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 3 },
  { name: 'Palazzo Kurta Suit Set', slug: 'palazzo-kurta-suit-set', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 4 },
  { name: 'A-Line Kurta Set', slug: 'a-line-kurta-set', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 5 },
  { name: '2-Pc Kurta Set', slug: '2-pc-kurta-set', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 6 },
  { name: 'Long Jacket Kurta', slug: 'long-jacket-kurta', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 7 },
  { name: 'Only Kurta', slug: 'only-kurta', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 8 },
  { name: 'Western Short Kurti/Top', slug: 'western-short-kurti-top', parent_group: 'Kurta Sets', age_group: 'ladies', sort_order: 9 },

  { name: 'Co-ord Set', slug: 'co-ord-set', parent_group: 'Sets & Separates', age_group: 'ladies', sort_order: 10 },
  { name: 'Skirt and Top', slug: 'skirt-and-top', parent_group: 'Sets & Separates', age_group: 'ladies', sort_order: 11 },
  { name: 'Bottom Wear', slug: 'bottom-wear', parent_group: 'Sets & Separates', age_group: 'ladies', sort_order: 12 },

  { name: 'Single-Pc Long Anarkali', slug: 'single-pc-long-anarkali', parent_group: 'Gowns', age_group: 'ladies', sort_order: 13 },

  { name: 'Lehenga Blouse / Pattu Pavadai', slug: 'lehenga-blouse-pattu-pavadai', parent_group: 'Ethnic Blouse', age_group: 'ladies', sort_order: 14 },

  // ── KIDS ───────────────────────────────────────────────────────────────
  { name: 'Lehenga Blouse / Pattu Pavadai', slug: 'kids-lehenga-blouse-pattu-pavadai', parent_group: 'Ethnic Sets', age_group: 'kids', sort_order: 20 },
  { name: 'Cotton Lehenga Blouse / Cotton Pattu Pavadai', slug: 'kids-cotton-lehenga-pattu-pavadai', parent_group: 'Ethnic Sets', age_group: 'kids', sort_order: 21 },
  { name: 'Lehenga Davani/Lehengas', slug: 'kids-lehenga-davani', parent_group: 'Ethnic Sets', age_group: 'kids', sort_order: 22 },
  { name: 'Ghagra Choli', slug: 'kids-ghagra-choli', parent_group: 'Ethnic Sets', age_group: 'kids', sort_order: 23 },
  { name: 'Sharara Set', slug: 'kids-sharara-set', parent_group: 'Ethnic Sets', age_group: 'kids', sort_order: 24 },
  { name: 'Dhoti Set', slug: 'kids-dhoti-set', parent_group: 'Ethnic Sets', age_group: 'kids', sort_order: 25 },

  { name: 'Traditional Gown (1-Pc)', slug: 'kids-traditional-gown-1-pc', parent_group: 'Gowns', age_group: 'kids', sort_order: 26 },
  { name: 'Party Wear Gown', slug: 'kids-party-wear-gown', parent_group: 'Gowns', age_group: 'kids', sort_order: 27 },

  { name: 'Traditional Frock', slug: 'kids-traditional-frock', parent_group: 'Frocks', age_group: 'kids', sort_order: 28 },
  { name: 'Cotton/Daily Wear Frock', slug: 'kids-cotton-daily-frock', parent_group: 'Frocks', age_group: 'kids', sort_order: 29 },
  { name: 'Party Wear Frock', slug: 'kids-party-wear-frock', parent_group: 'Frocks', age_group: 'kids', sort_order: 30 },
  { name: 'Casual Frock', slug: 'kids-casual-frock', parent_group: 'Frocks', age_group: 'kids', sort_order: 31 },

  { name: 'Children Kurta Set', slug: 'children-kurta-set', parent_group: 'Kurta', age_group: 'kids', sort_order: 32 },
  { name: 'Children Only Kurta', slug: 'children-only-kurta', parent_group: 'Kurta', age_group: 'kids', sort_order: 33 },

  { name: 'Children Leggings', slug: 'children-leggings', parent_group: 'Western/Casual', age_group: 'kids', sort_order: 34 },
  { name: 'Crop Top with Palazzo (3-Pc Set)', slug: 'crop-top-palazzo-3-pc', parent_group: 'Western/Casual', age_group: 'kids', sort_order: 35 },
  { name: 'Western Skirt and Top', slug: 'kids-western-skirt-top', parent_group: 'Western/Casual', age_group: 'kids', sort_order: 36 },
  { name: 'Casual Palazzo Set', slug: 'casual-palazzo-set', parent_group: 'Western/Casual', age_group: 'kids', sort_order: 37 },
  { name: 'Bodycon Dress', slug: 'kids-bodycon-dress', parent_group: 'Western/Casual', age_group: 'kids', sort_order: 38 },
  { name: 'Denim Dress', slug: 'kids-denim-dress', parent_group: 'Western/Casual', age_group: 'kids', sort_order: 39 },
  { name: 'Children Co-ord Set', slug: 'children-co-ord-set', parent_group: 'Western/Casual', age_group: 'kids', sort_order: 40 },
];

async function seedCategories() {
  const { db } = await import('../src/db/index');
  const schema = await import('../src/db/schema');

  console.log('Seeding normalized categories into Neon Postgres...');
  console.log('ℹ Skipping "Children Saree" — brand policy excludes sarees.');

  for (const item of SEED_CATEGORIES) {
    const existing = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, item.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.categories).values({
        name: item.name,
        slug: item.slug,
        parent_group: item.parent_group,
        age_group: item.age_group,
        sort_order: item.sort_order,
        display_order: item.sort_order,
        is_active: true,
      });
      console.log(`✓ Seeded: [${item.age_group.toUpperCase()}] ${item.parent_group} -> ${item.name} (${item.slug})`);
    } else {
      await db.update(schema.categories).set({
        name: item.name,
        parent_group: item.parent_group,
        age_group: item.age_group,
        sort_order: item.sort_order,
        display_order: item.sort_order,
        is_active: true,
        updated_at: new Date(),
      }).where(eq(schema.categories.slug, item.slug));
      console.log(`✓ Updated: [${item.age_group.toUpperCase()}] ${item.parent_group} -> ${item.name} (${item.slug})`);
    }
  }

  console.log(`\nSuccessfully seeded ${SEED_CATEGORIES.length} categories!`);
}

seedCategories().catch((err) => {
  console.error('Seeding categories failed:', err);
  process.exit(1);
});
