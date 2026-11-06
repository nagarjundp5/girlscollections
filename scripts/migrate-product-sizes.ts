import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

const LEGACY_KIDS_SIZE_MAP: Record<string, string> = {
  '1-2Y': 'k16', // 1.5 years (Size 16)
  '2-3Y': 'k18', // 2 years (Size 18)
  '3-4Y': 'k20', // 3 years (Size 20)
  '4-5Y': 'k22', // 4 years (Size 22)
  '5-6Y': 'k24', // 5 years (Size 24)
  '6-7Y': 'k26', // 6 years (Size 26)
  '7-8Y': 'k28', // 7 years (Size 28)
};

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Product Sizes & Price Groups Migration ---');
    await client.query('BEGIN');

    // 1. Create product_price_groups table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_price_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        mrp INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS product_price_groups_product_id_idx ON product_price_groups(product_id);
    `);
    console.log('✓ Table product_price_groups ensured');

    // 2. Create product_sizes table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        size_key TEXT NOT NULL,
        price INTEGER NOT NULL,
        mrp INTEGER,
        stock INTEGER NOT NULL DEFAULT 0,
        sku TEXT,
        price_group_id UUID REFERENCES product_price_groups(id) ON DELETE SET NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT product_sizes_product_id_size_key_unique UNIQUE (product_id, size_key)
      );
      CREATE INDEX IF NOT EXISTS product_sizes_product_id_idx ON product_sizes(product_id);
      CREATE INDEX IF NOT EXISTS product_sizes_size_key_idx ON product_sizes(size_key);
      CREATE INDEX IF NOT EXISTS product_sizes_price_group_id_idx ON product_sizes(price_group_id);
    `);
    console.log('✓ Table product_sizes ensured');

    // 3. Backup existing products sizes/prices to backup table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _backup_products_sizes_pricing AS
      SELECT id, name, gender, sizes, price, compare_price, stock, updated_at
      FROM products;
    `);
    console.log('✓ Backup table _backup_products_sizes_pricing ensured');

    // 4. Fetch all existing products
    const res = await client.query(`
      SELECT id, name, gender, sizes, price, compare_price, stock
      FROM products
    `);

    const products = res.rows;
    console.log(`Fetched ${products.length} products to migrate.`);

    let insertedSizes = 0;
    let mappedKidsCount = 0;
    let freeSizeCount = 0;

    for (const prod of products) {
      const isKids = prod.gender === 'kids';
      let rawSizes: string[] = [];
      if (Array.isArray(prod.sizes)) {
        rawSizes = prod.sizes;
      }

      // Check if product already has product_sizes rows
      const existingSizesRes = await client.query(
        'SELECT count(*) FROM product_sizes WHERE product_id = $1',
        [prod.id]
      );
      if (parseInt(existingSizesRes.rows[0].count) > 0) {
        continue; // Already migrated
      }

      const stockMap = prod.stock || {};
      const prodPrice = prod.price || 0;
      const prodMrp = prod.compare_price || null;

      if (rawSizes.length === 0) {
        // Give Free Size row
        await client.query(`
          INSERT INTO product_sizes (product_id, size_key, price, mrp, stock, sort)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (product_id, size_key) DO NOTHING
        `, [prod.id, 'FREE SIZE', prodPrice, prodMrp, 10, 0]);
        insertedSizes++;
        freeSizeCount++;
      } else {
        let sortOrder = 0;
        for (const s of rawSizes) {
          let targetKey = s;
          if (isKids && LEGACY_KIDS_SIZE_MAP[s]) {
            targetKey = LEGACY_KIDS_SIZE_MAP[s];
            mappedKidsCount++;
          }
          const stock = typeof stockMap[s] === 'number' ? stockMap[s] : (typeof stockMap[targetKey] === 'number' ? stockMap[targetKey] : 5);

          await client.query(`
            INSERT INTO product_sizes (product_id, size_key, price, mrp, stock, sort)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (product_id, size_key) DO UPDATE
            SET stock = EXCLUDED.stock, price = EXCLUDED.price, mrp = EXCLUDED.mrp
          `, [prod.id, targetKey, prodPrice, prodMrp, stock, sortOrder++]);
          insertedSizes++;
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✓ Migration completed! Inserted/Updated ${insertedSizes} product_size records.`);
    console.log(`- Mapped ${mappedKidsCount} kids sizes to k16-k28`);
    console.log(`- Added FREE SIZE to ${freeSizeCount} products without sizes`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed, rolled back:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

