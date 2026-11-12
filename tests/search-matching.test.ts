import { matchProducts, normalizeQuery, damerauLevenshtein, SearchableItem } from '../src/lib/search/match';
import { getSynonym } from '../src/lib/search/synonyms';

// Test mock catalog
const mockCatalog: SearchableItem[] = [
  {
    id: 'p1',
    slug: 'gulmohar-blush-organza-anarkali',
    name: 'Gulmohar Blush Organza Anarkali Set',
    category: 'anarkalis',
    categoryName: 'Anarkali Suit Sets',
    target: 'women',
    colour: 'Pink',
    fabric: 'Organza',
    occasion: 'Festive',
    inStock: true,
  },
  {
    id: 'p2',
    slug: 'emerald-green-bridal-lehenga',
    name: 'Emerald Green Bridal Zari Lehenga Choli',
    category: 'lehengas',
    categoryName: 'Lehenga Cholis',
    target: 'women',
    colour: 'Green',
    fabric: 'Silk',
    occasion: 'Wedding',
    inStock: true,
  },
  {
    id: 'p3',
    slug: 'festive-chanderi-silk-kurta',
    name: 'Festive Chanderi Silk Kurta Tunic',
    category: 'kurtis',
    categoryName: 'Kurtis & Tunics',
    target: 'women',
    colour: 'Yellow',
    fabric: 'Chanderi',
    occasion: 'Festive',
    inStock: true,
  },
  {
    id: 'p4',
    slug: 'aadhya-kids-pattu-frock',
    name: 'Aadhya Traditional Pattu Frock Dress',
    category: 'pattu-frocks',
    categoryName: 'Pattu Frocks',
    target: 'kids',
    colour: 'Red',
    fabric: 'Pattu Silk',
    occasion: 'Festive',
    inStock: true,
  },
  {
    id: 'p5',
    slug: 'western-velvet-bodycon-dress',
    name: 'Western Velvet Bodycon Dress',
    category: 'bodycon-dresses',
    categoryName: 'Western Bodycon',
    target: 'women',
    colour: 'Black',
    fabric: 'Velvet',
    occasion: 'Party',
    inStock: true,
  },
  {
    id: 'p6',
    slug: 'designer-skirt-and-top-set',
    name: 'Designer Crop Top and Skirt Set',
    category: 'skirt-and-top',
    categoryName: 'Skirt and Top',
    target: 'women',
    colour: 'Teal',
    fabric: 'Georgette',
    occasion: 'Party',
    inStock: true,
  },
  {
    id: 'p7',
    slug: 'floral-summer-coord-set',
    name: 'Floral Print Summer Co-ord Set',
    category: 'coord-set',
    categoryName: 'Co-ord Sets',
    target: 'women',
    colour: 'Blue',
    fabric: 'Cotton',
    occasion: 'Casual',
    inStock: true,
  },
  {
    id: 'p8',
    slug: 'kids-pattu-pavadai-langa',
    name: 'Pure Kanjeevaram Pattu Pavadai Langa',
    category: 'pattu-pavadai',
    categoryName: 'Pattu Pavadai',
    target: 'kids',
    colour: 'Gold',
    fabric: 'Silk',
    occasion: 'Festive',
    inStock: true,
  },
];

function runTests() {
  console.log('--- RUNNING SEARCH MATCHING UNIT TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. "lehnga" -> Emerald Green Bridal Zari Lehenga Choli
  const res1 = matchProducts(mockCatalog, 'lehnga');
  assert(
    res1.results.length > 0 && res1.results[0].slug === 'emerald-green-bridal-lehenga',
    `"lehnga" matches lehenga (matched: ${res1.results[0]?.name || 'none'})`
  );

  // 2. "kurtha" -> Festive Chanderi Silk Kurta Tunic
  const res2 = matchProducts(mockCatalog, 'kurtha');
  assert(
    res2.results.length > 0 && res2.results[0].slug === 'festive-chanderi-silk-kurta',
    `"kurtha" matches kurta (matched: ${res2.results[0]?.name || 'none'})`
  );

  // 3. "anarkli" -> Gulmohar Blush Organza Anarkali Set
  const res3 = matchProducts(mockCatalog, 'anarkli');
  assert(
    res3.results.length > 0 && res3.results[0].slug === 'gulmohar-blush-organza-anarkali',
    `"anarkli" matches anarkali (matched: ${res3.results[0]?.name || 'none'})`
  );

  // 4. "froc" -> Aadhya Traditional Pattu Frock Dress
  const res4 = matchProducts(mockCatalog, 'froc');
  assert(
    res4.results.length > 0 && res4.results[0].slug === 'aadhya-kids-pattu-frock',
    `"froc" matches frock (matched: ${res4.results[0]?.name || 'none'})`
  );

  // 5. "bodycone" -> Western Velvet Bodycon Dress
  const res5 = matchProducts(mockCatalog, 'bodycone');
  assert(
    res5.results.length > 0 && res5.results[0].slug === 'western-velvet-bodycon-dress',
    `"bodycone" matches bodycon (matched: ${res5.results[0]?.name || 'none'})`
  );

  // 6. "skrit and top" -> Designer Crop Top and Skirt Set
  const res6 = matchProducts(mockCatalog, 'skrit and top');
  assert(
    res6.results.length > 0 && res6.results[0].slug === 'designer-skirt-and-top-set',
    `"skrit and top" matches skirt and top (matched: ${res6.results[0]?.name || 'none'})`
  );

  // 7. "co ord set" -> Floral Print Summer Co-ord Set
  const res7 = matchProducts(mockCatalog, 'co ord set');
  assert(
    res7.results.length > 0 && res7.results[0].slug === 'floral-summer-coord-set',
    `"co ord set" matches co-ord set (matched: ${res7.results[0]?.name || 'none'})`
  );

  // 8. "green lehenga" -> Emerald Green Bridal Zari Lehenga Choli
  const res8 = matchProducts(mockCatalog, 'green lehenga');
  assert(
    res8.results.length > 0 && res8.results[0].slug === 'emerald-green-bridal-lehenga',
    `"green lehenga" matches green color + lehenga (matched: ${res8.results[0]?.name || 'none'})`
  );

  // 9. "pattu langa" -> Pure Kanjeevaram Pattu Pavadai Langa or Pattu Frock
  const res9 = matchProducts(mockCatalog, 'pattu langa');
  assert(
    res9.results.length > 0 && (res9.results[0].slug === 'kids-pattu-pavadai-langa' || res9.results[0].slug === 'aadhya-kids-pattu-frock'),
    `"pattu langa" matches pattu pavadai (matched: ${res9.results[0]?.name || 'none'})`
  );

  // 10. Empty string -> returns empty without throwing
  const res10 = matchProducts(mockCatalog, '');
  assert(res10.results.length === 0, 'Empty query returns empty array');

  // 11. Gibberish -> returns empty without throwing
  const res11 = matchProducts(mockCatalog, 'xyzqwk999');
  assert(res11.results.length === 0, 'Gibberish returns empty array');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

