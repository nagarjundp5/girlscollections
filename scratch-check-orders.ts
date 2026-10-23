import { db } from './src/db/index.js';
import * as schema from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  const pImgs = await db.select().from(schema.productImages);
  console.log('Total product images:', pImgs.length);
  for (const img of pImgs) {
    console.log(`Product ID: ${img.product_id}, URL: ${img.image_url}`);
  }
  process.exit(0);
}
main();
