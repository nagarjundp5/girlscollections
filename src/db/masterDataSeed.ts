import { db } from './index';
import { masterSizes, masterAttributes } from './schema';
import {
  WOMEN_MASTER_SIZES,
  KIDS_MASTER_SIZES,
  MASTER_ATTRIBUTES_SEED,
  type MasterSizeDefinition,
} from '@/data/masterSizes';

export {
  WOMEN_MASTER_SIZES,
  KIDS_MASTER_SIZES,
  MASTER_ATTRIBUTES_SEED,
  type MasterSizeDefinition,
};

export async function seedMasterData() {
  console.log('Seeding Master Sizes and Attributes...');
  
  // Seed Women & Kids sizes
  const allSizes = [...WOMEN_MASTER_SIZES, ...KIDS_MASTER_SIZES];
  for (const size of allSizes) {
    try {
      await db.insert(masterSizes).values({
        division: size.division,
        code: size.code,
        label: size.label,
        numeric_size: size.numeric_size || null,
        age_range: size.age_range || null,
        sort_order: size.sort_order,
        measurements: size.measurements,
        is_active: true,
      }).onConflictDoNothing();
    } catch (e) {
      console.warn(`Size ${size.code} seed skipped or already exists`);
    }
  }

  // Seed Attributes
  for (const attr of MASTER_ATTRIBUTES_SEED) {
    try {
      await db.insert(masterAttributes).values({
        type: attr.type as any,
        name: attr.name,
        slug: attr.slug,
        hex_code: (attr as any).hex_code || null,
        sort_order: attr.sort_order,
        is_active: true,
      }).onConflictDoNothing();
    } catch (e) {
      console.warn(`Attribute ${attr.slug} seed skipped`);
    }
  }

  console.log('Master Data Seed Completed Successfully.');
}
