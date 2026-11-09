import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is missing in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(process.cwd(), '..', 'tgc_stock_backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, `stock_backup_${timestamp}.json`);
  console.log(`Creating backup at ${backupPath}...`);

  const sizes = await sql`SELECT id, product_id, size_key, price, mrp, stock, is_active FROM product_sizes;`;

  const backupData = {
    timestamp: new Date().toISOString(),
    totalSizes: sizes.length,
    sizes,
  };

  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`✓ Backup successfully created with ${sizes.length} size records at: ${backupPath}`);
  return backupPath;
}

async function setAllStockToOne() {
  const backupPath = await createBackup();

  console.log('\nSetting stock = 1 for all sizes in product_sizes...');

  const result = await sql`
    UPDATE product_sizes
    SET stock = 1
    RETURNING id;
  `;

  console.log(`✓ Successfully updated ${result.length} size records to stock = 1!`);

  // Verify
  const [audit] = await sql`
    SELECT 
      count(*)::int as total_rows,
      count(*) FILTER (WHERE stock = 1)::int as rows_with_stock_1,
      count(*) FILTER (WHERE stock != 1)::int as rows_with_other_stock
    FROM product_sizes;
  `;

  console.log('\nVerification Summary:');
  console.log(`- Total product_sizes: ${audit.total_rows}`);
  console.log(`- Sizes with stock = 1: ${audit.rows_with_stock_1}`);
  console.log(`- Sizes with other stock: ${audit.rows_with_other_stock}`);
  console.log(`\nRestore command if needed:\nnpx tsx scripts/stock-manager.ts restore "${backupPath}"`);
}

async function restoreStock(backupFilePath: string) {
  if (!fs.existsSync(backupFilePath)) {
    console.error(`Backup file not found: ${backupFilePath}`);
    return;
  }

  const raw = fs.readFileSync(backupFilePath, 'utf-8');
  const backup = JSON.parse(raw);

  console.log(`Restoring stock from ${backupFilePath} (${backup.sizes.length} records)...`);

  for (const s of backup.sizes) {
    await sql`
      UPDATE product_sizes
      SET stock = ${s.stock}
      WHERE id = ${s.id};
    `;
  }

  console.log(`✓ Stock successfully restored!`);
}

async function main() {
  const mode = process.argv[2] || 'set-one';

  if (mode === 'restore') {
    const file = process.argv[3];
    if (!file) {
      console.error('Specify file path to restore');
      process.exit(1);
    }
    await restoreStock(file);
  } else {
    await setAllStockToOne();
  }
}

main().catch(console.error);
