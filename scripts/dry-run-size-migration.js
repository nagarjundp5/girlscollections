const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const LEGACY_KIDS_SIZE_MAP = {
  '0-3M': 'k12',
  '3-6M': 'k12',
  '6-12M': 'k14',
  '1-2Y': 'k16',
  '2-3Y': 'k18',
  '3-4Y': 'k20',
  '4-5Y': 'k22',
  '5-6Y': 'k24',
  '6-7Y': 'k26',
  '7-8Y': 'k28',
  '8-9Y': 'k30',
  '8-10Y': 'k30',
  '9-10Y': 'k32',
  '10-11Y': 'k34',
  '10-12Y': 'k34',
  '11-12Y': 'k36',
  '12-13Y': 'k38',
  '12-14Y': 'k38',
  '13-14Y': 'k38',
  '14-15Y': 'k38',
  '15-16Y': 'k40',
  '12': 'k12',
  '14': 'k14',
  '16': 'k16',
  '18': 'k18',
  '20': 'k20',
  '22': 'k22',
  '24': 'k24',
  '26': 'k26',
  '28': 'k28',
  '30': 'k30',
  '32': 'k32',
  '34': 'k34',
  '36': 'k36',
  '38': 'k38',
  '40': 'k40',
};

async function dryRun() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT id, name, slug, gender, price, compare_price, sizes, stock FROM products');
    console.log(`Loaded ${res.rows.length} products from DB.`);

    const mappingCounts = {};
    let kidsProductsCount = 0;
    let emptySizesCount = 0;
    let womenProductsCount = 0;
    const sampleMappings = [];

    for (const prod of res.rows) {
      const isKids = prod.gender === 'kids' || (prod.sizes && prod.sizes.some(s => s.includes('Y') || s.includes('M')));
      const sizes = Array.isArray(prod.sizes) ? prod.sizes : [];

      if (sizes.length === 0) {
        emptySizesCount++;
        continue;
      }

      if (isKids) {
        kidsProductsCount++;
        const mappedSizes = [];
        for (const s of sizes) {
          const newCode = LEGACY_KIDS_SIZE_MAP[s] || s;
          mappingCounts[`${s} -> ${newCode}`] = (mappingCounts[`${s} -> ${newCode}`] || 0) + 1;
          mappedSizes.push(newCode);
        }
        if (sampleMappings.length < 5) {
          sampleMappings.push({
            name: prod.name,
            oldSizes: sizes,
            newSizes: mappedSizes
          });
        }
      } else {
        womenProductsCount++;
      }
    }

    console.log('\n--- DRY RUN SUMMARY ---');
    console.log('Total Products:', res.rows.length);
    console.log('Kids Products to Map:', kidsProductsCount);
    console.log('Women Products:', womenProductsCount);
    console.log('Products without sizes (will get Free Size):', emptySizesCount);
    console.log('\nSize Mappings Applied (Old -> New):');
    console.table(mappingCounts);
    console.log('\nSample Kids Products Mapped:');
    console.log(JSON.stringify(sampleMappings, null, 2));

  } finally {
    await pool.end();
  }
}

dryRun().catch(console.error);

