import { db } from './src/db/index.js';
import * as schema from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  const products = await db.select().from(schema.products).where(eq(schema.products.slug, 'boss'));
  console.log(products[0].sizes);
  process.exit(0);
}
main();
