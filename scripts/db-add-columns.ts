import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from 'drizzle-orm';

async function migrateDbColumns() {
  const { db } = await import('../src/db/index');
  console.log('Running ALTER TABLE migrations on Neon Postgres...');

  await db.execute(sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_group text;`);
  console.log('✓ Added parent_group to categories table');

  await db.execute(sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS age_group text NOT NULL DEFAULT 'ladies';`);
  console.log('✓ Added age_group to categories table');

  await db.execute(sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;`);
  console.log('✓ Added sort_order to categories table');

  await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS fit_type text NOT NULL DEFAULT 'regular';`);
  console.log('✓ Added fit_type to products table');

  console.log('✓ DB Columns migration completed!');
}

migrateDbColumns().catch((err) => {
  console.error('DB Migration failed:', err);
  process.exit(1);
});
